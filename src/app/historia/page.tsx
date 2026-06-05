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

interface PremioAPA {
  id: number;
  temporada: string;
  division: string | null;
  premio: string;
  playerid: string;
  nombre: string;
  equipo: string | null;
  puntos: number | null;
  posicion: number | null;
  created_at: string | null;
}

export default function HistoriaPage() {
  const [jugadores, setJugadores] = useState<RankingJugador[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);
  const [premiosApa, setPremiosApa] = useState<PremioAPA[]>([]);
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
      mapa[clave].ratingTotal += Number(j.rating_apa || j.overallRating) || 0;
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

    const nombresEquipos = Array.from(
      new Set(lista.map((j: any) => j.equipo).filter(Boolean)),
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

    const { data: premiosData, error: premiosError } = await supabase
      .from("premios_apa")
      .select("*")
      .order("temporada", { ascending: false })
      .order("created_at", { ascending: false });

    if (premiosError) {
      console.log(premiosError);
      setPremiosApa([]);
    } else {
      setPremiosApa((premiosData || []) as PremioAPA[]);
    }

    setJugadores(lista);
    setLoading(false);
  }

  function premioNombre(premio: string) {
    const mapa: Record<string, string> = {
      balon_oro: "Balón de Oro",
      the_best: "The Best",
      raiko_trophy: "Raiko Trophy",
      bota_oro: "Bota de Oro",
      golden_boy: "Golden Boy",
    };

    return mapa[premio] || premio;
  }

  function premioIcono(premio: string) {
    const mapa: Record<string, string> = {
      balon_oro: "🏆",
      the_best: "🏅",
      raiko_trophy: "🧤",
      bota_oro: "⚽",
      golden_boy: "⭐",
    };

    return mapa[premio] || "🏆";
  }

  function premioColor(premio: string) {
    const mapa: Record<string, string> = {
      balon_oro: "text-yellow-300",
      the_best: "text-orange-300",
      raiko_trophy: "text-cyan-300",
      bota_oro: "text-emerald-400",
      golden_boy: "text-purple-300",
    };

    return mapa[premio] || "text-yellow-300";
  }

  function ultimoPremio(tipo: string) {
    return premiosApa.find((p) => p.premio === tipo);
  }

  function vecesGanadas(playerid?: string | null, tipo?: string) {
    if (!playerid || !tipo) return 0;

    return premiosApa.filter(
      (p) => p.premio === tipo && p.playerid === playerid,
    ).length;
  }

  function premiosPorTipo(tipo: string) {
    return premiosApa.filter((p) => p.premio === tipo);
  }

  function logoEquipo(nombre?: string) {
    if (!nombre) return null;

    const club = clubesInfo.find(
      (c) =>
        String(c.nombre || "").toLowerCase().trim() ===
        String(nombre || "").toLowerCase().trim(),
    );

    return club?.logo_url || null;
  }

  function EscudoEquipo({
    nombre,
    size = "md",
  }: {
    nombre?: string;
    size?: "sm" | "md" | "lg";
  }) {
    const logo = logoEquipo(nombre);

    const sizes = {
      sm: "h-10 w-10 rounded-xl text-[10px]",
      md: "h-12 w-12 rounded-2xl text-xs",
      lg: "h-12 w-12 sm:h-16 sm:w-16 rounded-2xl sm:rounded-3xl text-sm sm:text-base",
    };

    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden border border-sky-400/30 bg-gradient-to-br from-sky-500 to-blue-950 font-black shadow-[0_0_16px_rgba(56,189,248,.35)] ${sizes[size]}`}
      >
        {logo ? (
          <img
            src={logo}
            alt={nombre || "Club"}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          nombre?.slice(0, 2).toUpperCase() || "CL"
        )}
      </div>
    );
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
      <section className="relative overflow-hidden rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6 shadow-[0_0_30px_rgba(0,120,255,.10)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.10),transparent_38%)]" />

        <div className="relative z-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-2xl">
              {icono}
            </div>

            <h2 className="text-xl font-black uppercase sm:text-2xl">{titulo}</h2>
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

                      <EscudoEquipo nombre={j.equipo} size="sm" />

                      <div className="min-w-0">
                        <p className="truncate font-black uppercase text-white">
                          {j.nombre}
                        </p>
                        <p className="truncate text-sm text-zinc-500">
                          {j.equipo} · {j.partidos} PJ
                        </p>
                      </div>
                    </div>

                    <p className={`shrink-0 text-2xl font-black sm:text-3xl ${color}`}>
                      {j[campo]}
                      {sufijo}
                    </p>
                  </>,
                  "flex items-center justify-between gap-3 rounded-2xl border border-sky-500/10 bg-black/35 p-3 sm:p-4 transition hover:border-sky-400/45 hover:bg-sky-400/10",
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

            <div className="flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14 rounded-2xl border border-white/10 bg-black/35 text-3xl">
              {icono}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <EscudoEquipo nombre={jugador?.equipo} size="lg" />

            <div className="min-w-0">
              <h3 className="break-words text-2xl font-black uppercase sm:truncate sm:text-3xl">
                {jugador?.nombre || "-"}
              </h3>

              <p className="mt-2 truncate text-sm uppercase tracking-[0.12em] text-zinc-500">
                {jugador?.equipo || "Sin datos"}
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-end justify-between gap-4">
            <p className={`text-4xl font-black sm:text-5xl md:text-6xl ${color}`}>{valor || 0}</p>

            <p className="text-right text-xs uppercase tracking-[0.2em] text-zinc-500">
              {subtitulo}
            </p>
          </div>
        </div>
      </>
    );

    if (!jugador?.playerId) {
      return (
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6 shadow-[0_0_35px_rgba(0,120,255,.10)]">
          {contenido}
        </div>
      );
    }

    return (
      <Link
        href={`/jugadores/${encodeURIComponent(jugador.playerId)}`}
        className="relative block overflow-hidden rounded-[28px] border border-white/10 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6 shadow-[0_0_35px_rgba(0,120,255,.10)] transition hover:border-sky-400/45 hover:scale-[1.01]"
      >
        {contenido}
      </Link>
    );
  }

  function PremioCard({ tipo }: { tipo: string }) {
    const premio = ultimoPremio(tipo);
    const historial = premiosPorTipo(tipo);
    const veces = vecesGanadas(premio?.playerid, tipo);
    const color = premioColor(tipo);

    const contenido = (
      <>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.12),transparent_42%)]" />

        <div className="relative z-10">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div>
              <p className={`text-xs font-black uppercase tracking-[0.28em] ${color}`}>
                Premio APA
              </p>
              <h3 className="mt-2 text-2xl font-black uppercase sm:text-3xl">
                {premioNombre(tipo)}
              </h3>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-3xl shadow-[0_0_20px_rgba(250,204,21,.14)]">
              {premioIcono(tipo)}
            </div>
          </div>

          {premio ? (
            <>
              <div className="flex items-center gap-4">
                <EscudoEquipo nombre={premio.equipo || undefined} size="lg" />

                <div className="min-w-0">
                  <p className="truncate text-2xl font-black uppercase text-white sm:text-3xl">
                    {premio.nombre}
                  </p>
                  <p className="mt-1 truncate text-sm font-black uppercase tracking-[0.14em] text-zinc-500">
                    {premio.equipo || "Sin club"} · {premio.temporada}
                    {premio.division ? ` · ${premio.division}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-3 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Puntos
                  </p>
                  <p className={`mt-2 text-xl font-black ${color}`}>
                    {Number(premio.puntos || 0).toFixed(1)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-3 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Pos.
                  </p>
                  <p className={`mt-2 text-xl font-black ${color}`}>
                    #{premio.posicion || 1}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-3 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Veces
                  </p>
                  <p className={`mt-2 text-xl font-black ${color}`}>
                    {veces}
                  </p>
                </div>
              </div>

              {historial.length > 1 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {historial.slice(0, 5).map((h) => (
                    <span
                      key={`${h.id}-${h.temporada}`}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400"
                    >
                      {h.temporada}: {h.nombre}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
              <p className="text-lg font-black uppercase text-zinc-400">
                Sin ganador cargado
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Cuando se asigne desde el panel de premios, aparecerá acá automáticamente.
              </p>
            </div>
          )}
        </div>
      </>
    );

    if (!premio?.playerid) {
      return (
        <article className="relative overflow-hidden rounded-[28px] border border-yellow-500/20 bg-[#020714] p-5 shadow-[0_0_35px_rgba(250,204,21,.10)] sm:rounded-[34px] sm:p-6">
          {contenido}
        </article>
      );
    }

    return (
      <Link
        href={`/jugadores/${encodeURIComponent(premio.playerid)}`}
        className="relative block overflow-hidden rounded-[28px] border border-yellow-500/20 bg-[#020714] p-5 shadow-[0_0_35px_rgba(250,204,21,.10)] transition hover:border-yellow-400/45 hover:scale-[1.01] sm:rounded-[34px] sm:p-6"
      >
        {contenido}
      </Link>
    );
  }


  function rankingTrofeos(tipo?: string) {
    const mapa: Record<string, any> = {};

    premiosApa
      .filter((p) => !tipo || p.premio === tipo)
      .forEach((p) => {
        const key = p.playerid;

        if (!mapa[key]) {
          mapa[key] = {
            playerid: p.playerid,
            nombre: p.nombre,
            equipo: p.equipo || "Sin club",
            cantidad: 0,
          };
        }

        mapa[key].cantidad += 1;
      });

    return Object.values(mapa)
      .sort((a: any, b: any) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }

  function RankingTrofeos({
    titulo,
    tipo,
    icono,
    color,
  }: {
    titulo: string;
    tipo?: string;
    icono: string;
    color: string;
  }) {
    const lista = rankingTrofeos(tipo);

    return (
      <section className="relative overflow-hidden rounded-[28px] border border-yellow-500/20 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6 shadow-[0_0_30px_rgba(250,204,21,.10)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 text-2xl">
            {icono}
          </div>
          <h2 className="text-xl font-black uppercase sm:text-2xl">{titulo}</h2>
        </div>

        <div className="space-y-3">
          {lista.map((j: any, index: number) => (
            <Link
              key={`${j.playerid}-${index}`}
              href={`/jugadores/${encodeURIComponent(j.playerid)}`}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 p-4 hover:border-yellow-400/30"
            >
              <div>
                <p className="font-black uppercase text-white">{j.nombre}</p>
                <p className="text-sm text-zinc-500">{j.equipo}</p>
              </div>

              <p className={`text-3xl font-black ${color}`}>
                {j.cantidad}
              </p>
            </Link>
          ))}
        </div>
      </section>
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
    <main className="min-h-screen overflow-x-hidden text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020714] p-5 sm:rounded-[38px] md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-400 sm:text-xs sm:tracking-[0.45em]">
              APA PSO ARGENTINA
            </p>

            <h1 className="mt-4 text-[clamp(2.5rem,9vw,5rem)] font-black uppercase italic leading-none">
              <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                Salón de
              </span>
              <span className="block text-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,.45)]">
                la Fama
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Historial oficial de APA PSO Argentina UE5. Estadísticas, premios y récords acumulados desde la Temporada 4.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
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

        <section>
          <p className="text-yellow-300 uppercase tracking-[0.35em] text-xs font-black">
            Premios oficiales
          </p>

          <h2 className="mt-3 text-[clamp(1.8rem,7vw,3rem)] font-black uppercase">
            Trofeos APA
          </h2>

          <p className="mt-3 max-w-3xl text-zinc-500">
            Balón de Oro, The Best, Raiko Trophy, Bota de Oro y Golden Boy. Ganadores oficiales cargados desde el panel administrativo.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-5 xl:gap-5">
          <PremioCard tipo="balon_oro" />
          <PremioCard tipo="the_best" />
          <PremioCard tipo="raiko_trophy" />
          <PremioCard tipo="bota_oro" />
          <PremioCard tipo="golden_boy" />
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:gap-5">
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
            titulo="Muro APA"
            subtitulo="atajadas"
            jugador={mejorArquero}
            valor={mejorArquero?.atajadas}
            color="text-cyan-300"
            icono="🧤"
          />
        </section>

        <section>
          <p className="text-yellow-300 uppercase tracking-[0.35em] text-xs font-black">
            Salón de trofeos
          </p>

          <h2 className="mt-3 text-[clamp(1.8rem,7vw,3rem)] font-black uppercase">
            Ranking histórico de premios
          </h2>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-8">
          <RankingTrofeos
            titulo="Más Balones de Oro"
            tipo="balon_oro"
            icono="🏆"
            color="text-yellow-300"
          />

          <RankingTrofeos
            titulo="Más The Best"
            tipo="the_best"
            icono="🏅"
            color="text-orange-300"
          />

          <RankingTrofeos
            titulo="Más Raiko Trophy"
            tipo="raiko_trophy"
            icono="🧤"
            color="text-cyan-300"
          />

          <RankingTrofeos
            titulo="Más Botas de Oro"
            tipo="bota_oro"
            icono="⚽"
            color="text-emerald-400"
          />

          <RankingTrofeos
            titulo="Más Golden Boy"
            tipo="golden_boy"
            icono="⭐"
            color="text-purple-300"
          />

          <RankingTrofeos
            titulo="Más Trofeos APA"
            icono="👑"
            color="text-yellow-300"
          />
        </section>


        <section>
          <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
            Rankings históricos
          </p>

          <h2 className="mt-3 text-[clamp(1.8rem,7vw,3rem)] font-black uppercase">
            Récords de la competición
          </h2>

          <p className="mt-3 text-zinc-500">
            Cada ranking agrupa jugadores por Player ID.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-8">
          <RankingBox
            titulo="Máximos goleadores APA"
            campo="goles"
            color="text-emerald-400"
            icono="⚽"
          />

          <RankingBox
            titulo="Máximos asistidores APA"
            campo="asistencias"
            color="text-sky-400"
            icono="🎯"
          />

          <RankingBox
            titulo="Más MVPs APA"
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
