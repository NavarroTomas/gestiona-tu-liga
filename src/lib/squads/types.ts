export type SquadPlayer = {
  id: number;
  jugador: string;
  equipo: string;
  posicion?: string | null;
  estado?: string | null;
  temporada: string;
  division: string;
  playerid?: string | null;
  profile_id?: string | null;
};

export type SquadRankingRow = {
  temporada?: string | null;
  division?: string | null;
  playerId?: string | null;
  nombre?: string | null;
  equipo?: string | null;
  posicion?: string | null;
  partidos_jugados?: number | string | null;
  goals?: number | string | null;
  assists?: number | string | null;
  mvp?: number | string | null;
  rating_apa_promedio?: number | string | null;
};

export type SquadPublicProfile = {
  id?: string | null;
  playerid?: string | null;
  avatar_url?: string | null;
};

export type SquadClub = {
  club_id?: number | string | null;
  nombre: string;
  slug?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  descripcion?: string | null;
  color_principal?: string | null;
  temporada?: string | null;
  division?: string | null;
  activo?: boolean | null;
};

export type SquadPlayerView = SquadPlayer & {
  playerId: string;
  avatar_url?: string | null;
  pj: number;
  goles: number;
  asistencias: number;
  mvps: number;
  rating: number;
};
