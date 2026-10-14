export type HomeMatch = {
  id: string | number;
  partido_id?: string | null;
  local?: string | null;
  visitante?: string | null;
  resultado?: string | null;
  fecha?: number | null;
  temporada?: string | null;
  division?: string | null;
  competicion?: string | null;
  fase?: string | null;
  grupo?: string | null;
  dia?: string | null;
  hora?: string | null;
};

export type HomeNews = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria?: string | null;
  imagen_url?: string | null;
  destacada?: boolean | null;
  created_at?: string | null;
  href?: string | null;
  meta?: string | null;
  sortOrder?: number;
};

export type HomePlayerStat = {
  partido_id?: string | null;
  playerId?: string | null;
  nombre?: string | null;
  equipo?: string | null;
  goals?: number | null;
  assists?: number | null;
  mvp?: number | null;
};

export type HomeAward = {
  id: number;
  premio: string;
  nombre: string;
  equipo: string | null;
  puntos: number | null;
  posicion: number | null;
};

export type ClubInfo = { nombre: string; logo_url?: string | null };

export type StandingRow = {
  club: string;
  pts: number;
  pj: number;
  g: number;
  e: number;
  p: number;
  dg: number;
  gf: number;
};

export function normalizeText(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

export function parseScore(value?: string | null) {
  const match = String(value || "").trim().match(/^(\d+)\s*[-:]\s*(\d+)$/);
  if (!match) return null;
  return { home: Number(match[1]), away: Number(match[2]) };
}

export function sortMatches(a: HomeMatch, b: HomeMatch) {
  const fa = Number(a.fecha || 999);
  const fb = Number(b.fecha || 999);
  if (fa !== fb) return fa - fb;
  return String(a.hora || "99:99").localeCompare(String(b.hora || "99:99"));
}

export function buildStandings(matches: HomeMatch[], division = "Primera") {
  const table = new Map<string, StandingRow>();

  const ensure = (club: string) => {
    if (!table.has(club)) {
      table.set(club, { club, pts: 0, pj: 0, g: 0, e: 0, p: 0, dg: 0, gf: 0 });
    }
    return table.get(club)!;
  };

  matches
    .filter((m) => normalizeText(m.competicion || "liga") === "liga")
    .filter((m) => normalizeText(m.division) === normalizeText(division))
    .forEach((match) => {
      const score = parseScore(match.resultado);
      if (!score || !match.local || !match.visitante) return;

      const home = ensure(match.local);
      const away = ensure(match.visitante);
      home.pj += 1;
      away.pj += 1;
      home.gf += score.home;
      away.gf += score.away;
      home.dg += score.home - score.away;
      away.dg += score.away - score.home;

      if (score.home > score.away) {
        home.g += 1;
        away.p += 1;
        home.pts += 3;
      } else if (score.away > score.home) {
        away.g += 1;
        home.p += 1;
        away.pts += 3;
      } else {
        home.e += 1;
        away.e += 1;
        home.pts += 1;
        away.pts += 1;
      }
    });

  return [...table.values()].sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.club.localeCompare(b.club));
}

