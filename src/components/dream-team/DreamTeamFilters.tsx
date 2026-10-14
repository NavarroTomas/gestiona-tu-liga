"use client";

import { useEffect, useRef, useState } from "react";
import {
  DREAM_TEAM_COMPETITIONS,
  DREAM_TEAM_CONFIG,
} from "@/config/dreamTeam";
import type { DreamTeamController } from "@/hooks/useDreamTeam";

export default function DreamTeamFilters({
  temporada,
  temporadas,
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
  | "temporadas"
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
          <CompactDropdown
            label="Torneo"
            value={temporada}
            onChange={setTemporada}
            options={temporadas.map((season) => ({
              value: season,
              label: season,
            }))}
          />

          <CompactDropdown
            label="Competición"
            value={competicion}
            onChange={(value) => setCompetition(value as typeof competicion)}
            options={DREAM_TEAM_COMPETITIONS.map((competition) => ({
              value: competition.value,
              label: competition.label,
            }))}
          />

          <CompactDropdown
            label={contextLabel}
            value={contextValue}
            onChange={setContextValue}
            options={contextOptions}
          />

          <CompactDropdown
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

function CompactDropdown({
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const choose = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-[#607b90]">
        {label}
      </span>

      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((current) => !current);
          }
          if (event.key === "Escape") setOpen(false);
        }}
        className="flex h-14 w-full cursor-pointer items-center justify-between rounded-2xl border border-[#2d98d4]/35 bg-[#102f55] px-4 text-sm font-black uppercase text-white outline-none transition hover:bg-[#173f73] focus:border-[#56afe2] focus:ring-2 focus:ring-[#56afe2]/20"
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <span
          className={`ml-3 text-[#8ed2f3] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </div>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] max-h-72 overflow-y-auto rounded-2xl border border-[#56afe2]/45 bg-[#102f55] p-1.5 shadow-[0_16px_40px_rgba(16,47,85,.28)]"
        >
          {options.map((option) => {
            const active = option.value === value;

            return (
              <div
                key={option.value}
                role="option"
                aria-selected={active}
                tabIndex={0}
                onClick={() => choose(option.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    choose(option.value);
                  }
                }}
                className={`cursor-pointer rounded-xl px-3 py-3 text-xs font-black uppercase transition sm:text-sm ${
                  active
                    ? "bg-[#2d98d4] text-white"
                    : "text-white hover:bg-[#173f73]"
                }`}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
