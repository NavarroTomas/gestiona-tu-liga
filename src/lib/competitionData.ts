export function cleanDbText(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeDbText(value: unknown) {
  return cleanDbText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSeason(value: unknown) {
  const normalized = normalizeDbText(value);
  const number = normalized.match(/\d+/)?.[0];
  return number ? `temporada ${number}` : normalized;
}

export function normalizeRound(value: unknown) {
  const normalized = normalizeDbText(value);
  const number = normalized.match(/\d+/)?.[0];
  return number || normalized;
}

export function normalizeDivision(value: unknown) {
  const normalized = normalizeDbText(value);
  if (normalized.includes("primera")) return "primera";
  if (normalized.includes("segunda")) return "segunda";
  return normalized;
}

export function normalizeCompetition(value: unknown, division?: unknown) {
  const normalized = normalizeDbText(value);
  if (
    normalized === "liga" ||
    normalized.includes("torneo de liga") ||
    normalized.includes("liga primera") ||
    normalized.includes("liga segunda") ||
    normalized.includes("primera division") ||
    normalized.includes("segunda division")
  ) return "liga";
  if (normalized.includes("clasificacion") || normalized.includes("clasificatoria")) return "copa_clasificatoria";
  if (normalized.includes("copa argentina")) return "copa_argentina";
  if (normalized.includes("Copa de la Liga")) return "copa_apa";
  if (normalized.includes("campeones")) return "copa_campeones";
  if (normalized.includes("playoff")) return "playoffs";
  if (!normalized && normalizeDivision(division)) return "liga";
  return normalized.replace(/\s+/g, "_");
}

export function normalizePhase(value: unknown) {
  const normalized = normalizeDbText(value);
  if (!normalized) return "";
  if (normalized === "grupo" || normalized === "grupos" || normalized.includes("fase de grupos")) return "grupos";
  if (normalized.startsWith("octavo")) return "octavos";
  if (normalized.startsWith("cuarto")) return "cuartos";
  if (normalized.startsWith("semi")) return "semifinal";
  if (normalized.includes("final ascenso")) return "final_ascenso";
  if (normalized.includes("promocion")) return "promocion";
  if (normalized === "final") return "final";
  return normalized.replace(/\s+/g, "_");
}

export function normalizeGroup(value: unknown) {
  return cleanDbText(value).replace(/^grupo\s*/i, "").toUpperCase();
}

export function parseScore(value: unknown): [number, number] | null {
  const match = cleanDbText(value).match(/^(\d+)\s*[-:]\s*(\d+)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
}

export function stableMatchId(season: unknown, rowId: unknown) {
  const seasonSlug = normalizeSeason(season).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `apa-${seasonSlug}-partido-${String(rowId)}`;
}

export function matchIds(match: { id?: unknown; partido_id?: unknown; temporada?: unknown }) {
  return Array.from(new Set([
    cleanDbText(match.partido_id),
    match.id != null ? stableMatchId(match.temporada, match.id) : "",
    match.id != null ? String(match.id) : "",
  ].filter(Boolean)));
}

export function matchFitsContext(match: any, context: {
  temporada: string;
  competicion: string;
  division?: string;
  grupo?: string;
  fase?: string;
}) {
  if (normalizeSeason(match.temporada) !== normalizeSeason(context.temporada)) return false;
  if (normalizeCompetition(match.competicion, match.division) !== context.competicion) return false;
  if (context.competicion === "liga" && normalizeDivision(match.division) !== normalizeDivision(context.division)) return false;
  if (context.competicion === "copa_clasificatoria") {
    if (normalizeGroup(match.grupo) !== normalizeGroup(context.grupo)) return false;
    const phase = normalizePhase(match.fase);
    if (phase && phase !== "grupos") return false;
  }
  if (context.fase && normalizePhase(match.fase) !== normalizePhase(context.fase)) return false;
  return true;
}
