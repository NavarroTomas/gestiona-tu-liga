import type { KnockoutRoundId } from "@/lib/cups/knockout";

export type CopaCampeonesSeasonFormat = {
  rounds: readonly KnockoutRoundId[];
  showThirdPlace: boolean;
};

/**
 * CONFIGURACIÓN CENTRAL DE COPA DE CAMPEONES
 * ------------------------------------------
 * Esta competición reúne a los campeones de los torneos principales.
 * Para cambios normales, editá este archivo y no la página.
 *
 * TEMPORADA 4
 * El formato actual es:
 *   Semifinales -> Final
 *
 * Si una temporada futura cambia el formato, modificá `formatsBySeason`.
 * Ejemplo con una ronda previa:
 *   rounds: ["quarterfinals", "semifinals", "final"]
 *
 * PARTICIPANTES ESPERADOS
 * Los textos de `placeholderMatchups` se muestran mientras todavía no existe
 * el partido real en Supabase. Cuando cargues el cruce, el dato real lo reemplaza.
 *
 * IMPORTANTE
 * `competitionKey` debe coincidir con el valor guardado en `partidos.competicion`.
 * Si en tu BD usás otro nombre, cambialo solamente acá.
 */
export const COPA_CAMPEONES_CONFIG = {
  competitionKey: "copa_campeones",

  defaultSeason: "Temporada 4",
  seasons: ["Temporada 4"],

  hero: {
    title: "Copa de Campeones",
    subtitle: "Los campeones de la temporada",
    image: "/themes/worldcup/backgrounds/FotoCancha.png",
    alt: "Copa de Campeones APA",
  },

  formatsBySeason: {
    "Temporada 4": {
      rounds: ["semifinals", "final"],
      showThirdPlace: false,
    },
  } satisfies Record<string, CopaCampeonesSeasonFormat>,

  /**
   * Cruces base de la temporada mientras todavía no se cargaron partidos.
   * Podés cambiar quién enfrenta a quién sin tocar el componente visual.
   */
  placeholderMatchups: {
    semifinals: [
      ["Campeón Primera División", "Campeón Copa APA"],
      ["Campeón Segunda División", "Campeón Copa Argentina"],
    ],
    final: ["Ganador SF1", "Ganador SF2"],
  },

  phaseKeywords: {
    roundOf16: ["octavos", "8vos", "octavo"],
    quarter: ["cuartos", "4tos", "cuarto"],
    semifinal: ["semifinal", "semi"],
    final: ["final"],
    thirdPlace: ["tercer", "3er", "3.º", "3°"],
  },

  tabs: [
    { id: "resumen", label: "Resumen", href: "/competicion/copa-campeones" },
    { id: "cuadro", label: "Cuadro", href: "/competicion/copa-campeones" },
    { id: "resultados", label: "Resultados", href: "/fixture" },
    { id: "estadisticas", label: "Estadísticas", href: "/estadisticas" },
    { id: "equipos", label: "Equipos", href: "/clubes" },
  ],
} as const;

export function getCopaCampeonesSeasonFormat(season: string): CopaCampeonesSeasonFormat {
  const formats = COPA_CAMPEONES_CONFIG.formatsBySeason as Record<string, CopaCampeonesSeasonFormat>;
  return formats[season] || formats[COPA_CAMPEONES_CONFIG.defaultSeason];
}
