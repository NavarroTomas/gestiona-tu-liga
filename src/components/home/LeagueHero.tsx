import Link from "next/link";
import type { MouseEvent } from "react";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  elementInlineStyle,
  valueForBreakpoint,
  type EditorBreakpoint,
  type HomeEditorDocument,
  type HomeEditorElementId,
} from "@/lib/siteEditor";

type Props = {
  temporada: string;
  editor?: HomeEditorDocument["hero"];
  elements?: HomeEditorDocument["elements"];
  breakpoint?: EditorBreakpoint;
  editorMode?: boolean;
  selectedElement?: HomeEditorElementId | null;
  onSelectElement?: (element: HomeEditorElementId) => void;
};

export default function LeagueHero({
  temporada,
  editor = DEFAULT_HOME_EDITOR_DOCUMENT.hero,
  elements = DEFAULT_HOME_EDITOR_DOCUMENT.elements,
  breakpoint = "desktop",
  editorMode = false,
  selectedElement = null,
  onSelectElement,
}: Props) {
  const columns = Math.max(1, valueForBreakpoint(editor.contentColumns, breakpoint));

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
  const cardsSelection = selectable("hero.cards");

  return (
    <section
      className="relative overflow-hidden px-6 text-white md:px-10"
      style={{
        backgroundColor: editor.background,
        backgroundImage: editor.backgroundImage ? `url(${editor.backgroundImage})` : undefined,
        backgroundSize: editor.backgroundSize,
        backgroundPosition: editor.backgroundPosition,
        color: editor.textColor,
        borderRadius: valueForBreakpoint(editor.radius, breakpoint),
        paddingTop: valueForBreakpoint(editor.paddingY, breakpoint),
        paddingBottom: valueForBreakpoint(editor.paddingY, breakpoint),
      }}
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: `rgba(4,18,34,${editor.overlayOpacity})` }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(36,95,142,.85),transparent_26%),linear-gradient(115deg,rgba(255,255,255,.05),transparent_35%),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:auto,auto,72px_72px]" />
      <div className="pointer-events-none absolute -right-10 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute right-20 top-1/2 h-[220px] w-[220px] -translate-y-1/2 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute bottom-0 right-0 text-[180px] font-black leading-none text-white/[0.035] md:text-[260px]">APA</div>

      <div
        className="relative z-10 grid items-end"
        style={{
          gridTemplateColumns: columns > 1 ? "minmax(0,1fr) minmax(300px,420px)" : "1fr",
          gap: `${valueForBreakpoint(editor.cardGap, breakpoint) * 3}px`,
        }}
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              {...eyebrowSelection}
              className={`${eyebrowSelection.className ?? ""} rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5`}
            >
              {editor.eyebrow}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55">{temporada}</span>
          </div>

          <h1
            {...titleSelection}
            className={`${titleSelection.className ?? ""} mt-5 uppercase`}
            style={{
              ...titleSelection.style,
              fontSize: titleSelection.style.fontSize ?? `${valueForBreakpoint(editor.titleStyle.fontSize, breakpoint)}px`,
              fontWeight: titleSelection.style.fontWeight ?? editor.titleStyle.fontWeight,
              lineHeight: titleSelection.style.lineHeight ?? editor.titleStyle.lineHeight,
              letterSpacing: titleSelection.style.letterSpacing ?? `${editor.titleStyle.letterSpacing}em`,
              color: titleSelection.style.color ?? editor.titleStyle.color,
            }}
          >
            {editor.title}
          </h1>

          <p
            {...subtitleSelection}
            className={`${subtitleSelection.className ?? ""} mt-5`}
            style={{
              ...subtitleSelection.style,
              fontSize: subtitleSelection.style.fontSize ?? `${valueForBreakpoint(editor.subtitleStyle.fontSize, breakpoint)}px`,
              fontWeight: subtitleSelection.style.fontWeight ?? editor.subtitleStyle.fontWeight,
              lineHeight: subtitleSelection.style.lineHeight ?? editor.subtitleStyle.lineHeight,
              color: subtitleSelection.style.color ?? editor.subtitleStyle.color,
            }}
          >
            {editor.subtitle}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              {...primarySelection}
              href={editor.primaryHref || "/competicion"}
              className={`${primarySelection.className ?? ""} bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-[#0b2747] transition hover:bg-[#f3f4f6]`}
              style={{ ...primarySelection.style, borderRadius: primarySelection.style.borderRadius || editor.buttonRadius }}
            >
              {editor.primaryLabel}
            </Link>
            <Link
              {...secondarySelection}
              href={editor.secondaryHref || "/fixture"}
              className={`${secondarySelection.className ?? ""} border border-white/25 bg-white/[0.04] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-white/10`}
              style={{ ...secondarySelection.style, borderRadius: secondarySelection.style.borderRadius || editor.buttonRadius }}
            >
              {editor.secondaryLabel}
            </Link>
          </div>
        </div>

        <div
          {...cardsSelection}
          className={`${cardsSelection.className ?? ""} grid grid-cols-2`}
          style={{ ...cardsSelection.style, gap: valueForBreakpoint(editor.cardGap, breakpoint) }}
        >
          {[
            ["Primera", "Tabla y partidos", "/competicion?division=primera", "01"],
            ["Segunda", "Ascenso", "/competicion?division=segunda", "02"],
            ["Copas", "Cruces y llaves", "/competicion", "03"],
            ["Clubes", "Planteles e historia", "/clubes", "04"],
          ].map(([label, desc, href, num]) => (
            <Link
              key={label}
              href={href}
              className="group p-4 backdrop-blur-sm transition hover:bg-white/[0.12]"
              style={{ borderRadius: editor.cardRadius, background: editor.cardBackground, border: `1px solid ${editor.cardBorderColor}` }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black tracking-[0.18em] text-white/45">{num}</span>
                <span className="text-white/45 transition group-hover:translate-x-1">→</span>
              </div>
              <p className="mt-8 text-sm font-black uppercase">{label}</p>
              <p className="mt-1 text-[11px] font-semibold text-white/58">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
