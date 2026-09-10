import type { CupsTabId } from "./cups";
import type { KnockoutRoundId } from "@/lib/cups/knockout";

export type KnockoutSeasonFormat = {
  rounds: readonly KnockoutRoundId[];
  showThirdPlace: boolean;
};

/**
 * CONFIGURACIÓN CENTRAL DE COPA ARGENTINA
 * ---------------------------------------
 * Este es el archivo que deberías tocar para la mayoría de cambios futuros.
 * La página y el bracket leen estos valores automáticamente.
 *
 * IMPORTANTE: el FORMATO ahora se define POR TEMPORADA.
 * Eso permite que una temporada empiece en Cuartos y otra en Octavos sin
 * duplicar páginas ni tocar el componente visual.
 *
 * EJEMPLOS:
 *
 * 1) TEMPORADA 4: Cuartos -> Semifinales -> Final
 *    "Temporada 4": {
 *      rounds: ["quarterfinals", "semifinals", "final"],
 *      showThirdPlace: false,
 *    }
 *
 * 2) TEMPORADA 5: Octavos -> Cuartos -> Semifinales -> Final
 *    Primero agregá "Temporada 5" a `seasons` y después:
 *    "Temporada 5": {
 *      rounds: ["roundOf16", "quarterfinals", "semifinals", "final"],
 *      showThirdPlace: false,
 *    }
 *
 * 3) Si alguna temporada empezara directamente en Semifinales:
 *    rounds: ["semifinals", "final"]
 *
 * 4) CAMBIAR EL HERO
 *    hero.title    -> título principal
 *    hero.subtitle -> subtítulo
 *    hero.image    -> imagen dentro de /public
 *
 * 5) CAMBIAR CÓMO SE LLAMAN LAS FASES EN SUPABASE
 *    Agregá palabras a `phaseKeywords`. No hace falta que la ronda esté
 *    visible en todas las temporadas para que la lógica pueda reconocerla.
 *
 * 6) AGREGAR/QUITAR TABS
 *    Modificá el array `tabs` de abajo. El componente se actualiza solo.
 *
 * IMPORTANTE:
 * `competitionKey`, `configTable` y `activationField` deben coincidir con
 * Supabase. Si solo querés cambiar textos/diseño, no hace falta tocarlos.
 */
export const COPA_ARGENTINA_CONFIG = {
  competitionKey: "copa_argentina",
  activationField: "copa_argentina_activa",
  configTable: "configuracion_copas",

  defaultSeason: "Temporada 4",
  seasons: ["Temporada 4"],

  hero: {
    title: "Copa Argentina",
    subtitle: "Eliminación directa",
    image: "/themes/worldcup/backgrounds/FotoCancha.png",
    alt: "Cancha de Pro Soccer Online",
  },

  /**
   * Formato visual/deportivo de cada temporada.
   * Para cambiar el formato NO edites KnockoutBracket.tsx: hacelo acá.
   */
  formatsBySeason: {
    "Temporada 4": {
      rounds: ["quarterfinals", "semifinals", "final"],
      showThirdPlace: false,
    },
  } satisfies Record<string, KnockoutSeasonFormat>,

  /**
   * El bracket reconoce cualquiera de estas palabras dentro de `fase` o
   * `ronda` en la tabla partidos. Podés sumar variantes sin tocar la lógica.
   */
  phaseKeywords: {
    roundOf16: ["octavos", "8vos", "octavo"],
    quarter: ["cuartos", "4tos", "cuarto"],
    semifinal: ["semifinal", "semi"],
    final: ["final"],
    thirdPlace: ["tercer", "3er", "3.º", "3°"],
  },

  tabs: [
    { id: "resumen" as CupsTabId, label: "Resumen", href: "/competicion/copa-argentina" },
    { id: "grupos" as CupsTabId, label: "Cuadro", href: "/competicion/copa-argentina" },
    { id: "partidos" as CupsTabId, label: "Resultados", href: "/fixture" },
    { id: "estadisticas" as CupsTabId, label: "Estadísticas", href: "/estadisticas" },
    { id: "equipos" as CupsTabId, label: "Equipos", href: "/clubes" },
  ],
} as const;

/**
 * Devuelve el formato de la temporada seleccionada.
 * Si agregás una temporada a `seasons`, agregale también su entrada arriba.
 * Como respaldo, usa el formato de la temporada por defecto.
 */
export function getCopaArgentinaSeasonFormat(season: string): KnockoutSeasonFormat {
  const formats = COPA_ARGENTINA_CONFIG.formatsBySeason as Record<string, KnockoutSeasonFormat>;
  return formats[season] || formats[COPA_ARGENTINA_CONFIG.defaultSeason];
}
