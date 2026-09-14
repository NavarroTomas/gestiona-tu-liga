import type { JugadorStats } from "./types";

export function valorGKSave(r: Partial<JugadorStats> & Record<string, unknown>) {
  return Number(r.gKSAVES || r.gKSaves || r.gksaves || 0);
}

export function ratingJugadorNumero(j: JugadorStats) {
  const ratingApa = Number(j.rating_apa);
  if (Number.isFinite(ratingApa) && ratingApa > 0) return ratingApa;

  const overall = Number(j.overallRating);
  if (Number.isFinite(overall) && overall > 0) return overall;

  return 0;
}

export function ratingJugador(j: JugadorStats) {
  const rating = ratingJugadorNumero(j);
  return rating > 0 ? rating.toFixed(2).replace(/\.00$/, "") : "-";
}

export function normalizarNombre(value?: string | null) {
  return String(value || "").toLowerCase().trim();
}

const ordenPosiciones: Record<string, number> = {
  GK: 1,
  LB: 2,
  CB: 3,
  RB: 4,
  CDM: 5,
  CM: 6,
  CAM: 7,
  LW: 8,
  RW: 9,
  ST: 10,
};

export function ordenarPorEquipoPosicionScore(lista: JugadorStats[], equipo: string) {
  return lista
    .filter((j) => normalizarNombre(j.equipo) === normalizarNombre(equipo))
    .sort((a, b) => {
      const posA = ordenPosiciones[a.posicion || ""] || 99;
      const posB = ordenPosiciones[b.posicion || ""] || 99;
      if (posA !== posB) return posA - posB;
      return Number(b.score || 0) - Number(a.score || 0);
    });
}

export function ordenarTopJugadores(lista: JugadorStats[]) {
  return [...lista].sort((a, b) => {
    const ratingDiff = ratingJugadorNumero(b) - ratingJugadorNumero(a);
    if (ratingDiff !== 0) return ratingDiff;
    return Number(b.score || 0) - Number(a.score || 0);
  });
}
