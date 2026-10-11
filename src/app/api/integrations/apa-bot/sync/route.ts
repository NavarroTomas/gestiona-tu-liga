import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

type Club = { source_key: string; team_tag: string; team_name: string; division: string; logo_url?: string | null };
type Player = { source_key: string; player_id: string; player_name: string; team_tag: string; team_name: string; division: string; media?: number | null; positions?: string | null };
type Transfer = { source_key: string; player_id: string; player_name: string; division?: string | null; from_team?: string | null; from_tag?: string | null; to_team?: string | null; to_tag?: string | null; created_at?: string | null; change_type: "transfer" | "release" };
type SyncPayload = { source: string; guild_id: string; season_id: number; season: string; clubs: Club[]; players: Player[]; transfers: Transfer[] };

function normalizeDivision(value: unknown) {
  const normalized = String(value ?? "").trim().toLowerCase().replace(/\s+divisi[oó]n$/, "");
  const byNumber: Record<string, string> = { "1": "primera", "2": "segunda", "3": "tercera", "4": "cuarta" };
  if (byNumber[normalized]) return byNumber[normalized];
  if (normalized.includes("primera")) return "primera";
  if (normalized.includes("segunda")) return "segunda";
  if (normalized.includes("tercera")) return "tercera";
  if (normalized.includes("cuarta")) return "cuarta";
  return normalized || "sin-definir";
}

function authorized(request: Request, rawBody: string) {
  const expected = process.env.APA_BOT_SYNC_TOKEN;
  const timestamp = request.headers.get("x-apa-timestamp");
  const received = request.headers.get("x-apa-signature");
  if (!expected || !timestamp || !received || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Date.now() - Number(timestamp) * 1000) > 5 * 60 * 1000) return false;
  const expectedSignature = createHmac("sha256", expected).update(`${timestamp}.${rawBody}`).digest("hex");
  const actualBuffer = Buffer.from(received, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (rawBody.length > 2_000_000 || !authorized(request, rawBody)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: SyncPayload;
  try { body = JSON.parse(rawBody) as SyncPayload; } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  if (!body?.guild_id || !body.season || !Number.isInteger(body.season_id) || !Array.isArray(body.clubs) || !Array.isArray(body.players) || !Array.isArray(body.transfers)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "server_not_configured" }, { status: 503 });
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const payloadHash = createHash("sha256").update(rawBody).digest("hex");
  const { data: previousRun, error: previousRunError } = await supabase.from("apa_bot_sync_runs").select("id,status").eq("payload_hash", payloadHash).maybeSingle();
  if (previousRunError) return NextResponse.json({ error: "audit_unavailable" }, { status: 503 });
  if (previousRun) return NextResponse.json({ ok: true, duplicate: true, run_id: previousRun.id, status: previousRun.status });
  const summary = { clubs: 0, players: 0, transfers: 0, releases: 0, stale_deactivated: 0 };

  for (const club of body.clubs) {
    const slug = club.team_tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || club.team_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { data: bySlug, error: slugError } = await supabase.from("clubes_info").select("id").eq("slug", slug).maybeSingle();
    if (slugError) throw slugError;
    const { data: byName, error: nameError } = bySlug ? { data: null, error: null } : await supabase.from("clubes_info").select("id").ilike("nombre", club.team_name).limit(2);
    if (nameError) throw nameError;
    if (!bySlug && byName && byName.length > 1) return NextResponse.json({ error: "ambiguous_club", club: club.team_name }, { status: 409 });
    const existing = bySlug || byName?.[0] || null;
    const clubPayload = { nombre: club.team_name, slug, logo_url: club.logo_url || null, updated_at: new Date().toISOString() };
    let clubId = existing?.id;
    if (clubId) {
      const { error } = await supabase.from("clubes_info").update(clubPayload).eq("id", clubId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("clubes_info").insert(clubPayload).select("id").single();
      if (error) throw error;
      clubId = data.id;
    }
    const { error } = await supabase.from("clubes_temporada").upsert({ club_id: clubId, temporada: body.season, division: normalizeDivision(club.division), activo: true, updated_at: new Date().toISOString() }, { onConflict: "club_id,temporada" });
    if (error) throw error;
    summary.clubs += 1;
  }

  for (const player of body.players) {
    const { error } = await supabase.from("plantillas").upsert({ jugador: player.player_name, playerid: player.player_id, equipo: player.team_name, temporada: body.season, division: normalizeDivision(player.division), posicion: player.positions || "N/D", estado: "activo" }, { onConflict: "temporada,division,equipo,playerid" });
    if (error) throw error;
    summary.players += 1;
  }

  const incomingPlayerIds = new Set(body.players.map((player) => player.player_id.trim().toLowerCase()));
  const syncedTeamNames = new Set(body.clubs.map((club) => club.team_name.trim().toLowerCase()));
  const { data: activeRows, error: activeRowsError } = await supabase.from("plantillas").select("id,playerid,equipo").eq("temporada", body.season).neq("estado", "baja");
  if (activeRowsError) throw activeRowsError;
  for (const row of activeRows || []) {
    if (syncedTeamNames.has(String(row.equipo || "").trim().toLowerCase()) && !incomingPlayerIds.has(String(row.playerid || "").trim().toLowerCase())) {
      const { error } = await supabase.from("plantillas").update({ estado: "baja" }).eq("id", row.id);
      if (error) throw error;
      summary.stale_deactivated += 1;
    }
  }

  for (const transfer of body.transfers) {
    const movement = { jugador: transfer.player_name || transfer.player_id, desde: transfer.from_team || null, hacia: transfer.to_team || null, temporada: body.season, division: normalizeDivision(transfer.division), tipo: transfer.change_type === "release" ? "Libre" : "Fichaje", fecha: transfer.created_at || null };
    const { data: existing } = await supabase.from("transferencias").select("id").match(movement).limit(1);
    if (!existing?.length) {
      const { error } = await supabase.from("transferencias").insert(movement);
      if (error) throw error;
    }
    if (transfer.change_type === "release") {
      const { error } = await supabase.from("plantillas").update({ estado: "baja" }).eq("playerid", transfer.player_id).eq("temporada", body.season);
      if (error) throw error;
      summary.releases += 1;
    } else summary.transfers += 1;
  }
  const { data: run, error: auditError } = await supabase.from("apa_bot_sync_runs").insert({ guild_id: body.guild_id, season_id: body.season_id, season: body.season, payload_hash: payloadHash, clubs_count: summary.clubs, players_count: summary.players, transfers_count: summary.transfers, releases_count: summary.releases, status: "applied" }).select("id").single();
  if (auditError) return NextResponse.json({ error: "audit_write_failed" }, { status: 503 });
  return NextResponse.json({ ok: true, summary, run_id: run.id });
}
