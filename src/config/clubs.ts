export const CLUBS_CONFIG = {
  defaultSeason: "Temporada 4" as string,
  defaultDivision: "Primera" as string,
  hero: {
    eyebrow: "Clubes APA",
    title: "Clubes APA",
    description:
      "Las instituciones que forman la identidad competitiva de APA PSO Argentina. Explorá clubes por temporada, categoría, conocé sus perfiles, planteles, estadísticas e historia.",
  },
  filters: {
    eyebrow: "Temporada y categoría",
    title: "Explorá los clubes de APA",
    description: "Elegí el contexto competitivo para ver las instituciones registradas.",
  },
} as const;

export function sortClubSeasons(seasons: string[]) {
  return [...seasons].sort((a, b) => {
    const aNumber = Number(String(a).match(/(\d+)/)?.[1] || 0);
    const bNumber = Number(String(b).match(/(\d+)/)?.[1] || 0);
    return aNumber - bNumber;
  });
}

export function clubDivisionLabel(value: string) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("primera")) return "Primera";
  if (normalized.includes("segunda")) return "Segunda";
  if (normalized.includes("tercera")) return "Tercera";
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "División";
}

export function sortClubDivisions(divisions: string[]) {
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
