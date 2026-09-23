"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import HomeNewsStandings from "@/components/home/HomeNewsStandings";
import HomeCompetitionStrip from "@/components/home/HomeCompetitionStrip";
import HomeMatchStrip from "@/components/home/HomeMatchStrip";
import HomeCommunity from "@/components/home/HomeCommunity";
import HomeWordlePromo from "@/components/home/HomeWordlePromo";
import HomeDonation from "@/components/home/HomeDonation";
import HomeSuggestions from "@/components/home/HomeSuggestions";
import {
  HomeSponsors,
  HomeStreamerCTA,
  HomeCreateTeamCTA,
  HomeFindTeamCTA,
} from "@/components/home/HomeActionSections";
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
      const seasonsRes = await supabase
        .from("temporadas")
        .select("nombre,numero,activa,estado")
        .order("numero", { ascending: false, nullsFirst: false });

      const seasonRows = (seasonsRes.data || []) as Array<{
        nombre?: string | null;
        activa?: boolean | null;
        estado?: string | null;
      }>;

      const currentSeason =
        seasonRows.find((row) => row.activa)?.nombre ||
        seasonRows.find(
          (row) =>
            !["borrador", "archivada"].includes(
              String(row.estado || "").toLowerCase(),
            ),
        )?.nombre ||
        seasonRows[0]?.nombre ||
        "Temporada 4";

      if (!active) return;
      setTemporada(currentSeason);

      const matchesRes = await supabase
        .from("partidos")
        .select(
          "id,partido_id,local,visitante,resultado,fecha,temporada,division,competicion,fase,grupo,dia,hora",
        )
        .eq("temporada", currentSeason);

      if (!active) return;

      const seasonMatches = ((matchesRes.data || []) as HomeMatch[]).sort(sortMatches);
      setMatches(seasonMatches);

      const teamNames = [
        ...new Set(
          seasonMatches
            .flatMap((match) => [match.local, match.visitante])
            .filter(Boolean),
        ),
      ] as string[];

      if (teamNames.length) {
        const clubsRes = await supabase
          .from("clubes_info")
          .select("nombre,logo_url")
          .in("nombre", teamNames);

        if (active) setClubs((clubsRes.data || []) as ClubInfo[]);
      }

      const matchIds = seasonMatches.map((match) =>
        String(match.partido_id || match.id),
      );

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

    return () => {
      active = false;
    };
  }, []);

  const standingsPrimera = useMemo(
    () => buildStandings(matches, "Primera"),
    [matches],
  );

  const standingsSegunda = useMemo(
    () => buildStandings(matches, "Segunda"),
    [matches],
  );

  const automaticNews = useMemo(
    () => buildAutomaticNews(matches, stats),
    [matches, stats],
  );

  const mergedNews = useMemo(() => automaticNews.slice(0, 5), [automaticNews]);

  const upcoming = useMemo(
    () => matches.filter((match) => !match.resultado).sort(sortMatches),
    [matches],
  );

  const logoEquipo = (team: string) =>
    clubs.find((club) => normalizeText(club.nombre) === normalizeText(team))
      ?.logo_url || null;

  function elementProps(id: HomeEditorElementId) {
    const elementStyle = pageDocument.elements[id];
    const forceTextColor =
      elementStyle.color !== "inherit" && Boolean(elementStyle.color);

    const selectionClass = editorMode
      ? "relative cursor-pointer " +
        (selectedElement === id
          ? "outline outline-2 outline-offset-2 outline-[#ffcc4d]"
          : "hover:outline hover:outline-1 hover:outline-offset-2 hover:outline-[#ffcc4d]/70")
      : "";

    const forceColorClass = forceTextColor
      ? "apa-editor-force-text-color"
      : "";

    return {
      "data-editor-element": id,
      onClickCapture: (event: MouseEvent<HTMLElement>) => {
        if (!editorMode) return;
        event.preventDefault();
        event.stopPropagation();
        onSelectElement?.(id);
      },
      className: (selectionClass + " " + forceColorClass).trim() || undefined,
      style: {
        ...elementInlineStyle(elementStyle, activeBreakpoint),
        ...(forceTextColor
          ? { "--apa-editor-text-color": elementStyle.color }
          : {}),
      } as CSSProperties,
    };
  }

  function shell(id: HomeSectionId, child: ReactNode) {
    const section = pageDocument.sections[id];
    if (!section.visible) return null;

    const forceTextColor =
      section.textColor !== "inherit" && Boolean(section.textColor);

    const selectionClass = editorMode
      ? "relative transition " +
        (selectedSection === id && !selectedElement
          ? "outline outline-2 outline-offset-4 outline-[#22a3ff]"
          : "hover:outline hover:outline-1 hover:outline-offset-4 hover:outline-[#22a3ff]/50")
      : "";

    const forceColorClass = forceTextColor
      ? "apa-editor-force-text-color"
      : "";

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
        className={(selectionClass + " " + forceColorClass).trim() || undefined}
        style={{
          background: section.background,
          color: section.textColor,
          ...(forceTextColor
            ? { "--apa-editor-text-color": section.textColor }
            : {}),
          borderRadius: valueForBreakpoint(section.radius, activeBreakpoint),
          paddingTop: valueForBreakpoint(section.paddingY, activeBreakpoint),
          paddingBottom: valueForBreakpoint(section.paddingY, activeBreakpoint),
          paddingLeft: valueForBreakpoint(section.paddingX, activeBreakpoint),
          paddingRight: valueForBreakpoint(section.paddingX, activeBreakpoint),
          marginTop: valueForBreakpoint(section.marginTop, activeBreakpoint),
          marginBottom: valueForBreakpoint(section.marginBottom, activeBreakpoint),
          border: section.borderWidth
            ? section.borderWidth + "px solid " + section.borderColor
            : undefined,
          boxShadow: section.shadow === "none" ? undefined : section.shadow,
        } as CSSProperties}
      >
        {editorMode ? (
          <span className="pointer-events-none absolute left-2 top-2 z-[70] rounded-md bg-[#102f55] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-lg">
            {id}
          </span>
        ) : null}

        {child}
      </div>
    );
  }

  function renderSection(id: HomeSectionId) {
    switch (id) {
      case "hero":
        return null;

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
              temporada={temporada}
              elements={pageDocument.elements}
              breakpoint={activeBreakpoint}
              editorMode={editorMode}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
            />
          </div>,
        );
      }

      case "awards":
        return null;

      case "competitions":
        return shell(
          id,
          <HomeCompetitionStrip
            editor={pageDocument.competitions}
            elements={pageDocument.elements}
            breakpoint={activeBreakpoint}
            editorMode={editorMode}
            selectedElement={selectedElement}
            onSelectElement={onSelectElement}
          />,
        );

      case "match": {
        const props = elementProps("match.content");

        return shell(
          id,
          <div {...props}>
            <HomeMatchStrip
              upcoming={upcoming}
              clubs={clubs}
              elements={pageDocument.elements}
              breakpoint={activeBreakpoint}
              editorMode={editorMode}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
            />
          </div>,
        );
      }

      case "stats":
        return null;

      case "community":
        return null;

      default:
        return null;
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: pageDocument.global.pageBackground,
        color: "#0b2747",
        fontFamily:
          "var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <style>{".apa-editor-force-text-color, .apa-editor-force-text-color * { color: var(--apa-editor-text-color) !important; } .apa-home-cta, .apa-home-cta *, .apa-home-cta:visited, .apa-home-cta:hover, .apa-home-cta:focus { color: #ffffff !important; }"}</style>

      <div
        className="mx-auto py-5 md:py-8"
        style={{
          width: "min(94vw, 1760px)",
          maxWidth: "1760px",
          display: "flex",
          flexDirection: "column",
          gap: valueForBreakpoint(
            pageDocument.global.sectionGap,
            activeBreakpoint,
          ),
        }}
      >
        {pageDocument.order.map((id) => (
          <Fragment key={id}>
            {id === "competitions" ? <HomeSponsors /> : null}
            {id === "match" ? <HomeStreamerCTA /> : null}
            {id === "community" ? <HomeCreateTeamCTA /> : null}

            {renderSection(id)}

            {id === "news" ? <HomeWordlePromo /> : null}
          </Fragment>
        ))}

        <HomeSuggestions />
        <HomeFindTeamCTA />
        <HomeDonation />
        {editorMode ? shell("community", <HomeCommunity />) : <HomeCommunity />}
      </div>
    </main>
  );
}
