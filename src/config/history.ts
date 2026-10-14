export const HISTORY_CONFIG = {
  /**
   * Temporada inicial mientras la base todavía no expone una temporada más nueva.
   * La página detecta automáticamente las temporadas disponibles en `partidos`.
   *
   * Se tipa como `string` a propósito: Historia puede cambiar dinámicamente
   * entre Temporada 1, 2, 3, 4, etc. y no debe quedar limitada al literal
   * "Temporada 4" por la inferencia de `as const`.
   */
  defaultSeason: "Temporada 4" as string,

  hero: {
    eyebrow: "Historia",
    title: "Torneos de Liga",
    description:
      "Todas los torneos, un mismo legado. Explorá estadísticas, campeones, premios y récords.",
  },

  competitions: [
    { key: "liga", label: "Torneo de Liga" },
    { key: "copa_argentina", label: "Copa Argentina" },
    { key: "copa_apa", label: "Copa de la Liga" },
    { key: "copa_campeones", label: "Copa de Campeones" },
  ],

  /**
   * Premios que sí mostramos en Historia.
   * Fair Play y Mejor DT se omiten a propósito para mantener la sección limpia.
   */
  awards: [
    { key: "mvp", label: "MVP" },
    { key: "scorer", label: "Goleador" },
    { key: "goalkeeper", label: "Arquero del Año" },
  ],
} as const;

export function shortSeasonLabel(season: string) {
  const match = String(season || "").match(/(\d+)/);
  return match ? `T${match[1]}` : season;
}

export function sortSeasons(seasons: string[]) {
  return [...seasons].sort((a, b) => {
    const aNumber = Number(String(a).match(/(\d+)/)?.[1] || 0);
    const bNumber = Number(String(b).match(/(\d+)/)?.[1] || 0);
    return aNumber - bNumber;
  });
}
