import HistorySectionTitle from "@/components/history/HistorySectionTitle";
import { HistoryTeamIdentity } from "@/components/history/HistoryTeamIdentity";
import type { HistoryClub } from "@/lib/history";

export default function HistoryAwards({
  awards,
  clubs,
}: {
  awards: Array<{
    key: string;
    label: string;
    nombre: string;
    equipo: string;
  }>;
  clubs: HistoryClub[];
}) {
  return (
    <section className="border-b border-[#cfe5f1] bg-[#f8fcff]">
      <div className="mx-auto max-w-[1680px] px-5 py-7 sm:px-8 lg:px-10">
        <HistorySectionTitle>Premios</HistorySectionTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {awards.map((award) => (
            <div
              key={award.key}
              className="flex min-h-[126px] items-center gap-4 rounded-lg border border-[#d7e9f3] bg-white p-5 shadow-[0_5px_18px_rgba(21,78,112,.035)]"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#cce4f1] bg-[#eef8fd] text-2xl font-black text-[#1f77aa]">
                {award.nombre === "Sin definir" ? "—" : award.nombre.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wider text-[#1c5790] sm:text-xs">
                  {award.label}
                </p>
                <strong className="mt-1.5 block truncate text-lg font-black sm:text-xl">
                  {award.nombre}
                </strong>
                {award.equipo ? (
                  <div className="mt-2.5">
                    <HistoryTeamIdentity name={award.equipo} clubs={clubs} compact />
                  </div>
                ) : (
                  <span className="mt-2.5 block text-[12px] font-bold text-[#8ba0b0] sm:text-[13px]">
                    Todavía sin club asociado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
