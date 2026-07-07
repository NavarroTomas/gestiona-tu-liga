"use client";

import Link from "next/link";

const cruces = [
  { fase: "Semifinal 1", local: "Campeón Primera", visitante: "Campeón Copa APA" },
  { fase: "Semifinal 2", local: "Campeón Segunda", visitante: "Campeón Copa Argentina" },
  { fase: "Final", local: "Ganador SF1", visitante: "Ganador SF2" },
];

export default function CopaCampeonesPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-[1400px] space-y-8">
        <Link href="/competicion" className="inline-flex rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black">
          ← Volver a competición
        </Link>

        <section className="relative overflow-hidden rounded-[40px] border border-cyan-300/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(34,211,238,.20)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/25" />

          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.45em] text-cyan-300">Torneo máximo APA</p>
            <h1 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-7xl">
              <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">Copa de</span>
              <span className="block text-cyan-300 drop-shadow-[0_0_22px_rgba(34,211,238,.55)]">Campeones</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
              Participan el campeón de Primera División, campeón de Segunda División, campeón de Copa Argentina y campeón de Copa APA. Dos semifinales y una final para definir al campeón máximo de la temporada.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {cruces.map((cruce) => (
            <article key={cruce.fase} className="rounded-[34px] border border-cyan-300/25 bg-[#020714]/95 p-6 shadow-[0_0_35px_rgba(34,211,238,.10)]">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">{cruce.fase}</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center text-xl font-black uppercase">{cruce.local}</div>
                <div className="text-center text-3xl font-black text-yellow-300">VS</div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center text-xl font-black uppercase">{cruce.visitante}</div>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
