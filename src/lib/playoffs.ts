import { PLAYOFFS_CONFIG, type PlayoffStageId } from "@/config/playoffs";
import type { CupMatch } from "@/lib/cups/types";

export function normalizePlayoffText(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function phaseText(match: CupMatch) {
  return normalizePlayoffText(match.fase || match.ronda || "");
}

/**
 * Detecta a qué etapa pertenece un partido leyendo `fase` o `ronda`.
 * Si en Supabase usás un nombre nuevo, agregalo en config/playoffs.ts.
 */
export function getPlayoffStage(match: CupMatch): PlayoffStageId | null {
  const phase = phaseText(match);

  // El orden importa: "Final Ascenso" debe resolverse antes que términos más generales.
  const orderedStages: PlayoffStageId[] = ["promotionFinal", "promotion", "semifinals"];

  for (const stageId of orderedStages) {
    const definition = PLAYOFFS_CONFIG.stageDefinitions[stageId];
    const matches = definition.keywords.some((keyword) =>
      phase.includes(normalizePlayoffText(keyword)),
    );
    if (matches) return stageId;
  }

  return null;
}

/**
 * Agrupa los partidos para que la vista no necesite saber nada de Supabase.
 */
export function buildPlayoffsRoad(matches: CupMatch[]) {
  const result: Record<PlayoffStageId, (CupMatch | undefined)[]> = {
    semifinals: [],
    promotionFinal: [],
    promotion: [],
  };

  matches.forEach((match) => {
    const stage = getPlayoffStage(match);
    if (stage) result[stage].push(match);
  });

  (Object.keys(result) as PlayoffStageId[]).forEach((stageId) => {
    const count = PLAYOFFS_CONFIG.stageDefinitions[stageId].matchCount;
    result[stageId] = Array.from({ length: count }, (_, index) => result[stageId][index]);
  });

  return result;
}

export function getPlayoffScore(match: CupMatch, side: "home" | "away") {
  if (!match.resultado) return "—";
  const result = match.resultado.match(/(\d+)\s*[^0-9]\s*(\d+)/);
  if (!result) return "—";
  return side === "home" ? result[1] : result[2];
}

export function getPlayoffWinner(match?: CupMatch) {
  if (!match?.resultado) return null;
  const result = match.resultado.match(/(\d+)\s*[^0-9]\s*(\d+)/);
  if (!result) return null;

  const home = Number(result[1]);
  const away = Number(result[2]);
  if (Number.isNaN(home) || Number.isNaN(away) || home === away) return null;
  return home > away ? match.local : match.visitante;
}
