"use client";

import { useState } from "react";

const temporadas = [
  "Temporada 1",
  "Temporada 2",
  "Temporada 3",
  "Temporada 4",
  "Temporada 5",
];

const divisiones = [
  {
    nombre: "Primera División",
    slug: "primera",
    color: "border-sky-400/30 from-sky-500/18 to-blue-950/30",
    icon: "🏆",
    descripcion: "Fixture oficial de la máxima categoría del Torneo de Liga APA.",
    detalle: "Elite competitiva",
  },
  {
    nombre: "Segunda División",
    slug: "segunda",
    color: "border-cyan-400/30 from-cyan-500/18 to-blue-950/30",
    icon: "🥈",
    descripcion: "Calendario completo de la segunda categoría oficial.",
    detalle: "Ascenso en juego",
  },
  {
    nombre: "Tercera División",
    slug: "tercera",
    color: "border-indigo-400/30 from-indigo-500/18 to-blue-950/30",
    icon: "🥉",
    descripcion: "Fixture completo de la tercera categoría competitiva.",
    detalle: "Camino al ascenso",
  },
  {
    nombre: "Cuarta División",
    slug: "cuarta",
    color: "border-purple-400/30 from-purple-500/18 to-blue-950/30",
    icon: "⭐",
    descripcion: "Calendario de la cuarta categoría del sistema de liga.",
    detalle: "Nueva generación",
  },
];

const infoCards = [
  {
    icon: "1",
    titulo: "Elegí temporada",
    texto: "Primero seleccioná el ciclo competitivo que querés consultar.",
  },
  {
    icon: "2",
    titulo: "Elegí categoría",
    texto: "Después entrá al fixture de Primera, Segunda, Tercera o Cuarta.",
  },
  {
    icon: "3",
    titulo: "Consultá partidos",
    texto: "Revisá jornadas, horarios, resultados y acceso a estadísticas.",
  },
];

export default function FixtureHome() {
  const [temporada, setTemporada] = useState("Temporada 5");

  function fixtureHref(slug: string) {
    return `/fixture/${slug}?temporada=${encodeURIComponent(temporada)}`;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1500px] space-y-9 px-4 py-8 md:px-8">
        <section className="relative overflow-hidden rounded-[40px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.22)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.22),transparent_42%)]" />
          <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/30" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_330px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
                Competición · Calendario
              </p>

              <h1 className="mt-5 text-5xl font-black uppercase italic leading-none md:text-7xl">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Fixture
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_22px_rgba(56,189,248,.55)]">
                  Oficial APA
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                Calendario oficial del Torneo de Liga APA. Primero elegí la
                temporada y después ingresá al fixture de cada categoría.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="/competicion"
                  className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400/20"
                >
                  ← Volver a competición
                </a>

                <a
                  href="/divisiones"
                  className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black uppercase text-yellow-300 transition hover:bg-yellow-400/20"
                >
                  🏆 Ver Torneo
                </a>

                <span className="rounded-2xl border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-black uppercase text-green-300">
                  ● Calendario activo
                </span>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative rounded-[34px] border border-sky-400/25 bg-black/35 p-6 shadow-[0_0_38px_rgba(56,189,248,.18)]">
                <div className="absolute -inset-5 rounded-full bg-sky-400/10 blur-3xl" />

                <div className="relative z-10 text-center">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[32px] border border-sky-400/30 bg-sky-400/10 text-6xl">
                    📅
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-sky-300">
                    Calendario oficial
                  </p>

                  <h2 className="mt-2 text-3xl font-black uppercase">
                    APA Matchday
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/20 bg-[#020714]/90 p-6 shadow-[0_0_35px_rgba(0,120,255,.10)]">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Paso 1
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
                Elegí temporada
              </h2>
            </div>

            <p className="max-w-xl text-base leading-7 text-zinc-400">
              La temporada seleccionada se usará para entrar al fixture de cada
              categoría.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {temporadas.map((temp) => (
              <button
                key={temp}
                onClick={() => setTemporada(temp)}
                className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                  temporada === temp
                    ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_24px_rgba(56,189,248,.45)]"
                    : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white"
                }`}
              >
                {temp}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Paso 2 · {temporada}
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
                Elegí categoría
              </h2>
            </div>

            <p className="max-w-xl text-base leading-7 text-zinc-400">
              Entrá a la división correspondiente para ver jornadas, partidos y
              resultados de {temporada}.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {divisiones.map((d) => (
              <a
                key={d.slug}
                href={fixtureHref(d.slug)}
                className={`group relative min-h-[350px] overflow-hidden rounded-[36px] border bg-gradient-to-br ${d.color} p-6 shadow-[0_16px_45px_rgba(0,0,0,.24)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_45px_rgba(56,189,248,.16)]`}
              >
                <div className="absolute inset-0 bg-[#020714]/62" />
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.16),transparent_38%)]" />
                <div className="absolute -bottom-14 -right-10 text-[140px] opacity-[0.07] transition group-hover:scale-110">
                  {d.icon}
                </div>

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-7 flex items-start justify-between gap-5">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-3xl">
                        {d.icon}
                      </div>

                      <span className="rounded-full border border-green-400/25 bg-green-400/10 px-3 py-1 text-xs font-black uppercase text-green-300">
                        {temporada}
                      </span>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-sky-300">
                      {d.detalle}
                    </p>

                    <h2 className="mt-4 text-3xl font-black uppercase italic leading-tight md:text-4xl">
                      {d.nombre}
                    </h2>

                    <p className="mt-5 text-base leading-7 text-zinc-300">
                      {d.descripcion}
                    </p>
                  </div>

                  <div className="mt-9 flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-4">
                    <span className="text-sm font-black uppercase text-zinc-200">
                      Ver calendario
                    </span>

                    <span className="text-2xl text-sky-300 transition group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/20 bg-[#020714]/90 p-6">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
              Información del fixture
            </p>

            <h2 className="mt-2 text-3xl font-black uppercase">
              Cómo funciona el calendario
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {infoCards.map((card) => (
              <div
                key={card.titulo}
                className="group rounded-[28px] border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-sky-400/35 hover:bg-sky-500/10"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-2xl font-black text-sky-300 transition group-hover:scale-110">
                  {card.icon}
                </div>

                <h3 className="text-2xl font-black uppercase">
                  {card.titulo}
                </h3>

                <p className="mt-3 text-base leading-7 text-zinc-400">
                  {card.texto}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
