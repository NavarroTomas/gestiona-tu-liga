"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

function clubFor(name: string, clubs: HistoryClub[]) {
  return clubs.find((club) => normalizeTeam(club.nombre) === normalizeTeam(name));
}

function formatAverage(value: number) {
  return value > 0 ? value.toFixed(2).replace(".", ",") : "0,00";
}

function TeamLogo({ name, clubs, size = "md" }: { name: string; clubs: HistoryClub[]; size?: "sm" | "md" | "lg" }) {
  const club = clubFor(name, clubs);
  const initials = String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const sizeClass = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-7 w-7" : "h-9 w-9";

  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#e8f4fb] text-[9px] font-black text-[#557a95] ${sizeClass}`}>
      {club?.logo_url ? <img src={club.logo_url} alt="" loading="lazy" className="h-full w-full object-contain p-0.5" /> : initials}
    </span>
  );
}

function TeamIdentity({
  name,
  clubs,
  inverse = false,
  compact = false,
}: {
  name: string;
  clubs: HistoryClub[];
  inverse?: boolean;
  compact?: boolean;
}) {
  if (!name || name === "Por definir" || name === "Sin datos") {
    return <span className={inverse ? "text-white/50" : "text-[#7890a3]"}>{name || "Sin datos"}</span>;
  }

  const club = clubFor(name, clubs);
  return (
    <TeamLink
      name={name}
      slug={club?.slug}
      className={`group inline-flex min-w-0 items-center gap-2 ${inverse ? "text-white" : "text-[#102f55]"}`}
    >
      <TeamLogo name={name} clubs={clubs} size={compact ? "sm" : "md"} />
      <span className={`truncate font-black ${compact ? "text-[11px]" : "text-sm"}`}>{name}</span>
    </TeamLink>
  );
}

