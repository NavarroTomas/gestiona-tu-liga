"use client";

import Link from "next/link";
import { useState } from "react";
import TeamLink from "@/components/team/TeamLink";
import type { HomeNews, StandingRow } from "@/lib/homePortal";

function NewsRow({ item, featured = false }: { item: HomeNews; featured?: boolean }) {
  const content = (
    <div
      className={`group border-b border-[#dce9f1] last:border-b-0 transition ${featured ? "py-5" : "py-4"}`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#168fd4]">
          {item.categoria || "Actualidad APA"}
        </span>
        {item.meta ? (
          <>
            <span className="text-[9px] font-black text-[#adc2cf]">•</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#7891a3]">
              {item.meta}
            </span>
          </>
        ) : null}
      </div>

      <h3
        className={`mt-1.5 font-black leading-[1.15] tracking-[-0.02em] text-[#102f55] transition group-hover:text-[#168fd4] ${
          featured ? "text-[24px] sm:text-[28px]" : "text-[15px] sm:text-[16px]"
        }`}
      >
        {item.titulo}
      </h3>

      {item.descripcion ? (
        <p
          className={`mt-2 text-[#58788f] ${
            featured ? "line-clamp-2 text-[13px] leading-5" : "line-clamp-1 text-[11px]"
          }`}
        >
          {item.descripcion}
        </p>
      ) : null}

      <div className="mt-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#168fd4]">
        Ver detalle →
      </div>
    </div>
  );

  return item.href ? (
    <Link href={item.href} className="block">
      {content}
    </Link>
  ) : (
    <Link href="/noticias" className="block">
      {content}
    </Link>
  );
}

function StandingsTable({
  rows,
  logoEquipo,
}: {
  rows: StandingRow[];
  logoEquipo: (club: string) => string | null;
}) {
  return (
    <div>
      <div className="grid grid-cols-[28px_minmax(0,1fr)_42px_46px_46px] gap-2 border-b border-[#dce9f1] px-2 pb-2 text-[9px] font-black uppercase tracking-[0.08em] text-[#7891a3]">
        <span>#</span>
        <span>Club</span>
        <span className="text-center">PJ</span>
        <span className="text-center">DG</span>
        <span className="text-right">PTS</span>
      </div>

      <div>
        {rows.slice(0, 6).map((row, index) => (
          <div
            key={row.club}
            className="grid grid-cols-[28px_minmax(0,1fr)_42px_46px_46px] items-center gap-2 border-b border-[#e4eef4] px-2 py-3 text-[11px] last:border-b-0"
          >
            <span className="font-black text-[#315f89]">{index + 1}</span>

            <TeamLink name={row.club} className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                {logoEquipo(row.club) ? (
                  <img src={logoEquipo(row.club)!} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eef7fc] text-[8px] font-black text-[#6f8ca0]">
                    {row.club.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="truncate font-black text-[#173e68]">{row.club}</span>
            </TeamLink>

            <span className="text-center font-bold text-[#58788f]">{row.pj}</span>
            <span className="text-center font-bold text-[#58788f]">
              {row.dg > 0 ? "+" : ""}
              {row.dg}
            </span>
            <span className="text-right text-[13px] font-black text-[#102f55]">{row.pts}</span>
          </div>
        ))}

        {rows.length === 0 ? (
          <p className="px-2 py-8 text-center text-[12px] font-bold text-[#7891a3]">
            Todavía no hay resultados suficientes.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function HomeNewsStandings({
  news,
  standingsPrimera,
  standingsSegunda,
  logoEquipo,
}: {
  news: HomeNews[];
  standingsPrimera: StandingRow[];
  standingsSegunda: StandingRow[];
  logoEquipo: (club: string) => string | null;
}) {
  const [division, setDivision] = useState<"Primera" | "Segunda">("Primera");
  const standings = division === "Primera" ? standingsPrimera : standingsSegunda;

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#cfe4f0] bg-white shadow-[0_14px_40px_rgba(16,47,85,.07)]">
      <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(390px,.75fr)]">
        <article className="border-b border-[#d8e8f0] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="mb-2 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#168fd4]">
                Actualidad APA
              </p>
              <h2 className="mt-1 text-[24px] font-black uppercase tracking-[-0.03em] text-[#102f55]">
                Últimas noticias
              </h2>
            </div>

            <Link href="/noticias" className="text-[11px] font-black text-[#168fd4] transition hover:text-[#0f6f9e]">
              Ver todas →
            </Link>
          </div>

          <div>
            {news.length ? (
              news.map((item, index) => <NewsRow key={item.id} item={item} featured={index === 0} />)
            ) : (
              <p className="py-10 text-sm font-bold text-[#7891a3]">
                Las novedades aparecerán automáticamente cuando haya actividad.
              </p>
            )}
          </div>
        </article>

        <article className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#168fd4]">
                Liga
              </p>
              <h2 className="mt-1 text-[24px] font-black uppercase tracking-[-0.03em] text-[#102f55]">
                Tabla de posiciones
              </h2>
            </div>

            <Link href="/divisiones" className="shrink-0 text-[11px] font-black text-[#168fd4] transition hover:text-[#0f6f9e]">
              Completa →
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-[8px] border border-[#d5e7f0] bg-[#eef6fb]">
            {(["Primera", "Segunda"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDivision(item)}
                className={`h-10 text-[10px] font-black uppercase transition ${
                  division === item
                    ? "bg-[#bfe8fb] text-[#0d5d8c]"
                    : "text-[#66859b] hover:bg-[#e3f2f9]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <StandingsTable rows={standings} logoEquipo={logoEquipo} />
          </div>
        </article>
      </div>
    </section>
  );
}
