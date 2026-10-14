import { supabase } from "@/lib/supabase";
import { stableMatchId } from "@/lib/competitionData";

export type MatchSource = "txt" | "manual" | "correction" | "annulment";

export type AdminMatch = {
  id: string | number;
  partido_id?: string | null;
  local: string;
  visitante?: string | null;
  resultado?: string | null;
  fecha?: string | number | null;
  temporada?: string | null;
  division?: string | null;
  dia?: string | null;
  hora?: string | null;
  competicion?: string | null;
  grupo?: string | null;
  fase?: string | null;
  ronda?: string | null;
  estado?: string | null;
};

export type MatchPlayerStat = {
  partido_id: string;
  nombre: string;
  playerId: string;
  posicion?: string | null;
  equipo: string;
  temporada: string;
  division: string;
  fecha: string;
  passes?: number;
  keyPasses?: number;
  assists?: number;
  shots?: number;
  shotsOnTarget?: number;
  goals?: number;
  tackles?: number;
  keyTackles?: number;
  interceptions?: number;
  keyInterceptions?: number;
  possessionsLost?: number;
  gKSaves?: number;
  gKCatches?: number;
  overallRating?: number;
  score?: number;
  mvp?: number;
  rating_apa?: number;
};

export type MatchTeamStat = {
  partido_id: string;
  equipo: string;
  temporada: string;
  division: string;
  fecha: string;
  passes?: number;
  keyPasses?: number;
  assists?: number;
  shots?: number;
  shotsOnTarget?: number;
  goals?: number;
  tackles?: number;
  keyTackles?: number;
  interceptions?: number;
  keyInterceptions?: number;
  possession?: number;
  possessionsLost?: number;
  fouls?: number;
  offsides?: number;
  handballs?: number;
  setPieceTimeouts?: number;
  freeKicks?: number;
  penalties?: number;
  goalKicks?: number;
  cornerKicks?: number;
  throwIns?: number;
  yellowCards?: number;
  redCards?: number;
};

export type MatchTxtSegment = {
  partido_id: string;
  partido_row_id: string;
  archivo_nombre: string;
  archivo_hash: string;
  orden_txt: "normal" | "invertido";
  duracion_minutos?: number | null;
  goles_local: number;
  goles_visitante: number;
  payload: unknown;
};

export type MatchRevision = {
  id: string;
  partido_row_id: number;
  partido_id: string | null;
  revision_number: number;
  source: MatchSource;
  reason: string | null;
  created_by: string | null;
  created_at: string;
};

export type RosterPlayer = {
  jugador: string;
  playerid: string | null;
  equipo: string | null;
  posicion: string | null;
  estado?: string | null;
};

export const ADMIN_MATCH_COMPETITIONS = [
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa de la Liga" },
  { value: "copa_campeones", label: "Copa de Campeones" },
  { value: "playoffs", label: "Playoffs de Ascenso" },
] as const;

export function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function textValue(value: unknown) {
  return String(value ?? "").trim();
}

export function matchCompetitionLabel(value?: string | null) {
  return (
    ADMIN_MATCH_COMPETITIONS.find((item) => item.value === value)?.label ||
    textValue(value) ||
    "Competición"
  );
}

export function matchContextLabel(match: AdminMatch) {
  const parts = [matchCompetitionLabel(match.competicion)];
  if (match.competicion === "liga" && match.division) parts.push(match.division);
  if (match.grupo) parts.push(`Grupo ${match.grupo}`);
  if (match.fase) parts.push(match.fase.replaceAll("_", " "));
  if (match.ronda) parts.push(match.ronda);
  return parts.join(" · ");
}

export function stableAdminMatchId(match: AdminMatch) {
  return stableMatchId(match.temporada || "sin-temporada", match.id);
}

