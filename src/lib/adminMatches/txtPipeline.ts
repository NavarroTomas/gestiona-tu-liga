import {
  assignNeutralPlayersToTeams,
  buildRawPlayerKey,
  cleanText,
  collectRawPlayers,
  combinePlayerStats,
  combineTeamStats,
  detectSegmentMinutes,
  numberValue,
  parseSegmentPayload,
  sha256,
  type OrdenTxt,
  type ParsedMatchSegment,
  type PlayerResolution,
} from "@/lib/matchStatsUpload";
import { calculateRatingAPA, normalizeMatchText } from "./domain";
import type {
  MatchTxtSegmentInput,
  PlayerAliasInput,
  PlayerMatchStats,
  TeamMatchStats,
} from "./types";

export type TxtLoadMode = "reemplazar" | "agregar";

export type TxtDbSegment = {
  id: string;
  partido_id: string;
  archivo_nombre: string;
  archivo_hash: string;
  orden_txt: OrdenTxt;
  duracion_minutos: number | null;
  goles_local: number | null;
  goles_visitante: number | null;
  payload: any;
};

export type TxtRosterRow = {
  jugador: string | null;
  playerid: string | null;
  equipo: string | null;
  posicion?: string | null;
  estado?: string | null;
};

export type TxtAliasRow = {
  alias_player_id: string;
  canonical_player_id: string;
  canonical_name?: string | null;
};

export async function parseTxtFiles({
  files,
  order,
  mode,
  existing,
}: {
  files: File[];
  order: OrdenTxt;
  mode: TxtLoadMode;
  existing: TxtDbSegment[];
}) {
  if (files.length === 0) throw new Error("Elegí al menos un TXT o JSON.");

  const newSegments: ParsedMatchSegment[] = [];
  const newHashes = new Set<string>();

  for (const file of files) {
    const text = await file.text();
    const hash = await sha256(text);
    if (newHashes.has(hash)) throw new Error(`El archivo ${file.name} está repetido.`);
    newHashes.add(hash);

    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`${file.name}: el contenido no es JSON válido.`);
    }

    newSegments.push(
      parseSegmentPayload({
        payload,
        fileName: file.name,
        fileHash: hash,
        order,
        minutes: detectSegmentMinutes(payload),
        source: "new",
      }),
    );
  }

  const previous =
    mode === "agregar"
      ? existing.map((segment) =>
          parseSegmentPayload({
            payload: segment.payload,
            fileName: segment.archivo_nombre,
            fileHash: segment.archivo_hash,
            order: segment.orden_txt,
            minutes: Number(segment.duracion_minutos || 0),
            source: "existing",
            dbId: segment.id,
          }),
        )
      : [];

  const combined = [...previous, ...newSegments];
  const allHashes = new Set<string>();
  for (const segment of combined) {
    if (allHashes.has(segment.fileHash)) {
      throw new Error(`El TXT ${segment.fileName} ya forma parte de este partido.`);
    }
    allHashes.add(segment.fileHash);
  }

  return combined;
}

