"use client";
import { displayLabel } from "@/lib/displayLabels";


import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import { supabase } from "@/lib/supabase";
import { matchFitsContext } from "@/lib/competitionData";
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
import {
  AdminMatch,
  ADMIN_MATCH_COMPETITIONS,
  MatchPlayerStat,
  MatchTeamStat,
  MatchTxtSegment,
  RosterPlayer,
  calculateApaRating,
  commitMatchData,
  fetchAdminMatches,
  fetchMatchRoster,
  matchContextLabel,
  stableAdminMatchId,
  textValue,
  validateMatchStats,
} from "@/lib/adminMatches";
import {
  Field,
  Input,
  MatchCard,
  MatchHeader,
  MatchPage,
  Notice,
  Select,
  Textarea,
  matchStyles as styles,
} from "./MatchWorkspace";

type DbSegment = {
  id: string;
  partido_id: string;
  archivo_nombre: string;
  archivo_hash: string;
  orden_txt: OrdenTxt;
  duracion_minutos: number | null;
  payload: any;
};

type AliasRow = {
  alias_player_id: string;
  canonical_player_id: string;
  canonical_name: string | null;
};

const DIVISIONS = ["Primera", "Segunda"];
const GROUPS = ["A", "B", "C", "D"];
const CUP_PHASES = ["Octavos", "Cuartos", "Semifinal", "3er Puesto", "Final"];
const CHAMPIONS_PHASES = ["Semifinal", "Final"];
const PLAYOFF_PHASES = ["Semifinal", "Final Ascenso", "Promoción"];

function phaseDb(value: string) {
  const text = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (text.startsWith("oct")) return "octavos";
  if (text.startsWith("cuart")) return "cuartos";
  if (text.startsWith("semi")) return "semifinal";
  if (text.includes("3er")) return "3er_puesto";
  if (text.includes("final ascenso")) return "final_ascenso";
  if (text.includes("promoc")) return "promocion";
  if (text === "final") return "final";
  return text.replace(/\s+/g, "_");
}

function teamRow(stats: Record<string, number>, match: AdminMatch, team: string, partidoId: string): MatchTeamStat {
  return {
    partido_id: partidoId,
    equipo: team,
    temporada: textValue(match.temporada) || "Temporada 4",
    division: textValue(match.division) || textValue(match.fase) || "General",
    fecha: textValue(match.fecha) || "1",
    passes: numberValue(stats.passes), keyPasses: numberValue(stats.keyPasses), assists: numberValue(stats.assists),
    shots: numberValue(stats.shots), shotsOnTarget: numberValue(stats.shotsOnTarget), goals: numberValue(stats.goals),
    tackles: numberValue(stats.tackles), keyTackles: numberValue(stats.keyTackles), interceptions: numberValue(stats.interceptions),
    keyInterceptions: numberValue(stats.keyInterceptions), possession: numberValue(stats.possession), possessionsLost: numberValue(stats.possessionsLost),
    fouls: numberValue(stats.fouls), offsides: numberValue(stats.offsides), handballs: numberValue(stats.handballs),
    setPieceTimeouts: numberValue(stats.setPieceTimeouts), freeKicks: numberValue(stats.freeKicks), penalties: numberValue(stats.penalties),
    goalKicks: numberValue(stats.goalKicks), cornerKicks: numberValue(stats.cornerKicks), throwIns: numberValue(stats.throwIns),
    yellowCards: numberValue(stats.yellowCards), redCards: numberValue(stats.redCards),
  };
}

