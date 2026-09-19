"use client";

import { useEffect, useState } from "react";
import KnockoutBracket from "@/components/cups/knockout/KnockoutBracket";
import KnockoutCupHero from "@/components/cups/knockout/KnockoutCupHero";
import KnockoutCupTabs from "@/components/cups/knockout/KnockoutCupTabs";
import LeagueFooter from "@/components/league/LeagueFooter";
import {
  COPA_ARGENTINA_CONFIG,
  getCopaArgentinaSeasonFormat,
} from "@/config/copaArgentina";
import { useCopaArgentina } from "@/hooks/useCopaArgentina";
import { usePublicSeasons } from "@/hooks/usePublicSeasons";

/**
 * PÁGINA COPA ARGENTINA
 * ---------------------
 * Esta página solo compone módulos.
 *
 * Si querés cambiar algo vos mismo:
 * - temporadas, textos, fondo y FORMATO POR TEMPORADA -> `src/config/copaArgentina.ts`
 * - datos específicos de Copa Argentina              -> `src/hooks/useCopaArgentina.ts`
 * - consultas/lógica compartida con Copa APA          -> `src/hooks/useKnockoutCup.ts`
 * - armado lógico de rondas                           -> `src/lib/cups/knockout.ts`
 * - aspecto del cuadro                                -> `src/components/cups/knockout/KnockoutBracket.tsx`
 *
 * Para pasar de Cuartos a Octavos en una temporada NO agregues JSX acá:
 * cambiá solamente `formatsBySeason` dentro de la configuración.
 */
export default function CopaArgentinaPage() {
  const { seasons, activeSeason, loading: seasonsLoading } = usePublicSeasons(COPA_ARGENTINA_CONFIG.defaultSeason);
  const [season, setSeason] = useState<string>(COPA_ARGENTINA_CONFIG.defaultSeason);

  useEffect(() => {
    if (!seasonsLoading) setSeason(activeSeason);
  }, [activeSeason, seasonsLoading]);
  const { active, loading, bracket, getLogo } = useCopaArgentina(season);
  const seasonFormat = getCopaArgentinaSeasonFormat(season);

  return (
    <main className="apa-tournament-page min-h-screen bg-[#f4f9fd] text-[#102f55]">
      <KnockoutCupHero season={season} hero={COPA_ARGENTINA_CONFIG.hero} />
      <KnockoutCupTabs
        season={season}
        onSeasonChange={setSeason}
        seasons={seasons}
        tabs={COPA_ARGENTINA_CONFIG.tabs}
        ariaLabel="Secciones de Copa Argentina"
      />

      <section className="mx-auto w-full max-w-[1480px] px-5 py-4 sm:px-8 sm:py-5 lg:px-12">
        {loading ? (
          <section className="rounded-[10px] border border-[#d7e6f0] bg-white px-5 py-14 text-center text-sm font-semibold text-[#7890a7]">
            Cargando cuadro de Copa Argentina…
          </section>
        ) : !active ? (
          <section className="rounded-[10px] border border-[#d7e6f0] bg-white px-5 py-12 text-center">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#56afe2]">Competición pendiente</p>
            <h2 className="mt-2 text-[24px] font-black uppercase tracking-[-.035em] text-[#102f55]">Copa Argentina todavía no está activa</h2>
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
