
import { displayLabel } from "@/lib/displayLabels";
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
 * RESPONSIVE:
 * - Teléfono (<768px): mantiene un calendario REAL de 7 columnas estilo FIFA.
 *   Las celdas son cuadradas y entran completas en el ancho del teléfono, sin
 *   scroll horizontal. Para no romper la grilla, cada día muestra un resumen
 *   compacto del primer partido; si hay más, aparece +N. Al tocarlo, el panel
 *   inferior muestra todos los partidos de esa fecha.
 * - Tablet/desktop: conserva el calendario mensual grande de la referencia.
 *
 * REGLA DESKTOP:
 * - 1 partido: destacado grande con tamaño de escudo limitado.
 * - 2 partidos: se reparten el alto de la celda.
 * - 3 o más: 2 visibles + `+N partidos`.
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
    if (date.getFullYear() !== month.getFullYear() || date.getMonth() !== month.getMonth()) return;
    const key = dateKey(date);
    matchesByDay.set(key, [...(matchesByDay.get(key) || []), match]);
  });

  const selectedDate = selectedMatch ? getFixtureMatchDate(selectedMatch) : null;
  const datedCount = Array.from(matchesByDay.values()).reduce((total, list) => total + list.length, 0);
  const lastRowStart = Math.max(0, days.length - 7);

  return (
    <section className="min-w-0">
      <div className="mb-3 grid gap-2.5 sm:grid-cols-[minmax(220px,300px)_1fr] sm:gap-3">
        <label className="grid h-12 grid-cols-[68px_1fr] items-center rounded-[9px] border border-[#cfe4f0] bg-white px-3 sm:grid-cols-[72px_1fr]">
          <span>
            <small className="block text-[8px] font-black uppercase tracking-[.12em] text-[#7b96ab]">Equipo</small>
            <strong className="mt-0.5 block text-[10px] font-black text-[#315f89]">Filtrar</strong>
          </span>
          <select
            value={team}
            onChange={(event) => onTeamChange(event.target.value)}
            style={{ ...selectStyle, borderColor: "transparent", backgroundColor: "white" }}
            className="h-9 min-w-0 w-full border-0 px-1 text-[11px] font-black outline-none sm:px-2"
          >
            <option value="all" style={selectStyle}>Todos los equipos</option>
            {teams.map((item) => <option key={item} value={item} style={selectStyle}>{displayLabel(item)}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-[44px_1fr_44px] items-center overflow-hidden rounded-[9px] border border-[#cfe4f0] bg-white">
          <button type="button" onClick={onPreviousMonth} className="h-12 border-r border-[#dceaf2] text-xl font-black text-[#1979c7] transition hover:bg-[#eef8fd]" aria-label="Mes anterior">‹</button>
          <strong className="truncate px-2 text-center text-[12px] font-black uppercase tracking-[.03em] text-[#102f55] sm:text-[13px]">{fixtureMonthLabel(month)}</strong>
          <button type="button" onClick={onNextMonth} className="h-12 border-l border-[#dceaf2] text-xl font-black text-[#1979c7] transition hover:bg-[#eef8fd]" aria-label="Mes siguiente">›</button>
        </div>
      </div>

      {/* MOBILE: calendario compacto de 7 columnas, estilo FIFA. */}
      <div className="overflow-hidden rounded-[9px] border border-[#cfe4f0] bg-white md:hidden">
        <div className="grid grid-cols-7 border-b border-[#dceaf2] bg-[#f8fcff]">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="min-w-0 border-r border-[#e4eef4] px-0.5 py-2 text-center text-[7px] font-black uppercase tracking-[.02em] text-[#274f78] last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayMatches = day.inCurrentMonth ? matchesByDay.get(day.key) || [] : [];
            const firstMatch = dayMatches[0] || null;
            const isSelectedDay = Boolean(
              day.inCurrentMonth && selectedDate && dateKey(selectedDate) === day.key,
            );
            const logoLocal = firstMatch ? getLogo(firstMatch.local) : null;
            const logoVisitante = firstMatch ? getLogo(firstMatch.visitante) : null;

            return (
              <div
                key={`mobile-${day.key}`}
                className={`relative aspect-square min-w-0 border-b border-r border-[#e2edf4] ${(index + 1) % 7 === 0 ? "border-r-0" : ""} ${index >= lastRowStart ? "border-b-0" : ""} ${
                  !day.inCurrentMonth
                    ? "bg-[#f8fbfd]"
                    : isSelectedDay
                      ? "bg-[#e9f6fd]"
                      : "bg-white"
                }`}
              >
                {day.inCurrentMonth ? (
                  <>
                    <span className="absolute left-1 top-1 z-10 text-[8px] font-black leading-none text-[#173b62]">
                      {day.date.getDate()}
                    </span>

                    {firstMatch ? (
                      <button
                        type="button"
                        onClick={() => onSelectMatch(firstMatch)}
                        aria-label={`${firstMatch.local} ${firstMatch.resultado || "vs"} ${firstMatch.visitante}`}
                        className={`absolute inset-x-[2px] bottom-[2px] top-[14px] grid min-w-0 grid-rows-[1fr_auto] items-center overflow-hidden rounded-[5px] border px-[2px] py-[2px] transition ${
                          isSelectedDay
                            ? "border-[#56afe2] bg-[#dff2fd]"
                            : "border-[#d5e9f4] bg-[#f0f9fe]"
                        }`}
                      >
                        <div className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-[1px]">
                          <span className="mx-auto flex h-3 w-3 items-center justify-center overflow-hidden rounded-[3px] bg-[#e4f0f7] min-[390px]:h-3.5 min-[390px]:w-3.5">
                            {logoLocal ? (
                              <img src={logoLocal} alt="" className="h-full w-full object-contain" />
                            ) : (
                              <span className="text-[4px] font-black text-[#8ba8bc]">{shortTeamName(firstMatch.local)}</span>
                            )}
                          </span>

                          <strong className="max-w-[20px] truncate text-center text-[6px] font-black leading-none text-[#102f55] min-[390px]:text-[7px]">
                            {firstMatch.resultado || "VS"}
                          </strong>

                          <span className="mx-auto flex h-3 w-3 items-center justify-center overflow-hidden rounded-[3px] bg-[#e4f0f7] min-[390px]:h-3.5 min-[390px]:w-3.5">
                            {logoVisitante ? (
                              <img src={logoVisitante} alt="" className="h-full w-full object-contain" />
                            ) : (
                              <span className="text-[4px] font-black text-[#8ba8bc]">{shortTeamName(firstMatch.visitante)}</span>
                            )}
                          </span>
                        </div>

                        <span className="truncate text-center text-[5px] font-black leading-none text-[#3c7eac] min-[390px]:text-[6px]">
                          {dayMatches.length > 1
                            ? `+${dayMatches.length - 1}`
                            : firstMatch.resultado
                              ? "FIN"
                              : firstMatch.hora || "-"}
                        </span>
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* TABLET/DESKTOP: calendario mensual. */}
      <div className="hidden overflow-x-auto rounded-[9px] border border-[#cfe4f0] bg-white md:block">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-7 border-b border-[#dceaf2] bg-[#f8fcff]">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="border-r border-[#e4eef4] px-2 py-2.5 text-center text-[10px] font-black uppercase tracking-[.08em] text-[#274f78] last:border-r-0">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayMatches = day.inCurrentMonth ? matchesByDay.get(day.key) || [] : [];
              const visibleDayMatches = dayMatches.slice(0, 2);
              const hiddenCount = Math.max(0, dayMatches.length - visibleDayMatches.length);
              const isSingleMatch = dayMatches.length === 1;
              const isSelectedDay = Boolean(day.inCurrentMonth && selectedDate && dateKey(selectedDate) === day.key);

              return (
                <div
                  key={day.key}
                  className={`relative min-h-[150px] border-b border-r border-[#e2edf4] p-2 transition lg:min-h-[164px] lg:p-2.5 ${(index + 1) % 7 === 0 ? "border-r-0" : ""} ${index >= lastRowStart ? "border-b-0" : ""} ${!day.inCurrentMonth ? "bg-[#f8fbfd]" : isSelectedDay ? "bg-[#e9f6fd]" : "bg-white"}`}
                >
                  {day.inCurrentMonth ? (
                    <>
                      <span className="relative z-10 text-[11px] font-black text-[#173b62] lg:text-[12px]">{day.date.getDate()}</span>

                      {isSingleMatch ? (() => {
                        const match = dayMatches[0];
                        const logoLocal = getLogo(match.local);
                        const logoVisitante = getLogo(match.visitante);
                        const selected = selectedMatch === match;
                        return (
                          <button key={matchKey(match, 0)} type="button" onClick={() => onSelectMatch(match)} className={`absolute inset-x-1.5 bottom-1.5 top-7 overflow-hidden rounded-[9px] border px-1 py-1.5 text-center transition ${selected ? "border-[#56afe2] bg-[#dff2fd] shadow-[0_4px_14px_rgba(41,136,196,.16)]" : "border-[#cbe4f2] bg-[#f0f9fe] hover:border-[#86c9ee] hover:bg-[#e7f6fd]"}`}>
                            <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-1">
                              <div className="grid min-h-0 w-full grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] items-center gap-0.5 lg:grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)] lg:gap-1">
                                <div className="min-w-0 text-center">
                                  <span className="mx-auto flex h-8 w-8 items-center justify-center overflow-hidden rounded-[6px] bg-[#e1eef6] lg:h-9 lg:w-9 2xl:h-10 2xl:w-10">{logoLocal ? <img src={logoLocal} alt="" className="h-full w-full object-contain p-[2px]" /> : <span className="text-[8px] font-black text-[#8ba8bc]">{shortTeamName(match.local)}</span>}</span>
                                  <strong className="mt-1 block truncate text-[8px] font-black leading-none text-[#102f55] lg:text-[9px]">{shortTeamName(match.local)}</strong>
                                </div>
                                <strong className="min-w-0 truncate text-center text-[11px] font-black leading-none text-[#102f55] lg:text-[13px] 2xl:text-[15px]">{match.resultado || "VS"}</strong>
                                <div className="min-w-0 text-center">
                                  <span className="mx-auto flex h-8 w-8 items-center justify-center overflow-hidden rounded-[6px] bg-[#e1eef6] lg:h-9 lg:w-9 2xl:h-10 2xl:w-10">{logoVisitante ? <img src={logoVisitante} alt="" className="h-full w-full object-contain p-[2px]" /> : <span className="text-[8px] font-black text-[#8ba8bc]">{shortTeamName(match.visitante)}</span>}</span>
                                  <strong className="mt-1 block truncate text-[8px] font-black leading-none text-[#102f55] lg:text-[9px]">{shortTeamName(match.visitante)}</strong>
                                </div>
                              </div>
                              <div className="mx-auto flex min-h-5 max-w-full items-center justify-center truncate rounded-full bg-white/75 px-2 text-[8px] font-black leading-none text-[#287bb8] lg:text-[9px]">{match.resultado ? "Finalizado" : match.hora || "A confirmar"}</div>
                            </div>
                          </button>
                        );
                      })() : dayMatches.length > 1 ? (
                        <div className="absolute inset-x-1.5 bottom-1.5 top-7 grid gap-1" style={{ gridTemplateRows: hiddenCount > 0 ? `repeat(${visibleDayMatches.length}, minmax(0, 1fr)) 22px` : `repeat(${visibleDayMatches.length}, minmax(0, 1fr))` }}>
                          {visibleDayMatches.map((match, matchIndex) => {
                            const logoLocal = getLogo(match.local);
                            const logoVisitante = getLogo(match.visitante);
                            const selected = selectedMatch === match;
                            return (
                              <button key={matchKey(match, matchIndex)} type="button" onClick={() => onSelectMatch(match)} className={`flex min-h-0 w-full items-center overflow-hidden rounded-[7px] border px-1 text-left transition ${selected ? "border-[#63b8eb] bg-[#dff2fd]" : "border-[#d7eaf5] bg-[#f1f9fe] hover:border-[#9fd4f1] hover:bg-[#e8f6fd]"}`}>
                                <div className="flex w-full min-w-0 items-center gap-1">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-[#e4f0f7] lg:h-[30px] lg:w-[30px]">{logoLocal ? <img src={logoLocal} alt="" className="h-full w-full object-contain p-[1px]" /> : <span className="text-[7px] font-black text-[#8ba8bc]">{shortTeamName(match.local)}</span>}</span>
                                  <div className="min-w-0 flex-1 text-center">
                                    <div className="flex min-w-0 items-center justify-center gap-0.5 lg:gap-1">
                                      <strong className="min-w-0 truncate text-[8px] font-black text-[#102f55] lg:text-[9px]">{shortTeamName(match.local)}</strong>
                                      <span className="shrink-0 text-[8px] font-black text-[#587d9d] lg:text-[9px]">{match.resultado || "vs"}</span>
                                      <strong className="min-w-0 truncate text-[8px] font-black text-[#102f55] lg:text-[9px]">{shortTeamName(match.visitante)}</strong>
                                    </div>
                                    <div className="mt-0.5 truncate text-[7px] font-black leading-none text-[#287bb8] lg:text-[8px]">{match.resultado ? "Finalizado" : match.hora || "A confirmar"}</div>
                                  </div>
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-[#e4f0f7] lg:h-[30px] lg:w-[30px]">{logoVisitante ? <img src={logoVisitante} alt="" className="h-full w-full object-contain p-[1px]" /> : <span className="text-[7px] font-black text-[#8ba8bc]">{shortTeamName(match.visitante)}</span>}</span>
                                </div>
                              </button>
                            );
                          })}
                          {hiddenCount > 0 ? <button type="button" onClick={() => onSelectMatch(dayMatches[visibleDayMatches.length])} className="rounded-[6px] border border-[#d4e9f5] bg-white/95 px-1 text-center text-[8px] font-black text-[#3a78a6] transition hover:border-[#a9d5ee] hover:bg-[#edf8fd]">+{hiddenCount} {hiddenCount === 1 ? "partido" : "partidos"}</button> : null}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {datedCount === 0 ? (
        <p className="mt-3 rounded-[8px] border border-[#d9e8f1] bg-[#f8fcff] px-4 py-3 text-[11px] font-semibold text-[#6f879d]">
          Todavía no hay partidos con una fecha calendario reconocible para este filtro.
        </p>
      ) : null}
    </section>
  );
}
