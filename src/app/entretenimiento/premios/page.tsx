"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type JugadorPremio = {
  nombre: string;
  playerId: string;
  equipo: string;
  posicion: string;
  goals: number;
  assists: number;
  mvp: number;
  overallRating: number;
  score: number;
  tackles: number;
  interceptions: number;
  gKSaves: number;
  gKCatches: number;
  passes: number;
};

const temporadas = ["Temporada 4"];

const divisiones = ["Primera", "Segunda"];
const fechas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

function valorGKSave(r: any) {
  return Number(r.gKSaves || r.gKSAVES || r.GKSaves || r.gksaves || 0);
}

function normalizarJugador(r: any): JugadorPremio {
  return {
    nombre: r.nombre || "Sin nombre",
    playerId: r.playerId || "",
    equipo: r.equipo || "Sin Club",
    posicion: r.posicion || "",
    goals: Number(r.goals || 0),
    assists: Number(r.assists || 0),
    mvp: Number(r.mvp || 0),
    overallRating: Number(r.overallRating || 0),
    score: Number(r.score || 0),
    tackles: Number(r.tackles || 0),
    interceptions: Number(r.interceptions || 0),
    gKSaves: valorGKSave(r),
    gKCatches: Number(r.gKCatches || 0),
    passes: Number(r.passes || 0),
  };
}

function esArquero(j: JugadorPremio) {
  const pos = j.posicion.toUpperCase();
  return j.gKSaves > 0 || j.gKCatches > 0 || pos.includes("GK") || pos.includes("POR");
}

function esDefensor(j: JugadorPremio) {
  const pos = j.posicion.toUpperCase();
  return (
    pos.includes("CB") ||
    pos.includes("LB") ||
    pos.includes("RB") ||
    pos.includes("DEF") ||
    pos.includes("DFC") ||
    pos.includes("LI") ||
    pos.includes("LD")
  );
}

