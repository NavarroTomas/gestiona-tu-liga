"use client";

import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import {
  AdminMatchBackLink,
  MatchValidationPanel,
} from "@/components/admin/matches/MatchAdminUi";
import {
  commitAdminMatch,
  fetchAdminMatches,
  fetchMatchRoster,
  fetchPlayerAliases,
  fetchTxtSegments,
  voidAdminMatch,
} from "@/lib/adminMatches/api";
import {
  CHAMPIONS_PHASES,
  CUP_PHASES,
  MATCH_COMPETITIONS,
  MATCH_DIVISIONS,
  MATCH_GROUPS,
  normalizeMatchText,
  normalizePhase,
  PLAYOFF_PHASES,
  stableMatchId,
  validateMatchDraft,
} from "@/lib/adminMatches/domain";
import {
  buildTxtCommitData,
  detectZeroStatPlayers,
  parseTxtFiles,
  prepareTxtPlayers,
  reconciliationRows,
  type TxtAliasRow,
  type TxtDbSegment,
  type TxtLoadMode,
  type TxtRosterRow,
} from "@/lib/adminMatches/txtPipeline";
import {
  assignNeutralPlayersToTeams,
  buildRawPlayerKey,
  cleanText,
  collectRawPlayers,
  type OrdenTxt,
  type ParsedMatchSegment,
  type PlayerResolution,
} from "@/lib/matchStatsUpload";
import type { AdminMatch, MatchCompetition } from "@/lib/adminMatches/types";

const TEMPORADAS = ["Temporada 4"];

const APA_FIELD_CLASS =
  "min-h-[48px] w-full rounded-xl border border-[#35699a] bg-[#123f69] px-4 text-sm font-semibold text-white outline-none transition hover:bg-[#173f73] focus:border-[#69b6ff] focus:ring-2 focus:ring-[#69b6ff]/20 disabled:cursor-not-allowed disabled:opacity-50";

const APA_FILE_CLASS = `${APA_FIELD_CLASS} file:mr-4 file:border-0 file:bg-[#245f8e] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.06em] file:text-white`;

