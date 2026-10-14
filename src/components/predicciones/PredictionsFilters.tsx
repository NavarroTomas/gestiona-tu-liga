"use client";

import {
  PREDICTION_COMPETITIONS,
  PREDICTION_SUBCATEGORIES,
} from "@/config/predicciones";
import type { PrediccionesController } from "@/hooks/usePredicciones";
import type { PredictionCompetition } from "@/lib/predicciones/types";
import PredictionDropdown from "./PredictionDropdown";

/**
 * Selector compacto de contexto.
 * Mantiene el mismo patrón visual usado en Dream Team.
 */
export default function PredictionsFilters(controller: Pick<
  PrediccionesController,
  | "temporada"
  | "temporadas"
  | "setTemporada"
  | "competicion"
  | "cambiarCompeticion"
  | "subcategoria"
  | "setSubcategoria"
  | "fechaActiva"
  | "setFechaActiva"
  | "fechas"
  | "contexto"
>) {
  const contextLabel =
    controller.competicion === "liga"
      ? "División"
      : controller.competicion === "copa_clasificatoria"
        ? "Grupo"
        : "Fase";

  return (
    <section className="rounded-2xl border border-[#c9e3f1] bg-white p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#2d98d4]">Selección de jornada</p>
          <h2 className="mt-2 text-xl font-black uppercase text-[#102f55]">
            {controller.contexto.label} · {controller.fechaActiva === "Todas" ? "Todas las fechas" : `Fecha ${controller.fechaActiva}`}
          </h2>
        </div>
        <p className="text-sm text-[#607b90]">Elegí el torneo y los partidos que querés consultar.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <PredictionDropdown
          label="Torneo"
          value={controller.temporada}
          onChange={controller.setTemporada}
          options={controller.temporadas.map((season) => ({ value: season, label: season }))}
        />
        <PredictionDropdown
          label="Competición"
          value={controller.competicion}
          onChange={(value) => controller.cambiarCompeticion(value as PredictionCompetition)}
          options={PREDICTION_COMPETITIONS}
        />
        <PredictionDropdown
          label={contextLabel}
          value={controller.subcategoria}
          onChange={controller.setSubcategoria}
          options={PREDICTION_SUBCATEGORIES[controller.competicion]}
        />
        <PredictionDropdown
          label="Fecha"
          value={controller.fechaActiva}
          onChange={controller.setFechaActiva}
          options={controller.fechas.map((date) => ({
            value: date,
            label: date === "Todas" ? "Todas" : `Fecha ${date}`,
          }))}
        />
      </div>
    </section>
  );
}
