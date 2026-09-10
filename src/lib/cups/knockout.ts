import type { CupMatch } from "@/lib/cups/types";

export type KnockoutRoundId = "roundOf16" | "quarterfinals" | "semifinals" | "final";

export type KnockoutBracket = {
  roundOf16: (CupMatch | undefined)[];
  quarterfinals: (CupMatch | undefined)[];
  semifinals: (CupMatch | undefined)[];
  final?: CupMatch;
  thirdPlace?: CupMatch;
};

export function normalizeCupText(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function phaseText(match: CupMatch) {
  return normalizeCupText(match.fase || match.ronda || "");
}

function containsKeyword(match: CupMatch, keywords: readonly string[]) {
  const text = phaseText(match);
  return keywords.some((keyword) => text.includes(normalizeCupText(keyword)));
}

export function getKnockoutWinner(match?: CupMatch) {
  if (!match?.resultado) return null;
  const result = match.resultado.match(/(\d+)\s*[^0-9]\s*(\d+)/);
  if (!result) return null;

  const home = Number(result[1]);
  const away = Number(result[2]);
  if (Number.isNaN(home) || Number.isNaN(away) || home === away) return null;
  return home > away ? match.local : match.visitante;
}

export function getKnockoutScore(match: CupMatch, side: "home" | "away") {
  if (!match.resultado) return "—";
  const result = match.resultado.match(/(\d+)\s*[^0-9]\s*(\d+)/);
  if (!result) return "—";
  return side === "home" ? result[1] : result[2];
}

/**
 * Convierte los partidos crudos de Supabase en todas las rondas posibles.
 *
 * OJO: esto NO decide qué rondas se muestran. La temporada decide eso desde
 * su archivo de configuración (`formatsBySeason`). De esta forma podés tener:
 * - una temporada desde Cuartos;
 * - otra desde Octavos;
 * - otra desde Semifinales;
 * usando el mismo componente y la misma consulta a Supabase.
 */
export function buildKnockoutBracket(
  matches: CupMatch[],
  keywords: {
    roundOf16: readonly string[];
    quarter: readonly string[];
    semifinal: readonly string[];
    final: readonly string[];
    thirdPlace: readonly string[];
  },
): KnockoutBracket {
  const roundOf16Matches = matches.filter((match) => containsKeyword(match, keywords.roundOf16));
  const quarterMatches = matches.filter((match) => containsKeyword(match, keywords.quarter));
  const semifinalMatches = matches.filter((match) => containsKeyword(match, keywords.semifinal));
  const thirdPlace = matches.find((match) => containsKeyword(match, keywords.thirdPlace));

  const final = matches.find((match) => {
    if (!containsKeyword(match, keywords.final)) return false;
    if (containsKeyword(match, keywords.roundOf16)) return false;
    if (containsKeyword(match, keywords.quarter)) return false;
    if (containsKeyword(match, keywords.semifinal)) return false;
    if (containsKeyword(match, keywords.thirdPlace)) return false;
    return true;
  });

  return {
    roundOf16: Array.from({ length: 8 }, (_, index) => roundOf16Matches[index]),
    quarterfinals: Array.from({ length: 4 }, (_, index) => quarterMatches[index]),
    semifinals: Array.from({ length: 2 }, (_, index) => semifinalMatches[index]),
    final,
    thirdPlace,
  };
}
