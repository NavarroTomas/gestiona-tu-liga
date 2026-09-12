export type PlantillaClub = {
  club_id?: string | null;
  slug?: string | null;
  nombre: string;
  logo_url?: string | null;
  banner_url?: string | null;
  descripcion?: string | null;
  color_principal?: string | null;
  temporada?: string | null;
  division?: string | null;
  activo?: boolean | null;
};

export type PlantillaMembership = {
  id: number | string;
  jugador: string;
  playerid?: string | null;
  posicion?: string | null;
  estado?: string | null;
  club_id?: string | null;
  equipo: string;
  temporada: string;
  division?: string | null;
};

export type PlantillaRankingRow = {
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
  gKSaves?: number | string | null;
  rating_apa_promedio?: number | string | null;
  score_total?: number | string | null;
};

export type PlantillaRosterPlayer = {
  id: string;
  name: string;
  playerId: string;
  position: string;
  status: string;
  matches: number;
  goals: number;
  assists: number;
  mvps: number;
  rating: number | null;
};

export type PlantillaTeamSummary = {
  players: number;
  appearances: number;
  goals: number;
  assists: number;
  mvps: number;
  averageRating: number | null;
};
