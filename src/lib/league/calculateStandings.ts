import type {
  LeagueClubSeason,
  LeagueMatch,
  LeagueSanction,
  LeagueStanding,
  LeagueStandingsResult,
} from "./types";
import { normalizarDivision, parseResultado } from "./utils";

function crearEquipo(nombre: string, logo_url?: string | null): LeagueStanding {
  return {
    nombre,
    logo_url: logo_url || undefined,
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    dg: 0,
    puntos: 0,
    forma: [],
  };
}

export function calcularTablaLiga({
  partidos,
  clubes,
  sanciones,
  division,
}: {
  partidos: LeagueMatch[];
  clubes: LeagueClubSeason[];
  sanciones: LeagueSanction[];
  division: string;
}): LeagueStandingsResult {
  const divisionKey = normalizarDivision(division);
  const partidosFiltrados = partidos.filter(
    (partido) => normalizarDivision(partido.division || "") === divisionKey,
  );
  const clubesFiltrados = clubes.filter(
    (club) => normalizarDivision(club.division || "") === divisionKey,
  );

  const logos: Record<string, string> = {};
  const equipos: Record<string, LeagueStanding> = {};

  clubesFiltrados.forEach((club) => {
    if (club.logo_url) logos[club.nombre] = club.logo_url;
    equipos[club.nombre] = crearEquipo(club.nombre, club.logo_url);
  });

  partidosFiltrados.forEach((partido) => {
    const resultado = parseResultado(partido.resultado);
    if (!resultado) return;

    const local = partido.local;
    const visitante = partido.visitante;
    if (!local || !visitante) return;

    if (!equipos[local]) equipos[local] = crearEquipo(local);
    if (!equipos[visitante]) equipos[visitante] = crearEquipo(visitante);

    equipos[local].pj += 1;
    equipos[visitante].pj += 1;
    equipos[local].gf += resultado.local;
    equipos[local].gc += resultado.visitante;
    equipos[visitante].gf += resultado.visitante;
    equipos[visitante].gc += resultado.local;

    if (resultado.local > resultado.visitante) {
      equipos[local].pg += 1;
      equipos[local].puntos += 3;
      equipos[local].forma.push("W");
      equipos[visitante].pp += 1;
      equipos[visitante].forma.push("L");
    } else if (resultado.visitante > resultado.local) {
      equipos[visitante].pg += 1;
      equipos[visitante].puntos += 3;
      equipos[visitante].forma.push("W");
      equipos[local].pp += 1;
      equipos[local].forma.push("L");
    } else {
      equipos[local].pe += 1;
      equipos[visitante].pe += 1;
      equipos[local].puntos += 1;
      equipos[visitante].puntos += 1;
      equipos[local].forma.push("D");
      equipos[visitante].forma.push("D");
    }
  });

  sanciones.forEach((sancion) => {
    if (equipos[sancion.equipo]) {
      equipos[sancion.equipo].puntos -= Number(sancion.puntos_descontados || 0);
    }
  });

  const tabla = Object.values(equipos)
    .map((equipo) => ({
      ...equipo,
      dg: equipo.gf - equipo.gc,
      forma: equipo.forma.slice(-5),
    }))
    .sort((a, b) => b.puntos - a.puntos || b.dg - a.dg || b.gf - a.gf);

  const proximosRivales: Record<string, string> = {};
  partidosFiltrados.forEach((partido) => {
    if (partido.resultado || !partido.local || !partido.visitante) return;
    if (!proximosRivales[partido.local]) proximosRivales[partido.local] = partido.visitante;
    if (!proximosRivales[partido.visitante]) proximosRivales[partido.visitante] = partido.local;
  });

  return { tabla, logos, proximosRivales };
}