export function prepareTxtPlayers({
  segments,
  roster,
  aliases,
  localTeam,
  visitorTeam,
}: {
  segments: ParsedMatchSegment[];
  roster: TxtRosterRow[];
  aliases: TxtAliasRow[];
  localTeam: string;
  visitorTeam: string;
}) {
  const assigned = assignNeutralPlayersToTeams({
    segments,
    roster,
    localTeam,
    visitorTeam,
  });

  const rawPlayers = collectRawPlayers(assigned, localTeam, visitorTeam);
  const resolutions: Record<string, PlayerResolution> = {};

  for (const raw of rawPlayers) {
    const exact = roster.find(
      (row) =>
        cleanText(row.playerid) === raw.rawPlayerId &&
        normalizeMatchText(row.equipo) === normalizeMatchText(raw.team),
    );
    const alias = aliases.find((row) => row.alias_player_id === raw.rawPlayerId);
    const canonicalRoster = alias
      ? roster.find((row) => cleanText(row.playerid) === alias.canonical_player_id)
      : undefined;

    if (exact) {
      resolutions[raw.rawKey] = {
        rawKey: raw.rawKey,
        rawPlayerId: raw.rawPlayerId,
        rawName: raw.rawName,
        team: raw.team,
        action: "map",
        canonicalPlayerId: cleanText(exact.playerid),
        canonicalName: cleanText(exact.jugador) || raw.rawName,
        saveAlias: false,
        source: "roster",
      };
    } else if (alias) {
      resolutions[raw.rawKey] = {
        rawKey: raw.rawKey,
        rawPlayerId: raw.rawPlayerId,
        rawName: raw.rawName,
        team: raw.team,
        action: "map",
        canonicalPlayerId: alias.canonical_player_id,
        canonicalName:
          cleanText(canonicalRoster?.jugador) ||
          cleanText(alias.canonical_name) ||
          raw.rawName,
        saveAlias: false,
        source: "alias",
      };
    } else {
      resolutions[raw.rawKey] = {
        rawKey: raw.rawKey,
        rawPlayerId: raw.rawPlayerId,
        rawName: raw.rawName,
        team: raw.team,
        action: "new",
        canonicalPlayerId: raw.rawPlayerId,
        canonicalName: raw.rawName,
        saveAlias: false,
        source: "new",
      };
    }
  }

  return { segments: assigned, rawPlayers, resolutions };
}

export function detectZeroStatPlayers(
  segments: ParsedMatchSegment[],
  localTeam: string,
  visitorTeam: string,
) {
  const scoreByPlayer = new Map<string, number>();

  const visit = (player: any, team: string) => {
    const key = buildRawPlayerKey(
      cleanText(player?.playerId),
      cleanText(player?.playerName),
      team,
    );
    const score = numberValue(player?.score);
    scoreByPlayer.set(key, Math.max(scoreByPlayer.get(key) || 0, score));
  };

  for (const segment of segments) {
    segment.localPlayers.forEach((player) => visit(player, localTeam));
    segment.visitorPlayers.forEach((player) => visit(player, visitorTeam));
  }

  const suspicious: Record<string, boolean> = {};
  for (const [key, score] of scoreByPlayer.entries()) {
    if (score <= 0) suspicious[key] = true;
  }
  return suspicious;
}

export function filterExcludedPlayers({
  segments,
  excluded,
  localTeam,
  visitorTeam,
}: {
  segments: ParsedMatchSegment[];
  excluded: Record<string, boolean>;
  localTeam: string;
  visitorTeam: string;
}) {
  const keep = (player: any, team: string) =>
    !excluded[
      buildRawPlayerKey(
        cleanText(player?.playerId),
        cleanText(player?.playerName),
        team,
      )
    ];

  return segments.map((segment) => ({
    ...segment,
    localPlayers: segment.localPlayers.filter((player) => keep(player, localTeam)),
    visitorPlayers: segment.visitorPlayers.filter((player) => keep(player, visitorTeam)),
  }));
}

function playerMvpOrder(a: PlayerMatchStats, b: PlayerMatchStats) {
  const byScore = numberValue(b.score) - numberValue(a.score);
  if (byScore !== 0) return byScore;

  const byOverall = numberValue(b.overallRating) - numberValue(a.overallRating);
  if (byOverall !== 0) return byOverall;

  const byGoals = numberValue(b.goals) - numberValue(a.goals);
  if (byGoals !== 0) return byGoals;

  const byAssists = numberValue(b.assists) - numberValue(a.assists);
  if (byAssists !== 0) return byAssists;

  const byPlayerId = cleanText(a.playerId).localeCompare(cleanText(b.playerId), "es");
  if (byPlayerId !== 0) return byPlayerId;

  return normalizeMatchText(a.nombre).localeCompare(normalizeMatchText(b.nombre), "es");
}

