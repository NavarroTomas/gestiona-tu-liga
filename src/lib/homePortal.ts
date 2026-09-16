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

export function buildAutomaticNews(matches: HomeMatch[]): HomeNews[] {
  return matches
    .filter((m) => Boolean(parseScore(m.resultado)))
    .sort((a, b) => sortMatches(b, a))
    .slice(0, 4)
    .map((match, index) => {
      const score = parseScore(match.resultado)!;
      const winner = score.home === score.away ? null : score.home > score.away ? match.local : match.visitante;
      const loser = score.home === score.away ? null : score.home > score.away ? match.visitante : match.local;
      const title = winner
        ? `${winner} venció a ${loser} por ${score.home}-${score.away}`
        : `${match.local} y ${match.visitante} empataron ${score.home}-${score.away}`;

      return {
        id: `auto-${String(match.partido_id || match.id)}-${index}`,
        titulo: title,
        descripcion: `${match.competicion === "liga" ? "Liga" : "Competencia APA"}${match.fecha ? ` · Fecha ${match.fecha}` : ""}`,
        categoria: "Resumen automático",
        destacada: index === 0,
      };
    });
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
