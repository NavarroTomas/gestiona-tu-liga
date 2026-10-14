"use client";
import { displayLabel } from "@/lib/displayLabels";


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import { AdminMatchBackLink } from "@/components/admin/matches/MatchAdminUi";
import {
  fetchAdminMatches,
  updateAdminMatchSchedule,
  voidAdminMatch,
} from "@/lib/adminMatches/api";
import {
  competitionLabel,
  MATCH_COMPETITIONS,
  matchContextLabel,
} from "@/lib/adminMatches/domain";
import type { AdminMatch } from "@/lib/adminMatches/types";

const TEMPORADAS = ["Temporada 4"];

export default function AdminListasPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [competicion, setCompeticion] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [partidos, setPartidos] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [editingSchedule, setEditingSchedule] = useState<AdminMatch | null>(null);
  const [fechaEdit, setFechaEdit] = useState("");
  const [diaEdit, setDiaEdit] = useState("");
  const [horaEdit, setHoraEdit] = useState("");
  const [accionando, setAccionando] = useState<string | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporada, competicion]);

  async function load() {
    setLoading(true);
    setMensaje("");
    try {
      const data = await fetchAdminMatches({
        temporada,
        competicion: competicion === "todas" ? undefined : competicion,
      });
      setPartidos(data);
    } catch (error: any) {
      console.error(error);
      setMensaje(error?.message || "No pude cargar los partidos.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return partidos;
    return partidos.filter((match) =>
      [
        match.local,
        match.visitante,
        match.resultado,
        match.fecha,
        match.division,
        match.grupo,
        match.fase,
        match.ronda,
        competitionLabel(match.competicion),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [partidos, busqueda]);

  function openSchedule(match: AdminMatch) {
    setEditingSchedule(match);
    setFechaEdit(String(match.fecha || ""));
    setDiaEdit(match.dia || "");
    setHoraEdit(match.hora || "");
  }

  async function saveSchedule() {
    if (!editingSchedule) return;
    setAccionando(String(editingSchedule.id));
    setMensaje("");
    try {
      await updateAdminMatchSchedule({
        partidoRowId: editingSchedule.id,
        fecha: fechaEdit,
        dia: diaEdit,
        hora: horaEdit,
      });
      setMensaje("Programación actualizada correctamente.");
      setEditingSchedule(null);
      await load();
    } catch (error: any) {
      console.error(error);
      setMensaje(error?.message || "No pude actualizar la programación.");
    } finally {
      setAccionando(null);
    }
  }

  async function voidMatch(match: AdminMatch) {
    if (!match.partido_id && !match.resultado) {
      setMensaje("Este partido todavía no tiene una carga para anular.");
      return;
    }

    const confirmed = window.confirm(
      `¿Anular la carga de ${match.local} vs ${match.visitante}?\n\nSe eliminarán resultado, estadísticas y TXT asociados, pero el partido programado seguirá existiendo. La operación quedará registrada en el historial.`,
    );
    if (!confirmed) return;

    setAccionando(String(match.id));
    setMensaje("");
    try {
      await voidAdminMatch(match.id);
      setMensaje(`Carga anulada: ${match.local} vs ${match.visitante}.`);
      await load();
    } catch (error: any) {
      console.error(error);
      setMensaje(error?.message || "No pude anular la carga.");
    } finally {
      setAccionando(null);
    }
  }

  return (
    <PermissionGuard permission="matches.edit">
      <main className="min-h-screen bg-[#f3f4f6] text-[#102f55]">
        <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-8 md:px-8 md:py-10">
          <AdminMatchBackLink />

          <header className="rounded-[28px] bg-[#0b2747] p-7 text-white md:p-9">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a9c8df]">Control y correcciones</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] md:text-6xl">Centro de partidos</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#d4e2ed] md:text-base">
              Revisá cada partido como una unidad. Los acumulados de jugadores ya no se editan a mano: cualquier corrección se hace sobre el detalle del partido y el ranking se reconstruye automáticamente.
            </p>
          </header>

          {mensaje && (
            <div className="rounded-2xl border border-[#d8c7a8] bg-[#fffaf2] p-4 text-sm font-semibold text-[#73551d]">
              {mensaje}
            </div>
          )}

          <section className="rounded-[24px] border border-[#d8e2ec] bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_260px_1fr]">
              <select className="input" value={temporada} onChange={(e) => setTemporada(e.target.value)}>
                {TEMPORADAS.map((item) => <option key={item} value={item}>{displayLabel(item)}</option>)}
              </select>
              <select className="input" value={competicion} onChange={(e) => setCompeticion(e.target.value)}>
                <option value="todas">Todas las competiciones</option>
                {MATCH_COMPETITIONS.map((item) => <option key={item.value} value={item.value}>{displayLabel(item.label)}</option>)}
              </select>
              <input
                className="input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar club, resultado, fase o fecha..."
              />
            </div>
          </section>

          {editingSchedule && (
            <section className="rounded-[24px] border border-[#adc2d3] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#245f8e]">Editar programación</p>
                  <h2 className="mt-1 text-2xl font-black">{editingSchedule.local} vs {editingSchedule.visitante}</h2>
                  <p className="mt-1 text-sm text-[#6c8294]">Resultado y estadísticas no se modifican desde este formulario.</p>
                </div>
                <button type="button" className="rounded-xl border border-[#d6e0e7] bg-white px-4 py-2 text-xs font-black uppercase" onClick={() => setEditingSchedule(null)}>Cancelar</button>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <input className="input" value={fechaEdit} onChange={(e) => setFechaEdit(e.target.value)} placeholder="Fecha" />
                <input className="input" value={diaEdit} onChange={(e) => setDiaEdit(e.target.value)} placeholder="Día" />
                <input className="input" value={horaEdit} onChange={(e) => setHoraEdit(e.target.value)} placeholder="Hora" />
              </div>
              <button type="button" className="mt-4 rounded-xl bg-[#245f8e] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-white" onClick={saveSchedule} disabled={accionando === String(editingSchedule.id)}>
                Guardar programación
              </button>
            </section>
          )}

          <section className="overflow-hidden rounded-[26px] border border-[#d8e2ec] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e2e8ed] px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#245f8e]">Registro oficial</p>
                <h2 className="mt-1 text-2xl font-black">Partidos</h2>
              </div>
              <span className="rounded-full bg-[#eef3f7] px-3 py-1 text-xs font-black text-[#527089]">{filtered.length}</span>
            </div>

            {loading ? (
              <div className="p-10 text-center font-bold text-[#708698]">Cargando partidos...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-[#708698]">No hay partidos para estos filtros.</div>
            ) : (
              <div className="divide-y divide-[#e5ebef]">
                {filtered.map((match) => {
                  const loaded = Boolean(match.partido_id || match.resultado);
                  return (
                    <article key={match.id} className="p-5 transition hover:bg-[#fafcfd]">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${loaded ? "bg-[#e9f4ec] text-[#2f6a43]" : "bg-[#eef2f5] text-[#6d7f8d]"}`}>
                              {loaded ? "Cargado" : "Programado"}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#7890a4]">{matchContextLabel(match)}</span>
                          </div>
                          <h3 className="mt-3 text-2xl font-black tracking-[-0.03em]">
                            {match.local} <span className="text-[#245f8e]">{match.resultado || "vs"}</span> {match.visitante}
                          </h3>
                          <p className="mt-2 text-sm text-[#6d8294]">
                            {match.dia || "Día sin definir"} · {match.hora || "Hora sin definir"} · ID fila {match.id}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/partidos/${match.id}`}
                            className="rounded-xl bg-[#245f8e] px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-white"
                          >
                            Ver / corregir
                          </Link>
                          <button
                            type="button"
                            onClick={() => openSchedule(match)}
                            className="rounded-xl border border-[#ccd8e1] bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-[#102f55]"
                          >
                            Programación
                          </button>
                          {loaded && (
                            <button
                              type="button"
                              disabled={accionando === String(match.id)}
                              onClick={() => voidMatch(match)}
                              className="rounded-xl border border-[#eccaca] bg-[#fff8f8] px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-[#9a3434] disabled:opacity-50"
                            >
                              Anular carga
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </PermissionGuard>
  );
}
