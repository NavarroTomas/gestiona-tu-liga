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

  return (
    clubs.find(
      (club) => normalizeText(club.nombre) === normalizeText(name),
    )?.logo_url || null
  );
}

function Crest({
  clubs,
  team,
}: {
  clubs: ClubInfo[];
  team?: string | null;
}) {
  const logo = clubLogo(clubs, team);

  return logo ? (
    <img
      src={logo}
      alt=""
      className="h-11 w-11 shrink-0 object-contain"
    />
  ) : (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#edf5f9] text-[9px] font-black text-[#7691a2]">
      {String(team || "?")
        .slice(0, 2)
        .toUpperCase()}
    </div>
  );
}

function competitionLabel(match: HomeMatch) {
  const competition = normalizeText(match.competicion || "liga");

  if (competition === "liga")
    return match.division ? "Liga " + match.division : "Liga";

  if (competition === "copa_argentina") return "Copa Argentina";
  if (competition === "copa_apa") return "Copa APA";
  if (competition === "copa_campeones") return "Copa de Campeones";
  if (competition === "playoffs") return "Playoffs";

  return String(match.competicion || "APA").replaceAll("_", " ");
}

function dateForMatch(
  match: HomeMatch,
  index: number,
  base = new Date(),
) {
  const raw = String(match.dia || "").trim();

  const iso = raw.match(
    /(20\d{2})[-\/.](\d{1,2})[-\/.](\d{1,2})/,
  );

  if (iso) {
    const date = new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3]),
    );

    if (!Number.isNaN(date.getTime())) return date;
  }

  const local = raw.match(
    /(\d{1,2})[-\/](\d{1,2})(?:[-\/](\d{2,4}))?/,
  );

  if (local) {
    const yearRaw = local[3]
      ? Number(local[3])
      : base.getFullYear();

    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;

    const date = new Date(
      year,
      Number(local[2]) - 1,
      Number(local[1]),
    );

    if (!Number.isNaN(date.getTime())) return date;
  }

  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + index,
  );
}

