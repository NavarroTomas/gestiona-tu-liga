"use client";

import {
  DREAM_TEAM_COMPETITIONS,
  DREAM_TEAM_CONFIG,
} from "@/config/dreamTeam";
import type { DreamTeamController } from "@/hooks/useDreamTeam";

export default function DreamTeamFilters({
  temporada,
  setTemporada,
  competicion,
  setCompetition,
  division,
  setDivisionFilter,
  grupo,
  setGroupFilter,
  fase,
  setPhaseFilter,
  fecha,
  setFecha,
  fechas,
  fasesDisponibles,
}: Pick<
  DreamTeamController,
  | "temporada"
  | "setTemporada"
  | "competicion"
  | "setCompetition"
  | "division"
  | "setDivisionFilter"
  | "grupo"
  | "setGroupFilter"
  | "fase"
  | "setPhaseFilter"
  | "fecha"
  | "setFecha"
  | "fechas"
  | "fasesDisponibles"
>) {
  const contextLabel =
    competicion === "liga"
      ? "División"
      : competicion === "copa_clasificatoria"
        ? "Grupo"
        : "Fase";

  const contextValue =
    competicion === "liga"
      ? division
      : competicion === "copa_clasificatoria"
        ? grupo
        : fase;

  const contextOptions =
    competicion === "liga"
      ? DREAM_TEAM_CONFIG.divisions.map((item) => ({ value: item, label: item }))
      : competicion === "copa_clasificatoria"
        ? DREAM_TEAM_CONFIG.groups.map((item) => ({ value: item, label: `Grupo ${item}` }))
        : fasesDisponibles.map((item) => ({ value: item, label: item }));

  const setContextValue = (value: string) => {
    if (competicion === "liga") {
      setDivisionFilter(value);
      return;
    }

    if (competicion === "copa_clasificatoria") {
      setGroupFilter(value);
      return;
    }

    setPhaseFilter(value);
  };

  const competitionName =
    DREAM_TEAM_COMPETITIONS.find((item) => item.value === competicion)?.label || competicion;

  return (
    <section className="rounded-[26px] border border-sky-500/20 bg-white p-4 shadow-[0_0_32px_rgba(0,120,255,.08)] sm:p-5 md:rounded-[32px] md:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#2d98d4]">
              Selección de jornada
            </p>
            <h2 className="mt-2 text-xl font-black uppercase text-[#102f55] sm:text-2xl">
              {competitionName} · {contextLabel} {contextValue} · Fecha {fecha}
            </h2>
          </div>
          <p className="max-w-xl text-sm text-[#607b90]">
            Elegí el torneo y la jornada que querés votar o consultar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CompactSelect
            label="Temporada"
            value={temporada}
            onChange={setTemporada}
            options={DREAM_TEAM_CONFIG.seasons.map((season) => ({
              value: season,
              label: season,
            }))}
          />

          <CompactSelect
            label="Competición"
            value={competicion}
            onChange={(value) => setCompetition(value as typeof competicion)}
            options={DREAM_TEAM_COMPETITIONS.map((competition) => ({
              value: competition.value,
              label: competition.label,
            }))}
          />

          <CompactSelect
            label={contextLabel}
            value={contextValue}
            onChange={setContextValue}
            options={contextOptions}
          />

          <CompactSelect
            label="Fecha"
            value={fecha}
            onChange={setFecha}
            options={fechas.map((item) => ({
              value: item,
              label: `Fecha ${item}`,
            }))}
          />
        </div>
      </div>
    </section>
  );
}

function CompactSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="group block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-[#607b90] transition group-focus-within:text-[#2d98d4]">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-14 w-full appearance-none rounded-2xl border border-[#1f4f80] bg-[#102f55] px-4 pr-11 text-sm font-black uppercase text-white outline-none transition hover:border-[#56afe2] hover:bg-[#163c6c] focus:border-[#56afe2] focus:bg-[#163c6c] focus:ring-2 focus:ring-[#56afe2]/20"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#102f55] text-white">
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8ed2f3]">
          ▾
        </span>
      </div>
    </label>
  );
}
