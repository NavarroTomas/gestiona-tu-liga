"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import PlayoffsHero from "@/components/playoffs/PlayoffsHero";
import PlayoffsRoad from "@/components/playoffs/PlayoffsRoad";
import PlayoffsTabs from "@/components/playoffs/PlayoffsTabs";
import LeagueFooter from "@/components/league/LeagueFooter";
import { PLAYOFFS_CONFIG, getPlayoffsSeasonFormat } from "@/config/playoffs";
import { usePlayoffs } from "@/hooks/usePlayoffs";

/**
 * PÁGINA PLAYOFFS DE ASCENSO
 * --------------------------
 * Esta página solo ensambla módulos.
 *
 * PARA CAMBIAR COSAS VOS MISMO:
 * - temporadas, fases, textos y formato -> `src/config/playoffs.ts`
 * - consultas/datos de Supabase         -> `src/hooks/usePlayoffs.ts`
 * - detección y armado de las fases     -> `src/lib/playoffs.ts`
 * - aspecto del camino                  -> `src/components/playoffs/PlayoffsRoad.tsx`
 * - hero                                -> `src/components/playoffs/PlayoffsHero.tsx`
 *
 * Los enlaces antiguos con ?temporada= siguen funcionando.
 */
function PlayoffsContent() {
  const searchParams = useSearchParams();
  const seasonFromUrl = searchParams.get("temporada");
  const initialSeason = PLAYOFFS_CONFIG.seasons.includes(
    seasonFromUrl as (typeof PLAYOFFS_CONFIG.seasons)[number],
  )
    ? String(seasonFromUrl)
    : PLAYOFFS_CONFIG.defaultSeason;

  const [season, setSeason] = useState<string>(initialSeason);
  const { loading, road, getLogo } = usePlayoffs(season);
  const seasonFormat = getPlayoffsSeasonFormat(season);

  const formatLabel = seasonFormat.stages
    .map((stageId) => PLAYOFFS_CONFIG.stageDefinitions[stageId].label)
    .join(" · ");

  return (
    <main className="min-h-screen bg-[#f4f9fd] text-[#102f55]">
      <PlayoffsHero season={season} />
      <PlayoffsTabs season={season} onSeasonChange={setSeason} />

      <section className="mx-auto w-full max-w-[1480px] px-5 py-4 sm:px-8 sm:py-5 lg:px-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#56afe2]">Camino al ascenso</p>
            <h2 className="mt-1 text-[20px] font-black uppercase tracking-[-.03em] text-[#102f55] sm:text-[23px]">
              Segunda División → Primera División
            </h2>
          </div>
          <p className="text-[10px] font-bold text-[#7890a7] sm:text-[11px]">{formatLabel}</p>
        </div>

        {loading ? (
          <section className="rounded-[10px] border border-[#d7e6f0] bg-white px-5 py-14 text-center text-sm font-semibold text-[#7890a7]">
            Cargando Playoffs de Ascenso…
          </section>
        ) : (
          <PlayoffsRoad road={road} getLogo={getLogo} stages={seasonFormat.stages} />
        )}

        <div className="mt-4 border-t border-[#d7e6f0] pt-4 text-[11px] font-semibold leading-5 text-[#6f879d]">
          El ganador de la Final de Ascenso disputa la Promoción contra el anteúltimo de Primera División. El resultado de esa serie define quién ocupa la plaza en Primera la temporada siguiente.
        </div>
      </section>

      <LeagueFooter />
    </main>
  );
}

export default function PlayoffsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f4f9fd] text-[#102f55]">
          <div className="flex min-h-[320px] items-center justify-center text-sm font-bold text-[#7890a7]">
            Cargando Playoffs de Ascenso…
          </div>
        </main>
      }
    >
      <PlayoffsContent />
    </Suspense>
  );
}
