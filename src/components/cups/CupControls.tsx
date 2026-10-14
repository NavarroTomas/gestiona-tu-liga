
import { displayLabel } from "@/lib/displayLabels";
import { CUPS_CONFIG } from "@/config/cups";

export default function CupControls({
  season,
  seasons,
  group,
  onSeasonChange,
  onGroupChange,
}: {
  season: string;
  seasons: readonly string[];
  group: string;
  onSeasonChange: (season: string) => void;
  onGroupChange: (group: string) => void;
}) {
  return (
    <div className="mb-4 space-y-3 sm:mb-5">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-[.12em] text-[#7991a8]">Grupos</p>
          <p className="mt-1 text-base font-semibold text-[#5f7891]">
            Elegí el grupo que querés consultar.
          </p>
        </div>

        <label className="grid shrink-0 gap-1.5">
          <span className="text-xs font-black uppercase tracking-[.12em] text-[#7991a8]">Torneo</span>
          <span className="relative">
            <select
              value={season}
              onChange={(event) => onSeasonChange(event.target.value)}
              style={{ backgroundColor: "#dff1fc", color: "#102f55", borderColor: "#b9dced" }}
              className="h-10 min-w-[150px] cursor-pointer appearance-none rounded-[8px] border px-3.5 pr-9 text-[18px] font-bold outline-none transition hover:border-[#56afe2] focus:border-[#56afe2] focus:ring-2 focus:ring-[#56afe2]/20 sm:h-11 sm:min-w-[165px] sm:text-[18px]"
            >
              {seasons.map((item) => (
                <option
                  key={item}
                  value={item}
                  style={{ backgroundColor: "#f3fafe", color: "#102f55" }}
                >
                  {displayLabel(item)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#459bd0]">⌄</span>
          </span>
        </label>
      </div>

      <div className="overflow-x-auto pb-0.5">
        <div className="flex min-w-max gap-2">
          {/*
            Los botones se generan automáticamente desde CUPS_CONFIG.groups.
            Para agregar Grupo E/F/etc. no copies este botón: agregá la letra en
            `src/config/cups.ts` y aparecerá acá solo.
          */}
          {(season === "Temporada 5" ? ["A", "B", "C"] : CUPS_CONFIG.groups).map((item) => {
            const active = item === group;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onGroupChange(item)}
                className={`min-w-[120px] rounded-[8px] border px-5 py-3 text-base font-black transition ${
                  active
                    ? "border-[#56afe2] bg-[#56afe2] text-white"
                    : "border-[#d4e5ef] bg-[#eef6fb] text-[#244d76] hover:border-[#a8cfe6] hover:bg-[#e5f3fb]"
                }`}
              >
                Grupo {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
