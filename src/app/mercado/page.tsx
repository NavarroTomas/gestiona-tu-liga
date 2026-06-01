"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MercadoPage() {
  const temporadas = [
    "Temporada 1",
    "Temporada 2",
    "Temporada 3",
    "Temporada 4",
    "Temporada 5",
  ];

  const divisiones = [
    { nombre: "Primera", icon: "🏆" },
    { nombre: "Segunda", icon: "🥈" },
    { nombre: "Tercera", icon: "🥉" },
    { nombre: "Cuarta", icon: "⭐" },
  ];
  const tipos = ["Todos", "Fichaje", "Salida", "Préstamo", "Libre"];

  const [temporada, setTemporada] = useState("Temporada 1");
  const [division, setDivision] = useState("Primera");
  const [tipoActivo, setTipoActivo] = useState("Todos");
  const [movimientos, setMovimientos] = useState<any[]>([]);

  useEffect(() => {
    cargarMovimientos();
  }, [temporada, division]);

  async function cargarMovimientos() {
    const { data, error } = await supabase
      .from("transferencias")
      .select("*")
      .eq("temporada", temporada)
      .eq("division", division)
      .order("fecha", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setMovimientos(data || []);
  }

  function colorTipo(tipo: string) {
    if (tipo === "Fichaje")
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    if (tipo === "Salida")
      return "border-red-400/30 bg-red-400/10 text-red-300";
    if (tipo === "Préstamo")
      return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
    if (tipo === "Libre") return "border-sky-400/30 bg-sky-400/10 text-sky-300";
    return "border-purple-400/30 bg-purple-400/10 text-purple-300";
  }

  function iconoTipo(tipo: string) {
    if (tipo === "Fichaje") return "✅";
    if (tipo === "Salida") return "🚪";
    if (tipo === "Préstamo") return "🔄";
    if (tipo === "Libre") return "🆓";
    return "⚡";
  }

  const movimientosFiltrados =
    tipoActivo === "Todos"
      ? movimientos
      : movimientos.filter((m) => m.tipo === tipoActivo);

  const fichajes = movimientos.filter((m) => m.tipo === "Fichaje").length;
  const salidas = movimientos.filter((m) => m.tipo === "Salida").length;
  const prestamos = movimientos.filter((m) => m.tipo === "Préstamo").length;
  const libres = movimientos.filter((m) => m.tipo === "Libre").length;

  const movimientoDestacado = movimientosFiltrados[0];

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
                APA PSO ARGENTINA
              </p>

              <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Mercado
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                  de Pases
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-zinc-400">
                Fichajes, salidas, préstamos y jugadores libres de APA PSO
                Argentina UE5. Seguimiento oficial por temporada y división.
              </p>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-black/35 p-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Fichajes
                  </p>
                  <p className="mt-2 text-3xl font-black text-emerald-400">
                    {fichajes}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-black/35 p-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Salidas
                  </p>
                  <p className="mt-2 text-3xl font-black text-red-300">
                    {salidas}
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Préstamos
                  </p>
                  <p className="mt-2 text-3xl font-black text-yellow-300">
                    {prestamos}
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Libres
                  </p>
                  <p className="mt-2 text-3xl font-black text-sky-300">
                    {libres}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex h-40 w-40 items-center justify-center rounded-full border border-sky-400/40 bg-black/40 shadow-[0_0_35px_rgba(0,120,255,.45)]">
              <span className="text-6xl">🔁</span>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]">
          <div className="grid gap-7">
            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Temporada
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {temporadas.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setTemporada(temp)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      temporada === temp
                        ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                División
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {divisiones.map((div) => (
                  <button
                    key={div.nombre}
                    onClick={() => setDivision(div.nombre)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      division === div.nombre
                        ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {div.icon} {div.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Tipo de movimiento
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {tipos.map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setTipoActivo(tipo)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      tipoActivo === tipo
                        ? "border-sky-300 bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {tipo === "Todos" ? "Todos" : `${iconoTipo(tipo)} ${tipo}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
            Selección actual
          </p>

          <h2 className="mt-3 text-3xl md:text-5xl font-black uppercase">
            {temporada}
            <span className="text-sky-400"> / </span>
            {division}
          </h2>

          <p className="mt-3 text-zinc-500">
            {tipoActivo} · {movimientosFiltrados.length} movimientos visibles
          </p>
        </section>

        {movimientoDestacado && (
          <section className="relative overflow-hidden rounded-[34px] border border-yellow-400/30 bg-[#020714] p-6 shadow-[0_0_45px_rgba(250,204,21,.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.16),transparent_40%)]" />

            <div className="relative z-10">
              <p className="text-yellow-300 text-xs uppercase tracking-[0.35em] font-black">
                Movimiento destacado
              </p>

              <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase">
                    {iconoTipo(movimientoDestacado.tipo)}{" "}
                    {movimientoDestacado.jugador}
                  </h2>

                  <p className="mt-3 text-zinc-400 text-lg">
                    {movimientoDestacado.desde || "Libre"}{" "}
                    <span className="text-sky-300 font-black">→</span>{" "}
                    {movimientoDestacado.hacia || "Sin destino"}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border px-6 py-4 font-black uppercase ${colorTipo(
                    movimientoDestacado.tipo,
                  )}`}
                >
                  {movimientoDestacado.tipo}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <p className="text-zinc-500 uppercase tracking-[0.18em] text-xs font-black">
                  {movimientoDestacado.temporada} ·{" "}
                  {movimientoDestacado.division}
                </p>

                {movimientoDestacado.fecha && (
                  <span className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                    Movimiento #{movimientoDestacado.fecha}
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {movimientosFiltrados.length === 0 ? (
          <section className="relative overflow-hidden rounded-[34px] border border-sky-500/20 bg-[#020714] p-10 text-center shadow-[0_0_35px_rgba(0,120,255,.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,.14),transparent_45%)]" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-5xl shadow-[0_0_30px_rgba(56,189,248,.18)]">
                🔁
              </div>

              <h2 className="mt-6 text-4xl font-black uppercase">
                Mercado cerrado
              </h2>

              <p className="mt-4 text-zinc-400">
                No hay movimientos visibles con el filtro actual. Probá cambiar
                temporada, división o tipo de movimiento.
              </p>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-300 font-black">
                  ✅ Fichajes
                </div>

                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-300 font-black">
                  🔄 Préstamos
                </div>

                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-300 font-black">
                  🚪 Salidas
                </div>

                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sky-300 font-black">
                  🆓 Libres
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {movimientosFiltrados.map((m) => (
              <div
                key={m.id}
                className="group relative overflow-hidden rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 transition hover:border-sky-400/45 hover:shadow-[0_0_30px_rgba(56,189,248,.14)]"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.12),transparent_40%)]" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${colorTipo(
                        m.tipo,
                      )}`}
                    >
                      {iconoTipo(m.tipo)} {m.tipo}
                    </span>

                    <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.18em]">
                      {m.fecha ? `Movimiento #${m.fecha}` : "Sin registro"}
                    </p>
                  </div>

                  <h2 className="mt-6 text-3xl font-black uppercase">
                    {m.jugador}
                  </h2>

                  <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black">
                        Desde
                      </p>
                      <p className="mt-2 truncate font-black">
                        {m.desde || "Libre"}
                      </p>
                    </div>

                    <div className="text-2xl text-sky-300 font-black">→</div>

                    <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
                      <p className="text-sky-300 text-[10px] uppercase tracking-[0.2em] font-black">
                        Hacia
                      </p>
                      <p className="mt-2 truncate font-black">
                        {m.hacia || "Sin destino"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-zinc-500 uppercase tracking-[0.16em] text-xs font-black">
                    {m.temporada} · {m.division}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
