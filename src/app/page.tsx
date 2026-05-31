"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import HeroImagenesHome from "../components/HeroImagenesHome";
import HeroCarruselHome from "../components/HeroCarruselHome";

function SeparadorHome({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-4">
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

  const equiposCantidad = new Set(
    partidos.flatMap((p) => [p.local, p.visitante]),
  ).size;

  const jugadoresCantidad = new Set(jugadores.map((j) => j.nombre)).size;
  const golesTotales = jugadores.reduce((acc, j) => acc + (j.goles || 0), 0);
  const destacado = partidos[0];

  const statsHome = [
    { label: "Equipos", value: equiposCantidad, icon: "🏟️", detail: "clubes activos" },
    { label: "Partidos", value: partidos.length, icon: "📅", detail: "en fixture" },
    { label: "Jugadores", value: jugadoresCantidad, icon: "⭐", detail: "competidores" },
    { label: "Goles", value: golesTotales, icon: "⚽", detail: "temporada" },
  ];

  const accesos = [
    {
      href: `/fixture/${division}`,
      title: "Fixture",
      desc: "Calendario completo, horarios y resultados oficiales.",
      icon: "📅",
      color: "from-sky-500/20 to-blue-950/20 border-sky-400/25",
    },
    {
      href: "/divisiones",
      title: "Tabla",
      desc: "Posiciones completas por división y temporada.",
      icon: "📊",
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
      desc: "Rankings, perfiles, MVP, goles y asistencias.",
      icon: "⭐",
      color: "from-yellow-500/20 to-blue-950/20 border-yellow-400/25",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] p-4 text-white md:p-6">
      <section className="mx-auto max-w-[1450px] space-y-10">
        <HeroImagenesHome />

        <section className="section-shell p-6 md:p-8">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.55em] text-sky-400">
                APA PSO ARGENTINA
              </p>

              <h1 className="text-gradient-apa text-4xl font-black leading-none md:text-6xl">
                Inicio oficial de la liga
              </h1>

              <p className="mt-4 max-w-2xl text-base text-zinc-300 md:text-lg">
                Todo lo importante de APA PSO en una portada limpia: competición
                actual, partido destacado y accesos principales.
              </p>
            </div>

            <div className="hidden justify-end lg:flex">
              <div className="h-44 w-44 animate-apa-float overflow-hidden rounded-[36px] border border-sky-400/35 bg-black/30 shadow-[0_0_55px_rgba(56,189,248,.28)]">
                <img
                  src="/logo-apa.png"
                  alt="APA PSO"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-black/25 p-5 backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Competición actual</h2>
              <p className="text-sm text-zinc-500">
                Filtrá la portada por división y temporada.
              </p>
            </div>

            <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">
              {temporada} · {division}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {["primera", "segunda", "tercera", "cuarta"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDivision(d)}
                  className={`rounded-2xl border px-5 py-3 text-sm font-black uppercase whitespace-nowrap transition-all ${
                    division === d
                      ? "border-blue-400 bg-blue-600 text-white shadow-[0_0_20px_rgba(0,120,255,.55)]"
                      : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
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
                  className={`rounded-2xl border px-5 py-3 text-sm font-black uppercase whitespace-nowrap transition-all ${
                    temporada === t
                      ? "border-sky-300 bg-sky-500 text-black shadow-[0_0_20px_rgba(56,189,248,.55)]"
                      : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
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
                  <h2 className="mt-2 text-4xl font-black leading-none md:text-5xl">
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

        <SeparadorHome label="Partido de la semana" />

        <section className="relative overflow-hidden rounded-[34px] border border-sky-400/25 bg-gradient-to-br from-[#071b3a] via-[#020714] to-black p-5 shadow-[0_0_45px_rgba(56,189,248,.14)] md:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.20),transparent_34%)]" />
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-sky-300">
                  {temporada} · {division}
                </p>

                <h2 className="mt-2 text-2xl font-black uppercase md:text-4xl">
                  Partido destacado
                </h2>
              </div>

              <a
                href={`/fixture/${division}`}
                className="btn-premium inline-flex justify-center px-5 py-3 text-xs font-black uppercase text-black"
              >
                Ver fixture
              </a>
            </div>

            {destacado ? (
              <>
                <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)]">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-center">
                    <p className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
                      Local
                    </p>

                    <h3 className="mx-auto max-w-[360px] break-words text-2xl font-black uppercase leading-tight md:text-3xl">
                      {destacado.local}
                    </h3>
                  </div>

                  <div className="mx-auto flex h-[92px] w-[110px] items-center justify-center rounded-[26px] bg-blue-600 text-center text-4xl font-black leading-none shadow-[0_0_34px_rgba(37,99,235,.55)]">
                    {destacado.resultado || "VS"}
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-center">
                    <p className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
                      Visitante
                    </p>

                    <h3 className="mx-auto max-w-[360px] break-words text-2xl font-black uppercase leading-tight md:text-3xl">
                      {destacado.visitante}
                    </h3>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-zinc-400">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                    Fecha {destacado.fecha}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                    {destacado.dia || "Día sin cargar"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                    {destacado.hora || "Hora sin cargar"}
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

        <section className="rounded-[34px] border border-sky-400/20 bg-gradient-to-r from-blue-600/15 via-sky-500/10 to-purple-500/10 p-7 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-sky-300">
                Temporada en curso
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
                Competencia activa
              </h2>

              <p className="mt-3 max-w-2xl text-sm text-zinc-400 md:text-base">
                La tabla completa, fixture detallado y últimos resultados están
                en sus secciones para que el Inicio se mantenga limpio.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/divisiones"
                className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-sm font-black uppercase transition hover:bg-sky-400 hover:text-black"
              >
                Ver divisiones
              </a>

              <a
                href={`/fixture/${division}`}
                className="rounded-2xl border border-blue-400/30 bg-blue-500/15 px-5 py-3 text-sm font-black uppercase transition hover:bg-blue-500"
              >
                Ver fixture
              </a>
            </div>
          </div>
        </section>

        <SeparadorHome label="Explorar APA" />

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {accesos.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`group min-h-[190px] rounded-[32px] border bg-gradient-to-br ${item.color} p-7 shadow-[0_16px_45px_rgba(0,0,0,.24)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,.34)]`}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-3xl transition group-hover:scale-110">
                {item.icon}
              </div>

              <h3 className="text-3xl font-black">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {item.desc}
              </p>
            </a>
          ))}
        </section>

        <HeroCarruselHome />
      </section>
    </main>
  );
}
