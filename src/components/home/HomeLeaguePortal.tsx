"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import LeagueHero from "@/components/home/LeagueHero";
import HomeNewsStandings from "@/components/home/HomeNewsStandings";
import HomeAwards from "@/components/home/HomeAwards";
import HomeCompetitionStrip from "@/components/home/HomeCompetitionStrip";
import HomeMatchStrip from "@/components/home/HomeMatchStrip";
import { usePublishedHomeDocument } from "@/lib/usePublishedSitePage";
import {
  normalizeHomeEditorDocument,
  valueForBreakpoint,
  type EditorBreakpoint,
  type HomeEditorDocument,
  type HomeEditorElementId,
  type HomeSectionId,
} from "@/lib/siteEditor";
import {
  buildAutomaticNews,
  buildStandings,
  normalizeText,
  sortMatches,
  type ClubInfo,
  type HomeAward,
  type HomeMatch,
  type HomeNews,
} from "@/lib/homePortal";

type PlayerStat = { playerId?: string | null; nombre?: string | null; goals?: number | null };

type Props = {
  editorDocument?: HomeEditorDocument;
  editorMode?: boolean;
  editorBreakpoint?: EditorBreakpoint;
  selectedSection?: HomeSectionId;
  selectedElement?: HomeEditorElementId | null;
  onSelectSection?: (section: HomeSectionId) => void;
  onSelectElement?: (element: HomeEditorElementId) => void;
};

