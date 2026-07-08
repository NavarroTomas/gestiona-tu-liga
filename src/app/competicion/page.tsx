"use client";

import Image from "next/image";
import Link from "next/link";

type Torneo = {
  eyebrow: string;
  titulo: string;
  descripcion: string;
  href: string;
  image: string;
  color: string;
  glow: string;
  accent: string;
  preview: string[];
  estado: "Activo" | "Próximamente";
};

type Acceso = {
  titulo: string;
  href: string;
  image: string;
  descripcion: string;
};

const torneos: Torneo[] = [
  {
    eyebrow: "Liga oficial",
    titulo: "Torneo de Liga",
    descripcion:
      "La competencia principal de APA PSO Argentina. Primera y Segunda División con tablas, puntos, ascensos y pelea por la gloria.",
    href: "/divisiones",
    image: "/images/competicion/liga.png",
    color: "border-sky-400/35 from-sky-500/15 to-blue-950/20",
    glow: "group-hover:shadow-[0_0_45px_rgba(56,189,248,.20)]",
    accent: "text-sky-300 border-sky-400/35 bg-sky-400/10",
    preview: ["Primera", "Segunda"],
    estado: "Activo",
  },
  {
    eyebrow: "Fase de grupos",
    titulo: "Clasificación a Copas",
    descripcion:
      "Cuatro grupos de cuatro equipos. Los dos primeros clasifican a Copa Argentina y los dos últimos clasifican a Copa APA.",
    href: "/competicion/copas",
    image: "/images/competicion/clasificacion.png",
    color: "border-yellow-400/35 from-yellow-500/15 to-orange-950/20",
    glow: "group-hover:shadow-[0_0_45px_rgba(250,204,21,.18)]",
    accent: "text-yellow-300 border-yellow-400/35 bg-yellow-400/10",
    preview: ["Grupo A", "Grupo B", "Grupo C", "Grupo D"],
    estado: "Activo",
  },
  {
    eyebrow: "Eliminatoria mayor",
    titulo: "Copa Argentina",
    descripcion:
      "La copa principal para los mejores clasificados de la fase de grupos. Cruces decisivos hasta coronar al campeón.",
    href: "/competicion/copa-argentina",
    image: "/images/competicion/copa-argentina.png",
    color: "border-emerald-400/35 from-emerald-500/15 to-cyan-950/20",
    glow: "group-hover:shadow-[0_0_45px_rgba(16,185,129,.18)]",
    accent: "text-emerald-300 border-emerald-400/35 bg-emerald-400/10",
    preview: ["Octavos", "Cuartos", "Semis", "Final"],
    estado: "Próximamente",
  },
  {
    eyebrow: "Eliminatoria APA",
    titulo: "Copa APA",
    descripcion:
      "La segunda copa de la temporada para los equipos que terminen terceros y cuartos en sus grupos clasificatorios.",
    href: "/competicion/copa-apa",
    image: "/images/competicion/copa-apa.png",
    color: "border-purple-400/35 from-purple-500/15 to-fuchsia-950/20",
    glow: "group-hover:shadow-[0_0_45px_rgba(168,85,247,.18)]",
    accent: "text-purple-300 border-purple-400/35 bg-purple-400/10",
    preview: ["Octavos", "Cuartos", "Semis", "Final"],
    estado: "Próximamente",
  },
  {
    eyebrow: "Ascenso y promoción",
    titulo: "Playoffs de Ascenso",
    descripcion:
      "Los equipos ubicados del 2° al 5° de Segunda juegan por el ascenso. El ganador disputa una promoción contra el anteúltimo de Primera.",
    href: "/competicion/playoffs",
    image: "/images/competicion/playoffs.png",
    color: "border-orange-400/35 from-orange-500/15 to-red-950/20",
    glow: "group-hover:shadow-[0_0_45px_rgba(251,146,60,.18)]",
    accent: "text-orange-300 border-orange-400/35 bg-orange-400/10",
    preview: ["2° vs 5°", "3° vs 4°", "Final", "Promoción"],
    estado: "Próximamente",
  },
  {
    eyebrow: "Torneo de campeones",
    titulo: "Copa de Campeones",
    descripcion:
      "El torneo más importante de la temporada: campeón de Primera, campeón de Segunda, campeón de Copa Argentina y campeón de Copa APA compiten por el título máximo.",
    href: "/competicion/copa-campeones",
    image: "/images/competicion/copa-campeones.png",
    color: "border-cyan-300/35 from-cyan-500/15 to-sky-950/20",
    glow: "group-hover:shadow-[0_0_45px_rgba(34,211,238,.20)]",
    accent: "text-cyan-200 border-cyan-300/35 bg-cyan-300/10",
    preview: ["Campeón 1ª", "Campeón 2ª", "Copa ARG", "Copa APA"],
    estado: "Próximamente",
  },
];

const accesos: Acceso[] = [
  {
    titulo: "Fixture",
    href: "/fixture",
    image: "/images/competicion/fixture.png",
    descripcion: "Fechas, horarios y partidos.",
  },
  {
    titulo: "Stats",
    href: "/estadisticas",
    image: "/images/competicion/stats.png",
    descripcion: "Estadísticas oficiales.",
  },
  {
    titulo: "Historia",
    href: "/historia",
    image: "/images/competicion/historia.png",
    descripcion: "Rankings y legado APA.",
  },
];

