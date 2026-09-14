import { supabase } from "@/lib/supabase";

export type TournamentTeam = {
  id?: string | number;
  nombre: string;
  division?: string | null;
  logo_url?: string | null;
  slug?: string | null;
};

export type TournamentMatch = {
  id: string | number;
  partido_id?: string | null;
  local: string;
  visitante?: string | null;
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
  estado?: string | null;
};

export type TournamentSeason = {
  id: string | number;
  nombre: string;
  numero?: number | null;
  activa?: boolean | null;
  estado?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  campeon?: string | null;
  configuracion?: Record<string, unknown> | null;
};

export type CompetitionConfig = {
  id: string;
  temporada: string;
  slug: string;
  nombre: string;
  tipo: string;
  activa: boolean;
  orden: number;
  reglas: Record<string, any>;
};

export type StandingRow = {
  equipo: string;
  pts: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
};

export type StandingRules = {
  winPoints?: number;
  drawPoints?: number;
  lossPoints?: number;
  tieBreakers?: Array<"pts" | "dg" | "gf" | "pg" | "equipo">;
};

function seasonNumber(value: string) {
  const match = String(value || "").match(/(\d+)/);
  return match ? Number(match[1]) : -1;
}

export function sortSeasons(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => {
    const na = seasonNumber(a);
    const nb = seasonNumber(b);
    if (na !== nb) return nb - na;
    return b.localeCompare(a, "es");
  });
}

export async function fetchSeasonRecords() {
  const { data, error } = await supabase
    .from("temporadas")
    .select("id,nombre,numero,activa,estado,fecha_inicio,fecha_fin,campeon,configuracion")
    .order("numero", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data || []) as TournamentSeason[];
}

export async function createTournamentSeason(input: {
  nombre: string;
  numero?: number | null;
  estado?: string;
  activa?: boolean;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  cloneFrom?: string | null;
}) {
  const { data, error } = await supabase
    .from("temporadas")
    .insert({
      nombre: input.nombre.trim(),
      numero: input.numero ?? null,
      estado: input.estado || "borrador",
      activa: Boolean(input.activa),
      fecha_inicio: input.fecha_inicio || null,
      fecha_fin: input.fecha_fin || null,
      updated_at: new Date().toISOString(),
    })
    .select("id,nombre,numero,activa,estado,fecha_inicio,fecha_fin,campeon,configuracion")
    .single();
  if (error) throw error;

  if (input.cloneFrom) {
    const previous = await fetchCompetitionConfigs(input.cloneFrom);
    if (previous.length) {
      const { error: cloneError } = await supabase.from("competicion_config").insert(
        previous.map((config) => ({
          temporada: input.nombre.trim(),
          slug: config.slug,
          nombre: config.nombre,
          tipo: config.tipo,
          activa: config.activa,
          orden: config.orden,
          reglas: config.reglas || {},
        })),
      );
      if (cloneError) throw cloneError;
    }
  }

  return data as TournamentSeason;
}

export async function updateTournamentSeason(id: string | number, patch: Partial<TournamentSeason>) {
  const { data, error } = await supabase
    .from("temporadas")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id,nombre,numero,activa,estado,fecha_inicio,fecha_fin,campeon,configuracion")
    .single();
  if (error) throw error;
  return data as TournamentSeason;
}

export async function fetchCompetitionConfigs(temporada: string) {
  const { data, error } = await supabase
    .from("competicion_config")
    .select("id,temporada,slug,nombre,tipo,activa,orden,reglas")
    .eq("temporada", temporada)
    .order("orden", { ascending: true });
  if (error) throw error;
  return (data || []) as CompetitionConfig[];
}

export async function saveCompetitionConfig(config: CompetitionConfig) {
  const { data, error } = await supabase
    .from("competicion_config")
    .upsert({
      id: config.id || undefined,
      temporada: config.temporada,
      slug: config.slug,
      nombre: config.nombre,
      tipo: config.tipo,
      activa: config.activa,
      orden: Number(config.orden || 0),
      reglas: config.reglas || {},
      updated_at: new Date().toISOString(),
    }, { onConflict: "temporada,slug" })
    .select("id,temporada,slug,nombre,tipo,activa,orden,reglas")
    .single();
  if (error) throw error;
  return data as CompetitionConfig;
}

