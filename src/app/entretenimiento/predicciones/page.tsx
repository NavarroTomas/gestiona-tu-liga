"use client";

import PredictionMatchCard from "@/components/predicciones/PredictionMatchCard";
import PredictionsFilters from "@/components/predicciones/PredictionsFilters";
import PredictionsHero from "@/components/predicciones/PredictionsHero";
import PredictionsSidebar from "@/components/predicciones/PredictionsSidebar";
import { usePredicciones } from "@/hooks/usePredicciones";

/**
 * Ensamblador de /entretenimiento/predicciones.
 *
 * Arquitectura:
 * - configuración editable: src/config/predicciones.ts
 * - estado y acciones: src/hooks/usePredicciones.ts
 * - acceso a Supabase: src/lib/predicciones/api.ts
 * - tipos: src/lib/predicciones/types.ts
 * - cálculos/reglas puras: src/lib/predicciones/utils.ts
 * - UI: src/components/predicciones/*
 *
 * Esta página no contiene consultas directas a Supabase ni reglas de negocio.
 */
export default function PrediccionesPage() {
  const predictions = usePredicciones();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f3fafe_0%,#edf7fc_58%,#f7fbfe_100%)] text-[#102f55]">
      <div className="mx-auto max-w-[1680px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <PredictionsHero resumen={predictions.resumen} />

        <PredictionsFilters
          temporada={predictions.temporada}
          setTemporada={predictions.setTemporada}
          competicion={predictions.competicion}
          cambiarCompeticion={predictions.cambiarCompeticion}
          subcategoria={predictions.subcategoria}
          setSubcategoria={predictions.setSubcategoria}
          fechaActiva={predictions.fechaActiva}
          setFechaActiva={predictions.setFechaActiva}
          fechas={predictions.fechas}
          contexto={predictions.contexto}
        />

        {predictions.mensaje && (
          <section className="rounded-xl border border-[#acd7eb] bg-[#e9f7fd] p-4 text-center text-sm font-black text-[#102f55]">
            {predictions.mensaje}
          </section>
        )}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#2d98d4]">Partidos</p>
              <h2 className="mt-2 text-2xl font-black uppercase text-[#102f55] md:text-3xl">
                {predictions.contexto.label}
              </h2>
              <p className="mt-2 text-sm text-[#607b90]">
                Podés votar hasta el horario exacto de inicio de cada partido. Después queda bloqueado automáticamente.
              </p>
            </div>

            {predictions.cargando ? (
              <section className="rounded-2xl border border-[#c9e3f1] bg-white p-8 text-center text-sm font-black uppercase tracking-[0.16em] text-[#2d98d4]">
                Cargando predicciones...
              </section>
            ) : predictions.partidos.length === 0 ? (
              <section className="rounded-2xl border border-[#c9e3f1] bg-white p-8 text-center">
                <h3 className="text-2xl font-black uppercase text-[#102f55]">No hay partidos</h3>
                <p className="mt-2 text-sm text-[#607b90]">No hay partidos cargados para este contexto y fecha.</p>
              </section>
            ) : (
              <div className="space-y-4">
                {predictions.partidos.map((match) => (
                  <PredictionMatchCard
                    key={match.partido_id || String(match.id)}
                    match={match}
                    controller={predictions}
                  />
                ))}
              </div>
            )}
          </div>

          <PredictionsSidebar controller={predictions} />
        </section>
      </div>
    </main>
  );
}
