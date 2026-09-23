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

export type HomeHeroStory = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  href: string;
  meta?: string;
  cta?: string;
};

type Props = {
  temporada: string;
  stories?: HomeHeroStory[];
  editor?: HomeEditorDocument["hero"];
  elements?: HomeEditorDocument["elements"];
  breakpoint?: EditorBreakpoint;
  editorMode?: boolean;
  selectedElement?: HomeEditorElementId | null;
  onSelectElement?: (element: HomeEditorElementId) => void;
};

export default function LeagueHero({
  temporada,
  stories = [],
  editor = DEFAULT_HOME_EDITOR_DOCUMENT.hero,
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

  const titleSelection = selectable("hero.title");
  const eyebrowSelection = selectable("hero.eyebrow");
  const subtitleSelection = selectable("hero.subtitle");
  const primarySelection = selectable("hero.primaryButton");
  const secondarySelection = selectable("hero.secondaryButton");

  return (
    <section className="relative isolate flex min-h-[100vh] items-center overflow-hidden rounded-[28px] border border-[#cde3ef] bg-[linear-gradient(135deg,#f8fcff_0%,#edf8fe_48%,#f7fbfd_100%)] px-5 py-24 text-[#102f55] shadow-[0_24px_70px_rgba(16,47,85,.09)] sm:px-8 md:px-12 lg:px-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[#7cccf2]/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-28 h-[440px] w-[440px] rounded-full bg-[#b8e5f8]/25 blur-3xl" />
        <div className="absolute right-[7%] top-[17%] h-[360px] w-[360px] opacity-[0.055] sm:h-[460px] sm:w-[460px]">
          <img src="/logo-apa-argentina-2026.svg" alt="" className="h-full w-full object-contain" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16,47,85,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(16,47,85,.12) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            maskImage: "linear-gradient(to bottom, black, transparent 86%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1420px] flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
          className="max-w-[1080px]"
        >
          <div
            {...eyebrowSelection}
            className={(eyebrowSelection.className ?? "") + " mb-5 flex w-fit items-center gap-3"}
          >
            <span className="h-px w-10 bg-[#45afe0]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#168fd4]">
              {editor.eyebrow || "Liga APA PSO"}
            </span>
            <span className="rounded-full border border-[#bcdceb] bg-white/70 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#557a92]">
              {temporada}
            </span>
          </div>

          <h1
            {...titleSelection}
            className={(titleSelection.className ?? "") + " uppercase"}
            style={{
              ...titleSelection.style,
              width: "auto",
              maxWidth: "980px",
              margin: 0,
              fontSize: titleSelection.style.fontSize || "clamp(54px, 7.2vw, 104px)",
              fontWeight: titleSelection.style.fontWeight || 900,
              lineHeight: titleSelection.style.lineHeight || 0.88,
              letterSpacing: titleSelection.style.letterSpacing || "-0.06em",
              color: "#102f55",
              textAlign: titleSelection.style.textAlign || "left",
              textWrap: "balance",
            }}
          >
            {editor.title || "APA PSO ARGENTINA"}
          </h1>

          <p
            {...subtitleSelection}
            className={(subtitleSelection.className ?? "") + " mt-6 max-w-[680px] text-[15px] font-semibold leading-7 text-[#58788f] sm:text-[17px]"}
          >
            {editor.subtitle || "Competencias, resultados, clubes, premios y actualidad oficial."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              {...primarySelection}
              href={editor.primaryHref || "/competicion"}
              className={(primarySelection.className ?? "") + " inline-flex min-h-12 items-center justify-center rounded-xl bg-[#102f55] px-6 text-[11px] font-black uppercase tracking-[0.06em] text-white transition hover:-translate-y-0.5 hover:bg-[#173e68]"}
            >
              {editor.primaryLabel || "Ver competición"} <span className="ml-3">→</span>
            </Link>
            <Link
              {...secondarySelection}
              href={editor.secondaryHref || "/fixture"}
              className={(secondarySelection.className ?? "") + " inline-flex min-h-12 items-center justify-center rounded-xl border border-[#b8d9e9] bg-white/80 px-6 text-[11px] font-black uppercase tracking-[0.06em] text-[#102f55] transition hover:-translate-y-0.5 hover:border-[#7abfe2]"}
            >
              {editor.secondaryLabel || "Ver fixture"}
            </Link>
          </div>
        </motion.div>

        {stories.length ? (
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-16 grid gap-3 md:grid-cols-3"
          >
            {stories.slice(0, 3).map((story, index) => (
              <Link
                key={story.id}
                href={story.href}
                className="group relative min-h-[132px] overflow-hidden rounded-[18px] border border-[#d2e5ef] bg-white/78 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-[#9bcfe8] hover:bg-white hover:shadow-[0_16px_36px_rgba(16,47,85,.09)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#168fd4]">
                    {story.kicker}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#91a7b5]">
                    {story.meta || (index === 0 ? "Actualidad" : temporada)}
                  </span>
                </div>
                <p className="mt-4 line-clamp-2 text-[17px] font-black leading-[1.08] tracking-[-0.03em] text-[#102f55] transition group-hover:text-[#168fd4] sm:text-[19px]">
                  {story.title}
                </p>
              </Link>
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
