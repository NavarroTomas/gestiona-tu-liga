"use client";
import { displayLabel } from "@/lib/displayLabels";


import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import {
  AdminMatchBackLink,
  MatchPlayerEditor,
  MatchValidationPanel,
} from "@/components/admin/matches/MatchAdminUi";
import {
  commitAdminMatch,
  fetchAdminMatches,
  fetchMatchRoster,
  fetchTxtSegments,
} from "@/lib/adminMatches/api";
import {
  calculateRatingAPA,
  CHAMPIONS_PHASES,
  CUP_PHASES,
  MATCH_COMPETITIONS,
  MATCH_DIVISIONS,
  MATCH_GROUPS,
  normalizePhase,
  PLAYOFF_PHASES,
  stableMatchId,
  teamStatsFromPlayers,
  validateMatchDraft,
} from "@/lib/adminMatches/domain";
import type {
  AdminMatch,
  MatchCompetition,
  PlayerMatchStats,
} from "@/lib/adminMatches/types";
import { fetchSeasonRecords } from "@/lib/adminTournaments";

type RosterRow = {
  id: number;
  jugador: string;
  playerid: string | null;
  equipo: string | null;
  posicion: string | null;
  estado: string | null;
};

type ParticipantView = "todos" | "local" | "visitante";

function emptyPlayer(equipo = ""): PlayerMatchStats {
  return {
    nombre: "",
    playerId: "",
    equipo,
    posicion: "",
    goals: 0,
    assists: 0,
    shots: 0,
    shotsOnTarget: 0,
    passes: 0,
    keyPasses: 0,
    tackles: 0,
    keyTackles: 0,
    interceptions: 0,
    keyInterceptions: 0,
    possessionsLost: 0,
    gKSaves: 0,
    gKCatches: 0,
    overallRating: 0,
    score: 0,
    mvp: 0,
    rating_apa: 0,
  };
}