function SectionTitle({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <h2 className={`text-lg font-black uppercase tracking-tight sm:text-xl ${inverse ? "text-white" : "text-[#102f55]"}`}>{children}</h2>
      <span className={`h-px flex-1 ${inverse ? "bg-white/15" : "bg-[#c9e3f1]"}`} />
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M8 4h8v3.5c0 3-1.75 5.5-4 5.5s-4-2.5-4-5.5V4Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 6H5.8c0 3 1.2 4.7 3.6 5.2M16 6h2.2c0 3-1.2 4.7-3.6 5.2M12 13v3.2M8.5 20h7M9.5 16.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StandingTable({ title, rows, clubs }: { title: string; rows: LeagueStanding[]; clubs: HistoryClub[] }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
      <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-white">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 text-[8px] font-black uppercase tracking-wider text-[#82b6d7]">
              <th className="w-9 py-2">#</th>
              <th className="py-2">Club</th>
              {['PJ','G','E','P','GF','GC','DG','PTS'].map((label) => <th key={label} className="px-2 py-2 text-center">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 5).map((team, index) => {
              const club = clubFor(team.nombre, clubs);
              return (
                <tr key={team.nombre} className="border-b border-white/10 last:border-0">
                  <td className="py-2.5">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-black ${index === 0 ? "bg-[#6de1bf] text-[#07354c]" : "bg-white/5 text-white/70"}`}>{index + 1}</span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <TeamLink name={team.nombre} slug={club?.slug} className="inline-flex max-w-[190px] items-center gap-2 text-white">
                      <TeamLogo name={team.nombre} clubs={clubs} size="sm" />
                      <span className="truncate text-[10px] font-black sm:text-[11px]">{team.nombre}</span>
                    </TeamLink>
                  </td>
                  {[team.pj, team.pg, team.pe, team.pp, team.gf, team.gc].map((value, cell) => <td key={cell} className="px-2 py-2.5 text-center text-[10px] font-bold text-white/85">{value}</td>)}
                  <td className="px-2 py-2.5 text-center text-[10px] font-bold text-white/85">{team.dg > 0 ? `+${team.dg}` : team.dg}</td>
                  <td className="px-2 py-2.5 text-center text-[11px] font-black text-white">{team.puntos}</td>
                </tr>
              );
            })}
            {rows.length === 0 ? <tr><td colSpan={10} className="py-10 text-center text-[11px] font-bold text-white/45">Sin clasificación disponible.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HistoriaPage() {
  const [season, setSeason] = useState(HISTORY_CONFIG.defaultSeason);
  const initialized = useRef(false);
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
    if (initialized.current || seasons.length === 0) return;
    initialized.current = true;
    setSeason(seasons[seasons.length - 1]);
  }, [seasons]);

  const highlights = useMemo(() => [
    { label: "Máximo goleador", value: highlighted.scorer?.goles ?? 0, unit: "goles", person: highlighted.scorer?.nombre || "Sin datos", team: highlighted.scorer?.equipo || "" },
    { label: "Más asistencias", value: highlighted.assists?.asistencias ?? 0, unit: "asistencias", person: highlighted.assists?.nombre || "Sin datos", team: highlighted.assists?.equipo || "" },
    { label: "Más MVP", value: highlighted.mvp?.mvps ?? 0, unit: "MVP", person: highlighted.mvp?.nombre || "Sin datos", team: highlighted.mvp?.equipo || "" },
    { label: "Mejor ataque", value: highlighted.attack?.gf ?? 0, unit: "goles", person: highlighted.attack?.nombre || "Sin datos", team: highlighted.attack?.nombre || "" },
    { label: "Mejor defensa", value: highlighted.defense?.gc ?? 0, unit: "goles recibidos", person: highlighted.defense?.nombre || "Sin datos", team: highlighted.defense?.nombre || "" },
  ], [highlighted]);

  const champions = [
    { division: "Primera División", team: tables.primera[0]?.nombre || "Por definir" },
    { division: "Segunda División", team: tables.segunda[0]?.nombre || "Por definir" },
  ];

  return (
    <main className="min-h-screen bg-[#f5fbfe] text-[#102f55]">
      <section className="relative overflow-hidden border-b border-[#17496c] bg-[#062b4a] text-white">
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 78% 24%, rgba(86,175,226,.24), transparent 30%), linear-gradient(90deg, #041f36 0%, #062f50 58%, #073b63 100%)" }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)", backgroundSize: "52px 52px" }} />
        <div className="relative mx-auto grid min-h-[250px] w-full max-w-[1680px] items-end gap-7 px-5 py-8 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-10">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#76c8f3]">{HISTORY_CONFIG.hero.eyebrow}</p>
            <h1 className="max-w-[720px] text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl">{HISTORY_CONFIG.hero.title}</h1>
            <p className="mt-4 max-w-[670px] text-sm font-medium leading-6 text-white/80">{HISTORY_CONFIG.hero.description}</p>
          </div>
          <div className="flex max-w-full justify-start gap-1 overflow-x-auto rounded-lg border border-white/15 bg-[#0a385b] p-1.5 lg:justify-self-end">
            {(seasons.length ? seasons : [season]).map((item) => (
              <button key={item} type="button" onClick={() => setSeason(item)} className={`min-w-[68px] rounded-md px-5 py-3 text-[11px] font-black transition ${season === item ? "bg-[#2ea4e8] text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>
                {shortSeasonLabel(item)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error ? <div className="mx-auto max-w-[1680px] px-5 pt-4 sm:px-8 lg:px-10"><div className="rounded-lg border border-[#efcaca] bg-[#fff6f6] px-4 py-3 text-[11px] font-bold text-[#934747]">{error} Mostramos todo lo que sí está disponible.</div></div> : null}

      <section className="border-b border-[#cfe5f1] bg-[#f8fcff]">
        <div className="mx-auto grid max-w-[1680px] gap-5 px-5 py-6 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#3298d3]">Resumen general</p>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-tight sm:text-4xl">{season}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { value: summary.teams, label: "Equipos" },
                { value: summary.matches, label: "Partidos" },
                { value: summary.goals, label: "Goles" },
                { value: formatAverage(summary.goalsPerMatch), label: "Goles por partido" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-lg border border-[#d6e9f3] bg-white px-3 py-4 text-center">
                  <strong className="block text-3xl font-black tracking-tight">{loading ? "—" : metric.value}</strong>
                  <span className="mt-1 block text-[8px] font-black uppercase tracking-wide text-[#497a9e]">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {champions.map((champion) => (
              <div key={champion.division} className="flex min-h-[145px] flex-col items-center justify-center rounded-lg border border-[#cfe6f2] bg-[#eef9ff] p-4 text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#285f89]">{champion.division}</span>
                <span className="mt-1 text-xs font-black uppercase text-[#168cd0]">Campeón</span>
                <div className="mt-3"><TeamIdentity name={champion.team} clubs={clubs} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#0b3e64] bg-[#06375e] text-white">
        <div className="mx-auto max-w-[1680px] px-5 py-6 sm:px-8 lg:px-10">
          <SectionTitle inverse>Clasificación final</SectionTitle>
          <div className="grid gap-4 xl:grid-cols-2">
            <StandingTable title="Primera División" rows={tables.primera} clubs={clubs} />
            <StandingTable title="Segunda División" rows={tables.segunda} clubs={clubs} />
          </div>
          <div className="mt-4 text-right"><Link href="/divisiones" className="text-[10px] font-black text-[#66c7f3] hover:text-white">Ver tabla completa →</Link></div>
        </div>
      </section>

      <section className="border-b border-[#cfe5f1] bg-[#f7fcff]">
        <div className="mx-auto max-w-[1680px] px-5 py-6 sm:px-8 lg:px-10">
          <SectionTitle>Estadísticas destacadas</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {highlights.map((card) => (
              <div key={card.label} className="min-h-[150px] rounded-lg border border-[#d5e9f4] bg-white p-4">
                <p className="text-[9px] font-black uppercase tracking-wide text-[#214f7d]">{card.label}</p>
                <strong className="mt-2 block text-3xl font-black leading-none">{loading ? "—" : card.value}</strong>
                <span className="mt-1 block text-[8px] font-black uppercase text-[#378bc0]">{card.unit}</span>
                <div className="mt-4">
                  {card.team ? <TeamIdentity name={card.team} clubs={clubs} compact /> : <span className="text-[11px] font-bold text-[#7f96a7]">Sin datos</span>}
                  {card.person !== card.team && card.person !== "Sin datos" ? <p className="mt-1 pl-9 text-[10px] font-bold text-[#5a7c95]">{card.person}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#0b3e64] bg-[#06406b] text-white">
        <div className="mx-auto max-w-[1680px] px-5 py-6 sm:px-8 lg:px-10">
          <SectionTitle inverse>Competiciones</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {competitions.map((competition) => (
              <div key={competition.key} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1f77aa]/40 text-[#83d5fb]"><TrophyIcon /></span><h3 className="text-[11px] font-black uppercase tracking-wide">{competition.label}</h3></div>
                <div className="space-y-3">
                  {competition.rows.map((row) => <div key={`${competition.key}-${row.label}`}><p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-[#79b5d8]">{row.label}</p><TeamIdentity name={row.team} clubs={clubs} compact inverse /></div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#cfe5f1] bg-[#f8fcff]">
        <div className="mx-auto max-w-[1680px] px-5 py-6 sm:px-8 lg:px-10">
          <SectionTitle>Premios</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            {awards.map((award) => (
              <div key={award.key} className="flex min-h-[112px] items-center gap-4 rounded-lg border border-[#d7e9f3] bg-white p-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#cce4f1] bg-[#eef8fd] text-xl font-black text-[#1f77aa]">{award.nombre === "Sin definir" ? "—" : award.nombre.charAt(0).toUpperCase()}</span>
                <div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-wider text-[#1c5790]">{award.label}</p><strong className="mt-1 block truncate text-base font-black">{award.nombre}</strong>{award.equipo ? <div className="mt-2"><TeamIdentity name={award.equipo} clubs={clubs} compact /></div> : <span className="mt-2 block text-[10px] font-bold text-[#8ba0b0]">Todavía sin club asociado</span>}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#052f50] text-white">
        <div className="mx-auto grid max-w-[1680px] gap-8 px-5 py-7 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div>
            <SectionTitle inverse>Récords de la temporada</SectionTitle>
            <div className="overflow-hidden rounded-lg border border-white/10">
              {seasonRecords.map((record) => <div key={record.label} className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 px-4 py-2.5 last:border-0"><div className="min-w-0"><span className="block text-[10px] font-bold text-white/80">{record.label}</span><span className="mt-0.5 block truncate text-[9px] text-[#7fb5d5]">{record.detail}</span></div><strong className="self-center text-xs font-black">{record.value}</strong></div>)}
            </div>
          </div>
          <div>
            <SectionTitle inverse><span>Récords históricos <span className="text-[9px] font-bold tracking-wider text-[#80b4d4]">(todas las temporadas)</span></span></SectionTitle>
            <div className="overflow-hidden rounded-lg border border-white/10">
              {globalLoading ? <div className="px-4 py-10 text-center text-[11px] font-bold text-white/45">Cargando historial completo...</div> : historicalRecords.map((record) => <div key={record.label} className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 px-4 py-2.5 last:border-0"><div className="min-w-0"><span className="block text-[10px] font-bold text-white/80">{record.label}</span><span className="mt-0.5 block truncate text-[9px] text-[#7fb5d5]">{record.detail}</span></div><strong className="self-center text-xs font-black">{record.value}</strong></div>)}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#cfe5f1] bg-[#f8fcff]">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-3 px-5 py-5 text-[9px] font-bold text-[#52738d] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-4"><strong className="text-sm font-black tracking-wider text-[#102f55]">APA ARGENTINA</strong><span>El fútbol virtual también nos une.</span></div>
          <div className="flex gap-4"><span>Contacto</span><span>Términos</span><span>Privacidad</span><span>Redes</span></div>
        </div>
      </footer>
    </main>
  );
}
