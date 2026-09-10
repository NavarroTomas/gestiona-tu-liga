"use client";

import { useState } from "react";
import KnockoutBracket from "@/components/cups/knockout/KnockoutBracket";
import KnockoutCupHero from "@/components/cups/knockout/KnockoutCupHero";
import KnockoutCupTabs from "@/components/cups/knockout/KnockoutCupTabs";
import LeagueFooter from "@/components/league/LeagueFooter";
import { COPA_APA_CONFIG, getCopaApaSeasonFormat } from "@/config/copaApa";
import { useCopaApa } from "@/hooks/useCopaApa";

/**
 * PÁGINA COPA APA
 * ---------------
 * Usa exactamente el mismo sistema visual de Copa Argentina, pero con sus
 * propios datos, activación y formato por temporada.
 *
 * PARA CAMBIAR COSAS VOS MISMO:
 * - temporadas, título, fondo y rondas -> `src/config/copaApa.ts`
 * - datos específicos de Copa APA     -> `src/hooks/useCopaApa.ts`
 * - consultas comunes de ambas copas  -> `src/hooks/useKnockoutCup.ts`
 * - lógica de rondas                   -> `src/lib/cups/knockout.ts`
 * - diseño del bracket                 -> `src/components/cups/knockout/KnockoutBracket.tsx`
 *
 * En Temporada 4 el formato configurado es:
 * CUARTOS -> SEMIFINALES -> FINAL.
 */
export default function CopaApaPage() {
  const [season, setSeason] = useState<string>(COPA_APA_CONFIG.defaultSeason);
  const { active, loading, bracket, getLogo } = useCopaApa(season);
  const seasonFormat = getCopaApaSeasonFormat(season);

  return (
    <main className="min-h-screen bg-[#f4f9fd] text-[#102f55]">
      <KnockoutCupHero season={season} hero={COPA_APA_CONFIG.hero} />
      <KnockoutCupTabs
        season={season}
        onSeasonChange={setSeason}
        seasons={COPA_APA_CONFIG.seasons}
        tabs={COPA_APA_CONFIG.tabs}
        ariaLabel="Secciones de Copa APA"
      />

      <section className="mx-auto w-full max-w-[1480px] px-5 py-4 sm:px-8 sm:py-5 lg:px-12">
        {loading ? (
          <section className="rounded-[10px] border border-[#d7e6f0] bg-white px-5 py-14 text-center text-sm font-semibold text-[#7890a7]">
            Cargando cuadro de Copa APA…
          </section>
        ) : !active ? (
          <section className="rounded-[10px] border border-[#d7e6f0] bg-white px-5 py-12 text-center">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#56afe2]">Competición pendiente</p>
            <h2 className="mt-2 text-[24px] font-black uppercase tracking-[-.035em] text-[#102f55]">Copa APA todavía no está activa</h2>
            <p className="mx-auto mt-2 max-w-[640px] text-[12px] font-semibold leading-5 text-[#6a839b]">
              Cuando la habilites para {season} y cargues los cruces en Supabase, este cuadro se completa automáticamente.
            </p>
          </section>
        ) : (
          <KnockoutBracket
            bracket={bracket}
            getLogo={getLogo}
            rounds={seasonFormat.rounds}
            showThirdPlace={seasonFormat.showThirdPlace}
          />
        )}
      </section>

      <LeagueFooter />
    </main>
  );
}
