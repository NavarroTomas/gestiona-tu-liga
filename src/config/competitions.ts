export type CompetitionId =
  | "liga"
  | "clasificacion-copas"
  | "copa-argentina"
  | "copa-apa"
  | "playoffs-ascenso"
  | "copa-campeones"
  | (string & {});

export type CompetitionDefinition = {
  id: CompetitionId;
  titulo: string;
  subtitulo: string;
  href: string;
  enabled: boolean;
};

/**
 * Fuente única del menú de competiciones.
 *
 * Para agregar una competición nueva al menú:
 * 1. agregá un objeto a este array;
 * 2. creá la página indicada en `href`;
 * 3. dejá `enabled: true` cuando quieras mostrarla.
 */
export const COMPETITIONS: CompetitionDefinition[] = [
  {
    id: "liga",
    titulo: "Torneo de Liga",
    subtitulo: "Primera y Segunda",
    href: "/divisiones",
    enabled: true,
  },
  {
    id: "clasificacion-copas",
    titulo: "Clasificación a Copas",
    subtitulo: "Fase de grupos",
    href: "/competicion/copas",
    enabled: true,
  },
  {
    id: "copa-argentina",
    titulo: "Copa Argentina",
    subtitulo: "Cuartos de final",
    href: "/competicion/copa-argentina",
    enabled: true,
  },
  {
    id: "copa-apa",
    titulo: "Copa APA",
    subtitulo: "En juego",
    href: "/competicion/copa-apa",
    enabled: true,
  },
  {
    id: "playoffs-ascenso",
    titulo: "Playoffs de Ascenso",
    subtitulo: "Próximamente",
    href: "/competicion/playoffs",
    enabled: true,
  },
  {
    id: "copa-campeones",
    titulo: "Copa de Campeones",
    subtitulo: "Próximamente",
    href: "/competicion/copa-campeones",
    enabled: true,
  },
];

export const COMPETITION_LANDING_CONFIG = {
  temporada: "Temporada 4",
  titulo: "Competición Oficial",
  heroImage: "/images/competicion/fondo_principal.png",
  heroAlt: "Estadio vacío de Pro Soccer Online visto desde el córner",
  footer: {
    marca: "PSO ARGENTINA",
    descripcion: "Liga oficial de Pro Soccer Online",
    copyright: "© 2026 APA PSO ARGENTINA",
    enlaces: [
      { label: "Privacidad", href: "/privacidad" },
      { label: "Términos", href: "/terminos" },
      { label: "Cookies", href: "/cookies" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
} as const;

export function getEnabledCompetitions() {
  return COMPETITIONS.filter((competition) => competition.enabled);
}
