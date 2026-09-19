import Link from "next/link";
import type { MouseEvent } from "react";
import type { ClubInfo, HomeMatch } from "@/lib/homePortal";
import { normalizeText } from "@/lib/homePortal";
import {
  DEFAULT_HOME_EDITOR_DOCUMENT,
  elementInlineStyle,
  type EditorBreakpoint,
  type HomeEditorDocument,
  type HomeEditorElementId,
} from "@/lib/siteEditor";

function clubLogo(clubs: ClubInfo[], name?: string | null) {
  if (!name) return null;
  return clubs.find((club) => normalizeText(club.nombre) === normalizeText(name))?.logo_url || null;
}

function Crest({ clubs, team }: { clubs: ClubInfo[]; team?: string | null }) {
  const logo = clubLogo(clubs, team);
  return logo ? (
    <img src={logo} alt="" className="h-10 w-10 shrink-0 object-contain" />
  ) : (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#edf5f9] text-[9px] font-black text-[#7691a2]">
      {String(team || "?").slice(0, 2).toUpperCase()}
    </div>
  );
}

function competitionLabel(match: HomeMatch) {
  const competition = normalizeText(match.competicion || "liga");
  if (competition === "liga") return match.division ? `Liga ${match.division}` : "Liga";
  if (competition === "copa_argentina") return "Copa Argentina";
  if (competition === "copa_apa") return "Copa APA";
  if (competition === "copa_campeones") return "Copa de Campeones";
  if (competition === "playoffs") return "Playoffs";
  return String(match.competicion || "APA").replaceAll("_", " ");
}

type Props = {
  featured?: HomeMatch;
  upcoming: HomeMatch[];
  clubs: ClubInfo[];
  elements?: HomeEditorDocument["elements"];
  breakpoint?: EditorBreakpoint;
  editorMode?: boolean;
  selectedElement?: HomeEditorElementId | null;
  onSelectElement?: (element: HomeEditorElementId) => void;
};

export default function HomeMatchStrip({
  upcoming,
  clubs,
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

  const eyebrowSelection = selectable("match.eyebrow");
  const titleSelection = selectable("match.title");
  const fixtureSelection = selectable("match.fixtureLink");
  const listSelection = selectable("match.list");

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p
            {...eyebrowSelection}
            className={`${eyebrowSelection.className ?? ""} text-[11px] font-black uppercase tracking-[0.18em] text-[#168fd4]`}
          >
            Agenda
          </p>
          <h2
            {...titleSelection}
            className={`${titleSelection.className ?? ""} mt-1 text-[32px] font-black uppercase tracking-[-0.04em] text-[#102f55]`}
          >
            Próximos partidos
          </h2>
        </div>

        <Link
          {...fixtureSelection}
          href="/fixture"
          className={`${fixtureSelection.className ?? ""} text-[13px] font-black text-[#168fd4] transition hover:text-[#0f6f9e]`}
        >
          Ver fixture →
        </Link>
      </div>

      <div {...listSelection} className={listSelection.className}>
        {upcoming.length ? (
          <div className="overflow-hidden rounded-[18px] border border-[#d8e7ef] bg-white">
            {upcoming.slice(0, 4).map((match, index) => (
              <Link
                key={String(match.partido_id || match.id)}
                href="/fixture"
                className={`group grid gap-3 px-5 py-5 transition hover:bg-[#f8fbfd] md:grid-cols-[170px_minmax(0,1fr)_80px_minmax(0,1fr)_120px] md:items-center ${
                  index < Math.min(upcoming.length, 4) - 1 ? "border-b border-[#e4edf2]" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3 md:block">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#168fd4]">
                    {competitionLabel(match)}
                  </p>
                  <p className="mt-1 text-[12px] font-bold text-[#7d96a6]">
                    {match.fecha ? `Fecha ${match.fecha}` : match.fase || ""}
                  </p>
                </div>

                <div className="flex min-w-0 items-center gap-2.5 md:justify-end">
                  <span className="truncate text-[15px] font-black text-[#173e68]">{match.local}</span>
                  <Crest clubs={clubs} team={match.local} />
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-black uppercase text-[#9ab0bf]">vs</span>
                </div>

                <div className="flex min-w-0 items-center gap-2.5">
                  <Crest clubs={clubs} team={match.visitante} />
                  <span className="truncate text-[15px] font-black text-[#173e68]">{match.visitante}</span>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-[15px] font-black text-[#102f55]">{match.hora || "A confirmar"}</p>
                  {match.dia ? <p className="mt-0.5 text-[11px] font-bold text-[#7d96a6]">{match.dia}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] border border-[#d8e7ef] bg-white px-5 py-8 text-center text-[12px] font-bold text-[#7891a3]">
            No hay próximos partidos cargados.
          </div>
        )}
      </div>
    </section>
  );
}
