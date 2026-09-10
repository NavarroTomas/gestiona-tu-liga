import type { CupMatch } from "@/lib/cups/types";
import type { KnockoutBracket as KnockoutBracketData } from "@/lib/cups/knockout";
import { getKnockoutScore, getKnockoutWinner } from "@/lib/cups/knockout";

function TeamLogo({
  name,
  getLogo,
}: {
  name: string;
  getLogo: (name?: string | null) => string | null;
}) {
  const logo = getLogo(name);

  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
      {logo ? (
        <img src={logo} alt={name} className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#dce8f0] text-[7px] font-black text-[#7890a7]">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

function PlaceholderTeamRow() {
  return (
    <div className="flex h-[27px] items-center gap-2 border-b border-[#e7eff5] px-3 last:border-b-0">
      <span className="h-6 w-6 rounded-[7px] bg-[#dce8f0]" />
      <span className="h-4 w-[112px] rounded bg-[#dce8f0]" />
      <span className="ml-auto border-l border-[#dce8f0] pl-4 text-[12px] font-black text-[#9db0bf]">-</span>
    </div>
  );
}

function MatchCard({
  match,
  getLogo,
  final = false,
}: {
  match?: CupMatch;
  getLogo: (name?: string | null) => string | null;
  final?: boolean;
}) {
  if (!match) {
    return (
      <div className={`overflow-hidden rounded-[8px] border bg-white ${final ? "border-[#b9dbef]" : "border-[#d5e6f0]"}`}>
        <PlaceholderTeamRow />
        <PlaceholderTeamRow />
      </div>
    );
  }

  const winner = getKnockoutWinner(match);
  const title = [match.dia, match.hora].filter(Boolean).join(" · ") || undefined;

  const TeamRow = ({ name, side }: { name: string; side: "home" | "away" }) => {
    const isWinner = winner === name;

    return (
      <div className={`flex h-[27px] items-center gap-2 border-b border-[#e7eff5] px-3 last:border-b-0 ${isWinner ? "bg-[#f0f9fe]" : "bg-white"}`}>
        <TeamLogo name={name} getLogo={getLogo} />
        <span className={`min-w-0 flex-1 truncate text-[10px] ${isWinner ? "font-black text-[#102f55]" : "font-bold text-[#355d83]"}`}>
          {name}
        </span>
        <strong className={`min-w-[24px] border-l border-[#dce8f0] pl-3 text-center text-[12px] ${isWinner ? "text-[#102f55]" : "text-[#6b8298]"}`}>
          {getKnockoutScore(match, side)}
        </strong>
      </div>
    );
  };

  return (
    <div
      title={title}
      className={`overflow-hidden rounded-[8px] border bg-white shadow-[0_1px_0_rgba(16,47,85,.02)] ${
        final ? "border-[#9fd2ed]" : "border-[#d5e6f0]"
      }`}
    >
      <TeamRow name={match.local} side="home" />
      <TeamRow name={match.visitante} side="away" />
    </div>
  );
}

function StageHeader({ title }: { title: string }) {
  return (
    <header className="flex h-[52px] flex-col items-center justify-center border-b border-[#e2edf4] bg-[linear-gradient(180deg,#edf7fd_0%,#f5fbfe_100%)] text-center">
      <strong className="text-[13px] font-black uppercase tracking-[-.02em] text-[#102f55]">{title}</strong>
      <span className="mt-0.5 text-[10px] font-bold text-[#8ea5b8]">-</span>
    </header>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 64 72" className="h-[78px] w-[70px] text-[#cedce6]" aria-hidden="true">
      <path fill="currentColor" d="M18 6h28v8h10v8c0 12-6 19-17 21-1 4-3 7-7 9v7h11v7H21v-7h11v-7c-4-2-6-5-7-9C14 41 8 34 8 22v-8h10V6Zm0 15h-4v1c0 7 3 12 9 14-3-5-5-10-5-15Zm28 0c0 5-2 10-5 15 6-2 9-7 9-14v-1h-4Z" />
    </svg>
  );
}

/**
 * CUADRO VISUAL DE COPA ARGENTINA
 * --------------------------------
 * Este componente solo decide CÓMO SE VE el bracket.
 *
 * Si querés:
 * - cambiar colores, anchos o separaciones -> hacelo acá;
 * - agregar otra fase/nombre de fase       -> `src/config/copaArgentina.ts`;
 * - cambiar cómo se ordenan los partidos   -> `src/lib/cups/knockout.ts`.
 *
 * El formato actual replica el esquema progresivo:
 * OCTAVOS -> CUARTOS -> SEMIFINALES -> FINAL.
 */
export default function KnockoutBracket({
  bracket,
  getLogo,
  showThirdPlace,
}: {
  bracket: KnockoutBracketData;
  getLogo: (name?: string | null) => string | null;
  showThirdPlace: boolean;
}) {
  const champion = getKnockoutWinner(bracket.final);

  return (
    <section>
      <div className="overflow-x-auto pb-2">
        <div className="relative min-w-[1240px] overflow-hidden rounded-[10px] border border-[#d7e6f0] bg-white">
          {/*
            Las líneas están en un SVG independiente para que el usuario pueda
            cambiar tarjetas/datos sin tocar las conexiones del cuadro.
          */}
          <svg
            className="pointer-events-none absolute left-0 top-[52px] z-10 h-[560px] w-full"
            viewBox="0 0 1240 560"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g fill="none" stroke="#9fcdea" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
              {/* Octavos -> Cuartos */}
              <path d="M284 35 H314 V105 M284 105 H314 M314 70 H328" />
              <path d="M284 175 H314 V245 M284 245 H314 M314 210 H328" />
              <path d="M284 315 H314 V385 M284 385 H314 M314 350 H328" />
              <path d="M284 455 H314 V525 M284 525 H314 M314 490 H328" />
              {/* Cuartos -> Semifinales */}
              <path d="M598 70 H628 V210 M598 210 H628 M628 140 H642" />
              <path d="M598 350 H628 V490 M598 490 H628 M628 420 H642" />
              {/* Semifinales -> Final */}
              <path d="M912 140 H942 V420 M912 420 H942 M942 280 H956" />
            </g>
          </svg>

          <div className="relative z-20 grid grid-cols-4 gap-4 bg-[#f8fbfd]">
            <section className="border-r border-[#e6eff5] bg-[linear-gradient(90deg,#f4faff_0%,#fbfdff_100%)]">
              <StageHeader title="Octavos" />
              <div className="grid h-[560px] grid-rows-8 px-4">
                {bracket.roundOf16.map((match, index) => (
                  <div key={`r16-${index}`} className="flex items-center">
                    <div className="w-full">
                      <MatchCard match={match} getLogo={getLogo} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-r border-[#e6eff5] bg-[linear-gradient(90deg,#fbfdff_0%,#f5faff_100%)]">
              <StageHeader title="Cuartos" />
              <div className="grid h-[560px] grid-rows-4 px-4">
                {bracket.quarterfinals.map((match, index) => (
                  <div key={`qf-${index}`} className="flex items-center">
                    <div className="w-full">
                      <MatchCard match={match} getLogo={getLogo} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-r border-[#e6eff5] bg-[linear-gradient(90deg,#f5faff_0%,#fbfdff_100%)]">
              <StageHeader title="Semifinales" />
              <div className="grid h-[560px] grid-rows-2 px-4">
                {bracket.semifinals.map((match, index) => (
                  <div key={`sf-${index}`} className="flex items-center">
                    <div className="w-full">
                      <MatchCard match={match} getLogo={getLogo} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[linear-gradient(90deg,#fbfdff_0%,#f3f9fd_100%)]">
              <StageHeader title="Final" />
              <div className="relative h-[560px] px-4">
                <div className="absolute left-1/2 top-[78px] flex -translate-x-1/2 flex-col items-center text-center">
                  {champion && getLogo(champion) ? (
                    <img src={getLogo(champion) || ""} alt={champion} className="mb-2 h-16 w-16 object-contain" />
                  ) : (
                    <TrophyIcon />
                  )}
                  {champion && (
                    <span className="mt-1 max-w-[190px] truncate text-[10px] font-black uppercase tracking-[.04em] text-[#355d83]">
                      {champion}
                    </span>
                  )}
                </div>

                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
                  <MatchCard match={bracket.final} getLogo={getLogo} final />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {showThirdPlace && (
        <div className="mt-3 max-w-[420px] rounded-[10px] border border-[#d7e6f0] bg-white p-3">
          <p className="mb-2 text-[9px] font-black uppercase tracking-[.14em] text-[#7890a7]">3.º puesto</p>
          <MatchCard match={bracket.thirdPlace} getLogo={getLogo} />
        </div>
      )}
    </section>
  );
}
