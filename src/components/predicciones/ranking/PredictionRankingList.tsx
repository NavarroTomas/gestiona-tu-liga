"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PredictionRankingItem } from "@/hooks/usePredictionRanking";

type PredictionSortKey = "puntos" | "exactos" | "ganadores" | "fallos" | "jugadas";

/** Lista pública del ranking. */
export default function PredictionRankingList({
  ranking,
  loading,
}: {
  ranking: PredictionRankingItem[];
  loading: boolean;
}) {
  const [sortKey, setSortKey] = useState<PredictionSortKey>("puntos");
  const sortedRanking = useMemo(
    () =>
      [...ranking].sort((a, b) => {
        const primary =
          sortKey === "fallos"
            ? Number(a[sortKey]) - Number(b[sortKey])
            : Number(b[sortKey]) - Number(a[sortKey]);
        return primary || b.puntos - a.puntos || b.exactos - a.exactos || a.nombre.localeCompare(b.nombre);
      }),
    [ranking, sortKey],
  );

  if (loading) {
    return (
      <section className="rounded-2xl border border-[#c9e3f1] bg-white p-10 text-center text-sm font-black uppercase tracking-[0.16em] text-[#2d98d4]">
        Cargando ranking...
      </section>
    );
  }

  if (!ranking.length) {
    return (
      <section className="rounded-2xl border border-[#c9e3f1] bg-white p-10 text-center">
        <h2 className="text-2xl font-black uppercase text-[#102f55]">Todavía no hay ranking</h2>
        <p className="mt-2 text-sm text-[#607b90]">No hay predicciones para este filtro.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#c9e3f1] bg-white p-3">
        {([
          ["puntos", "PTS"],
          ["exactos", "Exactos"],
          ["ganadores", "Ganadores"],
          ["jugadas", "PJ"],
          ["fallos", "Menos fallos"],
        ] as Array<[PredictionSortKey, string]>).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSortKey(key)}
            className={`rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] transition ${sortKey === key ? "border-[#2d98d4] bg-[#eaf7fd] text-[#146f9f]" : "border-[#d8e8f0] bg-white text-[#607b90] hover:bg-[#f7fbfe]"}`}
          >
            {label} {sortKey === key ? "↓" : ""}
          </button>
        ))}
      </div>

      {sortedRanking.map((item, index) => (
        <article
          key={item.usuario}
          className={`rounded-2xl border p-4 md:p-5 ${
            index === 0
              ? "border-[#2d98d4] bg-[#eef8fd]"
              : "border-[#c9e3f1] bg-white"
          }`}
        >
          <div className="grid gap-4 xl:grid-cols-[64px_minmax(0,1fr)_520px] xl:items-center">
            <div className="flex items-center gap-3 xl:block xl:text-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black ${
                  index === 0
                    ? "bg-[#102f55] text-white"
                    : "border border-[#c9e3f1] bg-[#f8fcfe] text-[#102f55]"
                }`}
              >
                {index + 1}
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#7d98aa] xl:mt-1">Puesto</p>
            </div>

            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#b9ddeb] bg-[#eef8fd] text-lg font-black text-[#102f55]">
                {item.avatarUrl ? (
                  <img src={item.avatarUrl} alt={item.nombre} className="h-full w-full object-cover" />
                ) : (
                  item.nombre.slice(0, 1).toUpperCase()
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {item.username ? (
                    <Link href={`/u/${item.username}`} className="truncate text-xl font-black uppercase text-[#102f55] hover:text-[#2d98d4]">
                      {item.nombre}
                    </Link>
                  ) : (
                    <h2 className="truncate text-xl font-black uppercase text-[#102f55]">{item.nombre}</h2>
                  )}
                  {item.rol && (
                    <span className="rounded-full border border-[#b9ddeb] bg-[#eef8fd] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#2d98d4]">
                      {item.rol}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#607b90]">
                  {item.username && <span>@{item.username}</span>}
                  <span>{item.jugadas} resueltas</span>
                  {item.pendientes > 0 && <span>{item.pendientes} pendientes</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Metric label="PTS" value={item.puntos} strong />
              <Metric label="Exactos" value={item.exactos} />
              <Metric label="Gan." value={item.ganadores} />
              <Metric label="Fallos" value={item.fallos} />
              <Metric label="PJ" value={item.jugadas} />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${strong ? "border-[#102f55] bg-[#102f55]" : "border-[#d8e8f0] bg-[#f8fcfe]"}`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.14em] ${strong ? "text-[#8ed2f3]" : "text-[#7d98aa]"}`}>{label}</p>
      <p className={`mt-1 text-2xl font-black ${strong ? "text-white" : "text-[#102f55]"}`}>{value}</p>
    </div>
  );
}
