import {
  PREDICTION_COMPETITIONS,
  PREDICTION_SUBCATEGORIES,
} from "@/config/predicciones";
import type {
  PredictionChoice,
  PredictionCompetition,
  PredictionContext,
  PredictionMatch,
  PredictionRankingRow,
  PredictionVote,
} from "./types";

/**
 * Funciones puras del módulo Predicciones.
 * No hacen consultas a Supabase ni modifican estado de React.
 */
export function buildPredictionContext(
  competition: PredictionCompetition,
  subcategory: string,
): PredictionContext {
  if (competition === "liga") {
    const first = subcategory === "primera";
    return {
      id: first ? "liga-primera" : "liga-segunda",
      label: first ? "Liga · Primera" : "Liga · Segunda",
      short: first ? "Primera" : "Segunda",
      competicion: "liga",
      division: first ? "primera" : "segunda",
      divisionDb: first ? "Primera" : "Segunda",
    };
  }

  if (competition === "copa_clasificatoria") {
    const group = subcategory || "A";
    return {
      id: `clasificacion-${group.toLowerCase()}`,
      label: `Clasificación a Copas · Grupo ${group}`,
      short: `Grupo ${group}`,
      competicion: competition,
      fase: "grupos",
      grupo: group,
    };
  }

  const phase = subcategory || PREDICTION_SUBCATEGORIES[competition][0]?.value || "final";
  const phaseLabel =
    PREDICTION_SUBCATEGORIES[competition].find((item) => item.value === phase)?.label || phase;
  const competitionLabel =
    PREDICTION_COMPETITIONS.find((item) => item.value === competition)?.label || competition;

  return {
    id: `${competition}-${phase}`,
    label: `${competitionLabel} · ${phaseLabel}`,
    short: phaseLabel,
    competicion: competition,
    fase: phase,
  };
}

export function predictionDivisionForStorage(context: PredictionContext) {
  if (context.competicion === "liga") {
    return context.divisionDb || context.division || "Liga";
  }
  if (context.competicion === "copa_clasificatoria") {
    return `Grupo ${context.grupo}`;
  }
  return context.fase || context.short;
}

export function predictionMatchKey(match: PredictionMatch) {
  return match.partido_id || String(match.id);
}

export function normalizePredictionDate(value: unknown) {
  return String(value || "").trim();
}

export function isPredictionMatchPending(match: PredictionMatch) {
  const result = String(match.resultado || "").trim().toLowerCase();
  return !result || result === "-" || result === "null";
}

/**
 * Regla principal de apertura:
 * - el partido debe seguir sin resultado;
 * - debe tener scheduled_at real;
 * - solo se puede votar ANTES del horario de inicio.
 */
export function isPredictionVotingOpen(match: PredictionMatch, now = new Date()) {
  if (!isPredictionMatchPending(match) || !match.scheduled_at) return false;
  const startsAt = new Date(match.scheduled_at);
  if (Number.isNaN(startsAt.getTime())) return false;
  return now.getTime() < startsAt.getTime();
}

export function formatPredictionStart(match: PredictionMatch) {
  if (!match.scheduled_at) {
    return [match.dia, match.hora].filter(Boolean).join(" · ") || "Horario sin confirmar";
  }

  const date = new Date(match.scheduled_at);
  if (Number.isNaN(date.getTime())) {
    return [match.dia, match.hora].filter(Boolean).join(" · ") || "Horario sin confirmar";
  }

  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function realPredictionScore(match?: PredictionMatch | null) {
  const result = String(match?.resultado || "").trim();
  if (!result.includes("-")) return null;

  const [home, away] = result.split("-").map((value) => Number(value.trim()));
  if (Number.isNaN(home) || Number.isNaN(away)) return null;
  return { local: home, visitante: away };
}

export function realPredictionWinner(
  match?: PredictionMatch | null,
): PredictionChoice | null {
  const score = realPredictionScore(match);
  if (!score) return null;
  if (score.local > score.visitante) return "local";
  if (score.visitante > score.local) return "visitante";
  return "empate";
}

export function predictionFromScore(local: number, visitante: number): PredictionChoice {
  if (local > visitante) return "local";
  if (visitante > local) return "visitante";
  return "empate";
}

export function predictionPoints(vote: PredictionVote, match?: PredictionMatch | null) {
  const realScore = realPredictionScore(match);
  const winner = realPredictionWinner(match);
  if (!realScore || !winner) return 0;

  const exact =
    Number(vote.goles_local) === realScore.local &&
    Number(vote.goles_visitante) === realScore.visitante;
  if (exact) return 3;
  return vote.prediccion === winner ? 1 : 0;
}

export function buildPredictionRanking(
  votes: PredictionVote[],
  matches: PredictionMatch[],
): PredictionRankingRow[] {
  const rows: Record<string, PredictionRankingRow> = {};

  votes.forEach((vote) => {
    if (!rows[vote.usuario]) {
      rows[vote.usuario] = {
        usuario: vote.usuario,
        puntos: 0,
        exactos: 0,
        aciertos: 0,
        jugadas: 0,
      };
    }

    const match = matches.find((item) => predictionMatchKey(item) === vote.partido_id);
    if (!realPredictionWinner(match)) return;

    const points = predictionPoints(vote, match);
    rows[vote.usuario].jugadas += 1;
    rows[vote.usuario].puntos += points;
    if (points === 3) {
      rows[vote.usuario].exactos += 1;
      rows[vote.usuario].aciertos += 1;
    } else if (points === 1) {
      rows[vote.usuario].aciertos += 1;
    }
  });

  return Object.values(rows).sort(
    (a, b) => b.puntos - a.puntos || b.exactos - a.exactos || b.aciertos - a.aciertos,
  );
}
