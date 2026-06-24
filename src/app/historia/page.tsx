"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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

interface ClubInfo {
  nombre: string;
  logo_url: string | null;
}

const premiosOrden = [
  "balon_oro",
  "the_best",
  "raiko_trophy",
  "bota_oro",
  "golden_boy",
];

export default function HistoriaPage() {
  const [jugadores, setJugadores] = useState<RankingJugador[]>([]);
  const [clubesInfo, setClubesInfo] = useState<ClubInfo[]>([]);
  const [premiosApa, setPremiosApa] = useState<PremioAPA[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHistoria();
  }, []);

  async function cargarHistoria() {
    setLoading(true);

    const rankingQuery = supabase
      .from("v_ranking_jugadores")
      .select(`
        playerId,
        nombre,
        equipo,
        partidos_jugados,
        goals,
        assists,
        mvp,
        score_total,
        rating_apa_promedio,
        gKSaves,
        tackles,
        interceptions
      `);

    const premiosQuery = supabase
      .from("premios_apa")
      .select(`
        id,
        temporada,
        division,
        premio,
        playerid,
        nombre,
        equipo,
        puntos,
        posicion,
        created_at
      `)
      .order("temporada", { ascending: false })
      .order("created_at", { ascending: false });

    const [
      { data: rankingData, error: rankingError },
      { data: premiosData, error: premiosError },
    ] = await Promise.all([rankingQuery, premiosQuery]);

    if (rankingError) {
      console.error("Error cargando ranking histórico:", rankingError);
      setJugadores([]);
      setClubesInfo([]);
    } else {
      const mapa: Record<string, RankingJugador & { ratingTotal: number }> = {};

      (rankingData || []).forEach((j: any) => {
        const nombre = String(j.nombre || "").trim();
        const playerId = String(j.playerId || "").trim();

        if (!nombre) return;

        const clave = playerId || nombre;
        const partidos = Number(j.partidos_jugados || 0);
        const ratingPromedio = Number(j.rating_apa_promedio || 0);

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
            ratingPromedio: 0,
            ratingTotal: 0,
            atajadas: 0,
            tackles: 0,
            intercepciones: 0,
          };
        }

        mapa[clave].partidos += partidos;
        mapa[clave].goles += Number(j.goals || 0);
        mapa[clave].asistencias += Number(j.assists || 0);
        mapa[clave].mvps += Number(j.mvp || 0);
        mapa[clave].score += Number(j.score_total || 0);
        mapa[clave].ratingTotal += ratingPromedio * partidos;
        mapa[clave].atajadas += Number(j.gKSaves || 0);
        mapa[clave].tackles += Number(j.tackles || 0);
        mapa[clave].intercepciones += Number(j.interceptions || 0);

        if (j.equipo) mapa[clave].equipo = j.equipo;
        if (j.nombre) mapa[clave].nombre = j.nombre;
        if (j.playerId) mapa[clave].playerId = j.playerId;
      });

      const lista = Object.values(mapa).map(({ ratingTotal, ...j }) => ({
        ...j,
        ratingPromedio:
          j.partidos > 0 ? Math.round((ratingTotal / j.partidos) * 10) / 10 : 0,
      }));

      const nombresEquipos = Array.from(
        new Set(lista.map((j) => j.equipo).filter(Boolean)),
      );

      if (nombresEquipos.length > 0) {
        const { data: clubesData, error: clubesError } = await supabase
          .from("clubes_info")
          .select("nombre, logo_url")
          .in("nombre", nombresEquipos);

        if (clubesError) {
          console.error("Error cargando logos de clubes:", clubesError);
          setClubesInfo([]);
        } else {
          setClubesInfo((clubesData || []) as unknown as ClubInfo[]);
        }
      } else {
        setClubesInfo([]);
      }

      setJugadores(lista);
    }

    if (premiosError) {
      console.error("Error cargando premios APA:", premiosError);
      setPremiosApa([]);
    } else {
      setPremiosApa((premiosData || []) as unknown as PremioAPA[]);
    }

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

  function premioDescripcion(premio: string) {
    const mapa: Record<string, string> = {
      balon_oro: "El jugador más determinante de la temporada.",
      the_best:
        "Reconocimiento especial al mejor rendimiento fuera de Primera.",
      raiko_trophy: "El arquero más importante de la temporada.",
      bota_oro: "El máximo goleador de la competencia.",
      golden_boy: "La gran promesa joven de APA.",
    };

    return mapa[premio] || "Premio oficial APA.";
  }

  function premioImagen(premio: string) {
    const mapa: Record<string, string> = {
      balon_oro: "/themes/worldcup/trophy-balon.png",
      the_best: "/themes/worldcup/trophy-thebest.png",
      raiko_trophy: "/themes/worldcup/trophy-raiko.png",
      bota_oro: "/themes/worldcup/trophy-boot.png",
      golden_boy: "/themes/worldcup/trophy-goldenboy.png",
    };

    return mapa[premio] || "/themes/worldcup/trophy-worldcup.png";
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

  function premioGlow(premio: string) {
    const mapa: Record<string, string> = {
      balon_oro: "shadow-[0_0_55px_rgba(250,204,21,.22)] border-yellow-400/30",
      the_best: "shadow-[0_0_55px_rgba(251,146,60,.18)] border-orange-400/30",
      raiko_trophy: "shadow-[0_0_55px_rgba(34,211,238,.18)] border-cyan-400/30",
      bota_oro: "shadow-[0_0_55px_rgba(52,211,153,.18)] border-emerald-400/30",
      golden_boy:
        "shadow-[0_0_55px_rgba(216,180,254,.18)] border-purple-400/30",
    };

    return (
      mapa[premio] ||
      "shadow-[0_0_55px_rgba(250,204,21,.18)] border-yellow-400/25"
    );
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

  const logosPorEquipo = useMemo(() => {
    const mapa = new Map<string, string | null>();

    clubesInfo.forEach((club) => {
      mapa.set(String(club.nombre || "").toLowerCase().trim(), club.logo_url);
    });

    return mapa;
  }, [clubesInfo]);

  function logoEquipo(nombre?: string) {
    if (!nombre) return null;

    return logosPorEquipo.get(String(nombre).toLowerCase().trim()) || null;
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
      lg: "h-14 w-14 rounded-2xl text-sm sm:h-16 sm:w-16 sm:rounded-3xl sm:text-base",
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
            loading="lazy"
          />
        ) : (
          nombre?.slice(0, 2).toUpperCase() || "CL"
        )}
      </div>
    );
  }

  function top(campo: keyof RankingJugador, cantidad = 10) {
    return [...jugadores]
      .filter((j) => Number(j[campo]) > 0)
      .sort((a, b) => Number(b[campo]) - Number(a[campo]))
      .slice(0, cantidad);
  }

  function linkJugador(
    j: RankingJugador,
    children: ReactNode,
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

  function rankingTrofeos(tipo?: string) {
    const mapa: Record<string, any> = {};

    premiosApa
      .filter((p) => !tipo || p.premio === tipo)
      .forEach((p) => {
        const key = p.playerid || `${p.nombre}-${p.equipo}`;

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

  const totalPartidos = jugadores.reduce((acc, j) => acc + j.partidos, 0);
  const totalGoles = jugadores.reduce((acc, j) => acc + j.goles, 0);
  const totalAsistencias = jugadores.reduce((acc, j) => acc + j.asistencias, 0);
  const totalMvps = jugadores.reduce((acc, j) => acc + j.mvps, 0);

  const maxGoleador = top("goles", 1)[0];
  const maxAsistidor = top("asistencias", 1)[0];
  const maxMvp = top("mvps", 1)[0];
  const mejorRating = top("ratingPromedio", 1)[0];
  const mejorArquero = top("atajadas", 1)[0];

  const totalPremios = premiosApa.length;
  const ultimoGanador = premiosApa[0];

  const leyendas = useMemo(
    () => [
      {
        titulo: "Leyenda goleadora",
        subtitulo: "goles",
        jugador: maxGoleador,
        valor: maxGoleador?.goles,
        color: "text-emerald-400",
        icono: "⚽",
        fondo: "/themes/worldcup/card-jugadores.png",
      },
      {
        titulo: "Mago asistidor",
        subtitulo: "asistencias",
        jugador: maxAsistidor,
        valor: maxAsistidor?.asistencias,
        color: "text-sky-300",
        icono: "🎯",
        fondo: "/themes/worldcup/card-partidos.png",
      },
      {
        titulo: "Rey MVP",
        subtitulo: "MVP",
        jugador: maxMvp,
        valor: maxMvp?.mvps,
        color: "text-yellow-300",
        icono: "👑",
        fondo: "/themes/worldcup/trophy-worldcup.png",
      },
      {
        titulo: "Mejor rating",
        subtitulo: "promedio",
        jugador: mejorRating,
        valor: mejorRating?.ratingPromedio,
        color: "text-purple-300",
        icono: "⭐",
        fondo: "/themes/worldcup/trophy-goldenboy.png",
      },
      {
        titulo: "Muro APA",
        subtitulo: "atajadas",
        jugador: mejorArquero,
        valor: mejorArquero?.atajadas,
        color: "text-cyan-300",
        icono: "🧤",
        fondo: "/themes/worldcup/trophy-raiko.png",
      },
    ],
    [maxGoleador, maxAsistidor, maxMvp, mejorRating, mejorArquero],
  );

  function SectionTitle({
    eyebrow,
    title,
    desc,
    accent = "text-yellow-300",
  }: {
    eyebrow: string;
    title: string;
    desc?: string;
    accent?: string;
  }) {
    return (
      <section className="relative">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-400/35 to-white/5" />
          <p
            className={`text-center text-[10px] font-black uppercase tracking-[0.36em] ${accent}`}
          >
            {eyebrow}
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-white/5 via-yellow-400/35 to-transparent" />
        </div>

        <h2 className="mt-4 text-center text-[clamp(2rem,7vw,4rem)] font-black uppercase italic leading-none text-white">
          {title}
        </h2>

        {desc && (
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-7 text-zinc-400 sm:text-base">
            {desc}
          </p>
        )}
      </section>
    );
  }

  function StatPill({
    label,
    value,
    color,
  }: {
    label: string;
    value: any;
    color: string;
  }) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-zinc-500">
          {label}
        </p>
        <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
      </div>
    );
  }

  function PremioCard({ tipo, index }: { tipo: string; index: number }) {
    const premio = ultimoPremio(tipo);
    const historial = premiosPorTipo(tipo);
    const veces = vecesGanadas(premio?.playerid, tipo);
    const color = premioColor(tipo);

    const body = (
      <>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,.16),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/70" />
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="relative mb-6 h-64 overflow-hidden rounded-[34px] border border-white/10 bg-black/45 shadow-[0_0_40px_rgba(0,0,0,.28)] sm:h-72 xl:h-64">
            <img
              src={premioImagen(tipo)}
              alt={premioNombre(tipo)}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
            <div className="absolute left-4 top-4 rounded-2xl border border-yellow-400/25 bg-black/55 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-yellow-300 backdrop-blur">
              #{index + 1} Premio
            </div>
          </div>

          <p
            className={`text-[10px] font-black uppercase tracking-[0.32em] ${color}`}
          >
            Premio APA
          </p>

          <h3 className="mt-2 text-3xl font-black uppercase italic leading-none text-white xl:text-4xl">
            {premioNombre(tipo)}
          </h3>

          <p className="mt-3 min-h-[48px] text-sm leading-6 text-zinc-400">
            {premioDescripcion(tipo)}
          </p>

          {premio ? (
            <>
              <div className="mt-6 flex items-center gap-4 rounded-3xl border border-white/10 bg-black/40 p-4">
                <EscudoEquipo nombre={premio.equipo || undefined} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-2xl font-black uppercase text-white">
                    {premio.nombre}
                  </p>
                  <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                    {premio.equipo || "Sin club"} · {premio.temporada}
                    {premio.division ? ` · ${premio.division}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Puntos
                  </p>
                  <p className={`mt-2 text-xl font-black ${color}`}>
                    {Number(premio.puntos || 0).toFixed(1)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Pos.
                  </p>
                  <p className={`mt-2 text-xl font-black ${color}`}>
                    #{premio.posicion || 1}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Veces
                  </p>
                  <p className={`mt-2 text-xl font-black ${color}`}>{veces}</p>
                </div>
              </div>

              {historial.length > 1 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {historial.slice(0, 3).map((h) => (
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
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-5">
              <p className="text-lg font-black uppercase text-zinc-300">
                Sin ganador cargado
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Cuando se asigne desde el panel de premios, aparecerá acá
                automáticamente.
              </p>
            </div>
          )}
        </div>
      </>
    );

    const className = `group relative block h-full overflow-hidden rounded-[38px] border bg-[#020714] p-5 transition duration-300 hover:-translate-y-2 hover:scale-[1.01] ${premioGlow(tipo)}`;

    if (!premio?.playerid) {
      return <article className={className}>{body}</article>;
    }

    return (
      <Link
        href={`/jugadores/${encodeURIComponent(premio.playerid)}`}
        className={className}
      >
        {body}
      </Link>
    );
  }

  function LeyendaCard({
    titulo,
    subtitulo,
    jugador,
    valor,
    color,
    icono,
    fondo,
  }: {
    titulo: string;
    subtitulo: string;
    jugador?: RankingJugador;
    valor: any;
    color: string;
    icono: string;
    fondo: string;
  }) {
    const contenido = (
      <>
        <img
          src={fondo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-500 group-hover:scale-110 group-hover:opacity-50"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.10),transparent_40%)]" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className={`text-[10px] font-black uppercase tracking-[0.28em] ${color}`}
              >
                {titulo}
              </p>
              <h3 className="mt-3 text-2xl font-black uppercase text-white">
                {jugador?.nombre || "-"}
              </h3>
              <p className="mt-2 truncate text-xs uppercase tracking-[0.12em] text-zinc-400">
                {jugador?.equipo || "Sin datos"}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/45 text-3xl">
              {icono}
            </div>
          </div>

          <div className="mt-8 flex items-end justify-between gap-4">
            <EscudoEquipo nombre={jugador?.equipo} size="lg" />
            <div className="text-right">
              <p className={`text-5xl font-black ${color}`}>{valor || 0}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                {subtitulo}
              </p>
            </div>
          </div>
        </div>
      </>
    );

    const className =
      "group relative min-h-[260px] overflow-hidden rounded-[34px] border border-white/10 bg-[#020714] p-5 shadow-[0_0_35px_rgba(0,120,255,.10)] transition hover:-translate-y-1 hover:border-sky-400/45";

    if (!jugador?.playerId)
      return <article className={className}>{contenido}</article>;

    return (
      <Link
        href={`/jugadores/${encodeURIComponent(jugador.playerId)}`}
        className={className}
      >
        {contenido}
      </Link>
    );
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
      <section className="relative overflow-hidden rounded-[34px] border border-yellow-500/20 bg-[#020714] p-5 shadow-[0_0_30px_rgba(250,204,21,.10)] sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.10),transparent_40%)]" />
        <div className="relative z-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 text-2xl">
              {icono}
            </div>
            <h2 className="text-xl font-black uppercase sm:text-2xl">
              {titulo}
            </h2>
          </div>

          <div className="space-y-3">
            {lista.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-black/35 p-4 text-zinc-500">
                Todavía no hay datos.
              </p>
            ) : (
              lista.map((j: any, index: number) => (
                <Link
                  key={`${j.playerid || j.nombre}-${index}`}
                  href={
                    j.playerid
                      ? `/jugadores/${encodeURIComponent(j.playerid)}`
                      : "/historia"
                  }
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-yellow-400/35 hover:bg-yellow-400/10"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black ${index === 0 ? "bg-yellow-400 text-black" : "bg-white/[0.06] text-zinc-400"}`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black uppercase text-white">
                        {j.nombre}
                      </p>
                      <p className="truncate text-sm text-zinc-500">
                        {j.equipo}
                      </p>
                    </div>
                  </div>
                  <p className={`text-3xl font-black ${color}`}>{j.cantidad}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
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
      <section className="relative overflow-hidden rounded-[34px] border border-sky-500/20 bg-[#020714] p-5 shadow-[0_0_30px_rgba(0,120,255,.10)] sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.10),transparent_38%)]" />

        <div className="relative z-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-2xl">
              {icono}
            </div>
            <h2 className="text-xl font-black uppercase sm:text-2xl">
              {titulo}
            </h2>
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
                    <div className="flex min-w-0 items-center gap-4">
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

                    <p
                      className={`shrink-0 text-2xl font-black sm:text-3xl ${color}`}
                    >
                      {j[campo]}
                      {sufijo}
                    </p>
                  </>,
                  "flex items-center justify-between gap-3 rounded-2xl border border-sky-500/10 bg-black/35 p-3 transition hover:border-sky-400/45 hover:bg-sky-400/10 sm:p-4",
                  `${String(campo)}-${j.playerId || j.nombre}-${index}`,
                ),
              )
            )}
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020714] text-white">
        <div className="text-center">
          <p className="animate-pulse text-sky-400 font-black uppercase tracking-[0.3em]">
            Cargando historia...
          </p>
          <div className="mx-auto mt-5 h-1 w-48 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-yellow-400" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div className="fixed inset-0 pointer-events-none">
        <img
          src="/themes/worldcup/world-map.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.05]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]" />
        <div className="absolute left-[-12%] top-24 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute right-[-12%] top-64 h-[460px] w-[460px] rounded-full bg-yellow-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] space-y-12 px-3 py-5 sm:px-4 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-[34px] border border-yellow-400/25 bg-[#020714] shadow-[0_0_75px_rgba(250,204,21,.20)] sm:rounded-[48px]">
          <img
            src="/themes/worldcup/hero-bg.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
          <div className="absolute -right-24 top-16 hidden h-[520px] w-[520px] rounded-full bg-yellow-400/10 blur-3xl lg:block" />

          <div className="relative z-10 grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_430px] lg:items-center lg:p-10 xl:p-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-yellow-300 sm:text-xs">
                APA PSO Argentina · World Cup Edition
              </p>

              <h1 className="mt-5 text-[clamp(3.2rem,10vw,7rem)] font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-700 bg-clip-text text-transparent">
                  Historia
                </span>
                <span className="block text-yellow-300 drop-shadow-[0_0_26px_rgba(250,204,21,.65)]">
                  APA
                </span>
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg">
                El legado oficial de la comunidad: premios, récords, goleadores,
                arqueros, MVPs y ganadores históricos desde la Temporada 4.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatPill
                  label="Jugadores"
                  value={jugadores.length}
                  color="text-sky-300"
                />
                <StatPill
                  label="Registros"
                  value={totalPartidos}
                  color="text-white"
                />
                <StatPill
                  label="Goles"
                  value={totalGoles}
                  color="text-emerald-400"
                />
                <StatPill
                  label="Premios"
                  value={totalPremios}
                  color="text-yellow-300"
                />
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden rounded-[42px] border border-yellow-400/25 bg-black/45 p-5 shadow-[0_0_55px_rgba(250,204,21,.22)]">
                <img
                  src="/themes/worldcup/trophy-worldcup.png"
                  alt="Copa"
                  className="h-[360px] w-full rounded-[32px] object-cover"
                />
                <div className="absolute inset-5 rounded-[32px] bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-9 left-9 right-9">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-300">
                    Último ganador
                  </p>
                  <h2 className="mt-2 truncate text-3xl font-black uppercase">
                    {ultimoGanador?.nombre || "Sin datos"}
                  </h2>
                  <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                    {ultimoGanador
                      ? `${premioNombre(ultimoGanador.premio)} · ${ultimoGanador.temporada}`
                      : "Cargá premios desde el panel"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionTitle
          eyebrow="Premios oficiales"
          title="Trofeos APA"
          desc="Cinco reconocimientos principales con ganadores automáticos desde Supabase. Los trofeos son el foco visual de la página."
        />

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          {premiosOrden.map((tipo, index) => (
            <PremioCard key={tipo} tipo={tipo} index={index} />
          ))}
        </section>

        <SectionTitle
          eyebrow="Leyendas actuales"
          title="Los dueños de la temporada"
          desc="Una vista rápida de los jugadores que dominan los principales récords acumulados."
          accent="text-sky-300"
        />

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          {leyendas.map((item) => (
            <LeyendaCard key={item.titulo} {...item} />
          ))}
        </section>

        <SectionTitle
          eyebrow="Salón de trofeos"
          title="Ranking histórico de premios"
          desc="Quiénes acumularon más galardones oficiales dentro de APA."
        />

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

        <SectionTitle
          eyebrow="Rankings históricos"
          title="Récords de la competición"
          desc="Cada ranking agrupa jugadores por Player ID para mantener la historia limpia y sin duplicados."
          accent="text-sky-300"
        />

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
