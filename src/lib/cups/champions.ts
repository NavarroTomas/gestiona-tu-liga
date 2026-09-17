import { COPA_CAMPEONES_CONFIG } from "@/config/copaCampeones";
import type { CupMatch } from "@/lib/cups/types";
import { getKnockoutWinner, type KnockoutBracket } from "@/lib/cups/knockout";

function placeholderMatch(
  local: string,
  visitante: string,
  season: string,
  phase: "semifinal" | "final",
  index: number,
): CupMatch {
  return {
    id: `copa-campeones-placeholder-${phase}-${index}`,
    local,
    visitante,
    resultado: null,
    fecha: null,
    temporada: season,
    division: null,
    dia: null,
    hora: null,
    competicion: COPA_CAMPEONES_CONFIG.competitionKey,
    grupo: null,
    fase: phase,
    ronda: phase,
  };
}

function realSemifinalTeams(bracket: KnockoutBracket) {
  return new Set(
    bracket.semifinals
      .flatMap((match) => [match?.local, match?.visitante])
      .filter((team): team is string => Boolean(team)),
  );
}

function directFinalists(bracket: KnockoutBracket) {
  if (!bracket.final) return [];

  const semifinalTeams = realSemifinalTeams(bracket);
  return [bracket.final.local, bracket.final.visitante]
    .filter((team): team is string => Boolean(team))
    .filter((team) => !semifinalTeams.has(team));
}

function completedSemifinalWinners(bracket: KnockoutBracket) {
  return bracket.semifinals
    .map((match) => getKnockoutWinner(match))
    .filter((team): team is string => Boolean(team));
}

function finalWithAdvancedWinners(bracket: KnockoutBracket) {
  if (!bracket.final) return undefined;

  const winners = completedSemifinalWinners(bracket);
  const currentFinalists = [bracket.final.local, bracket.final.visitante]
    .filter((team): team is string => Boolean(team));
  const missingWinner = winners.find((team) => !currentFinalists.includes(team));

  if (!missingWinner) return bracket.final;

  if (!bracket.final.local) {
    return { ...bracket.final, local: missingWinner };
  }

  if (!bracket.final.visitante) {
    return { ...bracket.final, visitante: missingWinner };
  }

  return bracket.final;
}

/**
 * Completa el cuadro visual sin tapar excepciones administrativas reales.
 *
 * Prioridad:
 * 1. Cruces reales guardados en Supabase.
 * 2. Si una semifinal ya tiene ganador y la final tiene un lugar vacío,
 *    completar visualmente ese lugar con el ganador.
 * 3. Si existe un finalista real que no salió de una semifinal existente,
 *    mostrarlo como "Equipo vs Sin rival" (pase directo).
 * 4. Recién si no hay datos reales, usar los placeholders teóricos de la copa.
 */
export function withCopaCampeonesPlaceholders(
  bracket: KnockoutBracket,
  season: string,
): KnockoutBracket {
  const semifinalPairs = COPA_CAMPEONES_CONFIG.placeholderMatchups.semifinals;
  const finalPair = COPA_CAMPEONES_CONFIG.placeholderMatchups.final;
  const byeTeams = directFinalists(bracket);
  let byeIndex = 0;

  const semifinals = [0, 1].map((index) => {
    const realMatch = bracket.semifinals[index];
    if (realMatch) return realMatch;

    const directTeam = byeTeams[byeIndex];
    if (directTeam) {
      byeIndex += 1;
      return placeholderMatch(directTeam, "Sin rival", season, "semifinal", index);
    }

    return placeholderMatch(
      semifinalPairs[index][0],
      semifinalPairs[index][1],
      season,
      "semifinal",
      index,
    );
  });

  const advancedFinal = finalWithAdvancedWinners(bracket);

  return {
    ...bracket,
    semifinals,
    final:
      advancedFinal ||
      placeholderMatch(finalPair[0], finalPair[1], season, "final", 0),
  };
}
