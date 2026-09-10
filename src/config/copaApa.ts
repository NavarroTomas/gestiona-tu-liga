import type { CupsTabId } from "./cups";
import type { KnockoutRoundId } from "@/lib/cups/knockout";

export type CopaApaSeasonFormat = {
  rounds: readonly KnockoutRoundId[];
  showThirdPlace: boolean;
};

/**
 * CONFIGURACIÓN CENTRAL DE COPA APA
 * ---------------------------------
 * Para los cambios normales de esta competición, este es el archivo que
 * deberías tocar. La vista, Supabase y el bracket leen estos valores solos.
 *
 * FORMATO POR TEMPORADA
 * La cantidad de rondas puede cambiar de una temporada a otra.
 *
 * Ejemplo actual (Temporada 4):
 *   Cuartos -> Semifinales -> Final
 *
 * Si una futura Temporada 5 tuviera Octavos:
 *   1) agregá "Temporada 5" a `seasons`;
 *   2) agregá dentro de `formatsBySeason`:
 *
 *   "Temporada 5": {
 *     rounds: ["roundOf16", "quarterfinals", "semifinals", "final"],
 *     showThirdPlace: false,
 *   }
 *
 * Si una temporada empezara directamente en semifinales:
 *   rounds: ["semifinals", "final"]
 *
 * OTROS CAMBIOS FÁCILES
 * - título/subtítulo/fondo: `hero`
 * - nombres de fases aceptados desde Supabase: `phaseKeywords`
 * - pestañas superiores: `tabs`
 * - tercer puesto: `showThirdPlace` dentro del formato de esa temporada
 *
 * IMPORTANTE:
 * `competitionKey`, `configTable` y `activationField` deben coincidir con la
 * base de datos. Para cambiar solo textos o diseño, no hace falta tocarlos.
 */
export const COPA_APA_CONFIG = {
  competitionKey: "copa_apa",
  activationField: "copa_apa_activa",
  configTable: "configuracion_copas",

  defaultSeason: "Temporada 4",
  seasons: ["Temporada 4"],

  hero: {
    title: "Copa APA",
    subtitle: "Eliminación directa",
    image: "/themes/worldcup/backgrounds/FotoCancha.png",
    alt: "Cancha de Pro Soccer Online",
  },

  formatsBySeason: {
    "Temporada 4": {
      rounds: ["quarterfinals", "semifinals", "final"],
      showThirdPlace: false,
    },
  } satisfies Record<string, CopaApaSeasonFormat>,

  phaseKeywords: {
    roundOf16: ["octavos", "8vos", "octavo"],
    quarter: ["cuartos", "4tos", "cuarto"],
    semifinal: ["semifinal", "semi"],
    final: ["final"],
    thirdPlace: ["tercer", "3er", "3.º", "3°"],
  },

  tabs: [
    { id: "resumen" as CupsTabId, label: "Resumen", href: "/competicion/copa-apa" },
    { id: "grupos" as CupsTabId, label: "Cuadro", href: "/competicion/copa-apa" },
    { id: "partidos" as CupsTabId, label: "Resultados", href: "/fixture" },
    { id: "estadisticas" as CupsTabId, label: "Estadísticas", href: "/estadisticas" },
    { id: "equipos" as CupsTabId, label: "Equipos", href: "/clubes" },
  ],
} as const;

/** Devuelve el formato correspondiente a la temporada elegida. */
export function getCopaApaSeasonFormat(season: string): CopaApaSeasonFormat {
  const formats = COPA_APA_CONFIG.formatsBySeason as Record<string, CopaApaSeasonFormat>;
  return formats[season] || formats[COPA_APA_CONFIG.defaultSeason];
}
