"use client";

import Image from "next/image";
import Link from "next/link";

const temporadas = [
  {
    label: "Temporada 4",
    href: "/fixture?temporada=Temporada%204",
  },
];

const competencias = [
  {
    eyebrow: "Torneo regular",
    titulo: "Torneo de Liga",
    descripcion:
      "Primera y Segunda División con calendario oficial, resultados y partidos programados.",
    image: "/images/fixture/liga.png",
    color: "border-sky-400/35",
    accent: "text-sky-300",
    glow: "hover:shadow-[0_0_42px_rgba(56,189,248,.18)]",
    badge: "Temporada 4",
    items: [
      {
        titulo: "Primera División",
        texto: "Ver calendario",
        href: "/fixture/primera?temporada=Temporada%204",
      },
      {
        titulo: "Segunda División",
        texto: "Ver calendario",
        href: "/fixture/segunda?temporada=Temporada%204",
      },
    ],
  },
  {
    eyebrow: "Fase de grupos y Copas",
    titulo: "Copas Oficiales",
    descripcion:
      "Fase de Grupos (A, B, C y D). Los dos primeros van a Copa Argentina y los dos últimos a Copa APA.",
    image: "/images/fixture/clasificacion.png",
    color: "border-yellow-400/35",
    accent: "text-yellow-300",
    glow: "hover:shadow-[0_0_42px_rgba(250,204,21,.16)]",
    badge: "Temporada 4",
    items: [
      {
        titulo: "Grupo A",
        texto: "Ver calendario",
        href: "/fixture/grupo-a?temporada=Temporada%204",
      },
      {
        titulo: "Grupo B",
        texto: "Ver calendario",
        href: "/fixture/grupo-b?temporada=Temporada%204",
      },
      {
        titulo: "Grupo C",
        texto: "Ver calendario",
        href: "/fixture/grupo-c?temporada=Temporada%204",
      },
      {
        titulo: "Grupo D",
        texto: "Ver calendario",
        href: "/fixture/grupo-d?temporada=Temporada%204",
      },
      {
        titulo: "Copa Argentina",
        texto: "Ver Fixture",
        href: "/fixture/copa-argentina?temporada=Temporada%204",
        destacado: true,
      },
      {
        titulo: "Copa APA",
        texto: "Ver Fixture",
        href: "/fixture/copa-apa?temporada=Temporada%204",
        destacado: true,
      },
    ],
  },
  {
    eyebrow: "Ascenso y promoción",
    titulo: "Playoffs de Ascenso",
    descripcion:
      "2° al 5° de Segunda juegan por el ascenso. El ganador define la promoción contra el anteúltimo de Primera.",
    image: "/images/fixture/playoffs.png",
    color: "border-orange-400/35",
    accent: "text-orange-300",
    glow: "hover:shadow-[0_0_42px_rgba(251,146,60,.18)]",
    badge: "Temporada 4",
    items: [
      {
        titulo: "Semifinales",
        texto: "Ver cruces",
        href: "/fixture/playoffs?temporada=Temporada%204&fase=Semifinal",
      },
      {
        titulo: "Final Ascenso",
        texto: "Ver final",
        href: "/fixture/playoffs?temporada=Temporada%204&fase=Final%20Ascenso",
      },
      {
        titulo: "Promoción",
        texto: "Ver promoción",
        href: "/fixture/playoffs?temporada=Temporada%204&fase=Promoción",
      },
    ],
  },
  {
    eyebrow: "Máxima final",
    titulo: "Copa de Campeones",
    descripcion:
      "Campeón de Primera, campeón de Segunda, campeón de Copa Argentina y campeón de Copa APA. Semifinales y final por el título máximo.",
    image: "/images/fixture/copa-campeones.png",
    color: "border-cyan-300/35",
    accent: "text-cyan-200",
    glow: "hover:shadow-[0_0_42px_rgba(34,211,238,.18)]",
    badge: "Temporada 4",
    items: [
      {
        titulo: "Semifinales",
        texto: "Ver cruces",
        href: "/fixture/copa-campeones?temporada=Temporada%204&fase=Semifinal",
      },
      {
        titulo: "Final",
        texto: "Ver final",
        href: "/fixture/copa-campeones?temporada=Temporada%204&fase=Final",
      },
    ],
  },
];

const pasos = [
  {
    numero: "1",
    titulo: "Elegí temporada",
    texto: "Seleccioná el ciclo competitivo que querés consultar.",
  },
  {
    numero: "2",
    titulo: "Elegí competencia",
    texto: "Entrá a Liga o Clasificación según el calendario que buscás.",
  },
  {
    numero: "3",
    titulo: "Consultá fechas",
    texto: "Revisá partidos, horarios, resultados y estadísticas cargadas.",
  },
];

