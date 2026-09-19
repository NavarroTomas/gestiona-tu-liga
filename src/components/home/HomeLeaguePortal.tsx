"use client";

import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import LeagueHero from "@/components/home/LeagueHero";
import HomeNewsStandings from "@/components/home/HomeNewsStandings";
import HomeAwards from "@/components/home/HomeAwards";
import HomeCompetitionStrip from "@/components/home/HomeCompetitionStrip";
import HomeMatchStrip from "@/components/home/HomeMatchStrip";
import { usePublishedHomeDocument } from "@/lib/usePublishedSitePage";
import {
  elementInlineStyle,
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
} from "@/lib/homePortal";

type PlayerStat = {
  partido_id?: string | null;
  playerId?: string | null;
  nombre?: string | null;
  equipo?: string | null;
  goals?: number | null;
  assists?: number | null;
  mvp?: number | null;
};

type Props = {
  editorDocument?: HomeEditorDocument;
  editorMode?: boolean;
  editorBreakpoint?: EditorBreakpoint;
  selectedSection?: HomeSectionId;
  selectedElement?: HomeEditorElementId | null;
  onSelectSection?: (section: HomeSectionId) => void;
  onSelectElement?: (element: HomeEditorElementId) => void;
};

function breakpointFromWidth(width: number): EditorBreakpoint {
  if (width <= 640) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

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
  const [awards, setAwards] = useState<HomeAward[]>([]);
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [runtimeBreakpoint, setRuntimeBreakpoint] = useState<EditorBreakpoint>("desktop");
  const { document: publishedDocument } = usePublishedHomeDocument(!editorDocument);
  const pageDocument = normalizeHomeEditorDocument(editorDocument ?? publishedDocument);
  const activeBreakpoint = editorMode ? editorBreakpoint : runtimeBreakpoint;

  useEffect(() => {
    if (editorMode) return;
    const syncBreakpoint = () => setRuntimeBreakpoint(breakpointFromWidth(window.innerWidth));
    syncBreakpoint();
    window.addEventListener("resize", syncBreakpoint, { passive: true });
    return () => window.removeEventListener("resize", syncBreakpoint);
  }, [editorMode]);

  useEffect(() => {
    let active = true;
    async function load() {
      const seasonsRes = await supabase.from("temporadas").select("nombre").order("created_at", { ascending: true });
      const seasonNames = (seasonsRes.data || []).map((row: { nombre?: string | null }) => String(row.nombre || "")).filter(Boolean);
      const currentSeason = seasonNames[seasonNames.length - 1] || "Temporada 4";
      if (!active) return;
      setTemporada(currentSeason);
      const [matchesRes, awardsRes] = await Promise.all([
        supabase.from("partidos").select("id,partido_id,local,visitante,resultado,fecha,temporada,division,competicion,fase,grupo,dia,hora").eq("temporada", currentSeason),
        supabase.from("premios_apa").select("id,premio,nombre,equipo,puntos,posicion").eq("temporada", currentSeason).order("id", { ascending: false }).limit(8),
      ]);
      if (!active) return;
      const seasonMatches = ((matchesRes.data || []) as HomeMatch[]).sort(sortMatches);
      setMatches(seasonMatches);
      setAwards((awardsRes.data || []) as HomeAward[]);
      const teamNames = [...new Set(seasonMatches.flatMap((match) => [match.local, match.visitante]).filter(Boolean))] as string[];
      if (teamNames.length) {
        const clubsRes = await supabase.from("clubes_info").select("nombre,logo_url").in("nombre", teamNames);
        if (active) setClubs((clubsRes.data || []) as ClubInfo[]);
      }
      const matchIds = seasonMatches.map((match) => String(match.partido_id || match.id));
      if (matchIds.length) {
        const statsRes = await supabase
          .from("estadisticas_jugadores")
          .select("partido_id,playerId,nombre,equipo,goals,assists,mvp")
          .eq("temporada", currentSeason)
          .in("partido_id", matchIds);
        if (active) setStats((statsRes.data || []) as PlayerStat[]);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const standingsPrimera = useMemo(() => buildStandings(matches, "Primera"), [matches]);
  const standingsSegunda = useMemo(() => buildStandings(matches, "Segunda"), [matches]);
  const automaticNews = useMemo(() => buildAutomaticNews(matches, stats), [matches, stats]);
  const mergedNews = useMemo(() => automaticNews.slice(0, 5), [automaticNews]);
  const upcoming = useMemo(() => matches.filter((match) => !match.resultado).sort(sortMatches), [matches]);
  const featured = upcoming[0];
  const heroStories = useMemo(() => {
    const stories = automaticNews.slice(0, 2).map((item) => ({
      id: item.id,
      kicker: item.categoria || "Actualidad APA",
      title: item.titulo,
      description: item.descripcion || "Última novedad de la competición.",
      href: item.href || "/divisiones",
      meta: item.meta || temporada,
      cta: "Ver detalle",
    }));

    if (featured?.local && featured?.visitante) {
      const competition = String(featured.competicion || "Liga")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
      stories.push({
        id: "hero-upcoming-" + String(featured.partido_id || featured.id),
        kicker: competition,
        title: featured.local + " vs " + featured.visitante,
        description:
          (featured.fecha ? "Fecha " + featured.fecha + " · " : "") +
          (featured.dia ? featured.dia + " · " : "") +
          (featured.hora || "Próximo partido"),
        href: "/fixture",
        meta: "Próximo partido",
        cta: "Ver fixture",
      });
    }

    if (stories.length < 3 && standingsPrimera[0]) {
      const leader = standingsPrimera[0];
      stories.push({
        id: "hero-leader-" + leader.club,
        kicker: "Primera División",
        title: leader.club + " lidera la tabla",
        description:
          leader.pts +
          " puntos · " +
          leader.pj +
          " PJ · DG " +
          (leader.dg > 0 ? "+" : "") +
          leader.dg,
        href: "/divisiones",
        meta: temporada,
        cta: "Ver tabla",
      });
    }

    return stories.slice(0, 3);
  }, [automaticNews, featured, standingsPrimera, temporada]);
  const logoEquipo = (team: string) => clubs.find((club) => normalizeText(club.nombre) === normalizeText(team))?.logo_url || null;
  const clubsCount = new Set(matches.flatMap((m) => [m.local, m.visitante]).filter(Boolean)).size;
  const playersCount = new Set(stats.map((row) => String(row.playerId || row.nombre || "")).filter(Boolean)).size;
  const goalsCount = matches.reduce((sum, match) => {
    const found = String(match.resultado || "").match(/^(\d+)\s*[-:]\s*(\d+)$/);
    return found ? sum + Number(found[1]) + Number(found[2]) : sum;
  }, 0);

  function elementProps(id: HomeEditorElementId) {
    const elementStyle = pageDocument.elements[id];
    const forceTextColor = elementStyle.color !== "inherit" && Boolean(elementStyle.color);
    const selectionClass = editorMode
      ? `relative cursor-pointer ${selectedElement === id ? "outline outline-2 outline-offset-2 outline-[#ffcc4d]" : "hover:outline hover:outline-1 hover:outline-offset-2 hover:outline-[#ffcc4d]/70"}`
      : "";
    const forceColorClass = forceTextColor ? "apa-editor-force-text-color" : "";

    return {
      "data-editor-element": id,
      onClickCapture: (event: MouseEvent<HTMLElement>) => {
        if (!editorMode) return;
        event.preventDefault();
        event.stopPropagation();
        onSelectElement?.(id);
      },
      className: `${selectionClass} ${forceColorClass}`.trim() || undefined,
      style: {
        ...elementInlineStyle(elementStyle, activeBreakpoint),
        ...(forceTextColor ? { "--apa-editor-text-color": elementStyle.color } : {}),
      } as CSSProperties,
    };
  }

  function shell(id: HomeSectionId, child: ReactNode) {
    const section = pageDocument.sections[id];
    if (!section.visible) return null;
    const forceTextColor = section.textColor !== "inherit" && Boolean(section.textColor);
    const selectionClass = editorMode
      ? `relative transition ${selectedSection === id && !selectedElement ? "outline outline-2 outline-offset-4 outline-[#22a3ff]" : "hover:outline hover:outline-1 hover:outline-offset-4 hover:outline-[#22a3ff]/50"}`
      : "";
    const forceColorClass = forceTextColor ? "apa-editor-force-text-color" : "";

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
        className={`${selectionClass} ${forceColorClass}`.trim() || undefined}
        style={{
          background: id === "hero" ? "transparent" : section.background,
          color: id === "hero" ? "#102f55" : section.textColor,
          ...(forceTextColor && id !== "hero" ? { "--apa-editor-text-color": section.textColor } : {}),
          borderRadius: id === "hero" ? 0 : valueForBreakpoint(section.radius, activeBreakpoint),
          paddingTop: id === "hero" ? 0 : valueForBreakpoint(section.paddingY, activeBreakpoint),
          paddingBottom: id === "hero" ? 0 : valueForBreakpoint(section.paddingY, activeBreakpoint),
          paddingLeft: id === "hero" ? 0 : valueForBreakpoint(section.paddingX, activeBreakpoint),
          paddingRight: id === "hero" ? 0 : valueForBreakpoint(section.paddingX, activeBreakpoint),
          marginTop: valueForBreakpoint(section.marginTop, activeBreakpoint),
          marginBottom: valueForBreakpoint(section.marginBottom, activeBreakpoint),
          border: id === "hero" ? "none" : section.borderWidth ? `${section.borderWidth}px solid ${section.borderColor}` : undefined,
          boxShadow: id === "hero" || section.shadow === "none" ? undefined : section.shadow,
        } as CSSProperties}
      >
        {editorMode ? <span className="pointer-events-none absolute left-2 top-2 z-[70] rounded-md bg-[#102f55] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-lg">{id}</span> : null}
        {child}
      </div>
    );
  }

  function renderSection(id: HomeSectionId) {
    switch (id) {
      case "hero":
        return shell(
          id,
          <LeagueHero
            temporada={temporada}
            stories={heroStories}
            editor={pageDocument.hero}
            elements={pageDocument.elements}
            breakpoint={activeBreakpoint}
            editorMode={editorMode}
            selectedElement={selectedElement}
            onSelectElement={onSelectElement}
          />,
        );
      case "news": {
        const props = elementProps("news.content");
        return shell(
          id,
          <div {...props}>
            <HomeNewsStandings
              news={mergedNews}
              standingsPrimera={standingsPrimera}
              standingsSegunda={standingsSegunda}
              logoEquipo={logoEquipo}
            />
          </div>,
        );
      }
      case "awards":
        return shell(id, <HomeAwards awards={awards} logoEquipo={logoEquipo} editor={pageDocument.awards} elements={pageDocument.elements} breakpoint={activeBreakpoint} editorMode={editorMode} selectedElement={selectedElement} onSelectElement={onSelectElement} />);
      case "competitions":
        return shell(id, <HomeCompetitionStrip editor={pageDocument.competitions} elements={pageDocument.elements} breakpoint={activeBreakpoint} editorMode={editorMode} selectedElement={selectedElement} onSelectElement={onSelectElement} />);
      case "match": {
        const props = elementProps("match.content");
        return shell(id, <div {...props}><HomeMatchStrip featured={featured} upcoming={upcoming} clubs={clubs} /></div>);
      }
      case "stats":
      case "community":
        return null;
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: pageDocument.global.pageBackground, color: "#0b2747", fontFamily: pageDocument.global.fontFamily }}>
      <style>{`.apa-editor-force-text-color, .apa-editor-force-text-color * { color: var(--apa-editor-text-color) !important; }`}</style>
      <div
        className="mx-auto px-4 py-5 md:px-8 md:py-8"
        style={{
          maxWidth: pageDocument.global.contentMaxWidth,
          display: "flex",
          flexDirection: "column",
          gap: valueForBreakpoint(pageDocument.global.sectionGap, activeBreakpoint),
        }}
      >
        {pageDocument.order.map(renderSection)}
      </div>
    </main>
  );
}
