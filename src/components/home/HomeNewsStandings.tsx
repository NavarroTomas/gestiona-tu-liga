"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, type MouseEvent } from "react";
import TeamLink from "@/components/team/TeamLink";
import type { HomeNews, StandingRow } from "@/lib/homePortal";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  elementInlineStyle,
  type EditorBreakpoint,
  type HomeEditorDocument,
  type HomeEditorElementId,
} from "@/lib/siteEditor";

function NewsCard({ item, featured = false }: { item: HomeNews; featured?: boolean }) {
  const href = item.href || "/";

  return (
    <Link
      href={href}
      className={
        featured
          ? "group relative block min-h-[360px] overflow-hidden rounded-[26px] border border-[#cfe3ee] bg-[linear-gradient(135deg,#eef8fd_0%,#f9fcfe_64%,#e9f5fb_100%)] p-7 transition hover:border-[#98cde7] sm:p-9"
          : "group block min-h-[180px] rounded-[20px] border border-[#d8e8f0] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#a8d4e8] hover:shadow-[0_12px_30px_rgba(16,47,85,.06)]"
      }
    >
      {featured ? <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#70c5ee]/20 blur-3xl" /> : null}

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className={featured ? "rounded-full bg-[#102f55] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white" : "text-[9px] font-black uppercase tracking-[0.15em] text-[#168fd4]"}>
            {item.categoria || "Actualidad APA"}
          </span>
          {item.meta ? <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#7891a3]">{item.meta}</span> : null}
        </div>

        <h3 className={featured ? "mt-8 max-w-[820px] text-[40px] font-black leading-[0.98] tracking-[-0.05em] text-[#102f55] transition group-hover:text-[#168fd4] sm:text-[54px]" : "mt-4 text-[22px] font-black leading-[1.08] tracking-[-0.03em] text-[#102f55] transition group-hover:text-[#168fd4]"}>
          {item.titulo}
        </h3>

        {item.descripcion ? (
          <p className={featured ? "mt-5 max-w-[64ch] text-[15px] font-semibold leading-7 text-[#58788f]" : "mt-3 text-[12px] font-semibold leading-5 text-[#6a8799]"}>
            {item.descripcion}
          </p>
        ) : null}

        <div className="mt-auto pt-7 text-[10px] font-black uppercase tracking-[0.08em] text-[#168fd4]">
          Ver detalle <span className="ml-2">→</span>
        </div>
      </div>
    </Link>
  );
}

function StandingsTable({ rows, logoEquipo }: { rows: StandingRow[]; logoEquipo: (club: string) => string | null }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#d8e8f0] bg-white">
      <div className="grid grid-cols-[34px_minmax(0,1fr)_52px_52px_58px] gap-2 border-b border-[#dce9f1] bg-[#f1f8fc] px-5 py-4 text-[9px] font-black uppercase tracking-[0.08em] text-[#6d899b]">
        <span>#</span><span>Club</span><span className="text-center">PJ</span><span className="text-center">DG</span><span className="text-right">PTS</span>
      </div>

      {rows.length ? rows.map((row,index)=>(
        <div key={row.club} className={"grid grid-cols-[34px_minmax(0,1fr)_52px_52px_58px] items-center gap-2 border-b border-[#e5eef3] px-5 py-4 text-[12px] last:border-b-0 "+(index<3?"bg-[#fbfdff]":"")}>
          <span className={"font-black "+(index<3?"text-[#168fd4]":"text-[#527797]")}>{index+1}</span>
          <TeamLink name={row.club} className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center">
              {logoEquipo(row.club)?<img src={logoEquipo(row.club)!} alt="" className="h-full w-full object-contain" />:<span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#edf6fb] text-[8px] font-black text-[#6f8ca0]">{row.club.slice(0,2).toUpperCase()}</span>}
            </span>
            <span className="truncate text-[13px] font-black text-[#173e68]">{row.club}</span>
          </TeamLink>
          <span className="text-center font-bold text-[#58788f]">{row.pj}</span>
          <span className="text-center font-bold text-[#58788f]">{row.dg>0?"+":""}{row.dg}</span>
          <span className="text-right text-[15px] font-black text-[#102f55]">{row.pts}</span>
        </div>
      )):<p className="px-4 py-10 text-center text-[12px] font-bold text-[#7891a3]">Todavía no hay resultados suficientes.</p>}
    </div>
  );
}

export default function HomeNewsStandings({
  news,
  standingsPrimera,
  standingsSegunda,
  logoEquipo,
  temporada,
  elements = DEFAULT_HOME_EDITOR_DOCUMENT.elements,
  breakpoint = "desktop",
  editorMode = false,
  selectedElement = null,
  onSelectElement,
}: {
  news: HomeNews[];
  standingsPrimera: StandingRow[];
  standingsSegunda: StandingRow[];
  logoEquipo: (club: string) => string | null;
  temporada: string;
  elements?: HomeEditorDocument["elements"];
  breakpoint?: EditorBreakpoint;
  editorMode?: boolean;
  selectedElement?: HomeEditorElementId | null;
  onSelectElement?: (element: HomeEditorElementId) => void;
}) {
  const [division,setDivision]=useState<"Primera"|"Segunda">("Primera");
  const standings=division==="Primera"?standingsPrimera:standingsSegunda;

  function selectable(id: HomeEditorElementId) {
    return {
      "data-editor-element": id,
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (!editorMode) return;
        event.preventDefault();
        event.stopPropagation();
        onSelectElement?.(id);
      },
      className: editorMode
        ? "relative cursor-pointer " + (selectedElement===id?"outline outline-2 outline-offset-2 outline-[#ffcc4d]":"hover:outline hover:outline-1 hover:outline-offset-2 hover:outline-[#ffcc4d]/70")
        : undefined,
      style: elementInlineStyle(elements[id],breakpoint),
    };
  }

  const newsHeadingSelection=selectable("news.heading");
  const newsFeedSelection=selectable("news.feed");
  const standingsHeadingSelection=selectable("news.standingsHeading");
  const standingsTableSelection=selectable("news.standingsTable");
  const featuredNews=news[0];
  const secondaryNews=news.slice(1,5);

  return (
    <motion.section
      initial={{opacity:0,y:34}}
      whileInView={{opacity:1,y:0}}
      viewport={{once:true,amount:0.12}}
      transition={{duration:0.8,ease:[0.2,0.8,0.2,1]}}
      className="min-h-[100svh] overflow-hidden rounded-[30px] border border-[#c8e0ed] bg-white shadow-[0_22px_60px_rgba(16,47,85,.09)]"
    >
      <div className="grid min-h-[100svh] lg:grid-cols-[minmax(0,1.48fr)_minmax(420px,.82fr)]">
        <article className="border-b border-[#d8e8f0] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div {...newsHeadingSelection} className={(newsHeadingSelection.className??"")+" mb-7"}>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#168fd4]">Actualidad APA</p>
              <span className="rounded-full border border-[#cfe3ee] bg-[#f5fbff] px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#68879d]">{temporada}</span>
            </div>
            <h2 className="mt-2 text-[36px] font-black uppercase tracking-[-0.05em] text-[#102f55] sm:text-[48px]">Últimas noticias</h2>
          </div>

          {news.length?(
            <div {...newsFeedSelection} className={(newsFeedSelection.className??"")+" space-y-5"}>
              {featuredNews?<NewsCard item={featuredNews} featured />:null}
              {secondaryNews.length?<div className="grid gap-5 md:grid-cols-2">{secondaryNews.map((item)=><NewsCard key={item.id} item={item} />)}</div>:null}
            </div>
          ):<p className="py-10 text-sm font-bold text-[#7891a3]">Las novedades aparecerán automáticamente cuando haya actividad.</p>}
        </article>

        <article className="flex h-full flex-col bg-[linear-gradient(180deg,#fbfdff,#f4f9fc)] p-6 sm:p-8 lg:p-10">
          <div {...standingsHeadingSelection} className={(standingsHeadingSelection.className??"")+" flex items-start justify-between gap-4"}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#168fd4]">Liga</p>
              <h2 className="mt-2 text-[36px] font-black uppercase tracking-[-0.05em] text-[#102f55] sm:text-[48px]">Tabla de posiciones</h2>
            </div>
            <Link href="/divisiones" className="mt-2 shrink-0 text-[10px] font-black uppercase tracking-[0.06em] text-[#168fd4] transition hover:text-[#0f6f9e]">Completa →</Link>
          </div>

          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-[#cde2ed] bg-[#edf6fb] p-1">
            {(["Primera","Segunda"] as const).map((item)=>(
              <button key={item} type="button" onClick={()=>setDivision(item)} className={"h-12 rounded-lg text-[10px] font-black uppercase tracking-[0.08em] transition "+(division===item?"bg-[#102f55] text-white shadow-sm":"text-[#66859b] hover:bg-white/70")}>
                {item}
              </button>
            ))}
          </div>

          <div {...standingsTableSelection} className={(standingsTableSelection.className??"")+" mt-5 flex-1"}>
            <StandingsTable rows={standings} logoEquipo={logoEquipo} />
          </div>
        </article>
      </div>
    </motion.section>
  );
}
