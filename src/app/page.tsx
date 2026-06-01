"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import HeroImagenesHome from "../components/HeroImagenesHome";
import HeroCarruselHome from "../components/HeroCarruselHome";

const temporadas = [
  "Temporada 1",
  "Temporada 2",
  "Temporada 3",
  "Temporada 4",
  "Temporada 5",
];

const divisiones = [
  { nombre: "primera", label: "Primera", icon: "🏆" },
  { nombre: "segunda", label: "Segunda", icon: "🥈" },
  { nombre: "tercera", label: "Tercera", icon: "🥉" },
  { nombre: "cuarta", label: "Cuarta", icon: "⭐" },
];

function SeparadorHome({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-400/30 to-white/5" />
      <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.34em] text-sky-300 shadow-[0_0_18px_rgba(56,189,248,.12)]">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-white/5 via-sky-400/30 to-transparent" />
    </div>
  );
}

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

  const divisionActual =
    divisiones.find((d) => d.nombre === division) || divisiones[0];

  const equiposCantidad = new Set(
    partidos.flatMap((p) => [p.local, p.visitante]).filter(Boolean),
  ).size;

  const jugadoresCantidad = new Set(jugadores.map((j) => j.nombre).filter(Boolean))
    .size;

  const golesTotales = jugadores.reduce(
    (acc, j) => acc + Number(j.goles || j.goals || 0),
    0,
  );

  const asistenciasTotales = jugadores.reduce(
    (acc, j) => acc + Number(j.asistencias || j.assists || 0),
    0,
  );

  const mvpTotales = jugadores.reduce(
    (acc, j) => acc + Number(j.mvp || j.mvps || 0),
    0,
  );

  const partidoDestacado =
    partidos.find((p) => !p.resultado) || partidos.find((p) => p.resultado) || partidos[0];

  const proximosPartidos = partidos
    .filter((p) => !p.resultado)
    .slice(0, 4);

  const ultimosResultados = partidos
    .filter((p) => p.resultado)
    .slice(-4)
    .reverse();

  const rankings = useMemo(() => {
    const mapa: Record<string, any> = {};

    jugadores.forEach((j: any) => {
      const nombre = j.nombre || j.jugador || "Sin Nombre";
      const key = j.playerId || nombre;

      if (!mapa[key]) {
        mapa[key] = {
          nombre,
          equipo: j.equipo || "Sin Club",
          goles: 0,
          asistencias: 0,
          mvps: 0,
        };
      }

      mapa[key].goles += Number(j.goles || j.goals || 0);
      mapa[key].asistencias += Number(j.asistencias || j.assists || 0);
      mapa[key].mvps += Number(j.mvp || j.mvps || 0);
      if (j.equipo) mapa[key].equipo = j.equipo;
    });

    const lista = Object.values(mapa);

    return {
      goleador: [...lista].sort((a, b) => b.goles - a.goles)[0],
      asistidor: [...lista].sort((a, b) => b.asistencias - a.asistencias)[0],
      mvp: [...lista].sort((a, b) => b.mvps - a.mvps)[0],
    };
  }, [jugadores]);

  const statsHome = [
    {
      label: "Equipos",
      value: equiposCantidad,
      icon: "🏟️",
      detail: "clubes activos",
      color: "text-sky-300",
    },
    {
      label: "Partidos",
      value: partidos.length,
      icon: "📅",
      detail: "en fixture",
      color: "text-purple-300",
    },
    {
      label: "Jugadores",
      value: jugadoresCantidad,
      icon: "⭐",
      detail: "registrados",
      color: "text-yellow-300",
    },
    {
      label: "Goles",
      value: golesTotales,
      icon: "⚽",
      detail: "temporada",
      color: "text-emerald-300",
    },
  ];

  const accesos = [
    {
      href: "/competicion",
      title: "Competición",
      desc: "Torneos, copas, fixture, stats e historia.",
      icon: "🏆",
      color: "from-sky-500/20 to-blue-950/20 border-sky-400/25",
    },
    {
      href: `/fixture?temporada=${encodeURIComponent(temporada)}`,
      title: "Fixture",
      desc: "Calendario oficial por temporada y categoría.",
      icon: "📅",
      color: "from-blue-500/20 to-cyan-950/20 border-blue-400/25",
    },
    {
      href: "/clubes",
      title: "Clubes",
      desc: "Escudos, planteles, identidad e historial.",
      icon: "🏟️",
      color: "from-violet-500/20 to-blue-950/20 border-violet-400/25",
    },
    {
      href: "/jugadores",
      title: "Jugadores",
      desc: "Rankings, perfiles, goles, MVP y rating.",
      icon: "⭐",
      color: "from-yellow-500/20 to-blue-950/20 border-yellow-400/25",
    },
    {
      href: "/mercado",
      title: "Mercado",
      desc: "Fichajes, salidas, libres y préstamos.",
      icon: "🔁",
      color: "from-emerald-500/20 to-blue-950/20 border-emerald-400/25",
    },
    {
      href: "/entretenimiento",
      title: "Entretenimiento",
      desc: "Predicciones, Dream Team y premios APA.",
      icon: "🎮",
      color: "from-purple-500/20 to-blue-950/20 border-purple-400/25",
    },
    {
      href: "/guia",
      title: "Guía",
      desc: "Mapa completo para entender la web.",
      icon: "📖",
      color: "from-cyan-500/20 to-blue-950/20 border-cyan-400/25",
    },
    {
      href: "/historia",
      title: "Archivo APA",
      desc: "Rankings y registros históricos cargados.",
      icon: "🏛️",
      color: "from-orange-500/20 to-blue-950/20 border-orange-400/25",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] p-4 text-white md:p-6">
      <section className="mx-auto max-w-[1500px] space-y-10">
        <HeroImagenesHome />

        <section className="relative overflow-hidden rounded-[42px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_60px_rgba(0,120,255,.22)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.22),transparent_42%)]" />
          <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/86 to-black/35" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.5em] text-sky-400">
                APA PSO Argentina UE5
              </p>

              <h1 className="mt-5 text-5xl font-black uppercase italic leading-none md:text-7xl">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Portal
                </span>
                <span className="block text-sky-400 drop-shadow-[0_0_22px_rgba(56,189,248,.60)]">
                  Oficial APA
                </span>
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
                Toda la información de la liga en un solo lugar: competición,
                fixture, clubes, jugadores, mercado, rankings y comunidad.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-black uppercase text-sky-300">
                  {temporada}
                </span>

                <span className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black uppercase text-yellow-300">
                  {divisionActual.icon} {divisionActual.label} División
                </span>

                <span className="rounded-2xl border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-black uppercase text-green-300">
                  ● Liga activa
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/competicion"
                  className="rounded-2xl border border-sky-400/35 bg-sky-400 px-6 py-3 text-sm font-black uppercase text-black transition hover:bg-white"
                >
                  Ver competición
                </Link>

                <Link
                  href="/guia"
                  className="rounded-2xl border border-white/10 bg-black/35 px-6 py-3 text-sm font-black uppercase text-zinc-300 transition hover:border-sky-400/40 hover:text-white"
                >
                  Cómo funciona APA
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative rounded-[36px] border border-sky-400/25 bg-black/35 p-6 shadow-[0_0_42px_rgba(56,189,248,.18)]">
                <div className="absolute -inset-5 rounded-full bg-sky-400/10 blur-3xl" />

                <div className="relative z-10 text-center">
                  <div className="mx-auto h-32 w-32 overflow-hidden rounded-[34px] border border-sky-400/30 bg-black/40">
                    <img
                      src="/logo-apa.png"
                      alt="APA PSO"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
                    Centro de información
                  </p>

                  <h2 className="mt-2 text-3xl font-black uppercase">
                    League Hub
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714]/90 p-6 shadow-[0_0_35px_rgba(0,120,255,.12)] md:p-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Competición actual
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
                Elegí contexto
              </h2>
            </div>

            <p className="max-w-xl text-base leading-7 text-zinc-400">
              La portada se actualiza según la temporada y división seleccionada.
            </p>
          </div>

          <div className="grid gap-6">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                Temporada
              </p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {temporadas.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemporada(t)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      temporada === t
                        ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
                        : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                Categoría
              </p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {divisiones.map((d) => (
                  <button
                    key={d.nombre}
                    onClick={() => setDivision(d.nombre)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      division === d.nombre
                        ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                        : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white"
                    }`}
                  >
                    {d.icon} {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statsHome.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-[28px] border border-sky-400/15 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 shadow-[0_14px_40px_rgba(0,0,0,.22)] transition hover:-translate-y-1 hover:border-sky-400/35 hover:bg-sky-500/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                    {stat.label}
                  </p>

                  <h2 className={`mt-2 text-4xl font-black leading-none md:text-5xl ${stat.color}`}>
                    {stat.value}
                  </h2>

                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300/80">
                    {stat.detail}
                  </p>
                </div>

                <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl transition group-hover:scale-110">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        <SeparadorHome label="Qué está pasando" />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_1fr]">
          <section className="relative overflow-hidden rounded-[34px] border border-sky-400/25 bg-gradient-to-br from-[#071b3a] via-[#020714] to-black p-5 shadow-[0_0_45px_rgba(56,189,248,.14)] md:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.20),transparent_34%)]" />
            <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-sky-300">
                    {temporada} · {divisionActual.label}
                  </p>

                  <h2 className="mt-2 text-2xl font-black uppercase md:text-4xl">
                    Partido destacado
                  </h2>
                </div>

                <Link
                  href={`/fixture/${division}?temporada=${encodeURIComponent(temporada)}`}
                  className="inline-flex justify-center rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-3 text-xs font-black uppercase text-black transition hover:bg-white"
                >
                  Ver fixture
                </Link>
              </div>

              {partidoDestacado ? (
                <>
                  <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)]">
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-center">
                      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
                        Local
                      </p>

                      <h3 className="mx-auto max-w-[360px] break-words text-2xl font-black uppercase leading-tight md:text-3xl">
                        {partidoDestacado.local}
                      </h3>
                    </div>

                    <div className="mx-auto flex h-[92px] w-[110px] items-center justify-center rounded-[26px] bg-blue-600 text-center text-4xl font-black leading-none shadow-[0_0_34px_rgba(37,99,235,.55)]">
                      {partidoDestacado.resultado || "VS"}
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-center">
                      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
                        Visitante
                      </p>

                      <h3 className="mx-auto max-w-[360px] break-words text-2xl font-black uppercase leading-tight md:text-3xl">
                        {partidoDestacado.visitante}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-zinc-400">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                      Fecha {partidoDestacado.fecha}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                      {partidoDestacado.dia || "Día sin cargar"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                      {partidoDestacado.hora || "Hora sin cargar"}
                    </span>
                  </div>
                </>
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-zinc-500">
                  No hay partidos cargados.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[34px] border border-yellow-400/25 bg-gradient-to-br from-yellow-400/10 via-[#020714] to-black p-6 shadow-[0_0_35px_rgba(250,204,21,.10)]">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
              Líderes rápidos
            </p>

            <h2 className="mt-2 text-3xl font-black uppercase">
              Rankings de la selección
            </h2>

            <div className="mt-6 space-y-3">
              {[
                ["⚽ Goleador", rankings.goleador?.nombre || "-", rankings.goleador?.goles || 0],
                [
                  "🎯 Asistidor",
                  rankings.asistidor?.nombre || "-",
                  rankings.asistidor?.asistencias || 0,
                ],
                ["👑 MVP", rankings.mvp?.nombre || "-", rankings.mvp?.mvps || 0],
              ].map(([label, name, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-black/35 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                        {label}
                      </p>

                      <h3 className="mt-2 truncate text-xl font-black uppercase text-white">
                        {name}
                      </h3>
                    </div>

                    <p className="text-4xl font-black text-yellow-300">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/jugadores"
              className="mt-5 flex items-center justify-between rounded-2xl border border-yellow-400/20 bg-black/35 px-4 py-3 text-sm font-black uppercase text-yellow-300 transition hover:bg-yellow-400/10"
            >
              Ver rankings completos <span>→</span>
            </Link>
          </section>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714]/90 p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                  Próximos partidos
                </p>
                <h2 className="mt-2 text-3xl font-black uppercase">
                  Calendario inmediato
                </h2>
              </div>

              <Link
                href={`/fixture/${division}?temporada=${encodeURIComponent(temporada)}`}
                className="text-sm font-black uppercase text-sky-300"
              >
                Ver todos →
              </Link>
            </div>

            <div className="space-y-3">
              {proximosPartidos.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                  No hay próximos partidos cargados.
                </p>
              ) : (
                proximosPartidos.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[1fr_70px_1fr] items-center gap-3 rounded-2xl border border-sky-500/15 bg-black/35 p-4"
                  >
                    <p className="truncate text-right text-sm font-black uppercase">
                      {p.local}
                    </p>
                    <p className="rounded-xl border border-sky-400/25 bg-sky-400/10 px-2 py-1 text-center text-sm font-black text-sky-300">
                      VS
                    </p>
                    <p className="truncate text-left text-sm font-black uppercase">
                      {p.visitante}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[34px] border border-emerald-500/20 bg-[#020714]/90 p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
                  Resultados
                </p>
                <h2 className="mt-2 text-3xl font-black uppercase">
                  Últimos marcadores
                </h2>
              </div>

              <Link href="/estadisticas" className="text-sm font-black uppercase text-emerald-300">
                Stats →
              </Link>
            </div>

            <div className="space-y-3">
              {ultimosResultados.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                  No hay resultados cargados.
                </p>
              ) : (
                ultimosResultados.map((p) => (
                  <Link
                    key={p.id}
                    href={
                      p.partido_id
                        ? `/estadisticas/${encodeURIComponent(p.partido_id)}`
                        : "/estadisticas"
                    }
                    className="grid grid-cols-[1fr_90px_1fr] items-center gap-3 rounded-2xl border border-emerald-500/15 bg-black/35 p-4 transition hover:border-emerald-400/40 hover:bg-emerald-400/10"
                  >
                    <p className="truncate text-right text-sm font-black uppercase">
                      {p.local}
                    </p>
                    <p className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-2 py-1 text-center text-lg font-black text-yellow-300">
                      {p.resultado}
                    </p>
                    <p className="truncate text-left text-sm font-black uppercase">
                      {p.visitante}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>
        </section>

        <SeparadorHome label="Explorar APA" />

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {accesos.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group min-h-[210px] rounded-[32px] border bg-gradient-to-br ${item.color} p-7 shadow-[0_16px_45px_rgba(0,0,0,.24)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,.34)]`}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-3xl transition group-hover:scale-110">
                {item.icon}
              </div>

              <h3 className="text-3xl font-black uppercase">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {item.desc}
              </p>
            </Link>
          ))}
        </section>

        <section className="rounded-[34px] border border-sky-500/20 bg-gradient-to-r from-blue-600/15 via-sky-500/10 to-purple-500/10 p-7 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-sky-300">
                Cómo usar la web
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
                Todo conectado
              </h2>

              <p className="mt-3 max-w-2xl text-sm text-zinc-400 md:text-base">
                Entrá a Competición para torneos y calendario, visitá Clubes para
                perfiles institucionales, Jugadores para rankings y
                Entretenimiento para participar con la comunidad.
              </p>
            </div>

            <Link
              href="/guia"
              className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-6 py-4 text-center text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black"
            >
              Abrir guía
            </Link>
          </div>
        </section>

        <HeroCarruselHome />
      </section>
    </main>
  );
}
