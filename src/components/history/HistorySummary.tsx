
import { displayLabel } from "@/lib/displayLabels";
import { HistoryTeamIdentity } from "@/components/history/HistoryTeamIdentity";
import type { HistoryClub } from "@/lib/history";

function formatAverage(value: number) {
  return value > 0 ? value.toFixed(2).replace(".", ",") : "0,00";
}

export default function HistorySummary({
  season,
  loading,
  summary,
  champions,
  clubs,
}: {
  season: string;
  loading: boolean;
  summary: {
    teams: number;
    matches: number;
    goals: number;
    goalsPerMatch: number;
  };
  champions: Array<{ division: string; team: string }>;
  clubs: HistoryClub[];
}) {
  const metrics = [
    { value: summary.teams, label: "Equipos" },
    { value: summary.matches, label: "Partidos" },
    { value: summary.goals, label: "Goles" },
    { value: formatAverage(summary.goalsPerMatch), label: "Goles por partido" },
  ];

  return (
    <section className="border-b border-[#cfe5f1] bg-[#f8fcff]">
      <div className="mx-auto grid max-w-[1680px] gap-6 px-5 py-7 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#3298d3] sm:text-[13px]">
            Resumen general
          </p>
          <h2 className="mt-1 text-[34px] font-black uppercase tracking-tight sm:text-4xl">
            {displayLabel(season)}
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-[#d6e9f3] bg-white px-3 py-5 text-center shadow-[0_5px_18px_rgba(21,78,112,.04)]"
              >
                <strong className="block text-[34px] font-black leading-none tracking-tight sm:text-4xl">
                  {loading ? "—" : metric.value}
                </strong>
                <span className="mt-2 block text-[10px] font-black uppercase tracking-wide text-[#497a9e] sm:text-[11px]">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {champions.map((champion) => (
            <div
              key={champion.division}
              className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-[#cfe6f2] bg-[#eef9ff] p-5 text-center"
            >
              <span className="text-[11px] font-black uppercase tracking-wider text-[#285f89] sm:text-xs">
                {champion.division}
              </span>
              <span className="mt-1 text-[13px] font-black uppercase text-[#168cd0] sm:text-sm">
                Campeón
              </span>
              <div className="mt-4">
                <HistoryTeamIdentity name={champion.team} clubs={clubs} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
