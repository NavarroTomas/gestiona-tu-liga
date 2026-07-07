"use client";

import { useState } from "react";

const temporadas = ["Temporada 4"];

const competencias = [
  {
    id: "liga",
    eyebrow: "Torneo oficial",
    titulo: "Torneo de Liga",
    descripcion: "Fixture de Primera y Segunda División del torneo principal de APA.",
    icon: "🏆",
    color: "border-sky-400/30 from-sky-500/18 to-blue-950/30",
    opciones: [
      {
        nombre: "Primera División",
        slug: "primera",
        detalle: "Elite competitiva",
        icon: "🏆",
      },
      {
        nombre: "Segunda División",
        slug: "segunda",
        detalle: "Ascenso en juego",
        icon: "🥈",
      },
    ],
  },
  {
    id: "copas",
    eyebrow: "Fase de grupos",
    titulo: "Clasificación a Copas",
    descripcion: "Fixture de los grupos A, B, C y D. Define clasificados a Copa Argentina y Copa APA.",
    icon: "🏅",
    color: "border-yellow-400/30 from-yellow-500/18 to-orange-950/30",
    opciones: [
      { nombre: "Grupo A", slug: "grupo-a", detalle: "Clasificación", icon: "A" },
      { nombre: "Grupo B", slug: "grupo-b", detalle: "Clasificación", icon: "B" },
      { nombre: "Grupo C", slug: "grupo-c", detalle: "Clasificación", icon: "C" },
      { nombre: "Grupo D", slug: "grupo-d", detalle: "Clasificación", icon: "D" },
    ],
  },
];

const infoCards = [
  {
    icon: "1",
    titulo: "Elegí temporada",
    texto: "Seleccioná el ciclo competitivo que querés consultar.",
  },
  {
    icon: "2",
    titulo: "Elegí competencia",
    texto: "Entrá al fixture de Liga o a la Clasificación a Copas.",
  },
  {
    icon: "3",
    titulo: "Consultá fechas",
    texto: "Revisá jornadas, horarios, resultados y estadísticas disponibles.",
  },
];

export default function FixtureHome() {
  const [temporada, setTemporada] = useState("Temporada 4");

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
                Calendario oficial de Liga y Clasificación a Copas. Elegí la temporada, la competencia y después la categoría o grupo.
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
              La temporada seleccionada se usará para todos los fixtures disponibles.
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

        <section className="space-y-8">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Paso 2 · {temporada}
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
                Elegí competencia
              </h2>
            </div>

            <p className="max-w-xl text-base leading-7 text-zinc-400">
              Liga y Clasificación a Copas conviven en el mismo calendario, sin mezclarse.
            </p>
          </div>

          {competencias.map((competencia) => (
            <section
              key={competencia.id}
              className={`relative overflow-hidden rounded-[38px] border bg-gradient-to-br ${competencia.color} p-6 shadow-[0_16px_45px_rgba(0,0,0,.24)]`}
            >
              <div className="absolute inset-0 bg-[#020714]/70" />
              <div className="absolute -bottom-16 -right-12 text-[170px] opacity-[0.06]">
                {competencia.icon}
              </div>

              <div className="relative z-10">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                      {competencia.eyebrow}
                    </p>

                    <h3 className="mt-3 text-4xl font-black uppercase italic md:text-5xl">
                      {competencia.titulo}
                    </h3>

                    <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
                      {competencia.descripcion}
                    </p>
                  </div>

                  <span className="w-fit rounded-full border border-green-400/25 bg-green-400/10 px-4 py-2 text-xs font-black uppercase text-green-300">
                    {temporada}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {competencia.opciones.map((opcion) => (
                    <a
                      key={opcion.slug}
                      href={fixtureHref(opcion.slug)}
                      className="group rounded-[28px] border border-white/10 bg-black/35 p-5 transition hover:-translate-y-1 hover:border-sky-400/40 hover:bg-sky-500/10"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl font-black text-sky-300">
                          {opcion.icon}
                        </div>

                        <span className="text-2xl text-sky-300 transition group-hover:translate-x-1">
                          →
                        </span>
                      </div>

                      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                        {opcion.detalle}
                      </p>

                      <h4 className="mt-2 text-2xl font-black uppercase">
                        {opcion.nombre}
                      </h4>

                      <p className="mt-4 text-sm font-black uppercase text-sky-300">
                        Ver calendario
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          ))}
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
