export type LeagueTabId = "resumen" | "tabla" | "partidos" | "estadisticas" | "equipos";

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
