import type { CupMatch } from "./types";

/** Normaliza nombres para comparar clubes/grupos sin problemas de tildes o mayúsculas. */
export function normalizeCupText(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function hasCupResult(match: CupMatch) {
  return String(match.resultado || "").trim() !== "";
}

export function formatCupDate(match?: CupMatch | null) {
  if (!match) return "—";
  if (match.dia) return String(match.dia);
  if (!match.fecha) return "—";

  const date = new Date(match.fecha);
  if (Number.isNaN(date.getTime())) return String(match.fecha);

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function resultLabel(result: "W" | "D" | "L") {
  if (result === "W") return "Victoria";
  if (result === "D") return "Empate";
  return "Derrota";
}
