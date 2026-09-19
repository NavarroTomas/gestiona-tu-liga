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
    key: "league",
    label: "Liga",
    headline: "Primera División",
    description: "La máxima categoría de APA.",
    href: "/divisiones?division=primera",
    secondary: [
      { label: "Segunda División", description: "El camino del ascenso.", href: "/divisiones?division=segunda" },
    ],
  },
  {
    key: "cups",
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
    key: "playoffs",
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
    <section className="relative overflow-hidden border-y-[2px] border-[#9fcbe3] bg-[#eef8fd] px-5 py-7 sm:px-7 sm:py-8 md:px-9">
      <div
        {...headingSelection}
        className={`${headingSelection.className ?? ""} grid gap-4 border-b border-[#bcd9e8] pb-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end`}
      >
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.22em] text-[#168fd4]">
            {editor.eyebrow}
          </p>
          <h2
            className="mt-1 text-[42px] font-black uppercase tracking-[-0.05em] text-[#0d3158] sm:text-[52px]"
            style={{
              fontSize: headingSelection.style.fontSize,
              fontWeight: headingSelection.style.fontWeight,
              lineHeight: headingSelection.style.lineHeight,
              letterSpacing: headingSelection.style.letterSpacing,
              color: headingSelection.style.color,
              textAlign: headingSelection.style.textAlign,
            }}
          >
            {editor.title}
          </h2>
          <p className="mt-2 max-w-xl text-[15px] font-semibold leading-6 text-[#58788f]">
            Toda la temporada, en un vistazo.
          </p>
        </div>

        <Link
          href="/competicion"
          className="w-fit text-[12px] font-black uppercase tracking-[0.08em] text-[#168fd4] transition hover:text-[#0f6f9e]"
        >
          Ver calendario completo →
        </Link>
      </div>

      <div
        {...cardsSelection}
        className={`${cardsSelection.className ?? ""} grid gap-0 md:grid-cols-[0.78fr_1.42fr_0.72fr]`}
        style={{ ...cardsSelection.style, width: "auto", maxWidth: "none" }}
      >
        {groups.map((group, index) => {
          const isCups = group.key === "cups";

          return (
            <article
              key={group.key}
              className={`relative py-5 md:px-7 ${index === 0 ? "md:pl-0" : ""} ${index === groups.length - 1 ? "md:pr-0" : ""}`}
            >
              {index > 0 ? (
                <span className="pointer-events-none absolute left-0 top-5 hidden h-[74%] w-px bg-[#c7dde8] md:block" />
              ) : null}

              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#4f7f9f]">
                {group.label}
              </p>

              <Link href={group.href} className="group mt-3 block">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3
                      className={`${isCups ? "text-[39px] sm:text-[44px]" : "text-[34px] sm:text-[38px]"} font-black leading-[0.98] tracking-[-0.04em] text-[#102f55] transition group-hover:text-[#168fd4]`}
                      style={{
                        fontSize: cardsSelection.style.fontSize,
                        fontWeight: cardsSelection.style.fontWeight,
                        lineHeight: cardsSelection.style.lineHeight,
                        letterSpacing: cardsSelection.style.letterSpacing,
                        color: cardsSelection.style.color,
                        textAlign: cardsSelection.style.textAlign,
                      }}
                    >
                      {group.headline}
                    </h3>
                    <p className={`${isCups ? "max-w-[38ch]" : "max-w-[30ch]"} mt-2 text-[14px] font-medium leading-6 text-[#648297]`}>
                      {group.description}
                    </p>
                  </div>
                  <span className="mt-1 text-[18px] font-black text-[#9fb7c5] transition group-hover:translate-x-1 group-hover:text-[#168fd4]">
                    →
                  </span>
                </div>
              </Link>

              {group.secondary.length ? (
                <div className={`${isCups ? "mt-5 grid gap-x-7 gap-y-4 sm:grid-cols-2" : "mt-5 space-y-4"} border-t border-[#bfd8e6] pt-4`}>
                  {group.secondary.map((item) => (
                    <Link key={item.href} href={item.href} className="group block">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[17px] font-black text-[#173e68] transition group-hover:text-[#168fd4]">
                            {item.label}
                          </p>
                          <p className="mt-1 text-[12px] leading-5 text-[#6f8ea1]">
                            {item.description}
                          </p>
                        </div>
                        <span className="text-[14px] font-black text-[#b3c5d0] transition group-hover:translate-x-1 group-hover:text-[#168fd4]">
                          →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
