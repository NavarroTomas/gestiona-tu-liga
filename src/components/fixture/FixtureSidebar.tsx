import APASelect from "@/components/ui/APASelect";
import {
  FIXTURE_CONFIG,
  getFixtureCompetition,
  type FixtureCompetitionId,
} from "@/config/fixture";

type FixtureSidebarProps = {
  competitionId: FixtureCompetitionId;
  onCompetitionChange: (id: FixtureCompetitionId) => void;
  season: string;
  seasons: string[];
  onSeasonChange: (season: string) => void;
  division: string;
  onDivisionChange: (division: string) => void;
  group: string;
  onGroupChange: (group: string) => void;
  compact?: boolean;
};

/**
 * Navegación y filtros del Fixture.
 *
 * `compact=true` se usa en teléfono/tablet: reemplaza la lista vertical de
 * competencias por selects grandes y táctiles. En desktop conserva el lateral
 * completo de la referencia.
 *
 * Las opciones se editan en `src/config/fixture.ts`.
 */
export default function FixtureSidebar({
  competitionId,
  onCompetitionChange,
  season,
  seasons,
  onSeasonChange,
  division,
  onDivisionChange,
  group,
  onGroupChange,
  compact = false,
}: FixtureSidebarProps) {
  const competition = getFixtureCompetition(competitionId);

  if (compact) {
    return (
      <section className="border-b border-[#d5e7f1] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[.14em] text-[#4e7ba4]">
              Competencia
            </span>
            <APASelect
              value={competitionId}
              onChange={(value) => onCompetitionChange(value as FixtureCompetitionId)}
              options={FIXTURE_CONFIG.competitions.map((item) => ({ value: item.id, label: `${item.label} · ${item.description}` }))}
              ariaLabel="Competencia"
            />
          </label>

          {competition.divisions ? (
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[.14em] text-[#4e7ba4]">
                División
              </span>
              <APASelect value={division} onChange={onDivisionChange} options={competition.divisions.map((item) => ({ value: item, label: item }))} ariaLabel="División" />
            </label>
          ) : null}

          {competition.groups ? (
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[.14em] text-[#4e7ba4]">
                Grupo
              </span>
              <APASelect value={group} onChange={onGroupChange} options={competition.groups.map((item) => ({ value: item, label: `Grupo ${item}` }))} ariaLabel="Grupo" />
            </label>
          ) : null}

          <label className={`block ${!competition.divisions && !competition.groups ? "sm:col-span-2" : ""}`}>
            <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[.14em] text-[#4e7ba4]">
              Temporada
            </span>
            <APASelect value={season} onChange={onSeasonChange} options={seasons.map((item) => ({ value: item, label: item }))} ariaLabel="Temporada" />
          </label>
        </div>
      </section>
    );
  }

  return (
    <aside className="min-h-full border-r border-[#d5e7f1] bg-white/88">
      <div className="sticky top-0 px-6 py-7">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[.17em] text-[#4e7ba4]">
          Competencias
        </p>

        <div className="grid gap-1.5">
          {FIXTURE_CONFIG.competitions.map((item) => {
            const active = item.id === competitionId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onCompetitionChange(item.id)}
                className={`relative min-h-[54px] rounded-[8px] border px-4 py-2.5 text-left transition ${
                  active
                    ? "border-[#cbe6f5] bg-[#e6f4fc] text-[#102f55]"
                    : "border-transparent bg-transparent text-[#294d72] hover:bg-[#f3fafe]"
                }`}
              >
                {active ? <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-[#2c9ff0]" /> : null}
                <strong className="block text-[13px] font-black">{item.label}</strong>
                <span className="mt-0.5 block text-[10px] font-semibold text-[#7890a7]">{item.description}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 grid gap-4 border-t border-[#d8e8f1] pt-6">
          {competition.divisions ? (
            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[.15em] text-[#4e7ba4]">División</span>
              <APASelect value={division} onChange={onDivisionChange} options={competition.divisions.map((item) => ({ value: item, label: item }))} ariaLabel="División" compact />
            </label>
          ) : null}

          {competition.groups ? (
            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[.15em] text-[#4e7ba4]">Grupo</span>
              <APASelect value={group} onChange={onGroupChange} options={competition.groups.map((item) => ({ value: item, label: `Grupo ${item}` }))} ariaLabel="Grupo" compact />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[.15em] text-[#4e7ba4]">Temporada</span>
            <APASelect value={season} onChange={onSeasonChange} options={seasons.map((item) => ({ value: item, label: item }))} ariaLabel="Temporada" compact />
          </label>
        </div>

        <div className="mt-8 border-t border-[#d8e8f1] pt-6 text-[10px] font-semibold uppercase leading-5 tracking-[.14em] text-[#6f879d]">
          El fútbol virtual<br />también nos une.
          <span className="mt-3 block h-[2px] w-8 bg-[#56afe2]" />
        </div>
      </div>
    </aside>
  );
}
