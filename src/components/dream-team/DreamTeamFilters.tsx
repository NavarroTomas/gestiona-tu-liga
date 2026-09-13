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
    <section className="rounded-[26px] border border-sky-400/20 bg-[#0b1f3a]/95 p-4 shadow-[0_0_32px_rgba(0,120,255,.10)] sm:p-5 md:rounded-[32px] md:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-sky-300">
              Selección de jornada
            </p>
            <h2 className="mt-2 text-xl font-black uppercase text-white sm:text-2xl">
              {competitionName} · {contextLabel} {contextValue} · Fecha {fecha}
            </h2>
          </div>
          <p className="max-w-xl text-sm text-sky-100/55">
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
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-sky-100/55 transition group-focus-within:text-sky-200">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-14 w-full appearance-none rounded-2xl border border-sky-300/20 bg-[#143764] px-4 pr-11 text-sm font-black uppercase text-white outline-none transition hover:border-sky-200/40 hover:bg-[#173f73] focus:border-sky-200 focus:bg-[#173f73] focus:ring-2 focus:ring-sky-300/15"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#143764] text-white">
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sky-200">
          ▾
        </span>
      </div>
    </label>
  );
}
