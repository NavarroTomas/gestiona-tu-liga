"use client";
import {displayLabel} from "@/lib/displayLabels";


import SquadClubStrip from "@/components/squads/SquadClubStrip";
import SquadRoster from "@/components/squads/SquadRoster";
import SquadsFilters from "@/components/squads/SquadsFilters";
import SquadsHero from "@/components/squads/SquadsHero";
import { useSquads } from "@/hooks/useSquads";

/**
 * /plantillas solo ensambla la pantalla.
 * Header: el global del layout.
 * Datos: useSquads.
 * Configuración: config/squads.ts.
 * Visual: components/squads/*.
 */
export default function PlantillasPage() {
  const {
    season,
    setSeason,
    seasons,
    division,
    setDivision,
    divisions,
    clubName,
    setClubName,
    search,
    setSearch,
    clubs,
    selectedClub,
    displayedClubName,
    players,
    loading,
    error,
  } = useSquads();

  return (
    <main className="min-h-screen bg-[#f5fbfe] text-[#102f55]">
      <SquadsHero />

      <SquadsFilters
        season={season}
        seasons={seasons}
        onSeasonChange={(value) => {
          setSeason(value);
          setClubName("Todos");
        }}
        division={division}
        divisions={divisions}
        onDivisionChange={(value) => {
          setDivision(value);
          setClubName("Todos");
        }}
        clubName={clubName}
        clubs={clubs}
        onClubChange={setClubName}
        search={search}
        onSearchChange={setSearch}
      />

      {error ? (
        <div className="mx-auto max-w-[1680px] px-5 pt-4 sm:px-8 lg:px-10">
          <div className="rounded-[9px] border border-[#efcaca] bg-[#fff6f6] px-4 py-3 text-[13px] font-bold text-[#934747]">
            {error} Mostramos todo lo que sí está disponible.
          </div>
        </div>
      ) : null}

      <SquadClubStrip
        clubs={clubs}
        selected={displayedClubName}
        onSelect={setClubName}
      />

      {displayLabel(loading ? (
        <div className="mx-auto max-w-[1680px] px-5 py-14 text-center text-sm font-black uppercase tracking-[.16em] text-[#4c7899] sm:px-8 lg:px-10">
          Cargando plantillas...
        </div>
      ) : (
        <SquadRoster
          club={selectedClub}
          clubName={displayedClubName}
          season={season}
          division={division}
          players={players}
        />
      ))}
    </main>
  );
}
