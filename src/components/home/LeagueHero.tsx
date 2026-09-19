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

const FALLBACK_HERO = "/themes/worldcup/backgrounds/hero-argentina-brasil-copa-01.png";

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
    }, 8000);
    return () => window.clearInterval(timer);
  }, [editorMode, stories.length]);

  useEffect(() => {
    if (stories.length > 0 && activeIndex >= stories.length) setActiveIndex(0);
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
  const heroImage = editor.backgroundImage || FALLBACK_HERO;

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        minHeight: breakpoint === "mobile" ? 500 : 540,
        borderRadius: valueForBreakpoint(editor.radius, breakpoint),
        backgroundColor: editor.background,
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: editor.backgroundImage ? editor.backgroundPosition : "center 42%",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,17,31,.94)_0%,rgba(3,17,31,.88)_34%,rgba(3,17,31,.58)_58%,rgba(3,17,31,.16)_84%,rgba(3,17,31,.08)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,17,31,.06)_30%,rgba(3,17,31,.16)_58%,rgba(3,17,31,.90)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[62%] bg-[radial-gradient(circle_at_16%_28%,rgba(54,177,238,.16),transparent_48%)]" />

      <div className="relative z-10 flex min-h-[500px] flex-col justify-end px-6 pb-5 pt-10 md:min-h-[540px] md:px-10 md:pb-6 lg:px-12">
        <div className="max-w-[720px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              {...eyebrowSelection}
              className={`${eyebrowSelection.className ?? ""} rounded-full border border-white/20 bg-black/25 px-3 py-1.5 backdrop-blur-sm`}
              style={{
                ...eyebrowSelection.style,
                width: "auto",
                maxWidth: "fit-content",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: "#ffffff",
              }}
            >
              {kicker}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/60">{meta}</span>
          </div>

          <h1
            {...titleSelection}
            className={`${titleSelection.className ?? ""} mt-4 max-w-[700px] uppercase`}
            style={{
              ...titleSelection.style,
              width: "auto",
              maxWidth: 700,
              fontSize: "clamp(38px, 4.8vw, 66px)",
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.045em",
              color: "#ffffff",
              textWrap: "balance",
            }}
          >
            {title}
          </h1>

          <p
            {...subtitleSelection}
            className={`${subtitleSelection.className ?? ""} mt-4 max-w-[610px]`}
            style={{
              ...subtitleSelection.style,
              width: "auto",
              maxWidth: 610,
              fontSize: "clamp(13px, 1.1vw, 16px)",
              fontWeight: 600,
              lineHeight: 1.55,
              color: "rgba(255,255,255,.76)",
            }}
          >
            {description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              {...primarySelection}
              href={primaryHref}
              className={`${primarySelection.className ?? ""} inline-flex items-center justify-center bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.08em] text-[#0b2747] transition hover:bg-[#dff4ff]`}
              style={{
                ...primarySelection.style,
                width: "auto",
                minWidth: 0,
                maxWidth: "fit-content",
                height: "auto",
                borderRadius: 10,
                color: "#0b2747",
              }}
            >
              {primaryLabel} →
            </Link>

            <Link
              {...secondarySelection}
              href={editorMode ? editor.secondaryHref || "/fixture" : "/fixture"}
              className={`${secondarySelection.className ?? ""} inline-flex items-center justify-center border border-white/25 bg-black/20 px-4 py-3 text-[11px] font-black uppercase tracking-[0.08em] text-white backdrop-blur-sm transition hover:bg-white/10`}
              style={{
                ...secondarySelection.style,
                width: "auto",
                minWidth: 0,
                maxWidth: "fit-content",
                height: "auto",
                borderRadius: 10,
                color: "#ffffff",
              }}
            >
              {editorMode ? editor.secondaryLabel : "Ver fixture"}
            </Link>
          </div>
        </div>

        {!editorMode && stories.length > 1 ? (
          <div className="mt-7 grid gap-2 border-t border-white/15 pt-3 md:grid-cols-3">
            {stories.slice(0, 3).map((story, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group min-w-0 rounded-[10px] border px-3 py-2.5 text-left backdrop-blur-sm transition ${
                    active
                      ? "border-white/24 bg-white/[0.11]"
                      : "border-transparent bg-black/10 hover:border-white/15 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[8px] font-black tracking-[0.14em] ${active ? "text-[#75d2ff]" : "text-white/38"}`}>
                      0{index + 1}
                    </span>
                    <span className={`h-[2px] w-8 rounded-full ${active ? "bg-[#75d2ff]" : "bg-white/15"}`} />
                  </div>

                  <p className={`mt-1.5 truncate text-[8px] font-black uppercase tracking-[0.12em] ${active ? "text-[#75d2ff]" : "text-white/42"}`}>
                    {story.kicker}
                  </p>

                  <p className={`mt-1 line-clamp-2 text-[11px] font-black leading-4 ${active ? "text-white" : "text-white/62"}`}>
                    {story.title}
                  </p>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
