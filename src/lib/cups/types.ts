export type CupFormResult = "W" | "D" | "L";

export type CupMatch = {
  id: string | number;
  partido_id?: string | number | null;
  local: string;
  visitante: string;
  resultado?: string | null;
  fecha?: string | number | null;
  temporada: string;
  division?: string | null;
  dia?: string | null;
  hora?: string | null;
  competicion?: string | null;
  grupo?: string | null;
  fase?: string | null;
  ronda?: string | null;
};

export type CupClub = {
  nombre: string;
  logo_url?: string | null;
  slug?: string | null;
};

export type CupSanction = {
  id?: string | number;
  temporada: string;
  competicion?: string | null;
  equipo: string;
  puntos_descontados: number;
  motivo?: string | null;
};

export type CupStandingRow = {
  equipo: string;
  grupo: string;
  pts: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  sancion_pts: number;
  forma: CupFormResult[];
  proximoRival?: string;
  proximoPartido?: CupMatch;
};
