export const SQUADS_CONFIG = {
  defaultSeason: "Temporada 4" as string,
  defaultDivision: "Primera" as string,
  hero: {
    eyebrow: "APA PSO Argentina",
    title: "Plantillas",
    description:
      "Explorá los planteles oficiales por temporada, categoría y club.",
  },
} as const;

export function sortSquadSeasons(seasons: string[]) {
  return [...seasons].sort((a, b) => {
    const an = Number(a.match(/(\d+)/)?.[1] || 0);
    const bn = Number(b.match(/(\d+)/)?.[1] || 0);
    return bn - an;
  });
}

export function normalizeSquadDivision(value?: string | null) {
  const text = String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (text.includes("primera")) return "primera";
  if (text.includes("segunda")) return "segunda";
  return text;
}
