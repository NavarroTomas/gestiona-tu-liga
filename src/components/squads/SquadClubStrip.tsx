import type { SquadClub } from "@/lib/squads/types";

export default function SquadClubStrip({ clubs, selected, onSelect }: { clubs: SquadClub[]; selected: string; onSelect: (name: string) => void }) {
  return (
    <section className="mx-auto max-w-[1680px] px-5 pt-5 sm:px-8 lg:px-10">
      <div className="rounded-[10px] border border-[#d6e9f3] bg-white p-4">
        <h2 className="mb-3 text-sm font-black text-[#102f55]">Seleccioná un club</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {clubs.map((club) => {
            const active = selected === club.nombre;
            return (
              <button key={club.nombre} type="button" onClick={() => onSelect(club.nombre)} className={`min-w-[92px] rounded-[8px] border px-3 py-3 text-center transition ${active ? "border-[#2da5e8] bg-[#eef9ff]" : "border-[#e0edf4] bg-white hover:border-[#9fd5ef]"}`}>
                <span className="mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#edf6fb]">
                  {club.logo_url ? <img src={club.logo_url} alt="" className="h-full w-full object-contain p-1" /> : <span className="text-[10px] font-black text-[#66859b]">{club.nombre.slice(0,2).toUpperCase()}</span>}
                </span>
                <span className="mt-2 block truncate text-[11px] font-black text-[#163b63]">{club.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
