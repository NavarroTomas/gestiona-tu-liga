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
  division: string;
  dia?: string | null;
  hora?: string | null;
};

type Equipo = {
  id?: string;
  nombre: string;
};

const temporadas = [
  "Temporada 1",
  "Temporada 2",
  "Temporada 3",
  "Temporada 4",
  "Temporada 5",
  "Temporada 6",
];

const divisiones = [
  { nombre: "Primera", icon: "🏆" },
  { nombre: "Segunda", icon: "🥈" },
  { nombre: "Tercera", icon: "🥉" },
  { nombre: "Cuarta", icon: "⭐" },
];

function generarRoundRobin(equiposOriginales: string[]) {
  const equipos = [...equiposOriginales];

  if (equipos.length % 2 !== 0) equipos.push("DESCANSA");

  const totalRondas = equipos.length - 1;
  const partidosPorRonda = equipos.length / 2;
  const fixture: { fecha: number; local: string; visitante: string }[] = [];
  let rotacion = [...equipos];

  for (let ronda = 0; ronda < totalRondas; ronda++) {
    for (let i = 0; i < partidosPorRonda; i++) {
      const a = rotacion[i];
      const b = rotacion[rotacion.length - 1 - i];

      if (a !== "DESCANSA" && b !== "DESCANSA") {
        fixture.push({
          fecha: ronda + 1,
          local: ronda % 2 === 0 ? a : b,
          visitante: ronda % 2 === 0 ? b : a,
        });
      }
    }

    const fijo = rotacion[0];
    const resto = rotacion.slice(1);
    resto.unshift(resto.pop() as string);
    rotacion = [fijo, ...resto];
  }

  return fixture;
}