export default function FixturePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1500px] space-y-7 px-4 py-6 md:px-8 md:py-8">
        <section className="relative min-h-[330px] overflow-hidden rounded-[36px] border border-sky-500/30 bg-[#020714] shadow-[0_0_55px_rgba(0,120,255,.18)] md:min-h-[390px]">
          <Image
            src="/images/fixture/fixture.png"
            alt="Fixture oficial APA"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#020714]/96 via-[#020714]/74 to-[#020714]/18" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#020714]/85 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.14),transparent_46%)]" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="relative z-10 flex min-h-[330px] items-center p-6 md:min-h-[390px] md:p-10 lg:p-12">
            <div className="max-w-4xl">
              <p className="text-[10px] font-black uppercase tracking-[0.42em] text-sky-400 md:text-xs">
                Competición · Calendario
              </p>

              <h1 className="mt-4 text-[clamp(2.4rem,8vw,5.8rem)] font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent drop-shadow-[0_8px_22px_rgba(0,0,0,.75)]">
                  Fixture
                </span>
                <span className="block text-sky-400 drop-shadow-[0_0_22px_rgba(56,189,248,.55)]">
                  Oficial APA
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-200 drop-shadow-[0_4px_16px_rgba(0,0,0,.9)] md:text-lg md:leading-8">
                Calendario oficial de Liga, Clasificación a Copas, Copa Argentina, Copa APA, Copa de Campeones y Playoffs.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/competicion"
                  className="rounded-2xl border border-white/15 bg-black/45 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_0_18px_rgba(255,255,255,.08)] backdrop-blur-md transition hover:border-sky-400/50 hover:text-sky-300"
                >
                  ← Volver a competición
                </Link>

                <Link
                  href="/divisiones"
                  className="rounded-2xl border border-yellow-400/35 bg-yellow-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,.10)] backdrop-blur-md transition hover:bg-yellow-400 hover:text-black"
                >
                  🏆 Ver torneo
                </Link>

                <span className="rounded-2xl border border-green-400/35 bg-green-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-green-300 shadow-[0_0_18px_rgba(74,222,128,.10)] backdrop-blur-md">
                  ● Calendario activo
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[28px] border border-sky-500/25 bg-[#020714] shadow-[0_0_35px_rgba(0,120,255,.10)]">
          <Image
            src="/images/fixture/temporada.png"
            alt="Elegir temporada"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020714]/96 via-[#020714]/78 to-[#020714]/42" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="relative z-10 grid gap-5 p-5 md:grid-cols-[1fr_1.2fr] md:p-7">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-sky-300">
                Paso 1
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase italic md:text-5xl">
                Elegí temporada
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              {temporadas.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl border border-sky-300/50 bg-gradient-to-b from-sky-400 to-blue-700 px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_0_24px_rgba(56,189,248,.35)] transition hover:scale-[1.02]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Paso 2 · Temporada 4
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
                Elegí competencia
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-zinc-400 md:text-base">
              Liga, Clasificación a Copas y Fases Eliminatorias conviven en el mismo calendario oficial.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {competencias.map((competencia) => (
              <article
                key={competencia.titulo}
                className={`group relative min-h-[430px] overflow-hidden rounded-[32px] border ${competencia.color} bg-[#020714] shadow-[0_0_30px_rgba(0,0,0,.35)] transition duration-300 hover:-translate-y-1 ${competencia.glow}`}
              >
                <Image
                  src={competencia.image}
                  alt={competencia.titulo}
                  fill
                  sizes="(max-width: 1280px) 100vw, 50vw"
                  className="object-cover object-center transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#020714]/96 via-[#020714]/72 to-[#020714]/30" />
                <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#020714]/95 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.10),transparent_38%)] opacity-0 transition group-hover:opacity-100" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

                <div className="relative z-10 flex min-h-[430px] flex-col justify-between p-5 md:p-7">
                  <div>
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-xs font-black uppercase tracking-[0.25em] ${competencia.accent}`}>
                          {competencia.eyebrow}
                        </p>
                        <h3 className="mt-4 max-w-[700px] text-[clamp(2rem,6vw,4.2rem)] font-black uppercase italic leading-none text-white drop-shadow-[0_8px_22px_rgba(0,0,0,.75)]">
                          {competencia.titulo}
                        </h3>
                      </div>

                      <span className="rounded-full border border-green-400/30 bg-green-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-green-300 backdrop-blur-md">
                        {competencia.badge}
                      </span>
                    </div>

                    <p className="max-w-2xl text-sm leading-7 text-zinc-200 drop-shadow-[0_4px_16px_rgba(0,0,0,.85)] md:text-base">
                      {competencia.descripcion}
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3">
                    {competencia.items.map((item: any) => (
                      <Link
                        key={item.titulo}
                        href={item.href}
                        className={`group/item rounded-2xl border p-4 backdrop-blur-md transition ${
                          item.destacado
                            ? "border-yellow-400/50 bg-yellow-400/15 hover:border-yellow-300 hover:bg-yellow-400/25"
                            : "border-white/12 bg-black/48 hover:border-sky-400/45 hover:bg-sky-400/10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-[0.18em] ${item.destacado ? "text-yellow-300" : "text-zinc-500"}`}>
                            {item.destacado ? "Copa Oficial" : "Calendario"}
                          </span>
                          <span className="text-sky-300 transition group-hover/item:translate-x-1">→</span>
                        </div>
                        <p className={`mt-3 text-sm font-black uppercase ${item.destacado ? "text-yellow-300" : "text-white"}`}>
                          {item.titulo}
                        </p>
                        <p className={`mt-1 text-[11px] font-bold uppercase tracking-[0.14em] ${item.destacado ? "text-yellow-400" : "text-sky-300"}`}>
                          {item.texto}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-sky-500/20 bg-[#020714]/90 p-5 shadow-[0_0_30px_rgba(0,120,255,.10)] md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
            Calendario
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase md:text-4xl">
            Cómo funciona el fixture
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {pasos.map((paso) => (
              <div
                key={paso.numero}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/35 bg-sky-400/10 text-sm font-black text-sky-300">
                  {paso.numero}
                </div>
                <h3 className="mt-4 text-lg font-black uppercase text-white">
                  {paso.titulo}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {paso.texto}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}