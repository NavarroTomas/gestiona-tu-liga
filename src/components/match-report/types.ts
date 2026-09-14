export type EquipoStats = {
  id: number;
  partido_id: string;
  equipo: string;
  temporada: string;
  division: string;
  fecha: string;
  passes: number | null;
  keyPasses: number | null;
  assists: number | null;
  shots: number | null;
  shotsOnTarget: number | null;
  goals: number | null;
  tackles: number | null;
  keyTackles: number | null;
  interceptions: number | null;
  keyInterceptions: number | null;
  possession: number | null;
  possessionsLost: number | null;
  fouls: number | null;
  cornerKicks: number | null;
};

export type JugadorStats = {
  id: number;
  partido_id: string;
  nombre: string;
  playerId: string | null;
  posicion: string | null;
  equipo: string;
  temporada: string;
  division: string;
  fecha: string;
  passes: number | null;
  keyPasses: number | null;
  assists: number | null;
  shots: number | null;
  shotsOnTarget: number | null;
  goals: number | null;
  tackles: number | null;
  keyTackles: number | null;
  interceptions: number | null;
  keyInterceptions: number | null;
  possessionsLost: number | null;
  gKSaves: number | null;
  gKCatches: number | null;
  overallRating: number | string | null;
  score: number | null;
  mvp: number | null;
  rating_apa: number | string | null;
};

export type ClubInfo = {
  nombre: string;
  logo_url: string | null;
};

export type PartidoInfo = {
  id: number;
  partido_id: string;
  local: string;
  visitante: string;
  resultado: string | null;
  fecha: string | null;
  temporada: string | null;
  division: string | null;
  competicion: string | null;
  fase: string | null;
  grupo: string | null;
  dia: string | null;
  hora: string | null;
};
