import Link from "next/link";
import type { MouseEvent } from "react";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  elementInlineStyle,
  type EditorBreakpoint,
  type HomeEditorDocument,
  type HomeEditorElementId,
} from "@/lib/siteEditor";

const groups = [
  {
    label: "Liga",
    headline: "Primera División",
    description: "La máxima categoría de APA.",
    href: "/divisiones?division=primera",
    secondary: [
      { label: "Segunda División", description: "El camino del ascenso.", href: "/divisiones?division=segunda" },
    ],
  },
  {
    label: "Copas",
    headline: "Copa Argentina",
    description: "Cruces directos y partidos decisivos.",
    href: "/competicion/copa-argentina",
    secondary: [
      { label: "Copa APA", description: "La copa oficial de la temporada.", href: "/competicion/copa-apa" },
      { label: "Copa de Campeones", description: "Los mejores frente a frente.", href: "/competicion/copa-campeones" },
    ],
  },
  {
    label: "Definiciones",
    headline: "Playoffs",
    description: "Los cruces que definen la temporada.",
    href: "/competicion/playoffs",
    secondary: [],
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
        ? `relative cursor-pointer ${selectedElement === id ? "outline outline-2 outline-offset-2 outline-[#ffcc4d]" : "hover:outline hover:outline-1 hover:outline-offset-2 hover:outline-[#ffcc4d]/70"}`
        : undefined,
      style: elementInlineStyle(elements[id], breakpoint),
    };
  }

  const headingSelection = selectable("competitions.heading");
  const cardsSelection = selectable("competitions.cards");

  return (
    <section className="border-y border-[#d7e3ea] py-6 sm:py-7">
      <div
        {...headingSelection}
        className={`${headingSelection.className ?? ""} grid gap-5 border-b border-[#d7e3ea] pb-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end`}
      >
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#168fd4]">
            {editor.eyebrow}
          </p>
          <h2 className="mt-1 text-[28px] font-black uppercase tracking-[-0.035em] text-[#102f55] sm:text-[32px]">
            {editor.title}
          </h2>
          <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#6d889a]">
            Toda la temporada, en un vistazo.
          </p>
        </div>

        <Link
          href="/competicion"
          className="w-fit text-[10px] font-black uppercase tracking-[0.08em] text-[#168fd4] transition hover:text-[#0f6f9e]"
        >
          Ver calendario completo →
        </Link>
      </div>

      <div
        {...cardsSelection}
        className={`${cardsSelection.className ?? ""} grid divide-y divide-[#dfe9ef] md:grid-cols-[0.9fr_1.35fr_0.85fr] md:divide-x md:divide-y-0`}
        style={{ ...cardsSelection.style, width: "auto", maxWidth: "none" }}
      >
        {groups.map((group) => (
          <article key={group.label} className="px-0 py-5 first:pt-5 md:px-6 md:first:pl-0 md:last:pr-0">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#7895a8]">
              {group.label}
            </p>

            <Link href={group.href} className="group mt-3 block">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[22px] font-black leading-[1.02] tracking-[-0.03em] text-[#102f55] transition group-hover:text-[#168fd4] sm:text-[25px]">
                    {group.headline}
                  </h3>
                  <p className="mt-2 max-w-[32ch] text-[11px] leading-5 text-[#6d889a]">
                    {group.description}
                  </p>
                </div>
                <span className="mt-1 text-[16px] font-black text-[#a4bbc9] transition group-hover:translate-x-1 group-hover:text-[#168fd4]">
                  →
                </span>
              </div>
            </Link>

            {group.secondary.length ? (
              <div className="mt-5 space-y-4 border-t border-[#e2ebf0] pt-4">
                {group.secondary.map((item) => (
                  <Link key={item.href} href={item.href} className="group block">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[13px] font-black text-[#173e68] transition group-hover:text-[#168fd4]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-[10px] leading-4 text-[#829aaa]">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-[12px] font-black text-[#b3c5d0] transition group-hover:translate-x-1 group-hover:text-[#168fd4]">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5 border-t border-[#e2ebf0] pt-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#91a6b4]">
                  Fase decisiva de la competencia
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
