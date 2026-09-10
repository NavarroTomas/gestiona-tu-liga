import type { CupsTabId } from "./cups";

/**
 * CONFIGURACIÓN CENTRAL DE COPA ARGENTINA
 * ---------------------------------------
 * Este es el archivo que deberías tocar para la mayoría de cambios futuros.
 * La página y el bracket leen estos valores automáticamente.
 *
 * COSAS QUE PODÉS CAMBIAR ACÁ:
 *
 * 1) AGREGAR UNA TEMPORADA NUEVA
 *    seasons: ["Temporada 5", "Temporada 4"]
 *    defaultSeason: "Temporada 5"
 *
 * 2) CAMBIAR EL HERO
 *    hero.title    -> título principal
 *    hero.subtitle -> subtítulo
 *    hero.image    -> imagen dentro de /public
 *
 * 3) CAMBIAR CÓMO SE LLAMAN LAS FASES EN SUPABASE
 *    Agregá palabras a `phaseKeywords`.
 *    Ejemplo: si guardás "8vos de final", ya está contemplado en roundOf16.
 *
 * 4) AGREGAR/QUITAR TABS
 *    Modificá el array `tabs` de abajo. El componente se actualiza solo.
 *
 * 5) TERCER PUESTO
 *    showThirdPlace: true lo habilita. Para el diseño actual lo dejamos false.
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

  showThirdPlace: false,

  tabs: [
    { id: "resumen" as CupsTabId, label: "Resumen", href: "/competicion/copa-argentina" },
    { id: "grupos" as CupsTabId, label: "Cuadro", href: "/competicion/copa-argentina" },
    { id: "partidos" as CupsTabId, label: "Resultados", href: "/fixture" },
    { id: "estadisticas" as CupsTabId, label: "Estadísticas", href: "/estadisticas" },
    { id: "equipos" as CupsTabId, label: "Equipos", href: "/clubes" },
  ],
} as const;
