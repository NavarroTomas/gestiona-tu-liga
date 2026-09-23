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
    description:
      "La máxima categoría de APA. Tabla, resultados, clubes y recorrido completo de la temporada.",
    href: "/divisiones?division=primera",
    image: "/images/fixture/liga.png",
  },
  {
    key: "segunda",
    elementId: "competitions.league" as const,
    label: "Liga",
    title: "Segunda División",
    description:
      "El camino del ascenso y la pelea por un lugar entre los mejores equipos de la comunidad.",
    href: "/divisiones?division=segunda",
    image: "/images/competicion/fondo_principal.png",
  },
  {
    key: "argentina",
    elementId: "competitions.cups" as const,
    label: "Copa",
    title: "Copa Argentina",
    description:
      "Cruces directos, series decisivas y una llave que lleva a la final nacional de APA.",
    href: "/competicion/copa-argentina",
    image: "/images/competicion/copa-argentina.png",
  },
  {
    key: "apa",
    elementId: "competitions.cups" as const,
    label: "Copa",
    title: "Copa APA",
    description:
      "La copa oficial de la temporada con formato propio y partidos de eliminación.",
    href: "/competicion/copa-apa",
    image: "/images/competicion/copa-apa.png",
  },
  {
    key: "campeones",
    elementId: "competitions.cups" as const,
    label: "Copa",
    title: "Copa de Campeones",
    description:
      "Los clubes más destacados vuelven a enfrentarse por uno de los títulos más importantes.",
    href: "/competicion/copa-campeones",
    image: "/images/competicion/copa-campeones.png",
  },
  {
    key: "playoffs",
    elementId: "competitions.playoffs" as const,
    label: "Definición",
    title: "Playoffs",
    description:
      "Los cruces que deciden ascensos, permanencias y el cierre competitivo de la temporada.",
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

      style: elementInlineStyle(elements[id], breakpoint),
    };
  }

  const eyebrowSelection = selectable("competitions.eyebrow");
  const titleSelection = selectable("competitions.title");
  const subtitleSelection = selectable("competitions.subtitle");
  const calendarSelection = selectable("competitions.calendarLink");

  return (
    <section className="relative py-12 sm:py-16">
      <div className="relative border-b border-[#c9dfe9] pb-10">
        <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
          <p
            {...eyebrowSelection}
            style={{
              ...eyebrowSelection.style,
              textAlign: "center",
              width: "100%",
            }}
            className={
              (eyebrowSelection.className ?? "") +
              " text-center text-[11px] font-black uppercase tracking-[0.22em] text-[#168fd4]"
            }
          >
            {editor.eyebrow}
          </p>

          <h2
            {...titleSelection}
            style={{
              ...titleSelection.style,
              textAlign: "center",
              width: "100%",
            }}
            className={
              (titleSelection.className ?? "") +
              " mt-2 text-center text-[44px] font-black uppercase tracking-[-0.055em] text-[#0d3158] sm:text-[60px] lg:text-[68px]"
            }
          >
            {editor.title}
          </h2>

          <p
            {...subtitleSelection}
            style={{
              ...subtitleSelection.style,
              textAlign: "center",
              width: "100%",
            }}
            className={
              (subtitleSelection.className ?? "") +
              " mx-auto mt-3 max-w-xl text-center text-[14px] font-semibold leading-6 text-[#58788f]"
            }
          >
            Toda la temporada, en un vistazo.
          </p>
        </div>

        <Link
          {...calendarSelection}
          href="/competicion"
          className={
            (calendarSelection.className ?? "") +
            " mt-7 flex justify-center text-[12px] font-black uppercase tracking-[0.08em] text-[#168fd4] transition hover:text-[#0f6f9e] md:absolute md:bottom-10 md:right-0 md:mt-0"
          }
        >
         
        </Link>
      </div>

      <div className="mt-12 space-y-14 lg:space-y-20">
        {competitions.map((competition, index) => {
          const selection = selectable(competition.elementId);
          const alignRight = index % 2 === 1;

          return (
            <motion.div
              key={competition.key}
              initial={{
                opacity: 0,
                x: alignRight ? 140 : -140,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.18,
                margin: "0px 0px -6% 0px",
              }}
              transition={{
                duration: 1.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <article
                {...selection}
                className={
                  (selection.className ?? "") +
                  " group relative min-h-[340px] overflow-hidden rounded-[34px] sm:min-h-[390px] xl:min-h-[430px]"
                }
              >
                <img
                  src={competition.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.045]"
                />

                <div
                  className={
                    "absolute inset-0 " +
                    (alignRight
                      ? "bg-[linear-gradient(270deg,rgba(5,25,45,.96)_0%,rgba(5,25,45,.79)_38%,rgba(5,25,45,.18)_72%,rgba(5,25,45,.05)_100%)]"
                      : "bg-[linear-gradient(90deg,rgba(5,25,45,.96)_0%,rgba(5,25,45,.79)_38%,rgba(5,25,45,.18)_72%,rgba(5,25,45,.05)_100%)]")
                  }
                />

                <Link
                  href={competition.href}
                  className={
                    "relative z-10 flex min-h-[340px] w-full items-center p-7 sm:min-h-[390px] sm:p-10 xl:min-h-[430px] xl:p-14 " +
                    (alignRight
                      ? "justify-end text-right"
                      : "justify-start text-left")
                  }
                >
                  <div
                    className={
                      "max-w-[680px] " +
                      (alignRight ? "ml-auto" : "")
                    }
                  >
                    <div
                      className={
                        "flex items-center gap-3 " +
                        (alignRight ? "justify-end" : "")
                      }
                    >
                      <span className="rounded-full border border-white/20 bg-[#0b2747]/55 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white backdrop-blur">
                        {competition.label}
                      </span>

                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#83d4f6]">
                        0{index + 1} /{" "}
                        {String(competitions.length).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-6 text-[44px] font-black leading-[0.92] tracking-[-0.055em] text-white sm:text-[58px] xl:text-[68px]">
                      {competition.title}
                    </h3>

                    <p
                      className={
                        "mt-6 max-w-[58ch] text-[14px] font-semibold leading-7 text-white/75 sm:text-[15px] " +
                        (alignRight ? "ml-auto" : "")
                      }
                    >
                      {competition.description}
                    </p>

                    <span className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white/10 px-5 py-3 text-[11px] font-black uppercase tracking-[0.08em] text-white backdrop-blur transition group-hover:bg-white/15">
                      Ver competición

                      <span className="text-[20px] transition duration-300 group-hover:translate-x-2">
                        →
                      </span>
                    </span>
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