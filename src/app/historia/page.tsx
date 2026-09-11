"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import TeamLink from "@/components/team/TeamLink";
import { HISTORY_CONFIG, shortSeasonLabel } from "@/config/history";
import { useHistory } from "@/hooks/useHistory";
import type { HistoryClub } from "@/lib/history";
import type { LeagueStanding } from "@/lib/league/types";

function normalizeTeam(name?: string | null) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function formatAverage(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0,00";
  return value.toFixed(2).replace(".", ",");
}

function TrophyIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M8 4h8v3.5c0 3-1.75 5.5-4 5.5s-4-2.5-4-5.5V4Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 6H5.8c0 3 1.2 4.7 3.6 5.2M16 6h2.2c0 3-1.2 4.7-3.6 5.2M12 13v3.2M8.5 20h7M9.5 16.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TeamLogo({
  name,
  clubs,
  className = "h-9 w-9",
}: {
  name: string;
  clubs: HistoryClub[];
  className?: string;
}) {
  const club = clubs.find((item) => normalizeTeam(item.nombre) === normalizeTeam(name));
  const initials = String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[#e7f3fa] text-[9px] font-black text-[#54758f] ${className}`}
    >
      {club?.logo_url ? (
        <img src={club.logo_url} alt="" loading="lazy" className="h-full w-full object-contain p-[2px]" />
      ) : (
        initials
      )}
    </span>
  );
}

function TeamIdentity({
  name,
  clubs,
  compact = false,
  inverse = false,
}: {
  name: string;
  clubs: HistoryClub[];
  compact?: boolean;
  inverse?: boolean;
}) {
  const club = clubs.find((item) => normalizeTeam(item.nombre) === normalizeTeam(name));
  const clickable = name && name !== "Por definir" && name !== "Sin datos";

  if (!clickable) {
    return <span className={inverse ? "text-white/55" : "text-[#70889d]"}>{name}</span>;
  }

  return (
    <TeamLink
      name={name}
      slug={club?.slug}
      className={`group inline-flex min-w-0 items-center gap-2 ${inverse ? "text-white" : "text-[#102f55]"}`}
    >
      <TeamLogo name={name} clubs={clubs} className={compact ? "h-7 w-7" : "h-9 w-9"} />
      <span className={`truncate font-black ${compact ? "text-[11px]" : "text-sm"}`}>{name}</span>
    </TeamLink>
  );
}

function SectionTitle({ children, inverse = false }: { children: React.ReactNode; inverse?: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <h2 className={`text-[18px] font-black uppercase tracking-[-.02em] sm:text-[22px] ${inverse ? "text-white" : "text-[#102f55]"}`}>
        {children}
      </h2>
      <span className={`h-px flex-1 ${inverse ? "bg-white/15" : "bg-[#c9e3f1]"}`} />
    </div>
  );
}

