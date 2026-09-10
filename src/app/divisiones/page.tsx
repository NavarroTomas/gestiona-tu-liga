"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TablaDivision from "@/components/TablaDivision";
import { supabase } from "@/lib/supabase";

export default function DivisionesPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [ultimosResultados, setUltimosResultados] = useState<any[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);

  const temporadas = ["Temporada 4"];
  const divisiones = ["Primera", "Segunda"];

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
      .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora")
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
    <main className="min-h-screen bg-[#f4f9fd] text-[#102f55]">
      <section className="relative min-h-[190px] overflow-hidden border-b border-[#c9e3f1]">
        <img
          src="/themes/worldcup/backgrounds/FotoCancha.png"
          alt="Cancha de Pro Soccer Online"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,249,253,.97)_0%,rgba(236,247,253,.90)_32%,rgba(205,235,250,.64)_58%,rgba(86,175,226,.34)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,.04))]" />

        <div className="relative z-10 mx-auto flex min-h-[190px] w-full max-w-[1480px] items-center justify-between gap-8 px-5 py-8 sm:px-8 lg:px-12">
          <div className="min-w-0">
            <h1 className="m-0 text-[clamp(34px,4vw,64px)] font-black uppercase leading-[.92] tracking-[-.055em] text-[#102f55]">
              Torneo de Liga APA
            </h1>
            <p className="mt-4 text-[clamp(15px,1.45vw,22px)] font-semibold text-[#214b77]">
              {division} División · {temporada}
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-5 md:flex">
            <span className="h-[2px] w-16 bg-white/90" />
            <p className="m-0 max-w-[230px] text-right text-[12px] font-bold uppercase leading-[1.65] tracking-[.18em] text-white drop-shadow-[0_2px_8px_rgba(16,47,85,.28)]">
              El fútbol virtual
              <br />
              también nos une
            </p>
          </div>
        </div>
      </section>

      <div className="border-b border-[#d7e6f0] bg-white/95">
        <nav className="mx-auto flex w-full max-w-[1480px] items-end gap-7 overflow-x-auto px-5 sm:px-8 lg:px-12" aria-label="Secciones de Liga">
          <Link href="/divisiones" className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-4 text-sm font-bold text-[#5c7693] transition hover:text-[#102f55]">
            Resumen
          </Link>
          <Link href="/divisiones" className="whitespace-nowrap border-b-[3px] border-[#56afe2] px-1 py-4 text-sm font-black text-[#102f55]">
            Tabla
          </Link>
          <Link href="/fixture" className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-4 text-sm font-bold text-[#5c7693] transition hover:text-[#102f55]">
            Partidos
          </Link>
          <Link href="/estadisticas" className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-4 text-sm font-bold text-[#5c7693] transition hover:text-[#102f55]">
            Estadísticas
          </Link>
          <Link href="/clubes" className="whitespace-nowrap border-b-[3px] border-transparent px-1 py-4 text-sm font-bold text-[#5c7693] transition hover:text-[#102f55]">
            Equipos
          </Link>
        </nav>
      </div>

      <section className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#d7e6f0] pb-5">
          <label className="relative">
            <span className="sr-only">Temporada</span>
            <select
              value={temporada}
              onChange={(e) => setTemporada(e.target.value)}
              className="h-11 min-w-[170px] cursor-pointer rounded-lg border border-[#c9deec] bg-[#edf6fc] px-4 pr-10 text-sm font-bold text-[#173e68] outline-none transition focus:border-[#56afe2]"
            >
              {temporadas.map((temp) => (
                <option key={temp} value={temp}>{temp}</option>
              ))}
            </select>
          </label>

          <label className="relative">
            <span className="sr-only">División</span>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="h-11 min-w-[190px] cursor-pointer rounded-lg border border-[#c9deec] bg-[#edf6fc] px-4 pr-10 text-sm font-bold text-[#173e68] outline-none transition focus:border-[#56afe2]"
            >
              {divisiones.map((div) => (
                <option key={div} value={div}>{div} División</option>
              ))}
            </select>
          </label>
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
              className="rounded-[26px] border border-sky-500/20 bg-[#020714]/90 p-5 text-white shadow-[0_0_25px_rgba(0,120,255,.10)]"
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
          <section className="overflow-hidden rounded-[30px] border border-sky-500/40 bg-[#020714] text-white shadow-[0_0_40px_rgba(0,120,255,.2)]">
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

          <aside className="space-y-4 text-white">
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

              {division === "Primera" ? (
                <div className="space-y-3 text-sm font-black uppercase">
                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-9 rounded bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,.65)]" />
                      <span>Campeón</span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">1°</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-9 rounded bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,.6)]" />
                      <span>Promoción</span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">7°</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-9 rounded bg-red-600 shadow-[0_0_10px_rgba(239,68,68,.55)]" />
                      <span>Descenso</span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">8°</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm font-black uppercase">
                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-9 rounded bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.65)]" />
                      <span>Ascenso directo</span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">1°</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-9 rounded bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,.65)]" />
                      <span>Playoffs</span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">2°-5°</span>
                  </div>
                </div>
              )}
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
                    <Link
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
                    </Link>
                  ))
                )}
              </div>

              <Link
                href="/estadisticas"
                className="mt-4 block w-full rounded-xl border border-sky-500/30 bg-sky-500/10 py-3 text-center text-[11px] font-black uppercase tracking-[0.22em] text-sky-300 transition hover:bg-sky-500/20"
              >
                Ver todos los resultados
              </Link>
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
