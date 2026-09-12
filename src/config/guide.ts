export type GuideItem = {
  title: string;
  description: string;
  href?: string;
  points?: string[];
};

export type GuideSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  tone?: "light" | "blue";
  items: GuideItem[];
};

/**
 * Contenido central de /guia.
 *
 * La guía está pensada como orientación para usuarios, no como documentación
 * técnica completa. Por eso los textos son cortos y la información más
 * específica se mantiene dentro de cada sección de la plataforma.
 */
export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "primeros-pasos",
    eyebrow: "Primeros pasos",
    title: "Configurá tu identidad APA",
    description:
      "Para que perfiles, estadísticas y premios funcionen correctamente hay tres datos que tienen que estar bien cargados.",
    items: [
      {
        title: "SteamID64",
        description: "Usá el número de Steam, no un link ni el nombre del perfil.",
        points: [
          "Debe ser el identificador numérico completo.",
          "Si cambia tu nombre de Steam, el ID sigue siendo el mismo.",
        ],
      },
      {
        title: "Discord User ID",
        description: "APA lo usa para verificaciones e integraciones con Discord.",
        points: [
          "Activá Modo Desarrollador en Discord.",
          "Copiá el ID numérico de tu usuario.",
        ],
      },
      {
        title: "PlayerId",
        description: "Es la referencia deportiva principal dentro de APA.",
        points: [
          "Une tus partidos, rankings, premios e historial.",
          "Tus estadísticas continúan aunque cambies de club.",
        ],
      },
    ],
  },
  {
    id: "competicion",
    eyebrow: "Competición",
    title: "Seguí la temporada desde un solo lugar",
    description:
      "Liga, copas y calendario comparten la misma estructura para que puedas pasar de una competencia a otra sin perder contexto.",
    tone: "blue",
    items: [
      {
        title: "Competición",
        description: "Entrá a Liga, Clasificación a Copas, Copa Argentina, Copa APA y el resto de los torneos oficiales.",
        href: "/competicion",
        points: [
          "Primero elegís competencia.",
          "Después elegís división, grupo o fase según corresponda.",
        ],
      },
      {
        title: "Fixture",
        description: "Consultá el calendario, resultados y partidos del día de cualquier competencia.",
        href: "/fixture",
        points: [
          "Podés filtrar por temporada, torneo y equipo.",
          "Los resultados cargados quedan conectados con el Match Center.",
        ],
      },
      {
        title: "Historia",
        description: "Revisá temporadas anteriores, tablas finales, campeones, premios y récords.",
        href: "/historia",
        points: [
          "Cada temporada se consulta de forma independiente.",
          "Los datos se construyen desde registros oficiales de APA.",
        ],
      },
    ],
  },
  {
    id: "clubes-jugadores",
    eyebrow: "Clubes y jugadores",
    title: "Encontrá equipos, planteles y rendimiento",
    description:
      "Estas tres zonas trabajan juntas y usan los mismos clubes y jugadores para mantener toda la información conectada.",
    items: [
      {
        title: "Clubes",
        description: "Directorio de instituciones con su situación competitiva y acceso al perfil de cada equipo.",
        href: "/clubes",
        points: [
          "Los clubes se filtran por temporada y división.",
          "Nombre y escudo llevan al perfil estadístico del equipo.",
        ],
      },
      {
        title: "Plantillas",
        description: "Consultá quién integra cada club y las estadísticas principales de sus jugadores.",
        href: "/plantillas",
        points: [
          "Podés cambiar temporada, división y club.",
          "Cada jugador con PlayerId abre su perfil individual.",
        ],
      },
      {
        title: "Jugadores",
        description: "Rankings oficiales de goles, asistencias, MVP, rating y otras métricas.",
        href: "/jugadores",
        points: [
          "Los rankings se agrupan por PlayerId.",
          "El club actual no borra el historial del jugador.",
        ],
      },
    ],
  },
  {
    id: "comunidad",
    eyebrow: "Comunidad",
    title: "Participá más allá de los partidos",
    description:
      "APA también reúne herramientas de participación, mercado y reconocimientos sin mezclarlas con la navegación competitiva principal.",
    tone: "blue",
    items: [
      {
        title: "Mercado de pases",
        description: "Seguí movimientos de jugadores y cambios de club.",
        href: "/mercado",
      },
      {
        title: "Predicciones",
        description: "Pronosticá partidos pendientes y competí en el ranking de usuarios.",
        href: "/entretenimiento/predicciones",
      },
      {
        title: "Dream Team",
        description: "Votá el equipo ideal de cada fecha usando jugadores habilitados para ese contexto.",
        href: "/entretenimiento/dream-team",
      },
      {
        title: "Premios APA",
        description: "Consultá reconocimientos de fecha y premios oficiales de temporada.",
        href: "/entretenimiento/premios",
      },
    ],
  },
];

export const GUIDE_FAQ = [
  {
    question: "¿Por qué no aparezco en rankings o estadísticas?",
    answer:
      "Puede faltar un partido cargado, un PlayerId correcto o la vinculación de tu perfil con ese PlayerId.",
  },
  {
    question: "¿Qué pasa si cambio de club?",
    answer:
      "Tus estadísticas no se reinician. El historial pertenece al PlayerId; solamente cambia tu equipo actual.",
  },
  {
    question: "¿Dónde veo las estadísticas de un equipo?",
    answer:
      "Podés entrar desde Clubes o tocar el nombre o escudo del equipo en tablas, fixture y otras zonas del sitio.",
  },
  {
    question: "¿Dónde veo las estadísticas de un partido?",
    answer:
      "Desde Fixture podés seleccionar el encuentro y abrir sus detalles cuando el partido tenga datos cargados.",
  },
  {
    question: "¿Cómo se organiza una temporada?",
    answer:
      "La estructura base es Temporada, Competición y luego División, Grupo o Fase según el torneo elegido.",
  },
  {
    question: "¿Qué dato identifica realmente a un jugador?",
    answer:
      "El PlayerId. Los nombres pueden cambiar, pero el PlayerId es la referencia estable para estadísticas e historial.",
  },
];