export default function PremiosPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [fecha, setFecha] = useState("1");
  const [jugadores, setJugadores] = useState<JugadorPremio[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [temporada, division, fecha]);

  async function cargarDatos() {
    setCargando(true);

    const [statsResult, equiposResult] = await Promise.all([
      supabase
        .from("estadisticas_jugadores")
        .select(
          "nombre, playerId, equipo, posicion, goals, assists, mvp, overallRating, score, tackles, interceptions, gKSaves, gKCatches, passes",
        )
        .eq("temporada", temporada)
        .eq("division", division)
        .eq("fecha", fecha),
      supabase
        .from("equipos")
        .select("nombre, logo_url")
        .eq("temporada", temporada)
        .eq("division", division),
    ]);

    if (statsResult.error) {
      console.log(statsResult.error);
      setJugadores([]);
      setLogos({});
      setCargando(false);
      return;
    }

    if (equiposResult.error) {
      console.log(equiposResult.error);
    }

    setJugadores((statsResult.data || []).map(normalizarJugador));

    const mapLogos: Record<string, string> = {};
    (equiposResult.data || []).forEach((e: any) => {
      if (e.nombre && e.logo_url) mapLogos[e.nombre] = e.logo_url;
    });

    setLogos(mapLogos);
    setCargando(false);
  }

  const premios = useMemo(() => {
    const ordenar = (fn: (j: JugadorPremio) => number) =>
      [...jugadores].sort((a, b) => fn(b) - fn(a))[0];

    const mvpFecha = ordenar((j) => j.mvp * 1000 + j.overallRating + j.score / 100);
    const goleador = ordenar((j) => j.goals * 100 + j.overallRating);
    const asistidor = ordenar((j) => j.assists * 100 + j.passes / 50 + j.overallRating);
    const arquero = [...jugadores]
      .filter(esArquero)
      .sort((a, b) => b.gKSaves + b.gKCatches * 2 - (a.gKSaves + a.gKCatches * 2))[0];
    const defensor = [...jugadores]
      .filter((j) => esDefensor(j) || j.tackles > 0 || j.interceptions > 0)
      .sort((a, b) => b.tackles + b.interceptions * 2 + b.overallRating - (a.tackles + a.interceptions * 2 + a.overallRating))[0];
    const estrella = ordenar((j) => j.overallRating * 100 + j.score / 10);

    return {
      mvpFecha,
      goleador,
      asistidor,
      arquero,
      defensor,
      estrella,
    };
  }, [jugadores]);

  const topGeneral = useMemo(() => {
    return [...jugadores]
      .sort((a, b) => b.overallRating - a.overallRating || b.score - a.score)
      .slice(0, 10);
  }, [jugadores]);

  function LogoEquipo({ equipo }: { equipo?: string }) {
    const logo = equipo ? logos[equipo] : "";

    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sky-400/30 bg-black shadow-[0_0_18px_rgba(56,189,248,.18)]">
        {logo ? (
          <img
            src={logo}
            alt={equipo}
            loading="lazy"
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <span className="text-xs font-black text-white">
            {(equipo || "?").slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
    );
  }

  function PremioCard({
    titulo,
    icono,
    jugador,
    metrica,
    color,
  }: {
    titulo: string;
    icono: string;
    jugador?: JugadorPremio;
    metrica: string;
    color: string;
  }) {
    const contenido = (
      <>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.10),transparent_40%)]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-xs font-black uppercase tracking-[0.28em] ${color}`}>
                {titulo}
              </p>

              <h3 className="mt-5 truncate text-3xl font-black uppercase">
                {jugador?.nombre || "-"}
              </h3>

              <p className="mt-2 truncate text-sm text-zinc-500">
                {jugador?.equipo || "Sin datos"} · {jugador?.posicion || "Sin posición"}
              </p>
            </div>

            <div className="text-5xl">{icono}</div>
          </div>

          <div className="mt-7 flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <LogoEquipo equipo={jugador?.equipo} />

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-black">
                  Métrica
                </p>
                <p className={`text-2xl font-black ${color}`}>{metrica}</p>
              </div>
            </div>

            <p className="text-right text-xs uppercase tracking-[0.2em] text-zinc-500">
              Fecha {fecha}
            </p>
          </div>
        </div>
      </>
    );

    if (jugador?.playerId) {
      return (
        <Link
          href={`/jugadores/${encodeURIComponent(jugador.playerId)}`}
          className="relative block overflow-hidden rounded-[34px] border border-white/10 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.10)] transition hover:scale-[1.01] hover:border-sky-400/45"
        >
          {contenido}
        </Link>
      );
    }

    return (
      <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.10)]">
        {contenido}
      </div>
    );
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-yellow-500/30 bg-[#020714] p-7 md:p-10 shadow-[0_0_55px_rgba(250,204,21,.14)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="text-yellow-300 text-xs uppercase tracking-[0.45em] font-black">
                APA PSO ARGENTINA
              </p>

              <h1 className="mt-4 max-w-[850px] text-[clamp(2rem,5.3vw,4.1rem)] font-black uppercase italic leading-[0.92]">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Premios
                </span>

                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  de la Fecha
                </span>

                <span className="mt-2 block text-[clamp(1.45rem,4vw,2.8rem)] text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,.55)]">
                  Fecha {fecha}
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
                Reconocimientos automáticos otorgados a los mejores jugadores de cada fecha según sus estadísticas oficiales.
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Jugadores
                  </p>
                  <p className="mt-1 text-2xl font-black text-sky-300">
                    {jugadores.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Temporada
                  </p>
                  <p className="mt-1 font-black text-yellow-300">{temporada}</p>
                </div>

                <div className="rounded-2xl border border-green-500/20 bg-black/35 px-5 py-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    División
                  </p>
                  <p className="mt-1 font-black text-green-400">{division}</p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-black/35 px-5 py-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Fecha
                  </p>
                  <p className="mt-1 font-black text-purple-300">Fecha {fecha}</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex h-40 w-40 items-center justify-center rounded-full border border-yellow-400/40 bg-black/40 shadow-[0_0_35px_rgba(250,204,21,.25)]">
              <span className="text-6xl">🏆</span>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]">
          <div className="grid gap-7">
            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Temporada
              </p>

              <div className="grid grid-cols-1 gap-3">
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
                    key={div}
                    onClick={() => setDivision(div)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      division === div
                        ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Fecha
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {fechas.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFecha(f)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      fecha === f
                        ? "border-green-300 bg-gradient-to-r from-green-400 to-emerald-600 text-black shadow-[0_0_20px_rgba(74,222,128,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    Fecha {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {cargando ? (
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-10 text-center text-sky-300 font-black uppercase tracking-[0.25em]">
            Cargando premios...
          </section>
        ) : jugadores.length === 0 ? (
          <section className="relative overflow-hidden rounded-[34px] border border-yellow-500/20 bg-[#020714] p-10 text-center shadow-[0_0_35px_rgba(250,204,21,.10)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,.12),transparent_45%)]" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 text-5xl">
                🏆
              </div>

              <h2 className="mt-6 text-4xl font-black uppercase">
                No hay estadísticas en esta fecha
              </h2>

              <p className="mt-4 text-zinc-400">
                Cuando cargues estadísticas de jugadores para esta fecha, los premios aparecerán automáticamente.
              </p>
            </div>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <PremioCard
                titulo="MVP de la Fecha"
                icono="⭐"
                jugador={premios.mvpFecha}
                metrica={`${premios.mvpFecha?.overallRating || 0} rating`}
                color="text-yellow-300"
              />

              <PremioCard
                titulo="Goleador"
                icono="⚽"
                jugador={premios.goleador}
                metrica={`${premios.goleador?.goals || 0} goles`}
                color="text-green-400"
              />

              <PremioCard
                titulo="Asistidor"
                icono="🎯"
                jugador={premios.asistidor}
                metrica={`${premios.asistidor?.assists || 0} asist. `}
                color="text-sky-300"
              />

              <PremioCard
                titulo="Arquero"
                icono="🧤"
                jugador={premios.arquero}
                metrica={`${premios.arquero?.gKSaves || 0} atajadas`}
                color="text-cyan-300"
              />

              <PremioCard
                titulo="Muro Defensivo"
                icono="🛡️"
                jugador={premios.defensor}
                metrica={`${(premios.defensor?.tackles || 0) + (premios.defensor?.interceptions || 0)} acciones`}
                color="text-red-300"
              />

              <PremioCard
                titulo="Estrella"
                icono="🔥"
                jugador={premios.estrella}
                metrica={`${premios.estrella?.score || 0} score`}
                color="text-orange-300"
              />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
              <div className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
                <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black">
                  Top rendimiento
                </p>

                <h2 className="mt-3 text-3xl font-black uppercase">
                  Ranking de la Fecha
                </h2>

                <div className="mt-6 space-y-3">
                  {topGeneral.map((j, index) => (
                    <Link
                      key={`${j.playerId || j.nombre}-${index}`}
                      href={j.playerId ? `/jugadores/${encodeURIComponent(j.playerId)}` : "#"}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-sky-400/45 hover:bg-sky-400/10"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black ${
                            index === 0
                              ? "bg-yellow-400 text-black"
                              : index === 1
                                ? "bg-zinc-200 text-black"
                                : index === 2
                                  ? "bg-orange-500 text-black"
                                  : "bg-white/[0.06] text-zinc-400"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <LogoEquipo equipo={j.equipo} />

                        <div className="min-w-0">
                          <p className="truncate font-black uppercase text-white">
                            {j.nombre}
                          </p>
                          <p className="truncate text-sm text-zinc-500">
                            {j.equipo} · {j.posicion || "Sin posición"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-3xl font-black text-yellow-300">
                          {j.overallRating}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                          rating
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <aside className="space-y-6">
                <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6">
                  <p className="text-yellow-300 uppercase tracking-[0.3em] text-xs font-black">
                    Resumen
                  </p>

                  <h2 className="mt-3 text-3xl font-black uppercase">
                    Fecha {fecha}
                  </h2>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                      <span className="text-zinc-400">Jugadores evaluados</span>
                      <b className="text-sky-300">{jugadores.length}</b>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                      <span className="text-zinc-400">Goles totales</span>
                      <b className="text-green-400">
                        {jugadores.reduce((acc, j) => acc + j.goals, 0)}
                      </b>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                      <span className="text-zinc-400">Asistencias</span>
                      <b className="text-sky-300">
                        {jugadores.reduce((acc, j) => acc + j.assists, 0)}
                      </b>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                      <span className="text-zinc-400">Atajadas</span>
                      <b className="text-cyan-300">
                        {jugadores.reduce((acc, j) => acc + j.gKSaves, 0)}
                      </b>
                    </div>
                  </div>
                </section>

                <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
                  <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black">
                    Criterio
                  </p>

                  <h2 className="mt-3 text-3xl font-black uppercase">
                    Cómo se elige
                  </h2>

                  <div className="mt-5 space-y-3 text-sm text-zinc-400">
                    <p>⭐ MVP: MVP marcado + rating + score.</p>
                    <p>⚽ Goleador: más goles y rating.</p>
                    <p>🎯 Asistidor: asistencias, pases y rating.</p>
                    <p>🧤 Arquero: atajadas y atrapadas.</p>
                    <p>🛡️ Defensa: tackles, intercepciones y rating.</p>
                  </div>
                </section>
              </aside>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
