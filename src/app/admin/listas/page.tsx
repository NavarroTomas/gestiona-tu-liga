"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";

type Partido = {
  id: string;
  partido_id?: string | null;
  local: string;
  visitante: string;
  resultado?: string | null;
  fecha?: string | number | null;
  temporada: string;
  division?: string | null;
  dia?: string | null;
  hora?: string | null;
  competicion?: string | null;
  grupo?: string | null;
  fase?: string | null;
  ronda?: string | null;
};

type Jugador = {
  id: string;
  nombre: string;
  playerId?: string | null;
  playerid?: string | null;
  equipo?: string | null;
  goles?: number | null;
  asistencias?: number | null;
  mvps?: number | null;
  temporada?: string | null;
  division?: string | null;
};

const TEMPORADAS = ["Temporada 4"];

const COMPETICIONES = [
  { value: "todas", label: "Todas" },
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa APA" },
  { value: "copa_campeones", label: "Copa Campeones" },
  { value: "playoffs", label: "Playoffs" },
];

function labelCompeticion(value?: string | null) {
  const v = String(value || "liga").toLowerCase();
  if (v === "liga") return "Liga";
  if (v === "copa_clasificatoria") return "Clasificación";
  if (v === "copa_argentina") return "Copa Argentina";
  if (v === "copa_apa") return "Copa APA";
  if (v === "copa_campeones") return "Copa Campeones";
  if (v === "playoffs") return "Playoffs";
  return v || "Sin competencia";
}

function contextoPartido(p: Partido) {
  const partes = [labelCompeticion(p.competicion)];

  if (p.competicion === "liga") {
    partes.push(String(p.division || "Sin división"));
  }

  if (p.grupo) partes.push(`Grupo ${p.grupo}`);
  if (p.fase) partes.push(String(p.fase));
  if (p.ronda) partes.push(String(p.ronda));

  return partes.filter(Boolean).join(" · ");
}

