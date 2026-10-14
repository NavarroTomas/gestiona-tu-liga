"use client";

import PredictionDropdown from "@/components/predicciones/PredictionDropdown";
import {
  RANKING_CHAMPIONS_PHASES,
  RANKING_COMPETITIONS,
  RANKING_DIVISIONS,
  RANKING_GROUPS,
  RANKING_PHASES,
  RANKING_PLAYOFF_PHASES,
  type PredictionRankingController,
  type RankingCompetition,
} from "@/hooks/usePredictionRanking";

/** Filtros compactos del ranking. Reutiliza el dropdown visual de Predicciones. */
export default function PredictionRankingFilters({ controller }: { controller: PredictionRankingController }) {
  const phaseOptions =
    controller.competicion === "copa_campeones"
      ? RANKING_CHAMPIONS_PHASES
      : controller.competicion === "playoffs"
        ? RANKING_PLAYOFF_PHASES
        : RANKING_PHASES;

  return (
    <section className="rounded-2xl border border-[#c9e3f1] bg-white p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2d98d4]">Filtrar ranking</p>
          <p className="mt-1 text-sm text-[#607b90]">Elegí el contexto que querés consultar.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <PredictionDropdown
          label="Torneo"
          value={controller.temporada}
          options={controller.temporadas.map((value) => ({ value, label: value }))}
          onChange={controller.setTemporada}
        />
        <PredictionDropdown
          label="Competición"
          value={controller.competicion}
          options={RANKING_COMPETITIONS}
          onChange={(value) => controller.setCompeticion(value as RankingCompetition)}
        />

        {controller.competicion === "liga" && (
          <PredictionDropdown
            label="División"
            value={controller.division}
            options={RANKING_DIVISIONS}
            onChange={controller.setDivision}
          />
        )}

        {controller.competicion === "copa_clasificatoria" && (
          <PredictionDropdown
            label="Grupo"
            value={controller.grupo}
            options={RANKING_GROUPS}
            onChange={controller.setGrupo}
          />
        )}

        {!["todas", "liga", "copa_clasificatoria"].includes(controller.competicion) && (
          <PredictionDropdown
            label="Fase"
            value={controller.fase}
            options={phaseOptions}
            onChange={controller.setFase}
          />
        )}
      </div>
    </section>
  );
}
