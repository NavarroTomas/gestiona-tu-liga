"use client";

import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-10 text-white md:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[1200px] items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[38px] border border-yellow-400/30 bg-[#020714] p-6 text-center shadow-[0_0_65px_rgba(250,204,21,.16)] md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/55 to-black/90" />

          <div className="relative z-10">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-yellow-300/35 bg-yellow-400/10 text-5xl shadow-[0_0_35px_rgba(250,204,21,.18)] md:h-32 md:w-32 md:text-7xl">
              🏅
            </div>

            <p className="mt-8 text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
              Próximamente
            </p>

            <h1 className="mt-4 text-[clamp(2.4rem,9vw,5.5rem)] font-black uppercase italic leading-none">
              Copa APA
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
              La Copa APA será la competencia de eliminación directa para duelos decisivos, cruces y fases finales. Esta sección todavía está en construcción y se activará cuando APA la tenga lista oficialmente.
            </p>

            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-sky-400/20 bg-black/35 p-5">
                <p className="text-3xl">🏆</p>
                <h3 className="mt-3 font-black uppercase text-sky-300">Competencia</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Formato en preparación.
                </p>
              </div>

              <div className="rounded-3xl border border-yellow-400/20 bg-black/35 p-5">
                <p className="text-3xl">📅</p>
                <h3 className="mt-3 font-black uppercase text-yellow-300">Fixture</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Fechas y cruces pronto.
                </p>
              </div>

              <div className="rounded-3xl border border-green-400/20 bg-black/35 p-5">
                <p className="text-3xl">📊</p>
                <h3 className="mt-3 font-black uppercase text-green-300">Datos</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Estadísticas disponibles al activarse.
                </p>
              </div>
            </div>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/competicion"
                className="rounded-2xl border border-sky-400/30 bg-sky-400 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white"
              >
                Volver a competición
              </Link>

              <Link
                href="/divisiones"
                className="rounded-2xl border border-white/10 bg-black/35 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-zinc-300 transition hover:border-yellow-400/40 hover:text-white"
              >
                Ver Torneo de Liga
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
