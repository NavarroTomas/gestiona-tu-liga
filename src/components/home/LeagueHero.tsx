import Link from "next/link";

export default function LeagueHero({ temporada }: { temporada: string }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[#0b2747] px-6 py-10 text-white md:px-10 md:py-14">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_82%_20%,rgba(36,95,142,.9),transparent_28%),linear-gradient(120deg,transparent_0%,rgba(255,255,255,.045)_45%,transparent_46%),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:auto,auto,80px_80px]" />
      <div className="pointer-events-none absolute -right-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-2 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/10" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.34em] text-white/65">Liga APA PSO · {temporada}</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.04em] md:text-7xl">Más que un juego</h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/75 md:text-lg">Competencias, resultados, clubes y actualidad de APA en un solo lugar.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/competicion" className="rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-[#0b2747] transition hover:bg-[#f3f4f6]">Ver competición</Link>
            <Link href="/fixture" className="rounded-xl border border-white/25 px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-white/10">Ver fixture</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ["Primera", "/competicion?division=primera"],
            ["Segunda", "/competicion?division=segunda"],
            ["Copas", "/competicion"],
            ["Clubes", "/clubes"],
          ].map(([label, href]) => (
            <Link key={label} href={href} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-white backdrop-blur-sm transition hover:bg-white/[0.12]">
              {label}
              <span className="mt-3 block text-lg">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