export default function MatchTxtImporter() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [competition, setCompetition] = useState("liga");
  const [division, setDivision] = useState("Primera");
  const [group, setGroup] = useState("A");
  const [phase, setPhase] = useState("Octavos");
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [matchId, setMatchId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [order, setOrder] = useState<OrdenTxt>("normal");
  const [mode, setMode] = useState<"replace" | "append">("replace");
  const [existing, setExisting] = useState<DbSegment[]>([]);
  const [segments, setSegments] = useState<ParsedMatchSegment[]>([]);
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [resolutions, setResolutions] = useState<Record<string, PlayerResolution>>({});
  const [corrections, setCorrections] = useState<Record<string, { goals: number; assists: number }>>({});
  const [reason, setReason] = useState("Importación oficial MatchStats");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const phases = competition === "copa_campeones" ? CHAMPIONS_PHASES : competition === "playoffs" ? PLAYOFF_PHASES : CUP_PHASES;
  const visibleMatches = useMemo(() => matches.filter((match) => matchFitsContext(match, {
    temporada,
    competicion: competition,
    division: competition === "liga" ? division : undefined,
    grupo: competition === "copa_clasificatoria" ? group : undefined,
    fase: ["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(competition) ? phaseDb(phase) : undefined,
  })), [matches, temporada, competition, division, group, phase]);

  const match = useMemo(() => visibleMatches.find((item) => String(item.id) === matchId) || visibleMatches[0] || null, [visibleMatches, matchId]);

  useEffect(() => {
    let active = true;
    fetchAdminMatches({ temporada, competicion: competition })
      .then((rows) => active && setMatches(rows))
      .catch((error) => setMessage(error.message || "No se pudieron cargar los partidos."));
    return () => { active = false; };
  }, [temporada, competition]);

  useEffect(() => {
    if (!visibleMatches.some((item) => String(item.id) === matchId)) setMatchId(String(visibleMatches[0]?.id || ""));
  }, [visibleMatches, matchId]);

  useEffect(() => {
    setAnalyzed(false); setSegments([]); setResolutions({}); setCorrections({}); setFiles([]); setExisting([]);
    if (!match) return;
    const ids = Array.from(new Set([textValue(match.partido_id), stableAdminMatchId(match)].filter(Boolean)));
    supabase.from("partido_txt_segmentos").select("id,partido_id,archivo_nombre,archivo_hash,orden_txt,duracion_minutos,payload").in("partido_id", ids).order("created_at")
      .then(({ data, error }) => {
        if (error) setMessage(error.message);
        else setExisting((data || []) as DbSegment[]);
      });
  }, [match?.id]);

  async function analyze() {
    if (!match || !match.visitante) return setMessage("Elegí un partido programado.");
    if (files.length === 0) return setMessage("Elegí al menos un archivo TXT/JSON de MatchStats.");
    try {
      setLoading(true); setMessage("");
      const newSegments: ParsedMatchSegment[] = [];
      const hashes = new Set<string>();
      for (const file of files) {
        const text = await file.text();
        const hash = await sha256(text);
        if (hashes.has(hash)) throw new Error(`${file.name} está repetido.`);
        hashes.add(hash);
        let payload: any;
        try { payload = JSON.parse(text); } catch { throw new Error(`${file.name} no contiene JSON válido.`); }
        newSegments.push(parseSegmentPayload({ payload, fileName: file.name, fileHash: hash, order, minutes: detectSegmentMinutes(payload), source: "new" }));
      }
      const oldSegments = mode === "append" ? existing.map((row) => parseSegmentPayload({ payload: row.payload, fileName: row.archivo_nombre, fileHash: row.archivo_hash, order: row.orden_txt, minutes: Number(row.duracion_minutos || 0), source: "existing", dbId: row.id })) : [];
      const all = [...oldSegments, ...newSegments];
      const allHashes = new Set<string>();
      for (const segment of all) {
        if (allHashes.has(segment.fileHash)) throw new Error(`${segment.fileName} ya forma parte de esta carga.`);
        allHashes.add(segment.fileHash);
      }

      const nextRoster = await fetchMatchRoster(match);
      setRoster(nextRoster);
      const assigned = assignNeutralPlayersToTeams({ segments: all, roster: nextRoster, localTeam: match.local, visitorTeam: match.visitante });
      const rawPlayers = collectRawPlayers(assigned, match.local, match.visitante);
      const rawIds = rawPlayers.map((row) => row.rawPlayerId).filter(Boolean);
      let aliases: AliasRow[] = [];
      if (rawIds.length) {
        const { data, error } = await supabase.from("player_account_aliases").select("alias_player_id,canonical_player_id,canonical_name").in("alias_player_id", rawIds);
        if (error) throw error;
        aliases = (data || []) as AliasRow[];
      }

      const next: Record<string, PlayerResolution> = {};
      for (const raw of rawPlayers) {
        const exact = nextRoster.find((row) => cleanText(row.playerid) === raw.rawPlayerId && row.equipo === raw.team);
        const alias = aliases.find((row) => row.alias_player_id === raw.rawPlayerId);
        const canonical = alias ? nextRoster.find((row) => cleanText(row.playerid) === alias.canonical_player_id) : undefined;
        next[raw.rawKey] = exact ? {
          rawKey: raw.rawKey, rawPlayerId: raw.rawPlayerId, rawName: raw.rawName, team: raw.team, action: "map",
          canonicalPlayerId: cleanText(exact.playerid), canonicalName: exact.jugador || raw.rawName, saveAlias: false, source: "roster",
        } : alias ? {
          rawKey: raw.rawKey, rawPlayerId: raw.rawPlayerId, rawName: raw.rawName, team: raw.team, action: "map",
          canonicalPlayerId: alias.canonical_player_id, canonicalName: canonical?.jugador || alias.canonical_name || raw.rawName, saveAlias: false, source: "alias",
        } : {
          rawKey: raw.rawKey, rawPlayerId: raw.rawPlayerId, rawName: raw.rawName, team: raw.team, action: "new",
          canonicalPlayerId: raw.rawPlayerId, canonicalName: raw.rawName, saveAlias: false, source: "new",
        };
      }
      setSegments(assigned); setResolutions(next); setCorrections({}); setAnalyzed(true);
    } catch (error: any) {
      setMessage(error.message || "No pude analizar los archivos.");
    } finally { setLoading(false); }
  }

  const neutrals = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const segment of segments) for (const player of segment.neutralPlayers || []) {
      const id = cleanText(player.playerId); const name = cleanText(player.playerName) || "Sin nombre";
      map.set(id || name.toLowerCase(), { id, name });
    }
    return Array.from(map.values());
  }, [segments]);

  function assignNeutral(player: { id: string; name: string }, team: "local" | "visitor" | "ignore") {
    if (!match || !match.visitante) return;
    const equals = (row: any) => player.id ? cleanText(row.playerId) === player.id : cleanText(row.playerName).toLowerCase() === player.name.toLowerCase();
    setSegments((current) => current.map((segment) => {
      const moving = (segment.neutralPlayers || []).filter(equals);
      const neutralPlayers = (segment.neutralPlayers || []).filter((row) => !equals(row));
      if (team === "ignore") return { ...segment, neutralPlayers };
      return team === "local"
        ? { ...segment, neutralPlayers, localPlayers: [...segment.localPlayers, ...moving] }
        : { ...segment, neutralPlayers, visitorPlayers: [...segment.visitorPlayers, ...moving] };
    }));
    if (team !== "ignore") {
      const teamName = team === "local" ? match.local : match.visitante;
      const key = buildRawPlayerKey(player.id, player.name, teamName);
      setResolutions((current) => ({ ...current, [key]: { rawKey: key, rawPlayerId: player.id, rawName: player.name, team: teamName, action: "new", canonicalPlayerId: player.id, canonicalName: player.name, saveAlias: false, source: "manual" } }));
    }
  }

  function changeResolution(rawKey: string, value: string) {
    const current = resolutions[rawKey]; if (!current) return;
    if (value === "ignore") return setResolutions((all) => ({ ...all, [rawKey]: { ...current, action: "ignore", saveAlias: false, source: "manual" } }));
    if (value === "new") return setResolutions((all) => ({ ...all, [rawKey]: { ...current, action: "new", canonicalPlayerId: current.rawPlayerId, canonicalName: current.rawName, saveAlias: false, source: "new" } }));
    const target = roster.find((row) => cleanText(row.playerid) === value); if (!target) return;
    setResolutions((all) => ({ ...all, [rawKey]: { ...current, action: "map", canonicalPlayerId: cleanText(target.playerid), canonicalName: target.jugador, saveAlias: Boolean(current.rawPlayerId && current.rawPlayerId !== cleanText(target.playerid)), source: "manual" } }));
  }

  const previewPlayers = useMemo(() => {
    if (!match || !match.visitante || !analyzed) return [];
    return combinePlayerStats({ segments, resolutions, localTeam: match.local, visitorTeam: match.visitante }).map((row) => {
      const key = `${row.equipo}__${row.playerId || row.nombre}`;
      const correction = corrections[key];
      return correction ? { ...row, goals: correction.goals, assists: correction.assists } : row;
    });
  }, [segments, resolutions, corrections, match, analyzed]);

  function correctPlayer(row: any, field: "goals" | "assists", value: number) {
    const key = `${row.equipo}__${row.playerId || row.nombre}`;
    setCorrections((current) => ({ ...current, [key]: { goals: current[key]?.goals ?? numberValue(row.goals), assists: current[key]?.assists ?? numberValue(row.assists), [field]: Math.max(0, value) } }));
  }

  async function save() {
    if (!match || !match.visitante || !analyzed) return;
    if (neutrals.length) return setMessage("Resolvé todos los jugadores sin equipo antes de guardar.");
    if (!reason.trim()) return setMessage("Indicá un motivo para la auditoría.");
    const partidoId = stableAdminMatchId(match);
    const localRaw = combineTeamStats(segments, "local");
    const visitorRaw = combineTeamStats(segments, "visitor");
    const teamStats = [teamRow(localRaw, match, match.local, partidoId), teamRow(visitorRaw, match, match.visitante, partidoId)];
    const topScore = previewPlayers.length ? Math.max(...previewPlayers.map((row) => numberValue(row.score))) : -1;
    const playerStats: MatchPlayerStat[] = previewPlayers.map((row) => {
      const base: MatchPlayerStat = {
        partido_id: partidoId, nombre: row.nombre, playerId: row.playerId, posicion: row.posicion, equipo: row.equipo,
        temporada: textValue(match.temporada) || temporada, division: textValue(match.division) || textValue(match.fase) || "General", fecha: textValue(match.fecha) || "1",
        passes: row.passes, keyPasses: row.keyPasses, assists: row.assists, shots: row.shots, shotsOnTarget: row.shotsOnTarget, goals: row.goals,
        tackles: row.tackles, keyTackles: row.keyTackles, interceptions: row.interceptions, keyInterceptions: row.keyInterceptions,
        possessionsLost: row.possessionsLost, gKSaves: row.gKSaves, gKCatches: row.gKCatches, score: row.score, overallRating: row.overallRating,
        mvp: numberValue(row.score) === topScore && topScore >= 0 ? 1 : 0,
      };
      return { ...base, rating_apa: calculateApaRating(base) };
    });
    const validation = validateMatchStats({ match, teamStats, playerStats });
    if (validation.errors.length) return setMessage(validation.errors.join(" "));
    const result = `${numberValue(localRaw.goals)}-${numberValue(visitorRaw.goals)}`;
    const warnings = validation.warnings.length ? `\n\nAdvertencias:\n- ${validation.warnings.join("\n- ")}` : "";
    if (!window.confirm(`Confirmar ${match.local} ${result} ${match.visitante} con ${segments.length} TXT?${warnings}`)) return;

    const segmentRows: MatchTxtSegment[] = segments.map((segment) => ({ partido_id: partidoId, partido_row_id: String(match.id), archivo_nombre: segment.fileName, archivo_hash: segment.fileHash, orden_txt: segment.order, duracion_minutos: segment.minutes || null, goles_local: numberValue(segment.localStats?.goals), goles_visitante: numberValue(segment.visitorStats?.goals), payload: segment.payload }));
    try {
      setLoading(true); setMessage("");
      const response = await commitMatchData({ matchRowId: match.id, source: "txt", reason, matchPatch: { partido_id: partidoId, resultado: result, estado: "cargado" }, teamStats, playerStats, segments: segmentRows, clearSegments: true });
      const aliases = Object.values(resolutions).filter((row) => row.action === "map" && row.saveAlias && row.rawPlayerId && row.canonicalPlayerId).map((row) => ({ alias_player_id: row.rawPlayerId, canonical_player_id: row.canonicalPlayerId, canonical_name: row.canonicalName, source_player_name: row.rawName, equipo: row.team }));
      if (aliases.length) {
        const { error } = await supabase.from("player_account_aliases").upsert(aliases, { onConflict: "alias_player_id" });
        if (error) setMessage(`Partido guardado (revisión #${response.revision}), pero no se pudieron guardar ${aliases.length} alias: ${error.message}`);
        else setMessage(`Carga guardada de forma transaccional. Revisión #${response.revision}.`);
      } else setMessage(`Carga guardada de forma transaccional. Revisión #${response.revision}.`);
      setFiles([]); setAnalyzed(false); setSegments([]); setCorrections({});
    } catch (error: any) { setMessage(error.message || "No se pudo guardar la carga."); }
    finally { setLoading(false); }
  }

  const rawPlayers = match?.visitante && analyzed ? collectRawPlayers(segments, match.local, match.visitante) : [];

  return (
    <PermissionGuard permission="matches.upload_txt">
      <MatchPage>
        <MatchHeader eyebrow="Flujo principal" title="Importar MatchStats" description="Analizá uno o varios TXT, resolvé identidades y guardá el partido completo en una única transacción con historial de revisión." />
        {message && <Notice danger={message.toLowerCase().includes("no se") || message.toLowerCase().includes("error")}>{message}</Notice>}

        <MatchCard title="1. Partido programado" description="El resultado siempre se vincula al fixture existente; no se crean partidos paralelos.">
          <div className={styles.grid4}>
            <Field label="Torneo"><Select value={temporada} onChange={(e) => setTemporada(e.target.value)}><option value="Temporada 4">Torneo 4</option></Select></Field>
            <Field label="Competición"><Select value={competition} onChange={(e) => setCompetition(e.target.value)}>{ADMIN_MATCH_COMPETITIONS.map((item) => <option key={item.value} value={item.value}>{displayLabel(item.label)}</option>)}</Select></Field>
            {competition === "liga" && <Field label="División"><Select value={division} onChange={(e) => setDivision(e.target.value)}>{DIVISIONS.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}</Select></Field>}
            {competition === "copa_clasificatoria" && <Field label="Grupo"><Select value={group} onChange={(e) => setGroup(e.target.value)}>{GROUPS.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}</Select></Field>}
            {["copa_argentina","copa_apa","copa_campeones","playoffs"].includes(competition) && <Field label="Fase"><Select value={phase} onChange={(e) => setPhase(e.target.value)}>{phases.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}</Select></Field>}
            <Field label="Partido"><Select value={String(match?.id || "")} onChange={(e) => setMatchId(e.target.value)}>{visibleMatches.length === 0 && <option value="">Sin partidos</option>}{visibleMatches.map((item) => <option key={item.id} value={String(item.id)}>F{item.fecha || "-"} · {item.local} vs {item.visitante}</option>)}</Select></Field>
          </div>
          {match && <p className={styles.muted} style={{ marginTop: 12 }}>{matchContextLabel(match)} · TXT guardados: {existing.length}</p>}
        </MatchCard>

        <MatchCard title="2. Archivos" description="Podés reemplazar la carga completa o sumar nuevos tramos a los TXT ya conservados.">
          <div className={styles.grid3}>
            <Field label="Modo"><Select value={mode} onChange={(e) => setMode(e.target.value as "replace" | "append")}><option value="replace">Reemplazar carga completa</option><option value="append">Agregar a TXT existentes</option></Select></Field>
            <Field label="Orden"><Select value={order} onChange={(e) => setOrder(e.target.value as OrdenTxt)}><option value="normal">Team 1 = local</option><option value="invertido">Team 2 = local</option></Select></Field>
            <Field label="Archivos"><Input type="file" accept=".txt,.json,application/json,text/plain" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} /></Field>
          </div>
          <div className={styles.actions}><button className={styles.primary} type="button" onClick={analyze} disabled={loading}>{loading ? "Analizando..." : "Analizar archivos"}</button></div>
        </MatchCard>

        {analyzed && match && match.visitante && (
          <>
            {neutrals.length > 0 && <MatchCard title="Jugadores sin equipo" description="Asigná cada registro al local, visitante o ignoralo antes de guardar."><div className={styles.playerList}>{neutrals.map((row) => <div key={row.id || row.name} className={styles.playerRow}><strong>{row.name}</strong><div className={styles.actions}><button className={styles.secondary} onClick={() => assignNeutral(row, "local")}>{match.local}</button><button className={styles.secondary} onClick={() => assignNeutral(row, "visitor")}>{match.visitante}</button><button className={styles.danger} onClick={() => assignNeutral(row, "ignore")}>Ignorar</button></div></div>)}</div></MatchCard>}

            <MatchCard title="3. Identidades" description="Las coincidencias de plantilla y alias se resuelven automáticamente; solo intervení cuando sea necesario.">
              <div className={styles.playerList}>{rawPlayers.map((raw) => <div key={raw.rawKey} className={styles.playerRow}><div className={styles.grid3}><div><strong>{raw.rawName}</strong><div className={styles.muted}>{raw.team} · {raw.rawPlayerId || "sin PlayerID"}</div></div><Field label="Resolución"><Select value={resolutions[raw.rawKey]?.action === "ignore" ? "ignore" : resolutions[raw.rawKey]?.action === "new" ? "new" : resolutions[raw.rawKey]?.canonicalPlayerId || "new"} onChange={(e) => changeResolution(raw.rawKey, e.target.value)}><option value="new">Jugador nuevo / mantener ID</option><option value="ignore">Ignorar registro</option>{roster.map((row) => row.playerid && <option key={`${row.equipo}-${row.playerid}`} value={row.playerid}>{row.jugador} · {row.equipo}</option>)}</Select></Field><div className={styles.muted}>Origen: {resolutions[raw.rawKey]?.source || "-"}</div></div></div>)}</div>
            </MatchCard>

            <MatchCard title="4. Vista previa" description="Corregí únicamente goles o asistencias antes del commit; el detalle completo queda en la revisión.">
              <div className={styles.playerList}>{previewPlayers.map((row) => <div key={`${row.equipo}-${row.playerId || row.nombre}`} className={styles.playerRow}><div className={styles.statGrid}><div><strong>{row.nombre}</strong><div className={styles.muted}>{row.equipo} · {row.playerId || "sin ID"}</div></div><Field label="Goles"><Input type="number" min={0} value={row.goals} onChange={(e) => correctPlayer(row, "goals", Number(e.target.value))} /></Field><Field label="Asist."><Input type="number" min={0} value={row.assists} onChange={(e) => correctPlayer(row, "assists", Number(e.target.value))} /></Field><div className={styles.muted}>Score {Math.round(numberValue(row.score))}</div></div></div>)}</div>
              <div style={{ marginTop: 18 }}><Field label="Motivo / observación"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></Field></div>
              <div className={styles.actions}><button className={styles.primary} onClick={save} disabled={loading || neutrals.length > 0}>{loading ? "Guardando..." : "Guardar carga oficial"}</button></div>
            </MatchCard>
          </>
        )}
      </MatchPage>
    </PermissionGuard>
  );
}
