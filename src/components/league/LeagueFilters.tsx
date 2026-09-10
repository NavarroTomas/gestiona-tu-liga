import { LEAGUE_CONFIG } from "@/config/league";

export default function LeagueFilters({
  temporada,
  division,
  onTemporadaChange,
  onDivisionChange,
}: {
  temporada: string;
  division: string;
  onTemporadaChange: (value: string) => void;
  onDivisionChange: (value: string) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-3 sm:mb-6">
      <label className="grid gap-1.5">
        <span className="text-[9px] font-black uppercase tracking-[.15em] text-[#7991a8]">Temporada</span>
        <span className="relative">
          <select
            value={temporada}
            onChange={(event) => onTemporadaChange(event.target.value)}
            style={{ backgroundColor: "#dff1fc", color: "#102f55", borderColor: "#b9dced" }}
            className="h-10 min-w-[160px] cursor-pointer appearance-none rounded-[8px] border px-3.5 pr-9 text-[12px] font-bold outline-none transition hover:border-[#56afe2] focus:border-[#56afe2] focus:ring-2 focus:ring-[#56afe2]/20 sm:h-11 sm:min-w-[170px] sm:text-sm"
          >
            {LEAGUE_CONFIG.seasons.map((season) => (
              <option
                key={season}
                value={season}
                style={{ backgroundColor: "#f3fafe", color: "#102f55" }}
              >
                {season}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#459bd0]">⌄</span>
        </span>
      </label>

      <label className="grid gap-1.5">
        <span className="text-[9px] font-black uppercase tracking-[.15em] text-[#7991a8]">División</span>
        <span className="relative">
          <select
            value={division}
            onChange={(event) => onDivisionChange(event.target.value)}
            style={{ backgroundColor: "#dff1fc", color: "#102f55", borderColor: "#b9dced" }}
            className="h-10 min-w-[175px] cursor-pointer appearance-none rounded-[8px] border px-3.5 pr-9 text-[12px] font-bold outline-none transition hover:border-[#56afe2] focus:border-[#56afe2] focus:ring-2 focus:ring-[#56afe2]/20 sm:h-11 sm:min-w-[190px] sm:text-sm"
          >
            {LEAGUE_CONFIG.divisions.map((value) => (
              <option
                key={value}
                value={value}
                style={{ backgroundColor: "#f3fafe", color: "#102f55" }}
              >
                {value} División
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#459bd0]">⌄</span>
        </span>
      </label>
    </div>
  );
}
