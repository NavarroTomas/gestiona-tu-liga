import Link from "next/link";
import { stableMatchId } from "@/lib/competitionData";
import {
  fixtureRoundLabel,
  getFixtureMatchDate,
  sameFixtureDay,
  shortTeamName,
  type FixtureMatch,
} from "@/lib/fixture";

function readableDate(match?: FixtureMatch | null) {
  if (!match) return "Fecha a confirmar";
  const date = getFixtureMatchDate(match);
  if (!date) return String(match.dia || "Fecha a confirmar");

  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date).replace(".", "").toUpperCase();
}

function matchHref(match: FixtureMatch) {
  const id = match.partido_id || match.id;
  if (!id) return null;
  const stable = match.partido_id || stableMatchId(match.temporada || "", match.id);
  return `/estadisticas/${encodeURIComponent(String(stable))}`;
}

function Shield({ name, logo, large = false }: { name?: string | null; logo: string | null; large?: boolean }) {
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden bg-[#eef6fb] ${large ? "h-[60px] w-[60px] rounded-[10px] sm:h-[74px] sm:w-[74px] 2xl:h-[88px] 2xl:w-[88px]" : "h-9 w-9 rounded-[7px] sm:h-11 sm:w-11 sm:rounded-[8px]"}`}>
      {logo ? (
        <img src={logo} alt={name || "Escudo"} className="h-full w-full object-contain p-1" />
      ) : (
        <span className={`${large ? "text-sm sm:text-base" : "text-[9px] sm:text-[10px]"} font-black text-[#9bb4c6]`}>{shortTeamName(name)}</span>
      )}
    </span>
  );
}

/**
 * Detalle del encuentro + todos los partidos de la misma fecha.
 * En mobile reduce tamaños y cambia las filas a una composición vertical para
 * que nunca haya contenido cortado ni scroll horizontal.
 */
