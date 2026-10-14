export type EntertainmentExperienceId = "predicciones" | "dream-team" | "wordle" | "premios";

export type EntertainmentExperience = {
  id: EntertainmentExperienceId;
  title: string;
  kicker: string;
  description: string;
  href: string;
  cta: string;
  highlights: Array<{
    label: string;
    value: string;
  }>;
};

/**
 * Entrada modular a Entretenimiento.
 *
 * Para cambiar textos, accesos o sumar información breve de cada experiencia,
 * hacerlo acá. La composición y las animaciones viven en
 * `components/entertainment/EntertainmentPortal.tsx`.
 */
export const ENTERTAINMENT_EXPERIENCES: EntertainmentExperience[] = [
  {
    id: "predicciones",
    title: "Predicciones",
    kicker: "Pronosticá antes del partido",
    description:
      "Elegí tus resultados para los partidos oficiales y sumá puntos cuando se cargue el marcador definitivo.",
    href: "/entretenimiento/predicciones",
    cta: "Entrar a Predicciones",
    highlights: [
      { label: "Ganador", value: "+1 punto" },
      { label: "Marcador exacto", value: "+3 puntos" },
      { label: "Objetivo", value: "Ranking" },
    ],
  },
  {
    id: "dream-team",
    title: "Dream Team",
    kicker: "Armá el equipo ideal de la fecha",
    description:
      "Elegí a los ocho jugadores que formarían tu equipo ideal dentro del contexto competitivo habilitado.",
    href: "/entretenimiento/dream-team",
    cta: "Armar Dream Team",
    highlights: [
      { label: "Selección", value: "8 jugadores" },
      { label: "Posiciones", value: "Fijas" },
      { label: "Puntaje", value: "Por rendimiento" },
      { label: "Comparación", value: "Comunidad Liga" },
    ],
  },
  {
    id: "wordle",
    title: "Liga Wordle",
    kicker: "Una palabra nueva cada día",
    description:
      "Descubrí la palabra del día inspirada en la liga, los clubes, las posiciones, los torneos y la cultura de Liga.",
    href: "/entretenimiento/wordle",
    cta: "Jugar Liga Wordle",
    highlights: [
      { label: "Intentos", value: "6 por día" },
      { label: "Palabra", value: "Cambia diariamente" },
      { label: "Banco", value: "Preparado para +200" },
      { label: "Temática", value: "100% Liga" },
    ],
  },
  {
    id: "premios",
    title: "Premios Liga",
    kicker: "Reconocimientos de cada jornada",
    description:
      "Descubrí a los jugadores destacados a partir de los datos oficiales cargados en cada fecha de Liga.",
    href: "/entretenimiento/premios",
    cta: "Ver Premios Liga",
    highlights: [
      { label: "Figura", value: "MVP" },
      { label: "Rendimiento", value: "Estadísticas" },
      { label: "Origen", value: "Datos Liga" },
    ],
  },
];
