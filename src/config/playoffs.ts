export type PlayoffStageId = "semifinals" | "promotionFinal" | "promotion";

export type PlayoffSeasonFormat = {
  stages: readonly PlayoffStageId[];
};

/**
 * CONFIGURACIÓN CENTRAL DE PLAYOFFS DE ASCENSO
 * ---------------------------------------------
 * Este es el archivo que deberías tocar para la mayoría de cambios futuros.
 *
 * TEMPORADAS
 * Para agregar una temporada nueva:
 *   seasons: ["Temporada 5", "Temporada 4"]
 *   defaultSeason: "Temporada 5"
 *
 * FORMATO POR TEMPORADA
 * En Temporada 4 el camino es:
 *   Semifinales -> Final de Ascenso -> Promoción
 *
 * Si una temporada cambia el formato, modificá solamente `formatsBySeason`.
 * El componente visual arma las columnas automáticamente.
 *
 * NOMBRES DE FASE EN SUPABASE
 * Si guardás una fase con otro nombre, agregá una variante en `stageDefinitions`.
 * Ejemplo: keywords: ["final ascenso", "final de ascenso", "repechaje final"]
 *
 * IMPORTANTE:
 * `competitionKey` debe coincidir con el valor de `competicion` en `partidos`.
 */
export const PLAYOFFS_CONFIG = {
  competitionKey: "playoffs",

  defaultSeason: "Temporada 4",
  seasons: ["Temporada 4"],

  hero: {
    title: "Playoffs de Ascenso",
    subtitle: "El camino a Primera División",
    image: "/images/competicion/playoffs.png",
    alt: "Playoffs de Ascenso APA",
  },

  /**
   * Acá definís qué significa cada etapa y cuántos partidos muestra.
   * Podés cambiar textos sin tocar el componente visual.
   */
  stageDefinitions: {
    semifinals: {
      label: "Semifinales",
      description: "2° al 5° de Segunda División",
      matchCount: 2,
      keywords: ["semifinal", "semi"],
      placeholders: ["Semifinal 1", "Semifinal 2"],
    },
    promotionFinal: {
      label: "Final de Ascenso",
      description: "Ganador SF1 vs Ganador SF2",
      matchCount: 1,
      keywords: ["final ascenso", "final de ascenso"],
      placeholders: ["Ganadores de semifinales"],
    },
    promotion: {
      label: "Promoción",
      description: "Ganador de la final vs anteúltimo de Primera",
      matchCount: 1,
      keywords: ["promocion", "promoción"],
      placeholders: ["Finalista vs Primera División"],
    },
  },

  /**
   * Formato de cada temporada. Podés reordenar o quitar etapas.
   * Si una temporada no tuviera Promoción, por ejemplo:
   * stages: ["semifinals", "promotionFinal"]
   */
  formatsBySeason: {
    "Temporada 4": {
      stages: ["semifinals", "promotionFinal", "promotion"],
    },
  } satisfies Record<string, PlayoffSeasonFormat>,

  tabs: [
    { id: "resumen", label: "Resumen", href: "/competicion/playoffs" },
    { id: "camino", label: "Camino al ascenso", href: "/competicion/playoffs" },
    { id: "resultados", label: "Resultados", href: "/fixture/playoffs" },
    { id: "estadisticas", label: "Estadísticas", href: "/estadisticas" },
    { id: "equipos", label: "Equipos", href: "/clubes" },
  ],
} as const;

/** Devuelve el formato de la temporada seleccionada. */
export function getPlayoffsSeasonFormat(season: string): PlayoffSeasonFormat {
  const formats = PLAYOFFS_CONFIG.formatsBySeason as Record<string, PlayoffSeasonFormat>;
  return formats[season] || formats[PLAYOFFS_CONFIG.defaultSeason];
}
