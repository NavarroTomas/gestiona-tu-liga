"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import {
  AdminMatchBackLink,
  MatchPlayerEditor,
  MatchValidationPanel,
} from "@/components/admin/matches/MatchAdminUi";
import {
  commitAdminMatch,
  fetchMatchById,
  fetchMatchRevisions,
  fetchMatchStats,
  fetchTxtSegments,
  restoreMatchRevision,
} from "@/lib/adminMatches/api";
import {
  calculateRatingAPA,
  emptyTeamStats,
  matchContextLabel,
  parseScore,
  stableMatchId,
  validateMatchDraft,
} from "@/lib/adminMatches/domain";
import type {
  AdminMatch,
  MatchRevision,
  PlayerMatchStats,
  TeamMatchStats,
} from "@/lib/adminMatches/types";

const SOURCE_LABELS: Record<string, string> = {
  txt: "MatchStats",
  manual: "Carga manual",
  correction: "Corrección",
  annulment: "Anulación",
};

export default function AdminMatchDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [match, setMatch] = useState<AdminMatch | null>(null);
  const [players, setPlayers] = useState<PlayerMatchStats[]>([]);
  const [teams, setTeams] = useState<TeamMatchStats[]>([]);
  const [revisions, setRevisions] = useState<MatchRevision[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  async function load() {
    if (!id) return;
    setLoading(true);
    setMensaje("");
    try {
      const matchData = await fetchMatchById(id);
      if (!matchData) throw new Error("Partido no encontrado.");
      const [{ teams: teamRows, players: playerRows }, revisionRows, segmentRows] = await Promise.all([
        fetchMatchStats(matchData.partido_id),
        fetchMatchRevisions(matchData.id).catch(() => []),
        fetchTxtSegments(matchData.partido_id).catch(() => []),
      ]);

      setMatch(matchData);
      setPlayers(playerRows);
      setTeams(teamRows);
      setRevisions(revisionRows);
      setSegments(segmentRows);

      const parsed = parseScore(matchData.resultado);
      setGolesLocal(parsed?.local ?? Number(teamRows.find((team) => team.equipo === matchData.local)?.goals || 0));
      setGolesVisitante(parsed?.visitante ?? Number(teamRows.find((team) => team.equipo === matchData.visitante)?.goals || 0));
    } catch (error: any) {
      console.error(error);
      setMensaje(error?.message || "No pude cargar el partido.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const resultado = `${golesLocal}-${golesVisitante}`;

  const normalizedTeams = useMemo(() => {
    if (!match) return [];
    const local = teams.find((team) => team.equipo === match.local) || emptyTeamStats(match.local);
    const visitor = teams.find((team) => team.equipo === match.visitante) || emptyTeamStats(match.visitante);
    return [
      { ...local, equipo: match.local, goals: golesLocal },
      { ...visitor, equipo: match.visitante, goals: golesVisitante },
    ];
  }, [teams, match, golesLocal, golesVisitante]);

  const validation = useMemo(() => {
    if (!match) return [];
    return validateMatchDraft({ match, resultado, players, teams: normalizedTeams });
  }, [match, resultado, players, normalizedTeams]);

  async function saveCorrection() {
    if (!match) return;
    const errors = validation.filter((issue) => issue.level === "error");
    if (errors.length > 0) {
      setMensaje("Hay inconsistencias que deben resolverse antes de guardar.");
      return;
    }

    const reason = window.prompt("Motivo de la corrección:", "Corrección de estadísticas del partido");
    if (!reason?.trim()) return;

    const confirmed = window.confirm(
      `Vas a guardar una corrección sobre ${match.local} ${resultado} ${match.visitante}.\n\nLos TXT originales, si existen, se conservan como evidencia. ¿Continuar?`,
    );
    if (!confirmed) return;

    setSaving(true);
    setMensaje("");
    try {
      const nextPlayers = players.map((player) => ({
        ...player,
        rating_apa: calculateRatingAPA(player),
      }));

      await commitAdminMatch({
        match,
        matchId: stableMatchId(match),
        resultado,
        temporada: match.temporada,
        division: match.division || "",
        fecha: String(match.fecha || ""),
        competicion: match.competicion || "liga",
        grupo: match.grupo || null,
        fase: match.fase || null,
        teamStats: normalizedTeams,
        playerStats: nextPlayers,
        source: "correction",
        reason: reason.trim(),
      });
      setMensaje("Corrección guardada. Los acumulados de jugadores fueron reconstruidos automáticamente.");
      await load();
    } catch (error: any) {
      console.error(error);
      setMensaje(error?.message || "No pude guardar la corrección.");
    } finally {
      setSaving(false);
    }
  }

  async function restore(revision: MatchRevision) {
    const reason = window.prompt(
      `Motivo para restaurar la revisión #${revision.revision_number}:`,
      `Restauración de revisión #${revision.revision_number}`,
    );
    if (!reason?.trim()) return;

    const confirmed = window.confirm(
      `¿Restaurar el estado guardado en la revisión #${revision.revision_number}?\n\nLa restauración no borra el historial: creará una nueva revisión de corrección.`,
    );
    if (!confirmed) return;

    setRestoring(revision.id);
    setMensaje("");
    try {
      await restoreMatchRevision(revision.id, reason.trim());
      setMensaje(`Revisión #${revision.revision_number} restaurada correctamente.`);
      await load();
    } catch (error: any) {
      console.error(error);
      setMensaje(error?.message || "No pude restaurar la revisión.");
    } finally {
      setRestoring(null);
    }
  }

  if (loading) {
    return (
      <PermissionGuard permission="matches.edit">
        <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] text-[#102f55]">
          <p className="font-black uppercase tracking-[0.14em]">Cargando partido...</p>
        </main>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="matches.edit">
      <main className="min-h-screen bg-[#f3f4f6] text-[#102f55]">
        <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-8 md:px-8 md:py-10">
          <AdminMatchBackLink href="/admin/listas" label="Volver al Centro de partidos" />

          {mensaje && (
            <div className="rounded-2xl border border-[#d8c7a8] bg-[#fffaf2] p-4 text-sm font-semibold text-[#73551d]">
              {mensaje}
            </div>
          )}

          {!match ? (
            <div className="rounded-[24px] border border-[#e0c5c5] bg-white p-8 text-center text-[#923838]">Partido no encontrado.</div>
          ) : (
            <>
              <header className="rounded-[28px] bg-[#0b2747] p-7 text-white md:p-9">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a9c8df]">{matchContextLabel(match)}</p>
                <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h1 className="text-4xl font-black tracking-[-0.04em] md:text-6xl">{match.local} <span className="text-[#8fc0df]">{match.resultado || "vs"}</span> {match.visitante}</h1>
                    <p className="mt-3 text-sm text-[#d4e2ed]">ID oficial: {match.partido_id || "Todavía sin carga"} · Estado: {match.estado || (match.resultado ? "cargado" : "programado")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase">{segments.length} TXT</span>
                    <span className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase">{players.length} jugadores</span>
                  </div>
                </div>
              </header>

              <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
                <div className="space-y-5">
                  <section className="rounded-[26px] border border-[#d8e2ec] bg-white p-5 shadow-sm md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#245f8e]">Resultado oficial</p>
                        <h2 className="mt-1 text-2xl font-black">Corrección controlada</h2>
                      </div>
                      {segments.length > 0 && (
                        <Link href="/admin/subir-txt" className="text-xs font-black uppercase tracking-[0.1em] text-[#245f8e]">Reprocesar desde TXT →</Link>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-[1fr_110px_32px_110px_1fr] items-center gap-3">
                      <strong className="truncate text-right text-xl">{match.local}</strong>
                      <input type="number" min="0" className="input text-center text-xl font-black" value={golesLocal} onChange={(e) => setGolesLocal(Math.max(0, Number(e.target.value || 0)))} />
                      <span className="text-center font-black">-</span>
                      <input type="number" min="0" className="input text-center text-xl font-black" value={golesVisitante} onChange={(e) => setGolesVisitante(Math.max(0, Number(e.target.value || 0)))} />
                      <strong className="truncate text-xl">{match.visitante}</strong>
                    </div>
                  </section>

                  <section className="rounded-[26px] border border-[#d8e2ec] bg-[#f8fafc] p-5 md:p-6">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#245f8e]">Detalle granular</p>
                      <h2 className="mt-1 text-2xl font-black">Estadísticas de jugadores</h2>
                      <p className="mt-2 text-sm text-[#6d8294]">Estas filas son la fuente de verdad. El ranking acumulado se recalcula a partir de ellas.</p>
                    </div>

                    <div className="mt-5 space-y-4">
                      {players.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#cbd9e3] bg-white p-7 text-center text-[#718698]">Este partido no tiene estadísticas individuales.</div>
                      ) : (
                        players.map((player, index) => (
                          <MatchPlayerEditor
                            key={`${player.playerId || player.nombre}-${index}`}
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
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#245f8e]">Validación</p>
                    <div className="mt-4"><MatchValidationPanel issues={validation} /></div>
                    <button
                      type="button"
                      disabled={saving || validation.some((issue) => issue.level === "error")}
                      onClick={saveCorrection}
                      className="mt-5 min-h-12 rounded-xl bg-[#245f8e] px-6 text-sm font-black uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? "Guardando..." : "Guardar corrección"}
                    </button>
                  </section>
                </div>

                <aside className="space-y-5">
                  <section className="rounded-[24px] border border-[#d8e2ec] bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#245f8e]">Evidencia</p>
                    <h2 className="mt-1 text-xl font-black">Archivos TXT</h2>
                    <div className="mt-4 space-y-2">
                      {segments.length === 0 ? (
                        <p className="text-sm text-[#73889a]">Sin TXT asociados. Probablemente fue una carga manual o todavía no fue cargado.</p>
                      ) : (
                        segments.map((segment) => (
                          <div key={segment.id} className="rounded-xl bg-[#f4f7f9] p-3">
                            <strong className="block truncate text-sm">{segment.archivo_nombre}</strong>
                            <span className="mt-1 block text-xs text-[#75899a]">{segment.duracion_minutos || "?"} min · {segment.goles_local}-{segment.goles_visitante}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-[#d8e2ec] bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#245f8e]">Auditoría</p>
                    <h2 className="mt-1 text-xl font-black">Historial de cambios</h2>
                    <div className="mt-4 space-y-3">
                      {revisions.length === 0 ? (
                        <p className="text-sm text-[#73889a]">Todavía no hay revisiones registradas con el nuevo sistema.</p>
                      ) : (
                        revisions.map((revision) => (
                          <article key={revision.id} className="rounded-xl border border-[#e1e7ec] p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <strong className="block text-sm">#{revision.revision_number} · {SOURCE_LABELS[revision.source] || revision.source}</strong>
                                <span className="mt-1 block text-xs text-[#788d9e]">{new Date(revision.created_at).toLocaleString("es-AR")}</span>
                                {revision.reason && <p className="mt-2 text-xs leading-5 text-[#607688]">{revision.reason}</p>}
                              </div>
                              <button
                                type="button"
                                disabled={restoring === revision.id}
                                onClick={() => restore(revision)}
                                className="shrink-0 rounded-lg border border-[#cbd8e1] px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#245f8e] disabled:opacity-50"
                              >
                                Restaurar
                              </button>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                </aside>
              </section>
            </>
          )}
        </div>
      </main>
    </PermissionGuard>
  );
}
