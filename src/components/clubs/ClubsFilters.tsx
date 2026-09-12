import { CLUBS_CONFIG } from "@/config/clubs";

const selectStyle = {
  backgroundColor: "#ffffff",
  color: "#102f55",
  borderColor: "#c9e3f1",
} as const;

export default function ClubsFilters({
  season,
  seasons,
  onSeasonChange,
  division,
  divisions,
  onDivisionChange,
}: {
  season: string;
  seasons: string[];
  onSeasonChange: (value: string) => void;
  division: string;
  divisions: string[];
  onDivisionChange: (value: string) => void;
}) {
  return (
    <section className="border-b border-[#d6e8f2] bg-[#f7fcff]">
      <div className="mx-auto max-w-[1680px] px-5 py-5 sm:px-8 lg:px-10">
        <div className="grid gap-5 rounded-[14px] border border-[#bfe1f2] bg-white px-5 py-5 shadow-[0_8px_26px_rgba(28,87,124,.035)] lg:grid-cols-[minmax(0,1fr)_240px_240px] lg:items-center lg:px-6">
          <div className="min-w-0 lg:border-r lg:border-[#cfe5f1] lg:pr-7">
            <p className="text-[11px] font-black uppercase tracking-[.12em] text-[#1996d4]">{CLUBS_CONFIG.filters.eyebrow}</p>
            <h2 className="mt-1 text-[25px] font-black leading-tight tracking-[-.025em] text-[#102f55] sm:text-[28px]">{CLUBS_CONFIG.filters.title}</h2>
            <p className="mt-1 text-[13px] font-medium text-[#58778d] sm:text-sm">{CLUBS_CONFIG.filters.description}</p>
          </div>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-black text-[#173d65]">Temporada</span>
            <select
              value={season}
              onChange={(event) => onSeasonChange(event.target.value)}
              style={selectStyle}
              className="h-12 w-full rounded-[9px] border px-3 text-[13px] font-black outline-none transition focus:border-[#56afe2] focus:ring-2 focus:ring-[#56afe2]/20"
            >
              {(seasons.length ? seasons : [season]).map((item) => (
                <option key={item} value={item} style={selectStyle}>{item}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-black text-[#173d65]">Categoría</span>
            <select
              value={division}
              onChange={(event) => onDivisionChange(event.target.value)}
              style={selectStyle}
              className="h-12 w-full rounded-[9px] border px-3 text-[13px] font-black outline-none transition focus:border-[#56afe2] focus:ring-2 focus:ring-[#56afe2]/20"
            >
              {(divisions.length ? divisions : [division]).map((item) => (
                <option key={item} value={item} style={selectStyle}>{item} División</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
