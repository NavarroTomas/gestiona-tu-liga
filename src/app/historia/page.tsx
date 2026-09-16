"use client";

import HistoryAwards from "@/components/history/HistoryAwards";
import HistoryCompetitions from "@/components/history/HistoryCompetitions";
import HistoryFooter from "@/components/history/HistoryFooter";
import HistoryHero from "@/components/history/HistoryHero";
import HistoryHighlights from "@/components/history/HistoryHighlights";
import HistoryHonours from "@/components/history/HistoryHonours";
import HistoryRecords from "@/components/history/HistoryRecords";
import HistoryStandings from "@/components/history/HistoryStandings";
import HistorySummary from "@/components/history/HistorySummary";
import { useHistory } from "@/hooks/useHistory";

/**
 * /historia solo ensambla la pantalla.
 *
 * Datos y automatización: useHistory
 * Reglas/cálculos: lib/history.ts
 * Configuración: config/history.ts
 * Visual: components/history/*
 */
export default function HistoriaPage() {
  const {
    season,
    setSeason,
    seasons,
    loading,
    globalLoading,
    error,
    clubs,
    summary,
    tables,
    highlights,
    champions,
    competitions,
    awards,
    titles,
    seasonRecords,
    historicalRecords,
  } = useHistory();

  return (
    <main className="min-h-screen bg-[#f5fbfe] text-[#102f55]">
      <HistoryHero season={season} seasons={seasons} onSeasonChange={setSeason} />

      {error ? (
        <div className="mx-auto max-w-[1680px] px-5 pt-4 sm:px-8 lg:px-10">
          <div className="rounded-lg border border-[#efcaca] bg-[#fff6f6] px-4 py-3 text-[13px] font-bold leading-5 text-[#934747]">
            {error} Mostramos todo lo que sí está disponible.
          </div>
        </div>
      ) : null}

      <HistorySummary
        season={season}
        loading={loading}
        summary={summary}
        champions={champions}
        clubs={clubs}
      />

      <HistoryHonours titles={titles} clubs={clubs} />

      <HistoryStandings tables={tables} clubs={clubs} />

      <HistoryHighlights highlights={highlights} clubs={clubs} loading={loading} />

      <HistoryCompetitions competitions={competitions} clubs={clubs} />

      <HistoryAwards awards={awards} clubs={clubs} />

      <HistoryRecords
        seasonRecords={seasonRecords}
        historicalRecords={historicalRecords}
        globalLoading={globalLoading}
      />

      <HistoryFooter />
    </main>
  );
}
