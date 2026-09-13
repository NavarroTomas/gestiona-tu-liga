import {
  DREAM_TEAM_CONFIG,
  DREAM_TEAM_POSITIONS,
} from "@/config/dreamTeam";
import type {
  DreamTeamByPosition,
  DreamTeamCompetition,
  DreamTeamContext,
  DreamTeamPlayer,
  DreamTeamPlayerType,
  DreamTeamPositionId,
  DreamTeamRawPlayerStat,
  DreamTeamVote,
  DreamTeamVoteLeader,
  UserDreamTeam,
} from "./types";

export function getDreamTeamContextLabel(context: DreamTeamContext) {
  if (context.competicion === "liga") return context.division;
  if (context.competicion === "copa_clasificatoria") return `Grupo ${context.grupo}`;
  return context.fase;
}

export function normalizeDreamTeamPhase(value: string) {
  const phase = String(value || "").toLowerCase().trim();
  if (phase === "octavos") return "octavos";
  if (phase === "cuartos") return "cuartos";
  if (phase === "semifinal" || phase === "semis") return "semifinal";
  if (phase === "final") return "final";
  if (phase === "final ascenso" || phase === "final_ascenso") return "final_ascenso";
  if (phase === "promocion" || phase === "promoción") return "promocion";
  return phase;
}

export function currentDreamTeamDateISO() {
  return new Date().toISOString().slice(0, 10);
}

export function readGoalkeeperSaves(row: DreamTeamRawPlayerStat) {
  return Number(row.gKSaves || row.gKSAVES || row.GKSaves || row.gksaves || 0);
}

export function getDreamTeamPlayerType(player: DreamTeamPlayer): DreamTeamPlayerType {
  const position = (player.posicion || "").toUpperCase();

  if (player.atajadas > 0 || position.includes("GK") || position.includes("POR")) {
    return "arquero";
  }

  if (
    position.includes("CB") ||
    position.includes("LB") ||
    position.includes("RB") ||
    position.includes("DEF") ||
    position.includes("DFC") ||
    position.includes("LI") ||
    position.includes("LD")
  ) {
    return "defensa";
  }

  if (
    position.includes("CM") ||
    position.includes("CAM") ||
    position.includes("CDM") ||
    position.includes("MC") ||
    position.includes("MCD") ||
    position.includes("MCO") ||
    position.includes("MED")
  ) {
    return "medio";
  }

  if (
    position.includes("ST") ||
    position.includes("CF") ||
    position.includes("LW") ||
    position.includes("RW") ||
    position.includes("DC") ||
    position.includes("DEL") ||
    position.includes("EXT")
  ) {
    return "delantero";
  }

  if (player.goles > 0 || player.asistencias > 0) return "delantero";
  return "medio";
}

export function aggregateDreamTeamPlayers(rows: DreamTeamRawPlayerStat[]): DreamTeamPlayer[] {
  const map: Record<string, DreamTeamPlayer & { ratingApaTotal: number }> = {};

  rows.forEach((row) => {
    const nombre = String(row.nombre || "").trim();
    const playerId = String(row.playerId || "").trim();
    if (!nombre) return;

    const key = playerId || nombre;
    if (!map[key]) {
      map[key] = {
        nombre,
        playerId,
        equipo: row.equipo || "Sin Club",
        posicion: row.posicion || "",
        partidos: 0,
        goles: 0,
        asistencias: 0,
        rating: 0,
        rating_apa: 0,
        ratingApaTotal: 0,
        atajadas: 0,
        score: 0,
        mvps: 0,
      };
    }

    map[key].partidos += 1;
    map[key].goles += Number(row.goals || 0);
    map[key].asistencias += Number(row.assists || 0);
    map[key].ratingApaTotal += Number(row.rating_apa || row.overallRating || 0);
    map[key].atajadas += readGoalkeeperSaves(row);
    map[key].score += Number(row.score || 0);
    map[key].mvps += Number(row.mvp || 0);

    if (row.equipo) map[key].equipo = row.equipo;
    if (row.posicion) map[key].posicion = row.posicion;
    if (row.playerId) map[key].playerId = row.playerId;
    if (row.nombre) map[key].nombre = row.nombre;
  });

  return Object.values(map).map(({ ratingApaTotal, ...player }) => {
    const rating = player.partidos > 0
      ? Math.round((ratingApaTotal / player.partidos) * 10) / 10
      : 0;

    return {
      ...player,
      rating,
      rating_apa: rating,
    };
  });
}

