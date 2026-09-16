import Link from "next/link";
import { awardIcon, awardLabel, type HomeAward } from "@/lib/homePortal";

export default function HomeAwards({ awards, logoEquipo }: { awards: HomeAward[]; logoEquipo: (club: string) => string | null }) {
  const visible = awards.slice(0, 4);
  if (!visible.length) return null;

  return (
    <section className="rounded-[24px] border border-[#0b2747]/10 bg-white p-5 shadow-[0_12px_40px_rgba(11,39,71,.06)]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#245f8e]">Temporada actual</p>
          <h2 className="mt-1 text-3xl font-black uppercase text-[#0b2747]">Premios APA</h2>
        </div>
        <Link href="/historia" className="text-xs font-black text-[#245f8e]">Ver todos →</Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {visible.map((award) => {
          const logo = award.equipo ? logoEquipo(award.equipo) : null;
          return (
            <article key={award.id} className="relative overflow-hidden rounded-2xl border border-[#0b2747]/10 bg-[#f5f6f8] p-4">
              <div className="absolute right-3 top-2 text-5xl font-black text-[#0b2747]/[0.05]">{awardIcon(award.premio)}</div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#245f8e]">{awardLabel(award.premio)}</p>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                  {logo ? <img src={logo} alt="" className="h-9 w-9 object-contain" /> : <span className="text-xl font-black text-[#123f69]">{awardIcon(award.premio)}</span>}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black uppercase text-[#0b2747]">{award.nombre}</h3>
                  <p className="truncate text-xs font-bold text-[#245f8e]">{award.equipo || "APA"}</p>
                </div>
              </div>
              {award.puntos != null ? <p className="mt-4 text-xs font-black text-[#0b2747]">{Number(award.puntos).toFixed(1)} pts</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
