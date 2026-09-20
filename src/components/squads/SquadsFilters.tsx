import type { SquadClub } from "@/lib/squads/types";
import APASelect from "@/components/ui/APASelect";

export default function SquadsFilters({
  season, seasons, onSeasonChange,
  division, divisions, onDivisionChange,
  clubName, clubs, onClubChange,
  search, onSearchChange,
}: {
  season: string;
  seasons: string[];
  onSeasonChange: (value: string) => void;
  division: string;
  divisions: string[];
  onDivisionChange: (value: string) => void;
  clubName: string;
  clubs: SquadClub[];
  onClubChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <section className="border-b border-[#d6e9f3] bg-[#f7fcff]">
      <div className="mx-auto grid max-w-[1680px] gap-3 px-5 py-4 sm:px-8 md:grid-cols-2 xl:grid-cols-[220px_220px_260px_1fr] lg:px-10">
        <label>
          <span className="mb-1.5 block text-[11px] font-black text-[#173c64]">Temporada</span>
          <APASelect value={season} onChange={onSeasonChange} options={seasons.map((item) => ({ value: item, label: item }))} ariaLabel="Temporada" />
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-black text-[#173c64]">Categoría</span>
          <APASelect value={division} onChange={onDivisionChange} options={divisions.map((item) => ({ value: item, label: item }))} ariaLabel="Categoría" />
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-black text-[#173c64]">Club</span>
          <APASelect
            value={clubName}
            onChange={onClubChange}
            options={[{ value: "Todos", label: "Todos los clubes" }, ...clubs.map((club) => ({ value: club.nombre, label: club.nombre }))]}
            ariaLabel="Club"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-black text-[#173c64]">Buscar jugador</span>
          <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Nombre o Player ID..." className="h-12 w-full rounded-[8px] border border-[#c9e3f1] bg-white px-4 text-[13px] font-semibold text-[#102f55] outline-none placeholder:text-[#9eb3c3] focus:border-[#56afe2]" />
        </label>
      </div>
    </section>
  );
}
