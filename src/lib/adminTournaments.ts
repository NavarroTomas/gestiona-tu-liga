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

export async function fetchTournamentSeasons() {
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
) {
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
      local.pts += 3;
    } else if (score.local < score.visitante) {
      visitor.pg += 1;
      local.pp += 1;
      visitor.pts += 3;
    } else {
      local.pe += 1;
      visitor.pe += 1;
      local.pts += 1;
      visitor.pts += 1;
    }
  }

  for (const row of map.values()) row.dg = row.gf - row.gc;
  for (const sanction of sanctions) {
    const row = ensure(sanction.equipo);
    row.pts -= Number(sanction.puntos_descontados || 0);
  }

  return Array.from(map.values()).sort((a, b) =>
    b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.equipo.localeCompare(b.equipo, "es"),
  );
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
