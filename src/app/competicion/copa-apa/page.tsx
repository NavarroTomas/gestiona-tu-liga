"use client";

import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-8 text-white md:px-8">
      <section className="mx-auto flex min-h-[70vh] max-w-[1100px] items-center justify-center">
        <div className="w-full rounded-[40px] border border-purple-500/25 bg-[#020714]/95 p-8 text-center shadow-[0_0_55px_rgba(0,0,0,.35)] md:p-12">
          <p className="text-purple-300 text-xs font-black uppercase tracking-[0.45em]">
            Eliminatoria APA
          </p>

          <h1 className="mt-6 text-5xl font-black uppercase italic leading-none md:text-7xl">
            Copa APA
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
            La Copa APA se activará cuando finalice la clasificación a copas y estén definidos los equipos clasificados desde la fase de grupos.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-purple-300 text-2xl">🏆</p>
              <h3 className="mt-3 text-xl font-black uppercase">Competencia</h3>
              <p className="mt-2 text-sm text-zinc-500">Formato en preparación.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-purple-300 text-2xl">📅</p>
              <h3 className="mt-3 text-xl font-black uppercase">Fixture</h3>
              <p className="mt-2 text-sm text-zinc-500">Cruces disponibles al activarse.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-purple-300 text-2xl">📊</p>
              <h3 className="mt-3 text-xl font-black uppercase">Datos</h3>
              <p className="mt-2 text-sm text-zinc-500">Estadísticas y avance de fase.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/competicion"
              className="rounded-2xl border border-sky-400/30 bg-sky-400 px-6 py-3 text-sm font-black uppercase text-black transition hover:bg-white"
            >
              Volver a competición
            </Link>

            <Link
              href="/divisiones"
              className="rounded-2xl border border-white/10 bg-black/35 px-6 py-3 text-sm font-black uppercase text-white transition hover:border-white/30"
            >
              Ver torneo de liga
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
