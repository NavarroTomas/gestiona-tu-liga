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


type TxtSide = "team1" | "team2";

const PLAYER_DETECTION_FIELDS = [
  ...PLAYER_SUM_FIELDS,
  "overallRating",
  "yellowCards",
  "redCards",
  "minutesPlayed",
  "timePlayed",
  "playTime",
  "secondsPlayed",
] as const;

const PLAYER_NAME_KEYS = ["playerName", "player_name", "name"] as const;
const PLAYER_ID_KEYS = [
  "playerId",
  "playerID",
  "player_id",
  "steamId",
  "steamID",
] as const;
const PLAYER_TEAM_KEYS = [
  "team",
  "Team",
  "teamName",
  "team_name",
  "teamColor",
  "teamColour",
  "side",
  "color",
  "colour",
] as const;

function firstTextValue(
  value: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    const text = cleanText(value[key]);
    if (text) return text;
  }
  return "";
}

function normalizePlayerRecord(player: Record<string, unknown>) {
  const normalized: Record<string, unknown> = { ...player };

  const playerName = firstTextValue(player, PLAYER_NAME_KEYS);
  const playerId = firstTextValue(player, PLAYER_ID_KEYS);
  const team = firstTextValue(player, PLAYER_TEAM_KEYS);
  const position = cleanText(
    player.postion ?? player.position ?? player.playerPosition,
  );

  if (playerName) normalized.playerName = playerName;
  if (playerId) normalized.playerId = playerId;
  if (team) normalized.team = team;
  if (position) normalized.position = position;

  return normalized;
}

function playerStatFieldCount(record: Record<string, unknown>) {
  return PLAYER_DETECTION_FIELDS.reduce(
    (count, field) => count + (field in record ? 1 : 0),
    0,
  );
}

function hasPlayerIdentity(record: Record<string, unknown>) {
  return Boolean(
    firstTextValue(record, PLAYER_NAME_KEYS) ||
      firstTextValue(record, PLAYER_ID_KEYS),
  );
}

function looksLikePlayerStats(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const record = value as Record<string, unknown>;
  return hasPlayerIdentity(record) && playerStatFieldCount(record) >= 2;
}

// Algunos TXT de PSO separan al mismo jugador en dos objetos consecutivos:
// uno contiene las estadísticas y el siguiente playerName/playerId/posición/equipo.
// Ejemplo real:
// { passes: 11, goals: 1, score: 315 },
// { playerName: "17", playerId: "...", postion: "LCM", team: "Blue" }
function looksLikeStatFragment(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return !hasPlayerIdentity(record) && playerStatFieldCount(record) >= 3;
}

function looksLikeIdentityFragment(
  value: unknown,
): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return hasPlayerIdentity(record) && playerStatFieldCount(record) < 2;
}

function joinPlayerFragments(first: unknown, second: unknown) {
  if (looksLikeStatFragment(first) && looksLikeIdentityFragment(second)) {
    return normalizePlayerRecord({ ...first, ...second });
  }

  if (looksLikeIdentityFragment(first) && looksLikeStatFragment(second)) {
    return normalizePlayerRecord({ ...second, ...first });
  }

  return null;
}

function pathSide(path: string[]): TxtSide | null {
  const normalized = normalizeText(path.join("."));

  if (
    /(^|[._-])(team1|team_1|blue|local|home)([._-]|$)/.test(normalized)
  ) {
    return "team1";
  }
  if (
    /(^|[._-])(team2|team_2|red|visitante|visitor|away)([._-]|$)/.test(
      normalized,
    )
  ) {
    return "team2";
  }

  return null;
}

function addTeamAlias(
  aliases: Map<string, TxtSide>,
  value: unknown,
  side: TxtSide,
) {
  const normalized = normalizeText(value);
  if (!normalized) return;

  const current = aliases.get(normalized);
  if (!current || current === side) aliases.set(normalized, side);
}

function buildTeamAliases(payload: any) {
  const aliases = new Map<string, TxtSide>();
  const team1Players = Array.isArray(payload?.team1PlayerStats)
    ? payload.team1PlayerStats
    : [];
  const team2Players = Array.isArray(payload?.team2PlayerStats)
    ? payload.team2PlayerStats
    : [];

  const addFromRecord = (record: any, side: TxtSide) => {
    if (!record || typeof record !== "object") return;
    for (const key of PLAYER_TEAM_KEYS) addTeamAlias(aliases, record[key], side);
  };

  addFromRecord(payload?.team1Stats, "team1");
  addFromRecord(payload?.team2Stats, "team2");
  team1Players.forEach((player: any) => addFromRecord(player, "team1"));
  team2Players.forEach((player: any) => addFromRecord(player, "team2"));

  // Fallback habitual de MatchStats. Si el TXT informa otra relación,
  // las etiquetas detectadas arriba prevalecen.
  if (!aliases.has("blue")) aliases.set("blue", "team1");
  if (!aliases.has("red")) aliases.set("red", "team2");

  return aliases;
}

function playerIdentity(player: any) {
  const playerId = cleanText(player?.playerId);
  if (playerId) return `id:${playerId}`;
  return `name:${normalizeText(player?.playerName)}`;
}

