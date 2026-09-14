import { supabase } from "@/lib/supabase";
import type {
  AdminMatch,
  CommitMatchInput,
  MatchRevision,
  PlayerMatchStats,
  TeamMatchStats,
} from "./types";

export type MatchFilters = {
  temporada?: string;
  competicion?: string;
  division?: string;
  grupo?: string;
  fase?: string;
  fecha?: string;
};

export async function fetchAdminMatches(filters: MatchFilters = {}) {
  let query = supabase
    .from("partidos")
    .select(
      "id,partido_id,local,visitante,resultado,fecha,temporada,division,competicion,grupo,fase,ronda,dia,hora,estado,scheduled_at",
    )
    .order("fecha", { ascending: true })
    .order("local", { ascending: true });

  if (filters.temporada) query = query.eq("temporada", filters.temporada);
  if (filters.competicion) query = query.eq("competicion", filters.competicion);
  if (filters.division) query = query.eq("division", filters.division);
  if (filters.grupo) query = query.eq("grupo", filters.grupo);
  if (filters.fase) query = query.eq("fase", filters.fase);
  if (filters.fecha) query = query.eq("fecha", filters.fecha);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as AdminMatch[];
}

export async function fetchMatchById(id: string | number) {
  const { data, error } = await supabase
    .from("partidos")
    .select(
      "id,partido_id,local,visitante,resultado,fecha,temporada,division,competicion,grupo,fase,ronda,dia,hora,estado,scheduled_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data || null) as AdminMatch | null;
}

export async function fetchMatchStats(matchId?: string | null) {
  if (!matchId) return { teams: [] as TeamMatchStats[], players: [] as PlayerMatchStats[] };

  const [teamsResult, playersResult] = await Promise.all([
    supabase.from("estadisticas_equipos").select("*").eq("partido_id", matchId).order("equipo", { ascending: true }),
    supabase.from("estadisticas_jugadores").select("*").eq("partido_id", matchId).order("equipo", { ascending: true }).order("score", { ascending: false }),
  ]);

  if (teamsResult.error) throw teamsResult.error;
  if (playersResult.error) throw playersResult.error;

  return {
    teams: (teamsResult.data || []) as TeamMatchStats[],
    players: (playersResult.data || []) as PlayerMatchStats[],
  };
}

export async function fetchMatchRevisions(partidoRowId: string | number) {
  const { data, error } = await supabase
    .from("match_revisions")
    .select(
      "id,partido_row_id,partido_id,revision_number,source,reason,snapshot_before,snapshot_after,created_by,created_at",
    )
    .eq("partido_row_id", Number(partidoRowId))
    .order("revision_number", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []) as MatchRevision[];
}

export async function fetchTxtSegments(matchId?: string | null) {
  if (!matchId) return [];
  const { data, error } = await supabase
    .from("partido_txt_segmentos")
    .select(
      "id,partido_id,partido_row_id,archivo_nombre,archivo_hash,orden_txt,duracion_minutos,goles_local,goles_visitante,payload,created_at",
    )
    .eq("partido_id", matchId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchMatchRoster({ temporada, teams }: { temporada: string; teams: string[] }) {
  if (teams.filter(Boolean).length === 0) return [];
  const { data, error } = await supabase
    .from("plantillas")
    .select("id,jugador,playerid,equipo,posicion,estado,steam_id,profile_id")
    .eq("temporada", temporada)
    .in("equipo", teams.filter(Boolean))
    .order("equipo", { ascending: true })
    .order("jugador", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchPlayerAliases(playerIds: string[]) {
  const ids = Array.from(new Set(playerIds.filter(Boolean)));
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("player_account_aliases")
    .select("alias_player_id,canonical_player_id,canonical_name")
    .in("alias_player_id", ids);
  if (error) throw error;
  return data || [];
}

function enrichTeamStats(input: CommitMatchInput) {
  return input.teamStats.map((row) => ({
    ...row,
    partido_id: input.matchId,
    temporada: input.temporada,
    division: input.division,
    fecha: input.fecha,
  }));
}

function enrichPlayerStats(input: CommitMatchInput) {
  return input.playerStats.map((row) => ({
    ...row,
    partido_id: input.matchId,
    temporada: input.temporada,
    division: input.division,
    fecha: input.fecha,
  }));
}

function enrichSegments(input: CommitMatchInput) {
  if (input.segments === undefined || input.segments === null) return null;
  return input.segments.map((segment) => ({
    ...segment,
    partido_id: input.matchId,
    partido_row_id: String(input.match.id),
  }));
}

export async function commitAdminMatch(input: CommitMatchInput) {
  const segments = enrichSegments(input);
  const { data, error } = await supabase.rpc("commit_match_data_v2", {
    p_match_row_id: Number(input.match.id),
    p_source: input.source,
    p_reason:
      input.reason ||
      (input.source === "txt"
        ? "Carga MatchStats desde el panel"
        : input.source === "manual"
          ? "Carga manual desde el panel"
          : "Corrección desde el Centro de partidos"),
    p_match_patch: {
      local: input.match.local,
      visitante: input.match.visitante,
      resultado: input.resultado,
      fecha: input.fecha,
      temporada: input.temporada,
      division: input.division,
      partido_id: input.matchId,
      competicion: input.competicion,
      grupo: input.grupo ?? null,
      fase: input.fase ?? null,
      ronda: input.match.ronda ?? null,
      estado: input.resultado ? "cargado" : "programado",
    },
    p_team_stats: enrichTeamStats(input),
    p_player_stats: enrichPlayerStats(input),
    p_segments: segments,
    p_clear_segments: segments !== null,
    p_aliases: input.aliases || [],
  });
  if (error) throw error;
  return data;
}

export async function voidAdminMatch(partidoRowId: string | number, reason?: string) {
  const { data, error } = await supabase.rpc("void_match_data", {
    p_match_row_id: Number(partidoRowId),
    p_reason: reason || "Carga anulada desde el Centro de partidos",
  });
  if (error) throw error;
  return data;
}

export async function updateAdminMatchSchedule({
  partidoRowId,
  fecha,
  dia,
  hora,
}: {
  partidoRowId: string | number;
  fecha: string;
  dia?: string | null;
  hora?: string | null;
}) {
  const { data, error } = await supabase.rpc("update_match_schedule", {
    p_match_row_id: Number(partidoRowId),
    p_fecha: fecha,
    p_dia: dia ?? null,
    p_hora: hora ?? null,
    p_reason: "Programación actualizada desde el Centro de partidos",
  });
  if (error) throw error;
  return data;
}

export async function restoreMatchRevision(revisionId: string, reason: string) {
  const { data, error } = await supabase.rpc("restore_match_revision", {
    p_revision_id: revisionId,
    p_reason: reason,
  });
  if (error) throw error;
  return data;
}
