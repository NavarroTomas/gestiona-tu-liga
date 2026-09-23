"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  elementInlineStyle,
  type EditorBreakpoint,
  type HomeEditorDocument,
  type HomeEditorElementId,
} from "@/lib/siteEditor";

const competitions = [
  {
    key: "primera",
    elementId: "competitions.league" as const,
    label: "Liga",
    title: "Primera División",
    description: "La máxima categoría de APA. Tabla, resultados, clubes y recorrido completo de la temporada.",
    href: "/divisiones?division=primera",
    image: "/images/fixture/liga.png",
  },
  {
    key: "segunda",
    elementId: "competitions.league" as const,
    label: "Liga",
    title: "Segunda División",
    description: "El camino del ascenso y la pelea por un lugar entre los mejores equipos de la comunidad.",
    href: "/divisiones?division=segunda",
    image: "/images/competicion/fondo_principal.png",
  },
  {
    key: "argentina",
    elementId: "competitions.cups" as const,
    label: "Copa",
    title: "Copa Argentina",
    description: "Cruces directos, series decisivas y una llave que lleva a la final nacional de APA.",
    href: "/competicion/copa-argentina",
    image: "/images/competicion/copa-argentina.png",
  },
  {
    key: "apa",
    elementId: "competitions.cups" as const,
    label: "Copa",
    title: "Copa APA",
    description: "La copa oficial de la temporada con formato propio y partidos de eliminación.",
    href: "/competicion/copa-apa",
    image: "/images/competicion/copa-apa.png",
  },
  {
    key: "campeones",
    elementId: "competitions.cups" as const,
    label: "Copa",
    title: "Copa de Campeones",
    description: "Los clubes más destacados vuelven a enfrentarse por uno de los títulos más importantes.",
    href: "/competicion/copa-campeones",
    image: "/images/competicion/copa-campeones.png",
  },
  {
    key: "playoffs",
    elementId: "competitions.playoffs" as const,
    label: "Definición",
    title: "Playoffs",
    description: "Los cruces que deciden ascensos, permanencias y el cierre competitivo de la temporada.",
    href: "/competicion/playoffs",
    image: "/images/competicion/playoffs.png",
  },
] as const;

type Props = {
  editor?: HomeEditorDocument["competitions"];
  elements?: HomeEditorDocument["elements"];
  breakpoint?: EditorBreakpoint;
  editorMode?: boolean;
  selectedElement?: HomeEditorElementId | null;
  onSelectElement?: (element: HomeEditorElementId) => void;
};

export default function HomeCompetitionStrip({
  editor = DEFAULT_HOME_EDITOR_DOCUMENT.competitions,
  elements = DEFAULT_HOME_EDITOR_DOCUMENT.elements,
  breakpoint = "desktop",
  editorMode = false,
  selectedElement = null,
  onSelectElement,
}: Props) {
  function selectable(id: HomeEditorElementId) {
    const inlineStyle = elementInlineStyle(elements[id], breakpoint);
    return {
      "data-editor-element": id,
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (!editorMode) return;
        event.preventDefault();
        event.stopPropagation();
        onSelectElement?.(id);
      },
      className: editorMode
        ? "relative cursor-pointer " +
          (selectedElement === id
            ? "outline outline-2 outline-offset-2 outline-[#ffcc4d]"
            : "hover:outline hover:outline-1 hover:outline-offset-2 hover:outline-[#ffcc4d]/70")
        : undefined,
      style: inlineStyle,
    };
  }

  const eyebrowSelection = selectable("competitions.eyebrow");
  const titleSelection = selectable("competitions.title");
  const subtitleSelection = selectable("competitions.subtitle");
  const calendarSelection = selectable("competitions.calendarLink");

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#c7e0ed] bg-[#eef8fd] px-5 py-8 sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute -right-28 -top-36 h-96 w-96 rounded-full bg-[#76c7ef]/15 blur-3xl" />

      <div className="relative z-10 grid gap-4 border-b border-[#bfd9e7] pb-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p {...eyebrowSelection} className={(eyebrowSelection.className ?? "") + " text-[11px] font-black uppercase tracking-[0.22em] text-[#168fd4]"}>
            {editor.eyebrow}
          </p>
          <h2
            {...titleSelection}
            className={(titleSelection.className ?? "") + " mt-1 text-[42px] font-black uppercase tracking-[-0.05em] text-[#0d3158] sm:text-[56px]"}
          >
            {editor.title}
          </h2>
          <p {...subtitleSelection} className={(subtitleSelection.className ?? "") + " mt-3 max-w-xl text-[14px] font-semibold leading-6 text-[#58788f]"}>
            Toda la temporada, en un vistazo.
          </p>
        </div>

        <Link
          {...calendarSelection}
          href="/competicion"
          className={(calendarSelection.className ?? "") + " w-fit text-[11px] font-black uppercase tracking-[0.08em] text-[#168fd4] transition hover:text-[#0f6f9e]"}
        >
          Ver calendario completo →
        </Link>
      </div>

      <div className="relative z-10 mt-7 space-y-4">
        {competitions.map((competition, index) => {
          const selection = selectable(competition.elementId);
          const imageRight = index % 2 === 1;

          return (
            <motion.div
              key={competition.key}
              initial={{ opacity: 0, x: index % 2 === 0 ? -90 : 90 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.24, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <article
                {...selection}
                className={(selection.className ?? "") + " group grid min-h-[190px] overflow-hidden rounded-[22px] border border-[#cfe2ec] bg-white shadow-[0_12px_36px_rgba(16,47,85,.06)] md:grid-cols-[minmax(260px,.75fr)_minmax(0,1.25fr)]"}
              >
                <div className={"relative min-h-[180px] overflow-hidden " + (imageRight ? "md:order-2" : "")}>
                  <img src={competition.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(7,35,61,.72),rgba(7,35,61,.08))]" />
                  <span className="absolute left-5 top-5 rounded-full border border-white/25 bg-[#102f55]/80 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
                    {competition.label}
                  </span>
                </div>

                <Link
                  href={competition.href}
                  className={"flex min-h-[190px] flex-col justify-center p-6 sm:p-8 " + (imageRight ? "md:order-1" : "")}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#168fd4]">
                    0{index + 1} / {String(competitions.length).padStart(2, "0")}
                  </p>
                  <div className="mt-3 flex items-start justify-between gap-5">
                    <div>
                      <h3 className="text-[30px] font-black leading-[.98] tracking-[-0.045em] text-[#102f55] transition group-hover:text-[#168fd4] sm:text-[38px]">
                        {competition.title}
                      </h3>
                      <p className="mt-4 max-w-[58ch] text-[13px] font-semibold leading-6 text-[#648297]">
                        {competition.description}
                      </p>
                    </div>
                    <span className="mt-1 text-[22px] font-black text-[#a1bbc9] transition group-hover:translate-x-1 group-hover:text-[#168fd4]">→</span>
                  </div>
                </Link>
              </article>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