function StandingTable({
  title,
  rows,
  clubs,
}: {
  title: string;
  rows: LeagueStanding[];
  clubs: HistoryClub[];
}) {
  const visible = rows.slice(0, 5);

  return (
    <div className="min-w-0 rounded-[10px] border border-white/12 bg-white/[.035] p-3 sm:p-4">
      <h3 className="mb-3 text-[12px] font-black uppercase tracking-[.05em] text-white sm:text-sm">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 text-[8px] font-black uppercase tracking-[.08em] text-[#82b6d7]">
              <th className="w-8 py-2">#</th>
              <th className="py-2">Club</th>
              <th className="px-2 py-2 text-center">PJ</th>
              <th className="px-2 py-2 text-center">G</th>
              <th className="px-2 py-2 text-center">E</th>
              <th className="px-2 py-2 text-center">P</th>
              <th className="px-2 py-2 text-center">GF</th>
              <th className="px-2 py-2 text-center">GC</th>
              <th className="px-2 py-2 text-center">DG</th>
              <th className="px-2 py-2 text-center">PTS</th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((team, index) => {
                const club = clubs.find((item) => normalizeTeam(item.nombre) === normalizeTeam(team.nombre));
                return (
                  <tr key={team.nombre} className="border-b border-white/[.08] last:border-b-0">
                    <td className="py-2.5 text-[10px] font-black text-white/70">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-[5px] ${index === 0 ? "bg-[#67e2c0] text-[#07354c]" : "bg-white/[.04] text-white/70"}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <TeamLink name={team.nombre} slug={club?.slug} className="group inline-flex max-w-[180px] items-center gap-2 text-white">
                        <TeamLogo name={team.nombre} clubs={clubs} className="h-7 w-7" />
                        <span className="truncate text-[10px] font-black sm:text-[11px]">{team.nombre}</span>
                      </TeamLink>
                    </td>
                    {[team.pj, team.pg, team.pe, team.pp, team.gf, team.gc].map((value, cell) => (
                      <td key={cell} className="px-2 py-2.5 text-center text-[10px] font-bold text-white/85">{value}</td>
                    ))}
                    <td className="px-2 py-2.5 text-center text-[10px] font-bold text-white/85">{team.dg > 0 ? `+${team.dg}` : team.dg}</td>
                    <td className="px-2 py-2.5 text-center text-[11px] font-black text-white">{team.puntos}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="py-10 text-center text-[11px] font-bold text-white/45">Sin clasificación disponible.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HistoriaPage() {
  const [season, setSeason] = useState(HISTORY_CONFIG.defaultSeason);
  const initializedSeason = useRef(false);
  const {
    loading,
    globalLoading,
    error,
    seasons,
    clubs,
    summary,
    tables,
    highlighted,
    competitions,
    awards,
    seasonRecords,
    historicalRecords,
  } = useHistory(season);

  useEffect(() => {
    if (initializedSeason.current || seasons.length === 0) return;
    initializedSeason.current = true;
    setSeason(seasons[seasons.length - 1]);
  }, [seasons]);

  const championPrimera = tables.primera[0]?.nombre || "Por definir";
  const championSegunda = tables.segunda[0]?.nombre || "Por definir";

  const highlightCards = useMemo(
    () => [
      {
        label: "Máximo goleador",
        value: highlighted.scorer?.goles ?? 0,
        unit: "goles",
        name: highlighted.scorer?.nombre || "Sin datos",
        team: highlighted.scorer?.equipo || "",
      },
      {
        label: "Más asistencias",
        value: highlighted.assists?.asistencias ?? 0,
        unit: "asistencias",
        name: highlighted.assists?.nombre || "Sin datos",
        team: highlighted.assists?.equipo || "",
      },
      {
        label: "Más MVP",
        value: highlighted.mvp?.mvps ?? 0,
        unit: "MVP",
        name: highlighted.mvp?.nombre || "Sin datos",
        team: highlighted.mvp?.equipo || "",
      },
      {
        label: "Mejor ataque",
        value: highlighted.attack?.gf ?? 0,
        unit: "goles",
        name: highlighted.attack?.nombre || "Sin datos",
        team: "",
      },
      {
        label: "Mejor defensa",
        value: highlighted.defense?.gc ?? 0,
        unit: "goles recibidos",
        name: highlighted.defense?.nombre || "Sin datos",
        team: "",
      },
    ],
    [highlighted],
  );

  return (
    <main className="min-h-screen bg-[#f5fbfe] text-[#102f55]">
      <section className="relative overflow-hidden border-b border-[#17496c] bg-[#062b4a] text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "54px 54px" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_28%,rgba(86,175,226,.24),transparent_31%),linear-gradient(90deg,rgba(3,27,48,.98),rgba(6,43,74,.9)_52%,rgba(6,43,74,.72))]" />
        <div className="relative mx-auto grid min-h-[250px] w-full max-w-[1680px] items-end gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-10 lg:py-10">
          <div className="max-w-[760px] pb-1">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[.42em] text-[#76c8f3]">{HISTORY_CONFIG.hero.eyebrow}</p>
            <h1 className="text-[42px] font-black uppercase leading-[.92] tracking-[-.055em] sm:text-[62px] lg:text-[72px]">{HISTORY_CONFIG.hero.title}</h1>
            <p className="mt-4 max-w-[680px] text-[13px] font-medium leading-6 text-white/82 sm:text-[15px]">{HISTORY_CONFIG.hero.description}</p>
          </div>

          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-[8px] border border-white/15 bg-[#0a385b]/88 p-1.5 shadow-[0_12px_35px_rgba(0,0,0,.15)]">
            {(seasons.length ? seasons : [season]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSeason(item)}
                className={`min-w-[68px] rounded-[6px] px-5 py-3 text-[11px] font-black transition ${season === item ? "bg-[#2ea4e8] text-white shadow-[0_4px_14px_rgba(46,164,232,.35)]" : "text-white/75 hover:bg-white/[.06] hover:text-white"}`}
              >
                {shortSeasonLabel(item)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error ? (
        <div className="mx-auto w-full max-w-[1680px] px-5 pt-4 sm:px-8 lg:px-10">
          <div className="rounded-[8px] border border-[#f0c8c8] bg-[#fff6f6] px-4 py-3 text-[11px] font-bold text-[#934747]">{error} Mostramos igualmente todo lo que sí está disponible.</div>
        </div>
      ) : null}

      <section className="border-b border-[#cfe5f1] bg-[#f8fcff]">
        <div className="mx-auto grid w-full max-w-[1680px] gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:py-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3298d3]">Resumen general</p>
            <h2 className="mt-1 text-[30px] font-black uppercase tracking-[-.04em] text-[#102f55] sm:text-[36px]">{season}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                [summary.teams, "Equipos"],
                [summary.matches, "Partidos"],
                [summary.goals, "Goles"],
                [formatAverage(summary.goalsPerMatch), "Goles por partido"],
              ].map(([value, label]) => (
                <div key={String(label)} className="rounded-[8px] border border-[#d6e9f3] bg-white px-3 py-4 text-center shadow-[0_5px_18px_rgba(21,78,112,.04)]">
                  <strong className="block text-[27px] font-black tracking-[-.04em] text-[#102f55] sm:text-[31px]">{loading ? "—" : value}</strong>
                  <span className="mt-1 block text-[8px] font-black uppercase tracking-[.06em] text-[#497a9e]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["Primera División", championPrimera],
              ["Segunda División", championSegunda],
            ].map(([division, champion]) => (
              <div key={division} className="flex min-h-[142px] flex-col items-center justify-center rounded-[9px] border border-[#cfe6f2] bg-[#eef9ff] px-4 py-4 text-center">
                <span className="text-[9px] font-black uppercase tracking-[.08em] text-[#285f89]">{division}</span>
                <span className="mt-0.5 text-[12px] font-black uppercase text-[#168cd0]">Campeón</span>
                <div className="mt-3">
                  <TeamIdentity name={champion} clubs={clubs} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#0b3e64] bg-[#06375e] text-white">
        <div className="mx-auto w-full max-w-[1680px] px-5 py-6 sm:px-8 lg:px-10 lg:py-7">
          <SectionTitle inverse>Clasificación final</SectionTitle>
          <div className="grid gap-4 xl:grid-cols-2">
            <StandingTable title="Primera División" rows={tables.primera} clubs={clubs} />
            <StandingTable title="Segunda División" rows={tables.segunda} clubs={clubs} />
          </div>
          <div className="mt-4 text-right">
            <Link href="/divisiones" className="text-[10px] font-black text-[#66c7f3] transition hover:text-white">Ver tabla completa →</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[#cfe5f1] bg-[#f7fcff]">
        <div className="mx-auto w-full max-w-[1680px] px-5 py-6 sm:px-8 lg:px-10 lg:py-7">
          <SectionTitle>Estadísticas destacadas</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {highlightCards.map((card) => (
              <div key={card.label} className="min-h-[148px] rounded-[9px] border border-[#d5e9f4] bg-white p-4 shadow-[0_5px_18px_rgba(21,78,112,.035)]">
                <p className="text-[9px] font-black uppercase tracking-[.07em] text-[#214f7d]">{card.label}</p>
                <strong className="mt-2 block text-[29px] font-black leading-none tracking-[-.04em] text-[#102f55]">{loading ? "—" : card.value}</strong>
                <span className="mt-1 block text-[8px] font-black uppercase text-[#378bc0]">{card.unit}</span>
                <div className="mt-4">
                  {card.name !== "Sin datos" ? (
                    <TeamIdentity name={card.team || card.name} clubs={clubs} compact />
                  ) : (
                    <span className="text-[11px] font-bold text-[#7f96a7]">Sin datos</span>
                  )}
                  {card.team ? <p className="mt-1 pl-9 text-[10px] font-bold text-[#5a7c95]">{card.name}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#0b3e64] bg-[#06406b] text-white">
        <div className="mx-auto w-full max-w-[1680px] px-5 py-6 sm:px-8 lg:px-10 lg:py-7">
          <SectionTitle inverse>Competiciones</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {competitions.map((competition) => (
              <div key={competition.key} className="rounded-[9px] border border-white/12 bg-white/[.035] p-4">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1f77aa]/45 text-[#83d5fb]">
                    <TrophyIcon className="h-6 w-6" />
                  </span>
                  <h3 className="text-[11px] font-black uppercase tracking-[.04em] text-white">{competition.label}</h3>
                </div>
                <div className="space-y-3">
                  {competition.rows.map((row) => (
                    <div key={`${competition.key}-${row.label}`}>
                      <p className="mb-1 text-[8px] font-bold uppercase tracking-[.08em] text-[#79b5d8]">{row.label}</p>
                      <TeamIdentity name={row.team} clubs={clubs} compact inverse />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#cfe5f1] bg-[#f8fcff]">
        <div className="mx-auto w-full max-w-[1680px] px-5 py-6 sm:px-8 lg:px-10 lg:py-7">
          <SectionTitle>Premios</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            {awards.map((award) => (
              <div key={award.key} className="flex min-h-[112px] items-center gap-4 rounded-[9px] border border-[#d7e9f3] bg-white p-4 shadow-[0_5px_18px_rgba(21,78,112,.035)]">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#cce4f1] bg-[#eef8fd] text-[21px] font-black text-[#1f77aa]">{award.nombre === "Sin definir" ? "—" : award.nombre.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[.08em] text-[#1c5790]">{award.label}</p>
                  <strong className="mt-1 block truncate text-[15px] font-black text-[#102f55]">{award.nombre}</strong>
                  {award.equipo ? (
                    <div className="mt-2"><TeamIdentity name={award.equipo} clubs={clubs} compact /></div>
                  ) : (
                    <span className="mt-2 block text-[10px] font-bold text-[#8ba0b0]">Todavía sin club asociado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#052f50] text-white">
        <div className="mx-auto grid w-full max-w-[1680px] gap-8 px-5 py-7 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-8">
          <div>
            <SectionTitle inverse>Récords de la temporada</SectionTitle>
            <div className="overflow-hidden rounded-[8px] border border-white/10 bg-black/5">
              {seasonRecords.map((record) => (
                <div key={record.label} className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/[.08] px-4 py-2.5 last:border-b-0">
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-white/80">{record.label}</span>
                    <span className="mt-0.5 block truncate text-[9px] font-medium text-[#7fb5d5]">{record.detail}</span>
                  </div>
                  <strong className="self-center text-[12px] font-black text-white">{record.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle inverse>
              <span>Récords históricos <span className="text-[9px] font-bold tracking-[.12em] text-[#80b4d4]">(todas las temporadas)</span></span>
            </SectionTitle>
            <div className="overflow-hidden rounded-[8px] border border-white/10 bg-black/5">
              {globalLoading ? (
                <div className="px-4 py-10 text-center text-[11px] font-bold text-white/45">Cargando historial completo...</div>
              ) : (
                historicalRecords.map((record) => (
                  <div key={record.label} className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/[.08] px-4 py-2.5 last:border-b-0">
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold text-white/80">{record.label}</span>
                      <span className="mt-0.5 block truncate text-[9px] font-medium text-[#7fb5d5]">{record.detail}</span>
                    </div>
                    <strong className="self-center text-[12px] font-black text-white">{record.value}</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#cfe5f1] bg-[#f8fcff]">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-5 py-5 text-[9px] font-bold text-[#52738d] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-4"><strong className="text-[13px] font-black tracking-[.08em] text-[#102f55]">APA ARGENTINA</strong><span>El fútbol virtual también nos une.</span></div>
          <div className="flex flex-wrap gap-4"><span>Contacto</span><span>Términos</span><span>Privacidad</span><span>Redes</span></div>
        </div>
      </footer>
    </main>
  );
}
