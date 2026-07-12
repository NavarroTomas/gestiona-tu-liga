export type OrdenTxt = "normal" | "invertido";

export type ParsedMatchSegment = {
  source: "existing" | "new";
  dbId?: string;
  fileName: string;
  fileHash: string;
  order: OrdenTxt;
  minutes: number;
  payload: any;
  localStats: any;
  visitorStats: any;
  localPlayers: any[];
  visitorPlayers: any[];
};


export type ConsolidatedPlayer = {
  nombre: string;
  playerId: string;
  posicion: string;
  equipo: string;
  passes: number;
  keyPasses: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  goals: number;
  tackles: number;
  keyTackles: number;
  interceptions: number;
  keyInterceptions: number;
  possessionsLost: number;
  gKSaves: number;
  gKCatches: number;
  score: number;
  overallRating: number;
};

export type PlayerResolution = {
  rawKey: string;
  rawPlayerId: string;
  rawName: string;
  team: string;
  action: "new" | "map" | "ignore";
  canonicalPlayerId: string;
  canonicalName: string;
  saveAlias: boolean;
  source: "roster" | "alias" | "manual" | "new";
};

const TEAM_SUM_FIELDS = [
  "passes",
  "keyPasses",
  "assists",
  "shots",
  "shotsOnTarget",
  "goals",
  "tackles",
  "keyTackles",
  "interceptions",
  "keyInterceptions",
  "possessionsLost",
  "fouls",
  "offsides",
  "handballs",
  "setPieceTimeouts",
  "freeKicks",
  "penalties",
  "goalKicks",
  "cornerKicks",
  "throwIns",
  "yellowCards",
  "redCards",
] as const;

const PLAYER_SUM_FIELDS = [
  "passes",
  "keyPasses",
  "assists",
  "shots",
  "shotsOnTarget",
  "goals",
  "tackles",
  "keyTackles",
  "interceptions",
  "keyInterceptions",
  "possessionsLost",
  "gKSaves",
  "gKCatches",
  "score",
] as const;

export function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeText(value: unknown) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function buildRawPlayerKey(
  playerId: unknown,
  name: unknown,
  team: unknown,
) {
  const id = cleanText(playerId);
  if (id) return `id:${id}`;
  return `name:${normalizeText(team)}:${normalizeText(name)}`;
}

function parseClockString(value: string) {
  const match = value.trim().match(/^(\d{1,3}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) return 0;

  if (match[3] !== undefined) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3]);
    return hours * 60 + minutes + seconds / 60;
  }

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return minutes + seconds / 60;
}

