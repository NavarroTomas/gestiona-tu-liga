"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import FixtureCalendar from "@/components/fixture/FixtureCalendar";
import FixtureHero from "@/components/fixture/FixtureHero";
import FixtureMatchPanel from "@/components/fixture/FixtureMatchPanel";
import FixtureSidebar from "@/components/fixture/FixtureSidebar";
import {
  FIXTURE_CONFIG,
  getFixtureCompetition,
  getFixtureSeasonYear,
  type FixtureCompetitionId,
} from "@/config/fixture";
import { useFixture } from "@/hooks/useFixture";
import { getFixtureMatchDate, moveFixtureMonth, type FixtureMatch } from "@/lib/fixture";

/**
 * PÁGINA PRINCIPAL DEL FIXTURE
 * ----------------------------
 * Desktop: navegación lateral + calendario + panel derecho.
 * Mobile/tablet: hero primero, filtros compactos, agenda/calendario y detalle.
 *
 * PARA CAMBIAR COSAS VOS MISMO:
 * - temporadas/competencias/divisiones/grupos -> `src/config/fixture.ts`
 * - consultas de Supabase                    -> `src/hooks/useFixture.ts`
 * - fechas/calendario/reglas auxiliares       -> `src/lib/fixture.ts`
 * - filtros/lateral                          -> `src/components/fixture/FixtureSidebar.tsx`
 * - calendario/agenda mobile                 -> `src/components/fixture/FixtureCalendar.tsx`
 * - detalle y partidos del día               -> `src/components/fixture/FixtureMatchPanel.tsx`
 * - hero                                     -> `src/components/fixture/FixtureHero.tsx`
 */
function FixtureContent() {
  const searchParams = useSearchParams();
  const requestedSeason = searchParams.get("temporada");
  const initialSeason = FIXTURE_CONFIG.seasons.includes(requestedSeason as (typeof FIXTURE_CONFIG.seasons)[number])
    ? String(requestedSeason)
    : FIXTURE_CONFIG.defaultSeason;

  const [season, setSeason] = useState(initialSeason);
  const [competitionId, setCompetitionId] = useState<FixtureCompetitionId>(FIXTURE_CONFIG.defaultCompetition);
  const [division, setDivision] = useState("Primera");
  const [group, setGroup] = useState("A");
  const [team, setTeam] = useState("all");
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedMatch, setSelectedMatch] = useState<FixtureMatch | null>(null);

  const { loading, competition, matches, availableTeams, firstMatchDate, getLogo } = useFixture({
    season,
    competitionId,
    division,
    group,
    team,
  });

  useEffect(() => {
    if (team !== "all" && !availableTeams.includes(team)) setTeam("all");
  }, [availableTeams, team]);

  const firstMatchMonthTime = firstMatchDate
    ? new Date(firstMatchDate.getFullYear(), firstMatchDate.getMonth(), 1).getTime()
    : null;

  useEffect(() => {
    if (firstMatchMonthTime !== null) {
      setMonth((current) => current.getTime() === firstMatchMonthTime ? current : new Date(firstMatchMonthTime));
      return;
    }

    const seasonYear = getFixtureSeasonYear(season);
    const now = new Date();
    const fallbackMonthIndex = now.getFullYear() === seasonYear ? now.getMonth() : 0;
    const fallbackTime = new Date(seasonYear, fallbackMonthIndex, 1).getTime();
    setMonth((current) => current.getTime() === fallbackTime ? current : new Date(fallbackTime));
  }, [competitionId, division, firstMatchMonthTime, group, season, team]);

  useEffect(() => {
    if (!matches.length) {
      setSelectedMatch(null);
      return;
    }

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const preferred =
      matches.find((match) => {
        const date = getFixtureMatchDate(match);
        return !match.resultado && date && date.getTime() >= startToday.getTime();
      }) ||
      matches.find((match) => !match.resultado) ||
      matches[0];
    setSelectedMatch(preferred);
  }, [matches]);

  function changeCompetition(id: FixtureCompetitionId) {
    const next = getFixtureCompetition(id);
    setCompetitionId(id);
    setTeam("all");
    if (next.divisions?.length) setDivision(next.defaultDivision || next.divisions[0]);
    if (next.groups?.length) setGroup(next.defaultGroup || next.groups[0]);
  }

  function changeSeason(value: string) {
    setSeason(value);
    setTeam("all");
  }

  function changeDivision(value: string) {
    setDivision(value);
    setTeam("all");
  }

  function changeGroup(value: string) {
    setGroup(value);
    setTeam("all");
  }

  const heroSubtitle = useMemo(() => {
    if (competitionId === "liga") return `${competition.label} · ${division} División`;
    if (competitionId === "copas-oficiales") return `${competition.label} · Grupo ${group}`;
    return `${competition.label} · ${season}`;
  }, [competition.label, competitionId, division, group, season]);

  const sidebarProps = {
    competitionId,
    onCompetitionChange: changeCompetition,
    season,
    onSeasonChange: changeSeason,
    division,
    onDivisionChange: changeDivision,
    group,
    onGroupChange: changeGroup,
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f9fd] text-[#102f55]">
      <div className="mx-auto grid w-full max-w-[1680px] lg:grid-cols-[250px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <FixtureSidebar {...sidebarProps} />
        </div>

        <div className="min-w-0 bg-[linear-gradient(180deg,#f4f9fd_0%,#f9fcfe_100%)]">
          <FixtureHero subtitle={heroSubtitle} />

          <div className="lg:hidden">
            <FixtureSidebar {...sidebarProps} compact />
          </div>

          <section className="px-3 py-3 sm:px-5 sm:py-5 xl:px-7">
            {loading ? (
              <div className="flex min-h-[260px] items-center justify-center rounded-[10px] border border-[#d7e6f0] bg-white text-[12px] font-bold text-[#7890a7] sm:min-h-[420px] sm:text-sm">
                Cargando fixture…
              </div>
            ) : (
              <div className="grid min-w-0 items-stretch gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_390px] 2xl:grid-cols-[minmax(0,1fr)_410px]">
                <FixtureCalendar
                  month={month}
                  onPreviousMonth={() => setMonth((current) => moveFixtureMonth(current, -1))}
                  onNextMonth={() => setMonth((current) => moveFixtureMonth(current, 1))}
                  matches={matches}
                  selectedMatch={selectedMatch}
                  onSelectMatch={setSelectedMatch}
                  getLogo={getLogo}
                  team={team}
                  onTeamChange={setTeam}
                  teams={availableTeams}
                />

                <FixtureMatchPanel
                  selectedMatch={selectedMatch}
                  matches={matches}
                  onSelectMatch={(match) => {
                    setSelectedMatch(match);
                    const date = getFixtureMatchDate(match);
                    if (date) setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                  }}
                  getLogo={getLogo}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function FixturePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f4f9fd] text-[#102f55]"><div className="flex min-h-[320px] items-center justify-center text-sm font-bold text-[#7890a7]">Cargando fixture…</div></main>}>
      <FixtureContent />
    </Suspense>
  );
}
