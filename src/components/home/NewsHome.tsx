import Link from "next/link";

type Props = {
  noticias: any[];
  noticiaDestacada: any;
  noticiasSecundarias: any[];
  fechaNoticia: (value?: string | null) => string;
};

export default function NewsHome({ noticias, noticiaDestacada, noticiasSecundarias, fechaNoticia }: Props) {
  if (noticias.length === 0) return null;

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      {noticiaDestacada && (
        <Link href={`/noticias/${noticiaDestacada.id}`} className="group relative overflow-hidden rounded-[34px] border border-yellow-400/25 bg-[#061b35]/75 p-5 shadow-[0_22px_60px_rgba(0,0,0,.28)] transition hover:border-yellow-300/50 md:p-7">
          <img src="/themes/worldcup/card-bg-gold.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
          <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_260px] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-xl border border-yellow-300/30 bg-yellow-300 px-3 py-1 text-[10px] font-black uppercase text-[#06111f]">Última noticia</span>
                <span className="rounded-xl border border-sky-300/25 bg-sky-300/10 px-3 py-1 text-[10px] font-black uppercase text-sky-200">{noticiaDestacada.categoria || "General"}</span>
              </div>
              <h2 className="mt-5 break-words text-[clamp(2rem,7vw,3.6rem)] font-black uppercase leading-none group-hover:text-yellow-300">{noticiaDestacada.titulo}</h2>
              <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-200 sm:text-base">{noticiaDestacada.descripcion}</p>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{noticiaDestacada.temporada || "APA"} · {noticiaDestacada.autor || "Prensa APA"} · {fechaNoticia(noticiaDestacada.created_at || noticiaDestacada.updated_at)}</p>
            </div>
            <div className="h-56 overflow-hidden rounded-[28px] border border-white/10 bg-black/35">
              {noticiaDestacada.imagen_url ? (
                <img src={noticiaDestacada.imagen_url} alt={noticiaDestacada.titulo} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <img src="/themes/worldcup/card-rankings.png" alt="" className="h-full w-full object-cover" />
              )}
            </div>
          </div>
        </Link>
      )}

      <section className="relative overflow-hidden rounded-[34px] border border-white/15 bg-[#061b35]/72 p-5 shadow-[0_22px_60px_rgba(0,0,0,.24)] md:p-6">
        <img src="/themes/worldcup/card-bg-blue.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-16" />
        <div className="relative z-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-200">Prensa</p>
              <h2 className="mt-2 text-3xl font-black uppercase">Más noticias</h2>
            </div>
            <Link href="/noticias" className="shrink-0 text-sm font-black uppercase text-sky-200 hover:text-white">Ver todas →</Link>
          </div>
          <div className="space-y-3">
            {noticiasSecundarias.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/10 p-5 text-zinc-300">No hay más noticias publicadas.</p>
            ) : (
              noticiasSecundarias.map((noticia) => (
                <Link key={noticia.id} href={`/noticias/${noticia.id}`} className="group flex gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur transition hover:bg-white/15">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-2xl">
                    {noticia.imagen_url ? <img src={noticia.imagen_url} alt={noticia.titulo} className="h-full w-full object-cover" /> : <img src="/themes/worldcup/card-rankings.png" alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-200">{noticia.categoria || "General"}</p>
                    <h3 className="mt-1 line-clamp-2 text-base font-black uppercase text-white group-hover:text-sky-200">{noticia.titulo}</h3>
                    <p className="mt-1 text-xs text-zinc-400">{fechaNoticia(noticia.created_at || noticia.updated_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
