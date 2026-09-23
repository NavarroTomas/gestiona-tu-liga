"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
  if (competition === "liga") return match.division ? "Liga " + match.division : "Liga";
  if (competition === "copa_argentina") return "Copa Argentina";
  if (competition === "copa_apa") return "Copa APA";
  if (competition === "copa_campeones") return "Copa de Campeones";
  if (competition === "playoffs") return "Playoffs";
  return String(match.competicion || "APA").replaceAll("_", " ");
}

function dateForMatch(match: HomeMatch, index: number, base = new Date()) {
  const raw = String(match.dia || "").trim();

  const iso = raw.match(/(20\d{2})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
  if (iso) {
    const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    if (!Number.isNaN(date.getTime())) return date;
  }

  const local = raw.match(/(\d{1,2})[-\/](\d{1,2})(?:[-\/](\d{2,4}))?/);
  if (local) {
    const yearRaw = local[3] ? Number(local[3]) : base.getFullYear();
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
    const date = new Date(year, Number(local[2]) - 1, Number(local[1]));
    if (!Number.isNaN(date.getTime())) return date;
  }

  const fallback = new Date(base.getFullYear(), base.getMonth(), base.getDate() + index);
  return fallback;
}

function Calendar({ upcoming }: { upcoming: HomeMatch[] }) {
  const today = new Date();
  const dated = upcoming.slice(0, 12).map((match, index) => ({ match, date: dateForMatch(match, index, today) }));
  const focusDate = dated[0]?.date || today;
  const year = focusDate.getFullYear();
  const month = focusDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const mondayFirstOffset = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((mondayFirstOffset + daysInMonth) / 7) * 7;
  const monthName = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(focusDate);
  const byDay = new Map<number, HomeMatch[]>();

  dated.forEach(({ match, date }) => {
    if (date.getFullYear() !== year || date.getMonth() !== month) return;
    const day = date.getDate();
    const current = byDay.get(day) || [];
    current.push(match);
    byDay.set(day, current);
  });

  return (
    <aside className="sticky top-[110px] overflow-hidden rounded-[24px] border border-[#cce1ec] bg-white shadow-[0_18px_50px_rgba(16,47,85,.08)]">
      <div className="border-b border-[#d9e8ef] bg-[linear-gradient(135deg,#102f55,#175b8a)] px-6 py-5 text-white">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#86d4f7]">Calendario APA</p>
        <h3 className="mt-1 capitalize text-[24px] font-black tracking-[-0.04em]">{monthName}</h3>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-7 gap-1 text-center">
          {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
            <div key={day} className="py-2 text-[9px] font-black uppercase text-[#8ca2b1]">{day}</div>
          ))}

          {Array.from({ length: totalCells }, (_, cellIndex) => {
            const dayNumber = cellIndex - mondayFirstOffset + 1;
            const valid = dayNumber >= 1 && dayNumber <= daysInMonth;
            const matches = valid ? byDay.get(dayNumber) || [] : [];
            const isToday =
              valid &&
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === dayNumber;

            return (
              <div
                key={cellIndex}
                className={
                  "relative flex aspect-square items-center justify-center rounded-xl text-[11px] font-black transition " +
                  (!valid
                    ? "text-transparent"
                    : matches.length
                      ? "bg-[#102f55] text-white shadow-sm"
                      : isToday
                        ? "border border-[#77c6e9] bg-[#edf8fd] text-[#168fd4]"
                        : "text-[#58788f] hover:bg-[#f1f7fa]")
                }
                title={matches.length ? matches.map((match) => String(match.local) + " vs " + String(match.visitante)).join(" · ") : undefined}
              >
                {valid ? dayNumber : "."}
                {matches.length > 0 ? <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#69cbf5]" /> : null}
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-[#e2edf2] pt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#168fd4]">Próxima actividad</p>
          {dated[0] ? (
            <div className="mt-3 rounded-xl bg-[#f3f8fb] p-4">
              <p className="text-[10px] font-black uppercase text-[#6b8799]">{competitionLabel(dated[0].match)}</p>
              <p className="mt-2 text-[13px] font-black leading-5 text-[#102f55]">
                {dated[0].match.local} <span className="text-[#9ab0bf]">vs</span> {dated[0].match.visitante}
              </p>
              <p className="mt-2 text-[10px] font-bold text-[#6d899b]">
                {dated[0].match.dia || "Fecha a confirmar"} · {dated[0].match.hora || "A confirmar"}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[11px] font-semibold text-[#7d96a6]">Sin fechas cargadas.</p>
          )}
        </div>
      </div>
    </aside>
  );
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
        ? "relative cursor-pointer " +
          (selectedElement === id
            ? "outline outline-2 outline-offset-2 outline-[#ffcc4d]"
            : "hover:outline hover:outline-1 hover:outline-offset-2 hover:outline-[#ffcc4d]/70")
        : undefined,
      style: elementInlineStyle(elements[id], breakpoint),
    };
  }

  const eyebrowSelection = selectable("match.eyebrow");
  const titleSelection = selectable("match.title");
  const fixtureSelection = selectable("match.fixtureLink");
  const listSelection = selectable("match.list");

  return (
    <section className="rounded-[28px] border border-[#d0e3ed] bg-[#f8fbfd] p-5 sm:p-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p {...eyebrowSelection} className={(eyebrowSelection.className ?? "") + " text-[11px] font-black uppercase tracking-[0.2em] text-[#168fd4]"}>
            Agenda
          </p>
          <h2 {...titleSelection} className={(titleSelection.className ?? "") + " mt-1 text-[38px] font-black uppercase tracking-[-0.045em] text-[#102f55] sm:text-[48px]"}>
            Próximos partidos
          </h2>
        </div>

        <Link
          {...fixtureSelection}
          href="/fixture"
          className={(fixtureSelection.className ?? "") + " text-[11px] font-black uppercase tracking-[0.06em] text-[#168fd4] transition hover:text-[#0f6f9e]"}
        >
          Ver fixture completo →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(330px,.55fr)]">
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.16 }}
          transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
          {...listSelection}
          className={listSelection.className}
        >
          {upcoming.length ? (
            <div className="overflow-hidden rounded-[22px] border border-[#d4e5ee] bg-white">
              {upcoming.slice(0, 6).map((match, index) => (
                <Link
                  key={String(match.partido_id || match.id)}
                  href="/fixture"
                  className={
                    "group grid gap-3 px-5 py-[18px] transition hover:bg-[#f7fbfd] md:grid-cols-[150px_minmax(0,1fr)_54px_minmax(0,1fr)_116px] md:items-center " +
                    (index < Math.min(upcoming.length, 6) - 1 ? "border-b border-[#e3edf2]" : "")
                  }
                >
                  <div className="flex items-center justify-between gap-3 md:block">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#168fd4]">{competitionLabel(match)}</p>
                    <p className="mt-1 text-[11px] font-bold text-[#7d96a6]">{match.fecha ? "Fecha " + match.fecha : match.fase || ""}</p>
                  </div>

                  <div className="flex min-w-0 items-center gap-2.5 md:justify-end">
                    <span className="truncate text-[14px] font-black text-[#173e68]">{match.local}</span>
                    <Crest clubs={clubs} team={match.local} />
                  </div>

                  <div className="text-center">
                    <span className="inline-flex rounded-full bg-[#edf5f9] px-2 py-1 text-[9px] font-black uppercase text-[#8198a8]">vs</span>
                  </div>

                  <div className="flex min-w-0 items-center gap-2.5">
                    <Crest clubs={clubs} team={match.visitante} />
                    <span className="truncate text-[14px] font-black text-[#173e68]">{match.visitante}</span>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-[14px] font-black text-[#102f55]">{match.hora || "A confirmar"}</p>
                    {match.dia ? <p className="mt-0.5 text-[10px] font-bold text-[#7d96a6]">{match.dia}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-[#d4e5ee] bg-white px-5 py-12 text-center text-[12px] font-bold text-[#7891a3]">
              No hay próximos partidos cargados.
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.16 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Calendar upcoming={upcoming} />
        </motion.div>
      </div>
    </section>
  );
}
