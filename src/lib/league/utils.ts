import type { LeagueMatch } from "./types";

export function normalizarDivision(division: string) {
  const value = String(division || "").toLowerCase();
  if (value.includes("primera")) return "primera";
  if (value.includes("segunda")) return "segunda";
  return value;
}

export function normalizarNombreEquipo(nombre?: string | null) {
  return String(nombre || "").toLowerCase().trim();
}

export function textoFechaPartido(partido: LeagueMatch) {
  if (partido?.dia) return String(partido.dia);
  if (!partido?.fecha) return "Próximo";

  const fecha = new Date(partido.fecha);
  if (Number.isNaN(fecha.getTime())) return String(partido.fecha);

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
  }).format(fecha);
}

export function parseResultado(resultado?: string | null) {
  if (!resultado) return null;
  const match = String(resultado).match(/(\d+)\s*[^0-9]\s*(\d+)/);
  if (!match) return null;

  const local = Number(match[1]);
  const visitante = Number(match[2]);
  if (Number.isNaN(local) || Number.isNaN(visitante)) return null;

  return { local, visitante };
}
