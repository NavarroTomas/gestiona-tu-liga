import type {
  PlantillaClub,
  PlantillaMembership,
  PlantillaRankingRow,
  PlantillaRosterPlayer,
  PlantillaTeamSummary,
} from "./types";

export function normalizePlantillasText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function normalizePlantillasDivision(value: unknown) {
  const normalized = normalizePlantillasText(value);
  if (normalized.includes("primera")) return "primera";
  if (normalized.includes("segunda")) return "segunda";
  if (normalized.includes("tercera")) return "tercera";
  return normalized;
}

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function rankingForMembership(
  membership: PlantillaMembership,
  ranking: PlantillaRankingRow[],
) {
  const playerId = normalizePlantillasText(membership.playerid);
  const playerName = normalizePlantillasText(membership.jugador);
  const teamName = normalizePlantillasText(membership.equipo);
  const division = normalizePlantillasDivision(membership.division);

  return (
    ranking.find((row) => {
      const samePlayer = playerId && normalizePlantillasText(row.playerId) === playerId;
      const sameTeam = normalizePlantillasText(row.equipo) === teamName;
      const sameDivision = normalizePlantillasDivision(row.division) === division;
      return Boolean(samePlayer && sameTeam && sameDivision);
    }) ||
    ranking.find((row) => {
      const samePlayer = playerName && normalizePlantillasText(row.nombre) === playerName;
      const sameTeam = normalizePlantillasText(row.equipo) === teamName;
      const sameDivision = normalizePlantillasDivision(row.division) === division;
      return Boolean(samePlayer && sameTeam && sameDivision);
    }) ||
    null
  );
}

export function buildPlantillaRoster({
  memberships,
  ranking,
  club,
}: {
  memberships: PlantillaMembership[];
  ranking: PlantillaRankingRow[];
  club: PlantillaClub | null;
}) {
  if (!club) return [] as PlantillaRosterPlayer[];

  const clubId = String(club.club_id || "");
  const clubName = normalizePlantillasText(club.nombre);

  return memberships
    .filter((membership) => {
      if (clubId && String(membership.club_id || "") === clubId) return true;
      return normalizePlantillasText(membership.equipo) === clubName;
    })
    .map((membership) => {
      const row = rankingForMembership(membership, ranking);
      const ratingRaw = Number(row?.rating_apa_promedio);
      return {
        id: String(membership.id),
        name: membership.jugador || row?.nombre || "Jugador",
        playerId: String(membership.playerid || row?.playerId || ""),
        position: String(membership.posicion || row?.posicion || "N/D"),
        status: String(membership.estado || "activo"),
        matches: numberValue(row?.partidos_jugados),
        goals: numberValue(row?.goals),
        assists: numberValue(row?.assists),
        mvps: numberValue(row?.mvp),
        rating: Number.isFinite(ratingRaw) && ratingRaw > 0 ? ratingRaw : null,
      } satisfies PlantillaRosterPlayer;
    })
    .sort((a, b) => {
      const aPosition = a.position === "N/D" ? "ZZ" : a.position;
      const bPosition = b.position === "N/D" ? "ZZ" : b.position;
      return aPosition.localeCompare(bPosition) || a.name.localeCompare(b.name);
    });
}

export function filterPlantillaRoster(roster: PlantillaRosterPlayer[], query: string) {
  const normalized = normalizePlantillasText(query);
  if (!normalized) return roster;
  return roster.filter((player) =>
    [player.name, player.playerId, player.position].some((value) =>
      normalizePlantillasText(value).includes(normalized),
    ),
  );
}

export function summarizePlantilla(roster: PlantillaRosterPlayer[]): PlantillaTeamSummary {
  const ratings = roster
    .map((player) => player.rating)
    .filter((value): value is number => value != null);

  return {
    players: roster.length,
    appearances: roster.reduce((total, player) => total + player.matches, 0),
    goals: roster.reduce((total, player) => total + player.goals, 0),
    assists: roster.reduce((total, player) => total + player.assists, 0),
    mvps: roster.reduce((total, player) => total + player.mvps, 0),
    averageRating:
      ratings.length > 0
        ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
        : null,
  };
}