export async function createCompetitionConfig(input: Omit<CompetitionConfig, "id">) {
  const { data, error } = await supabase
    .from("competicion_config")
    .insert({ ...input, reglas: input.reglas || {} })
    .select("id,temporada,slug,nombre,tipo,activa,orden,reglas")
    .single();
  if (error) throw error;
  return data as CompetitionConfig;
}

export async function fetchTournamentSeasons() {
  try {
    const records = await fetchSeasonRecords();
    if (records.length) return sortSeasons(records.map((row) => row.nombre));
  } catch {
    // Compatibilidad con instalaciones anteriores a la tabla extendida.
  }

  const [matchesRes, clubsRes] = await Promise.all([
    supabase.from("partidos").select("temporada"),
    supabase.from("v_clubes_temporada_public").select("temporada"),
  ]);

  const values = [
    ...((matchesRes.data || []) as Array<{ temporada?: string | null }>).map((row) => row.temporada || ""),
    ...((clubsRes.data || []) as Array<{ temporada?: string | null }>).map((row) => row.temporada || ""),
  ];

  const seasons = sortSeasons(values);
  return seasons.length ? seasons : ["Temporada 4"];
}

export async function fetchTournamentTeams(temporada: string) {
  const { data, error } = await supabase
    .from("v_clubes_temporada_public")
    .select("club_id,nombre,division,logo_url,slug,activo")
    .eq("temporada", temporada)
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error) throw error;
  return ((data || []) as any[]).map((row) => ({
    id: row.club_id,
    nombre: row.nombre,
    division: row.division,
    logo_url: row.logo_url,
    slug: row.slug,
  })) as TournamentTeam[];
}

export async function fetchTournamentMatches(params: {
  temporada: string;
  competicion?: string;
  division?: string;
}) {
  let query = supabase
    .from("partidos")
    .select("id,partido_id,local,visitante,resultado,fecha,temporada,division,dia,hora,competicion,grupo,fase,ronda,estado")
    .eq("temporada", params.temporada)
    .order("fecha", { ascending: true });

  if (params.competicion) query = query.eq("competicion", params.competicion);
  if (params.division) query = query.eq("division", params.division);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as TournamentMatch[];
}

export function normalizeDivision(value?: string | null) {
  const v = String(value || "").toLowerCase().trim();
  if (["primera", "primera division", "primera división"].includes(v)) return "primera";
  if (["segunda", "segunda division", "segunda división"].includes(v)) return "segunda";
  return v;
}

export function isLoadedMatch(match: TournamentMatch) {
  return Boolean(match.partido_id || match.resultado);
}

export function parseScore(result?: string | null) {
  const match = String(result || "").match(/^(\d+)\s*[-:]\s*(\d+)$/);
  if (!match) return null;
  return { local: Number(match[1]), visitante: Number(match[2]) };
}

