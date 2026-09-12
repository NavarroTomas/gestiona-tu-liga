import HistorySectionTitle from "@/components/history/HistorySectionTitle";

type HistoryRecord = {
  label: string;
  value: string;
  detail: string;
};

function RecordList({ records }: { records: HistoryRecord[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/5">
      {records.map((record) => (
        <div
          key={record.label}
          className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 px-4 py-3.5 last:border-0"
        >
          <div className="min-w-0">
            <span className="block text-[12px] font-bold leading-5 text-white/85 sm:text-[13px]">
              {record.label}
            </span>
            <span className="mt-0.5 block truncate text-[11px] leading-4 text-[#8bbddd] sm:text-xs">
              {record.detail}
            </span>
          </div>
          <strong className="self-center text-[14px] font-black sm:text-base">{record.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function HistoryRecords({
  seasonRecords,
  historicalRecords,
  globalLoading,
}: {
  seasonRecords: HistoryRecord[];
  historicalRecords: HistoryRecord[];
  globalLoading: boolean;
}) {
  return (
    <section className="bg-[#052f50] text-white">
      <div className="mx-auto grid max-w-[1680px] gap-9 px-5 py-8 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div>
          <HistorySectionTitle inverse>Récords de la temporada</HistorySectionTitle>
          <RecordList records={seasonRecords} />
        </div>

        <div>
          <HistorySectionTitle inverse>
            <span>
              Récords históricos{" "}
              <span className="block text-[10px] font-bold tracking-wider text-[#91c4e2] sm:inline sm:text-[11px]">
                (todas las temporadas)
              </span>
            </span>
          </HistorySectionTitle>
          {globalLoading ? (
            <div className="rounded-lg border border-white/10 bg-black/5 px-4 py-10 text-center text-[13px] font-bold text-white/50">
              Cargando historial completo...
            </div>
          ) : (
            <RecordList records={historicalRecords} />
          )}
        </div>
      </div>
    </section>
  );
}
