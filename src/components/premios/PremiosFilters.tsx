"use client";

import PredictionDropdown from "@/components/predicciones/PredictionDropdown";
import {
  PREMIOS_COMPETICIONES,
  PREMIOS_CONTEXTOS,
  type PremiosController,
  type PremioCompeticion,
} from "@/hooks/usePremios";

export default function PremiosFilters({ controller }: { controller: PremiosController }) {
  const subcategorias = PREMIOS_CONTEXTOS.filter((item) => item.competicion === controller.contexto.competicion);

  return (
    <section className="rounded-2xl border border-[#c9e3f1] bg-white p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2d98d4]">Selección de jornada</p>
          <h2 className="mt-1 text-xl font-black uppercase text-[#102f55]">{controller.contexto.label} · Fecha {controller.fecha}</h2>
        </div>
        <p className="text-xs text-[#607b90]">Elegí el torneo y la jornada que querés consultar.</p>
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
          value={controller.contexto.competicion}
          options={PREMIOS_COMPETICIONES}
          onChange={(value) => controller.cambiarCompeticion(value as PremioCompeticion)}
        />
        <PredictionDropdown
          label={controller.contexto.competicion === "liga" ? "División" : controller.contexto.competicion === "copa_clasificatoria" ? "Grupo" : "Fase"}
          value={controller.contextoId}
          options={subcategorias.map((item) => ({ value: item.id, label: item.badge }))}
          onChange={(value) => { controller.setContextoId(value); controller.setFecha("1"); }}
        />
        <PredictionDropdown
          label="Fecha"
          value={controller.fecha}
          options={controller.fechas.length ? controller.fechas.map((value) => ({ value, label: `Fecha ${value}` })) : [{ value: controller.fecha, label: "Sin fechas" }]}
          onChange={controller.setFecha}
        />
      </div>
    </section>
  );
}
