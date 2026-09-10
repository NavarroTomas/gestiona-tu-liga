export type FormResult = "W" | "D" | "L";

export type LeagueMatch = {
  id: string | number;
  partido_id?: string | null;
  local: string;
  visitante: string;
  resultado?: string | null;
  fecha?: string | null;
  temporada?: string | null;
  division?: string | null;
  dia?: string | null;
  hora?: string | null;
};

export type LeagueClubSeason = {
  nombre: string;
  logo_url?: string | null;
  division?: string | null;
  temporada?: string | null;
  activo?: boolean | null;
};

export type LeagueSanction = {
  equipo: string;
  puntos_descontados?: number | string | null;
  competicion?: string | null;
};

export type LeagueStanding = {
  nombre: string;
  logo_url?: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  puntos: number;
  forma: FormResult[];
};

export type LeagueStandingsResult = {
  tabla: LeagueStanding[];
  logos: Record<string, string>;
  proximosRivales: Record<string, string>;
};
