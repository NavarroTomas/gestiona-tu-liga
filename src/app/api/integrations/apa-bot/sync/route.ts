import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

type Club = { source_key: string; team_tag: string; team_name: string; division: string; logo_url?: string | null };
type Player = { source_key: string; player_id: string; player_name: string; team_tag: string; team_name: string; division: string; media?: number | null; positions?: string | null };
type Transfer = { source_key: string; player_id: string; player_name: string; division?: string | null; from_team?: string | null; from_tag?: string | null; to_team?: string | null; to_tag?: string | null; created_at?: string | null; change_type: "transfer" | "release" };
type SyncPayload = { source: string; guild_id: string; season_id: number; season: string; clubs: Club[]; players: Player[]; transfers: Transfer[] };

function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

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

function seasonSlugMatches(slug: unknown, season: string) {
  const value = String(slug || "").toLowerCase();
  const number = season.match(/\d+/)?.[0];
  if (!number) return false;
  return new RegExp(`(?:^|-)t${number}$`).test(value) || new RegExp(`(?:^|-)temporada-${number}$`).test(value);
}

function resolveWebSeason(body: SyncPayload) {
  const mappingText = process.env.APA_BOT_SEASON_MAP;
  if (!mappingText) return body.season;
  try {
    const mapping = JSON.parse(mappingText) as Record<string, string>;
    return mapping[String(body.season_id)] || mapping[body.season] || body.season;
  } catch {
    return body.season;
  }
}

