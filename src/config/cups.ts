export type CupsTabId = "grupos" | "partidos" | "equipos";

/**
 * CONFIGURACIÓN CENTRAL DE "CLASIFICACIÓN A COPAS"
 * -------------------------------------------------
 * Este archivo está pensado para que puedas cambiar la competición sin tocar
 * los componentes visuales ni la lógica de Supabase.
 *
 * EJEMPLOS RÁPIDOS:
 *
 * 1) Agregar una temporada nueva:
 *    seasons: ["Temporada 5", "Temporada 4"]
 *    defaultSeason: "Temporada 5"
 *
 * 2) Agregar un grupo nuevo:
 *    groups: ["A", "B", "C", "D", "E"]
 *
 * 3) Cambiar cuántos equipos van a Copa Argentina:
 *    qualification.copaArgentinaPlaces: 3
 *    Con eso 1°, 2° y 3° irían a Copa Argentina y desde el 4° a Copa APA.
 *
 * 4) Cambiar el fondo del hero:
 *    hero.image: "/ruta/de/tu-imagen.png"
 *
 * IMPORTANTE:
 * `competitionKey` y `phaseKey` deben coincidir con los valores guardados en
 * la tabla `partidos` de Supabase. Si solo querés cambiar textos o diseño,
 * normalmente NO hace falta tocarlos.
 */
export const CUPS_CONFIG = {
  competitionKey: "copa_clasificatoria",
  phaseKey: "grupos",

  defaultSeason: "Temporada 4",
  seasons: ["Temporada 4"],

  defaultGroup: "A",
  groups: ["A", "B", "C", "D"],

  hero: {
    title: "Clasificación a Copas",
    subtitle: "Fase de Grupos",
    image: "/themes/worldcup/backgrounds/FotoCancha.png",
    alt: "Cancha de Pro Soccer Online",
  },

  qualification: {
    // Los primeros N puestos van a Copa Argentina. El resto va a Copa APA.
    copaArgentinaPlaces: 2,
    copaArgentinaLabel: "Copa Argentina",
    copaApaLabel: "Copa de la Liga",
  },

  tabs: [
    { id: "grupos" as CupsTabId, label: "Grupos", href: "/competicion/copas" },
    { id: "partidos" as CupsTabId, label: "Partidos", href: "/fixture" },
    { id: "equipos" as CupsTabId, label: "Equipos", href: "/clubes" },
  ],
} as const;

export type CupDestination = "argentina" | "apa";

/**
 * Regla de destino centralizada. Si en otra temporada cambia el formato,
 * este es el único lugar donde deberías modificar la regla general.
 */
export function getCupDestination(position: number): CupDestination {
  return position <= CUPS_CONFIG.qualification.copaArgentinaPlaces ? "argentina" : "apa";
}
