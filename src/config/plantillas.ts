export const PLANTILLAS_CONFIG = {
  defaultSeason: "Temporada 4" as string,
  defaultDivision: "Primera" as string,
  hero: {
    eyebrow: "Plantillas Liga",
    title: "Plantillas",
    description:
      "Explorá los planteles oficiales por torneo, categoría y club.",
  },
} as const;

export function sortPlantillasSeasons(seasons: string[]) {
  return [...seasons].sort((a, b) => {
    const aNumber = Number(String(a).match(/(\d+)/)?.[1] || 0);
    const bNumber = Number(String(b).match(/(\d+)/)?.[1] || 0);
    return aNumber - bNumber;
  });
}

export function plantillaDivisionLabel(value: string) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("primera")) return "Primera";
  if (normalized.includes("segunda")) return "Segunda";
  if (normalized.includes("tercera")) return "Tercera";
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "División";
}

export function sortPlantillasDivisions(divisions: string[]) {
  const order = ["Primera", "Segunda", "Tercera"];
  return [...divisions].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}
