"use client";

import Link from "next/link";

export default function PlayoffsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#3b1607_0%,#081427_28%,#020714_58%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1400px] space-y-8 px-4 py-8 md:px-8">
        <section className="relative min-h-[430px] overflow-hidden rounded-[42px] border border-orange-400/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(251,146,60,.18)] md:p-10">
          <img
            src="/images/competicion/playoffs.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020714]/96 via-[#020714]/78 to-[#020714]/35" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020714] to-transparent" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="relative z-10 flex min-h-[380px] items-center">
            <div className="max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-300">
                APA PSO Argentina · Ascenso
              </p>
              <h1 className="mt-5 text-[clamp(3rem,9vw,7rem)] font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-700 bg-clip-text text-transparent">
                  Playoffs
                </span>
                <span className="block text-orange-300 drop-shadow-[0_0_24px_rgba(251,146,60,.55)]">
                  de Ascenso
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
                Del 2° al 5° de Segunda División pelean por llegar a la final de ascenso.
                El ganador juega la promoción contra el anteúltimo de Primera.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/fixture/playoffs?temporada=Temporada%204" className="rounded-2xl border border-orange-300/35 bg-orange-300 px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-white">
                  Ver fixture
                </Link>
                <Link href="/estadisticas" className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black">
                  Ver estadísticas
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Semifinal 1", "2° Segunda vs 5° Segunda"],
            ["Semifinal 2", "3° Segunda vs 4° Segunda"],
            ["Final Ascenso", "Ganador SF1 vs Ganador SF2"],
            ["Promoción", "Ganador Final vs Anteúltimo Primera"],
          ].map(([title, desc]) => (
            <article key={title} className="rounded-[30px] border border-orange-400/20 bg-[#020714]/95 p-6 shadow-[0_0_30px_rgba(251,146,60,.10)]">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-300">{title}</p>
              <h2 className="mt-4 text-2xl font-black uppercase leading-tight text-white">{desc}</h2>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
