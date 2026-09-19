"use client";

import { useEffect, useState } from "react";
import TablaDivision from "@/components/TablaDivision";
import LeagueFilters from "@/components/league/LeagueFilters";
import LeagueFooter from "@/components/league/LeagueFooter";
import LeagueHero from "@/components/league/LeagueHero";
import LeagueSidebar from "@/components/league/LeagueSidebar";
import LeagueTabs from "@/components/league/LeagueTabs";
import { LEAGUE_CONFIG } from "@/config/league";
import { useLeagueMatches } from "@/hooks/useLeagueMatches";
import { usePublicSeasons } from "@/hooks/usePublicSeasons";

export default function DivisionesPage() {
  const { seasons, activeSeason, loading: seasonsLoading } = usePublicSeasons(LEAGUE_CONFIG.defaultSeason);
  const [temporada, setTemporada] = useState<string>(LEAGUE_CONFIG.defaultSeason);
  const [division, setDivision] = useState<string>(LEAGUE_CONFIG.defaultDivision);

  useEffect(() => {
    if (!seasonsLoading) setTemporada(activeSeason);
  }, [activeSeason, seasonsLoading]);

  const { ultimosResultados, proximosPartidos, obtenerLogo } = useLeagueMatches(
    temporada,
    division,
  );

  return (
    <main className="min-h-screen bg-[#f4f9fd] text-[#102f55]">
      <LeagueHero temporada={temporada} division={division} />
      <LeagueTabs activeId="tabla" />

      <section className="mx-auto w-full max-w-[1480px] px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
        <LeagueFilters
          temporada={temporada}
          seasons={seasons}
          division={division}
          onTemporadaChange={setTemporada}
          onDivisionChange={setDivision}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_405px] xl:gap-6">
          <section className="min-w-0">
            <TablaDivision temporada={temporada} division={division} />
          </section>

          <LeagueSidebar
            proximosPartidos={proximosPartidos}
            ultimosResultados={ultimosResultados}
            obtenerLogo={obtenerLogo}
          />
        </div>
      </section>

      <LeagueFooter />
    </main>
  );
}
