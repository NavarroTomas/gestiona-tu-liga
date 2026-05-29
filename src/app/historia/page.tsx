"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface RankingJugador {
  nombre: string;
  playerId: string;
  equipo: string;
  partidos: number;
  goles: number;
  asistencias: number;
  mvps: number;
  score: number;
  ratingPromedio: number;
  atajadas: number;
  tackles: number;
  intercepciones: number;
}

export default function HistoriaPage() {
  const [jugadores, setJugadores] = useState<RankingJugador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHistoria();
  }, []);

  function valorGKSave(r: any) {
    return Number(r.gKSAVES || r.gKSaves || r.gksaves || 0);
  }

  async function cargarHistoria() {
    const { data, error } = await supabase
      .from("estadisticas_jugadores")
      .select("*");

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    const mapa: { [key: string]: any } = {};

    data?.forEach((j: any) => {
      const nombre = (j.nombre || "").trim();
      const playerId = (j.playerId || "").trim();

      if (!nombre) return;

      const clave = playerId || nombre;

      if (!mapa[clave]) {
        mapa[clave] = {
          nombre,
          playerId,
          equipo: j.equipo || "Sin Club",
          partidos: 0,
          goles: 0,
          asistencias: 0,
          mvps: 0,
          score: 0,
          ratingTotal: 0,
          ratingPromedio: 0,
          atajadas: 0,
          tackles: 0,
          intercepciones: 0,
        };
      }

      mapa[clave].partidos += 1;
      mapa[clave].goles += Number(j.goals) || 0;
      mapa[clave].asistencias += Number(j.assists) || 0;
      mapa[clave].mvps += Number(j.mvp) || 0;
      mapa[clave].score += Number(j.score) || 0;
      mapa[clave].ratingTotal += Number(j.overallRating) || 0;
      mapa[clave].atajadas += valorGKSave(j);
      mapa[clave].tackles += Number(j.tackles) || 0;
      mapa[clave].intercepciones += Number(j.interceptions) || 0;

      if (j.equipo) mapa[clave].equipo = j.equipo;
      if (j.nombre) mapa[clave].nombre = j.nombre;
      if (j.playerId) mapa[clave].playerId = j.playerId;
    });

    const lista = Object.values(mapa).map((j: any) => ({
      ...j,
      ratingPromedio:
        j.partidos > 0
          ? Math.round((j.ratingTotal / j.partidos) * 10) / 10
          : 0,
    }));

    setJugadores(lista);
    setLoading(false);
  }

  function top(campo: keyof RankingJugador) {
    return [...jugadores]
      .filter((j) => Number(j[campo]) > 0)
      .sort((a, b) => Number(b[campo]) - Number(a[campo]))
      .slice(0, 10);
  }

  function linkJugador(
    j: RankingJugador,
    children: React.ReactNode,
    className: string,
    key: string,
  ) {
    if (!j.playerId) {
      return (
        <div key={key} className={className}>
          {children}
        </div>
      );
    }

    return (
      <Link
        key={key}
        href={`/jugadores/${encodeURIComponent(j.playerId)}`}
        className={className}
      >
        {children}
      </Link>
    );
  }

  function RankingBox({
    titulo,
    campo,
    color,
    sufijo = "",
    icono = "🏆",
  }: {
    titulo: string;
    campo: keyof RankingJugador;
    color: string;
    sufijo?: string;
    icono?: string;
  }) {
    const lista = top(campo);

    return (
      <section className="relative overflow-hidden rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 shadow-[0_0_30px_rgba(0,120,255,.10)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.10),transparent_38%)]" />

        <div className="relative z-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-2xl">
              {icono}
            </div>

            <h2 className="text-2xl font-black uppercase">{titulo}</h2>
          </div>

          <div className="space-y-3">
            {lista.length === 0 ? (
              <p className="rounded-2xl border border-white/5 bg-black/30 p-5 text-zinc-500">
                Todavía no hay datos.
              </p>
            ) : (
              lista.map((j, index) =>
                linkJugador(
                  j,
                  <>
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black ${
                          index === 0
                            ? "bg-yellow-400 text-black shadow-[0_0_18px_rgba(250,204,21,.35)]"
                            : index === 1
                              ? "bg-zinc-200 text-black"
                              : index === 2
                                ? "bg-orange-500 text-black"
                                : "bg-white/[0.06] text-zinc-400"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-black uppercase text-white">
                          {j.nombre}
                        </p>
                        <p className="truncate text-sm text-zinc-500">
                          {j.equipo} · {j.partidos} PJ
                        </p>
                      </div>
                    </div>

                    <p className={`shrink-0 text-3xl font-black ${color}`}>
                      {j[campo]}
                      {sufijo}
                    </p>
                  </>,
                  "flex items-center justify-between rounded-2xl border border-sky-500/10 bg-black/35 p-4 transition hover:border-sky-400/45 hover:bg-sky-400/10",
                  `${String(campo)}-${j.playerId || j.nombre}-${index}`,
                ),
              )
            )}
          </div>
        </div>
      </section>
    );
  }

  const totalPartidos = jugadores.reduce((acc, j) => acc + j.partidos, 0);
  const totalGoles = jugadores.reduce((acc, j) => acc + j.goles, 0);
  const totalMvps = jugadores.reduce((acc, j) => acc + j.mvps, 0);

  const maxGoleador = top("goles")[0];
  const maxAsistidor = top("asistencias")[0];
  const maxMvp = top("mvps")[0];
  const mejorRating = top("ratingPromedio")[0];
  const mejorArquero = top("atajadas")[0];

  function LeyendaCard({
    titulo,
    subtitulo,
    jugador,
    valor,
    color,
    icono,
  }: {
    titulo: string;
    subtitulo: string;
    jugador?: RankingJugador;
    valor: any;
    color: string;
    icono: string;
  }) {
    const contenido = (
      <>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.10),transparent_40%)]" />

        <div className="relative z-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <p
              className={`text-xs font-black uppercase tracking-[0.28em] ${color}`}
            >
              {titulo}
            </p>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-3xl">
              {icono}
            </div>
          </div>

          <h3 className="truncate text-3xl font-black uppercase">
            {jugador?.nombre || "-"}
          </h3>

          <p className="mt-2 truncate text-sm uppercase tracking-[0.12em] text-zinc-500">
            {jugador?.equipo || "Sin datos"}
          </p>

          <div className="mt-7 flex items-end justify-between gap-4">
            <p className={`text-6xl font-black ${color}`}>{valor || 0}</p>

            <p className="text-right text-xs uppercase tracking-[0.2em] text-zinc-500">
              {subtitulo}
            </p>
          </div>
        </div>
      </>
    );

    if (!jugador?.playerId) {
      return (
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.10)]">
          {contenido}
        </div>
      );
    }

    return (
      <Link
        href={`/jugadores/${encodeURIComponent(jugador.playerId)}`}
        className="relative block overflow-hidden rounded-[34px] border border-white/10 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.10)] transition hover:border-sky-400/45 hover:scale-[1.01]"
      >
        {contenido}
      </Link>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020714] text-white flex items-center justify-center">
        <p className="animate-pulse text-sky-400 font-black uppercase tracking-[0.3em]">
          Cargando historia...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10">
            <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
              APA PSO ARGENTINA
            </p>

            <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic leading-none">
              <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                Salón de
              </span>
              <span className="block text-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,.45)]">
                la Fama
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Las mayores leyendas de APA PSO Argentina UE5. Rankings históricos
              acumulados desde todos los TXT cargados.
            </p>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Jugadores
                </p>
                <p className="mt-2 text-3xl font-black text-sky-300">
                  {jugadores.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Registros
                </p>
                <p className="mt-2 text-3xl font-black text-white">
                  {totalPartidos}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Goles
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-400">
                  {totalGoles}
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  MVPs
                </p>
                <p className="mt-2 text-3xl font-black text-yellow-300">
                  {totalMvps}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
          <LeyendaCard
            titulo="Leyenda goleadora"
            subtitulo="goles"
            jugador={maxGoleador}
            valor={maxGoleador?.goles}
            color="text-emerald-400"
            icono="⚽"
          />

          <LeyendaCard
            titulo="Mago asistidor"
            subtitulo="asistencias"
            jugador={maxAsistidor}
            valor={maxAsistidor?.asistencias}
            color="text-sky-300"
            icono="🎯"
          />

          <LeyendaCard
            titulo="Rey MVP"
            subtitulo="MVP"
            jugador={maxMvp}
            valor={maxMvp?.mvps}
            color="text-yellow-300"
            icono="👑"
          />

          <LeyendaCard
            titulo="Mejor rating"
            subtitulo="promedio"
            jugador={mejorRating}
            valor={mejorRating?.ratingPromedio}
            color="text-purple-300"
            icono="⭐"
          />

          <LeyendaCard
            titulo="Muro histórico"
            subtitulo="atajadas"
            jugador={mejorArquero}
            valor={mejorArquero?.atajadas}
            color="text-cyan-300"
            icono="🧤"
          />
        </section>

        <section>
          <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
            Rankings históricos
          </p>

          <h2 className="mt-3 text-3xl md:text-5xl font-black uppercase">
            Récords de la competición
          </h2>

          <p className="mt-3 text-zinc-500">
            Cada ranking agrupa jugadores por Player ID.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <RankingBox
            titulo="Máximos goleadores históricos"
            campo="goles"
            color="text-emerald-400"
            icono="⚽"
          />

          <RankingBox
            titulo="Máximos asistidores históricos"
            campo="asistencias"
            color="text-sky-400"
            icono="🎯"
          />

          <RankingBox
            titulo="Más MVPs históricos"
            campo="mvps"
            color="text-yellow-300"
            icono="👑"
          />

          <RankingBox
            titulo="Mayor score total"
            campo="score"
            color="text-yellow-300"
            icono="📊"
          />

          <RankingBox
            titulo="Mejor rating promedio"
            campo="ratingPromedio"
            color="text-purple-300"
            icono="⭐"
          />

          <RankingBox
            titulo="Más atajadas"
            campo="atajadas"
            color="text-cyan-300"
            icono="🧤"
          />

          <RankingBox
            titulo="Más tackles"
            campo="tackles"
            color="text-rose-300"
            icono="🛡️"
          />

          <RankingBox
            titulo="Más intercepciones"
            campo="intercepciones"
            color="text-orange-300"
            icono="🔥"
          />
        </section>
      </div>
    </main>
  );
}
