"use client";

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
        ? `relative cursor-pointer ${selectedElement === id ? "outline outline-2 outline-offset-2 outline-[#ffcc4d]" : "hover:outline hover:outline-1 hover:outline-offset-2 hover:outline-[#ffcc4d]/70"}`
        : undefined,
      style: elementInlineStyle(elements[id], breakpoint),
    };
  }

  const titleSelection = selectable("hero.title");

  return (
    <section className="relative flex min-h-[170px] items-center bg-transparent py-8 sm:min-h-[210px] sm:py-10 md:min-h-[240px] md:py-12">
      <div className="w-full">
        <h1
          {...titleSelection}
          className={`${titleSelection.className ?? ""} max-w-none uppercase`}
          style={{
            ...titleSelection.style,
            width: "auto",
            maxWidth: "none",
            margin: 0,
            fontSize: "clamp(48px, 8vw, 112px)",
            fontWeight: 900,
            lineHeight: 0.86,
            letterSpacing: "-0.065em",
            color: "#102f55",
            textWrap: "balance",
          }}
        >
          APA PSO ARGENTINA
        </h1>

        <div className="mt-5 h-[3px] w-20 rounded-full bg-[#45afe0] sm:w-28" />
      </div>
    </section>
  );
}
