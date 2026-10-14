import type { ClubRecord } from "@/lib/clubs/types";

export type ClubTitleRow = {
  id: string;
  equipo: string;
  competicion: string;
  temporada: string;
  division?: string | null;
};

const LABELS: Record<string, string> = {
  liga: "Liga",
  copa_clasificatoria: "Clasificación",
  copa_argentina: "Copa Argentina",
  copa_apa: "Copa de la Liga",
  copa_campeones: "Copa Campeones",
  playoffs: "Playoffs",
};

export default function ClubsHonours({
  clubs,
  titles,
}: {
  clubs: ClubRecord[];
  titles: ClubTitleRow[];
}) {
  const rows = clubs
    .map((club) => {
      const clubTitles = titles.filter(
        (title) =>
          title.equipo.trim().toLowerCase() === club.nombre.trim().toLowerCase() &&
          title.temporada === club.temporada,
      );
      const counts = clubTitles.reduce<Record<string, number>>((acc, title) => {
        acc[title.competicion] = (acc[title.competicion] || 0) + 1;
        return acc;
      }, {});
      return { club, clubTitles, counts };
    })
    .filter((row) => row.clubTitles.length > 0)
    .sort((a, b) => b.clubTitles.length - a.clubTitles.length || a.club.nombre.localeCompare(b.club.nombre));

  if (!rows.length) return null;

  return (
    <section className="border-t border-[#d8e2ec] bg-[#f5f6f8] text-[#102f55]">
      <div className="mx-auto max-w-[1680px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#245f8e]">Reconocimiento oficial</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#0b2747] sm:text-3xl">Palmarés de clubes</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#65788b]">Los títulos se muestran únicamente dentro del torneo de esta identidad competitiva.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ club, clubTitles, counts }) => (
            <article key={`${club.club_id || club.slug || club.nombre}-${club.temporada || ""}`} className="rounded-xl border border-[#d8e2ec] bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#d8e2ec] bg-[#f5f6f8]">
                  {club.logo_url ? <img src={club.logo_url} alt="" className="h-11 w-11 object-contain" /> : <span className="text-lg font-black text-[#173f73]">{club.nombre.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-black uppercase text-[#0b2747]">{club.nombre}</h3>
                  <p className="mt-1 text-sm font-bold text-[#245f8e]">{clubTitles.length} {clubTitles.length === 1 ? "título oficial" : "títulos oficiales"}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(counts).map(([competition, count]) => (
                  <span key={competition} className="rounded-full border border-[#d8e2ec] bg-[#f5f6f8] px-3 py-1.5 text-[10px] font-black uppercase text-[#173f73]">
                    {LABELS[competition] || competition} ×{count}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
