export type DreamTeamCompetition =
  | "liga"
  | "copa_clasificatoria"
  | "copa_argentina"
  | "copa_apa"
  | "copa_campeones"
  | "playoffs";

export type DreamTeamPositionId =
  | "LST"
  | "RST"
  | "LCM"
  | "RCM"
  | "LB"
  | "CB"
  | "RB"
  | "GK";

export type DreamTeamPositionType =
  | "delantero"
  | "medio"
  | "defensa"
  | "arquero";

export type DreamTeamPosition = {
  id: DreamTeamPositionId;
  type: DreamTeamPositionType;
  label: string;
};

export type DreamTeamPlayer = {
  nombre: string;
  playerId: string;
  equipo: string;
  posicion: string;
  partidos: number;
  goles: number;
  asistencias: number;
  rating: number;
  rating_apa: number;
  atajadas: number;
  score: number;
  mvps: number;
};

export type DreamTeamProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  playerid?: string | null;
  avatar_url?: string | null;
};

export type DreamTeamVote = {
  id?: string;
  temporada: string;
  division: string;
  competicion?: DreamTeamCompetition | null;
  fase?: string | null;
  grupo?: string | null;
  fecha: string;
  posicion: DreamTeamPositionId;
  playerId?: string | null;
  nombre: string;
  equipo: string;
  usuario: string;
  fecha_voto?: string | null;
};

export type DreamTeamVoteSummary = {
  posicion?: DreamTeamPositionId;
  playerId?: string | null;
  nombre: string;
  equipo: string;
  votos: number;
};

export type DreamTeamProfilesMap = Record<string, DreamTeamProfile>;
export type DreamTeamLogosMap = Record<string, string>;
export type DreamTeamSelectionMap = Partial<Record<DreamTeamPositionId, DreamTeamVote>>;
export type DreamTeamWinnersMap = Partial<Record<DreamTeamPositionId, DreamTeamVoteSummary>>;