function snapshotStrength(player: any) {
  return PLAYER_SUM_FIELDS.reduce(
    (total, field) => total + Math.max(0, numberValue(player?.[field])),
    0,
  );
}

function mergePlayerSnapshot(current: any, candidate: any) {
  const currentValues = PLAYER_SUM_FIELDS.map((field) =>
    numberValue(current?.[field]),
  );
  const candidateValues = PLAYER_SUM_FIELDS.map((field) =>
    numberValue(candidate?.[field]),
  );

  const equal = currentValues.every(
    (value, index) => value === candidateValues[index],
  );
  const currentDominates = currentValues.every(
    (value, index) => value >= candidateValues[index],
  );
  const candidateDominates = candidateValues.every(
    (value, index) => value >= currentValues[index],
  );

  // Copias idénticas o snapshots acumulativos: conservar solo la versión más
  // completa evita duplicar a quienes también aparecen en listas históricas.
  if (equal || currentDominates || candidateDominates) {
    const currentStrength = snapshotStrength(current);
    const candidateStrength = snapshotStrength(candidate);
    return candidateStrength >= currentStrength
      ? { ...current, ...candidate }
      : { ...candidate, ...current };
  }

  // Si ninguno domina al otro, se consideran tramos distintos del mismo
  // jugador (por ejemplo, salió y volvió a entrar con contadores reiniciados).
  const currentStrength = Math.max(1, snapshotStrength(current));
  const candidateStrength = Math.max(1, snapshotStrength(candidate));
  const merged: Record<string, unknown> = { ...current, ...candidate };

  for (const field of PLAYER_SUM_FIELDS) {
    merged[field] =
      numberValue(current?.[field]) + numberValue(candidate?.[field]);
  }

  merged.overallRating =
    (numberValue(current?.overallRating) * currentStrength +
      numberValue(candidate?.overallRating) * candidateStrength) /
    (currentStrength + candidateStrength);

  if (!cleanText(merged.playerName)) {
    merged.playerName = cleanText(current?.playerName || candidate?.playerName);
  }
  if (!cleanText(merged.playerId)) {
    merged.playerId = cleanText(current?.playerId || candidate?.playerId);
  }

  return merged;
}

function extractPlayersFromPayload(payload: any) {
  const aliases = buildTeamAliases(payload);
  const bySide: Record<TxtSide, Map<string, any>> = {
    team1: new Map<string, any>(),
    team2: new Map<string, any>(),
  };
  const knownIdentitySide = new Map<string, TxtSide>();

  const add = (rawPlayer: any, side: TxtSide) => {
    const player = normalizePlayerRecord(rawPlayer);
    const identity = playerIdentity(player);
    if (identity === "name:") return;

    knownIdentitySide.set(identity, side);
    const current = bySide[side].get(identity);
    bySide[side].set(
      identity,
      current ? mergePlayerSnapshot(current, player) : player,
    );
  };

  const canonicalTeam1 = Array.isArray(payload?.team1PlayerStats)
    ? payload.team1PlayerStats
    : [];
  const canonicalTeam2 = Array.isArray(payload?.team2PlayerStats)
    ? payload.team2PlayerStats
    : [];
  canonicalTeam1.forEach((player: any) => add(player, "team1"));
  canonicalTeam2.forEach((player: any) => add(player, "team2"));

  const candidates: { player: Record<string, unknown>; path: string[] }[] = [];
  const visited = new Set<object>();

  const walk = (value: unknown, path: string[]) => {
    if (!value || typeof value !== "object") return;
    if (visited.has(value as object)) return;
    visited.add(value as object);

    if (looksLikePlayerStats(value)) {
      candidates.push({
        player: normalizePlayerRecord(value),
        path,
      });
    }

    if (Array.isArray(value)) {
      // Caso excepcional de PSO: estadísticas e identidad vienen separadas
      // en objetos vecinos. Se unen antes de recorrer cada elemento.
      for (let index = 0; index < value.length - 1; index += 1) {
        const first = value[index];
        const second = value[index + 1];
        const joined = joinPlayerFragments(first, second);

        if (joined) {
          candidates.push({
            player: joined,
            path: [...path, String(index)],
          });
          index += 1;
        }
      }

      value.forEach((item, index) => walk(item, [...path, String(index)]));
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      walk(child, [...path, key]);
    }
  };

  walk(payload, []);

  for (const candidate of candidates) {
    const explicitTeam = firstTextValue(candidate.player, PLAYER_TEAM_KEYS);
    const sideFromTeam = aliases.get(normalizeText(explicitTeam));
    const sideFromPath = pathSide(candidate.path);
    const identity = playerIdentity(candidate.player);
    const side = sideFromTeam || sideFromPath || knownIdentitySide.get(identity);

    if (side) add(candidate.player, side);
  }

  return {
    team1Players: Array.from(bySide.team1.values()),
    team2Players: Array.from(bySide.team2.values()),
  };
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

  const extractedPlayers = extractPlayersFromPayload(payload);
  const localPlayers =
    order === "normal"
      ? extractedPlayers.team1Players
      : extractedPlayers.team2Players;
  const visitorPlayers =
    order === "normal"
      ? extractedPlayers.team2Players
      : extractedPlayers.team1Players;

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

