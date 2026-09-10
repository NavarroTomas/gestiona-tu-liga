"use client";

import { useEffect, useMemo, useState } from "react";
import { getFixtureCompetition, type FixtureCompetitionId } from "@/config/fixture";
import { matchFitsContext } from "@/lib/competitionData";
import {
  getFixtureMatchDate,
  normalizeFixtureText,
  sortFixtureMatches,
  type FixtureMatch,
} from "@/lib/fixture";
import { supabase } from "@/lib/supabase";

type FixtureClub = {
  nombre: string;
  logo_url?: string | null;
  slug?: string | null;
  division?: string | null;
};

/**
 * CAPA DE DATOS DEL FIXTURE
 * -------------------------
 * Toda la lectura de Supabase de /fixture vive acá.
 * Los componentes visuales reciben datos ya filtrados y no consultan la BD.
 *
 * Si mañana cambia la tabla `partidos` o la vista de clubes, este es el
 * archivo que deberías revisar. Para agregar competiciones/temporadas usá
 * `src/config/fixture.ts`.
 */
export function useFixture({
  season,
  competitionId,
  division,
  group,
  team,
}: {
  season: string;
  competitionId: FixtureCompetitionId;
  division?: string;
  group?: string;
  team: string;
}) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<FixtureMatch[]>([]);
  const [clubs, setClubs] = useState<FixtureClub[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const [matchesRes, clubsRes] = await Promise.all([
        supabase
          .from("partidos")
          .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda")
          .eq("temporada", season)
          .order("id", { ascending: true }),
        supabase
          .from("v_clubes_temporada_public")
          .select("nombre, logo_url, slug, division")
          .eq("temporada", season)
          .eq("activo", true),
      ]);

      if (cancelled) return;

      if (matchesRes.error) console.error("Error cargando fixture:", matchesRes.error);
      if (clubsRes.error) console.error("Error cargando clubes del fixture:", clubsRes.error);

      setMatches(!matchesRes.error ? ((matchesRes.data || []) as FixtureMatch[]) : []);
      setClubs(!clubsRes.error ? ((clubsRes.data || []) as FixtureClub[]) : []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [season]);

  const competition = getFixtureCompetition(competitionId);

  const competitionMatches = useMemo(() => {
    const context =
      competitionId === "liga"
        ? {
            temporada: season,
            competicion: competition.competitionKey,
            division: String(division || competition.defaultDivision || "Primera").toLowerCase(),
          }
        : competitionId === "copas-oficiales"
          ? {
              temporada: season,
              competicion: competition.competitionKey,
              grupo: group || competition.defaultGroup || "A",
            }
          : {
              temporada: season,
              competicion: competition.competitionKey,
            };

    return sortFixtureMatches(
      matches.filter((match) => matchFitsContext(match, context)),
    );
  }, [competition, competitionId, division, group, matches, season]);

  const availableTeams = useMemo(() => {
    return Array.from(
      new Set(
        competitionMatches
          .flatMap((match) => [match.local, match.visitante])
          .filter((name): name is string => Boolean(name)),
      ),
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, [competitionMatches]);

  const visibleMatches = useMemo(() => {
    if (team === "all") return competitionMatches;
    const normalizedTeam = normalizeFixtureText(team);
    return competitionMatches.filter(
      (match) =>
        normalizeFixtureText(match.local) === normalizedTeam ||
        normalizeFixtureText(match.visitante) === normalizedTeam,
    );
  }, [competitionMatches, team]);

  const logoMap = useMemo(() => {
    const map = new Map<string, string>();
    clubs.forEach((club) => {
      if (club.logo_url) map.set(normalizeFixtureText(club.nombre), club.logo_url);
    });
    return map;
  }, [clubs]);

  const firstDatedMatch = visibleMatches.find((match) => getFixtureMatchDate(match));
  const firstMatchDate = firstDatedMatch ? getFixtureMatchDate(firstDatedMatch) : null;

  function getLogo(name?: string | null) {
    if (!name) return null;
    return logoMap.get(normalizeFixtureText(name)) || null;
  }

  return {
    loading,
    competition,
    matches: visibleMatches,
    competitionMatches,
    availableTeams,
    firstMatchDate,
    getLogo,
  };
}
