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
    alt: "Playoffs de Ascenso Liga",
  },

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

  formatsBySeason: {
    "Temporada 4": {
      stages: ["semifinals", "promotionFinal", "promotion"],
    },
  } satisfies Record<string, PlayoffSeasonFormat>,

  // La navegación pública solo muestra secciones que existen realmente.
  tabs: [
    { id: "camino", label: "Camino al ascenso", href: "/competicion/playoffs" },
    { id: "resultados", label: "Resultados", href: "/fixture?competicion=playoffs" },
    { id: "equipos", label: "Equipos", href: "/clubes" },
  ],
} as const;

export function getPlayoffsSeasonFormat(season: string): PlayoffSeasonFormat {
  const formats = PLAYOFFS_CONFIG.formatsBySeason as Record<string, PlayoffSeasonFormat>;
  return formats[season] || formats[PLAYOFFS_CONFIG.defaultSeason];
}
