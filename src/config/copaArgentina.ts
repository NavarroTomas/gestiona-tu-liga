import type { CupsTabId } from "./cups";
import type { KnockoutRoundId } from "@/lib/cups/knockout";

export type KnockoutSeasonFormat = {
  rounds: readonly KnockoutRoundId[];
  showThirdPlace: boolean;
};

export const COPA_ARGENTINA_CONFIG = {
  competitionKey: "copa_argentina",
  activationField: "copa_argentina_activa",
  configTable: "configuracion_copas",

  defaultSeason: "Temporada 4",
  seasons: ["Temporada 4"],

  hero: {
    title: "Copa Argentina",
    subtitle: "Eliminación directa",
    image: "/themes/worldcup/backgrounds/FotoCancha.png",
    alt: "Cancha de Pro Soccer Online",
  },

  formatsBySeason: {
    "Temporada 4": {
      rounds: ["quarterfinals", "semifinals", "final"],
      showThirdPlace: false,
    },
  } satisfies Record<string, KnockoutSeasonFormat>,

  phaseKeywords: {
    roundOf16: ["octavos", "8vos", "octavo"],
    quarter: ["cuartos", "4tos", "cuarto"],
    semifinal: ["semifinal", "semi"],
    final: ["final"],
    thirdPlace: ["tercer", "3er", "3.º", "3°"],
  },

  tabs: [
    { id: "grupos" as CupsTabId, label: "Cuadro", href: "/competicion/copa-argentina" },
    { id: "partidos" as CupsTabId, label: "Resultados", href: "/fixture" },
    { id: "equipos" as CupsTabId, label: "Equipos", href: "/clubes" },
  ],
} as const;

export function getCopaArgentinaSeasonFormat(season: string): KnockoutSeasonFormat {
  const formats = COPA_ARGENTINA_CONFIG.formatsBySeason as Record<string, KnockoutSeasonFormat>;
  return formats[season] || formats[COPA_ARGENTINA_CONFIG.defaultSeason];
}