function Calendar({
  upcoming,
}: {
  upcoming: HomeMatch[];
}) {
  const today = new Date();

  const dated = upcoming.slice(0, 12).map((match, index) => ({
    match,
    date: dateForMatch(match, index, today),
  }));

  const focusDate = dated[0]?.date || today;

  const year = focusDate.getFullYear();
  const month = focusDate.getMonth();

  const firstWeekday = new Date(year, month, 1).getDay();
  const mondayFirstOffset = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const totalCells =
    Math.ceil((mondayFirstOffset + daysInMonth) / 7) * 7;

  const monthName = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(focusDate);

  const byDay = new Map<number, HomeMatch[]>();

  dated.forEach(({ match, date }) => {
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month
    )
      return;

    const day = date.getDate();
    const current = byDay.get(day) || [];

    current.push(match);
    byDay.set(day, current);
  });

  return (
    <aside className="h-full overflow-hidden rounded-[28px] border border-[#cce1ec] bg-white shadow-[0_18px_50px_rgba(16,47,85,.08)]">
      <div className="border-b border-[#d9e8ef] bg-[#175b8a] px-7 py-6 text-white">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#86d4f7]">
          Calendario APA
        </p>

        <h3 className="mt-1 capitalize text-[28px] font-black tracking-[-0.045em]">
          {monthName}
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
            <div
              key={day}
              className="py-2 text-[9px] font-black uppercase text-[#8ca2b1]"
            >
              {day}
            </div>
          ))}

          {Array.from(
            { length: totalCells },
            (_, cellIndex) => {
              const dayNumber =
                cellIndex - mondayFirstOffset + 1;

              const valid =
                dayNumber >= 1 &&
                dayNumber <= daysInMonth;

              const dayMatches = valid
                ? byDay.get(dayNumber) || []
                : [];

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
                      : dayMatches.length
                        ? "bg-[#102f55] text-white shadow-sm"
                        : isToday
                          ? "border border-[#77c6e9] bg-[#edf8fd] text-[#168fd4]"
                          : "text-[#58788f] hover:bg-[#f1f7fa]")
                  }
                >
                  {valid ? dayNumber : "."}

                  {dayMatches.length ? (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#69cbf5]" />
                  ) : null}
                </div>
              );
            },
          )}
        </div>

        <div className="mt-6 border-t border-[#e2edf2] pt-5">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#168fd4]">
            Próxima actividad
          </p>

          {dated[0] ? (
            <div className="mt-3 rounded-2xl bg-[#f3f8fb] p-4">
              <p className="text-[10px] font-black uppercase text-[#6b8799]">
                {competitionLabel(dated[0].match)}
              </p>

              <p className="mt-2 text-[14px] font-black leading-5 text-[#102f55]">
                {dated[0].match.local}{" "}
                <span className="text-[#9ab0bf]">vs</span>{" "}
                {dated[0].match.visitante}
              </p>

              <p className="mt-2 text-[10px] font-bold text-[#6d899b]">
                {dated[0].match.dia || "Fecha a confirmar"} ·{" "}
                {dated[0].match.hora || "A confirmar"}
              </p>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl bg-[#f8fbfd] p-5">
              <p className="text-[16px] font-black text-[#102f55]">
                Próximamente...
              </p>

              <p className="mt-1 text-[11px] font-semibold text-[#7d96a6]">
                Las próximas fechas aparecerán cuando se publique el fixture.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function PlaceholderMatch({
  index,
}: {
  index: number;
}) {
  return (
    <div className="grid min-h-[88px] gap-3 px-5 py-5 md:grid-cols-[160px_minmax(0,1fr)_120px] md:items-center">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#9bb0bd]">
          Próximo espacio
        </p>

        <p className="mt-1 text-[10px] font-bold text-[#b0bec7]">
          Partido {index + 1}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-[#bfd5e0] bg-[#f7fafc] text-[15px] font-black text-[#b0c0c9]">
          ?
        </span>

        <div>
          <p className="text-[18px] font-black tracking-[-0.025em] text-[#6f899b]">
            Próximamente...
          </p>

          <p className="mt-1 text-[10px] font-semibold text-[#a0b1bc]">
            Los equipos se mostrarán cuando el partido sea publicado.
          </p>
        </div>
      </div>

      <p className="text-left text-[10px] font-black uppercase tracking-[0.08em] text-[#b0bec7] md:text-right">
        A confirmar
      </p>
    </div>
  );
}

type Props = {
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

  const slots = Array.from(
    { length: 6 },
    (_, index) => upcoming[index] || null,
  );

  return (
    <section className="w-full bg-white py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-[min(88vw,1600px)]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              {...eyebrowSelection}
              className={
                (eyebrowSelection.className ?? "") +
                " text-[11px] font-black uppercase tracking-[0.2em] text-[#168fd4]"
              }
            >
              Agenda
            </p>

            <h2
              {...titleSelection}
              className={
                (titleSelection.className ?? "") +
                " mt-1 text-[40px] font-black uppercase tracking-[-0.05em] text-[#102f55] sm:text-[52px]"
              }
            >
              Próximos partidos
            </h2>
          </div>

          <Link
            {...fixtureSelection}
            href="/fixture"
            className={
              (fixtureSelection.className ?? "") +
              " text-[11px] font-black uppercase tracking-[0.06em] text-[#168fd4] transition hover:text-[#0f6f9e]"
            }
          >
            Ver fixture completo →
          </Link>
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,.5fr)]">
          <motion.div
            initial={{ opacity: 0, x: -70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.14 }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            {...listSelection}
            className={listSelection.className}
          >
            <div className="overflow-hidden rounded-[26px] border border-[#d4e5ee] bg-white">
              {slots.map((match, index) => (
                <div
                  key={
                    match
                      ? String(match.partido_id || match.id)
                      : "placeholder-" + index
                  }
                  className={
                    index < slots.length - 1
                      ? "border-b border-[#e3edf2]"
                      : ""
                  }
                >
                  {match ? (
                    <Link
                      href="/fixture"
                      className="group grid min-h-[88px] gap-3 px-5 py-[18px] transition hover:bg-[#f7fbfd] md:grid-cols-[155px_minmax(0,1fr)_54px_minmax(0,1fr)_120px] md:items-center"
                    >
                      <div className="flex items-center justify-between gap-3 md:block">
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#168fd4]">
                          {competitionLabel(match)}
                        </p>

                        <p className="mt-1 text-[11px] font-bold text-[#7d96a6]">
                          {match.fecha
                            ? "Fecha " + match.fecha
                            : match.fase || ""}
                        </p>
                      </div>

                      <div className="flex min-w-0 items-center gap-2.5 md:justify-end">
                        <span className="truncate text-[14px] font-black text-[#173e68]">
                          {match.local}
                        </span>

                        <Crest
                          clubs={clubs}
                          team={match.local}
                        />
                      </div>

                      <div className="text-center">
                        <span className="inline-flex rounded-full bg-[#edf5f9] px-2 py-1 text-[9px] font-black uppercase text-[#8198a8]">
                          vs
                        </span>
                      </div>

                      <div className="flex min-w-0 items-center gap-2.5">
                        <Crest
                          clubs={clubs}
                          team={match.visitante}
                        />

                        <span className="truncate text-[14px] font-black text-[#173e68]">
                          {match.visitante}
                        </span>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-[14px] font-black text-[#102f55]">
                          {match.hora || "A confirmar"}
                        </p>

                        {match.dia ? (
                          <p className="mt-0.5 text-[10px] font-bold text-[#7d96a6]">
                            {match.dia}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  ) : (
                    <PlaceholderMatch index={index} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.14 }}
            transition={{
              duration: 0.9,
              delay: 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Calendar upcoming={upcoming} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}