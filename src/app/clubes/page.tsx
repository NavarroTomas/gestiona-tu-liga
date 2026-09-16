"use client";

import ClubsFilters from "@/components/clubs/ClubsFilters";
import ClubsFooter from "@/components/clubs/ClubsFooter";
import ClubsHero from "@/components/clubs/ClubsHero";
import ClubsHonours from "@/components/clubs/ClubsHonours";
import ClubsLeader from "@/components/clubs/ClubsLeader";
import ClubsSummary from "@/components/clubs/ClubsSummary";
import ClubsTable from "@/components/clubs/ClubsTable";
import { useClubs } from "@/hooks/useClubs";

/**
 * /clubes solo ensambla la pantalla.
 *
 * - Header: el global que ya usa todo el sitio (layout.tsx).
 * - Datos/automatización: useClubs.
 * - Cálculos: lib/clubs + cálculo oficial de Liga.
 * - Visual: components/clubs/*.
 * - Configuración editable: config/clubs.ts.
 */
export default function ClubesPage() {
  const {
    season,
    setSeason,
    seasons,
    division,
    setDivision,
    divisions,
    loading,
    error,
    clubs,
    divisionClubs,
    titles,
    standings,
    leader,
    nextLeaderMatch,
    summary,
  } = useClubs();

  return (
    <main className="min-h-screen bg-white text-[#102f55]">
      <ClubsHero season={season} division={division} />

      <ClubsFilters
        season={season}
        seasons={seasons}
        onSeasonChange={setSeason}
        division={division}
        divisions={divisions}
        onDivisionChange={setDivision}
      />

      {error ? (
        <div className="mx-auto max-w-[1680px] px-5 py-3 sm:px-8 lg:px-10">
          <div className="rounded-[10px] border border-[#efcaca] bg-[#fff6f6] px-4 py-3 text-[13px] font-bold text-[#934747]">
            {error} Mostramos todo lo que sí está disponible.
          </div>
        </div>
      ) : null}

      <ClubsLeader
        leader={leader}
        season={season}
        division={division}
        nextMatch={nextLeaderMatch}
        clubs={clubs}
      />

      <ClubsSummary summary={summary} loading={loading} />

      <ClubsTable standings={standings} season={season} division={division} />

      <ClubsHonours clubs={divisionClubs} titles={titles} />

      <ClubsFooter />
    </main>
  );
}
