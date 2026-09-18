import Link from "next/link";
import TeamLink from "@/components/team/TeamLink";
import type { CupMatch } from "@/lib/cups/types";
import { formatCupDate } from "@/lib/cups/utils";

function TeamLogo({ name, getLogo, size = "md" }: { name: string; getLogo: (name?: string | null) => string | null; size?: "sm" | "md" | "lg" }) {
  const logo = getLogo(name);
  const sizeClass = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <span className={`flex shrink-0 items-center justify-center ${sizeClass}`}>
      {logo ? (
        <img src={logo} alt={name} className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded bg-[#edf5fa] text-[8px] font-black text-[#597895]">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

export default function CupSidebar({
  nextMatch,
  matchdayMatches,
  getLogo,
}: {
  nextMatch: CupMatch | null;
  matchdayMatches: CupMatch[];
  getLogo: (name?: string | null) => string | null;
}) {
  return (
    <aside className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:self-start">
      <section className="overflow-hidden rounded-[10px] border border-[#d8e7f0] bg-white">
        <header className="flex h-[48px] items-center justify-between border-b border-[#e1edf4] bg-[#f8fbfd] px-4 sm:px-5">
          <h2 className="text-[18px] font-black uppercase tracking-[-.02em] text-[#102f55] sm:text-[18px]">Próximo partido</h2>
          <Link href="/fixture" className="text-[10px] font-bold text-[#5d7893] transition hover:text-[#2498d8] sm:text-[11px]">Ver fixture →</Link>
        </header>

        {nextMatch ? (
          <div className="px-4 py-5 sm:px-5 sm:py-6">
            <div className="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-2">
              <TeamLink
                name={nextMatch.local}
                className="group/team flex min-w-0 flex-col items-center gap-2.5 text-center"
              >
                <span className="transition-transform group-hover/team:scale-[1.04]">
                  <TeamLogo name={nextMatch.local} getLogo={getLogo} size="lg" />
                </span>
                <strong className="max-w-full truncate text-[16px] font-black text-[#173e68] transition-colors group-hover/team:text-[#258fcf] sm:text-[16px]">
                  {nextMatch.local}
                </strong>
              </TeamLink>

              <Link
                href="/fixture"
                className="text-center text-[14px] font-black uppercase text-[#102f55] transition-colors hover:text-[#258fcf]"
                aria-label="Ver partido en el fixture"
              >
                vs
              </Link>

              <TeamLink
                name={nextMatch.visitante}
                className="group/team flex min-w-0 flex-col items-center gap-2.5 text-center"
              >
                <span className="transition-transform group-hover/team:scale-[1.04]">
                  <TeamLogo name={nextMatch.visitante} getLogo={getLogo} size="lg" />
                </span>
                <strong className="max-w-full truncate text-[16px] font-black text-[#173e68] transition-colors group-hover/team:text-[#258fcf] sm:text-[16px]">
                  {nextMatch.visitante}
                </strong>
              </TeamLink>
            </div>

            <div className="mt-5 border-t border-[#e7eff5] pt-4">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-bold text-[#66819b]">
                <span>{formatCupDate(nextMatch)}</span>
                <span className="hidden h-3 w-px bg-[#cbdce7] sm:block" />
                <span>{nextMatch.hora || "Horario a confirmar"}</span>
              </div>

              <div className="mt-3 flex justify-center">
                <Link href="/fixture" className="text-[10px] font-black text-[#2498d8] transition hover:text-[#102f55] sm:text-[11px]">
                  Ver partido →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-[11px] font-medium text-[#7890a7]">No hay próximos partidos cargados para este grupo.</p>
        )}
      </section>

      <section className="overflow-hidden rounded-[10px] border border-[#d8e7f0] bg-white">
        <header className="flex h-[48px] items-center justify-between border-b border-[#e1edf4] bg-[#f8fbfd] px-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-black uppercase tracking-[-.02em] text-[#102f55] sm:text-[15px]">
              {nextMatch?.dia ? `Partidos · ${nextMatch.dia}` : "Próxima fecha"}
            </h2>
          </div>
          <Link href="/fixture" className="shrink-0 text-[10px] font-bold text-[#5d7893] transition hover:text-[#2498d8]">Ver todos →</Link>
        </header>

        <div className="px-3.5 sm:px-4">
          {matchdayMatches.length === 0 ? (
            <p className="py-7 text-center text-[11px] font-medium text-[#7890a7]">No hay partidos pendientes.</p>
          ) : (
            matchdayMatches.map((match) => (
              <div
                key={match.id}
                className="grid min-h-[56px] grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)_54px] items-center gap-1.5 border-b border-[#e7eff5] py-2.5 last:border-b-0 transition hover:bg-[#f8fbfd]"
              >
                <TeamLink name={match.local} className="group/team flex min-w-0 items-center gap-1.5">
                  <span className="transition-transform group-hover/team:scale-[1.04]">
                    <TeamLogo name={match.local} getLogo={getLogo} size="sm" />
                  </span>
                  <span className="truncate text-[13px] font-bold text-[#173e68] transition-colors group-hover/team:text-[#258fcf]">{match.local}</span>
                </TeamLink>

                <Link
                  href="/fixture"
                  className="text-center text-[9px] font-black text-[#7890a7] transition-colors hover:text-[#258fcf]"
                  aria-label={`Ver ${match.local} vs ${match.visitante} en el fixture`}
                >
                  vs
                </Link>

                <TeamLink name={match.visitante} className="group/team flex min-w-0 items-center justify-end gap-1.5">
                  <span className="truncate text-right text-[13px] font-bold text-[#173e68] transition-colors group-hover/team:text-[#258fcf]">{match.visitante}</span>
                  <span className="transition-transform group-hover/team:scale-[1.04]">
                    <TeamLogo name={match.visitante} getLogo={getLogo} size="sm" />
                  </span>
                </TeamLink>

                <Link
                  href="/fixture"
                  className="text-right text-[9px] font-bold leading-[1.3] text-[#7890a7] transition-colors hover:text-[#258fcf]"
                  aria-label={`Ver ${match.local} vs ${match.visitante} en el fixture`}
                >
                  {match.hora || formatCupDate(match)}
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
  );
}
