import Link from "next/link";
import type { HomeNews, StandingRow } from "@/lib/homePortal";

function NewsImage({ src, title }: { src?: string | null; title: string }) {
  if (!src) {
    return <div className="flex h-full min-h-52 items-center justify-center rounded-2xl bg-[#102f55] text-6xl font-black text-white/10">APA</div>;
  }
  return <img src={src} alt={title} className="h-full min-h-52 w-full rounded-2xl object-cover" />;
}

export default function HomeNewsStandings({ news, standings, logoEquipo }: { news: HomeNews[]; standings: StandingRow[]; logoEquipo: (club: string) => string | null }) {
  const featured = news[0];
  const secondary = news.slice(1, 4);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,.8fr)]">
      <article className="rounded-[26px] border border-[#0b2747]/10 bg-white p-4 shadow-[0_16px_45px_rgba(11,39,71,.08)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#245f8e]">Actualidad APA</p><h2 className="mt-1 text-2xl font-black uppercase text-[#0b2747]">Noticias</h2></div>
          <Link href="/noticias" className="text-xs font-black text-[#245f8e]">Ver todas →</Link>
        </div>

        {featured ? (
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="relative min-h-64 overflow-hidden rounded-2xl">
              <NewsImage src={featured.imagen_url} title={featured.titulo} />
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-[#0b2747]/75 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#0b2747]">{featured.categoria || "Actualidad"}</span>
            </div>
            <div className="flex flex-col justify-center rounded-2xl bg-[#f5f6f8] p-5">
              <h3 className="text-3xl font-black leading-tight text-[#0b2747]">{featured.titulo}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#245f8e]">{featured.descripcion}</p>
            </div>
          </div>
        ) : null}

        {secondary.length > 0 ? <div className="mt-4 grid gap-3 md:grid-cols-3">{secondary.map((item, index) => (
          <div key={item.id} className="group rounded-2xl border border-[#0b2747]/8 bg-[#f5f6f8] p-4 transition hover:border-[#245f8e]/25 hover:bg-white">
            <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#245f8e]">{item.categoria || "Actualidad"}</span><span className="text-[10px] font-black text-[#0b2747]/25">0{index + 2}</span></div>
            <p className="mt-3 text-sm font-black leading-5 text-[#0b2747]">{item.titulo}</p>
          </div>
        ))}</div> : null}
      </article>

      <article className="relative overflow-hidden rounded-[26px] bg-[#102f55] p-5 text-white shadow-[0_16px_45px_rgba(11,39,71,.14)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(36,95,142,.7),transparent_34%)]" />
        <div className="relative z-10">
          <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Primera División</p><h2 className="mt-1 text-2xl font-black uppercase">Tabla</h2></div><Link href="/competicion" className="text-xs font-black text-white/70">Completa →</Link></div>
          <div className="space-y-2">
            {standings.slice(0, 6).map((row, index) => (
              <div key={row.club} className="grid grid-cols-[28px_1fr_42px_42px] items-center gap-2 rounded-xl border border-white/8 bg-white/[0.07] px-3 py-3 text-sm">
                <span className="font-black">{index + 1}</span>
                <div className="flex min-w-0 items-center gap-2">{logoEquipo(row.club) ? <img src={logoEquipo(row.club)!} alt="" className="h-6 w-6 object-contain" /> : <div className="h-6 w-6 rounded-full bg-white/10" />}<span className="truncate font-bold">{row.club}</span></div>
                <span className="text-center text-xs font-bold text-white/55">{row.pj} PJ</span><span className="text-right font-black">{row.pts}</span>
              </div>
            ))}
            {standings.length === 0 ? <p className="rounded-xl bg-white/[0.07] p-4 text-sm text-white/60">Todavía no hay resultados suficientes.</p> : null}
          </div>
        </div>
      </article>
    </section>
  );
}
