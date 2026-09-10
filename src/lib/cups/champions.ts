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

/**
 * Mientras no exista un cruce real en Supabase, completa el cuadro con los
 * clasificados esperados de la Copa de Campeones. Un partido real siempre
 * tiene prioridad y reemplaza automáticamente al placeholder.
 */
export function withCopaCampeonesPlaceholders(
  bracket: KnockoutBracket,
  season: string,
): KnockoutBracket {
  const semifinalPairs = COPA_CAMPEONES_CONFIG.placeholderMatchups.semifinals;
  const finalPair = COPA_CAMPEONES_CONFIG.placeholderMatchups.final;

  return {
    ...bracket,
    semifinals: [
      bracket.semifinals[0] || placeholderMatch(semifinalPairs[0][0], semifinalPairs[0][1], season, "semifinal", 0),
      bracket.semifinals[1] || placeholderMatch(semifinalPairs[1][0], semifinalPairs[1][1], season, "semifinal", 1),
    ],
    final:
      bracket.final ||
      placeholderMatch(finalPair[0], finalPair[1], season, "final", 0),
  };
}
