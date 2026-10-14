import { LEAGUE_CONFIG } from "@/config/league";
import APASelect from "@/components/ui/APASelect";

export default function LeagueFilters({
  temporada,
  seasons,
  division,
  onTemporadaChange,
  onDivisionChange,
}: {
  temporada: string;
  seasons: string[];
  division: string;
  onTemporadaChange: (value: string) => void;
  onDivisionChange: (value: string) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-3 sm:mb-6">
      <label className="grid gap-1.5">
        <span className="text-[9px] font-black uppercase tracking-[.15em] text-[#7991a8]">Torneo</span>
        <APASelect
          value={temporada}
          onChange={onTemporadaChange}
          options={seasons.map((season) => ({ value: season, label: season }))}
          ariaLabel="Torneo"
          className="min-w-[160px] sm:min-w-[170px]"
          compact
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-[9px] font-black uppercase tracking-[.15em] text-[#7991a8]">División</span>
        <APASelect
          value={division}
          onChange={onDivisionChange}
          options={LEAGUE_CONFIG.divisions.map((value) => ({ value, label: `${value} División` }))}
          ariaLabel="División"
          className="min-w-[175px] sm:min-w-[190px]"
          compact
        />
      </label>
    </div>
  );
}
