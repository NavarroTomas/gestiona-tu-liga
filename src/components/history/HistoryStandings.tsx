import Link from "next/link";
import TeamLink from "@/components/team/TeamLink";
import HistorySectionTitle from "@/components/history/HistorySectionTitle";
import { HistoryTeamLogo, historyClubFor } from "@/components/history/HistoryTeamIdentity";
import type { HistoryClub } from "@/lib/history";
import type { LeagueStanding } from "@/lib/league/types";

function StandingTable({
  title,
  rows,
  clubs,
}: {
  title: string;
  rows: LeagueStanding[];
  clubs: HistoryClub[];
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-white sm:text-base">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[610px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-[#8fc4e2] sm:text-[11px]">
              <th className="w-9 py-2.5">#</th>
              <th className="py-2.5">Club</th>
              {["PJ", "G", "E", "P", "GF", "GC", "DG", "PTS"].map((label) => (
                <th key={label} className="px-2 py-2.5 text-center">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 5).map((team, index) => {
              const club = historyClubFor(team.nombre, clubs);
              return (
                <tr key={team.nombre} className="border-b border-white/10 last:border-0">
                  <td className="py-3">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-[12px] font-black ${
                        index === 0
                          ? "bg-[#6de1bf] text-[#07354c]"
                          : "bg-white/5 text-white/75"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <TeamLink
                      name={team.nombre}
                      slug={club?.slug}
                      className="inline-flex max-w-[220px] items-center gap-2.5 text-white"
                    >
                      <HistoryTeamLogo name={team.nombre} clubs={clubs} size="sm" />
                      <span className="truncate text-[12px] font-black sm:text-[13px]">{team.nombre}</span>
                    </TeamLink>
                  </td>
                  {[team.pj, team.pg, team.pe, team.pp, team.gf, team.gc].map((value, cell) => (
                    <td key={cell} className="px-2 py-3 text-center text-[12px] font-bold text-white/90">
                      {value}
                    </td>
                  ))}
                  <td className="px-2 py-3 text-center text-[12px] font-bold text-white/90">
                    {team.dg > 0 ? `+${team.dg}` : team.dg}
                  </td>
                  <td className="px-2 py-3 text-center text-[13px] font-black text-white">{team.puntos}</td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-[13px] font-bold text-white/50">
                  Sin clasificación disponible.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HistoryStandings({
  tables,
  clubs,
}: {
  tables: { primera: LeagueStanding[]; segunda: LeagueStanding[] };
  clubs: HistoryClub[];
}) {
  return (
    <section className="border-b border-[#0b3e64] bg-[#06375e] text-white">
      <div className="mx-auto max-w-[1680px] px-5 py-7 sm:px-8 lg:px-10">
        <HistorySectionTitle inverse>Clasificación final</HistorySectionTitle>
        <div className="grid gap-4 xl:grid-cols-2">
          <StandingTable title="Primera División" rows={tables.primera} clubs={clubs} />
          <StandingTable title="Segunda División" rows={tables.segunda} clubs={clubs} />
        </div>
        <div className="mt-5 text-right">
          <Link
            href="/divisiones"
            className="text-[12px] font-black text-[#66c7f3] transition hover:text-white sm:text-[13px]"
          >
            Ver tabla completa →
          </Link>
        </div>
      </div>
    </section>
  );
}
