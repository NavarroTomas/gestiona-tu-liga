import type { CupMatch } from "@/lib/cups/types";

export type KnockoutBracket = {
  quarterLeft: [CupMatch | undefined, CupMatch | undefined];
  quarterRight: [CupMatch | undefined, CupMatch | undefined];
  semifinalLeft?: CupMatch;
  semifinalRight?: CupMatch;
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
 * Convierte los partidos crudos de Supabase en las posiciones visuales del
 * bracket. Si más adelante cambia el formato del torneo, este es el archivo
 * correcto para modificar el armado del cuadro, no la página principal.
 */
export function buildKnockoutBracket(
  matches: CupMatch[],
  keywords: {
    quarter: readonly string[];
    semifinal: readonly string[];
    final: readonly string[];
    thirdPlace: readonly string[];
  },
): KnockoutBracket {
  const quarters = matches.filter((match) => containsKeyword(match, keywords.quarter));
  const semifinals = matches.filter((match) => containsKeyword(match, keywords.semifinal));
  const thirdPlace = matches.find((match) => containsKeyword(match, keywords.thirdPlace));

  const final = matches.find((match) => {
    if (!containsKeyword(match, keywords.final)) return false;
    if (containsKeyword(match, keywords.quarter)) return false;
    if (containsKeyword(match, keywords.semifinal)) return false;
    if (containsKeyword(match, keywords.thirdPlace)) return false;
    return true;
  });

  return {
    quarterLeft: [quarters[0], quarters[1]],
    quarterRight: [quarters[2], quarters[3]],
    semifinalLeft: semifinals[0],
    semifinalRight: semifinals[1],
    final,
    thirdPlace,
  };
}
