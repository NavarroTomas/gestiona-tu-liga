import { calcularTablaLiga } from "@/lib/league/calculateStandings";
import type {
  LeagueClubSeason,
  LeagueMatch,
  LeagueSanction,
  LeagueStanding,
} from "@/lib/league/types";
import { parseResultado } from "@/lib/league/utils";

export type HistoryMatch = LeagueMatch & {
  competicion?: string | null;
  grupo?: string | null;
  fase?: string | null;
  ronda?: string | null;
  orden?: number | null;
  llave?: string | null;
  estado?: string | null;
};

export type HistoryClub = LeagueClubSeason & { slug?: string | null };

export type HistoryPlayerRow = {
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

export type HistoryAwardRow = {
  temporada?: string | null;
  division?: string | null;
  premio?: string | null;
  playerid?: string | null;
  nombre?: string | null;
  equipo?: string | null;
  puntos?: number | string | null;
  posicion?: number | null;
};

export type HistorySanction = LeagueSanction & { temporada?: string | null };

export type PlayerAggregate = {
  key: string;
  playerId: string;
  nombre: string;
  equipo: string;
  posicion: string;
  partidos: number;
  goles: number;
  asistencias: number;
  mvps: number;
  atajadas: number;
  score: number;
  ratingPromedio: number;
};

type ResultMatch = {
  match: HistoryMatch;
  value: number;
  score: { local: number; visitante: number };
};

type TeamRecord = { nombre: string; gf: number; gc: number; pj: number };

function normalize(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function numericId(value: string | number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function aggregatePlayers(rows: HistoryPlayerRow[]): PlayerAggregate[] {
  const map = new Map<string, PlayerAggregate & { ratingWeighted: number }>();

  for (const row of rows) {
    const nombre = String(row.nombre || "").trim();
    const playerId = String(row.playerId || "").trim();
    if (!nombre && !playerId) continue;

    const key = playerId || normalize(nombre);
    const partidos = Number(row.partidos_jugados || 0);
    const rating = Number(row.rating_apa_promedio || 0);
    const current = map.get(key) ?? {
      key,
      playerId,
      nombre: nombre || playerId,
      equipo: String(row.equipo || "Sin club"),
      posicion: String(row.posicion || ""),
      partidos: 0,
      goles: 0,
      asistencias: 0,
      mvps: 0,
      atajadas: 0,
      score: 0,
      ratingPromedio: 0,
      ratingWeighted: 0,
    };

    current.partidos += partidos;
    current.goles += Number(row.goals || 0);
    current.asistencias += Number(row.assists || 0);
    current.mvps += Number(row.mvp || 0);
    current.atajadas += Number(row.gKSaves || 0);
    current.score += Number(row.score_total || 0);
    current.ratingWeighted += rating * partidos;
    if (nombre) current.nombre = nombre;
    if (row.equipo) current.equipo = String(row.equipo);
    if (row.posicion) current.posicion = String(row.posicion);
    if (playerId) current.playerId = playerId;
    map.set(key, current);
  }

  return Array.from(map.values()).map(({ ratingWeighted, ...player }) => ({
    ...player,
    ratingPromedio:
      player.partidos > 0
        ? Math.round((ratingWeighted / player.partidos) * 10) / 10
        : 0,
  }));
}

export function buildLeagueTables({
  matches,
  clubs,
  sanctions,
}: {
  matches: HistoryMatch[];
  clubs: HistoryClub[];
  sanctions: HistorySanction[];
}) {
  const leagueMatches = matches.filter((match) => {
    const competition = normalize(match.competicion);
    return competition === "liga" || competition === "";
  });
  const leagueSanctions = sanctions.filter((sanction) => {
    const competition = normalize(sanction.competicion);
    return competition === "liga" || competition === "";
  });

  return {
    primera: calcularTablaLiga({
      partidos: leagueMatches,
      clubes: clubs,
      sanciones: leagueSanctions,
      division: "Primera",
    }).tabla,
    segunda: calcularTablaLiga({
      partidos: leagueMatches,
      clubes: clubs,
      sanciones: leagueSanctions,
      division: "Segunda",
    }).tabla,
  };
}

function getKnockoutWinner(matches: HistoryMatch[], competition: string) {
  const candidates = matches
    .filter((match) => {
      const phase = normalize(match.fase || match.ronda);
      return (
        normalize(match.competicion) === normalize(competition) &&
        (phase === "final" || phase === "finales") &&
        Boolean(parseResultado(match.resultado))
      );
    })
    .sort((a, b) => numericId(a.id) - numericId(b.id));

  const match = candidates[candidates.length - 1];
  if (!match) return null;
  const score = parseResultado(match.resultado);
  if (!score || score.local === score.visitante) return null;

  return score.local > score.visitante
    ? { champion: match.local, runnerUp: match.visitante }
    : { champion: match.visitante, runnerUp: match.local };
}

export function seasonSummary(matches: HistoryMatch[], clubs: HistoryClub[]) {
  let goals = 0;
  let completed = 0;
  const teams = new Set<string>();

  for (const match of matches) {
    if (match.local) teams.add(match.local);
    if (match.visitante) teams.add(match.visitante);
    const score = parseResultado(match.resultado);
    if (!score) continue;
    completed += 1;
    goals += score.local + score.visitante;
  }
  for (const club of clubs) if (club.nombre) teams.add(club.nombre);

  return {
    teams: teams.size,
    matches: completed,
    goals,
    goalsPerMatch: completed > 0 ? goals / completed : 0,
  };
}

function buildTeamRecords(matches: HistoryMatch[]): TeamRecord[] {
  const map = new Map<string, TeamRecord>();
  const get = (name: string) => {
    const value = map.get(name) ?? { nombre: name, gf: 0, gc: 0, pj: 0 };
    map.set(name, value);
    return value;
  };

  for (const match of matches) {
    const score = parseResultado(match.resultado);
    if (!score || !match.local || !match.visitante) continue;
    const local = get(match.local);
    const visitante = get(match.visitante);
    local.pj += 1;
    visitante.pj += 1;
    local.gf += score.local;
    local.gc += score.visitante;
    visitante.gf += score.visitante;
    visitante.gc += score.local;
  }

  return Array.from(map.values());
}

function bestResultMatch(
  matches: HistoryMatch[],
  mode: "margin" | "total",
): ResultMatch | null {
  let best: ResultMatch | null = null;
  for (const match of matches) {
    const score = parseResultado(match.resultado);
    if (!score) continue;
    const value =
      mode === "margin"
        ? Math.abs(score.local - score.visitante)
        : score.local + score.visitante;
    if (!best || value > best.value) best = { match, value, score };
  }
  return best;
}

export function longestWinStreak(matches: HistoryMatch[]) {
  const current = new Map<string, number>();
  let best = { team: "", value: 0 };
  const ordered = [...matches].sort((a, b) => numericId(a.id) - numericId(b.id));

  const set = (team: string, won: boolean) => {
    const value = won ? (current.get(team) || 0) + 1 : 0;
    current.set(team, value);
    if (value > best.value) best = { team, value };
  };

  for (const match of ordered) {
    const score = parseResultado(match.resultado);
    if (!score || !match.local || !match.visitante) continue;
    if (score.local > score.visitante) {
      set(match.local, true);
      set(match.visitante, false);
    } else if (score.visitante > score.local) {
      set(match.visitante, true);
      set(match.local, false);
    } else {
      set(match.local, false);
      set(match.visitante, false);
    }
  }
  return best;
}

export function buildSeasonRecords(matches: HistoryMatch[], players: PlayerAggregate[]) {
  const teams = buildTeamRecords(matches);
  const biggest = bestResultMatch(matches, "margin");
  const highest = bestResultMatch(matches, "total");
  const streak = longestWinStreak(matches);
  const mostGoals = [...teams].sort((a, b) => b.gf - a.gf)[0] || null;
  const bestDefense = [...teams]
    .filter((team) => team.pj > 0)
    .sort((a, b) => a.gc - b.gc || b.pj - a.pj)[0] || null;
  const scorer = [...players].sort((a, b) => b.goles - a.goles)[0] || null;

  return [
    { label: "Mayor goleada", value: biggest ? `${biggest.score.local}-${biggest.score.visitante}` : "—", detail: biggest ? `${biggest.match.local} vs ${biggest.match.visitante}` : "Sin datos" },
    { label: "Partido con más goles", value: highest ? `${highest.score.local}-${highest.score.visitante}` : "—", detail: highest ? `${highest.match.local} vs ${highest.match.visitante}` : "Sin datos" },
    { label: "Mayor racha de victorias", value: streak.value ? String(streak.value) : "—", detail: streak.team || "Sin datos" },
    { label: "Equipo más goleador", value: mostGoals ? String(mostGoals.gf) : "—", detail: mostGoals?.nombre || "Sin datos" },
    { label: "Menos goles recibidos", value: bestDefense ? String(bestDefense.gc) : "—", detail: bestDefense?.nombre || "Sin datos" },
    { label: "Jugador con más goles", value: scorer ? String(scorer.goles) : "—", detail: scorer?.nombre || "Sin datos" },
  ];
}

function titleCounts(allMatches: HistoryMatch[], allSanctions: HistorySanction[]) {
  const seasons = Array.from(new Set(allMatches.map((match) => String(match.temporada || "")).filter(Boolean)));
  const counts = new Map<string, number>();
  const add = (team?: string | null) => {
    const name = String(team || "").trim();
    if (name) counts.set(name, (counts.get(name) || 0) + 1);
  };

  for (const season of seasons) {
    const matches = allMatches.filter((match) => match.temporada === season);
    const sanctions = allSanctions.filter((sanction) => sanction.temporada === season);
    const tables = buildLeagueTables({ matches, clubs: [], sanctions });
    add(tables.primera[0]?.nombre);
    add(tables.segunda[0]?.nombre);
    add(getKnockoutWinner(matches, "copa_argentina")?.champion);
    add(getKnockoutWinner(matches, "copa_apa")?.champion);
    add(getKnockoutWinner(matches, "copa_campeones")?.champion);
  }

  return Array.from(counts.entries())
    .map(([team, titles]) => ({ team, titles }))
    .sort((a, b) => b.titles - a.titles || a.team.localeCompare(b.team));
}

export function buildHistoricalRecords({
  allMatches,
  allPlayers,
  allSanctions,
}: {
  allMatches: HistoryMatch[];
  allPlayers: PlayerAggregate[];
  allSanctions: HistorySanction[];
}) {
  const scorer = [...allPlayers].sort((a, b) => b.goles - a.goles)[0] || null;
  const appearances = [...allPlayers].sort((a, b) => b.partidos - a.partidos)[0] || null;
  const titles = titleCounts(allMatches, allSanctions)[0] || null;
  const biggest = bestResultMatch(allMatches, "margin");
  const streak = longestWinStreak(allMatches);

  return [
    { label: "Máximo goleador histórico", value: scorer ? String(scorer.goles) : "—", detail: scorer?.nombre || "Sin datos" },
    { label: "Más partidos", value: appearances ? String(appearances.partidos) : "—", detail: appearances?.nombre || "Sin datos" },
    { label: "Más títulos", value: titles ? String(titles.titles) : "—", detail: titles?.team || "Sin datos" },
    { label: "Mayor goleada", value: biggest ? `${biggest.score.local}-${biggest.score.visitante}` : "—", detail: biggest ? `${biggest.match.local} vs ${biggest.match.visitante}` : "Sin datos" },
    { label: "Mayor racha de victorias", value: streak.value ? String(streak.value) : "—", detail: streak.team || "Sin datos" },
  ];
}

export function highlightedStats(
  tables: { primera: LeagueStanding[]; segunda: LeagueStanding[] },
  players: PlayerAggregate[],
) {
  const scorer = [...players].sort((a, b) => b.goles - a.goles)[0] || null;
  const assists = [...players].sort((a, b) => b.asistencias - a.asistencias)[0] || null;
  const mvp = [...players].sort((a, b) => b.mvps - a.mvps)[0] || null;
  const teams = [...tables.primera, ...tables.segunda].filter((team) => team.pj > 0);
  const attack = [...teams].sort((a, b) => b.gf - a.gf)[0] || null;
  const defense = [...teams].sort((a, b) => a.gc - b.gc || b.pj - a.pj)[0] || null;
  return { scorer, assists, mvp, attack, defense };
}

function firstAward(rows: HistoryAwardRow[], keys: string[]) {
  return rows.find((row) => keys.includes(normalize(row.premio))) || null;
}

export function buildAwards(rows: HistoryAwardRow[], players: PlayerAggregate[]) {
  const scorer = [...players].sort((a, b) => b.goles - a.goles)[0] || null;
  const mvpLeader = [...players].sort((a, b) => b.mvps - a.mvps || b.score - a.score)[0] || null;
  const goalkeepers = players.filter((player) => {
    const position = normalize(player.posicion);
    return position.includes("gk") || position.includes("arq") || position.includes("port");
  });
  const goalkeeperLeader = [...(goalkeepers.length ? goalkeepers : players)]
    .sort((a, b) => b.atajadas - a.atajadas || b.ratingPromedio - a.ratingPromedio)[0] || null;

  const balonOro = firstAward(rows, ["balon_oro", "balon de oro", "mvp"]);
  const theBest = firstAward(rows, ["the_best", "the best"]);
  const raiko = firstAward(rows, ["raiko_trophy", "raiko trophy", "arquero_del_ano", "arquero del ano"]);
  const botaOro = firstAward(rows, ["bota_oro", "bota de oro", "goleador"]);
  const goldenBoy = firstAward(rows, ["golden_boy", "golden boy"]);

  return [
    {
      key: "balon_oro",
      label: "Balón de Oro",
      nombre: balonOro?.nombre || mvpLeader?.nombre || "Sin definir",
      equipo: balonOro?.equipo || mvpLeader?.equipo || "",
    },
    {
      key: "the_best",
      label: "The Best",
      nombre: theBest?.nombre || "Sin definir",
      equipo: theBest?.equipo || "",
    },
    {
      key: "raiko_trophy",
      label: "Raiko Trophy",
      nombre: raiko?.nombre || goalkeeperLeader?.nombre || "Sin definir",
      equipo: raiko?.equipo || goalkeeperLeader?.equipo || "",
    },
    {
      key: "bota_oro",
      label: "Bota de Oro",
      nombre: botaOro?.nombre || scorer?.nombre || "Sin definir",
      equipo: botaOro?.equipo || scorer?.equipo || "",
    },
    {
      key: "golden_boy",
      label: "Golden Boy",
      nombre: goldenBoy?.nombre || "Sin definir",
      equipo: goldenBoy?.equipo || "",
    },
  ];
}

export function competitionSummary(
  matches: HistoryMatch[],
  tables: { primera: LeagueStanding[]; segunda: LeagueStanding[] },
) {
  const argentina = getKnockoutWinner(matches, "copa_argentina");
  const apa = getKnockoutWinner(matches, "copa_apa");
  const campeones = getKnockoutWinner(matches, "copa_campeones");

  return [
    {
      key: "liga",
      label: "Torneo de Liga",
      rows: [
        { label: "Campeón Primera", team: tables.primera[0]?.nombre || "Por definir" },
        { label: "Campeón Segunda", team: tables.segunda[0]?.nombre || "Por definir" },
      ],
    },
    {
      key: "copa_argentina",
      label: "Copa Argentina",
      rows: [
        { label: "Campeón", team: argentina?.champion || "Por definir" },
        { label: "Subcampeón", team: argentina?.runnerUp || "Por definir" },
      ],
    },
    {
      key: "copa_apa",
      label: "Copa APA",
      rows: [
        { label: "Campeón", team: apa?.champion || "Por definir" },
        { label: "Subcampeón", team: apa?.runnerUp || "Por definir" },
      ],
    },
    {
      key: "copa_campeones",
      label: "Copa de Campeones",
      rows: [
        { label: "Campeón", team: campeones?.champion || "Por definir" },
        { label: "Subcampeón", team: campeones?.runnerUp || "Por definir" },
      ],
    },
  ];
}