export function calculateApaRating(player: Partial<MatchPlayerStat>) {
  const goalkeeper =
    numberValue(player.gKSaves) > 0 ||
    numberValue(player.gKCatches) > 0 ||
    textValue(player.posicion).toUpperCase().includes("GK");

  let rating = 6;
  if (goalkeeper) {
    rating += numberValue(player.gKSaves) * 0.35;
    rating += numberValue(player.gKCatches) * 0.2;
  } else {
    rating += numberValue(player.goals) * 1.2;
    rating += numberValue(player.assists) * 0.9;
    rating += numberValue(player.keyPasses) * 0.18;
    rating += numberValue(player.shotsOnTarget) * 0.12;
    rating += numberValue(player.tackles) * 0.1;
    rating += numberValue(player.interceptions) * 0.1;
  }
  rating -= numberValue(player.possessionsLost) * 0.05;
  return Math.round(Math.max(1, Math.min(10, rating)) * 100) / 100;
}

const SUM_FIELDS: (keyof MatchTeamStat)[] = [
  "passes",
  "keyPasses",
  "assists",
  "shots",
  "shotsOnTarget",
  "tackles",
  "keyTackles",
  "interceptions",
  "keyInterceptions",
  "possessionsLost",
];

export function buildTeamStatsFromPlayers({
  players,
  team,
  goals,
  partidoId,
  temporada,
  division,
  fecha,
}: {
  players: MatchPlayerStat[];
  team: string;
  goals: number;
  partidoId: string;
  temporada: string;
  division: string;
  fecha: string;
}): MatchTeamStat {
  const rows = players.filter((player) => player.equipo === team);
  const result: MatchTeamStat = {
    partido_id: partidoId,
    equipo: team,
    temporada,
    division,
    fecha,
    goals,
    possession: 0,
    fouls: 0,
    offsides: 0,
    handballs: 0,
    setPieceTimeouts: 0,
    freeKicks: 0,
    penalties: 0,
    goalKicks: 0,
    cornerKicks: 0,
    throwIns: 0,
    yellowCards: 0,
    redCards: 0,
  };

  for (const field of SUM_FIELDS) {
    (result as Record<string, unknown>)[field] = rows.reduce(
      (sum, row) => sum + numberValue(row[field as keyof MatchPlayerStat]),
      0,
    );
  }
  return result;
}

export function validateMatchStats({
  match,
  teamStats,
  playerStats,
}: {
  match: AdminMatch;
  teamStats: MatchTeamStat[];
  playerStats: MatchPlayerStat[];
}) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!match.local || !match.visitante) errors.push("El partido necesita local y visitante.");
  if (match.local === match.visitante) errors.push("Local y visitante no pueden ser el mismo club.");

  const playerIds = new Map<string, string>();
  let mvpCount = 0;
  for (const player of playerStats) {
    if (!player.nombre) errors.push("Hay un jugador sin nombre.");
    if (!player.equipo) errors.push(`El jugador ${player.nombre || "sin nombre"} no tiene equipo.`);
    if (player.equipo !== match.local && player.equipo !== match.visitante) {
      errors.push(`${player.nombre} está asociado a un equipo que no participa del partido.`);
    }
    if (player.playerId) {
      const previousTeam = playerIds.get(player.playerId);
      if (previousTeam && previousTeam !== player.equipo) {
        errors.push(`El PlayerID ${player.playerId} aparece en ambos equipos.`);
      }
      playerIds.set(player.playerId, player.equipo);
    }
    if (numberValue(player.mvp) > 0) mvpCount += 1;
  }
  if (mvpCount > 1) errors.push("Solo puede existir un MVP por partido.");

  for (const team of [match.local, match.visitante].filter(Boolean) as string[]) {
    const teamRow = teamStats.find((row) => row.equipo === team);
    if (!teamRow) errors.push(`Faltan estadísticas de equipo para ${team}.`);
    const playerGoals = playerStats
      .filter((row) => row.equipo === team)
      .reduce((sum, row) => sum + numberValue(row.goals), 0);
    if (teamRow && playerGoals > numberValue(teamRow.goals)) {
      errors.push(`Los goles asignados a jugadores de ${team} superan el marcador del equipo.`);
    }
    if (teamRow && playerGoals < numberValue(teamRow.goals)) {
      warnings.push(`${team} tiene ${numberValue(teamRow.goals) - playerGoals} gol(es) sin jugador asignado.`);
    }
  }

  return { errors, warnings };
}

