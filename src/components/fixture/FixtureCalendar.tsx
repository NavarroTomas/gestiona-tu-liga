import {
  buildFixtureCalendar,
  dateKey,
  fixtureMonthLabel,
  getFixtureMatchDate,
  shortTeamName,
  type FixtureMatch,
} from "@/lib/fixture";

const WEEK_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const selectStyle = {
  backgroundColor: "#f3fafe",
  color: "#102f55",
  borderColor: "#c9e3f1",
} as const;

function matchKey(match: FixtureMatch, index: number) {
  return String(match.partido_id || match.id || `${match.local}-${match.visitante}-${index}`);
}

/**
 * Calendario mensual del Fixture.
 * El filtro de equipo queda arriba del mes para replicar la estructura de la
 * referencia y mantener el lateral reservado a competición/temporada.
 */
export default function FixtureCalendar({
  month,
  onPreviousMonth,
  onNextMonth,
  matches,
  selectedMatch,
  onSelectMatch,
  getLogo,
  team,
  onTeamChange,
  teams,
}: {
  month: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  matches: FixtureMatch[];
  selectedMatch: FixtureMatch | null;
  onSelectMatch: (match: FixtureMatch) => void;
  getLogo: (name?: string | null) => string | null;
  team: string;
  onTeamChange: (team: string) => void;
  teams: string[];
}) {
  const days = buildFixtureCalendar(month);
  const matchesByDay = new Map<string, FixtureMatch[]>();

  matches.forEach((match) => {
    const date = getFixtureMatchDate(match);
    if (!date) return;
    const key = dateKey(date);
    matchesByDay.set(key, [...(matchesByDay.get(key) || []), match]);
  });

  const selectedDate = selectedMatch ? getFixtureMatchDate(selectedMatch) : null;
  const datedCount = Array.from(matchesByDay.values()).reduce((total, list) => total + list.length, 0);

  return (
    <section className="min-w-0">
      <div className="mb-3 grid gap-3 sm:grid-cols-[minmax(220px,300px)_1fr]">
        <label className="grid h-12 grid-cols-[72px_1fr] items-center rounded-[9px] border border-[#cfe4f0] bg-white px-3">
          <span>
            <small className="block text-[8px] font-black uppercase tracking-[.12em] text-[#7b96ab]">Equipo</small>
            <strong className="mt-0.5 block text-[10px] font-black text-[#315f89]">Filtrar</strong>
          </span>
          <select
            value={team}
            onChange={(event) => onTeamChange(event.target.value)}
            style={{ ...selectStyle, borderColor: "transparent", backgroundColor: "white" }}
            className="h-9 min-w-0 w-full border-0 px-2 text-[11px] font-black outline-none"
          >
            <option value="all" style={selectStyle}>Todos los equipos</option>
            {teams.map((item) => (
              <option key={item} value={item} style={selectStyle}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-[44px_1fr_44px] items-center overflow-hidden rounded-[9px] border border-[#cfe4f0] bg-white">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="h-12 border-r border-[#dceaf2] text-xl font-black text-[#1979c7] transition hover:bg-[#eef8fd]"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <strong className="text-center text-[13px] font-black uppercase tracking-[.03em] text-[#102f55]">
            {fixtureMonthLabel(month)}
          </strong>
          <button
            type="button"
            onClick={onNextMonth}
            className="h-12 border-l border-[#dceaf2] text-xl font-black text-[#1979c7] transition hover:bg-[#eef8fd]"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[9px] border border-[#cfe4f0] bg-white">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-7 border-b border-[#dceaf2] bg-[#f8fcff]">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="border-r border-[#e4eef4] px-2 py-2.5 text-center text-[10px] font-black uppercase tracking-[.08em] text-[#274f78] last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayMatches = matchesByDay.get(day.key) || [];
              const isSelectedDay = Boolean(selectedDate && dateKey(selectedDate) === day.key);

              return (
                <div
                  key={day.key}
                  className={`relative min-h-[96px] border-b border-r border-[#e2edf4] p-2 transition ${(index + 1) % 7 === 0 ? "border-r-0" : ""} ${index >= 35 ? "border-b-0" : ""} ${
                    isSelectedDay ? "bg-[#e9f6fd]" : day.inCurrentMonth ? "bg-white" : "bg-[#f8fbfd]"
                  }`}
                >
                  <span
                    className={`text-[11px] font-bold ${
                      day.inCurrentMonth ? "text-[#173b62]" : "text-[#afc4d2]"
                    }`}
                  >
                    {day.date.getDate()}
                  </span>

                  <div className="mt-1.5 space-y-1">
                    {dayMatches.slice(0, 2).map((match, matchIndex) => {
                      const logoLocal = getLogo(match.local);
                      const logoVisitante = getLogo(match.visitante);
                      const selected = selectedMatch === match;

                      return (
                        <button
                          key={matchKey(match, matchIndex)}
                          type="button"
                          onClick={() => onSelectMatch(match)}
                          className={`w-full rounded-[6px] border px-1.5 py-1 text-left transition ${
                            selected
                              ? "border-[#75c2ee] bg-[#dff2fd]"
                              : "border-transparent bg-[#f2f9fd] hover:border-[#b9dff3] hover:bg-[#eaf6fd]"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span className="h-[18px] w-[18px] shrink-0 overflow-hidden rounded-sm bg-[#dceaf2]">
                              {logoLocal ? <img src={logoLocal} alt="" className="h-full w-full object-contain" /> : null}
                            </span>
                            <strong className="text-[8px] font-black text-[#102f55]">
                              {shortTeamName(match.local)}
                            </strong>
                            <span className="text-[7px] font-bold text-[#7d97ad]">vs</span>
                            <span className="h-[18px] w-[18px] shrink-0 overflow-hidden rounded-sm bg-[#dceaf2]">
                              {logoVisitante ? <img src={logoVisitante} alt="" className="h-full w-full object-contain" /> : null}
                            </span>
                            <strong className="text-[8px] font-black text-[#102f55]">
                              {shortTeamName(match.visitante)}
                            </strong>
                          </div>
                          <div className="mt-0.5 text-center text-[8px] font-bold text-[#287bb8]">
                            {match.hora || match.resultado || "A confirmar"}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {dayMatches.length > 2 ? (
                    <span className="absolute bottom-1.5 right-2 text-[8px] font-black text-[#4f83aa]">
                      +{dayMatches.length - 2}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {datedCount === 0 ? (
        <p className="mt-3 rounded-[8px] border border-[#d9e8f1] bg-[#f8fcff] px-4 py-3 text-[11px] font-semibold text-[#6f879d]">
          Todavía no hay partidos con una fecha calendario reconocible para este filtro. Los cruces cargados siguen apareciendo en el panel de la derecha.
        </p>
      ) : null}
    </section>
  );
}
