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
 * CONFIGURACIÓN GENERAL DE LA ZONA COMPETICIÓN
 * ---------------------------------------------
 * Este archivo controla la PORTADA / MENÚ que reúne todas las competiciones.
 * No define las reglas internas de Liga, Copas o Playoffs: cada torneo tiene
 * su propio archivo de configuración dentro de `src/config/`.
 *
 * AGREGAR UNA COMPETICIÓN NUEVA
 * 1. agregá un objeto a `COMPETITIONS`;
 * 2. usá un `id` único;
 * 3. indicá la ruta en `href`;
 * 4. creá esa página dentro de `src/app/`;
 * 5. usá `enabled: true` cuando quieras mostrarla en el selector.
 *
 * Ejemplo:
 * {
 *   id: "supercopa",
 *   titulo: "Supercopa APA",
 *   subtitulo: "Campeones de la temporada",
 *   href: "/competicion/supercopa",
 *   enabled: true,
 * }
 *
 * OCULTAR TEMPORALMENTE UNA COMPETICIÓN
 * Cambiá solamente:
 *   enabled: false
 * No hace falta borrar la página ni la configuración.
 *
 * CAMBIAR LA PORTADA DE /competicion
 * `COMPETITION_LANDING_CONFIG` controla temporada visible, título, imagen del
 * hero y contenido del footer de esa portada.
 *
 * DÓNDE CONFIGURAR CADA TORNEO
 * - Liga:                  `src/config/league.ts`
 * - Clasificación a Copas: `src/config/cups.ts`
 * - Copa Argentina:        `src/config/copaArgentina.ts`
 * - Copa APA:              `src/config/copaApa.ts`
 * - Playoffs de Ascenso:   `src/config/playoffs.ts`
 * - Copa de Campeones:     `src/config/copaCampeones.ts`
 *
 * IMPORTANTE: cambiar un subtítulo acá solo modifica el menú de competiciones;
 * no cambia el formato deportivo ni los datos del torneo correspondiente.
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
    titulo: "Copa de la Liga",
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

/**
 * Configuración visual/textual exclusiva de la portada `/competicion`.
 * Las imágenes se referencian desde `/public`, por eso la ruta empieza con `/`.
 */
export const COMPETITION_LANDING_CONFIG = {
  temporada: "Temporada 4",
  titulo: "Competición Oficial",
  heroImage: "/images/competicion/fondo_principal.png",
  heroAlt: "Estadio vacío de Pro Soccer Online visto desde el córner",
  footer: {
    marca: "PSO ARGENTINA",
    descripcion: "Liga oficial de Pro Soccer Online",
    copyright: "© 2026 Liga PSO ARGENTINA",
    enlaces: [
      { label: "Privacidad", href: "/privacidad" },
      { label: "Términos", href: "/terminos" },
      { label: "Cookies", href: "/cookies" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
} as const;

/** Devuelve únicamente las competiciones visibles en el selector público. */
export function getEnabledCompetitions() {
  return COMPETITIONS.filter((competition) => competition.enabled);
}
