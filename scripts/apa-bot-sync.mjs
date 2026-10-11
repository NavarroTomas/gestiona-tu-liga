#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const args = new Set(process.argv.slice(2));
const inputPath = process.argv.find((value, index) => index > 1 && !value.startsWith("--"));
const season = process.argv.find((value, index) => index > 1 && value.startsWith("--season="))?.slice("--season=".length) || "Temporada 5";
const apply = args.has("--apply");

if (!inputPath) {
  console.error("Uso: node scripts/apa-bot-sync.mjs <export.json> [--season=\"Temporada 5\"] [--apply]");
  process.exit(1);
}

const payload = JSON.parse(await readFile(inputPath, "utf8"));
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (apply && (!url || !serviceKey)) {
  console.error("Para --apply se necesitan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno privado.");
  process.exit(1);
}

const supabase = apply ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null;
const report = { mode: apply ? "apply" : "dry-run", season, clubs: [], roster: [], releases: [], errors: [] };

function normalizeTag(value) {
  return String(value || "").replace(/[\[\]]/g, "").trim().toUpperCase();
}

function slugify(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function findClub(club) {
  if (!apply) return { id: `dry-${normalizeTag(club.team_tag)}`, nombre: club.team_name };
  const tag = normalizeTag(club.team_tag);
  const { data, error } = await supabase.from("clubes_info")
    .select("id,nombre,slug")
    .or(`slug.eq.${slugify(club.team_name)},nombre.ilike.${club.team_name}`)
    .limit(2);
  if (error) throw error;
  if (data?.length > 1) throw new Error(`Club ambiguo para ${club.team_name}; requiere revisión manual.`);
  return data?.[0] || { id: null, nombre: club.team_name, tag };
}

async function syncClub(club) {
  const existing = await findClub(club);
  const clubPayload = {
    nombre: club.team_name,
    slug: `${slugify(club.team_name)}-${slugify(season)}`,
    logo_url: club.logo_url || null,
    updated_at: new Date().toISOString(),
  };
  let clubId = existing.id;
  if (apply) {
    if (clubId && !String(clubId).startsWith("dry-")) {
      const { error } = await supabase.from("clubes_info").update(clubPayload).eq("id", clubId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("clubes_info").insert(clubPayload).select("id").single();
      if (error) throw error;
      clubId = data.id;
    }
    const { error } = await supabase.from("clubes_temporada").upsert({
      club_id: clubId,
      temporada: season,
      division: club.division || "sin-definir",
      activo: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "club_id,temporada" });
    if (error) throw error;
  }
  report.clubs.push({ action: existing.id ? "update" : "create", source: club.team_tag, target: clubPayload, club_id: clubId });
  return clubId;
}

const clubIds = new Map();
const clubDivisions = new Map((payload.clubs || []).map((club) => [normalizeTag(club.team_tag), club.division || "sin-definir"]));
for (const club of payload.clubs || []) {
  try { clubIds.set(normalizeTag(club.team_tag), await syncClub(club)); }
  catch (error) { report.errors.push({ entity: "club", source: club.team_tag, message: error.message }); }
}

for (const player of payload.players || []) {
  try {
    const tag = normalizeTag(player.team_tag);
    const clubId = clubIds.get(tag);
    const row = {
      jugador: player.player_name,
      playerid: player.player_id,
      equipo: player.team,
      temporada: season,
      division: player.division || "sin-definir",
      posicion: player.positions_json || "N/D",
      estado: "activo",
      club_id: clubId && !String(clubId).startsWith("dry-") ? clubId : null,
    };
    if (apply) {
      const { error } = await supabase.from("plantillas").upsert(row, { onConflict: "temporada,division,equipo,playerid" });
      if (error) throw error;
    }
    report.roster.push({ action: "upsert", source: `${player.team_tag}:${player.player_id}`, target: row });
  } catch (error) { report.errors.push({ entity: "player", source: player.player_id, message: error.message }); }
}

for (const transfer of payload.confirmed_transfers || []) {
  try {
    const isRelease = transfer.change_type === "release";
    const row = isRelease
      ? { playerid: transfer.player_id, temporada: season, estado: "baja" }
      : { playerid: transfer.player_id, temporada: season, estado: "transfer-confirmado" };
    const movement = {
      jugador: transfer.player_name || transfer.player_id,
      desde: transfer.from_team || null,
      hacia: transfer.to_team || null,
      temporada: season,
      division: clubDivisions.get(normalizeTag(transfer.to_tag)) || clubDivisions.get(normalizeTag(transfer.from_tag)) || "sin-definir",
      tipo: isRelease ? "Libre" : "Fichaje",
      fecha: transfer.created_at || null,
    };
    if (apply && isRelease) {
      const query = supabase.from("plantillas").update(row).eq("playerid", transfer.player_id).eq("temporada", season);
      const { error } = await query;
      if (error) throw error;
    }
    if (apply) {
      const { data: existing, error: existingError } = await supabase.from("transferencias")
        .select("id").eq("jugador", movement.jugador).eq("desde", movement.desde)
        .eq("hacia", movement.hacia).eq("temporada", movement.temporada)
        .eq("tipo", movement.tipo).eq("fecha", movement.fecha).limit(1);
      if (existingError) throw existingError;
      if (!existing?.length) {
        const { error } = await supabase.from("transferencias").insert(movement);
        if (error) throw error;
      }
    }
    (isRelease ? report.releases : report.roster).push({ action: isRelease ? "release" : "transfer", source: transfer, target: { ...movement, ...row } });
  } catch (error) { report.errors.push({ entity: "transfer", source: transfer.player_id, message: error.message }); }
}

console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 2;
