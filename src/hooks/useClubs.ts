"use client";

import { useEffect, useMemo, useState } from "react";
import { CLUBS_CONFIG, clubDivisionLabel, sortClubDivisions, sortClubSeasons } from "@/config/clubs";
import { buildClubsViewModel } from "@/lib/clubs";
import type { ClubPlayerRow, ClubRecord } from "@/lib/clubs/types";
import type { ClubTitleRow } from "@/components/clubs/ClubsHonours";
import type { FixtureMatch } from "@/lib/fixture";
import type { LeagueSanction } from "@/lib/league/types";
import { supabase } from "@/lib/supabase";
import { usePublicSeasons } from "@/hooks/usePublicSeasons";

export function useClubs() {
  const { seasons: publicSeasons, activeSeason, loading: seasonsLoading } = usePublicSeasons(CLUBS_CONFIG.defaultSeason);
  const [season, setSeason] = useState<string>(CLUBS_CONFIG.defaultSeason);
  const [division, setDivision] = useState<string>(CLUBS_CONFIG.defaultDivision);
  const [catalog, setCatalog] = useState<ClubRecord[]>([]);
  const [clubs, setClubs] = useState<ClubRecord[]>([]);
  const [matches, setMatches] = useState<FixtureMatch[]>([]);
  const [sanctions, setSanctions] = useState<LeagueSanction[]>([]);
  const [players, setPlayers] = useState<ClubPlayerRow[]>([]);
  const [titles, setTitles] = useState<ClubTitleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      const [catalogResult, titlesResult] = await Promise.all([
        supabase
          .from("v_clubes_temporada_public")
          .select("club_id, nombre, slug, logo_url, division, temporada, activo, color_principal")
          .eq("activo", true)
          .order("temporada", { ascending: true })
          .order("nombre", { ascending: true }),
        supabase
          .from("titulos")
          .select("id,equipo,competicion,temporada,division")
          .order("temporada", { ascending: false }),
      ]);

      if (cancelled) return;
      if (catalogResult.error) {
        console.error("Error cargando catálogo de clubes:", catalogResult.error);
        setError("No pudimos cargar el catálogo completo de clubes.");
        return;
      }
      if (titlesResult.error) {
        console.error("Error cargando palmarés de clubes:", titlesResult.error);
      }

      setCatalog((catalogResult.data || []) as ClubRecord[]);
      setTitles((titlesResult.data || []) as ClubTitleRow[]);
    }

    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const seasons = useMemo(
    () => sortClubSeasons(publicSeasons),
    [publicSeasons],
  );

  useEffect(() => {
    if (!seasonsLoading) setSeason(activeSeason);
  }, [activeSeason, seasonsLoading]);

  const divisions = useMemo(() => {
    const values = Array.from(
      new Set(
        catalog
          .filter((club) => club.temporada === season)
          .map((club) => clubDivisionLabel(String(club.division || "")))
          .filter(Boolean),
      ),
    );
    return sortClubDivisions(values.length ? values : [CLUBS_CONFIG.defaultDivision]);
  }, [catalog, season]);

  useEffect(() => {
    if (divisions.length === 0 || divisions.includes(division)) return;
    setDivision(divisions[0]);
  }, [divisions, division]);

  useEffect(() => {
    let cancelled = false;

    async function loadSeason() {
      setLoading(true);
      setError(null);

      const [clubsResult, matchesResult, sanctionsResult, playersResult] = await Promise.all([
        supabase
          .from("v_clubes_temporada_public")
          .select("club_id, nombre, slug, logo_url, division, temporada, activo, color_principal")
          .eq("temporada", season)
          .eq("activo", true)
          .order("nombre", { ascending: true }),
        supabase
          .from("partidos")
          .select(
            "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda",
          )
          .eq("temporada", season)
          .order("id", { ascending: true }),
        supabase
          .from("sanciones_equipos")
          .select("equipo, puntos_descontados, competicion")
          .eq("temporada", season)
          .eq("competicion", "liga"),
        supabase
          .from("v_ranking_jugadores")
          .select("playerId, nombre, equipo, division, temporada")
          .eq("temporada", season),
      ]);

      if (cancelled) return;

      const firstError =
        clubsResult.error || matchesResult.error || sanctionsResult.error || playersResult.error;
      if (firstError) {
        console.error("Error cargando Clubes:", firstError);
        setError("No pudimos cargar todos los datos de clubes.");
      }

      setClubs((clubsResult.data || []) as ClubRecord[]);
      setMatches((matchesResult.data || []) as FixtureMatch[]);
      setSanctions((sanctionsResult.data || []) as LeagueSanction[]);
      setPlayers((playersResult.data || []) as ClubPlayerRow[]);
      setLoading(false);
    }

    loadSeason();
    return () => {
      cancelled = true;
    };
  }, [season]);

  const view = useMemo(
    () => buildClubsViewModel({ matches, clubs, sanctions, players, division }),
    [matches, clubs, sanctions, players, division],
  );

  const divisionClubs = useMemo(
    () => clubs.filter((club) => clubDivisionLabel(String(club.division || "")) === division),
    [clubs, division],
  );

  return {
    season,
    setSeason,
    seasons,
    division,
    setDivision,
    divisions,
    loading,
    error,
    clubs,
    divisionClubs,
    titles,
    ...view,
  };
}