export function buildVotesByPosition(votes: DreamTeamVote[]): DreamTeamByPosition {
  const result: DreamTeamByPosition = {};

  DREAM_TEAM_POSITIONS.forEach((position) => {
    const count: Record<string, DreamTeamVoteLeader> = {};

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

export function buildUserDreamTeam(votes: DreamTeamVote[], userId: string): UserDreamTeam {
  const result: UserDreamTeam = {};
  if (!userId) return result;

  votes
    .filter((vote) => vote.usuario === userId)
    .forEach((vote) => {
      if (DREAM_TEAM_POSITIONS.some((position) => position.id === vote.posicion)) {
        result[vote.posicion as DreamTeamPositionId] = vote;
      }
    });

  return result;
}

export function getMostVotedDreamTeamPlayer(votes: DreamTeamVote[]) {
  const count: Record<string, DreamTeamVoteLeader> = {};

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

  return Object.values(count).sort((a, b) => b.votos - a.votos)[0] ?? null;
}

export function getDreamTeamTopByPosition(votes: DreamTeamVote[], position: DreamTeamPositionId) {
  const count: Record<string, DreamTeamVoteLeader> = {};

  votes
    .filter((vote) => vote.posicion === position)
    .forEach((vote) => {
      const key = vote.playerId || vote.nombre;
      if (!count[key]) {
        count[key] = {
          posicion: position,
          playerId: vote.playerId,
          nombre: vote.nombre,
          equipo: vote.equipo,
          votos: 0,
        };
      }
      count[key].votos += 1;
    });

  return Object.values(count).sort((a, b) => b.votos - a.votos).slice(0, 3);
}

export function scoreDreamTeamCandidate(player: DreamTeamPlayer, type?: DreamTeamPlayerType) {
  const rating = Number(player.rating_apa || player.rating || 0);
  const goles = Number(player.goles || 0);
  const asistencias = Number(player.asistencias || 0);
  const atajadas = Number(player.atajadas || 0);
  const score = Number(player.score || 0);
  const mvps = Number(player.mvps || 0);
  const partidos = Number(player.partidos || 0);

  if (type === "arquero") return atajadas * 2 + rating * 5 + mvps * 6 + score * 0.05 + partidos * 0.2;
  if (type === "delantero") return goles * 5 + asistencias * 3 + rating * 4 + mvps * 6 + score * 0.05;
  if (type === "medio") return rating * 5 + asistencias * 4 + goles * 2 + mvps * 5 + score * 0.05;
  return rating * 6 + mvps * 5 + score * 0.06 + partidos * 0.4;
}

export function getDreamTeamCandidates(players: DreamTeamPlayer[], positionId: DreamTeamPositionId) {
  const type = DREAM_TEAM_POSITIONS.find((position) => position.id === positionId)?.type;

  return players
    .filter((player) => getDreamTeamPlayerType(player) === type)
    .sort((a, b) => {
      const scoreDiff = scoreDreamTeamCandidate(b, type) - scoreDreamTeamCandidate(a, type);
      if (scoreDiff !== 0) return scoreDiff;
      return Number(b.rating || 0) - Number(a.rating || 0);
    })
    .slice(0, DREAM_TEAM_CONFIG.maxCandidates);
}

export function isKnockoutDreamTeamCompetition(competition: DreamTeamCompetition) {
  return ["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(competition);
}
