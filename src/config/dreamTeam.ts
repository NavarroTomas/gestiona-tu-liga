import type { DreamTeamCompetition, DreamTeamPosition } from "@/lib/dream-team/types";

/**
 * Configuración editable de Dream Team.
 *
 * Para una temporada nueva normalmente alcanza con:
 * 1. agregarla a seasons,
 * 2. cambiar defaultSeason si corresponde,
 * 3. mantener acá las competiciones/fases habilitadas.
 *
 * La página y el hook consumen esta configuración; no hace falta tocar la UI.
 */
export const DREAM_TEAM_CONFIG = {
  defaultSeason: "Temporada 4",
  seasons: ["Temporada 4"],
  defaultCompetition: "liga" as DreamTeamCompetition,
  defaultDivision: "Primera",
  divisions: ["Primera", "Segunda"],
  defaultGroup: "A",
  groups: ["A", "B", "C", "D"],
  defaultPhase: "Octavos",
  phases: ["Octavos", "Cuartos", "Semifinal", "Final"],
  championsPhases: ["Semifinal", "Final"],
  playoffsPhases: ["Semifinal", "Final Ascenso", "Promoción"],
  competitions: [
    { value: "liga", label: "Liga" },
    { value: "copa_clasificatoria", label: "Clasificación a Copas" },
    { value: "copa_argentina", label: "Copa Argentina" },
    { value: "copa_apa", label: "Copa APA" },
    { value: "copa_campeones", label: "Copa de Campeones" },
    { value: "playoffs", label: "Playoffs de Ascenso" },
  ] as const,
} as const;

/** Formación oficial 8v8 de APA. */
export const DREAM_TEAM_POSITIONS: DreamTeamPosition[] = [
  { id: "LST", type: "delantero", label: "Delantero izquierdo" },
  { id: "RST", type: "delantero", label: "Delantero derecho" },
  { id: "LCM", type: "medio", label: "Mediocampista izquierdo" },
  { id: "RCM", type: "medio", label: "Mediocampista derecho" },
  { id: "LB", type: "defensa", label: "Lateral izquierdo" },
  { id: "CB", type: "defensa", label: "Defensor central" },
  { id: "RB", type: "defensa", label: "Lateral derecho" },
  { id: "GK", type: "arquero", label: "Arquero" },
];
