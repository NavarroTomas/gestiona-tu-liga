import {
  FIXTURE_CONFIG,
  getFixtureCompetition,
  type FixtureCompetitionId,
} from "@/config/fixture";

const selectStyle = {
  backgroundColor: "#f3fafe",
  color: "#102f55",
  borderColor: "#c9e3f1",
} as const;

/**
 * Lateral de navegación del Fixture.
 * Las competencias, temporadas, divisiones y grupos se editan en
 * `src/config/fixture.ts`. El filtro de equipo queda sobre el calendario,
 * como en la referencia visual.
 */
export default function FixtureSidebar({
  competitionId,
  onCompetitionChange,
  season,
  onSeasonChange,
  division,
  onDivisionChange,
  group,
  onGroupChange,
}: {
  competitionId: FixtureCompetitionId;
  onCompetitionChange: (id: FixtureCompetitionId) => void;
  season: string;
  onSeasonChange: (season: string) => void;
  division: string;
  onDivisionChange: (division: string) => void;
  group: string;
  onGroupChange: (group: string) => void;
}) {
  const competition = getFixtureCompetition(competitionId);

  return (
    <aside className="border-b border-[#d5e7f1] bg-white/88 lg:min-h-full lg:border-b-0 lg:border-r">
      <div className="px-5 py-5 sm:px-7 lg:sticky lg:top-0 lg:px-6 lg:py-7">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[.17em] text-[#4e7ba4]">
          Competencias
        </p>

        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
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
                {active ? (
                  <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-[#2c9ff0]" />
                ) : null}
                <strong className="block text-[13px] font-black">{item.label}</strong>
                <span className="mt-0.5 block text-[10px] font-semibold text-[#7890a7]">
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 grid gap-4 border-t border-[#d8e8f1] pt-6 sm:grid-cols-2 lg:grid-cols-1">
          {competition.divisions ? (
            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[.15em] text-[#4e7ba4]">
                División
              </span>
              <select
                value={division}
                onChange={(event) => onDivisionChange(event.target.value)}
                style={selectStyle}
                className="h-11 w-full rounded-[8px] border px-3 text-[12px] font-bold outline-none focus:border-[#56afe2]"
              >
                {competition.divisions.map((item) => (
                  <option key={item} value={item} style={selectStyle}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {competition.groups ? (
            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[.15em] text-[#4e7ba4]">
                Grupo
              </span>
              <select
                value={group}
                onChange={(event) => onGroupChange(event.target.value)}
                style={selectStyle}
                className="h-11 w-full rounded-[8px] border px-3 text-[12px] font-bold outline-none focus:border-[#56afe2]"
              >
                {competition.groups.map((item) => (
                  <option key={item} value={item} style={selectStyle}>
                    Grupo {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[.15em] text-[#4e7ba4]">
              Temporada
            </span>
            <select
              value={season}
              onChange={(event) => onSeasonChange(event.target.value)}
              style={selectStyle}
              className="h-11 w-full rounded-[8px] border px-3 text-[12px] font-bold outline-none focus:border-[#56afe2]"
            >
              {FIXTURE_CONFIG.seasons.map((item) => (
                <option key={item} value={item} style={selectStyle}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 hidden border-t border-[#d8e8f1] pt-6 text-[10px] font-semibold uppercase leading-5 tracking-[.14em] text-[#6f879d] lg:block">
          El fútbol virtual<br />también nos une.
          <span className="mt-3 block h-[2px] w-8 bg-[#56afe2]" />
        </div>
      </div>
    </aside>
  );
}
