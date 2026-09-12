import { getFixtureMatchDate, sortFixtureMatches, type FixtureMatch } from "@/lib/fixture";
import { calcularTablaLiga } from "@/lib/league/calculateStandings";
import type { LeagueClubSeason, LeagueMatch, LeagueSanction } from "@/lib/league/types";
import { normalizarDivision, normalizarNombreEquipo, parseResultado } from "@/lib/league/utils";
import type { ClubPlayerRow, ClubRecord, ClubsViewModel, ClubStanding } from "./types";

function clubMeta(name: string, clubs: ClubRecord[]) {
  const key = normalizarNombreEquipo(name);
  return clubs.find((club) => normalizarNombreEquipo(club.nombre) === key);
}

function matchDivision(match: FixtureMatch | LeagueMatch, division: string) {
  return normalizarDivision(match.division || "") === normalizarDivision(division);
}

function teamSetForDivision(clubs: ClubRecord[], division: string) {
  return new Set(
    clubs
      .filter((club) => normalizarDivision(club.division || "") === normalizarDivision(division))
      .map((club) => normalizarNombreEquipo(club.nombre)),
  );
}

export function buildClubsViewModel({
  matches,
  clubs,
  sanctions,
  players,
  division,
}: {
  matches: FixtureMatch[];
  clubs: ClubRecord[];
  sanctions: LeagueSanction[];
  players: ClubPlayerRow[];
  division: string;
}): ClubsViewModel {
  const leagueResult = calcularTablaLiga({
    partidos: matches as LeagueMatch[],
    clubes: clubs as LeagueClubSeason[],
    sanciones: sanctions,
    division,
  });

  const standings: ClubStanding[] = leagueResult.tabla.map((row) => {
    const meta = clubMeta(row.nombre, clubs);
    return {
      ...row,
      slug: meta?.slug,
      division: meta?.division,
      color_principal: meta?.color_principal,
      logo_url: meta?.logo_url || row.logo_url,
    };
  });

  const leader = standings[0] || null;
  const teams = teamSetForDivision(clubs, division);
  const divisionMatches = matches.filter((match) => matchDivision(match, division));

  const completedMatches = divisionMatches.filter((match) => {
    if (!parseResultado(match.resultado)) return false;
    return teams.has(normalizarNombreEquipo(match.local)) && teams.has(normalizarNombreEquipo(match.visitante));
  });

  const goals = completedMatches.reduce((total, match) => {
    const result = parseResultado(match.resultado);
    return total + (result ? result.local + result.visitante : 0);
  }, 0);

  const uniquePlayers = new Set(
    players
      .filter((player) => {
        const playerDivision = normalizarDivision(player.division || "");
        const inDivision = !playerDivision || playerDivision === normalizarDivision(division);
        return inDivision && teams.has(normalizarNombreEquipo(player.equipo));
      })
      .map((player) => String(player.playerId || player.nombre || "").trim())
      .filter(Boolean),
  );

  let nextLeaderMatch: FixtureMatch | null = null;
  if (leader) {
    const leaderKey = normalizarNombreEquipo(leader.nombre);
    const candidates = sortFixtureMatches(
      divisionMatches.filter((match) => {
        if (match.resultado) return false;
        return (
          normalizarNombreEquipo(match.local) === leaderKey ||
          normalizarNombreEquipo(match.visitante) === leaderKey
        );
      }),
    );

    const now = new Date();
    nextLeaderMatch =
      candidates.find((match) => {
        const date = getFixtureMatchDate(match);
        return date ? date.getTime() >= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() : false;
      }) || candidates[0] || null;
  }

  return {
    standings,
    leader,
    nextLeaderMatch,
    summary: {
      clubs: standings.length,
      players: uniquePlayers.size,
      matches: completedMatches.length,
      goals,
    },
  };
}

export function formatClubMatchDate(match?: FixtureMatch | null) {
  if (!match) return "Sin fecha";
  const date = getFixtureMatchDate(match);
  if (!date) return String(match.dia || match.fecha || "Sin fecha");
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .replace(".", "")
    .toUpperCase();
}

export function clubOpponent(match: FixtureMatch | null, team: string) {
  if (!match) return null;
  const key = normalizarNombreEquipo(team);
  return normalizarNombreEquipo(match.local) === key ? match.visitante : match.local;
}
