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
  ["Primera", "/divisiones?division=primera"],
  ["Segunda", "/divisiones?division=segunda"],
  ["Copa Argentina", "/competicion/copa-argentina"],
  ["Copa APA", "/competicion/copa-apa"],
  ["Copa de Campeones", "/competicion/copa-campeones"],
  ["Playoffs", "/competicion/playoffs"],
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
        ? `relative cursor-pointer ${selectedElement === id ? "outline outline-2 outline-offset-2 outline-[#ffcc4d]" : "hover:outline hover:outline-1 hover:outline-offset-2 hover:outline-[#ffcc4d]/70"}`
        : undefined,
      style: elementInlineStyle(elements[id], breakpoint),
    };
  }

  const headingSelection = selectable("competitions.heading");
  const cardsSelection = selectable("competitions.cards");

  return (
    <section className="border-y border-[#dbe7ee] py-5">
      <div
        {...headingSelection}
        className={`${headingSelection.className ?? ""} flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between`}
      >
        <div className="shrink-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#168fd4]">
            {editor.eyebrow}
          </p>
          <h2 className="mt-1 text-[20px] font-black uppercase tracking-[-0.025em] text-[#102f55]">
            {editor.title}
          </h2>
        </div>

        <div
          {...cardsSelection}
          className={`${cardsSelection.className ?? ""} flex flex-wrap items-center gap-x-1 gap-y-2`}
          style={{ ...cardsSelection.style, width: "auto", maxWidth: "none" }}
        >
          {items.map(([label, href], index) => (
            <div key={href} className="flex items-center">
              <Link
                href={href}
                className="group inline-flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase tracking-[0.02em] text-[#173e68] transition hover:text-[#168fd4]"
              >
                <span>{label}</span>
                <span className="text-[#9ab2c2] transition group-hover:translate-x-0.5 group-hover:text-[#168fd4]">→</span>
              </Link>
              {index < items.length - 1 ? <span className="hidden h-4 w-px bg-[#dbe7ee] sm:block" /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
