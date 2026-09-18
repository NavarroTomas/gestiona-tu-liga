"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PremiosController } from "@/hooks/usePremios";

type PremiosSortKey = "overallRating" | "score" | "goals" | "assists" | "mvp";

export default function PremiosTop({ controller }: { controller: PremiosController }) {
  const [sortKey, setSortKey] = useState<PremiosSortKey>("overallRating");
  const rows = useMemo(() => [...controller.jugadores].sort((a, b) => Number(b[sortKey]) - Number(a[sortKey]) || b.overallRating - a.overallRating || b.score - a.score).slice(0, 10), [controller.jugadores, sortKey]);
  return (
    <section className="rounded-2xl border border-[#c9e3f1] bg-white p-5 md:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2d98d4]">Top rendimiento</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-[#102f55]">Ranking de la fecha</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ["overallRating", "Rating"],
            ["score", "Score"],
            ["goals", "Goles"],
            ["assists", "Asist."],
            ["mvp", "MVP"],
          ] as Array<[PremiosSortKey, string]>).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortKey(key)}
              className={`rounded-lg border px-2.5 py-1.5 text-[9px] font-black uppercase transition ${sortKey === key ? "border-[#2d98d4] bg-[#eaf7fd] text-[#146f9f]" : "border-[#d8e8f0] text-[#607b90] hover:bg-[#f7fbfe]"}`}
            >
              {label} {sortKey === key ? "↓" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-[#d8e8f0]">
        {rows.map((player, index) => {
          const logo = controller.logoEquipo(player.equipo);
          const content = (
            <div className="grid grid-cols-[42px_minmax(0,1fr)_90px] items-center gap-3 border-b border-[#e6f1f6] bg-white px-4 py-3 last:border-b-0 hover:bg-[#f7fbfe] sm:grid-cols-[48px_minmax(0,1fr)_120px_100px]">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black ${index === 0 ? "bg-[#102f55] text-white" : "bg-[#eaf6fd] text-[#102f55]"}`}>{index + 1}</div>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#d8e8f0] bg-[#f3fafe]">
                  {logo ? <img src={logo} alt={player.equipo} className="h-full w-full object-contain p-1" /> : <span className="text-[10px] font-black text-[#102f55]">{player.equipo.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black uppercase text-[#102f55]">{player.nombre}</p>
                  <p className="truncate text-xs text-[#607b90]">{player.equipo}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#7d98aa]">Rating</p>
                <p className="text-lg font-black text-[#2d98d4]">{player.overallRating}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#7d98aa]">Score</p>
                <p className="text-base font-black text-[#102f55]">{player.score}</p>
              </div>
            </div>
          );
          return player.playerId ? <Link key={`${player.playerId}-${index}`} href={`/jugadores/${encodeURIComponent(player.playerId)}`}>{content}</Link> : <div key={`${player.nombre}-${index}`}>{content}</div>;
        })}
      </div>
    </section>
  );
}
