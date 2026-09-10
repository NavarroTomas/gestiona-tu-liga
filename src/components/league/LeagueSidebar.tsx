import Link from "next/link";
import TeamLink from "@/components/team/TeamLink";
import type { LeagueMatch } from "@/lib/league/types";
import { textoFechaPartido } from "@/lib/league/utils";

function TeamMiniCrest({ nombre, logo }: { nombre: string; logo: string | null }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden sm:h-7 sm:w-7">
      {logo ? (
        <img src={logo} alt={nombre} className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded bg-[#e8f3fa] text-[8px] font-black text-[#55738f] sm:h-7 sm:w-7">
          {nombre?.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

function UpcomingMatches({
  partidos,
  obtenerLogo,
}: {
  partidos: LeagueMatch[];
  obtenerLogo: (nombre?: string | null) => string | null;
}) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[#d8e7f0] bg-white">
      <header className="flex h-[48px] items-center justify-between border-b border-[#e1edf4] bg-[#f8fbfd] px-4 sm:px-5">
        <h2 className="text-[15px] font-black uppercase tracking-[-.02em] text-[#102f55] sm:text-[16px]">Próxima fecha</h2>
        <Link href="/fixture" className="text-[10px] font-bold text-[#5d7893] transition hover:text-[#2498d8] sm:text-[11px]">Ver fixture →</Link>
      </header>

      <div className="px-3.5 sm:px-4">
        {partidos.length === 0 ? (
          <p className="py-7 text-center text-xs text-[#7890a7] sm:text-sm">No hay próximos partidos cargados.</p>
        ) : (
          partidos.map((partido) => (
            <div
              key={partido.id}
              className="grid min-h-[54px] grid-cols-[48px_minmax(0,1fr)_24px_minmax(0,1fr)] items-center gap-1.5 border-b border-[#e7eff5] py-2.5 last:border-b-0 transition hover:bg-[#f8fbfd] sm:grid-cols-[52px_minmax(0,1fr)_26px_minmax(0,1fr)] sm:gap-2"
            >
              <Link
                href="/fixture"
                className="text-[9px] font-bold leading-[1.45] text-[#64809a] transition-colors hover:text-[#258fcf] sm:text-[10px]"
                aria-label={`Ver ${partido.local} vs ${partido.visitante} en el fixture`}
              >
                <span className="block truncate">{textoFechaPartido(partido)}</span>
                <span className="block text-[#8ca0b3]">{partido.hora || "—"}</span>
              </Link>

              <TeamLink name={partido.local} className="group/team flex min-w-0 items-center gap-1.5 sm:gap-2">
                <span className="transition-transform group-hover/team:scale-[1.04]">
                  <TeamMiniCrest nombre={partido.local} logo={obtenerLogo(partido.local)} />
                </span>
                <span className="truncate text-[10px] font-bold text-[#173e68] transition-colors group-hover/team:text-[#258fcf] sm:text-[11px]">{partido.local}</span>
              </TeamLink>

              <Link
                href="/fixture"
                className="text-center text-[9px] font-black text-[#7890a7] transition-colors hover:text-[#258fcf]"
                aria-label={`Ver ${partido.local} vs ${partido.visitante} en el fixture`}
              >
                vs
              </Link>

              <TeamLink name={partido.visitante} className="group/team flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
                <span className="truncate text-right text-[10px] font-bold text-[#173e68] transition-colors group-hover/team:text-[#258fcf] sm:text-[11px]">{partido.visitante}</span>
                <span className="transition-transform group-hover/team:scale-[1.04]">
                  <TeamMiniCrest nombre={partido.visitante} logo={obtenerLogo(partido.visitante)} />
                </span>
              </TeamLink>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function RecentResults({
  partidos,
  obtenerLogo,
}: {
  partidos: LeagueMatch[];
  obtenerLogo: (nombre?: string | null) => string | null;
}) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[#d8e7f0] bg-white">
      <header className="flex h-[48px] items-center justify-between border-b border-[#e1edf4] bg-[#f8fbfd] px-4 sm:px-5">
        <h2 className="text-[15px] font-black uppercase tracking-[-.02em] text-[#102f55] sm:text-[16px]">Últimos resultados</h2>
        <Link href="/estadisticas" className="text-[10px] font-bold text-[#5d7893] transition hover:text-[#2498d8] sm:text-[11px]">Ver todos →</Link>
      </header>

      <div className="px-3.5 sm:px-4">
        {partidos.length === 0 ? (
          <p className="py-7 text-center text-xs text-[#7890a7] sm:text-sm">No hay resultados cargados.</p>
        ) : (
          partidos.map((partido) => {
            const matchHref = partido.partido_id
              ? `/estadisticas/${encodeURIComponent(partido.partido_id)}`
              : "/estadisticas";

            return (
              <div
                key={partido.id}
                className="grid min-h-[54px] grid-cols-[42px_minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-1.5 border-b border-[#e7eff5] py-2.5 last:border-b-0 transition hover:bg-[#f8fbfd] sm:grid-cols-[46px_minmax(0,1fr)_50px_minmax(0,1fr)] sm:gap-2"
              >
                <Link
                  href={matchHref}
                  className="truncate text-[9px] font-bold text-[#7890a7] transition-colors hover:text-[#258fcf] sm:text-[10px]"
                  aria-label={`Ver estadísticas de ${partido.local} vs ${partido.visitante}`}
                >
                  {textoFechaPartido(partido)}
                </Link>

                <TeamLink name={partido.local} className="group/team flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <span className="transition-transform group-hover/team:scale-[1.04]">
                    <TeamMiniCrest nombre={partido.local} logo={obtenerLogo(partido.local)} />
                  </span>
                  <span className="truncate text-[10px] font-bold text-[#173e68] transition-colors group-hover/team:text-[#258fcf] sm:text-[11px]">{partido.local}</span>
                </TeamLink>

                <Link
                  href={matchHref}
                  className="text-center text-[13px] font-black text-[#102f55] transition-colors hover:text-[#258fcf] sm:text-[14px]"
                  aria-label={`Ver estadísticas de ${partido.local} vs ${partido.visitante}`}
                >
                  {partido.resultado}
                </Link>

                <TeamLink name={partido.visitante} className="group/team flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
                  <span className="truncate text-right text-[10px] font-bold text-[#173e68] transition-colors group-hover/team:text-[#258fcf] sm:text-[11px]">{partido.visitante}</span>
                  <span className="transition-transform group-hover/team:scale-[1.04]">
                    <TeamMiniCrest nombre={partido.visitante} logo={obtenerLogo(partido.visitante)} />
                  </span>
                </TeamLink>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default function LeagueSidebar({
  proximosPartidos,
  ultimosResultados,
  obtenerLogo,
}: {
  proximosPartidos: LeagueMatch[];
  ultimosResultados: LeagueMatch[];
  obtenerLogo: (nombre?: string | null) => string | null;
}) {
  return (
    <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:self-start">
      <UpcomingMatches partidos={proximosPartidos} obtenerLogo={obtenerLogo} />
      <RecentResults partidos={ultimosResultados} obtenerLogo={obtenerLogo} />
    </aside>
  );
}
