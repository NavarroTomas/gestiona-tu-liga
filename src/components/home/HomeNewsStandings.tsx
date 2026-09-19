"use client";

import Link from "next/link";
import { useState } from "react";
import TeamLink from "@/components/team/TeamLink";
import type { HomeNews, StandingRow } from "@/lib/homePortal";

function NewsCard({ item, featured = false }: { item: HomeNews; featured?: boolean }) {
  const href = item.href || "/noticias";

  return (
    <Link
      href={href}
      className={
        featured
          ? "group block rounded-[18px] border border-[#d8e8f0] bg-[#f8fbfd] p-5 transition hover:border-[#b8d8ea] hover:bg-white"
          : "group block rounded-[16px] border border-[#dce9f1] bg-white p-4 transition hover:border-[#b8d8ea] hover:bg-[#fbfdff]"
      }
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#168fd4]">
          {item.categoria || "Actualidad APA"}
        </span>

        {item.meta ? (
          <>
            <span className="text-[9px] font-black text-[#afc2cf]">•</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#7891a3]">
              {item.meta}
            </span>
          </>
        ) : null}
      </div>

      <h3
        className={
          featured
            ? "mt-3 text-[30px] font-black leading-[1.02] tracking-[-0.04em] text-[#102f55] transition group-hover:text-[#168fd4]"
            : "mt-2 text-[16px] font-black leading-[1.12] tracking-[-0.02em] text-[#102f55] transition group-hover:text-[#168fd4]"
        }
      >
        {item.titulo}
      </h3>

      {item.descripcion ? (
        <p
          className={
            featured
              ? "mt-3 max-w-[62ch] text-[14px] leading-6 text-[#58788f]"
              : "mt-2 text-[12px] leading-5 text-[#6a8799]"
          }
        >
          {item.descripcion}
        </p>
      ) : null}

      <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#168fd4]">
        <span>Ver detalle</span>
        <span aria-hidden="true">→</span>
      </div>
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
    <div className="overflow-hidden rounded-[16px] border border-[#dce9f1] bg-white">
      <div className="grid grid-cols-[28px_minmax(0,1fr)_44px_50px_50px] gap-2 border-b border-[#dce9f1] bg-[#f6fafc] px-3 py-3 text-[9px] font-black uppercase tracking-[0.08em] text-[#7891a3]">
        <span>#</span>
        <span>Club</span>
        <span className="text-center">PJ</span>
        <span className="text-center">DG</span>
        <span className="text-right">PTS</span>
      </div>

      <div>
        {rows.map((row, index) => (
          <div
            key={row.club}
            className="grid grid-cols-[28px_minmax(0,1fr)_44px_50px_50px] items-center gap-2 border-b border-[#e4eef4] px-3 py-3 text-[12px] last:border-b-0"
          >
            <span className="font-black text-[#315f89]">{index + 1}</span>

            <TeamLink name={row.club} className="flex min-w-0 items-center gap-2.5">
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

  const featuredNews = news[0];
  const secondaryNews = news.slice(1, 5);

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#cfe4f0] bg-white shadow-[0_14px_40px_rgba(16,47,85,.07)]">
      <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(390px,.7fr)]">
        <article className="border-b border-[#d8e8f0] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#168fd4]">
                Actualidad APA
              </p>
              <h2 className="mt-1 text-[24px] font-black uppercase tracking-[-0.03em] text-[#102f55]">
                Últimas noticias
              </h2>
            </div>

            <Link
              href="/noticias"
              className="text-[11px] font-black text-[#168fd4] transition hover:text-[#0f6f9e]"
            >
              Ver todas →
            </Link>
          </div>

          {news.length ? (
            <div className="space-y-4">
              {featuredNews ? <NewsCard item={featuredNews} featured /> : null}

              {secondaryNews.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {secondaryNews.map((item) => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="py-10 text-sm font-bold text-[#7891a3]">
              Las novedades aparecerán automáticamente cuando haya actividad.
            </p>
          )}
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

            <Link
              href="/divisiones"
              className="shrink-0 text-[11px] font-black text-[#168fd4] transition hover:text-[#0f6f9e]"
            >
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
