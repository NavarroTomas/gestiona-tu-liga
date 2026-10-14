import type { KnockoutRoundId } from "@/lib/cups/knockout";

export type CopaCampeonesSeasonFormat = {
  rounds: readonly KnockoutRoundId[];
  showThirdPlace: boolean;
};

export const COPA_CAMPEONES_CONFIG = {
  competitionKey: "copa_campeones",

  defaultSeason: "Temporada 4",
  seasons: ["Temporada 4"],

  hero: {
    title: "Copa de Campeones",
    subtitle: "Los campeones del torneo",
    image: "/themes/worldcup/backgrounds/FotoCancha.png",
    alt: "Copa de Campeones Liga",
  },

  formatsBySeason: {
    "Temporada 4": {
      rounds: ["semifinals", "final"],
      showThirdPlace: false,
    },
  } satisfies Record<string, CopaCampeonesSeasonFormat>,

  placeholderMatchups: {
    semifinals: [
      ["Campeón Primera División", "Campeón Copa de la Liga"],
      ["Campeón Segunda División", "Campeón Copa Argentina"],
    ],
    final: ["Ganador SF1", "Ganador SF2"],
  },

  phaseKeywords: {
    roundOf16: ["octavos", "8vos", "octavo"],
    quarter: ["cuartos", "4tos", "cuarto"],
    semifinal: ["semifinal", "semi"],
    final: ["final"],
    thirdPlace: ["tercer", "3er", "3.º", "3°"],
  },

  tabs: [
    { id: "cuadro", label: "Cuadro", href: "/competicion/copa-campeones" },
    { id: "resultados", label: "Resultados", href: "/fixture" },
    { id: "equipos", label: "Equipos", href: "/clubes" },
  ],
} as const;

export function getCopaCampeonesSeasonFormat(season: string): CopaCampeonesSeasonFormat {
  const formats = COPA_CAMPEONES_CONFIG.formatsBySeason as Record<string, CopaCampeonesSeasonFormat>;
  return formats[season] || formats[COPA_CAMPEONES_CONFIG.defaultSeason];
}
