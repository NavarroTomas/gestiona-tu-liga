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
 *
 * IMPORTANTE SOBRE "TODOS LOS EQUIPOS":
 * En APA es normal que varios partidos se jueguen el mismo día y a la misma
 * hora. Para no achicar los escudos/textos hasta volverlos ilegibles, cada día
 * muestra como máximo 2 partidos grandes. Si hay más, aparece `+N partidos`.
 * Los encuentros restantes siguen disponibles en el panel de la derecha y al
 * filtrar por un equipo el calendario queda mucho más despejado.
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
              const visibleDayMatches = dayMatches.slice(0, 2);
              const hiddenCount = Math.max(0, dayMatches.length - visibleDayMatches.length);
              const isSelectedDay = Boolean(selectedDate && dateKey(selectedDate) === day.key);

              return (
                <div
                  key={day.key}
                  className={`relative min-h-[138px] border-b border-r border-[#e2edf4] p-2 transition ${(index + 1) % 7 === 0 ? "border-r-0" : ""} ${index >= 35 ? "border-b-0" : ""} ${
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

                  <div className="mt-1.5 space-y-1.5">
                    {visibleDayMatches.map((match, matchIndex) => {
                      const logoLocal = getLogo(match.local);
                      const logoVisitante = getLogo(match.visitante);
                      const selected = selectedMatch === match;

                      return (
                        <button
                          key={matchKey(match, matchIndex)}
                          type="button"
                          onClick={() => onSelectMatch(match)}
                          className={`w-full rounded-[7px] border px-1.5 py-1.5 text-left transition ${
                            selected
                              ? "border-[#63b8eb] bg-[#dff2fd] shadow-[0_2px_8px_rgba(41,136,196,.10)]"
                              : "border-[#d7eaf5] bg-[#f1f9fe] hover:border-[#9fd4f1] hover:bg-[#e8f6fd]"
                          }`}
                        >
                          <div className="flex min-w-0 items-center justify-center gap-1.5">
                            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-[#e4f0f7]">
                              {logoLocal ? (
                                <img src={logoLocal} alt="" className="h-full w-full object-contain p-[1px]" />
                              ) : (
                                <span className="text-[7px] font-black text-[#8ba8bc]">{shortTeamName(match.local)}</span>
                              )}
                            </span>

                            <strong className="min-w-0 truncate text-[9px] font-black text-[#102f55]">
                              {shortTeamName(match.local)}
                            </strong>

                            <span className="shrink-0 text-[8px] font-bold text-[#7591a8]">
                              {match.resultado || "vs"}
                            </span>

                            <strong className="min-w-0 truncate text-[9px] font-black text-[#102f55]">
                              {shortTeamName(match.visitante)}
                            </strong>

                            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-[#e4f0f7]">
                              {logoVisitante ? (
                                <img src={logoVisitante} alt="" className="h-full w-full object-contain p-[1px]" />
                              ) : (
                                <span className="text-[7px] font-black text-[#8ba8bc]">{shortTeamName(match.visitante)}</span>
                              )}
                            </span>
                          </div>

                          <div className="mt-1 text-center text-[9px] font-black leading-none text-[#287bb8]">
                            {match.resultado ? "Finalizado" : match.hora || "A confirmar"}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {hiddenCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => onSelectMatch(dayMatches[visibleDayMatches.length])}
                      title={dayMatches
                        .slice(visibleDayMatches.length)
                        .map((match) => `${match.local} vs ${match.visitante}`)
                        .join(" · ")}
                      className="absolute bottom-1.5 left-2 right-2 rounded-[5px] border border-[#d4e9f5] bg-white/90 px-2 py-1 text-center text-[8px] font-black text-[#3a78a6] transition hover:border-[#a9d5ee] hover:bg-[#edf8fd]"
                    >
                      +{hiddenCount} {hiddenCount === 1 ? "partido" : "partidos"}
                    </button>
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
