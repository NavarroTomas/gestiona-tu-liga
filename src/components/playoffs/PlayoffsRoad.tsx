import Link from "next/link";
import { PLAYOFFS_CONFIG, type PlayoffStageId } from "@/config/playoffs";
import type { CupMatch } from "@/lib/cups/types";
import { stableMatchId } from "@/lib/competitionData";
import { getPlayoffScore, getPlayoffWinner } from "@/lib/playoffs";

export type PlayoffsRoadData = Record<PlayoffStageId, (CupMatch | undefined)[]>;

function TeamLogo({
  name,
  getLogo,
}: {
  name: string;
  getLogo: (name?: string | null) => string | null;
}) {
  const logo = getLogo(name);

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center">
      {logo ? (
        <img src={logo} alt={name} className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#e2edf4] text-[8px] font-black text-[#6d879e]">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

function PlaceholderMatch({ label }: { label: string }) {
  return (
    <div className="overflow-hidden rounded-[9px] border border-[#d7e6f0] bg-white">
      <div className="border-b border-[#e7eff5] bg-[#f8fbfd] px-3 py-1.5 text-[8px] font-black uppercase tracking-[.12em] text-[#91a5b7]">
        Por definir
      </div>
      <div className="flex h-[72px] items-center justify-center px-4 text-center">
        <span className="text-[10px] font-bold uppercase tracking-[.06em] text-[#8aa0b3]">{label}</span>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  placeholder,
  getLogo,
  accent = false,
}: {
  match?: CupMatch;
  placeholder: string;
  getLogo: (name?: string | null) => string | null;
  accent?: boolean;
}) {
  if (!match) return <PlaceholderMatch label={placeholder} />;

  const winner = getPlayoffWinner(match);
  const hasResult = Boolean(match.resultado);
  const meta = [match.dia, match.hora].filter(Boolean).join(" · ");

  const TeamRow = ({ name, side }: { name: string; side: "home" | "away" }) => {
    const isWinner = winner === name;
    return (
      <div className={`flex min-h-[42px] items-center gap-2.5 border-b border-[#e7eff5] px-3 last:border-b-0 ${isWinner ? "bg-[#eef8fe]" : "bg-white"}`}>
        <TeamLogo name={name} getLogo={getLogo} />
        <span className={`min-w-0 flex-1 truncate text-[11px] ${isWinner ? "font-black text-[#102f55]" : "font-bold text-[#355d83]"}`}>
          {name}
        </span>
        <strong className={`min-w-[28px] border-l border-[#dce8f0] pl-3 text-center text-[13px] ${isWinner ? "text-[#102f55]" : "text-[#6b8298]"}`}>
          {hasResult ? getPlayoffScore(match, side) : "—"}
        </strong>
      </div>
    );
  };

  const content = (
    <div className={`overflow-hidden rounded-[9px] border bg-white transition ${accent ? "border-[#9fd2ed]" : "border-[#d7e6f0]"} hover:border-[#86c8eb]`}>
      <div className="flex items-center justify-between gap-3 border-b border-[#e7eff5] bg-[#f8fbfd] px-3 py-1.5">
        <span className={`text-[8px] font-black uppercase tracking-[.11em] ${hasResult ? "text-[#3188bd]" : "text-[#7890a7]"}`}>
          {hasResult ? "Finalizado" : meta ? "Programado" : "Pendiente"}
        </span>
        <span className="truncate text-[8px] font-bold uppercase tracking-[.08em] text-[#8aa0b3]">{meta || "Sin fecha"}</span>
      </div>
      <TeamRow name={match.local} side="home" />
      <TeamRow name={match.visitante} side="away" />
    </div>
  );

  const matchId = match.partido_id || match.id;
  if (!matchId) return content;

  return (
    <Link href={`/estadisticas/${encodeURIComponent(String(match.partido_id || stableMatchId(match.temporada, match.id)))}`} className="block">
      {content}
    </Link>
  );
}

function StageHeader({ stageId }: { stageId: PlayoffStageId }) {
  const stage = PLAYOFFS_CONFIG.stageDefinitions[stageId];
  return (
    <header className="flex h-[78px] flex-col items-center justify-center border-b border-[#e2edf4] bg-[linear-gradient(180deg,#edf7fd_0%,#f7fbfe_100%)] px-4 text-center">
      <strong className="text-[13px] font-black uppercase tracking-[-.02em] text-[#102f55]">{stage.label}</strong>
      <span className="mt-1 max-w-[250px] text-[9px] font-bold leading-4 text-[#7d95aa]">{stage.description}</span>
    </header>
  );
}

/**
 * CAMINO VISUAL DE LOS PLAYOFFS
 * -----------------------------
 * Este archivo controla únicamente el aspecto del cuadro.
 *
 * Para cambiar fases, textos, cantidad de partidos o formato por temporada,
 * NO edites este componente: usá `src/config/playoffs.ts`.
 */
export default function PlayoffsRoad({
  road,
  getLogo,
  stages,
}: {
  road: PlayoffsRoadData;
  getLogo: (name?: string | null) => string | null;
  stages: readonly PlayoffStageId[];
}) {
  const bodyHeight = 420;
  const columnWidth = 350;
  const columnGap = 18;
  const inset = 18;
  const totalWidth = stages.length * columnWidth + Math.max(0, stages.length - 1) * columnGap;
  const connectorPaths: string[] = [];

  stages.slice(0, -1).forEach((stageId, stageIndex) => {
    const nextStageId = stages[stageIndex + 1];
    const sourceCount = PLAYOFFS_CONFIG.stageDefinitions[stageId].matchCount;
    const targetCount = PLAYOFFS_CONFIG.stageDefinitions[nextStageId].matchCount;
    const sourceX = stageIndex * (columnWidth + columnGap) + columnWidth - inset;
    const targetX = (stageIndex + 1) * (columnWidth + columnGap) + inset;
    const middleX = (sourceX + targetX) / 2;

    if (sourceCount === targetCount * 2) {
      for (let targetIndex = 0; targetIndex < targetCount; targetIndex += 1) {
        const firstSource = targetIndex * 2;
        const secondSource = firstSource + 1;
        const y1 = bodyHeight * ((firstSource + 0.5) / sourceCount);
        const y2 = bodyHeight * ((secondSource + 0.5) / sourceCount);
        const targetY = bodyHeight * ((targetIndex + 0.5) / targetCount);
        connectorPaths.push(`M ${sourceX} ${y1} H ${middleX} V ${y2} H ${sourceX}`);
        connectorPaths.push(`M ${middleX} ${targetY} H ${targetX}`);
      }
      return;
    }

    if (sourceCount === targetCount) {
      for (let index = 0; index < sourceCount; index += 1) {
        const y = bodyHeight * ((index + 0.5) / sourceCount);
        connectorPaths.push(`M ${sourceX} ${y} H ${targetX}`);
      }
      return;
    }

    connectorPaths.push(`M ${sourceX} ${bodyHeight / 2} H ${targetX}`);
  });

  return (
    <section className="overflow-x-auto pb-2">
      <div className="relative overflow-hidden rounded-[10px] border border-[#d7e6f0] bg-white" style={{ minWidth: totalWidth, width: totalWidth }}>
        <svg className="pointer-events-none absolute left-0 top-[78px] z-10" width={totalWidth} height={bodyHeight} viewBox={`0 0 ${totalWidth} ${bodyHeight}`} aria-hidden="true">
          <g fill="none" stroke="#9fcdea" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
            {connectorPaths.map((path, index) => <path key={`${path}-${index}`} d={path} />)}
          </g>
        </svg>

        <div
          className="relative z-20 grid bg-[#f8fbfd]"
          style={{ gridTemplateColumns: `repeat(${stages.length}, ${columnWidth}px)`, columnGap }}
        >
          {stages.map((stageId, stageIndex) => {
            const definition = PLAYOFFS_CONFIG.stageDefinitions[stageId];
            const stageMatches = road[stageId];
            const accent = stageId === "promotion";

            return (
              <section
                key={stageId}
                className={`${stageIndex < stages.length - 1 ? "border-r border-[#e6eff5]" : ""} ${accent ? "bg-[linear-gradient(90deg,#f7fbfe_0%,#eef8fe_100%)]" : "bg-[linear-gradient(90deg,#f8fbfd_0%,#fbfdff_100%)]"}`}
              >
                <StageHeader stageId={stageId} />
                <div
                  className="grid px-[18px]"
                  style={{ height: bodyHeight, gridTemplateRows: `repeat(${definition.matchCount}, minmax(0, 1fr))` }}
                >
                  {stageMatches.map((match, index) => (
                    <div key={`${stageId}-${index}`} className="flex items-center">
                      <div className="w-full">
                        <MatchCard
                          match={match}
                          placeholder={definition.placeholders[index] || definition.label}
                          getLogo={getLogo}
                          accent={accent}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
