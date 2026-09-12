import HistorySectionTitle from "@/components/history/HistorySectionTitle";
import { HistoryTeamIdentity } from "@/components/history/HistoryTeamIdentity";
import type { HistoryClub } from "@/lib/history";

export type HistoryHighlightCard = {
  label: string;
  value: number;
  unit: string;
  person: string;
  team: string;
};

export default function HistoryHighlights({
  highlights,
  clubs,
  loading,
}: {
  highlights: HistoryHighlightCard[];
  clubs: HistoryClub[];
  loading: boolean;
}) {
  return (
    <section className="border-b border-[#cfe5f1] bg-[#f7fcff]">
      <div className="mx-auto max-w-[1680px] px-5 py-7 sm:px-8 lg:px-10">
        <HistorySectionTitle>Estadísticas destacadas</HistorySectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {highlights.map((card) => (
            <div
              key={card.label}
              className="min-h-[168px] rounded-lg border border-[#d5e9f4] bg-white p-5 shadow-[0_5px_18px_rgba(21,78,112,.035)]"
            >
              <p className="text-[11px] font-black uppercase tracking-wide text-[#214f7d] sm:text-xs">
                {card.label}
              </p>
              <strong className="mt-2.5 block text-[36px] font-black leading-none sm:text-[38px]">
                {loading ? "—" : card.value}
              </strong>
              <span className="mt-1.5 block text-[10px] font-black uppercase text-[#378bc0] sm:text-[11px]">
                {card.unit}
              </span>
              <div className="mt-5">
                {card.team ? (
                  <HistoryTeamIdentity name={card.team} clubs={clubs} compact />
                ) : (
                  <span className="text-[13px] font-bold text-[#7f96a7]">Sin datos</span>
                )}
                {card.person !== card.team && card.person !== "Sin datos" ? (
                  <p className="mt-1.5 pl-10 text-[12px] font-bold text-[#5a7c95] sm:text-[13px]">
                    {card.person}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
