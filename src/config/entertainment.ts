export type EntertainmentExperienceId = "predicciones" | "dream-team" | "premios";

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
      { label: "Comparación", value: "Comunidad APA" },
    ],
  },
  {
    id: "premios",
    title: "Premios APA",
    kicker: "Reconocimientos de cada jornada",
    description:
      "Descubrí a los jugadores destacados a partir de los datos oficiales cargados en cada fecha de APA.",
    href: "/entretenimiento/premios",
    cta: "Ver Premios APA",
    highlights: [
      { label: "Figura", value: "MVP" },
      { label: "Rendimiento", value: "Estadísticas" },
      { label: "Origen", value: "Datos APA" },
    ],
  },
];
