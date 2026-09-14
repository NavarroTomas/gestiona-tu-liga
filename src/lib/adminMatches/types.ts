export type MatchCompetition =
  | "liga"
  | "copa_clasificatoria"
  | "copa_argentina"
  | "copa_apa"
  | "copa_campeones"
  | "playoffs";

export type AdminMatch = {
  id: string | number;
  partido_id?: string | null;
  local: string;
  visitante: string;
  resultado?: string | null;
  fecha?: string | number | null;
  temporada: string;
  division?: string | null;
  competicion?: string | null;
  grupo?: string | null;
  fase?: string | null;
  ronda?: string | null;
  dia?: string | null;
  hora?: string | null;
  estado?: string | null;
  scheduled_at?: string | null;
};

export type TeamMatchStats = {
  equipo: string;
  passes?: number;
  keyPasses?: number;
  assists?: number;
  shots?: number;
  shotsOnTarget?: number;
  goals?: number;
  tackles?: number;
  keyTackles?: number;
  interceptions?: number;
  keyInterceptions?: number;
  possession?: number;
  possessionsLost?: number;
  fouls?: number;
  offsides?: number;
  handballs?: number;
  setPieceTimeouts?: number;
  freeKicks?: number;
  penalties?: number;
  goalKicks?: number;
  cornerKicks?: number;
  throwIns?: number;
  yellowCards?: number;
  redCards?: number;
};

export type PlayerMatchStats = {
  nombre: string;
  playerId?: string;
  posicion?: string;
  equipo: string;
  passes?: number;
  keyPasses?: number;
  assists?: number;
  shots?: number;
  shotsOnTarget?: number;
  goals?: number;
  tackles?: number;
  keyTackles?: number;
  interceptions?: number;
  keyInterceptions?: number;
  possessionsLost?: number;
  gKSaves?: number;
  gKCatches?: number;
  overallRating?: number;
  score?: number;
  mvp?: number;
  rating_apa?: number;
};

export type MatchTxtSegmentInput = {
  archivo_nombre: string;
  archivo_hash: string;
  orden_txt: "normal" | "invertido";
  duracion_minutos?: number | null;
  goles_local?: number;
  goles_visitante?: number;
  payload: unknown;
};

export type PlayerAliasInput = {
  alias_player_id: string;
  canonical_player_id: string;
  canonical_name?: string | null;
  source_player_name?: string | null;
  equipo?: string | null;
};

export type CommitMatchInput = {
  match: AdminMatch;
  matchId: string;
  resultado: string;
  temporada: string;
  division: string;
  fecha: string;
  competicion: string;
  grupo?: string | null;
  fase?: string | null;
  teamStats: TeamMatchStats[];
  playerStats: PlayerMatchStats[];
  segments?: MatchTxtSegmentInput[] | null;
  aliases?: PlayerAliasInput[];
  source: "txt" | "manual" | "correction";
  reason?: string;
};

export type MatchRevision = {
  id: string;
  partido_row_id: number;
  partido_id: string | null;
  revision_number: number;
  source: "txt" | "manual" | "correction" | "annulment";
  reason: string | null;
  snapshot_before: unknown;
  snapshot_after: unknown;
  created_by: string | null;
  created_at: string;
};
