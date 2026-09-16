import HistorySectionTitle from "@/components/history/HistorySectionTitle";
import { HistoryTeamIdentity } from "@/components/history/HistoryTeamIdentity";
import type { HistoryClub } from "@/lib/history";

export type HistoryTitleRow = {
  id: string;
  equipo: string;
  competicion: string;
  temporada: string;
  division?: string | null;
  descripcion?: string | null;
};

const COMPETITION_LABELS: Record<string, string> = {
  liga: "Liga",
  copa_clasificatoria: "Clasificación a Copas",
  copa_argentina: "Copa Argentina",
  copa_apa: "Copa APA",
  copa_campeones: "Copa de Campeones",
  playoffs: "Playoffs de Ascenso",
};

function competitionLabel(value: string) {
  return COMPETITION_LABELS[value] || value;
}

export default function HistoryHonours({
  titles,
  clubs,
}: {
  titles: HistoryTitleRow[];
  clubs: HistoryClub[];
}) {
  if (!titles.length) return null;

  const grouped = titles.reduce<Record<string, HistoryTitleRow[]>>((acc, title) => {
    const key = title.competicion || "otros";
    if (!acc[key]) acc[key] = [];
    acc[key].push(title);
    return acc;
  }, {});

  return (
    <section className="border-b border-[#d8e2ec] bg-white text-[#102f55]">
      <div className="mx-auto max-w-[1680px] px-5 py-8 sm:px-8 lg:px-10">
        <HistorySectionTitle>Palmarés oficial</HistorySectionTitle>
        <div className="mb-6 max-w-3xl text-sm leading-6 text-[#526579]">
          Campeones registrados oficialmente por el staff para esta temporada.
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(grouped).map(([competition, rows]) => (
            <article key={competition} className="rounded-xl border border-[#d8e2ec] bg-[#f5f6f8] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black uppercase tracking-wide text-[#0b2747]">
                  {competitionLabel(competition)}
                </h3>
                <span className="rounded-full bg-[#173f73] px-3 py-1 text-[10px] font-black uppercase text-white">
                  {rows.length} {rows.length === 1 ? "título" : "títulos"}
                </span>
              </div>

              <div className="space-y-3">
                {rows.map((title) => (
                  <div key={title.id} className="rounded-lg border border-[#d8e2ec] bg-white p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#245f8e]">
                      <span>{title.temporada}</span>
                      {title.division ? <span>· {title.division}</span> : null}
                    </div>
                    <HistoryTeamIdentity name={title.equipo} clubs={clubs} compact />
                    {title.descripcion ? (
                      <p className="mt-2 text-xs leading-5 text-[#65788b]">{title.descripcion}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