export default function CompeticionPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1500px] space-y-9 px-4 py-8 md:px-8">
        <section className="relative min-h-[520px] overflow-hidden rounded-[40px] border border-sky-500/30 bg-[#020714] shadow-[0_0_55px_rgba(0,120,255,.22)] md:min-h-[560px]">
          <Image
            src="/images/competicion-hero.png"
            alt="Final Copa Argentina APA"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_38%]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#020714]/94 via-[#020714]/42 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#020714]/70 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#020714]/35 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.12),transparent_48%)]" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="relative z-10 flex min-h-[520px] items-center p-7 md:min-h-[560px] md:p-10 lg:p-12">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.55em] text-sky-400">
                APA PSO Argentina
              </p>

              <h1 className="mt-5 text-5xl font-black uppercase italic leading-none md:text-7xl">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent drop-shadow-[0_8px_22px_rgba(0,0,0,.65)]">
                  Competición
                </span>
                <span className="block text-sky-400 drop-shadow-[0_0_22px_rgba(56,189,248,.55)]">
                  Oficial
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-200 drop-shadow-[0_4px_16px_rgba(0,0,0,.85)]">
                Ligas, copas, torneos de pretemporada y eventos oficiales. La
                zona competitiva reúne todas las competencias de APA PSO en un
                solo lugar.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-2xl border border-sky-400/40 bg-black/45 px-4 py-2 text-sm font-black uppercase text-sky-300 shadow-[0_0_18px_rgba(56,189,248,.15)] backdrop-blur-md">
                  🏆 Torneos
                </span>

                <span className="rounded-2xl border border-yellow-400/40 bg-black/45 px-4 py-2 text-sm font-black uppercase text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,.12)] backdrop-blur-md">
                  🏅 Copas
                </span>

                <span className="rounded-2xl border border-purple-400/40 bg-black/45 px-4 py-2 text-sm font-black uppercase text-purple-300 shadow-[0_0_18px_rgba(168,85,247,.12)] backdrop-blur-md">
                  ⭐ Eventos
                </span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Competencias
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
                Elegí un torneo
              </h2>
            </div>

            <p className="max-w-xl text-base leading-7 text-zinc-400">
              La liga y la clasificación a copas ya están disponibles. Copa Argentina, Copa APA y Copa de Campeones quedan preparadas para la fase eliminatoria.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {torneos.map((torneo) => (
              <Link
                key={torneo.titulo}
                href={torneo.href}
                className={`group relative min-h-[360px] overflow-hidden rounded-[36px] border bg-gradient-to-br ${torneo.color} p-6 transition duration-300 hover:-translate-y-1 ${torneo.glow}`}
              >
                <Image
                  src={torneo.image}
                  alt={torneo.titulo}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#020714]/96 via-[#020714]/76 to-[#020714]/34" />
                <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#020714]/96 via-[#020714]/72 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#020714]/60 to-transparent" />
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.14),transparent_38%)]" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-7 flex items-start justify-between gap-5">
                      <div>
                        <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${torneo.accent}`}>
                          {torneo.eyebrow}
                        </p>

                        <h3 className="mt-4 max-w-[760px] text-4xl font-black uppercase italic leading-tight drop-shadow-[0_6px_20px_rgba(0,0,0,.85)] md:text-[3.4rem]">
                          {torneo.titulo}
                        </h3>
                      </div>
                    </div>

                    <p className="max-w-2xl text-base leading-8 text-zinc-200 drop-shadow-[0_4px_16px_rgba(0,0,0,.9)]">
                      {torneo.descripcion}
                    </p>
                  </div>

                  <div className="mt-9">
                    <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {torneo.preview.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-white/15 bg-black/45 px-3 py-4 text-center shadow-[0_0_14px_rgba(0,0,0,.25)] backdrop-blur-md"
                        >
                          <p className="text-sm font-black uppercase text-zinc-100">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-black/50 px-4 py-3 shadow-[0_0_18px_rgba(0,0,0,.30)] backdrop-blur-md">
                      <span
                        className={`text-sm font-black uppercase tracking-[0.14em] ${
                          torneo.estado === "Activo"
                            ? "text-emerald-300"
                            : "text-yellow-300"
                        }`}
                      >
                        ● {torneo.estado}
                      </span>

                      <span className="text-base font-black uppercase text-sky-300 transition group-hover:translate-x-1">
                        Entrar →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/20 bg-[#020714]/90 p-6">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
              Accesos rápidos
            </p>

            <h2 className="mt-2 text-3xl font-black uppercase">
              Competición APA
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {accesos.map((acceso) => (
              <Link
                key={acceso.href}
                href={acceso.href}
                className="group relative min-h-[220px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-sky-400/35 hover:bg-sky-500/10"
              >
                <Image
                  src={acceso.image}
                  alt={acceso.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#020714]/96 via-[#020714]/58 to-[#020714]/15" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#020714]/75 via-transparent to-transparent" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

                <div className="relative z-10 flex h-full flex-col justify-end">
                  <h3 className="text-2xl font-black uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,.8)]">
                    {acceso.titulo}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-300 drop-shadow-[0_3px_12px_rgba(0,0,0,.85)]">
                    {acceso.descripcion}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
