import type { CupMatch } from "@/lib/cups/types";
import type { KnockoutBracket as KnockoutBracketData } from "@/lib/cups/knockout";
import { getKnockoutScore, getKnockoutWinner } from "@/lib/cups/knockout";
import { formatCupDate } from "@/lib/cups/utils";

function TeamLogo({
  name,
  getLogo,
}: {
  name: string;
  getLogo: (name?: string | null) => string | null;
}) {
  const logo = getLogo(name);
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center">
      {logo ? (
        <img src={logo} alt={name} className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-7 w-7 items-center justify-center rounded bg-[#edf5fa] text-[8px] font-black text-[#597895]">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
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
      <div className={`flex ${final ? "min-h-[128px]" : "min-h-[104px]"} items-center justify-center rounded-[10px] border border-dashed border-[#c9dfea] bg-[#fbfdff] px-4 text-center`}>
        <span className="text-[9px] font-black uppercase tracking-[.14em] text-[#91a5b7]">Por definir</span>
      </div>
    );
  }

  const winner = getKnockoutWinner(match);
  const meta = [formatCupDate(match), match.hora].filter((value) => value && value !== "—").join(" · ");

  const TeamRow = ({ name, side }: { name: string; side: "home" | "away" }) => {
    const isWinner = winner === name;
    return (
      <div className={`flex min-h-[43px] items-center gap-2 border-b border-[#e7eff5] px-3 last:border-b-0 ${isWinner ? "bg-[#f0f9fe]" : "bg-white"}`}>
        <TeamLogo name={name} getLogo={getLogo} />
        <span className={`min-w-0 flex-1 truncate text-[11px] ${isWinner ? "font-black text-[#102f55]" : "font-bold text-[#355d83]"}`}>
          {name}
        </span>
        <strong className={`text-[13px] ${isWinner ? "text-[#102f55]" : "text-[#6b8298]"}`}>
          {getKnockoutScore(match, side)}
        </strong>
      </div>
    );
  };

  return (
    <div className={`overflow-hidden rounded-[10px] border ${final ? "border-[#86c8eb] ring-1 ring-[#d8effc]" : "border-[#d7e6f0]"} bg-white`}>
      {meta && (
        <div className="border-b border-[#e7eff5] bg-[#f8fbfd] px-3 py-1.5 text-center text-[8px] font-black uppercase tracking-[.1em] text-[#7890a7]">
          {meta}
        </div>
      )}
      <TeamRow name={match.local} side="home" />
      <TeamRow name={match.visitante} side="away" />
    </div>
  );
}

function StageTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-center text-[10px] font-black uppercase tracking-[.15em] text-[#355d83]">
      {children}
    </div>
  );
}

/**
 * Componente puramente visual del cuadro.
 * Si querés cambiar tamaños, separaciones o colores del bracket, hacelo acá.
 * La lógica de qué partido pertenece a cada fase está en `lib/cups/knockout.ts`.
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
  return (
    <section className="overflow-hidden rounded-[12px] border border-[#d7e6f0] bg-white">
      <header className="flex items-center justify-between gap-4 border-b border-[#d7e6f0] bg-[#fbfdff] px-4 py-3 sm:px-5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[.15em] text-[#56afe2]">Cuadro principal</p>
          <h2 className="mt-0.5 text-[18px] font-black tracking-[-.03em] text-[#102f55] sm:text-[20px]">Camino al título</h2>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[.1em] text-[#8aa0b3]">Eliminación directa</span>
      </header>

      <div className="overflow-x-auto p-4 sm:p-5">
        <div className="grid min-w-[1080px] grid-cols-[1fr_.86fr_1.05fr_.86fr_1fr] items-center gap-5">
          <div>
            <StageTitle>Cuartos</StageTitle>
            <div className="space-y-10">
              <MatchCard match={bracket.quarterLeft[0]} getLogo={getLogo} />
              <MatchCard match={bracket.quarterLeft[1]} getLogo={getLogo} />
            </div>
          </div>

          <div>
            <StageTitle>Semifinal</StageTitle>
            <MatchCard match={bracket.semifinalLeft} getLogo={getLogo} />
          </div>

          <div>
            <StageTitle>Final</StageTitle>
            <MatchCard match={bracket.final} getLogo={getLogo} final />

            {showThirdPlace && (
              <div className="mt-6 border-t border-[#e1edf4] pt-5">
                <StageTitle>3.º puesto</StageTitle>
                <MatchCard match={bracket.thirdPlace} getLogo={getLogo} />
              </div>
            )}
          </div>

          <div>
            <StageTitle>Semifinal</StageTitle>
            <MatchCard match={bracket.semifinalRight} getLogo={getLogo} />
          </div>

          <div>
            <StageTitle>Cuartos</StageTitle>
            <div className="space-y-10">
              <MatchCard match={bracket.quarterRight[0]} getLogo={getLogo} />
              <MatchCard match={bracket.quarterRight[1]} getLogo={getLogo} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