export default function AdminFixturePage() {

  const [temporada, setTemporada] = useState("Temporada 5");
  const [division, setDivision] = useState("Primera");
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [localManual, setLocalManual] = useState("");
  const [visitanteManual, setVisitanteManual] = useState("");
  const [fechaManual, setFechaManual] = useState("1");
  const [diaManual, setDiaManual] = useState("");
  const [horaManual, setHoraManual] = useState("");

  useEffect(() => {
    cargarTodo();
  }, [temporada, division]);

  async function cargarTodo() {
    setLoading(true);
    setMensaje("");

    const { data: equiposData, error: equiposError } = await supabase
      .from("equipos")
      .select("*")
      .eq("temporada", temporada)
      .eq("division", division)
      .order("nombre", { ascending: true });

    const { data: partidosData, error: partidosError } = await supabase
      .from("partidos")
      .select("*")
      .eq("temporada", temporada)
      .eq("division", division)
      .order("fecha", { ascending: true });

    if (equiposError) {
      console.log(equiposError);
      setMensaje("Error cargando equipos.");
    }

    if (partidosError) {
      console.log(partidosError);
      setMensaje("Error cargando partidos.");
    }

    setEquipos(equiposData || []);
    setPartidos(partidosData || []);
    setSeleccionados((equiposData || []).map((e: any) => e.nombre));
    setLoading(false);
  }

  const partidosPorFecha = useMemo(() => {
    const mapa: Record<string, Partido[]> = {};

    partidos.forEach((p) => {
      const key = String(p.fecha || "Sin fecha");
      if (!mapa[key]) mapa[key] = [];
      mapa[key].push(p);
    });

    return Object.entries(mapa).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [partidos]);

  const tablaPreview = useMemo(() => {
    const mapa: Record<string, any> = {};

    function asegurar(nombre: string) {
      if (!mapa[nombre]) {
        mapa[nombre] = {
          equipo: nombre,
          pts: 0,
          pj: 0,
          pg: 0,
          pe: 0,
          pp: 0,
          gf: 0,
          gc: 0,
          dg: 0,
        };
      }
    }

    partidos.forEach((p) => {
      asegurar(p.local);
      asegurar(p.visitante);

      if (!p.resultado || !p.resultado.includes("-")) return;

      const [glRaw, gvRaw] = p.resultado.split("-");
      const gl = Number(glRaw?.trim());
      const gv = Number(gvRaw?.trim());

      if (Number.isNaN(gl) || Number.isNaN(gv)) return;

      mapa[p.local].pj += 1;
      mapa[p.visitante].pj += 1;
      mapa[p.local].gf += gl;
      mapa[p.local].gc += gv;
      mapa[p.visitante].gf += gv;
      mapa[p.visitante].gc += gl;

      if (gl > gv) {
        mapa[p.local].pg += 1;
        mapa[p.local].pts += 3;
        mapa[p.visitante].pp += 1;
      } else if (gl < gv) {
        mapa[p.visitante].pg += 1;
        mapa[p.visitante].pts += 3;
        mapa[p.local].pp += 1;
      } else {
        mapa[p.local].pe += 1;
        mapa[p.visitante].pe += 1;
        mapa[p.local].pts += 1;
        mapa[p.visitante].pts += 1;
      }
    });

    return Object.values(mapa)
      .map((e: any) => ({ ...e, dg: e.gf - e.gc }))
      .sort((a: any, b: any) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
      });
  }, [partidos]);

  function toggleEquipo(nombre: string) {
    setSeleccionados((prev) =>
      prev.includes(nombre)
        ? prev.filter((e) => e !== nombre)
        : [...prev, nombre],
    );
  }

  async function crearPartidoManual() {
    if (!localManual || !visitanteManual) {
      setMensaje("Elegí local y visitante.");
      return;
    }

    if (localManual === visitanteManual) {
      setMensaje("Local y visitante no pueden ser el mismo equipo.");
      return;
    }

    const { error } = await supabase.from("partidos").insert({
      local: localManual,
      visitante: visitanteManual,
      resultado: null,
      fecha: fechaManual,
      temporada,
      division,
      dia: diaManual || null,
      hora: horaManual || null,
      partido_id: null,
    });

    if (error) {
      console.log(error);
      setMensaje("Error creando partido.");
      return;
    }

    setMensaje("Partido creado.");
    setLocalManual("");
    setVisitanteManual("");
    await cargarTodo();
  }

  async function generarFixture() {
    if (seleccionados.length < 2) {
      setMensaje("Seleccioná al menos 2 equipos.");
      return;
    }

    const confirmar = window.confirm(
      `Vas a generar ${temporada} · ${division}. ¿Continuar?`,
    );

    if (!confirmar) return;

    const fixture = generarRoundRobin(seleccionados);

    const payload = fixture.map((p) => ({
      local: p.local,
      visitante: p.visitante,
      resultado: null,
      fecha: String(p.fecha),
      temporada,
      division,
      dia: null,
      hora: null,
      partido_id: null,
    }));

    const { error } = await supabase.from("partidos").insert(payload);

    if (error) {
      console.log(error);
      setMensaje("Error generando fixture.");
      return;
    }

    setMensaje(`Fixture generado: ${payload.length} partidos creados.`);
    await cargarTodo();
  }

  async function actualizarPartido(id: string, cambios: Partial<Partido>) {
    const { error } = await supabase.from("partidos").update(cambios).eq("id", id);

    if (error) {
      console.log(error);
      setMensaje("Error actualizando partido.");
      return;
    }

    setPartidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)),
    );
  }

  async function eliminarPartido(id: string) {
    const confirmar = window.confirm("¿Eliminar este partido del fixture?");
    if (!confirmar) return;

    const { error } = await supabase.from("partidos").delete().eq("id", id);

    if (error) {
      console.log(error);
      setMensaje("Error eliminando partido.");
      return;
    }

    setPartidos((prev) => prev.filter((p) => p.id !== id));
  }

  function estadoPartido(p: Partido) {
    if (p.resultado && p.partido_id) return "Jugado con stats";
    if (p.resultado) return "Jugado";
    return "Pendiente";
  }

  function claseEstado(p: Partido) {
    const estado = estadoPartido(p);

    if (estado === "Jugado con stats") {
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    }

    if (estado === "Jugado") {
      return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
    }

    return "border-sky-400/30 bg-sky-400/10 text-sky-300";
  }
