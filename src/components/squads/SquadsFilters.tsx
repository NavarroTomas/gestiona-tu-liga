import type { SquadClub } from "@/lib/squads/types";

const selectStyle = { backgroundColor: "#fff", color: "#102f55", borderColor: "#c9e3f1" } as const;

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
          <select value={season} onChange={(e) => onSeasonChange(e.target.value)} style={selectStyle} className="h-12 w-full rounded-[8px] border px-3 text-[13px] font-black outline-none">
            {seasons.map((item) => <option key={item} value={item} style={selectStyle}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-black text-[#173c64]">Categoría</span>
          <select value={division} onChange={(e) => onDivisionChange(e.target.value)} style={selectStyle} className="h-12 w-full rounded-[8px] border px-3 text-[13px] font-black outline-none">
            {divisions.map((item) => <option key={item} value={item} style={selectStyle}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-black text-[#173c64]">Club</span>
          <select value={clubName} onChange={(e) => onClubChange(e.target.value)} style={selectStyle} className="h-12 w-full rounded-[8px] border px-3 text-[13px] font-black outline-none">
            <option value="Todos" style={selectStyle}>Todos los clubes</option>
            {clubs.map((club) => <option key={club.nombre} value={club.nombre} style={selectStyle}>{club.nombre}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-[11px] font-black text-[#173c64]">Buscar jugador</span>
          <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Nombre o Player ID..." className="h-12 w-full rounded-[8px] border border-[#c9e3f1] bg-white px-4 text-[13px] font-semibold text-[#102f55] outline-none placeholder:text-[#9eb3c3] focus:border-[#56afe2]" />
        </label>
      </div>
    </section>
  );
}
