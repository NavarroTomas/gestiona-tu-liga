export type LeagueTabId = "resumen" | "tabla" | "partidos" | "estadisticas" | "equipos";

/**
 * CONFIGURACIÓN CENTRAL DEL TORNEO DE LIGA
 * ----------------------------------------
 * Este archivo concentra los cambios normales de Liga para que no tengas que
 * entrar a los componentes visuales ni a las consultas de Supabase.
 *
 * CAMBIOS HABITUALES
 *
 * 1) AGREGAR UNA TEMPORADA
 *    seasons: ["Temporada 5", "Temporada 4"]
 *    defaultSeason: "Temporada 5"
 *
 *    El selector toma estas opciones automáticamente. Los valores tienen que
 *    coincidir con `temporada` en Supabase para que aparezcan datos reales.
 *
 * 2) AGREGAR O CAMBIAR DIVISIONES
 *    divisions: ["Primera", "Segunda", "Tercera"]
 *    defaultDivision: "Primera"
 *
 *    El nombre debe coincidir con los datos de Supabase. Si una división nueva
 *    necesita reglas deportivas distintas, eso ya corresponde a la lógica de
 *    `src/lib/league/` y no a este config.
 *
 * 3) CAMBIAR EL HERO
 *    hero.title -> título visible
 *    hero.image -> ruta de una imagen dentro de /public
 *    hero.alt   -> texto alternativo de accesibilidad
 *
 * 4) CAMBIAR LAS PESTAÑAS
 *    Editá `tabs`. `label` es el texto visible y `href` la ruta a la que lleva.
 *    No hace falta modificar `LeagueTabs.tsx` para agregar/cambiar enlaces.
 *
 * 5) CAMBIAR EL FOOTER DE ESTA SECCIÓN
 *    Editá `footer.brand`, `footer.slogan` o el array `footer.links`.
 *
 * DÓNDE TOCAR SI EL CAMBIO NO ES CONFIGURACIÓN
 * - consultas / datos de partidos: `src/hooks/useLeagueMatches.ts`
 * - datos de clasificación:         `src/hooks/useLeagueStandings.ts`
 * - cálculo de puntos y posiciones: `src/lib/league/calculateStandings.ts`
 * - utilidades y reglas auxiliares:  `src/lib/league/utils.ts`
 * - aspecto de la tabla:             `src/components/league/LeagueStandingsTable.tsx`
 * - página que ensambla todo:        `src/app/divisiones/page.tsx`
 *
 * REGLA: si solo querés cambiar temporada, división, textos, imagen o links,
 * debería alcanzar con editar ESTE archivo.
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

  tabs: [
    { id: "resumen" as LeagueTabId, label: "Resumen", href: "/divisiones" },
    { id: "tabla" as LeagueTabId, label: "Tabla", href: "/divisiones" },
    { id: "partidos" as LeagueTabId, label: "Partidos", href: "/fixture" },
    { id: "estadisticas" as LeagueTabId, label: "Estadísticas", href: "/estadisticas" },
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
