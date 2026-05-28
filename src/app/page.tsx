"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import TablaPosicionesHome from "../components/TablaPosicionesHome";

export default function Home() {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [division, setDivision] = useState("primera");
  const [temporada, setTemporada] = useState("Temporada 5");

  useEffect(() => {
    cargarDatos();
  }, [division, temporada]);

  async function cargarDatos() {
    const { data: partidosData } = await supabase
      .from("partidos")
      .select("*")
      .eq("division", division)
      .eq("temporada", temporada)
      .order("fecha", { ascending: true });

    const { data: jugadoresData } = await supabase
      .from("partido_jugadores")
      .select("*")
      .eq("division", division)
      .eq("temporada", temporada);

    setPartidos(partidosData || []);
    setJugadores(jugadoresData || []);
  }

  const equipos: any = {};

  partidos.forEach((p) => {
    const [gl, gv] = String(p.resultado || "0-0")
      .split("-")
      .map((n) => parseInt(n) || 0);

    if (!equipos[p.local]) {
      equipos[p.local] = { nombre: p.local, pts: 0, pj: 0, gf: 0, gc: 0 };
    }

    if (!equipos[p.visitante]) {
      equipos[p.visitante] = { nombre: p.visitante, pts: 0, pj: 0, gf: 0, gc: 0 };
    }

    equipos[p.local].pj++;
    equipos[p.visitante].pj++;

    equipos[p.local].gf += gl;
    equipos[p.local].gc += gv;

    equipos[p.visitante].gf += gv;
    equipos[p.visitante].gc += gl;

    if (gl > gv) equipos[p.local].pts += 3;
    else if (gv > gl) equipos[p.visitante].pts += 3;
    else {
      equipos[p.local].pts += 1;
      equipos[p.visitante].pts += 1;
    }
  });

  const tabla = Object.values(equipos).sort((a: any, b: any) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    return b.gf - b.gc - (a.gf - a.gc);
  });

  const fechaActual =
    partidos.length > 0 ? String(partidos[0].fecha || "1") : "1";

  const partidosFecha = partidos.filter(
    (p) => String(p.fecha || "1") === fechaActual
  );

  const ultimos = partidos.slice(-5).reverse();
  const destacado = partidos[0];
  const equiposCantidad = new Set(partidos.flatMap((p) => [p.local, p.visitante])).size;
  const jugadoresCantidad = new Set(jugadores.map((j) => j.nombre)).size;
  const golesTotales = jugadores.reduce((acc, j) => acc + (j.goles || 0), 0);

  return (
    <main className="min-h-screen text-white p-6 bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <section className="max-w-[1500px] mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-[32px] border border-blue-500/40 bg-gradient-to-r from-[#07152f] via-[#020714] to-[#132d63] p-8 shadow-[0_0_45px_rgba(0,120,255,.35)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,140,255,.35),transparent_30%)]" />
          <div className="absolute -right-16 top-0 h-full w-[420px] bg-gradient-to-l from-blue-500/10 to-transparent rotate-6" />

          <div className="relative z-10 flex items-center justify-between gap-8">
            <div>
              <p className="text-sky-400 tracking-[0.6em] text-xs font-black mb-4">
                APA PSO ARGENTINA
              </p>

              <h1 className="text-5xl md:text-7xl font-black leading-none">
                {temporada.toUpperCase()}
              </h1>

              <p className="text-zinc-300 mt-4 text-lg">
                Dashboard oficial · Fixture · Tabla · Estadísticas
              </p>
            </div>

            <div className="hidden lg:flex w-44 h-44 rounded-[36px] border border-blue-400/40 bg-gradient-to-br from-blue-500/20 to-blue-950 items-center justify-center shadow-[0_0_40px_rgba(0,120,255,.55)] overflow-hidden">
              <img
                src="/logo-apa.png"
                alt="APA PSO"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {["primera", "segunda", "tercera", "cuarta"].map((d) => (
            <button
              key={d}
              onClick={() => setDivision(d)}
              className={`px-6 py-3 rounded-2xl font-black uppercase whitespace-nowrap border transition-all ${
                division === d
                  ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(0,120,255,.7)]"
                  : "bg-[#09101d] border-zinc-800 text-zinc-400 hover:border-blue-500/40"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            "Temporada 1",
            "Temporada 2",
            "Temporada 3",
            "Temporada 4",
            "Temporada 5",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setTemporada(t)}
              className={`px-6 py-3 rounded-2xl font-black uppercase whitespace-nowrap border transition-all ${
                temporada === t
                  ? "bg-sky-500 border-sky-300 text-black shadow-[0_0_20px_rgba(56,189,248,.7)]"
                  : "bg-[#09101d] border-zinc-800 text-zinc-400 hover:border-sky-500/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-950/90 border border-blue-500/40 rounded-3xl p-5">
            <p className="text-zinc-500 font-bold">Equipos</p>
            <h2 className="text-4xl font-black">{equiposCantidad}</h2>
          </div>

          <div className="bg-zinc-950/90 border border-blue-500/40 rounded-3xl p-5">
            <p className="text-zinc-500 font-bold">Partidos</p>
            <h2 className="text-4xl font-black">{partidos.length}</h2>
          </div>

          <div className="bg-zinc-950/90 border border-blue-500/40 rounded-3xl p-5">
            <p className="text-zinc-500 font-bold">Jugadores</p>
            <h2 className="text-4xl font-black">{jugadoresCantidad}</h2>
          </div>

          <div className="bg-blue-600 border border-blue-300 rounded-3xl p-5 shadow-[0_0_25px_rgba(0,120,255,.5)]">
            <p className="font-bold text-blue-100">Goles totales</p>
            <h2 className="text-4xl font-black">⚽ {golesTotales}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
              <div className="border border-blue-500/50 bg-zinc-950/90 rounded-3xl p-5 shadow-[0_0_30px_rgba(0,120,255,.25)]">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-3xl font-black">📅 FECHA {fechaActual}</h2>

                  <a
                    href={`/fixture/${division}`}
                    className="bg-blue-600 px-4 py-2 rounded-xl font-black text-sm"
                  >
                    VER FIXTURE
                  </a>
                </div>

                <div className="space-y-3">
                  {partidosFecha.length === 0 && (
                    <p className="text-zinc-500">
                      Todavía no hay partidos cargados.
                    </p>
                  )}

                  {partidosFecha.slice(0, 6).map((p, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_90px_1fr_130px] items-center min-h-[72px] bg-gradient-to-r from-[#020814] via-blue-950 to-[#020814] border border-blue-500/40 rounded-2xl overflow-hidden"
                    >
                      <div className="p-4 text-right font-black text-xl uppercase">
                        {p.local}
                      </div>

                      <div className="bg-blue-600 text-center h-full flex items-center justify-center font-black text-2xl shadow-[0_0_20px_rgba(0,120,255,.8)]">
                        {p.resultado || "VS"}
                      </div>

                      <div className="p-4 font-black text-xl uppercase">
                        {p.visitante}
                      </div>

                      <div className="h-full border-l border-blue-500/30 flex flex-col items-center justify-center text-center bg-black/30">
                        <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                          {p.dia || "DÍA"}
                        </span>

                        <span className="text-lg font-black text-white">
                          {p.hora || "--:--"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-blue-500/50 bg-gradient-to-br from-blue-950 via-zinc-950 to-black rounded-3xl p-6 shadow-[0_0_30px_rgba(0,120,255,.25)]">
                <h2 className="font-black text-xl mb-6">PARTIDO DESTACADO</h2>

                {destacado ? (
                  <div className="text-center">
                    <p className="text-3xl font-black uppercase">{destacado.local}</p>
                    <div className="my-6 bg-blue-600 rounded-2xl py-4 text-5xl font-black shadow-[0_0_25px_rgba(0,120,255,.7)]">
                      {destacado.resultado || "VS"}
                    </div>
                    <p className="text-3xl font-black uppercase">{destacado.visitante}</p>

                    <p className="text-zinc-400 mt-6">
                      Fecha {destacado.fecha} · {division} · {temporada}
                    </p>

                    <p className="text-zinc-500 mt-2 text-sm">
                      {destacado.dia || "Día sin cargar"} · {destacado.hora || "Hora sin cargar"}
                    </p>
                  </div>
                ) : (
                  <p className="text-zinc-500">No hay partido destacado.</p>
                )}
              </div>
            </div>

            <div className="border border-blue-500/50 bg-zinc-950/90 rounded-3xl p-5">
              <h2 className="text-2xl font-black mb-5">📆 PRÓXIMAS FECHAS</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {["2", "3", "4", "5"].map((f) => (
                  <div key={f} className="bg-[#06142d] border border-blue-500/40 rounded-2xl p-4 min-h-[165px]">
                    <h3 className="font-black mb-3">FECHA {f}</h3>

                    {partidos
                      .filter((p) => String(p.fecha) === f)
                      .slice(0, 3)
                      .map((p, i) => (
                        <div key={i} className="text-sm text-zinc-300 mb-3">
                          <p className="truncate">
                            {p.local} <b className="text-blue-400">VS</b> {p.visitante}
                          </p>

                          <p className="text-[11px] text-zinc-500 mt-1">
                            {p.dia || "DÍA"} · {p.hora || "--:--"}
                          </p>
                        </div>
                      ))}

                    <a
                      href={`/fixture/${division}`}
                      className="block text-center mt-4 bg-blue-600 rounded-xl py-2 text-xs font-black"
                    >
                      VER FECHA
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-blue-500/50 bg-zinc-950/90 rounded-3xl p-5 shadow-[0_0_30px_rgba(0,120,255,.25)]">
              <TablaPosicionesHome tabla={tabla} />
              </div>

            <div className="border border-blue-500/50 bg-zinc-950/90 rounded-3xl p-6">
              <h2 className="text-2xl font-black mb-5">ÚLTIMOS RESULTADOS</h2>

              <div className="space-y-3">
                {ultimos.map((p, i) => (
                  <div key={i} className="bg-[#06142d] border border-blue-500/30 rounded-2xl p-3">
                    <p className="flex justify-between gap-2 text-sm">
                      <span className="truncate">{p.local}</span>
                      <b>{p.resultado}</b>
                      <span className="truncate text-right">{p.visitante}</span>
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                      Fecha {p.fecha} · {temporada}
                    </p>
                    <p className="text-zinc-600 text-xs mt-1">
                      {p.dia || "DÍA"} · {p.hora || "--:--"}
                    </p>
                  </div>
                ))}

                {ultimos.length === 0 && (
                  <p className="text-zinc-500">No hay resultados.</p>
                )}
              </div>
            </div>

            <div className="border border-blue-500/50 bg-zinc-950/90 rounded-3xl p-6">
              <h2 className="text-xl font-black mb-5">INFO LIGA</h2>

              <p className="flex justify-between mb-3">
                <span className="text-zinc-400">Temporada:</span>
                <b>{temporada}</b>
              </p>

              <p className="flex justify-between mb-3">
                <span className="text-zinc-400">División:</span>
                <b className="capitalize">{division}</b>
              </p>

              <p className="flex justify-between">
                <span className="text-zinc-400">Estado:</span>
                <b className="text-green-400">● Activa</b>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}