function configuredClubId(teamTag: string) {
  const mappingText = process.env.APA_BOT_CLUB_MAP;
  if (!mappingText) return null;
  try {
    const mapping = JSON.parse(mappingText) as Record<string, number | string>;
    const value = mapping[teamTag.trim().toLowerCase()];
    return value === undefined ? null : Number(value);
  } catch {
    return null;
  }
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
  const webSeason = resolveWebSeason(body);
  const payloadHash = createHash("sha256").update(rawBody).digest("hex");
  const { data: previousRun, error: previousRunError } = await supabase.from("apa_bot_sync_runs").select("id,status").eq("payload_hash", payloadHash).maybeSingle();
  if (previousRunError) return NextResponse.json({ error: "audit_unavailable" }, { status: 503 });
  if (previousRun) return NextResponse.json({ ok: true, duplicate: true, run_id: previousRun.id, status: previousRun.status });
  const summary = { clubs: 0, players: 0, transfers: 0, releases: 0, stale_deactivated: 0 };

  for (const club of body.clubs) {
    const slug = club.team_tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || club.team_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const configuredId = configuredClubId(club.team_tag);
    const { data: byConfiguredId, error: configuredError } = configuredId
      ? await supabase.from("clubes_info").select("id").eq("id", configuredId).maybeSingle()
      : { data: null, error: null };
    if (configuredError) throw configuredError;
    const { data: bySlug, error: slugError } = byConfiguredId
      ? { data: null, error: null }
      : await supabase.from("clubes_info").select("id").eq("slug", slug).maybeSingle();
    if (slugError) throw slugError;
    const { data: byName, error: nameError } = bySlug ? { data: null, error: null } : await supabase.from("clubes_info").select("id,slug").ilike("nombre", club.team_name).limit(10);
    if (nameError) throw nameError;
    let existing = byConfiguredId || bySlug || null;
    if (!existing && byName?.length) {
      const candidateIds = byName.map((row) => row.id);
      const { data: seasonLinks, error: seasonLinksError } = await supabase
        .from("clubes_temporada")
        .select("club_id")
        .eq("temporada", webSeason)
        .in("club_id", candidateIds);
      if (seasonLinksError) throw seasonLinksError;
      const seasonIds = [...new Set((seasonLinks || []).map((row) => row.club_id))];
      if (seasonIds.length === 1) existing = { id: seasonIds[0] };
      else if (seasonIds.length > 1) return NextResponse.json({ error: "ambiguous_club", club: club.team_name, season: webSeason, candidate_ids: seasonIds }, { status: 409 });
      else {
        const seasonalSlugCandidates = byName.filter((row) => seasonSlugMatches(row.slug, webSeason));
        if (seasonalSlugCandidates.length === 1) existing = seasonalSlugCandidates[0];
        else if (byName.length === 1) existing = byName[0];
        else return NextResponse.json({ error: "ambiguous_club", club: club.team_name, season: webSeason, candidate_ids: candidateIds }, { status: 409 });
      }
    }
    const clubPayload = { nombre: club.team_name, slug: existing ? undefined : slug, logo_url: club.logo_url || null, updated_at: new Date().toISOString() };
    if (existing) delete (clubPayload as { slug?: string }).slug;
    let clubId = existing?.id;
    if (clubId) {
      const { error } = await supabase.from("clubes_info").update(clubPayload).eq("id", clubId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("clubes_info").insert(clubPayload).select("id").single();
      if (error) throw error;
      clubId = data.id;
    }
    const { error } = await supabase.from("clubes_temporada").upsert({ club_id: clubId, temporada: webSeason, division: normalizeDivision(club.division), activo: true, updated_at: new Date().toISOString() }, { onConflict: "club_id,temporada" });
    if (error) throw error;
    summary.clubs += 1;
  }

  const normalizeTag = (tag: string) => tag.trim().replace(/^\[|\]$/g, "").toLowerCase();
  const clubsByTag = new Map(body.clubs.map((club) => [normalizeTag(club.team_tag), club]));
  const playerRows = body.players.map((player) => {
    const club = clubsByTag.get(normalizeTag(player.team_tag || ""));
    return { jugador: player.player_name, playerid: player.player_id, equipo: club?.team_name || player.team_name, temporada: webSeason, division: normalizeDivision(club?.division || player.division), posicion: player.positions || "N/D", estado: "activo" };
  });
  for (const batch of chunks(playerRows, 500)) {
    const { error } = await supabase.from("plantillas").upsert(batch, { onConflict: "temporada,division,equipo,playerid" });
    if (error) throw error;
    summary.players += batch.length;
  }

  const incomingPlayerIds = new Set(body.players.map((player) => player.player_id.trim().toLowerCase()));
  const syncedTeamNames = new Set(body.clubs.map((club) => club.team_name.trim().toLowerCase()));
  const { data: activeRows, error: activeRowsError } = await supabase.from("plantillas").select("id,playerid,equipo").eq("temporada", webSeason).neq("estado", "baja");
  if (activeRowsError) throw activeRowsError;
  for (const row of activeRows || []) {
    if (syncedTeamNames.has(String(row.equipo || "").trim().toLowerCase()) && !incomingPlayerIds.has(String(row.playerid || "").trim().toLowerCase())) {
      const { error } = await supabase.from("plantillas").update({ estado: "baja" }).eq("id", row.id);
      if (error) throw error;
      summary.stale_deactivated += 1;
    }
  }

  const movements = body.transfers.map((transfer) => ({ transfer, movement: { jugador: transfer.player_name || transfer.player_id, desde: transfer.from_team || null, hacia: transfer.to_team || null, temporada: webSeason, division: normalizeDivision(transfer.division), tipo: transfer.change_type === "release" ? "Libre" : "Fichaje", fecha: transfer.created_at || null } }));
  for (const batch of chunks(movements, 20)) {
    await Promise.all(batch.map(async ({ transfer, movement }) => {
      const { data: existing, error: existingError } = await supabase.from("transferencias").select("id").match(movement).limit(1);
      if (existingError) throw existingError;
      if (!existing?.length) {
        const { error } = await supabase.from("transferencias").insert(movement);
        if (error) throw error;
      }
    }));
    const releaseIds = batch.filter(({ transfer }) => transfer.change_type === "release").map(({ transfer }) => transfer.player_id);
    if (releaseIds.length) {
      const { error } = await supabase.from("plantillas").update({ estado: "baja" }).in("playerid", releaseIds).eq("temporada", webSeason);
      if (error) throw error;
    }
    summary.releases += releaseIds.length;
    summary.transfers += batch.length - releaseIds.length;
  }
  const { data: run, error: auditError } = await supabase.from("apa_bot_sync_runs").insert({ guild_id: body.guild_id, season_id: body.season_id, season: webSeason, payload_hash: payloadHash, clubs_count: summary.clubs, players_count: summary.players, transfers_count: summary.transfers, releases_count: summary.releases, status: "applied" }).select("id").single();
  if (auditError) return NextResponse.json({ error: "audit_write_failed" }, { status: 503 });
  return NextResponse.json({ ok: true, summary, run_id: run.id });
}
