import Link from "next/link";
import type { MouseEvent } from "react";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  elementInlineStyle,
  type EditorBreakpoint,
  type HomeEditorDocument,
  type HomeEditorElementId,
} from "@/lib/siteEditor";

const items = [
  ["Primera", "Liga oficial", "/competicion?division=primera", "I"],
  ["Segunda", "Ascenso", "/competicion?division=segunda", "II"],
  ["Copa Argentina", "Eliminación", "/competicion", "CA"],
  ["Copa APA", "Copa oficial", "/competicion", "APA"],
  ["Copa Campeones", "Los mejores", "/competicion", "CC"],
  ["Playoffs", "Definiciones", "/competicion", "PO"],
];

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
        ? `relative cursor-pointer ${selectedElement === id ? "outline outline-2 outline-offset-2 outline-[#ffcc4d]" : "hover:outline hover:outline-1 hover:outline-offset-2 hover:outline-[#ffcc4d]/70"}`
        : undefined,
      style: elementInlineStyle(elements[id], breakpoint),
    };
  }

  const headingSelection = selectable("competitions.heading");
  const cardsSelection = selectable("competitions.cards");

  return (
    <section>
      <div {...headingSelection} className={`${headingSelection.className ?? ""} mb-4 flex items-end justify-between gap-4`}>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ ...headingSelection.style, color: headingSelection.style.color ?? editor.accentColor }}>{editor.eyebrow}</p>
          <h2 className="mt-1 text-3xl font-black uppercase" style={{ color: editor.titleColor }}>{editor.title}</h2>
        </div>
        <Link href="/competicion" className="text-xs font-black" style={{ color: editor.accentColor }}>{editor.linkLabel}</Link>
      </div>

      <div {...cardsSelection} className={`${cardsSelection.className ?? ""} grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6`}>
        {items.map(([title, desc, href, code]) => (
          <Link
            key={title}
            href={href}
            className="group border border-[#0b2747]/10 shadow-[0_10px_30px_rgba(11,39,71,.05)] transition hover:-translate-y-0.5 hover:border-[#245f8e]/30"
            style={{
              background: editor.cardBackground,
              borderRadius: editor.cardRadius,
              padding: editor.cardPadding,
              minHeight: editor.cardMinHeight || undefined,
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black text-white" style={{ background: editor.titleColor }}>{code}</div>
            <h3 className="mt-4 text-sm font-black uppercase" style={{ color: editor.titleColor }}>{title}</h3>
            <p className="mt-1 text-xs font-medium" style={{ color: editor.accentColor }}>{desc}</p>
            <span className="mt-4 block text-sm font-black transition group-hover:translate-x-1" style={{ color: editor.accentColor }}>→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
