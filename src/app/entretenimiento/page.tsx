"use client";

import Link from "next/link";

export default function EntretenimientoPage() {
  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
                APA PSO ARGENTINA
              </p>

              <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Entretenimiento
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                  Comunidad
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-zinc-400">
                Zona interactiva de APA PSO Argentina UE5. Pronosticá partidos,
                armá tu Dream Team 8v8 y participá con la comunidad.
              </p>
            </div>

            <div className="hidden lg:flex h-40 w-40 items-center justify-center rounded-full border border-sky-400/40 bg-black/40 shadow-[0_0_35px_rgba(0,120,255,.45)]">
              <span className="text-6xl">🎮</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Link
            href="/entretenimiento/predicciones"
            className="group relative overflow-hidden rounded-[38px] border border-yellow-400/30 bg-[#020714] p-7 md:p-8 min-h-[360px] transition hover:scale-[1.01] hover:border-yellow-300/70 hover:shadow-[0_0_45px_rgba(250,204,21,.16)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_42%)]" />
            <div className="absolute -right-10 -bottom-10 text-[180px] opacity-10">
              🎯
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-yellow-300 text-xs uppercase tracking-[0.35em] font-black">
                  Próximamente
                </p>

                <h2 className="mt-5 text-5xl md:text-6xl font-black uppercase italic">
                  Predicciones
                </h2>

                <p className="mt-5 text-zinc-400 max-w-xl">
                  Elegí quién gana cada partido antes de que se juegue. Local,
                  empate o visitante. Después se podrán ver porcentajes y ranking
                  de pronosticadores.
                </p>
              </div>

              <div className="mt-8 rounded-3xl border border-yellow-400/25 bg-yellow-400/10 p-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-black/35 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                      Local
                    </p>
                    <p className="mt-2 text-2xl font-black text-yellow-300">1</p>
                  </div>

                  <div className="rounded-2xl bg-black/35 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                      Empate
                    </p>
                    <p className="mt-2 text-2xl font-black text-yellow-300">X</p>
                  </div>

                  <div className="rounded-2xl bg-black/35 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                      Visita
                    </p>
                    <p className="mt-2 text-2xl font-black text-yellow-300">2</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between rounded-2xl border border-yellow-400/25 bg-black/35 px-5 py-4">
                <span className="text-yellow-300 text-sm font-black uppercase tracking-[0.22em]">
                  Entrar
                </span>
                <span className="text-yellow-300 text-2xl transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/entretenimiento/dream-team"
            className="group relative overflow-hidden rounded-[38px] border border-sky-400/30 bg-[#020714] p-7 md:p-8 min-h-[360px] transition hover:scale-[1.01] hover:border-sky-300/70 hover:shadow-[0_0_45px_rgba(56,189,248,.16)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
            <div className="absolute -right-10 -bottom-10 text-[180px] opacity-10">
              ⭐
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <p className="text-sky-300 text-xs uppercase tracking-[0.35em] font-black">
                  Formación 8v8
                </p>

                <h2 className="mt-5 text-5xl md:text-6xl font-black uppercase italic">
                  Dream Team
                </h2>

                <p className="mt-5 text-zinc-400 max-w-xl">
                  Armá el equipo ideal de la temporada con la formación oficial:
                  GK, LB, CB, RB, LCM, RCM, LST y RST.
                </p>
              </div>

              <div className="mt-8 rounded-3xl border border-sky-400/25 bg-sky-400/10 p-5">
                <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-green-900/40 to-green-950/20 p-5">
                  <div className="grid grid-cols-2 gap-3 max-w-[260px] mx-auto">
                    <div className="rounded-xl bg-black/45 p-2 text-center text-xs font-black text-sky-300">LST</div>
                    <div className="rounded-xl bg-black/45 p-2 text-center text-xs font-black text-sky-300">RST</div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 max-w-[210px] mx-auto">
                    <div className="rounded-xl bg-black/45 p-2 text-center text-xs font-black text-sky-300">LCM</div>
                    <div className="rounded-xl bg-black/45 p-2 text-center text-xs font-black text-sky-300">RCM</div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 max-w-[330px] mx-auto">
                    <div className="rounded-xl bg-black/45 p-2 text-center text-xs font-black text-sky-300">LB</div>
                    <div className="rounded-xl bg-black/45 p-2 text-center text-xs font-black text-sky-300">CB</div>
                    <div className="rounded-xl bg-black/45 p-2 text-center text-xs font-black text-sky-300">RB</div>
                  </div>

                  <div className="mt-6 max-w-[90px] mx-auto rounded-xl bg-black/45 p-2 text-center text-xs font-black text-yellow-300">
                    GK
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between rounded-2xl border border-sky-400/25 bg-black/35 px-5 py-4">
                <span className="text-sky-300 text-sm font-black uppercase tracking-[0.22em]">
                  Entrar
                </span>
                <span className="text-sky-300 text-2xl transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
