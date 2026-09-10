import { CUPS_CONFIG } from "@/config/cups";
import type { CupMatch, CupSanction, CupStandingRow } from "./types";
import { hasCupResult, normalizeCupText } from "./utils";

function parseScore(result?: string | null) {
  const match = String(result || "").match(/(\d+)\s*[^0-9]\s*(\d+)/);
  if (!match) return null;

  const local = Number(match[1]);
  const visitante = Number(match[2]);
  if (Number.isNaN(local) || Number.isNaN(visitante)) return null;

  return { local, visitante };
}

/**
 * Calcula una tabla completa de un grupo a partir de los partidos reales.
 *
 * Si mañana querés cambiar el criterio de desempate, este es el archivo a tocar.
 * Actualmente se ordena por: PTS > DG > GF > nombre.
 */
export function calculateCupGroupStandings(
  matches: CupMatch[],
  group: string,
  sanctions: CupSanction[] = [],
): CupStandingRow[] {
  const groupMatches = matches.filter(
    (match) => normalizeCupText(match.grupo) === normalizeCupText(group),
  );

  const teams: Record<string, CupStandingRow> = {};

  function ensureTeam(name: string) {
    if (!teams[name]) {
      teams[name] = {
        equipo: name,
        grupo: group,
        pts: 0,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0,
        sancion_pts: 0,
        forma: [],
      };
    }
    return teams[name];
  }

  groupMatches.forEach((match) => {
    if (!match.local || !match.visitante) return;

    const local = ensureTeam(match.local);
    const visitante = ensureTeam(match.visitante);

    if (!hasCupResult(match)) return;
    const score = parseScore(match.resultado);
    if (!score) return;

    local.pj += 1;
    visitante.pj += 1;
    local.gf += score.local;
    local.gc += score.visitante;
    visitante.gf += score.visitante;
    visitante.gc += score.local;

    if (score.local > score.visitante) {
      local.pg += 1;
      local.pts += 3;
      local.forma.push("W");
      visitante.pp += 1;
      visitante.forma.push("L");
    } else if (score.visitante > score.local) {
      visitante.pg += 1;
      visitante.pts += 3;
      visitante.forma.push("W");
      local.pp += 1;
      local.forma.push("L");
    } else {
      local.pe += 1;
      visitante.pe += 1;
      local.pts += 1;
      visitante.pts += 1;
      local.forma.push("D");
      visitante.forma.push("D");
    }
  });

  // Guarda el primer partido pendiente como "próximo rival" de cada equipo.
  groupMatches.forEach((match) => {
    if (hasCupResult(match) || !match.local || !match.visitante) return;

    const local = ensureTeam(match.local);
    const visitante = ensureTeam(match.visitante);

    if (!local.proximoRival) {
      local.proximoRival = match.visitante;
      local.proximoPartido = match;
    }
    if (!visitante.proximoRival) {
      visitante.proximoRival = match.local;
      visitante.proximoPartido = match;
    }
  });

  Object.values(teams).forEach((team) => {
    const discount = sanctions
      .filter(
        (sanction) =>
          normalizeCupText(sanction.equipo) === normalizeCupText(team.equipo) &&
          sanction.competicion === CUPS_CONFIG.competitionKey,
      )
      .reduce((total, sanction) => total + Number(sanction.puntos_descontados || 0), 0);

    team.sancion_pts = discount;
    team.pts -= discount;
    team.dg = team.gf - team.gc;
    team.forma = team.forma.slice(-5);
  });

  return Object.values(teams).sort(
    (a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.equipo.localeCompare(b.equipo),
  );
}
