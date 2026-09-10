import type { CupMatch } from "@/lib/cups/types";

export type FixtureMatch = CupMatch & {
  grupo?: string | null;
  fase?: string | null;
  ronda?: string | null;
};

export type FixtureCalendarDay = {
  date: Date;
  inCurrentMonth: boolean;
  key: string;
};

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Normalización simple para comparar nombres y filtros. */
export function normalizeFixtureText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Convierte los formatos de fecha más habituales del proyecto a Date.
 * Si `fecha` es solamente un número de jornada (ej. "4"), se ignora.
 * Para sumar un formato nuevo, hacelo acá y no dentro del calendario visual.
 */
export function getFixtureMatchDate(match: FixtureMatch): Date | null {
  const candidates = [match.dia, match.fecha];

  for (const rawValue of candidates) {
    if (rawValue == null) continue;
    const raw = String(rawValue).trim();
    if (!raw || /^\d{1,2}$/.test(raw) || /^fecha\s*\d+$/i.test(raw)) continue;

    const latin = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})(?:\s+.*)?$/);
    if (latin) {
      const day = Number(latin[1]);
      const month = Number(latin[2]) - 1;
      const year = Number(latin[3].length === 2 ? `20${latin[3]}` : latin[3]);
      const parsed = new Date(year, month, day);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    const normalizedIso = raw.includes(" ") && /^\d{4}-\d{2}-\d{2}\s/.test(raw)
      ? raw.replace(" ", "T")
      : raw;
    const timestamp = Date.parse(normalizedIso);
    if (!Number.isNaN(timestamp)) return new Date(timestamp);
  }

  return null;
}

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function sameFixtureDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return dateKey(a) === dateKey(b);
}

/**
 * Crea únicamente las semanas necesarias para el mes visible.
 *
 * Antes siempre generábamos 42 celdas (6 semanas), aunque el mes necesitara
 * solo 5. Eso hacía aparecer una fila completa del mes siguiente. Ahora la
 * grilla puede tener 4, 5 o 6 semanas según el mes real. Las celdas de relleno
 * de la primera/última semana se mantienen solo para conservar la alineación
 * de domingo a sábado; el componente visual las deja vacías.
 */
export function buildFixtureCalendar(month: Date): FixtureCalendarDay[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const requiredCells = first.getDay() + daysInMonth;
  const weekCount = Math.ceil(requiredCells / 7);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());

  return Array.from({ length: weekCount * 7 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      key: dateKey(date),
      inCurrentMonth: date.getMonth() === monthIndex && date.getFullYear() === year,
    };
  });
}

export function fixtureMonthLabel(date: Date) {
  return `${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;
}

export function moveFixtureMonth(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function shortTeamName(name?: string | null) {
  if (!name) return "---";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((word) => word[0]).join("").slice(0, 3).toUpperCase();
}

export function fixtureRoundLabel(match?: FixtureMatch | null) {
  if (!match) return "Partido";
  const fase = String(match.fase || "").trim();
  if (fase) return fase;

  const ronda = String(match.ronda || "").trim();
  if (ronda) return ronda;

  const fecha = String(match.fecha || "").trim();
  if (/^\d+$/.test(fecha)) return `Fecha ${fecha}`;
  return "Partido";
}

export function fixtureStatus(match: FixtureMatch) {
  if (match.resultado) return "finalizado" as const;
  if (match.dia || match.hora || getFixtureMatchDate(match)) return "programado" as const;
  return "pendiente" as const;
}

export function sortFixtureMatches(matches: FixtureMatch[]) {
  return [...matches].sort((a, b) => {
    const dateA = getFixtureMatchDate(a)?.getTime();
    const dateB = getFixtureMatchDate(b)?.getTime();

    if (dateA != null && dateB != null && dateA !== dateB) return dateA - dateB;
    if (dateA != null && dateB == null) return -1;
    if (dateA == null && dateB != null) return 1;

    return String(a.id ?? "").localeCompare(String(b.id ?? ""), undefined, { numeric: true });
  });
}