export function calculateStandings(
  matches: TournamentMatch[],
  sanctions: Array<{ equipo: string; puntos_descontados: number }> = [],
  rules: StandingRules = {},
) {
  const winPoints = Number(rules.winPoints ?? 3);
  const drawPoints = Number(rules.drawPoints ?? 1);
  const lossPoints = Number(rules.lossPoints ?? 0);
  const tieBreakers = rules.tieBreakers?.length ? rules.tieBreakers : ["pts", "dg", "gf", "equipo"];
  const map = new Map<string, StandingRow>();
  const ensure = (team: string) => {
    if (!map.has(team)) {
      map.set(team, { equipo: team, pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0 });
    }
    return map.get(team)!;
  };

  for (const match of matches) {
    if (!match.local || !match.visitante) continue;
    const local = ensure(match.local);
    const visitor = ensure(match.visitante);
    const score = parseScore(match.resultado);
    if (!score) continue;

    local.pj += 1;
    visitor.pj += 1;
    local.gf += score.local;
    local.gc += score.visitante;
    visitor.gf += score.visitante;
    visitor.gc += score.local;

    if (score.local > score.visitante) {
      local.pg += 1;
      visitor.pp += 1;
      local.pts += winPoints;
      visitor.pts += lossPoints;
    } else if (score.local < score.visitante) {
      visitor.pg += 1;
      local.pp += 1;
      visitor.pts += winPoints;
      local.pts += lossPoints;
    } else {
      local.pe += 1;
      visitor.pe += 1;
      local.pts += drawPoints;
      visitor.pts += drawPoints;
    }
  }

  for (const row of map.values()) row.dg = row.gf - row.gc;
  for (const sanction of sanctions) {
    const row = ensure(sanction.equipo);
    row.pts -= Number(sanction.puntos_descontados || 0);
  }

  return Array.from(map.values()).sort((a, b) => {
    for (const key of tieBreakers) {
      if (key === "equipo") {
        const cmp = a.equipo.localeCompare(b.equipo, "es");
        if (cmp !== 0) return cmp;
        continue;
      }
      const diff = Number(b[key]) - Number(a[key]);
      if (diff !== 0) return diff;
    }
    return a.equipo.localeCompare(b.equipo, "es");
  });
}

export function generateRoundRobin(teamsInput: string[], doubleRound = false) {
  const teams = [...teamsInput.filter(Boolean)];
  if (teams.length % 2 !== 0) teams.push("DESCANSA");
  if (teams.length < 2) return [];

  const rounds: Array<{ fecha: number; local: string; visitante: string }> = [];
  let rotation = [...teams];
  const totalRounds = teams.length - 1;
  const gamesPerRound = teams.length / 2;

  for (let round = 0; round < totalRounds; round++) {
    for (let i = 0; i < gamesPerRound; i++) {
      const a = rotation[i];
      const b = rotation[rotation.length - 1 - i];
      if (a !== "DESCANSA" && b !== "DESCANSA") {
        const even = round % 2 === 0;
        rounds.push({ fecha: round + 1, local: even ? a : b, visitante: even ? b : a });
      }
    }
    const fixed = rotation[0];
    const rest = rotation.slice(1);
    rest.unshift(rest.pop() as string);
    rotation = [fixed, ...rest];
  }

  if (!doubleRound) return rounds;
  const offset = totalRounds;
  return [
    ...rounds,
    ...rounds.map((game) => ({
      fecha: game.fecha + offset,
      local: game.visitante,
      visitante: game.local,
    })),
  ];
}

export function groupMatchesByRound(matches: TournamentMatch[]) {
  const map = new Map<string, TournamentMatch[]>();
  for (const match of matches) {
    const key = String(match.fecha || "Sin fecha");
    map.set(key, [...(map.get(key) || []), match]);
  }
  return Array.from(map.entries()).sort(([a], [b]) => {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return a.localeCompare(b, "es");
  });
}

export function winnerOf(match?: TournamentMatch | null) {
  if (!match?.visitante) return null;
  const score = parseScore(match.resultado);
  if (!score || score.local === score.visitante) return null;
  return score.local > score.visitante ? match.local : match.visitante;
}

export async function safeDeleteScheduledMatches(filters: {
  temporada: string;
  competicion: string;
  division?: string;
}) {
  const matches = await fetchTournamentMatches(filters);
  if (matches.some(isLoadedMatch)) {
    throw new Error("Hay partidos cargados. Anulalos o corregilos desde Centro de partidos antes de regenerar/eliminar esta estructura.");
  }

  let query = supabase
    .from("partidos")
    .delete()
    .eq("temporada", filters.temporada)
    .eq("competicion", filters.competicion);
  if (filters.division) query = query.eq("division", filters.division);
  const { error } = await query;
  if (error) throw error;
}
