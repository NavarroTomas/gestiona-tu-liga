"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Jugador {
  nombre: string;
  playerId: string;
  equipo: string;
  goles: number;
  asistencias: number;
  mvps: number;
  score: number;
  pases: number;
  tackles: number;
  ratingTotal: number;
  partidos: number;
  atajadas: number;
  atrapadas: number;
}

type RankingTipo =
  | "goles"
  | "asistencias"
  | "mvps"
  | "score"
  | "pases"
  | "tackles"
  | "rating"
  | "atajadas"
  | "atrapadas";

export default function JugadoresPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [modo, setModo] = useState<"temporada" | "historico">("temporada");

  const temporadas = ["Temporada 4"];
  const divisiones = [
    { nombre: "Primera", icon: "🏆" },
    { nombre: "Segunda", icon: "🥈" },
    { nombre: "Tercera", icon: "🥉" },
    { nombre: "Cuarta", icon: "⭐" },
  ];

  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);
  const [clubActualPorPlayerId, setClubActualPorPlayerId] = useState<Record<string, string>>({});

  useEffect(() => {
    cargarJugadores();
  }, [temporada, division, modo]);

  function valorGKSave(r: any) {
    return Number(r.gKSAVES || r.gKSaves || r.gksaves || 0);
  }

  async function cargarJugadores() {
    let query = supabase.from("estadisticas_jugadores").select("*");

    if (modo === "temporada") {
      query = query.eq("temporada", temporada).eq("division", division);
    }

    const { data, error } = await query;

    if (error) {
      console.log(error);
      return;
    }

    const mapa: { [key: string]: Jugador } = {};

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
          goles: 0,
          asistencias: 0,
          mvps: 0,
          score: 0,
          pases: 0,
          tackles: 0,
          ratingTotal: 0,
          partidos: 0,
          atajadas: 0,
          atrapadas: 0,
        };
      }

      mapa[clave].goles += Number(j.goals) || 0;
      mapa[clave].asistencias += Number(j.assists) || 0;
      mapa[clave].mvps += Number(j.mvp) || 0;
      mapa[clave].score += Number(j.score) || 0;
      mapa[clave].pases += Number(j.passes) || 0;
      mapa[clave].tackles += Number(j.tackles) || 0;
      mapa[clave].ratingTotal += Number(j.rating_apa || j.overallRating) || 0;
      mapa[clave].partidos += 1;
      mapa[clave].atajadas += valorGKSave(j);
      mapa[clave].atrapadas += Number(j.gKCatches) || 0;

      if (j.equipo) mapa[clave].equipo = j.equipo;
      if (j.nombre) mapa[clave].nombre = j.nombre;
      if (j.playerId) mapa[clave].playerId = j.playerId;
    });

    const listaBase = Object.values(mapa);

    const playerIds = listaBase
      .map((j: any) => String(j.playerId || "").trim())
      .filter(Boolean);

    let mapaClubActual: Record<string, string> = {};

    if (playerIds.length > 0) {
      let plantillasQuery = supabase
        .from("plantillas")
        .select("playerid,equipo,temporada,division,estado")
        .in("playerid", playerIds)
        .neq("estado", "baja");

      if (modo === "temporada") {
        plantillasQuery = plantillasQuery
          .eq("temporada", temporada)
          .eq("division", division);
      }

      const { data: plantillasData, error: plantillasError } =
        await plantillasQuery;

      if (plantillasError) {
        console.log(plantillasError);
      } else {
        (plantillasData || []).forEach((p: any) => {
          const pid = String(p.playerid || "").trim();
          if (!pid || !p.equipo) return;
          mapaClubActual[pid] = p.equipo;
        });
      }
    }

    setClubActualPorPlayerId(mapaClubActual);

    const lista = listaBase.map((j: any) => ({
      ...j,
      equipo: mapaClubActual[j.playerId] || j.equipo,
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

    setJugadores(lista);
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
      lg: "h-16 w-16 rounded-3xl text-base",
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

  function valorJugador(j: Jugador, tipo: RankingTipo) {
    if (tipo === "rating") {
      return j.partidos > 0
        ? Number((j.ratingTotal / j.partidos).toFixed(1))
        : 0;
    }

    return Number(j[tipo]) || 0;
  }

  function top(tipo: RankingTipo, cantidad = 10) {
    return [...jugadores]
      .filter((j) => valorJugador(j, tipo) > 0)
      .sort((a, b) => valorJugador(b, tipo) - valorJugador(a, tipo))
      .slice(0, cantidad);
  }

  const totalJugadores = jugadores.length;
  const totalGoles = jugadores.reduce((acc, j) => acc + j.goles, 0);
  const totalAsistencias = jugadores.reduce((acc, j) => acc + j.asistencias, 0);
  const totalMvps = jugadores.reduce((acc, j) => acc + j.mvps, 0);

  const maxGoleador = top("goles", 1)[0];
  const maxAsistidor = top("asistencias", 1)[0];
  const maxMvp = top("mvps", 1)[0];
  const mejorRating = top("rating", 1)[0];
  const mejorArquero = top("atajadas", 1)[0];

  const jugadorDestacado =
    [...jugadores]
      .sort((a, b) => {
        const valorA =
          a.goles * 4 +
          a.asistencias * 3 +
          a.mvps * 6 +
          valorJugador(a, "rating") * 2 +
          a.atajadas * 0.25;

        const valorB =
          b.goles * 4 +
          b.asistencias * 3 +
          b.mvps * 6 +
          valorJugador(b, "rating") * 2 +
          b.atajadas * 0.25;

        return valorB - valorA;
      })[0] || null;

  function LeyendaCard({
    titulo,
    subtitulo,
    jugador,
    tipo,
    color,
    icono,
  }: {
    titulo: string;
    subtitulo: string;
    jugador?: Jugador;
    tipo: RankingTipo;
    color: string;
    icono: string;
  }) {
    const valor = jugador ? valorJugador(jugador, tipo) : 0;

    const contenido = (
      <>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.10),transparent_40%)]" />

        <div className="relative z-10">
          <div className="mb-5 flex items-center justify-between gap-3 sm:mb-8 sm:gap-4">
            <p
              className={`text-xs font-black uppercase tracking-[0.28em] ${color}`}
            >
              {titulo}
            </p>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center sm:h-14 sm:w-14 rounded-2xl border border-white/10 bg-black/35 text-3xl">
              {icono}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <EscudoEquipo nombre={jugador?.equipo} size="lg" />

            <div className="min-w-0">
              <h3 className="break-words text-xl font-black uppercase sm:text-2xl leading-tight sm:truncate sm:text-3xl">
                {jugador?.nombre || "-"}
              </h3>

              <p className="mt-2 truncate text-sm uppercase tracking-[0.12em] text-zinc-500">
                {jugador?.equipo || "Sin datos"} · {jugador?.partidos || 0} PJ
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-end justify-between gap-4">
            <p className={`text-5xl font-black sm:text-6xl ${color}`}>{valor || 0}</p>

            <p className="text-right text-xs uppercase tracking-[0.2em] text-zinc-500">
              {subtitulo}
            </p>
          </div>
        </div>
      </>
    );

    if (!jugador?.playerId) {
      return (
        <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#020714] p-4 sm:rounded-[34px] sm:p-6 shadow-[0_0_35px_rgba(0,120,255,.10)]">
          {contenido}
        </div>
      );
    }

    return (
      <Link
        href={`/jugadores/${encodeURIComponent(jugador.playerId)}`}
        className="relative block overflow-hidden rounded-[26px] border border-white/10 bg-[#020714] p-4 sm:rounded-[34px] sm:p-6 shadow-[0_0_35px_rgba(0,120,255,.10)] transition hover:border-sky-400/45 hover:scale-[1.01]"
      >
        {contenido}
      </Link>
    );
  }

  function Ranking({
    titulo,
    tipo,
    color,
    icono = "🏆",
  }: {
    titulo: string;
    tipo: RankingTipo;
    color: string;
    icono?: string;
  }) {
    const ordenados = top(tipo, 10);

    return (
      <section className="relative overflow-hidden rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 shadow-[0_0_30px_rgba(0,120,255,.10)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.10),transparent_38%)]" />

        <div className="relative z-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-2xl">
              {icono}
            </div>

            <h2 className="text-xl font-black uppercase sm:text-2xl">{titulo}</h2>
          </div>

          <div className="space-y-3">
            {ordenados.length === 0 ? (
              <p className="rounded-2xl border border-white/5 bg-black/30 p-5 text-zinc-500">
                No hay datos todavía.
              </p>
            ) : (
              ordenados.map((jugador, index) => {
                const contenido = (
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

                      <EscudoEquipo nombre={jugador.equipo} size="sm" />

                      <div className="min-w-0">
                        <p className="truncate font-black uppercase text-white">
                          {jugador.nombre}
                        </p>

                        <p className="truncate text-sm text-zinc-500">
                          {jugador.equipo} · {jugador.partidos} PJ
                        </p>
                      </div>
                    </div>

                    <p className={`shrink-0 text-2xl font-black sm:text-3xl ${color}`}>
                      {valorJugador(jugador, tipo)}
                    </p>
                  </>
                );

                const className =
                  "flex items-center justify-between gap-3 rounded-2xl border border-sky-500/10 bg-black/35 p-3 sm:p-4 transition hover:border-sky-400/45 hover:bg-sky-400/10";

                if (!jugador.playerId) {
                  return (
                    <div
                      key={`${tipo}-${jugador.nombre}-${index}`}
                      className={className}
                    >
                      {contenido}
                    </div>
                  );
                }

                return (
                  <Link
                    key={`${tipo}-${jugador.playerId}-${index}`}
                    href={`/jugadores/${encodeURIComponent(jugador.playerId)}`}
                    className={className}
                  >
                    {contenido}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-[26px] border border-sky-500/30 bg-[#020714] p-5 sm:rounded-[38px] md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-400 sm:text-xs sm:tracking-[0.45em]">
              Jugadores APA · Rankings oficiales
            </p>

            <h1 className="mt-4 text-[clamp(2.7rem,10vw,5rem)] font-black uppercase italic leading-none">
              <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                Rankings
              </span>

              <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                de Jugadores
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base md:text-lg md:leading-8">
              Goleadores, asistidores, MVPs, arqueros y estadísticas oficiales
              de APA PSO Argentina UE5 agrupadas por Player ID.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Jugadores
                </p>
                <p className="mt-2 text-3xl font-black text-sky-300">
                  {totalJugadores}
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

              <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Asistencias
                </p>
                <p className="mt-2 text-3xl font-black text-sky-300">
                  {totalAsistencias}
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

        <section className="rounded-[26px] border border-sky-500/25 bg-[#020714] p-5 sm:rounded-[34px] md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]">
          <div className="grid gap-7">
            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Modo
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setModo("temporada")}
                  className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase sm:px-5 sm:py-4 sm:text-sm transition-all ${
                    modo === "temporada"
                      ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                      : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                  }`}
                >
                  Temporada actual
                </button>

                <button
                  onClick={() => setModo("historico")}
                  className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase sm:px-5 sm:py-4 sm:text-sm transition-all ${
                    modo === "historico"
                      ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                      : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                  }`}
                >
                  Archivo APA
                </button>
              </div>
            </div>

            {modo === "temporada" && (
              <>
                <div>
                  <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                    Temporada
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {temporadas.map((temp) => (
                      <button
                        key={temp}
                        onClick={() => setTemporada(temp)}
                        className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase sm:px-4 sm:py-4 sm:text-sm transition-all ${
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
                        className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase sm:px-4 sm:py-4 sm:text-sm transition-all ${
                          division === div.nombre
                            ? "border-sky-300 bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.35)]"
                            : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                        }`}
                      >
                        {div.icon} {div.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
            Selección actual
          </p>

          <h2 className="mt-3 text-[clamp(1.8rem,7vw,3rem)] font-black uppercase">
            {modo === "historico" ? (
              "Archivo APA"
            ) : (
              <>
                {temporada}
                <span className="text-sky-400"> / </span>
                {division}
              </>
            )}
          </h2>

          <p className="mt-3 text-zinc-500">
            {totalJugadores} jugadores encontrados en esta selección.
          </p>
        </section>

        {jugadorDestacado && (
          <section className="relative overflow-hidden rounded-[28px] border border-yellow-400/25 bg-gradient-to-br from-yellow-400/12 via-[#020714] to-black p-5 sm:rounded-[36px] sm:p-6 shadow-[0_0_40px_rgba(250,204,21,.10)] md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_40%)]" />

            <div className="relative z-10 grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                  Jugador destacado
                </p>

                <h2 className="mt-3 text-[clamp(2rem,7vw,3.75rem)] font-black uppercase">
                  ⭐ Figura del ranking
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                  Selección automática según goles, asistencias, MVP, rating y
                  estadísticas principales del modo actual.
                </p>
              </div>

              <Link
                href={
                  jugadorDestacado.playerId
                    ? `/jugadores/${encodeURIComponent(jugadorDestacado.playerId)}`
                    : "#"
                }
                className="group rounded-[26px] border border-yellow-400/20 bg-black/35 p-4 sm:rounded-[30px] sm:p-5 transition hover:border-yellow-300/45 hover:bg-yellow-400/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <EscudoEquipo nombre={jugadorDestacado.equipo} size="lg" />

                    <div className="min-w-0">
                      <h3 className="break-words text-xl font-black uppercase sm:text-2xl leading-tight sm:truncate sm:text-3xl transition group-hover:text-yellow-300">
                        {jugadorDestacado.nombre}
                      </h3>

                      <p className="mt-2 truncate text-sm font-bold uppercase tracking-[0.16em] text-zinc-500">
                        {jugadorDestacado.equipo} · {jugadorDestacado.partidos} PJ
                      </p>
                    </div>
                  </div>

                  <div className="hidden h-16 w-16 shrink-0 items-center justify-center sm:flex rounded-3xl border border-yellow-400/25 bg-yellow-400/10 text-3xl">
                    ⭐
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <p className="text-[10px] font-black uppercase text-zinc-500">
                      Goles
                    </p>
                    <p className="mt-2 text-3xl font-black text-yellow-300">
                      {jugadorDestacado.goles}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <p className="text-[10px] font-black uppercase text-zinc-500">
                      Asist.
                    </p>
                    <p className="mt-2 text-3xl font-black text-sky-300">
                      {jugadorDestacado.asistencias}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <p className="text-[10px] font-black uppercase text-zinc-500">
                      MVP
                    </p>
                    <p className="mt-2 text-3xl font-black text-purple-300">
                      {jugadorDestacado.mvps}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <p className="text-[10px] font-black uppercase text-zinc-500">
                      Rating
                    </p>
                    <p className="mt-2 text-3xl font-black text-green-400">
                      {valorJugador(jugadorDestacado, "rating")}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:gap-5">
          <LeyendaCard
            titulo="Goleador"
            subtitulo="goles"
            jugador={maxGoleador}
            tipo="goles"
            color="text-emerald-400"
            icono="⚽"
          />

          <LeyendaCard
            titulo="Asistidor"
            subtitulo="asistencias"
            jugador={maxAsistidor}
            tipo="asistencias"
            color="text-sky-300"
            icono="🎯"
          />

          <LeyendaCard
            titulo="Rey MVP"
            subtitulo="MVPs"
            jugador={maxMvp}
            tipo="mvps"
            color="text-yellow-300"
            icono="👑"
          />

          <LeyendaCard
            titulo="Mejor rating"
            subtitulo="promedio"
            jugador={mejorRating}
            tipo="rating"
            color="text-green-400"
            icono="⭐"
          />

          <LeyendaCard
            titulo="Muro"
            subtitulo="atajadas"
            jugador={mejorArquero}
            tipo="atajadas"
            color="text-cyan-300"
            icono="🧤"
          />
        </section>

        <section>
          <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
            Rankings oficiales
          </p>

          <h2 className="mt-3 text-[clamp(1.8rem,7vw,3rem)] font-black uppercase">
            Líderes de la competición
          </h2>

          <p className="mt-3 text-base leading-7 text-zinc-400">
            Rankings ordenados por categoría para que la lectura sea más rápida.
          </p>
        </section>

        <section className="space-y-8">
          <div>
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                Grupo 1
              </p>
              <h3 className="mt-2 text-xl font-black uppercase sm:text-2xl sm:text-3xl">
                🏆 Principales
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-8">
              <Ranking
                titulo={modo === "historico" ? "Goleadores registrados" : "Goleadores"}
                tipo="goles"
                color="text-emerald-400"
                icono="⚽"
              />

              <Ranking
                titulo={
                  modo === "historico" ? "Asistidores registrados" : "Asistencias"
                }
                tipo="asistencias"
                color="text-sky-400"
                icono="🎯"
              />

              <Ranking
                titulo={modo === "historico" ? "MVPs registrados" : "MVPs"}
                tipo="mvps"
                color="text-yellow-300"
                icono="👑"
              />

              <Ranking
                titulo={
                  modo === "historico"
                    ? "Rating promedio registrado"
                    : "Rating promedio"
                }
                tipo="rating"
                color="text-green-400"
                icono="⭐"
              />
            </div>
          </div>

          <div>
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Grupo 2
              </p>
              <h3 className="mt-2 text-xl font-black uppercase sm:text-2xl sm:text-3xl">
                📊 Avanzadas
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-8">
              <Ranking
                titulo={modo === "historico" ? "Score registrado" : "Score"}
                tipo="score"
                color="text-yellow-300"
                icono="📊"
              />

              <Ranking
                titulo={modo === "historico" ? "Pases registrados" : "Pases"}
                tipo="pases"
                color="text-sky-300"
                icono="👟"
              />

              <Ranking
                titulo={modo === "historico" ? "Tackles registrados" : "Tackles"}
                tipo="tackles"
                color="text-red-400"
                icono="🛡️"
              />
            </div>
          </div>

          <div>
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
                Grupo 3
              </p>
              <h3 className="mt-2 text-xl font-black uppercase sm:text-2xl sm:text-3xl">
                🧤 Arqueros
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-8">
              <Ranking
                titulo={
                  modo === "historico" ? "Atajadas registradas" : "Atajadas"
                }
                tipo="atajadas"
                color="text-cyan-400"
                icono="🧤"
              />

              <Ranking
                titulo={
                  modo === "historico" ? "Atrapadas registradas" : "Atrapadas"
                }
                tipo="atrapadas"
                color="text-indigo-300"
                icono="🤲"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
