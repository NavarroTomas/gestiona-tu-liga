import type {
  AdminMatch,
  PlayerMatchStats,
  TeamMatchStats,
} from "./types";

export const MATCH_COMPETITIONS = [
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa APA" },
  { value: "copa_campeones", label: "Copa de Campeones" },
  { value: "playoffs", label: "Playoffs de Ascenso" },
] as const;

export const MATCH_DIVISIONS = ["Primera", "Segunda"] as const;
export const MATCH_GROUPS = ["A", "B", "C", "D"] as const;
export const CUP_PHASES = ["Octavos", "Cuartos", "Semifinal", "3er Puesto", "Final"] as const;
export const CHAMPIONS_PHASES = ["Semifinal", "Final"] as const;
export const PLAYOFF_PHASES = ["Semifinal", "Final Ascenso", "Promoción"] as const;

export function cleanMatchText(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeMatchText(value: unknown) {
  return cleanMatchText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function matchNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function stableMatchId(match: Pick<AdminMatch, "id" | "temporada">) {
  const season = normalizeMatchText(match.temporada)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `apa-${season}-partido-${String(match.id)}`;
}

export function competitionLabel(value?: string | null) {
  return (
    MATCH_COMPETITIONS.find((item) => item.value === value)?.label ||
    cleanMatchText(value) ||
    "Competición"
  );
}

export function normalizePhase(value: string) {
  const phase = normalizeMatchText(value);
  if (phase === "semifinal" || phase === "semis") return "semifinal";
  if (["3er puesto", "tercer puesto", "3º puesto", "3er_puesto"].includes(phase)) return "3er_puesto";
  if (phase === "final ascenso" || phase === "final_ascenso") return "final_ascenso";
  if (phase === "promocion") return "promocion";
  return phase.replace(/\s+/g, "_");
}

export function matchContextLabel(match: AdminMatch) {
  const parts = [competitionLabel(match.competicion)];
  if ((match.competicion || "liga") === "liga" && match.division) parts.push(match.division);
  if (match.grupo) parts.push(`Grupo ${match.grupo}`);
  if (match.fase) parts.push(match.fase.replaceAll("_", " "));
  if (match.ronda) parts.push(match.ronda);
  if (match.fecha) parts.push(`Fecha ${match.fecha}`);
  return parts.join(" · ");
}

export function parseScore(resultado?: string | null) {
  const value = cleanMatchText(resultado);
  const match = value.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!match) return null;
  return { local: Number(match[1]), visitante: Number(match[2]) };
}

export function calculateRatingAPA(player: PlayerMatchStats) {
  const isGoalkeeper =
    matchNumber(player.gKSaves) > 0 ||
    matchNumber(player.gKCatches) > 0 ||
    cleanMatchText(player.posicion).toUpperCase().includes("GK");

  let rating = 6;
  if (isGoalkeeper) {
    rating += matchNumber(player.gKSaves) * 0.35;
    rating += matchNumber(player.gKCatches) * 0.2;
  } else {
    rating += matchNumber(player.goals) * 1.2;
    rating += matchNumber(player.assists) * 0.9;
    rating += matchNumber(player.keyPasses) * 0.18;
    rating += matchNumber(player.shotsOnTarget) * 0.12;
    rating += matchNumber(player.tackles) * 0.1;
    rating += matchNumber(player.interceptions) * 0.1;
  }
  rating -= matchNumber(player.possessionsLost) * 0.05;
  return Math.round(Math.max(1, Math.min(10, rating)) * 100) / 100;
}

export function emptyTeamStats(equipo: string): TeamMatchStats {
  return {
    equipo,
    passes: 0,
    keyPasses: 0,
    assists: 0,
    shots: 0,
    shotsOnTarget: 0,
    goals: 0,
    tackles: 0,
    keyTackles: 0,
    interceptions: 0,
    keyInterceptions: 0,
    possession: 0,
    possessionsLost: 0,
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
}

export function teamStatsFromPlayers(
  players: PlayerMatchStats[],
  equipo: string,
  goals: number,
  base?: TeamMatchStats,
): TeamMatchStats {
  const rows = players.filter(
    (player) => normalizeMatchText(player.equipo) === normalizeMatchText(equipo),
  );
  const sum = (key: keyof PlayerMatchStats) =>
    rows.reduce((total, player) => total + matchNumber(player[key]), 0);

  return {
    ...emptyTeamStats(equipo),
    ...base,
    equipo,
    goals,
    passes: sum("passes"),
    keyPasses: sum("keyPasses"),
    assists: sum("assists"),
    shots: sum("shots"),
    shotsOnTarget: sum("shotsOnTarget"),
    tackles: sum("tackles"),
    keyTackles: sum("keyTackles"),
    interceptions: sum("interceptions"),
    keyInterceptions: sum("keyInterceptions"),
    possessionsLost: sum("possessionsLost"),
  };
}

export type MatchValidationIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
};

export function validateMatchDraft({
  match,
  resultado,
  players,
  teams,
}: {
  match: AdminMatch;
  resultado: string;
  players: PlayerMatchStats[];
  teams: TeamMatchStats[];
}) {
  const issues: MatchValidationIssue[] = [];
  const score = parseScore(resultado);
  if (!score) {
    issues.push({ level: "error", code: "invalid_score", message: "El resultado debe tener formato 0-0." });
    return issues;
  }

  if (!cleanMatchText(match.local) || !cleanMatchText(match.visitante)) {
    issues.push({ level: "error", code: "missing_teams", message: "El partido no tiene local y visitante definidos." });
  }

  if (normalizeMatchText(match.local) === normalizeMatchText(match.visitante)) {
    issues.push({ level: "error", code: "same_team", message: "Local y visitante no pueden ser el mismo club." });
  }

  const idsByTeam = new Map<string, Set<string>>();
  for (const player of players) {
    const id = cleanMatchText(player.playerId);
    if (!id) continue;
    const team = normalizeMatchText(player.equipo);
    if (!idsByTeam.has(id)) idsByTeam.set(id, new Set());
    idsByTeam.get(id)!.add(team);
  }
  for (const [id, teamSet] of idsByTeam.entries()) {
    if (teamSet.size > 1) {
      issues.push({ level: "error", code: "player_both_teams", message: `El PlayerID ${id} aparece en ambos equipos.` });
    }
  }

  const mvpCount = players.reduce((total, player) => total + (matchNumber(player.mvp) > 0 ? 1 : 0), 0);
  if (mvpCount > 1) {
    issues.push({ level: "error", code: "multiple_mvp", message: "Solo puede existir un MVP por partido." });
  }

  const localGoals = players
    .filter((player) => normalizeMatchText(player.equipo) === normalizeMatchText(match.local))
    .reduce((total, player) => total + matchNumber(player.goals), 0);
  const visitorGoals = players
    .filter((player) => normalizeMatchText(player.equipo) === normalizeMatchText(match.visitante))
    .reduce((total, player) => total + matchNumber(player.goals), 0);

  if (localGoals > score.local || visitorGoals > score.visitante) {
    issues.push({
      level: "error",
      code: "player_goals_exceed_score",
      message: "Los goles asignados a jugadores no pueden superar el marcador del equipo.",
    });
  }

  if (localGoals !== score.local || visitorGoals !== score.visitante) {
    issues.push({
      level: "warning",
      code: "unassigned_goals",
      message: "Hay goles del marcador que todavía no están asignados a jugadores.",
    });
  }

  const teamByName = new Map(teams.map((team) => [normalizeMatchText(team.equipo), team]));
  const localTeam = teamByName.get(normalizeMatchText(match.local));
  const visitorTeam = teamByName.get(normalizeMatchText(match.visitante));
  if (localTeam && matchNumber(localTeam.goals) !== score.local) {
    issues.push({ level: "error", code: "local_team_score", message: "Los goles del equipo local no coinciden con el resultado." });
  }
  if (visitorTeam && matchNumber(visitorTeam.goals) !== score.visitante) {
    issues.push({ level: "error", code: "visitor_team_score", message: "Los goles del equipo visitante no coinciden con el resultado." });
  }

  return issues;
}