function dedupeRoster(rows: TxtRosterRow[]) {
  const seen = new Set<string>();

  return rows.filter((row) => {
    const playerId = cleanText(row.playerid);
    if (!playerId) return false;

    const key = `${normalizeMatchText(row.equipo)}__${playerId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function TxtMatchImporter() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [competicion, setCompeticion] = useState<MatchCompetition>("liga");
  const [division, setDivision] = useState("Primera");
  const [grupo, setGrupo] = useState("A");
  const [fase, setFase] = useState("Octavos");
  const [fecha, setFecha] = useState("");
  const [fechasDisponibles, setFechasDisponibles] = useState<string[]>([]);
  const [partidos, setPartidos] = useState<AdminMatch[]>([]);
  const [partidoRowId, setPartidoRowId] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [order, setOrder] = useState<OrdenTxt>("normal");
  const [mode, setMode] = useState<TxtLoadMode>("reemplazar");
  const [existing, setExisting] = useState<TxtDbSegment[]>([]);
  const [roster, setRoster] = useState<TxtRosterRow[]>([]);
  const [segments, setSegments] = useState<ParsedMatchSegment[]>([]);
  const [resolutions, setResolutions] = useState<Record<string, PlayerResolution>>({});
  const [excluded, setExcluded] = useState<Record<string, boolean>>({});
  const [corrections, setCorrections] = useState<Record<string, { goals: number; assists: number }>>({});
  const [allowDifferences, setAllowDifferences] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const partido = partidos.find((item) => String(item.id) === partidoRowId) || null;

  const phaseOptions = useMemo(() => {
    if (competicion === "copa_campeones") return CHAMPIONS_PHASES;
    if (competicion === "playoffs") return PLAYOFF_PHASES;
    return CUP_PHASES;
  }, [competicion]);

  const statsDivision = useMemo(() => {
    if (competicion === "liga") return division;
    if (competicion === "copa_clasificatoria") return `Grupo ${grupo}`;
    return fase;
  }, [competicion, division, grupo, fase]);

  useEffect(() => {
    let cancelled = false;
    async function loadMatches() {
      setMensaje("");
      try {
        const all = await fetchAdminMatches({
          temporada,
          competicion,
          division: competicion === "liga" ? division : undefined,
          grupo: competicion === "copa_clasificatoria" ? grupo : undefined,
          fase:
            ["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(competicion)
              ? normalizePhase(fase)
              : undefined,
        });
        if (cancelled) return;

        const rounds = Array.from(
          new Set(all.map((item) => String(item.fecha || "")).filter(Boolean)),
        ).sort((a, b) => {
          const numberA = Number(a);
          const numberB = Number(b);
          if (Number.isFinite(numberA) && Number.isFinite(numberB)) return numberA - numberB;
          return a.localeCompare(b, "es");
        });

        setFechasDisponibles(rounds);

        const activeRound = fecha && rounds.includes(fecha) ? fecha : rounds[0] || "";
        if (activeRound !== fecha) setFecha(activeRound);

        const scoped = activeRound
          ? all.filter((item) => String(item.fecha || "") === activeRound)
          : all;

        setPartidos(scoped);
        setPartidoRowId((current) =>
          scoped.some((item) => String(item.id) === current)
            ? current
            : String(scoped[0]?.id || ""),
        );
      } catch (error: any) {
        if (!cancelled) setMensaje(error?.message || "No pude cargar los partidos programados.");
      }
    }
    loadMatches();
    return () => {
      cancelled = true;
    };
  }, [temporada, competicion, division, grupo, fase, fecha]);

  useEffect(() => {
    resetAnalysis();
    let cancelled = false;
    async function loadMatchData() {
      if (!partido) {
        setExisting([]);
        setRoster([]);
        return;
      }
      try {
        const [segmentRows, rosterRows] = await Promise.all([
          fetchTxtSegments(partido.partido_id).catch(() => []),
          fetchMatchRoster({ temporada, teams: [partido.local, partido.visitante] }),
        ]);
        if (cancelled) return;
        setExisting(segmentRows as TxtDbSegment[]);
        setRoster(
          dedupeRoster(
            (rosterRows as TxtRosterRow[]).filter(
              (row) => normalizeMatchText(row.estado || "activo") !== "inactivo",
            ),
          ),
        );
      } catch (error: any) {
        if (!cancelled) setMensaje(error?.message || "No pude cargar el contexto del partido.");
      }
    }
    loadMatchData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partido?.id, partido?.partido_id, temporada]);

  function resetAnalysis() {
    setSegments([]);
    setResolutions({});
    setExcluded({});
    setCorrections({});
    setAllowDifferences(false);
    setAnalyzed(false);
  }

  async function analyze() {
    if (!partido) {
      setMensaje("Elegí un partido programado.");
      return;
    }
    if (mode === "agregar" && existing.length === 0 && partido.resultado && partido.partido_id) {
      setMensaje("Este partido viene del sistema anterior y no conserva sus TXT. Elegí todos los archivos del partido y usá Reemplazar carga completa.");
      return;
    }

    setLoading(true);
    setMensaje("");
    try {
      const parsed = await parseTxtFiles({ files, order, mode, existing });
      const firstPass = prepareTxtPlayers({
        segments: parsed,
        roster,
        aliases: [],
        localTeam: partido.local,
        visitorTeam: partido.visitante,
      });
      const rawIds = firstPass.rawPlayers.map((row) => row.rawPlayerId).filter(Boolean);
      const aliasRows = (await fetchPlayerAliases(rawIds).catch(() => [])) as TxtAliasRow[];
      const prepared = prepareTxtPlayers({
        segments: parsed,
        roster,
        aliases: aliasRows,
        localTeam: partido.local,
        visitorTeam: partido.visitante,
      });

      setSegments(prepared.segments);
      setResolutions(prepared.resolutions);
      setExcluded(detectZeroStatPlayers(prepared.segments, partido.local, partido.visitante));
      setCorrections({});
      setAllowDifferences(false);
      setAnalyzed(true);
    } catch (error: any) {
      console.error(error);
      setMensaje(error?.message || "No pude analizar los archivos.");
    } finally {
      setLoading(false);
    }
  }

  const rawPlayers = useMemo(() => {
    if (!partido || !analyzed) return [];
    return collectRawPlayers(segments, partido.local, partido.visitante);
  }, [segments, partido, analyzed]);

  const neutralPlayers = useMemo(() => {
    const map = new Map<string, { playerId: string; name: string; appearances: number }>();
    for (const segment of segments) {
      for (const player of segment.neutralPlayers || []) {
        const playerId = cleanText(player?.playerId);
        const name = cleanText(player?.playerName) || "Sin nombre";
        const key = playerId ? `id:${playerId}` : `name:${normalizeMatchText(name)}`;
        const current = map.get(key);
        if (current) current.appearances += 1;
        else map.set(key, { playerId, name, appearances: 1 });
      }
    }
    return Array.from(map.entries()).map(([key, value]) => ({ key, ...value }));
  }, [segments]);

  function assignNeutral(playerId: string, name: string, destination: "local" | "visitor" | "ignore") {
    if (!partido) return;
    const same = (player: any) => {
      const id = cleanText(player?.playerId);
      return playerId ? id === playerId : normalizeMatchText(player?.playerName) === normalizeMatchText(name);
    };

    if (destination === "ignore") {
      setSegments((current) => current.map((segment) => ({
        ...segment,
        neutralPlayers: (segment.neutralPlayers || []).filter((player) => !same(player)),
      })));
      return;
    }

    const team = destination === "local" ? partido.local : partido.visitante;
    const tempRoster: TxtRosterRow[] = [
      ...roster,
      { jugador: name, playerid: playerId || null, equipo: team, posicion: null, estado: "activo" },
    ];
    const nextSegments = assignNeutralPlayersToTeams({
      segments,
      roster: tempRoster,
      localTeam: partido.local,
      visitorTeam: partido.visitante,
    });
    setSegments(nextSegments);
    const rawKey = buildRawPlayerKey(playerId, name, team);
    setResolutions((current) => ({
      ...current,
      [rawKey]: {
        rawKey,
        rawPlayerId: playerId,
        rawName: name,
        team,
        action: "new",
        canonicalPlayerId: playerId,
        canonicalName: name,
        saveAlias: false,
        source: "manual",
      },
    }));
  }

  function changeResolution(rawKey: string, value: string) {
    const current = resolutions[rawKey];
    if (!current) return;

    if (value === "__ignore") {
      setResolutions((state) => ({ ...state, [rawKey]: { ...current, action: "ignore", saveAlias: false, source: "manual" } }));
      return;
    }
    if (value === "__new") {
      setResolutions((state) => ({
        ...state,
        [rawKey]: {
          ...current,
          action: "new",
          canonicalPlayerId: current.rawPlayerId,
          canonicalName: current.rawName,
          saveAlias: false,
          source: "new",
        },
      }));
      return;
    }

    const target = roster.find((row) => cleanText(row.playerid) === value);
    if (!target) return;
    setResolutions((state) => ({
      ...state,
      [rawKey]: {
        ...current,
        action: "map",
        canonicalPlayerId: cleanText(target.playerid),
        canonicalName: cleanText(target.jugador) || current.rawName,
        saveAlias: Boolean(current.rawPlayerId && current.rawPlayerId !== cleanText(target.playerid)),
        source: "manual",
      },
    }));
  }

  const preview = useMemo(() => {
    if (!partido || !analyzed) return null;
    return buildTxtCommitData({
      segments,
      resolutions,
      excluded,
      corrections,
      localTeam: partido.local,
      visitorTeam: partido.visitante,
    });
  }, [partido, analyzed, segments, resolutions, excluded, corrections]);

  const reconciliation = useMemo(() => {
    if (!partido || !preview) return [];
    return reconciliationRows({
      players: preview.players,
      teams: preview.teamStats,
      localTeam: partido.local,
      visitorTeam: partido.visitante,
    });
  }, [partido, preview]);

  const validation = useMemo(() => {
    if (!partido || !preview) return [];
    return validateMatchDraft({
      match: partido,
      resultado: preview.result,
      players: preview.players,
      teams: preview.teamStats,
    });
  }, [partido, preview]);

  function correctionKey(player: { equipo: string; playerId?: string; nombre: string }) {
    return `${normalizeMatchText(player.equipo)}__${
      cleanText(player.playerId) ? `id:${cleanText(player.playerId)}` : `name:${normalizeMatchText(player.nombre)}`
    }`;
  }

  async function save() {
    if (!partido || !preview) return;
    setMensaje("");

    if (neutralPlayers.length > 0) {
      setMensaje("Todavía hay jugadores sin equipo. Resolvelos antes de guardar.");
      return;
    }

    const unresolved = Object.values(resolutions).filter(
      (resolution) => resolution.action !== "ignore" && !cleanText(resolution.canonicalName),
    );
    if (unresolved.length > 0) {
      setMensaje("Hay jugadores sin resolver.");
      return;
    }

    const hasDifferences = reconciliation.some(
      (row) => row.teamGoals !== row.playerGoals || row.teamAssists !== row.playerAssists,
    );
    if (hasDifferences && !allowDifferences) {
      setMensaje("Hay diferencias entre estadísticas de equipo y jugadores. Corregilas o habilitá el guardado con estadísticas no asignadas.");
      return;
    }

    const errors = validation.filter((issue) => issue.level === "error");
    if (errors.length > 0) {
      setMensaje("Corregí las inconsistencias antes de guardar.");
      return;
    }

    const confirmed = window.confirm(
      `Vas a consolidar ${preview.txtSegments.length} TXT en ${partido.local} ${preview.result} ${partido.visitante}.\n\nLa operación es transaccional y quedará registrada en el historial. ¿Continuar?`,
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await commitAdminMatch({
        match: partido,
        matchId: stableMatchId(partido),
        resultado: preview.result,
        temporada,
        division: statsDivision,
        fecha: String(partido.fecha || fecha || "1"),
        competicion,
        grupo: competicion === "copa_clasificatoria" ? grupo : null,
        fase:
          competicion === "copa_clasificatoria"
            ? "grupos"
            : ["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(competicion)
              ? normalizePhase(fase)
              : null,
        teamStats: preview.teamStats,
        playerStats: preview.players,
        segments: preview.txtSegments,
        aliases: preview.aliases,
        source: "txt",
      });

      setMensaje(`Carga guardada: ${partido.local} ${preview.result} ${partido.visitante}. ${preview.players.length} jugadores y ${preview.txtSegments.length} TXT.`);
      setFiles([]);
      resetAnalysis();
      const updatedSegments = await fetchTxtSegments(stableMatchId(partido));
      setExisting(updatedSegments as TxtDbSegment[]);
    } catch (error: any) {
      console.error(error);
      setMensaje(error?.message || "No pude guardar la carga.");
    } finally {
      setLoading(false);
    }
  }

  async function voidLoad() {
    if (!partido || (!partido.partido_id && !partido.resultado)) return;
    const confirmed = window.confirm(
      `¿Anular toda la carga de ${partido.local} vs ${partido.visitante}? El fixture seguirá existiendo y el cambio quedará auditado.`,
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await voidAdminMatch(partido.id);
      setMensaje("Carga anulada correctamente.");
      setExisting([]);
      setFiles([]);
      resetAnalysis();
    } catch (error: any) {
      setMensaje(error?.message || "No pude anular la carga.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PermissionGuard permission="matches.upload_txt">
      <main className="min-h-screen bg-[#f3f4f6] text-[#102f55]">
        <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-8 md:px-8 md:py-10">
          <AdminMatchBackLink />

          <section className="overflow-hidden rounded-[28px] border border-[#123f69] bg-[#0b2747] text-white shadow-sm">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.35fr_.65fr] lg:p-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d6e6f4]">Centro de partidos</p>
                <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-[-0.04em] md:text-5xl">Importar MatchStats</h1>
                <p className="mt-4 max-w-3xl text-sm font-medium leading-6 text-[#d6e6f4]">Leé uno o varios TXT, resolvé jugadores y guardá toda la carga como una única transacción auditable.</p>
              </div>
              <div className="rounded-2xl border border-[#245f8e] bg-[#102f55] p-5">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#d6e6f4]">Regla operativa</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white">Los resultados no se editan acá manualmente. El resultado final sale de los TXT elegidos.</p>
              </div>
            </div>
          </section>

          {mensaje && <div className="rounded-2xl border border-[#b8c7d4] bg-white px-5 py-4 text-sm font-bold text-[#102f55]">{mensaje}</div>}

          <section className="rounded-[26px] border border-[#d8e2ec] bg-white p-5 shadow-sm md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-[#245f8e]">1. Partido</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs font-black uppercase tracking-[0.08em] text-[#173f73]">Temporada<select className={`${APA_FIELD_CLASS} mt-2`} value={temporada} onChange={(e) => setTemporada(e.target.value)}>{TEMPORADAS.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-xs font-black uppercase tracking-[0.08em] text-[#173f73]">Competición<select className={`${APA_FIELD_CLASS} mt-2`} value={competicion} onChange={(e) => { setCompeticion(e.target.value as MatchCompetition); setFecha(""); }}>{MATCH_COMPETITIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              {competicion === "liga" && <label className="text-xs font-black uppercase tracking-[0.08em] text-[#173f73]">División<select className={`${APA_FIELD_CLASS} mt-2`} value={division} onChange={(e) => setDivision(e.target.value)}>{MATCH_DIVISIONS.map((item) => <option key={item}>{item}</option>)}</select></label>}
              {competicion === "copa_clasificatoria" && <label className="text-xs font-black uppercase tracking-[0.08em] text-[#173f73]">Grupo<select className={`${APA_FIELD_CLASS} mt-2`} value={grupo} onChange={(e) => setGrupo(e.target.value)}>{MATCH_GROUPS.map((item) => <option key={item}>{item}</option>)}</select></label>}
              {["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(competicion) && <label className="text-xs font-black uppercase tracking-[0.08em] text-[#173f73]">Fase<select className={`${APA_FIELD_CLASS} mt-2`} value={fase} onChange={(e) => { setFase(e.target.value); setFecha(""); }}>{phaseOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>}
              <label className="text-xs font-black uppercase tracking-[0.08em] text-[#173f73]">Fecha / ronda<select className={`${APA_FIELD_CLASS} mt-2`} value={fecha} onChange={(e) => setFecha(e.target.value)}>{fechasDisponibles.length ? fechasDisponibles.map((item) => <option key={item}>{item}</option>) : <option value="">Sin rondas</option>}</select></label>
            </div>

            <label className="mt-4 block text-xs font-black uppercase tracking-[0.08em] text-[#173f73]">Partido<select className={`${APA_FIELD_CLASS} mt-2`} value={partidoRowId} onChange={(e) => setPartidoRowId(e.target.value)}>{partidos.length ? partidos.map((item) => <option key={item.id} value={String(item.id)}>{item.local} vs {item.visitante || "Sin rival"} {item.resultado ? `· ${item.resultado}` : ""}</option>) : <option value="">Sin partidos en esta ronda</option>}</select></label>
          </section>

          <section className="rounded-[26px] border border-[#d8e2ec] bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[#245f8e]">2. Archivos</p>
                <h2 className="mt-1 text-xl font-black">{partido ? `${partido.local} vs ${partido.visitante || "Sin rival"}` : "Elegí un partido"}</h2>
              </div>
              <span className="text-xs font-bold text-[#708699]">TXT guardados: {existing.length}</span>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px_220px]">
              <input
                type="file"
                multiple
                accept=".txt,.json,application/json,text/plain"
                className={APA_FILE_CLASS}
                onChange={(e) => {
                  setFiles(Array.from(e.target.files || []));
                  resetAnalysis();
                }}
              />
              <select className={APA_FIELD_CLASS} value={mode} onChange={(e) => { setMode(e.target.value as TxtLoadMode); resetAnalysis(); }}>
                <option value="reemplazar">Reemplazar carga completa</option>
                <option value="agregar">Agregar a TXT existentes</option>
              </select>
              <select className={APA_FIELD_CLASS} value={order} onChange={(e) => { setOrder(e.target.value as OrdenTxt); resetAnalysis(); }}>
                <option value="normal">Team 1 = local</option>
                <option value="invertido">Team 2 = local</option>
              </select>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" disabled={loading || !partido || files.length === 0} onClick={analyze} className="rounded-xl bg-[#245f8e] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-white disabled:opacity-50">
                {loading ? "Analizando..." : `Analizar ${files.length || ""} archivo${files.length === 1 ? "" : "s"}`}
              </button>
              {partido?.resultado && (
                <button type="button" disabled={loading} onClick={voidLoad} className="rounded-xl border border-[#eccaca] bg-[#fff8f8] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-[#9a3434]">Anular carga actual</button>
              )}
            </div>
          </section>

          {analyzed && partido && preview && (
            <>
              {neutralPlayers.length > 0 && (
                <section className="rounded-[26px] border border-[#e7c8a0] bg-[#fffaf2] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-[#8a5d1e]">Jugadores sin equipo</p>
                  <div className="mt-4 space-y-3">
                    {neutralPlayers.map((player) => (
                      <div key={player.key} className="flex flex-col gap-3 rounded-2xl bg-white p-4 md:flex-row md:items-center md:justify-between">
                        <div><strong>{player.name}</strong><span className="ml-2 text-xs text-[#768a9b]">{player.playerId || "sin PlayerID"}</span></div>
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-lg border border-[#cbd9e3] px-3 py-2 text-xs font-bold" onClick={() => assignNeutral(player.playerId, player.name, "local")}>{partido.local}</button>
                          <button className="rounded-lg border border-[#cbd9e3] px-3 py-2 text-xs font-bold" onClick={() => assignNeutral(player.playerId, player.name, "visitor")}>{partido.visitante}</button>
                          <button className="rounded-lg border border-[#eccaca] px-3 py-2 text-xs font-bold text-[#9a3434]" onClick={() => assignNeutral(player.playerId, player.name, "ignore")}>Ignorar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-[26px] border border-[#d8e2ec] bg-white p-5 shadow-sm md:p-6">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[#245f8e]">3. Resolver jugadores</p>
                <div className="mt-4 space-y-3">
                  {rawPlayers.map((raw) => {
                    const resolution = resolutions[raw.rawKey];
                    return (
                      <div key={raw.rawKey} className="grid gap-3 rounded-2xl border border-[#e0e7ec] p-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
                        <div>
                          <strong className="block">{raw.rawName}</strong>
                          <span className="text-xs text-[#758a9b]">{raw.team} · {raw.rawPlayerId || "sin PlayerID"}</span>
                        </div>
                        <select className={APA_FIELD_CLASS} value={resolution?.action === "ignore" ? "__ignore" : resolution?.action === "new" ? "__new" : resolution?.canonicalPlayerId || "__new"} onChange={(e) => changeResolution(raw.rawKey, e.target.value)}>
                          <option value="__new">Guardar como jugador detectado</option>
                          <option value="__ignore">Ignorar</option>
                          {roster.filter((row) => row.equipo === raw.team).map((row) => <option key={`${row.equipo}-${row.playerid}`} value={row.playerid || ""}>{row.jugador} · {row.playerid}</option>)}
                        </select>
                        <label className="inline-flex items-center gap-2 text-xs font-bold text-[#6d8294]">
                          <input type="checkbox" checked={Boolean(excluded[raw.rawKey])} onChange={(e) => setExcluded((current) => ({ ...current, [raw.rawKey]: e.target.checked }))} /> Excluir
                        </label>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[26px] border border-[#d8e2ec] bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-[#245f8e]">4. Conciliación</p>
                    <h2 className="mt-1 text-2xl font-black">{partido.local} {preview.result} {partido.visitante}</h2>
                  </div>
                  <span className="text-xs font-bold text-[#74899a]">MVP automático por score más alto</span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {reconciliation.map((row) => (
                    <div key={row.team} className="rounded-2xl bg-[#f5f7f9] p-4">
                      <strong>{row.team}</strong>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-[#657b8d]">
                        <span>Goles equipo: <b>{row.teamGoals}</b></span><span>Asignados: <b>{row.playerGoals}</b></span>
                        <span>Asist. equipo: <b>{row.teamAssists}</b></span><span>Asignadas: <b>{row.playerAssists}</b></span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead><tr className="border-b border-[#dce5eb] text-[10px] font-black uppercase tracking-[0.1em] text-[#74899a]"><th className="p-2">Jugador</th><th className="p-2">Equipo</th><th className="p-2">Goles</th><th className="p-2">Asistencias</th><th className="p-2">MVP</th></tr></thead>
                    <tbody>
                      {preview.players.map((player) => {
                        const key = correctionKey(player);
                        const correction = corrections[key];
                        return (
                          <tr key={key} className="border-b border-[#edf1f4]">
                            <td className="p-2 font-bold">{player.nombre}</td><td className="p-2 text-[#667d8f]">{player.equipo}</td>
                            <td className="p-2"><input type="number" min="0" className={`${APA_FIELD_CLASS} w-24`} value={correction?.goals ?? player.goals ?? 0} onChange={(e) => setCorrections((current) => ({ ...current, [key]: { goals: Math.max(0, Number(e.target.value || 0)), assists: correction?.assists ?? Number(player.assists || 0) } }))} /></td>
                            <td className="p-2"><input type="number" min="0" className={`${APA_FIELD_CLASS} w-24`} value={correction?.assists ?? player.assists ?? 0} onChange={(e) => setCorrections((current) => ({ ...current, [key]: { goals: correction?.goals ?? Number(player.goals || 0), assists: Math.max(0, Number(e.target.value || 0)) } }))} /></td>
                            <td className="p-2">{Number(player.mvp || 0) > 0 ? "Sí" : "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <label className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e5d2ad] bg-[#fffaf1] p-4 text-sm font-semibold text-[#775820]">
                  <input type="checkbox" checked={allowDifferences} onChange={(e) => setAllowDifferences(e.target.checked)} className="mt-1" />
                  Permitir guardar goles o asistencias de equipo que no pudieron asignarse a un jugador. Se conserva el total oficial del equipo.
                </label>
              </section>

              <section className="rounded-[26px] border border-[#d8e2ec] bg-white p-5 shadow-sm md:p-6">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[#245f8e]">5. Validación final</p>
                <div className="mt-4"><MatchValidationPanel issues={validation} /></div>
                <button type="button" disabled={loading || validation.some((issue) => issue.level === "error")} onClick={save} className="mt-5 min-h-12 rounded-xl bg-[#245f8e] px-6 text-sm font-black uppercase tracking-[0.08em] text-white disabled:opacity-50">
                  {loading ? "Guardando..." : "Guardar carga transaccional"}
                </button>
              </section>
            </>
          )}
        </div>
      </main>
    </PermissionGuard>
  );
}