export default function CargarPartidoManualPage() {
  const [temporadas, setTemporadas] = useState<string[]>([]);
  const [temporada, setTemporada] = useState("");
  const [competicion, setCompeticion] = useState<MatchCompetition>("liga");
  const [division, setDivision] = useState("Primera");
  const [grupo, setGrupo] = useState("A");
  const [fase, setFase] = useState("Octavos");
  const [fecha, setFecha] = useState("");
  const [partidos, setPartidos] = useState<AdminMatch[]>([]);
  const [partidoId, setPartidoId] = useState("");
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [players, setPlayers] = useState<PlayerMatchStats[]>([]);
  const [participantView, setParticipantView] = useState<ParticipantView>("todos");
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [txtSegments, setTxtSegments] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const partido = partidos.find((item) => String(item.id) === partidoId) || null;

  useEffect(() => {
    fetchSeasonRecords()
      .then((rows) => {
        const names = rows.map((row) => row.nombre);
        const active = rows.find((row) => row.activa)?.nombre || names[0] || "";
        setTemporadas(names);
        setTemporada((current) => current && names.includes(current) ? current : active);
      })
      .catch(() => {
        setTemporadas([]);
        setMensaje("No pude cargar los torneos.");
      });
  }, []);

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
        const data = await fetchAdminMatches({
          temporada,
          competicion,
          division: competicion === "liga" ? division : undefined,
          grupo: competicion === "copa_clasificatoria" ? grupo : undefined,
          fase:
            ["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(competicion)
              ? normalizePhase(fase)
              : undefined,
          fecha: fecha || undefined,
        });
        if (cancelled) return;
        setPartidos(data);
        setPartidoId((current) =>
          data.some((item) => String(item.id) === current)
            ? current
            : String(data[0]?.id || ""),
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
    let cancelled = false;

    async function loadMatchContext() {
      setPlayers([]);
      setRoster([]);
      setTxtSegments(0);
      setParticipantView("todos");
      if (!partido) return;

      const score = String(partido.resultado || "").match(/^(\d+)\s*-\s*(\d+)$/);
      setGolesLocal(score ? Number(score[1]) : 0);
      setGolesVisitante(score ? Number(score[2]) : 0);

      try {
        const [rosterRows, segments] = await Promise.all([
          fetchMatchRoster({ temporada, teams: [partido.local, partido.visitante] }),
          fetchTxtSegments(partido.partido_id).catch(() => []),
        ]);
        if (cancelled) return;
        setRoster(rosterRows as RosterRow[]);
        setTxtSegments(segments.length);
      } catch (error: any) {
        if (!cancelled) setMensaje(error?.message || "No pude cargar el plantel del partido.");
      }
    }

    loadMatchContext();
    return () => {
      cancelled = true;
    };
  }, [partido?.id, partido?.partido_id, temporada]);

  function addRoster(team?: string) {
    const selected = roster.filter(
      (row) =>
        (!team || row.equipo === team) &&
        String(row.estado || "activo").toLowerCase() !== "inactivo" &&
        !players.some(
          (player) => player.playerId && row.playerid && player.playerId === row.playerid,
        ),
    );

    setPlayers((current) => [
      ...current,
      ...selected.map((row) => ({
        ...emptyPlayer(row.equipo || team || ""),
        nombre: row.jugador,
        playerId: row.playerid || "",
        posicion: row.posicion || "",
      })),
    ]);

    if (partido && team === partido.local) setParticipantView("local");
    if (partido && team === partido.visitante) setParticipantView("visitante");
  }

  const visiblePlayers = useMemo(() => {
    return players
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => {
        if (!partido || participantView === "todos") return true;
        if (participantView === "local") return player.equipo === partido.local;
        return player.equipo === partido.visitante;
      });
  }, [players, participantView, partido]);

  const localCount = partido ? players.filter((player) => player.equipo === partido.local).length : 0;
  const visitorCount = partido ? players.filter((player) => player.equipo === partido.visitante).length : 0;

  const resultado = `${golesLocal}-${golesVisitante}`;
  const teamStats = useMemo(() => {
    if (!partido) return [];
    return [
      teamStatsFromPlayers(players, partido.local, golesLocal),
      teamStatsFromPlayers(players, partido.visitante, golesVisitante),
    ];
  }, [players, partido, golesLocal, golesVisitante]);

  const validation = useMemo(() => {
    if (!partido) return [];
    return validateMatchDraft({ match: partido, resultado, players, teams: teamStats });
  }, [partido, resultado, players, teamStats]);

  async function save() {
    if (!partido) return;
    setMensaje("");

    if (txtSegments > 0) {
      setMensaje("Este partido tiene TXT guardados. Para no romper la evidencia original, corregilo desde Importar TXT o desde el Centro de partidos.");
      return;
    }

    if (validation.some((issue) => issue.level === "error")) {
      setMensaje("Corregí las inconsistencias antes de guardar.");
      return;
    }

    const confirmar = window.confirm(
      `Vas a guardar manualmente ${partido.local} ${resultado} ${partido.visitante}.\n\nEsta operación reemplaza las estadísticas actuales del partido de forma transaccional. ¿Continuar?`,
    );
    if (!confirmar) return;

    setLoading(true);
    try {
      const enrichedPlayers = players
        .filter((player) => player.nombre.trim() && player.equipo.trim())
        .map((player) => ({ ...player, rating_apa: calculateRatingAPA(player) }));

      await commitAdminMatch({
        match: partido,
        matchId: stableMatchId(partido),
        resultado,
        temporada,
        division: statsDivision,
        fecha: String(partido.fecha || fecha || "1"),
        competicion,
        grupo: competicion === "copa_clasificatoria" ? grupo : null,
        fase:
          ["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(competicion)
            ? normalizePhase(fase)
            : competicion === "copa_clasificatoria"
              ? "grupos"
              : null,
        teamStats,
        playerStats: enrichedPlayers,
        source: "manual",
      });

      setMensaje(`Partido guardado correctamente: ${partido.local} ${resultado} ${partido.visitante}.`);
    } catch (error: any) {
      console.error(error);
      setMensaje(error?.message || "No pude guardar el partido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PermissionGuard permission="matches.upload_manual">
      <main className="min-h-screen bg-[#f3f4f6] text-[#102f55]">
        <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-8 md:px-8 md:py-10">
          <AdminMatchBackLink />

          <header className="rounded-[28px] bg-[#0b2747] p-7 text-white md:p-9">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a9c8df]">Carga excepcional</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] md:text-6xl">Carga manual</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#d4e2ed] md:text-base">
              Usala para históricos, W.O. o partidos sin archivo MatchStats. Trabaja sobre el fixture oficial y usa el mismo motor transaccional que el resto del sistema.
            </p>
          </header>

          {mensaje && <div className="rounded-2xl border border-[#d8c7a8] bg-[#fffaf2] p-4 text-sm font-semibold text-[#73551d]">{mensaje}</div>}

          <section className="rounded-[26px] border border-[#d8e2ec] bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#245f8e]">1. Elegir partido</p>
              <h2 className="mt-1 text-2xl font-black">Contexto oficial</h2>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <select className="input" value={temporada} onChange={(e) => setTemporada(e.target.value)}>{temporadas.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}</select>
              <select className="input" value={competicion} onChange={(e) => setCompeticion(e.target.value as MatchCompetition)}>{MATCH_COMPETITIONS.map((item) => <option key={item.value} value={item.value}>{displayLabel(item.label)}</option>)}</select>
              {competicion === "liga" && <select className="input" value={division} onChange={(e) => setDivision(e.target.value)}>{MATCH_DIVISIONS.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}</select>}
              {competicion === "copa_clasificatoria" && <select className="input" value={grupo} onChange={(e) => setGrupo(e.target.value)}>{MATCH_GROUPS.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}</select>}
              {["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(competicion) && <select className="input" value={fase} onChange={(e) => setFase(e.target.value)}>{phaseOptions.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}</select>}
              <input className="input" value={fecha} onChange={(e) => setFecha(e.target.value)} placeholder="Fecha (opcional)" />
              <select className="input xl:col-span-2" value={partidoId} onChange={(e) => setPartidoId(e.target.value)}>
                {partidos.length === 0 && <option value="">Sin partidos en este contexto</option>}
                {partidos.map((item) => <option key={item.id} value={String(item.id)}>F{item.fecha || "-"} · {item.local} {item.resultado || "vs"} {item.visitante}</option>)}
              </select>
            </div>

            {partido && (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-[#f5f7f9] p-4"><span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#72879a]">Partido</span><strong className="mt-1 block text-lg">{partido.local} vs {partido.visitante}</strong></div>
                <div className="rounded-2xl bg-[#f5f7f9] p-4"><span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#72879a]">ID estable</span><strong className="mt-1 block break-all text-sm">{stableMatchId(partido)}</strong></div>
                <div className="rounded-2xl bg-[#f5f7f9] p-4"><span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#72879a]">Evidencia TXT</span><strong className="mt-1 block text-lg">{txtSegments} archivo{txtSegments === 1 ? "" : "s"}</strong></div>
              </div>
            )}
          </section>

          {partido && (
            <>
              <section className="rounded-[26px] border border-[#d8e2ec] bg-white p-5 shadow-sm md:p-6">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#245f8e]">2. Resultado</p>
                <div className="mt-4 grid grid-cols-[1fr_110px_32px_110px_1fr] items-center gap-3">
                  <strong className="truncate text-right text-xl">{partido.local}</strong>
                  <input type="number" min="0" className="input text-center text-xl font-black" value={golesLocal} onChange={(e) => setGolesLocal(Math.max(0, Number(e.target.value || 0)))} />
                  <span className="text-center font-black">-</span>
                  <input type="number" min="0" className="input text-center text-xl font-black" value={golesVisitante} onChange={(e) => setGolesVisitante(Math.max(0, Number(e.target.value || 0)))} />
                  <strong className="truncate text-xl">{partido.visitante}</strong>
                </div>
              </section>

              <section className="rounded-[26px] border border-[#d8e2ec] bg-[#f8fafc] p-5 md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#245f8e]">3. Participantes</p>
                    <h2 className="mt-1 text-2xl font-black">Jugadores del partido</h2>
                    <p className="mt-2 text-sm text-[#687d8f]">Cargá cada plantilla por separado y filtrá la vista para no mezclar los dos equipos.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-xl border border-[#cbd9e3] bg-white px-4 py-2 text-xs font-black uppercase text-[#102f55]" onClick={() => addRoster(partido.local)}>Cargar plantilla local</button>
                    <button type="button" className="rounded-xl border border-[#cbd9e3] bg-white px-4 py-2 text-xs font-black uppercase text-[#102f55]" onClick={() => addRoster(partido.visitante)}>Cargar plantilla visitante</button>
                    <button type="button" className="rounded-xl bg-[#245f8e] px-4 py-2 text-xs font-black uppercase text-white" onClick={() => { setPlayers((current) => [...current, emptyPlayer(partido.local)]); setParticipantView("local"); }}>Jugador manual</button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-b border-[#dfe7ed] pb-4">
                  <button type="button" className="admin-match-tab" data-active={participantView === "todos"} onClick={() => setParticipantView("todos")}>Todos · {players.length}</button>
                  <button type="button" className="admin-match-tab" data-active={participantView === "local"} onClick={() => setParticipantView("local")}>{partido.local} · {localCount}</button>
                  <button type="button" className="admin-match-tab" data-active={participantView === "visitante"} onClick={() => setParticipantView("visitante")}>{partido.visitante} · {visitorCount}</button>
                </div>

                {participantView === "todos" && players.length > 0 && (
                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    <div className="admin-match-team-heading"><span>{partido.local}</span><span>{localCount} jugadores</span></div>
                    <div className="admin-match-team-heading"><span>{partido.visitante}</span><span>{visitorCount} jugadores</span></div>
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  {players.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#cbd9e3] bg-white p-7 text-center text-sm text-[#74899b]">No cargaste jugadores. Podés cargar cada plantilla por separado o guardar únicamente el resultado para un caso administrativo.</div>
                  ) : visiblePlayers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#cbd9e3] bg-white p-7 text-center text-sm text-[#74899b]">No hay jugadores cargados para esta plantilla.</div>
                  ) : (
                    visiblePlayers.map(({ player, index }) => (
                      <MatchPlayerEditor
                        key={`${player.playerId || player.nombre || "player"}-${index}`}
                        player={player}
                        index={index}
                        onChange={(next) => setPlayers((current) => current.map((item, i) => (i === index ? next : item)))}
                        onRemove={() => setPlayers((current) => current.filter((_, i) => i !== index))}
                      />
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-[26px] border border-[#d8e2ec] bg-white p-5 shadow-sm md:p-6">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#245f8e]">4. Validación y guardado</p>
                <div className="mt-4"><MatchValidationPanel issues={validation} /></div>
                <button type="button" disabled={loading || validation.some((issue) => issue.level === "error")} onClick={save} className="mt-5 min-h-12 rounded-xl bg-[#245f8e] px-6 text-sm font-black uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? "Guardando..." : "Guardar partido de forma segura"}
                </button>
              </section>
            </>
          )}
        </div>
      </main>
    </PermissionGuard>
  );
}
