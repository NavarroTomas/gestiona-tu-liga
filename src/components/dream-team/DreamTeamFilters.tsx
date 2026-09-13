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
  return (
    <section className="rounded-[28px] border border-sky-500/25 bg-[#020714] p-5 sm:rounded-[34px] md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]">
      <div className="grid gap-7">
        <FilterGroup label="Temporada">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {DREAM_TEAM_CONFIG.seasons.map((season) => (
              <FilterButton
                key={season}
                active={temporada === season}
                onClick={() => setTemporada(season)}
              >
                {season}
              </FilterButton>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label="Competencia">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {DREAM_TEAM_COMPETITIONS.map((competition) => (
              <FilterButton
                key={competition.value}
                active={competicion === competition.value}
                onClick={() => setCompetition(competition.value)}
              >
                {competition.label}
              </FilterButton>
            ))}
          </div>
        </FilterGroup>

        {competicion === "liga" && (
          <FilterGroup label="División">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {DREAM_TEAM_CONFIG.divisions.map((item) => (
                <FilterButton
                  key={item}
                  active={division === item}
                  onClick={() => setDivisionFilter(item)}
                >
                  {item}
                </FilterButton>
              ))}
            </div>
          </FilterGroup>
        )}

        {competicion === "copa_clasificatoria" && (
          <FilterGroup label="Grupo">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {DREAM_TEAM_CONFIG.groups.map((item) => (
                <FilterButton
                  key={item}
                  active={grupo === item}
                  onClick={() => setGroupFilter(item)}
                >
                  Grupo {item}
                </FilterButton>
              ))}
            </div>
          </FilterGroup>
        )}

        {["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(
          competicion,
        ) && (
          <FilterGroup label="Fase">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {fasesDisponibles.map((item) => (
                <FilterButton
                  key={item}
                  active={fase === item}
                  onClick={() => setPhaseFilter(item)}
                >
                  {item}
                </FilterButton>
              ))}
            </div>
          </FilterGroup>
        )}

        <FilterGroup label="Fecha">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {fechas.map((item) => (
              <FilterButton key={item} active={fecha === item} onClick={() => setFecha(item)}>
                Fecha {item}
              </FilterButton>
            ))}
          </div>
        </FilterGroup>
      </div>
    </section>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
        {label}
      </p>
      {children}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase transition-all sm:px-4 sm:py-4 sm:text-sm ${
        active
          ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
          : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
