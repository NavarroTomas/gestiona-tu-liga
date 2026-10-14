import type { CupsTabId } from "./cups";
import type { KnockoutRoundId } from "@/lib/cups/knockout";

export type CopaApaSeasonFormat = {
  rounds: readonly KnockoutRoundId[];
  showThirdPlace: boolean;
};

export const COPA_APA_CONFIG = {
  competitionKey: "copa_apa",
  activationField: "copa_apa_activa",
  configTable: "configuracion_copas",

  defaultSeason: "Temporada 4",
  seasons: ["Temporada 4"],

  hero: {
    title: "Copa de la Liga",
    subtitle: "Eliminación directa",
    image: "/themes/worldcup/backgrounds/FotoCancha.png",
    alt: "Cancha de Pro Soccer Online",
  },

  formatsBySeason: {
    "Temporada 4": {
      rounds: ["quarterfinals", "semifinals", "final"],
      showThirdPlace: false,
    },
  } satisfies Record<string, CopaApaSeasonFormat>,

  phaseKeywords: {
    roundOf16: ["octavos", "8vos", "octavo"],
    quarter: ["cuartos", "4tos", "cuarto"],
    semifinal: ["semifinal", "semi"],
    final: ["final"],
    thirdPlace: ["tercer", "3er", "3.º", "3°"],
  },

  tabs: [
    { id: "grupos" as CupsTabId, label: "Cuadro", href: "/competicion/copa-apa" },
    { id: "partidos" as CupsTabId, label: "Resultados", href: "/fixture" },
    { id: "equipos" as CupsTabId, label: "Equipos", href: "/clubes" },
  ],
} as const;

export function getCopaApaSeasonFormat(season: string): CopaApaSeasonFormat {
  const formats = COPA_APA_CONFIG.formatsBySeason as Record<string, CopaApaSeasonFormat>;
  return formats[season] || formats[COPA_APA_CONFIG.defaultSeason];
}
