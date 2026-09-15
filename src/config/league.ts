export type LeagueTabId = "resumen" | "tabla" | "partidos" | "estadisticas" | "equipos";

/**
 * CONFIGURACIÓN CENTRAL DEL TORNEO DE LIGA
 * ----------------------------------------
 * Este archivo concentra los cambios normales de Liga para que no tengas que
 * entrar a los componentes visuales ni a las consultas de Supabase.
 */
export const LEAGUE_CONFIG = {
  defaultSeason: "Temporada 4",
  seasons: ["Temporada 4"],

  defaultDivision: "Primera",
  divisions: ["Primera", "Segunda"],

  hero: {
    title: "Torneo de Liga APA",
    image: "/themes/worldcup/backgrounds/FotoCancha.png",
    alt: "Cancha de Pro Soccer Online",
  },

  // La navegación pública solo muestra secciones que existen realmente.
  tabs: [
    { id: "tabla" as LeagueTabId, label: "Tabla", href: "/divisiones" },
    { id: "partidos" as LeagueTabId, label: "Partidos", href: "/fixture" },
    { id: "equipos" as LeagueTabId, label: "Equipos", href: "/clubes" },
  ],

  footer: {
    brand: "PSO Argentina",
    slogan: "El fútbol virtual también nos une.",
    links: [
      { label: "Contacto", href: "/contacto" },
      { label: "Términos", href: "/terminos" },
      { label: "Privacidad", href: "/privacidad" },
      { label: "Redes", href: "/" },
    ],
  },
} as const;
