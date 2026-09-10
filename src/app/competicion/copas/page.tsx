"use client";

import { useState } from "react";
import CupControls from "@/components/cups/CupControls";
import CupGroupStandings from "@/components/cups/CupGroupStandings";
import CupsHero from "@/components/cups/CupsHero";
import CupSidebar from "@/components/cups/CupSidebar";
import CupsTabs from "@/components/cups/CupsTabs";
import LeagueFooter from "@/components/league/LeagueFooter";
import { CUPS_CONFIG } from "@/config/cups";
import { useCupGroups } from "@/hooks/useCupGroups";

/**
 * Esta página queda intencionalmente "tonta": solo compone piezas.
 *
 * Para agregar grupos, temporadas o cambiar reglas NO edites este archivo:
 * hacelo desde `src/config/cups.ts`.
 * Para cambiar consultas de Supabase: `src/hooks/useCupGroups.ts`.
 * Para cambiar el cálculo de la tabla: `src/lib/cups/calculateGroupStandings.ts`.
 */
export default function CopasPublicPage() {
  const [season, setSeason] = useState<string>(CUPS_CONFIG.defaultSeason);
  const [group, setGroup] = useState<string>(CUPS_CONFIG.defaultGroup);

  const {
    loading,
    standings,
    nextMatch,
    nextMatchdayMatches,
    getLogo,
  } = useCupGroups(season, group);

  return (
    <main className="min-h-screen bg-[#f4f9fd] text-[#102f55]">
      <CupsHero season={season} />
      <CupsTabs activeId="grupos" />

      <section className="mx-auto w-full max-w-[1480px] px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
        <CupControls
          season={season}
          group={group}
          onSeasonChange={setSeason}
          onGroupChange={setGroup}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-6">
          <CupGroupStandings
            group={group}
            rows={standings}
            loading={loading}
            getLogo={getLogo}
          />

          <CupSidebar
            nextMatch={nextMatch}
            matchdayMatches={nextMatchdayMatches}
            getLogo={getLogo}
          />
        </div>
      </section>

      <LeagueFooter />
    </main>
  );
}
