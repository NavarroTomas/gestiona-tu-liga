import { COPA_CAMPEONES_CONFIG } from "@/config/copaCampeones";
import type { CupMatch } from "@/lib/cups/types";
import type { KnockoutBracket } from "@/lib/cups/knockout";

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

/**
 * Completa el cuadro visual sin tapar excepciones administrativas reales.
 *
 * Prioridad:
 * 1. Cruces reales guardados en Supabase.
 * 2. Si existe un finalista real que no salió de una semifinal existente,
 *    mostrarlo como "Equipo vs Sin rival" (pase directo).
 * 3. Recién si no hay datos reales, usar los placeholders teóricos de la copa.
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

  return {
    ...bracket,
    semifinals,
    final:
      bracket.final ||
      placeholderMatch(finalPair[0], finalPair[1], season, "final", 0),
  };
}
