export type PredictionCompetition =
  | "liga"
  | "copa_clasificatoria"
  | "copa_argentina"
  | "copa_apa"
  | "copa_campeones"
  | "playoffs";

export type PredictionChoice = "local" | "empate" | "visitante";

export type PredictionContext = {
  id: string;
  label: string;
  short: string;
  competicion: PredictionCompetition;
  division?: string;
  divisionDb?: string;
  grupo?: string;
  fase?: string;
};

export type PredictionMatch = {
  id: number | string;
  partido_id?: string | null;
  local: string;
  visitante: string;
  resultado?: string | null;
  fecha?: string | number | null;
  temporada: string;
  division?: string | null;
  competicion?: string | null;
  fase?: string | null;
  grupo?: string | null;
  dia?: string | null;
  hora?: string | null;
  scheduled_at?: string | null;
};

export type PredictionVote = {
  id: number;
  partido_id: string;
  temporada: string;
  division?: string | null;
  local: string;
  visitante: string;
  prediccion: PredictionChoice;
  usuario: string;
  goles_local?: number | null;
  goles_visitante?: number | null;
  created_at?: string | null;
};

export type PredictionProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
};

export type PredictionScoreDraft = {
  local: string;
  visitante: string;
};

export type PredictionRankingRow = {
  usuario: string;
  puntos: number;
  exactos: number;
  aciertos: number;
  jugadas: number;
};