export async function fetchAdminMatches({
  temporada,
  competicion,
}: {
  temporada: string;
  competicion?: string;
}) {
  if (!temporada) throw new Error("Seleccioná un torneo antes de cargar partidos.");
  let query = supabase
    .from("partidos")
    .select(
      "id,partido_id,local,visitante,resultado,fecha,temporada,division,dia,hora,competicion,grupo,fase,ronda,estado",
    )
    .eq("temporada", temporada)
    .order("fecha", { ascending: true })
    .order("local", { ascending: true });

  if (competicion && competicion !== "todas") query = query.eq("competicion", competicion);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as AdminMatch[];
}

export async function fetchMatchRoster(match: AdminMatch) {
  const teams = [match.local, match.visitante].filter(Boolean) as string[];
  if (teams.length === 0) return [] as RosterPlayer[];
  const { data, error } = await supabase
    .from("plantillas")
    .select("jugador,playerid,equipo,posicion,estado")
    .eq("temporada", (() => {
      const season = textValue(match.temporada);
      if (!season) throw new Error("El partido no tiene torneo asociada.");
      return season;
    })())
    .in("equipo", teams)
    .order("equipo")
    .order("jugador");
  if (error) throw error;
  return ((data || []) as RosterPlayer[]).filter(
    (row) => textValue(row.estado || "activo").toLowerCase() !== "inactivo",
  );
}

export async function fetchMatchBundle(matchRowId: string | number) {
  const { data: match, error: matchError } = await supabase
    .from("partidos")
    .select("id,partido_id,local,visitante,resultado,fecha,temporada,division,dia,hora,competicion,grupo,fase,ronda,estado")
    .eq("id", matchRowId)
    .single();
  if (matchError) throw matchError;
  const typedMatch = match as AdminMatch;
  const ids = Array.from(new Set([textValue(typedMatch.partido_id), stableAdminMatchId(typedMatch)].filter(Boolean)));

  const [teams, players, segments, revisions] = await Promise.all([
    supabase.from("estadisticas_equipos").select("*").in("partido_id", ids),
    supabase.from("estadisticas_jugadores").select("*").in("partido_id", ids).order("equipo").order("nombre"),
    supabase.from("partido_txt_segmentos").select("*").in("partido_id", ids).order("created_at"),
    supabase.from("match_revisions").select("id,partido_row_id,partido_id,revision_number,source,reason,created_by,created_at").eq("partido_row_id", matchRowId).order("revision_number", { ascending: false }),
  ]);

  for (const result of [teams, players, segments, revisions]) {
    if (result.error) throw result.error;
  }

  return {
    match: typedMatch,
    teamStats: (teams.data || []) as MatchTeamStat[],
    playerStats: (players.data || []) as MatchPlayerStat[],
    segments: (segments.data || []) as any[],
    revisions: (revisions.data || []) as MatchRevision[],
  };
}

export async function commitMatchData({
  matchRowId,
  source,
  reason,
  matchPatch,
  teamStats,
  playerStats,
  segments = null,
  clearSegments = false,
}: {
  matchRowId: string | number;
  source: MatchSource;
  reason: string;
  matchPatch: Record<string, unknown>;
  teamStats: MatchTeamStat[];
  playerStats: MatchPlayerStat[];
  segments?: MatchTxtSegment[] | null;
  clearSegments?: boolean;
}) {
  const { data, error } = await supabase.rpc("commit_match_data", {
    p_match_row_id: Number(matchRowId),
    p_source: source,
    p_reason: reason,
    p_match_patch: matchPatch,
    p_team_stats: teamStats,
    p_player_stats: playerStats,
    p_segments: segments,
    p_clear_segments: clearSegments,
  });
  if (error) throw error;
  return data as { ok: boolean; partido_row_id: number; partido_id: string | null; revision: number };
}