export function buildAutomaticNews(matches: HomeMatch[], playerStats: HomePlayerStat[] = []): HomeNews[] {
  const completed = matches.filter((match) => Boolean(parseScore(match.resultado))).sort(sortMatches);
  const generated: HomeNews[] = [];
  const processed: HomeMatch[] = [];

  const competitionLabel = (match: HomeMatch) => {
    const key = normalizeText(match.competicion || "liga");
    if (key === "liga") return match.division ? "Liga " + match.division : "Liga";
    if (key === "copa_argentina") return "Copa Argentina";
    if (key === "copa_apa") return "Copa de la Liga";
    if (key === "copa_campeones") return "Copa de Campeones";
    if (key === "copa_clasificatoria") return "Clasificación a Copas";
    if (key === "playoffs") return "Playoffs";
    return match.competicion || "Competición Liga";
  };

  const phaseLabel = (match: HomeMatch) => {
    if (match.grupo) return "Grupo " + match.grupo;
    const phase = String(match.fase || "").replaceAll("_", " ").trim();
    if (!phase) return match.fecha ? "Fecha " + match.fecha : "";
    return phase.charAt(0).toUpperCase() + phase.slice(1);
  };

  const matchKey = (match: HomeMatch) => String(match.partido_id || match.id);
  const destinationForMatch = (match: HomeMatch) => {
    if (match.partido_id) return "/estadisticas/" + encodeURIComponent(String(match.partido_id));

    const key = normalizeText(match.competicion || "liga");
    if (key === "copa_argentina") return "/competicion/copa-argentina";
    if (key === "copa_apa") return "/competicion/copa-apa";
    if (key === "copa_campeones") return "/competicion/copa-campeones";
    if (key === "copa_clasificatoria") return "/competicion/copas";
    if (key === "playoffs") return "/competicion/playoffs";
    return "/divisiones";
  };


  completed.forEach((match, index) => {
    const score = parseScore(match.resultado)!;
    const isLeague = normalizeText(match.competicion || "liga") === "liga";
    const before = isLeague ? buildStandings(processed, match.division || "Primera") : [];
    processed.push(match);
    const after = isLeague ? buildStandings(processed, match.division || "Primera") : [];
    const draw = score.home === score.away;
    const winner = draw ? null : score.home > score.away ? match.local : match.visitante;
    const loser = draw ? null : score.home > score.away ? match.visitante : match.local;
    const winnerBefore = winner ? before.findIndex((row) => normalizeText(row.club) === normalizeText(winner)) + 1 : 0;
    const winnerAfter = winner ? after.findIndex((row) => normalizeText(row.club) === normalizeText(winner)) + 1 : 0;
    const passedClub = winner && winnerBefore > 0 && winnerAfter > 0 && winnerAfter < winnerBefore ? before[winnerAfter - 1]?.club : null;

    let titulo = draw
      ? String(match.local) + " y " + String(match.visitante) + " empataron " + score.home + "-" + score.away
      : String(winner) + " venció " + score.home + "-" + score.away + " a " + String(loser);
    let descripcion = competitionLabel(match) + (phaseLabel(match) ? " · " + phaseLabel(match) : "");

    if (winner && isLeague && winnerAfter === 1 && winnerBefore > 1) {
      titulo = String(winner) + " tomó la punta tras ganar " + score.home + "-" + score.away;
      descripcion = passedClub ? competitionLabel(match) + " · superó a " + passedClub + " y quedó 1.º" : competitionLabel(match) + " · ahora lidera la tabla";
    } else if (winner && isLeague && winnerBefore > 0 && winnerAfter > 0 && winnerAfter < winnerBefore) {
      titulo = String(winner) + " ganó " + score.home + "-" + score.away + " y subió al " + winnerAfter + ".º puesto";
      descripcion = passedClub ? competitionLabel(match) + " · superó a " + passedClub + " en la clasificación" : competitionLabel(match) + " · avanzó posiciones";
    } else if (winner && Math.abs(score.home - score.away) >= 3) {
      titulo = "Goleada de " + String(winner) + ": " + score.home + "-" + score.away + " ante " + String(loser);
    }

    generated.push({
      id: "auto-match-" + matchKey(match),
      titulo, descripcion, categoria: competitionLabel(match), destacada: false,
      href: destinationForMatch(match),
      meta: phaseLabel(match), sortOrder: index * 10 + 5,
    });
  });

  const statsByMatch = new Map<string, HomePlayerStat[]>();
  playerStats.forEach((stat) => {
    const key = String(stat.partido_id || "");
    if (!key) return;
    const list = statsByMatch.get(key) || [];
    list.push(stat);
    statsByMatch.set(key, list);
  });

  const totals = new Map<string, { playerId: string; nombre: string; equipo: string; goals: number; assists: number; mvp: number }>();
  const previousLeaders: Record<"goals" | "assists" | "mvp", string | null> = { goals: null, assists: null, mvp: null };

  completed.forEach((match, matchIndex) => {
    const matchStats = statsByMatch.get(matchKey(match)) || [];
    matchStats.forEach((stat) => {
      const key = String(stat.playerId || stat.nombre || "").trim();
      if (!key) return;
      const current = totals.get(key) || {
        playerId: String(stat.playerId || ""), nombre: String(stat.nombre || "Jugador Liga"), equipo: String(stat.equipo || ""), goals: 0, assists: 0, mvp: 0,
      };
      current.goals += Number(stat.goals || 0);
      current.assists += Number(stat.assists || 0);
      current.mvp += Number(stat.mvp || 0);
      totals.set(key, current);
    });

    (["goals", "assists", "mvp"] as const).forEach((metric, metricIndex) => {
      const ranking = [...totals.values()].filter((player) => player[metric] > 0).sort((a, b) => b[metric] - a[metric] || b.goals - a.goals || a.nombre.localeCompare(b.nombre));
      const leader = ranking[0];
      if (!leader) return;
      const previous = previousLeaders[metric];
      if (previous && previous !== leader.playerId) {
        const value = leader[metric];
        let titulo = leader.nombre + " tomó el liderazgo en MVP con " + value;
        let categoria = "MVP";
        if (metric === "goals") { titulo = leader.nombre + " pasó a liderar los goleadores con " + value + (value === 1 ? " gol" : " goles"); categoria = "Goleadores"; }
        if (metric === "assists") { titulo = leader.nombre + " quedó 1.º en asistencias con " + value; categoria = "Asistencias"; }
        generated.push({
          id: "auto-leader-" + metric + "-" + matchKey(match) + "-" + leader.playerId,
          titulo, categoria,
          descripcion: leader.equipo ? leader.equipo + " · actualización tras " + competitionLabel(match) : "Actualización tras " + competitionLabel(match),
          href: leader.playerId ? "/jugadores/" + encodeURIComponent(leader.playerId) : null,
          meta: match.fecha ? "Fecha " + match.fecha : phaseLabel(match),
          sortOrder: matchIndex * 10 + 7 + metricIndex,
        });
      }
      previousLeaders[metric] = leader.playerId;
    });
  });

  const latestLeaders = [...totals.values()];
  (["goals", "assists", "mvp"] as const).forEach((metric, metricIndex) => {
    if (generated.some((item) => item.id.startsWith("auto-leader-" + metric + "-"))) return;
    const leader = [...latestLeaders].filter((player) => player[metric] > 0).sort((a, b) => b[metric] - a[metric] || b.goals - a.goals || a.nombre.localeCompare(b.nombre))[0];
    if (!leader) return;
    let titulo = leader.nombre + " lidera en MVP con " + leader.mvp;
    let categoria = "MVP";
    if (metric === "goals") { titulo = leader.nombre + " lidera los goleadores con " + leader.goals; categoria = "Goleadores"; }
    if (metric === "assists") { titulo = leader.nombre + " encabeza las asistencias con " + leader.assists; categoria = "Asistencias"; }
    generated.push({
      id: "auto-current-" + metric + "-" + leader.playerId, titulo, categoria,
      descripcion: leader.equipo ? leader.equipo + " · " + categoria : categoria,
      href: leader.playerId ? "/jugadores/" + encodeURIComponent(leader.playerId) : null,
      meta: "Torneo actual", sortOrder: completed.length * 10 + metricIndex,
    });
  });

  return generated.sort((a, b) => Number(b.sortOrder || 0) - Number(a.sortOrder || 0)).slice(0, 10);
}

export function awardLabel(key: string) {
  const labels: Record<string, string> = {
    balon_oro: "Balón de Oro",
    the_best: "The Best",
    raiko_trophy: "Raiko Trophy",
    bota_oro: "Bota de Oro",
    golden_boy: "Golden Boy",
  };
  return labels[key] || key.replaceAll("_", " ");
}

export function awardIcon(key: string) {
  const icons: Record<string, string> = {
    balon_oro: "★",
    the_best: "◆",
    raiko_trophy: "◈",
    bota_oro: "●",
    golden_boy: "✦",
  };
  return icons[key] || "★";
}
