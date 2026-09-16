import Link from "next/link";
import type { HomeNews, StandingRow } from "@/lib/homePortal";

function NewsImage({ src, title }: { src?: string | null; title: string }) {
  if (!src) {
    return <div className="flex h-full min-h-44 items-center justify-center rounded-2xl bg-[#102f55] text-5xl font-black text-white/20">APA</div>;
  }
  return <img src={src} alt={title} className="h-full min-h-44 w-full rounded-2xl object-cover" />;
}

export default function HomeNewsStandings({ news, standings, logoEquipo }: { news: HomeNews[]; standings: StandingRow[]; logoEquipo: (club: string) => string | null }) {
  const featured = news[0];
  const secondary = news.slice(1, 4);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,.8fr)]">
      <article className="rounded-[24px] border border-[#0b2747]/10 bg-white p-4 shadow-[0_12px_40px_rgba(11,39,71,.06)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#245f8e]">Actualidad APA</p>
            <h2 className="mt-1 text-2xl font-black uppercase text-[#0b2747]">Noticias</h2>
          </div>
          <Link href="/noticias" className="text-xs font-black text-[#245f8e]">Ver todas →</Link>
        </div>

        {featured ? (
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="min-h-56"><NewsImage src={featured.imagen_url} title={featured.titulo} /></div>
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#245f8e]">{featured.categoria || "Actualidad"}</p>
              <h3 className="mt-2 text-3xl font-black leading-tight text-[#0b2747]">{featured.titulo}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#245f8e]">{featured.descripcion}</p>
            </div>
          </div>
        ) : null}

        {secondary.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {secondary.map((item) => (
              <div key={item.id} className="rounded-2xl bg-[#f5f6f8] p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#245f8e]">{item.categoria || "Actualidad"}</p>
                <p className="mt-2 text-sm font-black leading-5 text-[#0b2747]">{item.titulo}</p>
              </div>
            ))}
          </div>
        ) : null}
      </article>

      <article className="rounded-[24px] border border-[#0b2747]/10 bg-white p-4 shadow-[0_12px_40px_rgba(11,39,71,.06)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#245f8e]">Primera División</p>
            <h2 className="mt-1 text-2xl font-black uppercase text-[#0b2747]">Tabla</h2>
          </div>
          <Link href="/competicion" className="text-xs font-black text-[#245f8e]">Completa →</Link>
        </div>

        <div className="space-y-2">
          {standings.slice(0, 6).map((row, index) => (
            <div key={row.club} className="grid grid-cols-[28px_1fr_42px_42px] items-center gap-2 rounded-xl bg-[#f5f6f8] px-3 py-3 text-sm">
              <span className="font-black text-[#0b2747]">{index + 1}</span>
              <div className="flex min-w-0 items-center gap-2">
                {logoEquipo(row.club) ? <img src={logoEquipo(row.club)!} alt="" className="h-6 w-6 object-contain" /> : <div className="h-6 w-6 rounded-full bg-[#102f55]" />}
                <span className="truncate font-bold text-[#0b2747]">{row.club}</span>
              </div>
              <span className="text-center text-xs font-bold text-[#245f8e]">{row.pj} PJ</span>
              <span className="text-right font-black text-[#0b2747]">{row.pts}</span>
            </div>
          ))}
          {standings.length === 0 ? <p className="rounded-xl bg-[#f5f6f8] p-4 text-sm text-[#245f8e]">Todavía no hay resultados suficientes.</p> : null}
        </div>
      </article>
    </section>
  );
}
