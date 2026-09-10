"use client";

import { useState } from "react";
import KnockoutBracket from "@/components/cups/knockout/KnockoutBracket";
import KnockoutCupHero from "@/components/cups/knockout/KnockoutCupHero";
import KnockoutCupTabs from "@/components/cups/knockout/KnockoutCupTabs";
import LeagueFooter from "@/components/league/LeagueFooter";
import {
  COPA_CAMPEONES_CONFIG,
  getCopaCampeonesSeasonFormat,
} from "@/config/copaCampeones";
import { useCopaCampeones } from "@/hooks/useCopaCampeones";
import { withCopaCampeonesPlaceholders } from "@/lib/cups/champions";

/**
 * PÁGINA COPA DE CAMPEONES
 * ------------------------
 * Esta página solo ensambla módulos.
 *
 * PARA CAMBIAR COSAS VOS MISMO:
 * - temporadas, formato, cruces base y textos -> `src/config/copaCampeones.ts`
 * - consulta de datos                         -> `src/hooks/useCopaCampeones.ts`
 * - datos comunes de copas knockout           -> `src/hooks/useKnockoutCup.ts`
 * - placeholders del cuadro                   -> `src/lib/cups/champions.ts`
 * - aspecto del bracket                       -> `src/components/cups/knockout/KnockoutBracket.tsx`
 *
 * Temporada 4: SEMIFINALES -> FINAL.
 */
export default function CopaCampeonesPage() {
  const [season, setSeason] = useState<string>(COPA_CAMPEONES_CONFIG.defaultSeason);
  const { loading, bracket, getLogo } = useCopaCampeones(season);
  const seasonFormat = getCopaCampeonesSeasonFormat(season);
  const displayBracket = withCopaCampeonesPlaceholders(bracket, season);

  return (
    <main className="min-h-screen bg-[#f4f9fd] text-[#102f55]">
      <KnockoutCupHero season={season} hero={COPA_CAMPEONES_CONFIG.hero} />
      <KnockoutCupTabs
        season={season}
        onSeasonChange={setSeason}
        seasons={COPA_CAMPEONES_CONFIG.seasons}
        tabs={COPA_CAMPEONES_CONFIG.tabs}
        ariaLabel="Secciones de Copa de Campeones"
      />

      <section className="mx-auto w-full max-w-[1480px] px-5 py-4 sm:px-8 sm:py-5 lg:px-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#56afe2]">Torneo de campeones</p>
            <h2 className="mt-1 text-[20px] font-black uppercase tracking-[-.03em] text-[#102f55] sm:text-[23px]">
              Cuatro campeones · Un campeón absoluto
            </h2>
          </div>
          <p className="max-w-[520px] text-[10px] font-semibold leading-5 text-[#7890a7] sm:text-right sm:text-[11px]">
            Primera División, Segunda División, Copa Argentina y Copa APA se cruzan para definir al campeón máximo de la temporada.
          </p>
        </div>

        {loading ? (
          <section className="rounded-[10px] border border-[#d7e6f0] bg-white px-5 py-14 text-center text-sm font-semibold text-[#7890a7]">
            Cargando Copa de Campeones…
          </section>
        ) : (
          <div className="mx-auto w-fit max-w-full">
            <KnockoutBracket
              bracket={displayBracket}
              getLogo={getLogo}
              rounds={seasonFormat.rounds}
              showThirdPlace={seasonFormat.showThirdPlace}
            />
          </div>
        )}

        <div className="mx-auto mt-4 max-w-[960px] border-t border-[#d7e6f0] pt-4 text-center text-[11px] font-semibold leading-5 text-[#6f879d]">
          Los nombres de los campeones aparecen como referencia mientras no exista el partido real en Supabase. Al cargar cada semifinal o la final, el cruce real reemplaza automáticamente ese texto.
        </div>
      </section>

      <LeagueFooter />
    </main>
  );
}
