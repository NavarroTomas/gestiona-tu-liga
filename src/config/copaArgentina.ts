import type { CupsTabId } from "./cups";

/**
 * CONFIGURACIÓN CENTRAL DE COPA ARGENTINA
 * ---------------------------------------
 * La idea de este archivo es que puedas cambiar datos normales de la copa
 * sin tocar componentes visuales ni consultas repartidas por la página.
 *
 * COSAS QUE PODÉS CAMBIAR ACÁ:
 *
 * 1) Agregar una temporada:
 *    seasons: ["Temporada 5", "Temporada 4"]
 *    defaultSeason: "Temporada 5"
 *
 * 2) Cambiar el título/subtítulo o el fondo del hero:
 *    hero.title / hero.subtitle / hero.image
 *
 * 3) Si en Supabase cambia el nombre de la competición:
 *    competitionKey: "nuevo_valor"
 *
 * 4) Si cambia cómo se llama una fase en Supabase, agregá una palabra clave
 *    dentro de `phaseKeywords`. Ejemplo: quarter: ["cuartos", "8vos"]
 *
 * IMPORTANTE:
 * `activationField` corresponde a la columna de `configuracion_copas` que
 * habilita esta competición. No la cambies salvo que también cambie la BD.
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

  phaseKeywords: {
    quarter: ["cuartos"],
    semifinal: ["semifinal", "semi"],
    final: ["final"],
    thirdPlace: ["tercer", "3er", "3.º", "3°"],
  },

  showThirdPlace: true,

  tabs: [
    { id: "resumen" as CupsTabId, label: "Resumen", href: "/competicion/copa-argentina" },
    { id: "grupos" as CupsTabId, label: "Cuadro", href: "/competicion/copa-argentina" },
    { id: "partidos" as CupsTabId, label: "Partidos", href: "/fixture" },
    { id: "estadisticas" as CupsTabId, label: "Estadísticas", href: "/estadisticas" },
    { id: "equipos" as CupsTabId, label: "Equipos", href: "/clubes" },
  ],
} as const;
