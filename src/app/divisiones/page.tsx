"use client";

import { useEffect, useState } from "react";
import TablaDivision from "@/components/TablaDivision";
import { supabase } from "@/lib/supabase";

export default function DivisionesPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [ultimosResultados, setUltimosResultados] = useState<any[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);

  const temporadas = ["Temporada 4"];

  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  useEffect(() => {
    cargarUltimosResultados();
  }, []);

  function logoEquipo(nombre?: string) {
    if (!nombre) return null;

    const club = clubesInfo.find(
      (c) =>
        String(c.nombre || "").toLowerCase().trim() ===
        String(nombre || "").toLowerCase().trim(),
    );

    return club?.logo_url || null;
  }

  function EscudoMini({ nombre }: { nombre: string }) {
    const logo = logoEquipo(nombre);

    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/40 bg-gradient-to-br from-sky-500 to-blue-950 text-[10px] font-black shadow-[0_0_12px_rgba(56,189,248,.35)]">
        {logo ? (
          <img
            src={logo}
            alt={nombre}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          nombre?.slice(0, 2).toUpperCase()
        )}
      </div>
    );
  }

  async function cargarUltimosResultados() {
    const { data, error } = await supabase
      .from("partidos")
      .select("*")
      .not("resultado", "is", null)
      .not("partido_id", "is", null)
      .order("id", { ascending: false })
      .limit(3);

    if (error) {
      console.log(error);
      return;
    }

    const resultados = data || [];
    setUltimosResultados(resultados);

    const nombresEquipos = Array.from(
      new Set(
        resultados
          .flatMap((p: any) => [p.local, p.visitante])
          .filter(Boolean),
      ),
    );

    if (nombresEquipos.length > 0) {
      const { data: clubesData, error: clubesError } = await supabase
        .from("clubes_info")
        .select("nombre, logo_url")
        .in("nombre", nombresEquipos);

      if (clubesError) {
        console.log(clubesError);
      }

      setClubesInfo(clubesData || []);
    } else {
      setClubesInfo([]);
    }
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <section className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="relative overflow-hidden rounded-[34px] border border-sky-500/40 bg-[#020714] shadow-[0_0_55px_rgba(0,120,255,.28)]">
          <div className="relative min-h-[250px] bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,140,255,.25),transparent_35%)]" />

            <div className="relative z-10 flex items-center justify-between gap-8 p-7 md:p-10">
              <div>
                <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
                  Competición · Torneos
                </p>

                <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic leading-none">
                  <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                    Torneo
                  </span>
                  <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                    de Liga APA
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                  La competencia principal de APA PSO Argentina. Primera,
                  Segunda, Tercera y Cuarta división compiten por puntos,
                  clasificación y gloria temporada tras temporada.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="/competicion"
                    className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400/20"
                  >
                    ← Volver a torneos
                  </a>

                  <span className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black uppercase text-yellow-300">
                    🏆 Liga oficial
                  </span>

                  <span className="rounded-2xl border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-black uppercase text-green-300">
                    ● Activa
                  </span>
                </div>
              </div>

              <div className="hidden lg:flex w-40 h-40 rounded-[36px] border border-sky-400/40 bg-black/40 overflow-hidden shadow-[0_0_42px_rgba(0,120,255,.45)] items-center justify-center">
                <div className="relative h-full w-full">
                  <div className="absolute inset-0 bg-sky-400/10 blur-2xl" />
                  <img
                    src="/logo-apa.png"
                    alt="APA PSO"
                    className="relative z-10 w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-sky-500/30 bg-gradient-to-r from-[#020714] via-[#061a33] to-[#020714] p-4 md:p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[120px_1fr] gap-3 items-center">
              <p className="text-sky-300 uppercase tracking-[0.25em] text-xs font-black">
                Temporada
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {temporadas.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setTemporada(temp)}
                    className={`relative overflow-hidden rounded-xl border px-4 py-3 font-black uppercase text-sm transition-all ${
                      temporada === temp
                        ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/50 hover:text-white"
                    }`}
                  >
                    {temp.replace("Temporada ", "")}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[120px_1fr] gap-3 items-center">
              <p className="text-sky-300 uppercase tracking-[0.25em] text-xs font-black">
                Categoría
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {divisiones.map((div) => (
                  <button
                    key={div}
                    onClick={() => setDivision(div)}
                    className={`rounded-xl border px-4 py-3 font-black uppercase text-sm transition-all ${
                      division === div
                        ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/50 hover:text-white"
                    }`}
                  >
                    🏆 {div}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            ["🏆", "Torneo", "Liga APA"],
            ["📅", "Temporada", temporada],
            ["🛡️", "Categoría", `${division} División`],
            ["🟢", "Estado", "Activa"],
          ].map(([icon, label, value]) => (
            <div
              key={label}
              className="rounded-[26px] border border-sky-500/20 bg-[#020714]/90 p-5 shadow-[0_0_25px_rgba(0,120,255,.10)]"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                {icon} {label}
              </p>
              <p className="mt-2 text-2xl font-black uppercase text-white">
                {value}
              </p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          <section className="overflow-hidden rounded-[30px] border border-sky-500/40 bg-[#020714] shadow-[0_0_40px_rgba(0,120,255,.2)]">
            <div className="flex items-center justify-between gap-4 border-b border-sky-500/30 bg-gradient-to-r from-[#061a33] to-[#020714] px-5 py-4">
              <div>
                <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black">
                  Torneo de Liga
                </p>

                <h2 className="text-2xl md:text-4xl font-black uppercase mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 leading-tight">
                  <span className="inline-block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent pr-1">
                    {temporada}
                  </span>

                  <span className="inline-block text-sky-400">
                    / {division} División
                  </span>
                </h2>
              </div>

              <div className="hidden md:flex w-16 h-16 rounded-2xl border border-sky-400/30 bg-sky-400/10 items-center justify-center text-3xl">
                🏆
              </div>
            </div>

            <div className="p-4 md:p-5">
              <TablaDivision temporada={temporada} division={division} />
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[26px] border border-sky-500/40 bg-[#020714] p-5 shadow-[0_0_30px_rgba(0,120,255,.18)]">
              <h3 className="text-sky-300 uppercase tracking-[0.25em] text-xs font-black mb-4">
                Torneo actual
              </h3>

              <div className="space-y-3 text-sm">
                <p className="flex justify-between gap-4">
                  <span className="text-zinc-400">Temporada</span>
                  <b>{temporada}</b>
                </p>

                <p className="flex justify-between gap-4">
                  <span className="text-zinc-400">Categoría</span>
                  <b className="text-sky-400">{division} División</b>
                </p>

                <p className="flex justify-between gap-4">
                  <span className="text-zinc-400">Estado</span>
                  <b className="text-green-400">● Activa</b>
                </p>

                <p className="flex justify-between gap-4">
                  <span className="text-zinc-400">Formato</span>
                  <b>Todos contra todos</b>
                </p>
              </div>
            </div>

            <div className="rounded-[26px] border border-yellow-500/35 bg-gradient-to-b from-[#18120a] to-[#050505] p-5 shadow-[0_0_30px_rgba(250,204,21,.12)]">
              <h3 className="text-yellow-300 uppercase tracking-[0.25em] text-xs font-black mb-4">
                Zonas del torneo
              </h3>

              <div className="space-y-3 text-sm font-black uppercase">
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-3 rounded bg-green-500 shadow-[0_0_10px_rgba(74,222,128,.65)]" />
                    <span>Playoffs</span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">TOP 4</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-3 rounded bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,.55)]" />
                    <span>Play-In</span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">TOP 6</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-3 rounded bg-red-600 shadow-[0_0_10px_rgba(239,68,68,.55)]" />
                    <span>Descenso</span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">ÚLTIMOS</span>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-sky-500/40 bg-[#020714] p-5 shadow-[0_0_30px_rgba(0,120,255,.18)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sky-300 uppercase tracking-[0.25em] text-xs font-black">
                  Últimos partidos
                </h3>

                <span className="text-[10px] text-zinc-500 uppercase font-black">
                  Torneo
                </span>
              </div>

              <div className="space-y-3">
                {ultimosResultados.length === 0 ? (
                  <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4 text-center text-xs text-zinc-500">
                    No hay resultados cargados.
                  </div>
                ) : (
                  ultimosResultados.map((partido) => (
                    <a
                      key={partido.id}
                      href={`/estadisticas/${encodeURIComponent(partido.partido_id)}`}
                      className="group block rounded-2xl border border-sky-500/20 bg-black/35 p-3 transition hover:border-sky-400/60 hover:bg-sky-500/10"
                    >
                      <div className="grid grid-cols-[1fr_78px_1fr] items-center gap-3">
                        <div className="min-w-0 flex items-center gap-2">
                          <EscudoMini nombre={partido.local} />

                          <span className="truncate text-[11px] font-black text-white">
                            {partido.local}
                          </span>
                        </div>

                        <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-2 py-1 text-center">
                          <span className="whitespace-nowrap text-lg font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,.55)]">
                            {partido.resultado}
                          </span>
                        </div>

                        <div className="min-w-0 flex items-center justify-end gap-2">
                          <span className="truncate text-right text-[11px] font-black text-zinc-300">
                            {partido.visitante}
                          </span>

                          <EscudoMini nombre={partido.visitante} />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-sky-400">
                          {partido.division || "Sin división"}
                        </p>

                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 group-hover:text-sky-300">
                          Ver stats →
                        </span>
                      </div>
                    </a>
                  ))
                )}
              </div>

              <a
                href="/estadisticas"
                className="mt-4 block w-full rounded-xl border border-sky-500/30 bg-sky-500/10 py-3 text-center text-[11px] font-black uppercase tracking-[0.22em] text-sky-300 transition hover:bg-sky-500/20"
              >
                Ver todos los resultados
              </a>
            </div>

            <div className="relative overflow-hidden rounded-[26px] border border-sky-500/35 bg-[#020714] p-5 min-h-[150px]">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-25" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

              <div className="relative z-10">
                <p className="text-sky-300 uppercase tracking-[0.25em] text-xs font-black">
                  Torneo de Liga
                </p>

                <h3 className="text-2xl font-black mt-2 uppercase">
                  Camino al campeonato
                </h3>

                <p className="text-zinc-400 text-sm mt-2">
                  Cada punto cuenta. Cada fecha importa. Cada división escribe su historia.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}