export default function FixtureMatchPanel({
  selectedMatch,
  matches,
  onSelectMatch,
  getLogo,
}: {
  selectedMatch: FixtureMatch | null;
  matches: FixtureMatch[];
  onSelectMatch: (match: FixtureMatch) => void;
  getLogo: (name?: string | null) => string | null;
}) {
  const selectedDate = selectedMatch ? getFixtureMatchDate(selectedMatch) : null;
  const dayMatches = selectedDate
    ? matches.filter((match) => sameFixtureDay(getFixtureMatchDate(match), selectedDate))
    : matches.slice(0, 5);

  return (
    <aside className="flex h-full min-w-0 flex-col gap-3 sm:gap-4">
      <section className="shrink-0 overflow-hidden rounded-[10px] border border-[#cfe4f0] bg-white">
        {selectedMatch ? (
          <>
            <div className="flex items-start justify-between gap-2 border-b border-[#dfebf2] px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
              <strong className="min-w-0 truncate text-[11px] font-black uppercase text-[#102f55] sm:text-[13px]">{readableDate(selectedMatch)}</strong>
              <span className="shrink-0 text-[9px] font-bold uppercase text-[#3f6c94] sm:text-[10px]">{fixtureRoundLabel(selectedMatch)}</span>
            </div>

            <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
              <div className="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-start gap-1.5 sm:grid-cols-[1fr_54px_1fr] sm:gap-3">
                <div className="flex min-w-0 flex-col items-center text-center">
                  <Shield name={selectedMatch.local} logo={getLogo(selectedMatch.local)} large />
                  <strong className="mt-2 line-clamp-2 max-w-full text-[11px] font-black leading-3.5 text-[#102f55] sm:text-[13px] sm:leading-4">{selectedMatch.local}</strong>
                </div>

                <div className="flex min-h-[60px] items-center justify-center text-[17px] font-black text-[#102f55] sm:min-h-[74px] sm:text-[20px]">{selectedMatch.resultado || "VS"}</div>

                <div className="flex min-w-0 flex-col items-center text-center">
                  <Shield name={selectedMatch.visitante} logo={getLogo(selectedMatch.visitante)} large />
                  <strong className="mt-2 line-clamp-2 max-w-full text-[11px] font-black leading-3.5 text-[#102f55] sm:text-[13px] sm:leading-4">{selectedMatch.visitante}</strong>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 border-y border-[#e3edf3] py-3 text-center sm:mt-5 sm:py-3.5">
                <div className="min-w-0 border-r border-[#e3edf3] px-1">
                  <span className="block text-[8px] font-bold uppercase tracking-[.1em] text-[#8aa0b2] sm:text-[9px]">Hora</span>
                  <strong className="mt-1 block truncate text-[11px] text-[#244b72] sm:text-[13px]">{selectedMatch.hora || "A confirmar"}</strong>
                </div>
                <div className="min-w-0 px-1">
                  <span className="block text-[8px] font-bold uppercase tracking-[.1em] text-[#8aa0b2] sm:text-[9px]">Competición</span>
                  <strong className="mt-1 block truncate text-[11px] capitalize text-[#244b72] sm:text-[13px]">{String(selectedMatch.competicion || "APA").replaceAll("_", " ")}</strong>
                </div>
              </div>

              {matchHref(selectedMatch) ? (
                <Link href={matchHref(selectedMatch)!} className="mt-3 flex h-11 items-center justify-center rounded-full bg-[#2a9eea] px-3 text-center text-[10px] font-black text-white transition hover:bg-[#1889d1] sm:mt-4 sm:h-12 sm:px-4 sm:text-[12px]">Ver detalles del partido →</Link>
              ) : null}
            </div>
          </>
        ) : (
          <div className="px-5 py-9 text-center sm:py-12">
            <strong className="text-[12px] font-black text-[#102f55] sm:text-[13px]">Sin partido seleccionado</strong>
            <p className="mx-auto mt-2 max-w-[250px] text-[11px] leading-5 text-[#7890a7]">Elegí un encuentro para ver sus detalles.</p>
          </div>
        )}
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-[#cfe4f0] bg-white xl:min-h-[390px]">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#dfebf2] px-4 py-3 sm:px-5 sm:py-4">
          <strong className="text-[11px] font-black uppercase tracking-[.02em] text-[#102f55] sm:text-[13px]">{selectedDate ? "Partidos del día" : "Próximos partidos"}</strong>
          {selectedDate && selectedMatch ? <span className="shrink-0 text-[9px] font-black uppercase text-[#4d79a0] sm:text-[10px]">{readableDate(selectedMatch)}</span> : null}
        </div>

        {dayMatches.length ? (
          <div className="min-h-0 flex-1 divide-y divide-[#e5eef4] px-3 sm:px-5">
            {dayMatches.map((match, index) => {
              const played = Boolean(match.resultado);
              const isSelected = match === selectedMatch;
              return (
                <button
                  key={String(match.partido_id || match.id || index)}
                  type="button"
                  onClick={() => onSelectMatch(match)}
                  className={`grid w-full grid-cols-1 gap-2 px-1 py-3 text-left transition sm:grid-cols-[72px_minmax(0,1fr)] sm:items-center sm:gap-3 sm:px-2 sm:py-4 xl:min-h-[82px] ${isSelected ? "bg-[#eef8fd] shadow-[inset_3px_0_0_#56afe2]" : "hover:bg-[#f8fcff]"}`}
                >
                  <div className="flex items-center justify-between gap-2 sm:block">
                    <strong className="text-[9px] font-black uppercase leading-4 text-[#244b72] sm:block sm:text-[11px]">{readableDate(match).split(" ").slice(0, 2).join(" ")}</strong>
                    <span className="text-[9px] font-bold text-[#4d79a0] sm:mt-1 sm:block sm:text-[11px]">{match.hora || "--:--"}</span>
                  </div>

                  <div className="grid min-w-0 grid-cols-[36px_minmax(30px,1fr)_44px_minmax(30px,1fr)_36px] items-center gap-1.5 sm:grid-cols-[44px_minmax(38px,1fr)_48px_minmax(38px,1fr)_44px] sm:gap-2.5">
                    <Shield name={match.local} logo={getLogo(match.local)} />
                    <span className="truncate text-center text-[10px] font-black text-[#315f89] sm:text-[11px]">{shortTeamName(match.local)}</span>
                    <span className={`flex min-h-7 items-center justify-center rounded-[7px] px-1 text-center font-black ${played ? "bg-[#e3f3fd] text-[11px] text-[#102f55] sm:text-[12px]" : "text-[9px] text-[#98acbb] sm:text-[10px]"}`}>{match.resultado || "vs"}</span>
                    <span className="truncate text-center text-[10px] font-black text-[#315f89] sm:text-[11px]">{shortTeamName(match.visitante)}</span>
                    <Shield name={match.visitante} logo={getLogo(match.visitante)} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center px-5 py-8 text-center">
            <p className="max-w-[280px] text-[11px] font-semibold leading-5 text-[#7890a7] sm:text-[12px]">{selectedDate ? "No hay partidos cargados para este mismo día." : "No hay más partidos para mostrar."}</p>
          </div>
        )}
      </section>
    </aside>
  );
}
