import type {
  DreamTeamCompetition,
  DreamTeamPlayerType,
  DreamTeamPositionId,
} from "@/lib/dream-team/types";

/**
 * Configuración editable de Dream Team.
 *
 * Acá viven las opciones que cambian entre temporadas/formatos. La lógica de
 * Supabase está en `lib/dream-team/api.ts` y el estado de la pantalla en
 * `hooks/useDreamTeam.ts`.
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
  defaultDate: "1",
  maxCandidates: 40,
  formationLabel: "3 - 2 - 2",
} as const;

export const DREAM_TEAM_COMPETITIONS: Array<{
  value: DreamTeamCompetition;
  label: string;
}> = [
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa de la Liga" },
  { value: "copa_campeones", label: "Copa de Campeones" },
  { value: "playoffs", label: "Playoffs de Ascenso" },
];

export const DREAM_TEAM_PHASES = {
  standard: ["Octavos", "Cuartos", "Semifinal", "Final"],
  copa_campeones: ["Semifinal", "Final"],
  playoffs: ["Semifinal", "Final Ascenso", "Promoción"],
} as const;

export const DREAM_TEAM_POSITIONS: Array<{
  id: DreamTeamPositionId;
  type: DreamTeamPlayerType;
  label: string;
}> = [
  { id: "LST", type: "delantero", label: "Delantero izquierdo" },
  { id: "RST", type: "delantero", label: "Delantero derecho" },
  { id: "LCM", type: "medio", label: "Mediocampista izquierdo" },
  { id: "RCM", type: "medio", label: "Mediocampista derecho" },
  { id: "LB", type: "defensa", label: "Lateral izquierdo" },
  { id: "CB", type: "defensa", label: "Defensor central" },
  { id: "RB", type: "defensa", label: "Lateral derecho" },
  { id: "GK", type: "arquero", label: "Arquero" },
];

export function getDreamTeamCompetitionLabel(value: DreamTeamCompetition) {
  return DREAM_TEAM_COMPETITIONS.find((item) => item.value === value)?.label ?? "Competición";
}

export function getDreamTeamPhases(competition: DreamTeamCompetition): readonly string[] {
  if (competition === "copa_campeones") return DREAM_TEAM_PHASES.copa_campeones;
  if (competition === "playoffs") return DREAM_TEAM_PHASES.playoffs;
  return DREAM_TEAM_PHASES.standard;
}
