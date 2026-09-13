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

export type DreamTeamPlayerType = "delantero" | "medio" | "defensa" | "arquero";

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
  competicion?: DreamTeamCompetition | string | null;
  fase?: string | null;
  grupo?: string | null;
  fecha: string | number;
  posicion: DreamTeamPositionId | string;
  playerId?: string | null;
  nombre: string;
  equipo: string;
  usuario?: string | null;
  fecha_voto?: string | null;
};

export type DreamTeamVoteLeader = {
  posicion?: DreamTeamPositionId | string;
  playerId?: string | null;
  nombre: string;
  equipo: string;
  votos: number;
};

export type DreamTeamContext = {
  temporada: string;
  competicion: DreamTeamCompetition;
  division: string;
  grupo: string;
  fase: string;
  fecha: string;
};

export type DreamTeamMatch = {
  partido_id?: string | number | null;
  local?: string | null;
  visitante?: string | null;
  fecha?: string | number | null;
};

export type DreamTeamRawPlayerStat = {
  nombre?: string | null;
  playerId?: string | null;
  equipo?: string | null;
  posicion?: string | null;
  goals?: number | string | null;
  assists?: number | string | null;
  overallRating?: number | string | null;
  rating_apa?: number | string | null;
  gKSaves?: number | string | null;
  gKSAVES?: number | string | null;
  GKSaves?: number | string | null;
  gksaves?: number | string | null;
  score?: number | string | null;
  mvp?: number | string | null;
};

export type DreamTeamLogos = Record<string, string>;
export type DreamTeamProfiles = Record<string, DreamTeamProfile>;
export type DreamTeamByPosition = Partial<Record<DreamTeamPositionId, DreamTeamVoteLeader>>;
export type UserDreamTeam = Partial<Record<DreamTeamPositionId, DreamTeamVote>>;
