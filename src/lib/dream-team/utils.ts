import { DREAM_TEAM_CONFIG, DREAM_TEAM_POSITIONS } from "@/config/dreamTeam";
import type {
  DreamTeamCompetition,
  DreamTeamPlayer,
  DreamTeamPositionType,
  DreamTeamVote,
  DreamTeamVoteSummary,
  DreamTeamWinnersMap,
  DreamTeamSelectionMap,
} from "./types";

export function getGkSaves(row: Record<string, unknown>) {
  return Number(
    row.gKSaves ?? row.gKSAVES ?? row.GKSaves ?? row.gksaves ?? 0,
  );
}

export function getPlayerType(player: DreamTeamPlayer): DreamTeamPositionType {
  const pos = String(player.posicion || "").toUpperCase();

  if (player.atajadas > 0 || pos.includes("GK") || pos.includes("POR")) {
    return "arquero";
  }

  if (
    pos.includes("CB") ||
    pos.includes("LB") ||
    pos.includes("RB") ||
    pos.includes("DEF") ||
    pos.includes("DFC") ||
    pos.includes("LI") ||
    pos.includes("LD")
  ) {
    return "defensa";
  }

  if (
    pos.includes("CM") ||
    pos.includes("CAM") ||
    pos.includes("CDM") ||
    pos.includes("MC") ||
    pos.includes("MCD") ||
    pos.includes("MCO") ||
    pos.includes("MED")
  ) {
    return "medio";
  }

  if (
    pos.includes("ST") ||
    pos.includes("CF") ||
    pos.includes("LW") ||
    pos.includes("RW") ||
    pos.includes("DC") ||
    pos.includes("DEL") ||
    pos.includes("EXT")
  ) {
    return "delantero";
  }

  if (player.goles > 0 || player.asistencias > 0) return "delantero";
  return "medio";
}

export function phaseToDb(value: string) {
  const normalized = String(value || "").toLowerCase().trim();
  if (normalized === "octavos") return "octavos";
  if (normalized === "cuartos") return "cuartos";
  if (normalized === "semifinal" || normalized === "semis") return "semifinal";
  if (normalized === "final") return "final";
  if (normalized === "final ascenso" || normalized === "final_ascenso") return "final_ascenso";
  if (normalized === "promocion" || normalized === "promoción") return "promocion";
  return normalized;
}

export function getCompetitionLabel(value: DreamTeamCompetition) {
  return (
    DREAM_TEAM_CONFIG.competitions.find((competition) => competition.value === value)
      ?.label || "Competición"
  );
}

export function getContextLabel(
  competition: DreamTeamCompetition,
  division: string,
  group: string,
  phase: string,
) {
  if (competition === "liga") return division;
  if (competition === "copa_clasificatoria") return `Grupo ${group}`;
  return phase;
}

export function currentDateIso() {
  return new Date().toISOString().slice(0, 10);
}

export function scoreCandidate(player: DreamTeamPlayer, type?: DreamTeamPositionType) {
  const rating = Number(player.rating_apa || player.rating || 0);
  const goals = Number(player.goles || 0);
  const assists = Number(player.asistencias || 0);
  const saves = Number(player.atajadas || 0);
  const score = Number(player.score || 0);
  const mvps = Number(player.mvps || 0);
  const matches = Number(player.partidos || 0);

  if (type === "arquero") {
    return saves * 2 + rating * 5 + mvps * 6 + score * 0.05 + matches * 0.2;
  }

  if (type === "delantero") {
    return goals * 5 + assists * 3 + rating * 4 + mvps * 6 + score * 0.05;
  }

  if (type === "medio") {
    return rating * 5 + assists * 4 + goals * 2 + mvps * 5 + score * 0.05;
  }

  return rating * 6 + mvps * 5 + score * 0.06 + matches * 0.4;
}

export function buildVoteWinners(votes: DreamTeamVote[]): DreamTeamWinnersMap {
  const result: DreamTeamWinnersMap = {};

  DREAM_TEAM_POSITIONS.forEach((position) => {
    const count: Record<string, DreamTeamVoteSummary> = {};

    votes
      .filter((vote) => vote.posicion === position.id)
      .forEach((vote) => {
        const key = vote.playerId || vote.nombre;
        if (!count[key]) {
          count[key] = {
            posicion: position.id,
            playerId: vote.playerId,
            nombre: vote.nombre,
            equipo: vote.equipo,
            votos: 0,
          };
        }
        count[key].votos += 1;
      });

    const winner = Object.values(count).sort((a, b) => b.votos - a.votos)[0];
    if (winner) result[position.id] = winner;
  });

  return result;
}

export function buildUserDreamTeam(
  votes: DreamTeamVote[],
  userId: string,
): DreamTeamSelectionMap {
  const result: DreamTeamSelectionMap = {};
  if (!userId) return result;

  votes
    .filter((vote) => vote.usuario === userId)
    .forEach((vote) => {
      result[vote.posicion] = vote;
    });

  return result;
}

export function getMostVotedPlayer(votes: DreamTeamVote[]) {
  const count: Record<string, DreamTeamVoteSummary> = {};

  votes.forEach((vote) => {
    const key = vote.playerId || vote.nombre;
    if (!count[key]) {
      count[key] = {
        playerId: vote.playerId,
        nombre: vote.nombre,
        equipo: vote.equipo,
        votos: 0,
      };
    }
    count[key].votos += 1;
  });

  return Object.values(count).sort((a, b) => b.votos - a.votos)[0];
}

export function getTopVotesForPosition(
  votes: DreamTeamVote[],
  position: string,
  limit = 3,
) {
  const count: Record<string, DreamTeamVoteSummary> = {};

  votes
    .filter((vote) => vote.posicion === position)
    .forEach((vote) => {
      const key = vote.playerId || vote.nombre;
      if (!count[key]) {
        count[key] = {
          playerId: vote.playerId,
          nombre: vote.nombre,
          equipo: vote.equipo,
          votos: 0,
        };
      }
      count[key].votos += 1;
    });

  return Object.values(count)
    .sort((a, b) => b.votos - a.votos)
    .slice(0, limit);
}

export function getCandidates(
  players: DreamTeamPlayer[],
  positionId: string,
) {
  const type = DREAM_TEAM_POSITIONS.find((position) => position.id === positionId)?.type;

  return players
    .filter((player) => getPlayerType(player) === type)
    .sort((a, b) => {
      const difference = scoreCandidate(b, type) - scoreCandidate(a, type);
      if (difference !== 0) return difference;
      return Number(b.rating || 0) - Number(a.rating || 0);
    })
    .slice(0, 40);
}
