import { COPA_ARGENTINA_CONFIG } from "@/config/copaArgentina";

export default function KnockoutCupControls({
  season,
  onSeasonChange,
}: {
  season: string;
  onSeasonChange: (season: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#7991a8]">Formato</p>
        <p className="mt-1 text-[12px] font-semibold text-[#5f7891]">
          Cuartos · Semifinales · Final{COPA_ARGENTINA_CONFIG.showThirdPlace ? " · 3.º puesto" : ""}
        </p>
      </div>

      <label className="grid gap-1.5">
        <span className="text-[9px] font-black uppercase tracking-[.15em] text-[#7991a8]">Temporada</span>
        <span className="relative">
          <select
            value={season}
            onChange={(event) => onSeasonChange(event.target.value)}
            style={{ backgroundColor: "#dff1fc", color: "#102f55", borderColor: "#b9dced" }}
            className="h-10 min-w-[150px] cursor-pointer appearance-none rounded-[8px] border px-3.5 pr-9 text-[12px] font-bold outline-none transition hover:border-[#56afe2] focus:border-[#56afe2] focus:ring-2 focus:ring-[#56afe2]/20 sm:h-11 sm:min-w-[165px] sm:text-sm"
          >
            {COPA_ARGENTINA_CONFIG.seasons.map((item) => (
              <option key={item} value={item} style={{ backgroundColor: "#f3fafe", color: "#102f55" }}>
                {item}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#459bd0]">⌄</span>
        </span>
      </label>
    </div>
  );
}