export default function HomeLeaguePortal({
  editorDocument,
  editorMode = false,
  editorBreakpoint = "desktop",
  selectedSection,
  selectedElement = null,
  onSelectSection,
  onSelectElement,
}: Props = {}) {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [matches, setMatches] = useState<HomeMatch[]>([]);
  const [clubs, setClubs] = useState<ClubInfo[]>([]);
  const [news, setNews] = useState<HomeNews[]>([]);
  const [awards, setAwards] = useState<HomeAward[]>([]);
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const { document: publishedDocument } = usePublishedHomeDocument(!editorDocument);
  const pageDocument = normalizeHomeEditorDocument(editorDocument ?? publishedDocument);

  useEffect(() => {
    let active = true;
    async function load() {
      const seasonsRes = await supabase.from("temporadas").select("nombre").order("created_at", { ascending: true });
      const seasonNames = (seasonsRes.data || []).map((row: { nombre?: string | null }) => String(row.nombre || "")).filter(Boolean);
      const currentSeason = seasonNames[seasonNames.length - 1] || "Temporada 4";
      if (!active) return;
      setTemporada(currentSeason);
      const [matchesRes, newsRes, awardsRes] = await Promise.all([
        supabase.from("partidos").select("id,partido_id,local,visitante,resultado,fecha,temporada,division,competicion,fase,grupo,dia,hora").eq("temporada", currentSeason),
        supabase.from("noticias").select("id,titulo,descripcion,categoria,imagen_url,destacada,created_at").eq("publicada", true).order("destacada", { ascending: false }).order("created_at", { ascending: false }).limit(6),
        supabase.from("premios_apa").select("id,premio,nombre,equipo,puntos,posicion").eq("temporada", currentSeason).order("id", { ascending: false }).limit(8),
      ]);
      if (!active) return;
      const seasonMatches = ((matchesRes.data || []) as HomeMatch[]).sort(sortMatches);
      setMatches(seasonMatches);
      setNews((newsRes.data || []) as HomeNews[]);
      setAwards((awardsRes.data || []) as HomeAward[]);
      const teamNames = [...new Set(seasonMatches.flatMap((match) => [match.local, match.visitante]).filter(Boolean))] as string[];
      if (teamNames.length) {
        const clubsRes = await supabase.from("clubes_info").select("nombre,logo_url").in("nombre", teamNames);
        if (active) setClubs((clubsRes.data || []) as ClubInfo[]);
      }
      const matchIds = seasonMatches.map((match) => String(match.partido_id || match.id));
      if (matchIds.length) {
        const statsRes = await supabase.from("estadisticas_jugadores").select("playerId,nombre,goals").eq("temporada", currentSeason).in("partido_id", matchIds);
        if (active) setStats((statsRes.data || []) as PlayerStat[]);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const standings = useMemo(() => buildStandings(matches, "Primera"), [matches]);
  const automaticNews = useMemo(() => buildAutomaticNews(matches), [matches]);
  const mergedNews = useMemo(() => {
    const manual = news.slice(0, 4);
    return manual.length >= 4 ? manual : [...manual, ...automaticNews.slice(0, 4 - manual.length)];
  }, [news, automaticNews]);
  const upcoming = useMemo(() => matches.filter((match) => !match.resultado).sort(sortMatches), [matches]);
  const featured = upcoming[0];
  const logoEquipo = (team: string) => clubs.find((club) => normalizeText(club.nombre) === normalizeText(team))?.logo_url || null;
  const clubsCount = new Set(matches.flatMap((m) => [m.local, m.visitante]).filter(Boolean)).size;
  const playersCount = new Set(stats.map((row) => String(row.playerId || row.nombre || "")).filter(Boolean)).size;
  const goalsCount = matches.reduce((sum, match) => {
    const found = String(match.resultado || "").match(/^(\d+)\s*[-:]\s*(\d+)$/);
    return found ? sum + Number(found[1]) + Number(found[2]) : sum;
  }, 0);

  function shell(id: HomeSectionId, child: ReactNode) {
    const section = pageDocument.sections[id];
    if (!section.visible) return null;
    return (
      <div
        key={id}
        data-editor-section={id}
        onClickCapture={(event) => {
          if (!editorMode) return;
          const target = event.target as HTMLElement;
          if (target.closest("[data-editor-element]")) return;
          event.preventDefault();
          event.stopPropagation();
          onSelectSection?.(id);
        }}
        className={editorMode ? `relative transition ${selectedSection === id && !selectedElement ? "outline outline-2 outline-offset-4 outline-[#22a3ff]" : "hover:outline hover:outline-1 hover:outline-offset-4 hover:outline-[#22a3ff]/50"}` : undefined}
        style={{
          background: section.background,
          color: section.textColor,
          borderRadius: valueForBreakpoint(section.radius, editorBreakpoint),
          paddingTop: valueForBreakpoint(section.paddingY, editorBreakpoint),
          paddingBottom: valueForBreakpoint(section.paddingY, editorBreakpoint),
          paddingLeft: valueForBreakpoint(section.paddingX, editorBreakpoint),
          paddingRight: valueForBreakpoint(section.paddingX, editorBreakpoint),
          marginTop: valueForBreakpoint(section.marginTop, editorBreakpoint),
          marginBottom: valueForBreakpoint(section.marginBottom, editorBreakpoint),
          border: section.borderWidth ? `${section.borderWidth}px solid ${section.borderColor}` : undefined,
          boxShadow: section.shadow === "none" ? undefined : section.shadow,
        }}
      >
        {editorMode ? <span className="pointer-events-none absolute left-2 top-2 z-[70] rounded-md bg-[#102f55] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-lg">{id}</span> : null}
        {child}
      </div>
    );
  }

  function renderSection(id: HomeSectionId) {
    switch (id) {
      case "hero":
        return shell(id, <LeagueHero temporada={temporada} editor={pageDocument.hero} breakpoint={editorBreakpoint} editorMode={editorMode} selectedElement={selectedElement} onSelectElement={onSelectElement} />);
      case "news":
        return shell(id, <HomeNewsStandings news={mergedNews} standings={standings} logoEquipo={logoEquipo} />);
      case "awards":
        return shell(id, <div data-editor-element="awards.heading"><HomeAwards awards={awards} logoEquipo={logoEquipo} editor={pageDocument.awards} /></div>);
      case "competitions":
        return shell(id, <div data-editor-element="competitions.heading"><HomeCompetitionStrip editor={pageDocument.competitions} /></div>);
      case "match":
        return shell(id, <HomeMatchStrip featured={featured} upcoming={upcoming} clubs={clubs} />);
      case "stats":
        return shell(id, <section data-editor-element="stats.cards" className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: pageDocument.stats.cardGap }}>{[["Clubes", clubsCount], ["Partidos", matches.length], ["Jugadores", playersCount], ["Goles", goalsCount]].map(([label, value]) => <div key={String(label)} style={{ background: pageDocument.stats.background, color: pageDocument.stats.textColor, borderRadius: pageDocument.stats.radius, padding: pageDocument.stats.cardPadding }}><p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}</section>);
      case "community":
        return shell(id, <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" style={{ background: pageDocument.community.background, color: pageDocument.community.textColor, borderRadius: pageDocument.community.radius, padding: pageDocument.community.padding }}><div data-editor-element="community.heading"><p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{pageDocument.community.eyebrow}</p><h2 className="mt-1 text-2xl font-black uppercase">{pageDocument.community.title}</h2></div><a data-editor-element="community.button" href={pageDocument.community.buttonHref} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-5 py-3 text-xs font-black uppercase text-[#0b2747]">{pageDocument.community.buttonLabel}</a></section>);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: pageDocument.global.pageBackground, color: "#0b2747", fontFamily: pageDocument.global.fontFamily }}>
      <div
        className="mx-auto px-4 py-5 md:px-8 md:py-8"
        style={{
          maxWidth: pageDocument.global.contentMaxWidth,
          display: "flex",
          flexDirection: "column",
          gap: valueForBreakpoint(pageDocument.global.sectionGap, editorBreakpoint),
        }}
      >
        {pageDocument.order.map(renderSection)}
      </div>
    </main>
  );
}
