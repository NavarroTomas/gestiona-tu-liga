"use client";

import Link from "next/link";

const torneos = [
  {
    eyebrow: "Liga oficial",
    titulo: "Torneo de Liga",
    descripcion:
      "La competencia principal de APA PSO Argentina. Primera y Segunda División con tablas, puntos, ascensos y pelea por la gloria.",
    href: "/divisiones",
    color: "border-sky-400/30 from-sky-500/15 to-blue-950/20",
    glow: "group-hover:shadow-[0_0_45px_rgba(56,189,248,.18)]",
    icon: "🏆",
    preview: ["Primera", "Segunda"],
    estado: "Activo",
  },
  {
    eyebrow: "Eliminación directa",
    titulo: "Copa APA",
    descripcion:
      "Formato de copa para duelos decisivos. Cruces, fases eliminatorias y partidos donde no hay margen de error.",
    href: "/competicion/copa",
    color: "border-yellow-400/30 from-yellow-500/15 to-orange-950/20",
    glow: "group-hover:shadow-[0_0_45px_rgba(250,204,21,.16)]",
    icon: "🏅",
    preview: ["Octavos", "Cuartos", "Semis", "Final"],
    estado: "Próximamente",
  },
  {
    eyebrow: "Preparación",
    titulo: "Pretemporada",
    descripcion:
      "Torneos preparatorios, pruebas de planteles y partidos especiales antes del inicio de la temporada oficial.",
    href: "/competicion/pretemporada",
    color: "border-emerald-400/30 from-emerald-500/15 to-cyan-950/20",
    glow: "group-hover:shadow-[0_0_45px_rgba(16,185,129,.16)]",
    icon: "🔥",
    preview: ["Amistosos", "Grupos", "Pruebas", "Final"],
    estado: "Próximamente",
  },
  {
    eyebrow: "Campeón vs campeón",
    titulo: "Supercopa",
    descripcion:
      "El choque especial entre campeones. Una final premium para abrir o cerrar ciclos competitivos dentro de APA.",
    href: "/competicion/supercopa",
    color: "border-purple-400/30 from-purple-500/15 to-fuchsia-950/20",
    glow: "group-hover:shadow-[0_0_45px_rgba(168,85,247,.16)]",
    icon: "⭐",
    preview: ["Campeón Liga", "Campeón Copa", "Final única"],
    estado: "Próximamente",
  },
];

const accesos = [
  {
    titulo: "Fixture",
    href: "/fixture",
    icon: "📅",
    descripcion: "Fechas, horarios y partidos.",
  },
  {
    titulo: "Stats",
    href: "/estadisticas",
    icon: "📊",
    descripcion: "Estadísticas oficiales.",
  },
  {
    titulo: "Historia",
    href: "/historia",
    icon: "📚",
    descripcion: "Rankings y legado APA.",
  },
];

export default function CompeticionPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1500px] space-y-9 px-4 py-8 md:px-8">
        <section className="relative overflow-hidden rounded-[40px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.22)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.20),transparent_42%)]" />
          <div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/30" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_330px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.55em] text-sky-400">
                APA PSO Argentina
              </p>

              <h1 className="mt-5 text-5xl font-black uppercase italic leading-none md:text-7xl">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Competición
                </span>
                <span className="block text-sky-400 drop-shadow-[0_0_22px_rgba(56,189,248,.55)]">
                  Oficial
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                Ligas, copas, torneos de pretemporada y eventos oficiales. La
                zona competitiva reúne todas las competencias de APA PSO en un
                solo lugar.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-black uppercase text-sky-300">
                  🏆 Torneos
                </span>

                <span className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black uppercase text-yellow-300">
                  🏅 Copas
                </span>

                <span className="rounded-2xl border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-sm font-black uppercase text-purple-300">
                  ⭐ Eventos
                </span>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative rounded-[34px] border border-sky-400/25 bg-black/35 p-6 shadow-[0_0_38px_rgba(56,189,248,.18)]">
                <div className="absolute -inset-5 rounded-full bg-sky-400/10 blur-3xl" />

                <div className="relative z-10 text-center">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[32px] border border-sky-400/30 bg-sky-400/10 text-6xl">
                    🏆
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-sky-300">
                    Centro competitivo
                  </p>

                  <h2 className="mt-2 text-3xl font-black uppercase">
                    APA League Hub
                  </h2>
                </div>
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
              La liga principal ya está disponible. Las demás competencias
              quedan preparadas para activar cuando APA las necesite.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {torneos.map((torneo) => (
              <Link
                key={torneo.titulo}
                href={torneo.href}
                className={`group relative min-h-[360px] overflow-hidden rounded-[36px] border bg-gradient-to-br ${torneo.color} p-6 transition duration-300 hover:-translate-y-1 ${torneo.glow}`}
              >
                <div className="absolute inset-0 bg-[#020714]/70" />
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.16),transparent_38%)]" />
                <div className="absolute -bottom-20 -right-16 text-[180px] opacity-[0.06] transition group-hover:scale-110">
                  {torneo.icon}
                </div>

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-7 flex items-start justify-between gap-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-sky-300">
                          {torneo.eyebrow}
                        </p>

                        <h3 className="mt-4 text-4xl font-black uppercase italic leading-tight md:text-[3.4rem]">
                          {torneo.titulo}
                        </h3>
                      </div>

                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-3xl">
                        {torneo.icon}
                      </div>
                    </div>

                    <p className="max-w-2xl text-base leading-8 text-zinc-300">
                      {torneo.descripcion}
                    </p>
                  </div>

                  <div className="mt-9">
                    <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {torneo.preview.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-white/10 bg-black/35 px-3 py-4 text-center"
                        >
                          <p className="text-sm font-bold uppercase text-zinc-200">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
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
                className="group rounded-[28px] border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-sky-400/35 hover:bg-sky-500/10"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-2xl transition group-hover:scale-110">
                  {acceso.icon}
                </div>

                <h3 className="text-2xl font-black uppercase">
                  {acceso.titulo}
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  {acceso.descripcion}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
