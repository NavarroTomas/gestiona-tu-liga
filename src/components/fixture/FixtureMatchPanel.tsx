import Link from "next/link";
import { stableMatchId } from "@/lib/competitionData";
import {
  fixtureRoundLabel,
  getFixtureMatchDate,
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
  })
    .format(date)
    .replace(".", "")
    .toUpperCase();
}

function matchHref(match: FixtureMatch) {
  const id = match.partido_id || match.id;
  if (!id) return null;
  const stable = match.partido_id || stableMatchId(match.temporada || "", match.id);
  return `/estadisticas/${encodeURIComponent(String(stable))}`;
}

function Shield({ name, logo, large = false }: { name?: string | null; logo: string | null; large?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-[#eef6fb] ${
        large
          ? "h-[76px] w-[76px] rounded-[12px] sm:h-[88px] sm:w-[88px]"
          : "h-11 w-11 rounded-[8px]"
      }`}
    >
      {logo ? (
        <img src={logo} alt={name || "Escudo"} className="h-full w-full object-contain p-1" />
      ) : (
        <span className={`${large ? "text-lg" : "text-[10px]"} font-black text-[#9bb4c6]`}>
          {shortTeamName(name)}
        </span>
      )}
    </span>
  );
}

/**
 * Partido seleccionado + próximos partidos.
 *
 * El segundo panel usa todo el alto libre de la columna. Como el calendario
 * suele ser bastante alto, repartimos ese espacio entre los próximos partidos
 * para evitar que queden cinco filas diminutas arriba y un bloque vacío abajo.
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
  const selectedDate = selectedMatch ? getFixtureMatchDate(selectedMatch)?.getTime() : null;

  const upcoming = matches
    .filter((match) => match !== selectedMatch)
    .filter((match) => {
      if (selectedDate == null) return true;
      const date = getFixtureMatchDate(match)?.getTime();
      return date == null || date >= selectedDate;
    })
    .slice(0, 5);

  return (
    <aside className="flex h-full min-h-0 flex-col gap-4">
      <section className="shrink-0 overflow-hidden rounded-[10px] border border-[#cfe4f0] bg-white">
        {selectedMatch ? (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-[#dfebf2] px-5 py-4">
              <strong className="text-[13px] font-black uppercase text-[#102f55]">
                {readableDate(selectedMatch)}
              </strong>
              <span className="text-[10px] font-bold uppercase text-[#3f6c94]">
                {fixtureRoundLabel(selectedMatch)}
              </span>
            </div>

            <div className="px-5 pb-5 pt-5">
              <div className="grid grid-cols-[1fr_58px_1fr] items-start gap-3">
                <div className="flex min-w-0 flex-col items-center text-center">
                  <Shield name={selectedMatch.local} logo={getLogo(selectedMatch.local)} large />
                  <strong className="mt-2.5 max-w-full text-[14px] font-black leading-4 text-[#102f55]">
                    {selectedMatch.local}
                  </strong>
                </div>

                <div className="flex min-h-[88px] items-center justify-center text-[20px] font-black text-[#102f55]">
                  {selectedMatch.resultado || "VS"}
                </div>

                <div className="flex min-w-0 flex-col items-center text-center">
                  <Shield name={selectedMatch.visitante} logo={getLogo(selectedMatch.visitante)} large />
                  <strong className="mt-2.5 max-w-full text-[14px] font-black leading-4 text-[#102f55]">
                    {selectedMatch.visitante}
                  </strong>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 border-y border-[#e3edf3] py-3.5 text-center">
                <div className="border-r border-[#e3edf3]">
                  <span className="block text-[9px] font-bold uppercase tracking-[.12em] text-[#8aa0b2]">Hora</span>
                  <strong className="mt-1 block text-[13px] text-[#244b72]">{selectedMatch.hora || "A confirmar"}</strong>
                </div>
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-[.12em] text-[#8aa0b2]">Competición</span>
                  <strong className="mt-1 block truncate px-2 text-[13px] capitalize text-[#244b72]">
                    {String(selectedMatch.competicion || "APA").replaceAll("_", " ")}
                  </strong>
                </div>
              </div>

              {matchHref(selectedMatch) ? (
                <Link
                  href={matchHref(selectedMatch)!}
                  className="mt-4 flex h-12 items-center justify-center rounded-full bg-[#2a9eea] px-4 text-[12px] font-black text-white transition hover:bg-[#1889d1]"
                >
                  Ver detalles del partido →
                </Link>
              ) : null}
            </div>
          </>
        ) : (
          <div className="px-5 py-12 text-center">
            <strong className="text-[13px] font-black text-[#102f55]">Sin partido seleccionado</strong>
            <p className="mx-auto mt-2 max-w-[250px] text-[11px] leading-5 text-[#7890a7]">
              Elegí un encuentro del calendario o de la lista para ver sus detalles.
            </p>
          </div>
        )}
      </section>

      <section className="flex min-h-[390px] flex-1 flex-col overflow-hidden rounded-[10px] border border-[#cfe4f0] bg-white">
        <div className="shrink-0 border-b border-[#dfebf2] px-5 py-4.5">
          <strong className="text-[13px] font-black uppercase tracking-[.02em] text-[#102f55]">
            Próximos partidos
          </strong>
        </div>

        {upcoming.length ? (
          <div
            className="grid min-h-0 flex-1 divide-y divide-[#e5eef4] px-5"
            style={{ gridTemplateRows: `repeat(${upcoming.length}, minmax(76px, 1fr))` }}
          >
            {upcoming.map((match, index) => (
              <button
                key={String(match.partido_id || match.id || index)}
                type="button"
                onClick={() => onSelectMatch(match)}
                className="grid h-full w-full grid-cols-[86px_minmax(0,1fr)] items-center gap-4 py-4 text-left transition hover:bg-[#f8fcff]"
              >
                <div>
                  <strong className="block text-[11px] font-black uppercase leading-4 text-[#244b72]">
                    {readableDate(match).split(" ").slice(0, 2).join(" ")}
                  </strong>
                  <span className="mt-1 block text-[11px] font-bold text-[#4d79a0]">
                    {match.hora || "--:--"}
                  </span>
                </div>

                <div className="grid min-w-0 grid-cols-[44px_minmax(38px,1fr)_24px_minmax(38px,1fr)_44px] items-center gap-2.5">
                  <Shield name={match.local} logo={getLogo(match.local)} />
                  <span className="truncate text-center text-[11px] font-black text-[#315f89]">
                    {shortTeamName(match.local)}
                  </span>
                  <span className="text-center text-[10px] font-bold text-[#98acbb]">vs</span>
                  <span className="truncate text-center text-[11px] font-black text-[#315f89]">
                    {shortTeamName(match.visitante)}
                  </span>
                  <Shield name={match.visitante} logo={getLogo(match.visitante)} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center px-5 py-8 text-center">
            <p className="text-[12px] font-semibold text-[#7890a7]">
              No hay más partidos para mostrar.
            </p>
          </div>
        )}
      </section>
    </aside>
  );
}