export function buildTxtCommitData({
  segments,
  resolutions,
  excluded,
  corrections,
  localTeam,
  visitorTeam,
}: {
  segments: ParsedMatchSegment[];
  resolutions: Record<string, PlayerResolution>;
  excluded: Record<string, boolean>;
  corrections: Record<string, { goals: number; assists: number }>;
  localTeam: string;
  visitorTeam: string;
}) {
  const filteredSegments = filterExcludedPlayers({
    segments,
    excluded,
    localTeam,
    visitorTeam,
  });

  const teamStats: TeamMatchStats[] = [
    {
      equipo: localTeam,
      ...combineTeamStats(filteredSegments, "local"),
    },
    {
      equipo: visitorTeam,
      ...combineTeamStats(filteredSegments, "visitor"),
    },
  ];

  const players = combinePlayerStats({
    segments: filteredSegments,
    resolutions,
    localTeam,
    visitorTeam,
  });

  const correctedPlayers = players.map((player) => {
    const key = `${normalizeMatchText(player.equipo)}__${
      cleanText(player.playerId)
        ? `id:${cleanText(player.playerId)}`
        : `name:${normalizeMatchText(player.nombre)}`
    }`;
    const correction = corrections[key];
    return correction
      ? { ...player, goals: correction.goals, assists: correction.assists }
      : player;
  });

  const mvpWinner = correctedPlayers
    .filter((player) => numberValue(player.score) > 0)
    .slice()
    .sort(playerMvpOrder)[0];

  const mvpKey = mvpWinner
    ? `${normalizeMatchText(mvpWinner.equipo)}__${
        cleanText(mvpWinner.playerId)
          ? `id:${cleanText(mvpWinner.playerId)}`
          : `name:${normalizeMatchText(mvpWinner.nombre)}`
      }`
    : null;

  const playerStats: PlayerMatchStats[] = correctedPlayers.map((player) => {
    const playerKey = `${normalizeMatchText(player.equipo)}__${
      cleanText(player.playerId)
        ? `id:${cleanText(player.playerId)}`
        : `name:${normalizeMatchText(player.nombre)}`
    }`;

    return {
      ...player,
      mvp: mvpKey && playerKey === mvpKey ? 1 : 0,
      rating_apa: calculateRatingAPA(player),
    };
  });

  const txtSegments: MatchTxtSegmentInput[] = filteredSegments.map((segment) => ({
    archivo_nombre: segment.fileName,
    archivo_hash: segment.fileHash,
    orden_txt: segment.order,
    duracion_minutos: segment.minutes,
    goles_local: numberValue(segment.localStats?.goals),
    goles_visitante: numberValue(segment.visitorStats?.goals),
    payload: segment.payload,
  }));

  const aliases: PlayerAliasInput[] = Object.values(resolutions)
    .filter((resolution) => resolution.saveAlias && resolution.action === "map")
    .map((resolution) => ({
      alias_player_id: resolution.rawPlayerId,
      canonical_player_id: resolution.canonicalPlayerId,
      canonical_name: resolution.canonicalName,
      source_player_name: resolution.rawName,
      equipo: resolution.team,
    }));

  const result = `${numberValue(teamStats[0]?.goals)}-${numberValue(teamStats[1]?.goals)}`;

  return {
    result,
    teamStats,
    players: playerStats,
    txtSegments,
    aliases,
  };
}

export function reconciliationRows({
  players,
  teams,
  localTeam,
  visitorTeam,
}: {
  players: PlayerMatchStats[];
  teams: TeamMatchStats[];
  localTeam: string;
  visitorTeam: string;
}) {
  return [localTeam, visitorTeam].map((team) => {
    const playerGoals = players
      .filter((player) => normalizeMatchText(player.equipo) === normalizeMatchText(team))
      .reduce((sum, player) => sum + numberValue(player.goals), 0);
    const playerAssists = players
      .filter((player) => normalizeMatchText(player.equipo) === normalizeMatchText(team))
      .reduce((sum, player) => sum + numberValue(player.assists), 0);
    const teamStats = teams.find((row) => normalizeMatchText(row.equipo) === normalizeMatchText(team));
    return {
      team,
      teamGoals: numberValue(teamStats?.goals),
      playerGoals,
      teamAssists: numberValue(teamStats?.assists),
      playerAssists,
    };
  });
}
