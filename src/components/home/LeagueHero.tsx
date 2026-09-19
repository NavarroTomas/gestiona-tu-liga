"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  elementInlineStyle,
  valueForBreakpoint,
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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (editorMode || stories.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % stories.length);
    }, 7500);
    return () => window.clearInterval(timer);
  }, [editorMode, stories.length]);

  useEffect(() => {
    if (activeIndex >= stories.length && stories.length > 0) setActiveIndex(0);
  }, [activeIndex, stories.length]);

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
  const subtitleSelection = selectable("hero.subtitle");
  const eyebrowSelection = selectable("hero.eyebrow");
  const primarySelection = selectable("hero.primaryButton");
  const secondarySelection = selectable("hero.secondaryButton");

  const activeStory = !editorMode && stories.length > 0 ? stories[Math.min(activeIndex, stories.length - 1)] : null;
  const kicker = activeStory?.kicker || editor.eyebrow;
  const title = activeStory?.title || editor.title;
  const description = activeStory?.description || editor.subtitle;
  const primaryHref = activeStory?.href || editor.primaryHref || "/competicion";
  const primaryLabel = activeStory?.cta || editor.primaryLabel || "Ver detalle";
  const meta = activeStory?.meta || temporada;

  return (
    <section
      className="relative min-h-[560px] overflow-hidden px-6 text-white md:min-h-[620px] md:px-10 lg:px-14"
      style={{
        backgroundColor: editor.background,
        backgroundImage: editor.backgroundImage ? `url(${editor.backgroundImage})` : undefined,
        backgroundSize: editor.backgroundSize,
        backgroundPosition: editor.backgroundPosition,
        color: editor.textColor,
        borderRadius: valueForBreakpoint(editor.radius, breakpoint),
        paddingTop: Math.max(44, valueForBreakpoint(editor.paddingY, breakpoint)),
        paddingBottom: Math.max(34, valueForBreakpoint(editor.paddingY, breakpoint)),
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(3,17,31,.96) 0%, rgba(3,17,31,.88) 34%, rgba(3,17,31,.58) 58%, rgba(3,17,31,.18) 82%, rgba(3,17,31,.08) 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,17,31,.04)_35%,rgba(3,17,31,.76)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[58%] bg-[radial-gradient(circle_at_20%_25%,rgba(40,151,230,.18),transparent_46%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-[#38a8df]/80 via-white/20 to-transparent" />

      <div className="relative z-10 flex min-h-[480px] flex-col justify-between md:min-h-[530px]">
        <div className="max-w-[860px] pt-2 md:pt-8">
          <div className="flex flex-wrap items-center gap-3">
            <span
              {...eyebrowSelection}
              className={`${eyebrowSelection.className ?? ""} rounded-full border border-white/16 bg-black/20 px-3 py-1.5 backdrop-blur-sm`}
            >
              {kicker}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/58">
              {meta}
            </span>
          </div>

          <h1
            {...titleSelection}
            className={`${titleSelection.className ?? ""} mt-6 max-w-[850px] uppercase`}
            style={{
              ...titleSelection.style,
              fontSize:
                titleSelection.style.fontSize ??
                `${Math.max(46, valueForBreakpoint(editor.titleStyle.fontSize, breakpoint))}px`,
              fontWeight: titleSelection.style.fontWeight ?? 900,
              lineHeight: titleSelection.style.lineHeight ?? 0.92,
              letterSpacing: titleSelection.style.letterSpacing ?? "-0.045em",
              color: titleSelection.style.color ?? "#ffffff",
              textWrap: "balance",
            }}
          >
            {title}
          </h1>

          <p
            {...subtitleSelection}
            className={`${subtitleSelection.className ?? ""} mt-5 max-w-[680px]`}
            style={{
              ...subtitleSelection.style,
              fontSize:
                subtitleSelection.style.fontSize ??
                `${Math.max(15, valueForBreakpoint(editor.subtitleStyle.fontSize, breakpoint))}px`,
              fontWeight: subtitleSelection.style.fontWeight ?? 600,
              lineHeight: subtitleSelection.style.lineHeight ?? 1.6,
              color: subtitleSelection.style.color ?? "rgba(255,255,255,.78)",
            }}
          >
            {description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              {...primarySelection}
              href={primaryHref}
              className={`${primarySelection.className ?? ""} inline-flex min-h-12 items-center justify-center bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-[#0b2747] transition hover:bg-[#dff4ff]`}
              style={{
                ...primarySelection.style,
                borderRadius: primarySelection.style.borderRadius || editor.buttonRadius,
              }}
            >
              {primaryLabel} →
            </Link>

            <Link
              {...secondarySelection}
              href={editorMode ? editor.secondaryHref || "/fixture" : "/fixture"}
              className={`${secondarySelection.className ?? ""} inline-flex min-h-12 items-center justify-center border border-white/24 bg-black/15 px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-white/10`}
              style={{
                ...secondarySelection.style,
                borderRadius: secondarySelection.style.borderRadius || editor.buttonRadius,
              }}
            >
              {editorMode ? editor.secondaryLabel : "Ver fixture"}
            </Link>
          </div>
        </div>

        {!editorMode && stories.length > 1 ? (
          <div className="mt-10 grid gap-2 border-t border-white/12 pt-4 md:grid-cols-3">
            {stories.slice(0, 3).map((story, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group min-w-0 rounded-[12px] px-3 py-3 text-left transition ${
                    active ? "bg-white/[0.10]" : "bg-transparent hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black tracking-[0.15em] ${active ? "text-[#74cef4]" : "text-white/38"}`}>
                      0{index + 1}
                    </span>
                    <span className={`h-px flex-1 ${active ? "bg-[#74cef4]/65" : "bg-white/12"}`} />
                  </div>
                  <p className={`mt-2 truncate text-[9px] font-black uppercase tracking-[0.12em] ${active ? "text-[#74cef4]" : "text-white/45"}`}>
                    {story.kicker}
                  </p>
                  <p className={`mt-1 line-clamp-2 text-[12px] font-black leading-4 ${active ? "text-white" : "text-white/60"}`}>
                    {story.title}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 border-t border-white/12 pt-4 text-[9px] font-black uppercase tracking-[0.18em] text-white/38">
            APA PSO Argentina · Competición oficial
          </div>
        )}
      </div>
    </section>
  );
}
