import type { CupMatch } from "@/lib/cups/types";
import type {
  KnockoutBracket as KnockoutBracketData,
  KnockoutRoundId,
} from "@/lib/cups/knockout";
import { getKnockoutScore, getKnockoutWinner } from "@/lib/cups/knockout";

const ROUND_META: Record<KnockoutRoundId, { title: string; count: number }> = {
  roundOf16: { title: "Octavos", count: 8 },
  quarterfinals: { title: "Cuartos", count: 4 },
  semifinals: { title: "Semifinales", count: 2 },
  final: { title: "Final", count: 1 },
};

function getRoundMatches(bracket: KnockoutBracketData, round: KnockoutRoundId) {
  if (round === "roundOf16") return bracket.roundOf16;
  if (round === "quarterfinals") return bracket.quarterfinals;
  if (round === "semifinals") return bracket.semifinals;
  return [bracket.final];
}

function isByeLabel(name?: string | null) {
  return (name || "").trim().toLowerCase() === "sin rival";
}

function TeamLogo({
  name,
  getLogo,
}: {
  name?: string | null;
  getLogo: (name?: string | null) => string | null;
}) {
  const safeName = name?.trim() || "Por definir";
  const isBye = isByeLabel(name);
  const logo = name && !isBye ? getLogo(name) : null;

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center">
      {logo ? (
        <img src={logo} alt={safeName} className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#dce8f0] text-[9px] font-black text-[#7890a7]">
          {!name || isBye ? "—" : safeName.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

function PlaceholderTeamRow() {
  return (
    <div className="flex h-11 items-center gap-3 border-b border-[#e7eff5] px-4 last:border-b-0">
      <span className="h-9 w-9 rounded-[8px] bg-[#dce8f0]" />
      <span className="h-5 w-[150px] rounded bg-[#dce8f0]" />
      <span className="ml-auto border-l border-[#dce8f0] pl-5 text-[18px] font-black text-[#9db0bf]">-</span>
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
      <div className={`overflow-hidden rounded-[10px] border bg-white ${final ? "border-[#b9dbef]" : "border-[#d5e6f0]"}`}>
        <PlaceholderTeamRow />
        <PlaceholderTeamRow />
      </div>
    );
  }

  const winner = getKnockoutWinner(match);
  const title = [match.dia, match.hora].filter(Boolean).join(" · ") || undefined;

  const TeamRow = ({ name, side }: { name?: string | null; side: "home" | "away" }) => {
    const safeName = name?.trim() || "Por definir";
    const isBye = isByeLabel(name);
    const isWinner = Boolean(name) && !isBye && winner === name;

    return (
      <div className={`flex h-11 items-center gap-3 border-b border-[#e7eff5] px-4 last:border-b-0 ${isWinner ? "bg-[#f0f9fe]" : "bg-white"}`}>
        <TeamLogo name={name} getLogo={getLogo} />
        <span className={`min-w-0 flex-1 truncate text-[16px] ${isBye ? "font-semibold italic text-[#8ea5b8]" : isWinner ? "font-black text-[#102f55]" : "font-bold text-[#355d83]"}`}>
          {safeName}
        </span>
        <strong className={`min-w-[34px] border-l border-[#dce8f0] pl-4 text-center text-[18px] ${isWinner ? "text-[#102f55]" : "text-[#6b8298]"}`}>
          {!name || isBye ? "-" : getKnockoutScore(match, side)}
        </strong>
      </div>
    );
  };

  return (
    <div
      title={title}
      className={`overflow-hidden rounded-[10px] border bg-white shadow-[0_1px_0_rgba(16,47,85,.02)] ${
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
    <header className="flex h-[58px] flex-col items-center justify-center border-b border-[#e2edf4] bg-[linear-gradient(180deg,#edf7fd_0%,#f5fbfe_100%)] text-center">
      <strong className="text-[18px] font-black uppercase tracking-[-.02em] text-[#102f55]">{title}</strong>
      <span className="mt-0.5 text-[13px] font-bold text-[#8ea5b8]">-</span>
    </header>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 64 72" className="h-[92px] w-[84px] text-[#cedce6]" aria-hidden="true">
      <path fill="currentColor" d="M18 6h28v8h10v8c0 12-6 19-17 21-1 4-3 7-7 9v7h11v7H21v-7h11v-7c-4-2-6-5-7-9C14 41 8 34 8 22v-8h10V6Zm0 15h-4v1c0 7 3 12 9 14-3-5-5-10-5-15Zm28 0c0 5-2 10-5 15 6-2 9-7 9-14v-1h-4Z" />
    </svg>
  );
}

export default function KnockoutBracket({
  bracket,
  getLogo,
  rounds,
  showThirdPlace,
}: {
  bracket: KnockoutBracketData;
  getLogo: (name?: string | null) => string | null;
  rounds: readonly KnockoutRoundId[];
  showThirdPlace: boolean;
}) {
  const champion = getKnockoutWinner(bracket.final);
  const bodyHeight = 620;
  const columnWidth = 390;
  const columnGap = 20;
  const cardInset = 20;
  const totalWidth = rounds.length * columnWidth + Math.max(0, rounds.length - 1) * columnGap;

  const connectorPaths: string[] = [];

  rounds.slice(0, -1).forEach((round, stageIndex) => {
    const nextRound = rounds[stageIndex + 1];
    const sourceCount = ROUND_META[round].count;
    const targetCount = ROUND_META[nextRound].count;

    if (sourceCount !== targetCount * 2) return;

    const sourceX = stageIndex * (columnWidth + columnGap) + columnWidth - cardInset;
    const targetX = (stageIndex + 1) * (columnWidth + columnGap) + cardInset;
    const middleX = (sourceX + targetX) / 2;

    for (let targetIndex = 0; targetIndex < targetCount; targetIndex += 1) {
      const firstSource = targetIndex * 2;
      const secondSource = firstSource + 1;
      const y1 = bodyHeight * ((firstSource + 0.5) / sourceCount);
      const y2 = bodyHeight * ((secondSource + 0.5) / sourceCount);
      const targetY = bodyHeight * ((targetIndex + 0.5) / targetCount);

      connectorPaths.push(`M ${sourceX} ${y1} H ${middleX} V ${y2} H ${sourceX}`);
      connectorPaths.push(`M ${middleX} ${targetY} H ${targetX}`);
    }
  });

  return (
    <section>
      <div className="overflow-x-auto pb-3">
        <div
          className="relative overflow-hidden rounded-[12px] border border-[#d7e6f0] bg-white"
          style={{ minWidth: totalWidth, width: totalWidth }}
        >
          <svg
            className="pointer-events-none absolute left-0 top-[58px] z-10"
            width={totalWidth}
            height={bodyHeight}
            viewBox={`0 0 ${totalWidth} ${bodyHeight}`}
            aria-hidden="true"
          >
            <g fill="none" stroke="#9fcdea" strokeWidth="1.4" vectorEffect="non-scaling-stroke">
              {connectorPaths.map((path, index) => (
                <path key={`${path}-${index}`} d={path} />
              ))}
            </g>
          </svg>

          <div
            className="relative z-20 grid bg-[#f8fbfd]"
            style={{
              gridTemplateColumns: `repeat(${rounds.length}, ${columnWidth}px)`,
              columnGap,
            }}
          >
            {rounds.map((round, roundIndex) => {
              const meta = ROUND_META[round];
              const matches = getRoundMatches(bracket, round);
              const isFinal = round === "final";

              return (
                <section
                  key={round}
                  className={`${roundIndex < rounds.length - 1 ? "border-r border-[#e6eff5]" : ""} bg-[linear-gradient(90deg,#f7fbfe_0%,#fbfdff_100%)]`}
                >
                  <StageHeader title={meta.title} />

                  {isFinal ? (
                    <div className="relative px-5" style={{ height: bodyHeight }}>
                      <div className="absolute left-1/2 top-[82px] flex -translate-x-1/2 flex-col items-center text-center">
                        {champion && getLogo(champion) ? (
                          <img src={getLogo(champion) || ""} alt={champion} className="mb-3 h-20 w-20 object-contain" />
                        ) : (
                          <TrophyIcon />
                        )}
                        {champion && (
                          <span className="mt-1 max-w-[230px] truncate text-[16px] font-black uppercase tracking-[.04em] text-[#355d83]">
                            {champion}
                          </span>
                        )}
                      </div>

                      <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2">
                        <MatchCard match={bracket.final} getLogo={getLogo} final />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="grid px-5"
                      style={{ height: bodyHeight, gridTemplateRows: `repeat(${meta.count}, minmax(0, 1fr))` }}
                    >
                      {matches.map((match, index) => (
                        <div key={`${round}-${index}`} className="flex items-center">
                          <div className="w-full">
                            <MatchCard match={match} getLogo={getLogo} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {showThirdPlace && (
        <div className="mt-4 max-w-[520px] rounded-[12px] border border-[#d7e6f0] bg-white p-4">
          <p className="mb-3 text-[13px] font-black uppercase tracking-[.14em] text-[#7890a7]">3.º puesto</p>
          <MatchCard match={bracket.thirdPlace} getLogo={getLogo} />
        </div>
      )}
    </section>
  );
}
