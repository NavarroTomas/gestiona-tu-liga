import Link from "next/link";
import type { MouseEvent } from "react";
import { awardIcon, awardLabel, type HomeAward } from "@/lib/homePortal";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  elementInlineStyle,
  valueForBreakpoint,
  type EditorBreakpoint,
  type HomeEditorDocument,
  type HomeEditorElementId,
} from "@/lib/siteEditor";

type Props = {
  awards: HomeAward[];
  logoEquipo: (club: string) => string | null;
  editor?: HomeEditorDocument["awards"];
  elements?: HomeEditorDocument["elements"];
  breakpoint?: EditorBreakpoint;
  editorMode?: boolean;
  selectedElement?: HomeEditorElementId | null;
  onSelectElement?: (element: HomeEditorElementId) => void;
};

export default function HomeAwards({
  awards,
  logoEquipo,
  editor = DEFAULT_HOME_EDITOR_DOCUMENT.awards,
  elements = DEFAULT_HOME_EDITOR_DOCUMENT.elements,
  breakpoint = "desktop",
  editorMode = false,
  selectedElement = null,
  onSelectElement,
}: Props) {
  const visible = awards.slice(0, 4);
  if (!visible.length) return null;

  const gridClass =
    visible.length === 1
      ? "grid-cols-1"
      : visible.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : visible.length === 3
          ? "grid-cols-1 md:grid-cols-3"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";

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

  const headingSelection = selectable("awards.heading");
  const cardsSelection = selectable("awards.cards");

  return (
    <section
      className="relative overflow-hidden border border-[#234f79] shadow-[0_18px_50px_rgba(11,39,71,.14)]"
      style={{
        background: editor.background,
        color: editor.textColor,
        borderRadius: valueForBreakpoint(editor.radius, breakpoint),
        padding: valueForBreakpoint(editor.padding, breakpoint),
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.028)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="relative z-10">
        <div {...headingSelection} className={`${headingSelection.className ?? ""} mb-6 flex items-end justify-between gap-4`}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">{editor.eyebrow}</p>
            <h2 className="mt-1 text-3xl font-black uppercase md:text-4xl">{editor.title}</h2>
          </div>
          <Link
            href="/historia"
            className="rounded-full border border-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            {editor.linkLabel}
          </Link>
        </div>

        <div {...cardsSelection} className={`${cardsSelection.className ?? ""} grid ${gridClass} gap-4`}>
          {visible.map((award, index) => {
            const logo = award.equipo ? logoEquipo(award.equipo) : null;
            return (
              <article
                key={award.id}
                className="group relative min-h-[190px] overflow-hidden border border-white/12 bg-white/[0.075] transition hover:bg-white/[0.105]"
                style={{
                  borderRadius: editor.cardRadius,
                  padding: editor.cardPadding,
                }}
              >
                <div className="absolute right-4 top-3 text-7xl font-black leading-none text-white/[0.035]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-black text-white">
                        {awardIcon(award.premio)}
                      </span>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                        {awardLabel(award.premio)}
                      </p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">APA</span>
                  </div>

                  <div className="mt-7 flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white p-2">
                      {logo ? (
                        <img src={logo} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-2xl font-black text-[#123f69]">{awardIcon(award.premio)}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">Ganador</p>
                      <h3 className="mt-1 truncate text-2xl font-black uppercase tracking-[-0.025em] text-white md:text-3xl">
                        {award.nombre}
                      </h3>
                      <p className="mt-1 truncate text-xs font-bold text-white/58">{award.equipo || "APA"}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/38">Temporada actual</span>
                    {award.puntos != null ? (
                      <span className="text-sm font-black text-white/85">{Number(award.puntos).toFixed(1)} pts</span>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-white/45">Premio oficial</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
