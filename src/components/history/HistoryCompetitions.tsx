import HistorySectionTitle from "@/components/history/HistorySectionTitle";
import { HistoryTeamIdentity } from "@/components/history/HistoryTeamIdentity";
import type { HistoryClub } from "@/lib/history";

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path
        d="M8 4h8v3.5c0 3-1.75 5.5-4 5.5s-4-2.5-4-5.5V4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 6H5.8c0 3 1.2 4.7 3.6 5.2M16 6h2.2c0 3-1.2 4.7-3.6 5.2M12 13v3.2M8.5 20h7M9.5 16.5h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HistoryCompetitions({
  competitions,
  clubs,
}: {
  competitions: Array<{
    key: string;
    label: string;
    rows: Array<{ label: string; team: string }>;
  }>;
  clubs: HistoryClub[];
}) {
  return (
    <section className="border-b border-[#0b3e64] bg-[#06406b] text-white">
      <div className="mx-auto max-w-[1680px] px-5 py-7 sm:px-8 lg:px-10">
        <HistorySectionTitle inverse>Competiciones</HistorySectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {competitions.map((competition) => (
            <div
              key={competition.key}
              className="rounded-lg border border-white/10 bg-white/5 p-5"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1f77aa]/40 text-[#83d5fb]">
                  <TrophyIcon />
                </span>
                <h3 className="text-[13px] font-black uppercase tracking-wide sm:text-sm">
                  {competition.label}
                </h3>
              </div>
              <div className="space-y-4">
                {competition.rows.map((row) => (
                  <div key={`${competition.key}-${row.label}`}>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8ac4e5] sm:text-[11px]">
                      {row.label}
                    </p>
                    <HistoryTeamIdentity name={row.team} clubs={clubs} compact inverse />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