function durationCandidateToMinutes(value: unknown) {
  if (typeof value === "string") {
    const clock = parseClockString(value);
    if (clock > 0) return clock;

    const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
    if (!normalized) return 0;
    value = Number(normalized);
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;

  // MatchStats suele expresar tiempos en minutos, segundos o milisegundos.
  if (numeric > 10000) return numeric / 60000;
  if (numeric > 60) return numeric / 60;
  return numeric;
}

export function detectSegmentMinutes(payload: any) {
  const directCandidates = [
    payload?.matchDuration,
    payload?.matchLength,
    payload?.duration,
    payload?.elapsedTime,
    payload?.gameTime,
    payload?.matchTime,
    payload?.timePlayed,
    payload?.matchInfo?.duration,
    payload?.matchInfo?.elapsedTime,
    payload?.gameInfo?.duration,
    payload?.gameInfo?.elapsedTime,
  ];

  for (const candidate of directCandidates) {
    const minutes = durationCandidateToMinutes(candidate);
    if (minutes > 0) return Math.round(minutes * 100) / 100;
  }

  const playerCollections = [
    payload?.team1PlayerStats,
    payload?.team2PlayerStats,
  ].filter(Array.isArray) as any[][];

  let maxMinutes = 0;
  for (const collection of playerCollections) {
    for (const player of collection) {
      const candidates = [
        player?.minutesPlayed,
        player?.timePlayed,
        player?.playTime,
        player?.secondsPlayed,
      ];
      for (const candidate of candidates) {
        maxMinutes = Math.max(
          maxMinutes,
          durationCandidateToMinutes(candidate),
        );
      }
    }
  }

  return Math.round(maxMinutes * 100) / 100;
}

export async function sha256(text: string) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function parseSegmentPayload({
  payload,
  fileName,
  fileHash,
  order,
  minutes,
  source,
  dbId,
}: {
  payload: any;
  fileName: string;
  fileHash: string;
  order: OrdenTxt;
  minutes?: number;
  source: "existing" | "new";
  dbId?: string;
}): ParsedMatchSegment {
  if (!payload?.team1Stats || !payload?.team2Stats) {
    throw new Error(`${fileName}: faltan team1Stats o team2Stats.`);
  }

  const localStats =
    order === "normal" ? payload.team1Stats : payload.team2Stats;
  const visitorStats =
    order === "normal" ? payload.team2Stats : payload.team1Stats;
  const localPlayers =
    order === "normal"
      ? payload.team1PlayerStats || []
      : payload.team2PlayerStats || [];
  const visitorPlayers =
    order === "normal"
      ? payload.team2PlayerStats || []
      : payload.team1PlayerStats || [];

  return {
    source,
    dbId,
    fileName,
    fileHash,
    order,
    minutes: Number(minutes ?? detectSegmentMinutes(payload)) || 0,
    payload,
    localStats,
    visitorStats,
    localPlayers: Array.isArray(localPlayers) ? localPlayers : [],
    visitorPlayers: Array.isArray(visitorPlayers) ? visitorPlayers : [],
  };
}

function weightedAverage(values: { value: number; weight: number }[]) {
  if (values.length === 0) return 0;
  const totalWeight = values.reduce((acc, item) => acc + item.weight, 0);
  if (totalWeight <= 0) {
    return values.reduce((acc, item) => acc + item.value, 0) / values.length;
  }
  return (
    values.reduce((acc, item) => acc + item.value * item.weight, 0) /
    totalWeight
  );
}

export function combineTeamStats(
  segments: ParsedMatchSegment[],
  side: "local" | "visitor",
) {
  const combined: Record<string, number> = {};

  for (const field of TEAM_SUM_FIELDS) {
    combined[field] = segments.reduce((acc, segment) => {
      const stats =
        side === "local" ? segment.localStats : segment.visitorStats;
      return acc + numberValue(stats?.[field]);
    }, 0);
  }

  combined.possession = weightedAverage(
    segments.map((segment) => ({
      value: numberValue(
        side === "local"
          ? segment.localStats?.possession
          : segment.visitorStats?.possession,
      ),
      weight: segment.minutes > 0 ? segment.minutes : 1,
    })),
  );

  return combined;
}

export function collectRawPlayers(
  segments: ParsedMatchSegment[],
  localTeam: string,
  visitorTeam: string,
) {
  const map = new Map<
    string,
    {
      rawKey: string;
      rawPlayerId: string;
      rawName: string;
      team: string;
      appearances: number;
    }
  >();

  const addPlayer = (player: any, team: string) => {
    const rawName = cleanText(player?.playerName);
    const rawPlayerId = cleanText(player?.playerId);
    if (!rawName && !rawPlayerId) return;

    const rawKey = buildRawPlayerKey(rawPlayerId, rawName, team);
    const current = map.get(rawKey);
    if (current) {
      current.appearances += 1;
      if (!current.rawName && rawName) current.rawName = rawName;
      return;
    }

    map.set(rawKey, {
      rawKey,
      rawPlayerId,
      rawName: rawName || "Sin nombre",
      team,
      appearances: 1,
    });
  };

  for (const segment of segments) {
    segment.localPlayers.forEach((player) => addPlayer(player, localTeam));
    segment.visitorPlayers.forEach((player) => addPlayer(player, visitorTeam));
  }

  return Array.from(map.values()).sort((a, b) => {
    const teamCompare = a.team.localeCompare(b.team);
    return teamCompare || a.rawName.localeCompare(b.rawName);
  });
}

export function combinePlayerStats({
  segments,
  resolutions,
  localTeam,
  visitorTeam,
}: {
  segments: ParsedMatchSegment[];
  resolutions: Record<string, PlayerResolution>;
  localTeam: string;
  visitorTeam: string;
}): ConsolidatedPlayer[] {
  type Aggregated = Omit<ConsolidatedPlayer, "overallRating"> & {
    _ratingValues: { value: number; weight: number }[];
  };

  const map = new Map<string, Aggregated>();

  const addPlayer = (
    player: any,
    team: string,
    segment: ParsedMatchSegment,
  ) => {
    const rawName = cleanText(player?.playerName);
    const rawPlayerId = cleanText(player?.playerId);
    if (!rawName && !rawPlayerId) return;

    const rawKey = buildRawPlayerKey(rawPlayerId, rawName, team);
    const resolution = resolutions[rawKey];
    if (resolution?.action === "ignore") return;

    const canonicalPlayerId = cleanText(
      resolution?.canonicalPlayerId || rawPlayerId,
    );
    const canonicalName = cleanText(
      resolution?.canonicalName || rawName || "Sin nombre",
    );
    const aggregationKey = canonicalPlayerId
      ? `${team}__id:${canonicalPlayerId}`
      : `${team}__name:${normalizeText(canonicalName)}`;

    if (!map.has(aggregationKey)) {
      map.set(aggregationKey, {
        nombre: canonicalName,
        playerId: canonicalPlayerId,
        posicion: cleanText(player?.postion || player?.position),
        equipo: team,
        passes: 0,
        keyPasses: 0,
        assists: 0,
        shots: 0,
        shotsOnTarget: 0,
        goals: 0,
        tackles: 0,
        keyTackles: 0,
        interceptions: 0,
        keyInterceptions: 0,
        possessionsLost: 0,
        gKSaves: 0,
        gKCatches: 0,
        score: 0,
        _ratingValues: [],
      });
    }

    const current = map.get(aggregationKey)!;
    if (canonicalName) current.nombre = canonicalName;
    if (cleanText(player?.postion || player?.position)) {
      current.posicion = cleanText(player?.postion || player?.position);
    }

    for (const field of PLAYER_SUM_FIELDS) {
      current[field] += numberValue(player?.[field]);
    }

    current._ratingValues.push({
      value: numberValue(player?.overallRating),
      weight: segment.minutes > 0 ? segment.minutes : 1,
    });
  };

  for (const segment of segments) {
    segment.localPlayers.forEach((player) =>
      addPlayer(player, localTeam, segment),
    );
    segment.visitorPlayers.forEach((player) =>
      addPlayer(player, visitorTeam, segment),
    );
  }

  return Array.from(map.values()).map((player): ConsolidatedPlayer => {
    const overallRating = weightedAverage(player._ratingValues);
    return {
      nombre: player.nombre,
      playerId: player.playerId,
      posicion: player.posicion,
      equipo: player.equipo,
      passes: player.passes,
      keyPasses: player.keyPasses,
      assists: player.assists,
      shots: player.shots,
      shotsOnTarget: player.shotsOnTarget,
      goals: player.goals,
      tackles: player.tackles,
      keyTackles: player.keyTackles,
      interceptions: player.interceptions,
      keyInterceptions: player.keyInterceptions,
      possessionsLost: player.possessionsLost,
      gKSaves: player.gKSaves,
      gKCatches: player.gKCatches,
      score: player.score,
      overallRating: Math.round(overallRating * 100) / 100,
    };
  });
}

