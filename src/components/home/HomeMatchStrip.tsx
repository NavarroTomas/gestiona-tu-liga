import Link from "next/link";
import type { ClubInfo, HomeMatch } from "@/lib/homePortal";
import { normalizeText } from "@/lib/homePortal";

function clubLogo(clubs: ClubInfo[], name?: string | null) {
  if (!name) return null;
  return clubs.find((club) => normalizeText(club.nombre) === normalizeText(name))?.logo_url || null;
}

function Crest({ clubs, team }: { clubs: ClubInfo[]; team?: string | null }) {
  const logo = clubLogo(clubs, team);
  return logo ? <img src={logo} alt="" className="h-10 w-10 object-contain" /> : <div className="h-10 w-10 rounded-xl bg-[#102f55]" />;
}

export default function HomeMatchStrip({ featured, upcoming, clubs }: { featured?: HomeMatch; upcoming: HomeMatch[]; clubs: ClubInfo[] }) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <article className="rounded-[24px] bg-[#102f55] p-5 text-white shadow-[0_14px_42px_rgba(11,39,71,.16)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">Partido destacado</p>
            <h2 className="mt-1 text-2xl font-black uppercase">Próximo encuentro</h2>
          </div>
          <Link href="/fixture" className="text-xs font-black text-white/80">Fixture →</Link>
        </div>

        {featured ? (
          <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Crest clubs={clubs} team={featured.local} />
              <span className="truncate text-base font-black uppercase">{featured.local}</span>
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-white/60">{featured.dia || `Fecha ${featured.fecha || "-"}`}</p>
              <p className="mt-1 text-2xl font-black">{featured.hora || "A confirmar"}</p>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-3 text-right">
              <span className="truncate text-base font-black uppercase">{featured.visitante}</span>
              <Crest clubs={clubs} team={featured.visitante} />
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-white/70">No hay un próximo partido cargado.</p>
        )}
      </article>

      <article className="rounded-[24px] border border-[#0b2747]/10 bg-white p-5 shadow-[0_12px_40px_rgba(11,39,71,.06)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black uppercase text-[#0b2747]">Próximos partidos</h2>
          <Link href="/fixture" className="text-xs font-black text-[#245f8e]">Ver todos →</Link>
        </div>

        <div className="mt-4 space-y-2">
          {upcoming.slice(0, 3).map((match) => (
            <div key={String(match.partido_id || match.id)} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 rounded-xl bg-[#f5f6f8] px-3 py-3 text-sm">
              <div className="flex min-w-0 items-center gap-2"><Crest clubs={clubs} team={match.local} /><span className="truncate font-bold text-[#0b2747]">{match.local}</span></div>
              <span className="text-[10px] font-black uppercase text-[#245f8e]">vs</span>
              <div className="flex min-w-0 items-center justify-end gap-2 text-right"><span className="truncate font-bold text-[#0b2747]">{match.visitante}</span><Crest clubs={clubs} team={match.visitante} /></div>
              <span className="pl-2 text-xs font-black text-[#0b2747]">{match.hora || "-"}</span>
            </div>
          ))}
          {upcoming.length === 0 ? <p className="rounded-xl bg-[#f5f6f8] p-4 text-sm text-[#245f8e]">Sin próximos partidos cargados.</p> : null}
        </div>
      </article>
    </section>
  );
}
