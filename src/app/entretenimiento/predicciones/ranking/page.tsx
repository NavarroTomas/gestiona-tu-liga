"use client";

import PredictionRankingFilters from "@/components/predicciones/ranking/PredictionRankingFilters";
import PredictionRankingHero from "@/components/predicciones/ranking/PredictionRankingHero";
import PredictionRankingList from "@/components/predicciones/ranking/PredictionRankingList";
import { usePredictionRanking } from "@/hooks/usePredictionRanking";

/**
 * Ensamblador de /entretenimiento/predicciones/ranking.
 *
 * Arquitectura:
 * - estado, filtros, carga y cálculo: src/hooks/usePredictionRanking.ts
 * - hero: src/components/predicciones/ranking/PredictionRankingHero.tsx
 * - filtros: src/components/predicciones/ranking/PredictionRankingFilters.tsx
 * - listado: src/components/predicciones/ranking/PredictionRankingList.tsx
 *
 * La página no consulta Supabase ni calcula puntajes directamente.
 */
export default function RankingPrediccionesPage() {
  const ranking = usePredictionRanking();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f3fafe_0%,#edf7fc_58%,#f7fbfe_100%)] text-[#102f55]">
      <div className="mx-auto max-w-[1680px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <PredictionRankingHero resumen={ranking.resumen} filtroTexto={ranking.filtroTexto} />

        <PredictionRankingFilters controller={ranking} />

        {ranking.mensaje && (
          <section className="rounded-xl border border-[#efb8b8] bg-[#fff4f4] p-4 text-center text-sm font-black text-[#9d3131]">
            {ranking.mensaje}
          </section>
        )}

        <PredictionRankingList ranking={ranking.ranking} loading={ranking.loading} />
      </div>
    </main>
  );
}