return (
    <PermissionGuard permission="competitions.manage">
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-[1600px] space-y-8">
        <section className="relative overflow-hidden rounded-[40px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.22)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/30" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
                Admin · Gestor de competición
              </p>

              <h1 className="mt-5 text-5xl font-black uppercase italic leading-none md:text-7xl">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Fixture
                </span>
                <span className="block text-sky-400 drop-shadow-[0_0_22px_rgba(56,189,248,.55)]">
                  Manager
                </span>
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
                Creá partidos visibles antes de cargar TXT. Programá día y hora,
                generá fechas automáticamente y mantené el calendario vivo.
              </p>
            </div>

            <div className="rounded-[34px] border border-sky-400/25 bg-black/35 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">
                Selección actual
              </p>

              <h2 className="mt-3 text-3xl font-black uppercase">
                {temporada}
              </h2>

              <p className="mt-2 text-xl font-black uppercase text-yellow-300">
                {division} División
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-black uppercase text-zinc-500">
                    Equipos
                  </p>
                  <p className="mt-2 text-3xl font-black text-sky-300">
                    {seleccionados.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-black uppercase text-zinc-500">
                    Partidos
                  </p>
                  <p className="mt-2 text-3xl font-black text-yellow-300">
                    {partidos.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {mensaje && (
          <div className="rounded-2xl border border-sky-400/25 bg-sky-400/10 px-5 py-4 text-sm font-black uppercase text-sky-300">
            {mensaje}
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-[34px] border border-sky-500/25 bg-[#020714]/95 p-6">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Contexto
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Temporada y división
              </h2>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                    Temporada
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {temporadas.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTemporada(t)}
                        className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase transition ${
                          temporada === t
                            ? "border-sky-300 bg-sky-400 text-black"
                            : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-sky-400/30 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                    División
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {divisiones.map((d) => (
                      <button
                        key={d.nombre}
                        onClick={() => setDivision(d.nombre)}
                        className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase transition ${
                          division === d.nombre
                            ? "border-yellow-300 bg-yellow-400 text-black"
                            : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-yellow-400/30 hover:text-white"
                        }`}
                      >
                        {d.icon} {d.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714]/95 p-6">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                Equipos
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Participantes
              </h2>

              <div className="mt-5 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {equipos.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-sm text-zinc-500">
                    No hay equipos cargados para esta selección.
                  </p>
                ) : (
                  equipos.map((e) => (
                    <button
                      key={e.nombre}
                      onClick={() => toggleEquipo(e.nombre)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                        seleccionados.includes(e.nombre)
                          ? "border-yellow-400/35 bg-yellow-400/10 text-white"
                          : "border-white/10 bg-black/35 text-zinc-500 hover:border-yellow-400/25 hover:text-white"
                      }`}
                    >
                      <span className="truncate text-sm font-black uppercase">
                        {e.nombre}
                      </span>
                      <span className="text-lg">
                        {seleccionados.includes(e.nombre) ? "✅" : "⬜"}
                      </span>
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={generarFixture}
                className="mt-5 w-full rounded-2xl border border-yellow-400/30 bg-yellow-400 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white"
              >
                ⚡ Generar fixture
              </button>
            </section>

            <section className="rounded-[34px] border border-emerald-500/25 bg-[#020714]/95 p-6">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                Manual
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Añadir partido
              </h2>

              <div className="mt-5 space-y-3">
                <select
                  value={localManual}
                  onChange={(e) => setLocalManual(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                >
                  <option value="">Local</option>
                  {equipos.map((e) => (
                    <option key={`local-${e.nombre}`} value={e.nombre}>
                      {e.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={visitanteManual}
                  onChange={(e) => setVisitanteManual(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                >
                  <option value="">Visitante</option>
                  {equipos.map((e) => (
                    <option key={`vis-${e.nombre}`} value={e.nombre}>
                      {e.nombre}
                    </option>
                  ))}
                </select>

                <input
                  value={fechaManual}
                  onChange={(e) => setFechaManual(e.target.value)}
                  placeholder="Fecha / Ronda"
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                />

                <input
                  value={diaManual}
                  onChange={(e) => setDiaManual(e.target.value)}
                  placeholder="Día"
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                />

                <input
                  value={horaManual}
                  onChange={(e) => setHoraManual(e.target.value)}
                  placeholder="Hora"
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                />

                <button
                  onClick={crearPartidoManual}
                  className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-400 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white"
                >
                  + Añadir partido
                </button>
              </div>
            </section>
          </aside>

          <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_1.05fr]">
            <section className="rounded-[34px] border border-sky-500/25 bg-[#020714]/95 p-6">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                    Tabla preview
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase">
                    Posiciones
                  </h2>
                </div>

                <span className="text-xs font-black uppercase text-zinc-500">
                  Auto por resultados
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.22em] text-sky-300/80">
                      <th className="py-3 text-left">#</th>
                      <th className="py-3 text-left">Equipo</th>
                      <th className="py-3 text-center">PTS</th>
                      <th className="py-3 text-center">PJ</th>
                      <th className="py-3 text-center">GF</th>
                      <th className="py-3 text-center">GC</th>
                      <th className="py-3 text-center">DG</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tablaPreview.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500">
                          Sin partidos para calcular tabla.
                        </td>
                      </tr>
                    ) : (
                      tablaPreview.map((e: any, index: number) => (
                        <tr
                          key={e.equipo}
                          className="bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18]"
                        >
                          <td className="rounded-l-xl px-4 py-4 font-black text-sky-300">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4 font-black uppercase">
                            {e.equipo}
                          </td>
                          <td className="py-4 text-center font-black text-yellow-300">
                            {e.pts}
                          </td>
                          <td className="py-4 text-center font-black">{e.pj}</td>
                          <td className="py-4 text-center font-black text-emerald-300">
                            {e.gf}
                          </td>
                          <td className="py-4 text-center font-black text-red-300">
                            {e.gc}
                          </td>
                          <td className="rounded-r-xl py-4 text-center font-black text-sky-300">
                            {e.dg > 0 ? `+${e.dg}` : e.dg}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714]/95 p-6">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                    Calendario
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase">
                    Partidos visibles
                  </h2>
                </div>

                <span className="text-xs font-black uppercase text-zinc-500">
                  {partidos.length} partidos
                </span>
              </div>

              {loading ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                  Cargando...
                </p>
              ) : partidosPorFecha.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                  Todavía no hay partidos programados.
                </p>
              ) : (
                <div className="max-h-[980px] space-y-5 overflow-y-auto pr-1">
                  {partidosPorFecha.map(([fecha, lista]) => (
                    <div
                      key={fecha}
                      className="rounded-[28px] border border-white/10 bg-black/30 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <h3 className="text-xl font-black uppercase">
                          Fecha {fecha}
                        </h3>

                        <span className="text-xs font-black uppercase text-zinc-500">
                          {lista.length} partidos
                        </span>
                      </div>

                      <div className="space-y-3">
                        {lista.map((p) => (
                          <div
                            key={p.id}
                            className="rounded-2xl border border-sky-500/15 bg-[#020714] p-4"
                          >
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                              <span
                                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${claseEstado(
                                  p,
                                )}`}
                              >
                                {estadoPartido(p)}
                              </span>

                              <button
                                onClick={() => eliminarPartido(p.id)}
                                className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-1 text-[10px] font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                              >
                                Eliminar
                              </button>
                            </div>

                            <div className="grid grid-cols-[1fr_78px_1fr] items-center gap-3">
                              <input
                                value={p.local}
                                onChange={(e) =>
                                  actualizarPartido(p.id, {
                                    local: e.target.value,
                                  })
                                }
                                className="min-w-0 rounded-2xl border border-white/10 bg-black/35 px-3 py-3 text-right text-sm font-black uppercase text-white outline-none"
                              />

                              <div className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-2 py-3 text-center text-lg font-black text-yellow-300">
                                {p.resultado || "VS"}
                              </div>

                              <input
                                value={p.visitante}
                                onChange={(e) =>
                                  actualizarPartido(p.id, {
                                    visitante: e.target.value,
                                  })
                                }
                                className="min-w-0 rounded-2xl border border-white/10 bg-black/35 px-3 py-3 text-left text-sm font-black uppercase text-white outline-none"
                              />
                            </div>

                            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                              <input
                                value={String(p.fecha || "")}
                                onChange={(e) =>
                                  actualizarPartido(p.id, {
                                    fecha: e.target.value,
                                  })
                                }
                                placeholder="Fecha"
                                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                              />

                              <input
                                value={p.dia || ""}
                                onChange={(e) =>
                                  actualizarPartido(p.id, {
                                    dia: e.target.value,
                                  })
                                }
                                placeholder="Día"
                                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                              />

                              <input
                                value={p.hora || ""}
                                onChange={(e) =>
                                  actualizarPartido(p.id, {
                                    hora: e.target.value,
                                  })
                                }
                                placeholder="Hora"
                                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase text-white outline-none"
                              />
                            </div>

                            {p.partido_id && (
                              <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                                partido_id: {p.partido_id}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>
        </section>
      </section>
      </main>
    </PermissionGuard>
  );
}