export default function AdminListasPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [competicion, setCompeticion] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [editandoPartido, setEditandoPartido] = useState<Partido | null>(null);
  const [editandoJugador, setEditandoJugador] = useState<Jugador | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarTodo();
  }, [temporada, competicion]);

  async function cargarTodo() {
    setLoading(true);
    setMensaje("");

    let partidosQuery = supabase
      .from("partidos")
      .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda")
      .eq("temporada", temporada)
      .order("fecha", { ascending: true });

    if (competicion !== "todas") {
      partidosQuery = partidosQuery.eq("competicion", competicion);
    }

    const [partidosRes, jugadoresRes] = await Promise.all([
      partidosQuery,
      supabase
        .from("jugadores")
        .select("id, nombre, playerId, playerid, equipo, goles, asistencias, mvps, temporada, division")
        .eq("temporada", temporada)
        .order("nombre", { ascending: true }),
    ]);

    if (partidosRes.error) {
      console.log(partidosRes.error);
      setMensaje("Error cargando partidos.");
    }

    if (jugadoresRes.error) {
      console.log(jugadoresRes.error);
      setMensaje("Error cargando jugadores.");
    }

    setPartidos((partidosRes.data || []) as Partido[]);
    setJugadores((jugadoresRes.data || []) as Jugador[]);
    setLoading(false);
  }

  const partidosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    return partidos.filter((p) => {
      if (!q) return true;
      return `${p.local} ${p.visitante} ${p.resultado || ""} ${contextoPartido(p)}`
        .toLowerCase()
        .includes(q);
    });
  }, [partidos, busqueda]);

  async function guardarPartido() {
    if (!editandoPartido) return;

    const { error } = await supabase
      .from("partidos")
      .update({
        local: editandoPartido.local,
        visitante: editandoPartido.visitante,
        resultado: editandoPartido.resultado || null,
        fecha: editandoPartido.fecha,
        dia: editandoPartido.dia || null,
        hora: editandoPartido.hora || null,
      })
      .eq("id", editandoPartido.id);

    if (error) {
      console.log(error);
      alert("Error guardando partido.");
      return;
    }

    alert("Partido actualizado.");
    setEditandoPartido(null);
    cargarTodo();
  }

  async function guardarJugador() {
    if (!editandoJugador) return;

    const { error } = await supabase
      .from("jugadores")
      .update({
        nombre: editandoJugador.nombre,
        equipo: editandoJugador.equipo,
        goles: Number(editandoJugador.goles || 0),
        asistencias: Number(editandoJugador.asistencias || 0),
        mvps: Number(editandoJugador.mvps || 0),
        temporada: editandoJugador.temporada,
        division: editandoJugador.division,
      })
      .eq("id", editandoJugador.id);

    if (error) {
      console.log(error);
      alert("Error guardando jugador.");
      return;
    }

    alert("Jugador actualizado.");
    setEditandoJugador(null);
    cargarTodo();
  }

  async function borrar(tabla: string, id: string) {
    if (!confirm("¿Seguro que querés borrar esto?")) return;

    const { error } = await supabase.from(tabla).delete().eq("id", id);

    if (error) {
      console.log(error);
      alert("Error al borrar. Revisá permisos/RLS.");
      return;
    }

    alert("Borrado correctamente.");
    cargarTodo();
  }

  return (
    <PermissionGuard permission="matches.edit">
      <main className="min-h-screen bg-[#0b0f14] text-white">
        <div className="mx-auto max-w-[1500px] space-y-8 px-4 py-10 md:px-8">
          <section>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-400">
              Admin APA PSO
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase md:text-5xl">
              Listas, edición y borrado
            </h1>
            <p className="mt-3 max-w-3xl text-zinc-400">
              Editá datos cargados sin cambiar accidentalmente competición, fase o grupo.
            </p>
          </section>

          {mensaje && (
            <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-300">
              {mensaje}
            </section>
          )}

          <section className="rounded-[28px] border border-sky-500/25 bg-[#11151c] p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <select className="input" value={temporada} onChange={(e) => setTemporada(e.target.value)}>
                {TEMPORADAS.map((t) => <option key={t}>{t}</option>)}
              </select>

              <select className="input" value={competicion} onChange={(e) => setCompeticion(e.target.value)}>
                {COMPETICIONES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              <input
                className="input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar partido, equipo o contexto..."
              />
            </div>
          </section>

          {editandoPartido && (
            <section className="rounded-[28px] border border-sky-500/35 bg-[#11151c] p-5">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                    Editando partido
                  </p>
                  <h2 className="mt-2 text-2xl font-black uppercase">
                    {editandoPartido.local} vs {editandoPartido.visitante}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {contextoPartido(editandoPartido)}
                  </p>
                </div>

                <button
                  onClick={() => setEditandoPartido(null)}
                  className="rounded-2xl border border-white/10 bg-black/35 px-5 py-3 text-xs font-black uppercase text-zinc-400"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input className="input" value={editandoPartido.local} onChange={(e) => setEditandoPartido({ ...editandoPartido, local: e.target.value })} />
                <input className="input" value={editandoPartido.visitante} onChange={(e) => setEditandoPartido({ ...editandoPartido, visitante: e.target.value })} />
                <input className="input" placeholder="Resultado" value={editandoPartido.resultado || ""} onChange={(e) => setEditandoPartido({ ...editandoPartido, resultado: e.target.value })} />
                <input className="input" placeholder="Fecha" value={String(editandoPartido.fecha || "")} onChange={(e) => setEditandoPartido({ ...editandoPartido, fecha: e.target.value })} />
                <input className="input" placeholder="Día" value={editandoPartido.dia || ""} onChange={(e) => setEditandoPartido({ ...editandoPartido, dia: e.target.value })} />
                <input className="input" placeholder="Hora" value={editandoPartido.hora || ""} onChange={(e) => setEditandoPartido({ ...editandoPartido, hora: e.target.value })} />
              </div>

              <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
                Competición, división, grupo y fase quedan bloqueados para evitar errores de contexto.
              </div>

              <button onClick={guardarPartido} className="btn mt-5">
                Guardar partido
              </button>
            </section>
          )}

          <section className="rounded-[28px] border border-sky-500/25 bg-[#11151c] p-5">
            <h2 className="text-2xl font-black uppercase">Partidos</h2>
            {loading ? (
              <p className="mt-4 text-zinc-500">Cargando...</p>
            ) : (
              <div className="mt-5 space-y-3">
                {partidosFiltrados.map((p) => (
                  <article key={p.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-300">
                          {contextoPartido(p)} · Fecha {p.fecha || "-"}
                        </p>
                        <h3 className="mt-2 text-xl font-black uppercase">
                          {p.local} <span className="text-yellow-300">{p.resultado || "VS"}</span> {p.visitante}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          {p.dia || "Día sin cargar"} · {p.hora || "Hora sin cargar"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => setEditandoPartido(p)} className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-black uppercase text-sky-300">
                          Editar
                        </button>
                        <button onClick={() => borrar("partidos", p.id)} className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-black uppercase text-red-300">
                          Borrar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-sky-500/25 bg-[#11151c] p-5">
            <h2 className="text-2xl font-black uppercase">Jugadores históricos</h2>

            {editandoJugador && (
              <div className="my-5 rounded-2xl border border-sky-500/25 bg-black/30 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input className="input" value={editandoJugador.nombre || ""} onChange={(e) => setEditandoJugador({ ...editandoJugador, nombre: e.target.value })} />
                  <input className="input" value={editandoJugador.equipo || ""} onChange={(e) => setEditandoJugador({ ...editandoJugador, equipo: e.target.value })} />
                  <input className="input" value={String(editandoJugador.goles || 0)} onChange={(e) => setEditandoJugador({ ...editandoJugador, goles: Number(e.target.value) })} />
                  <input className="input" value={String(editandoJugador.asistencias || 0)} onChange={(e) => setEditandoJugador({ ...editandoJugador, asistencias: Number(e.target.value) })} />
                  <input className="input" value={String(editandoJugador.mvps || 0)} onChange={(e) => setEditandoJugador({ ...editandoJugador, mvps: Number(e.target.value) })} />
                </div>
                <button onClick={guardarJugador} className="btn mt-4">Guardar jugador</button>
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {jugadores.map((j) => (
                <article key={j.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <h3 className="font-black uppercase">{j.nombre}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{j.equipo || "Sin equipo"} · {j.division || "-"}</p>
                  <p className="mt-2 text-xs text-zinc-400">G: {j.goles || 0} · A: {j.asistencias || 0} · MVP: {j.mvps || 0}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setEditandoJugador(j)} className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-black uppercase text-sky-300">Editar</button>
                    <button onClick={() => borrar("jugadores", j.id)} className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-black uppercase text-red-300">Borrar</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </PermissionGuard>
  );
}
