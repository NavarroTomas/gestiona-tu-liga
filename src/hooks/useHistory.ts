"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HISTORY_CONFIG, sortSeasons } from "@/config/history";
import { supabase } from "@/lib/supabase";
import {
  aggregatePlayers,
  buildAwards,
  buildHistoricalRecords,
  buildLeagueTables,
  buildSeasonRecords,
  competitionSummary,
  highlightedStats,
  seasonSummary,
  type HistoryAwardRow,
  type HistoryClub,
  type HistoryMatch,
  type HistoryPlayerRow,
  type HistorySanction,
} from "@/lib/history";

/**
 * Fuente única de datos de /historia.
 *
 * La página no conoce Supabase ni hace cálculos: este hook detecta temporadas,
 * carga la temporada activa y el historial global, y devuelve el view-model ya
 * preparado para los componentes visuales.
 */
export function useHistory(initialSeason: string = HISTORY_CONFIG.defaultSeason) {
  const [season, setSeason] = useState<string>(initialSeason);
  const initializedSeason = useRef(false);

  const [loading, setLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [seasonError, setSeasonError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [seasonMatches, setSeasonMatches] = useState<HistoryMatch[]>([]);
  const [clubs, setClubs] = useState<HistoryClub[]>([]);
  const [seasonPlayers, setSeasonPlayers] = useState<HistoryPlayerRow[]>([]);
  const [seasonAwards, setSeasonAwards] = useState<HistoryAwardRow[]>([]);
  const [seasonSanctions, setSeasonSanctions] = useState<HistorySanction[]>([]);

  const [allMatches, setAllMatches] = useState<HistoryMatch[]>([]);
  const [allPlayers, setAllPlayers] = useState<HistoryPlayerRow[]>([]);
  const [allSanctions, setAllSanctions] = useState<HistorySanction[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadGlobalHistory() {
      setGlobalLoading(true);
      setGlobalError(null);

      const [matchesResult, playersResult, sanctionsResult] = await Promise.all([
        supabase
          .from("partidos")
          .select(
            "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda, orden, llave, estado",
          )
          .order("id", { ascending: true }),
        supabase
          .from("v_ranking_jugadores")
          .select(
            "temporada, division, playerId, nombre, equipo, posicion, partidos_jugados, goals, assists, mvp, gKSaves, rating_apa_promedio, score_total",
          ),
        supabase
          .from("sanciones_equipos")
          .select("temporada, equipo, puntos_descontados, competicion"),
      ]);

      if (cancelled) return;

      const firstError = matchesResult.error || playersResult.error || sanctionsResult.error;
      if (firstError) {
        console.error("Error cargando historial global:", firstError);
        setGlobalError("No pudimos cargar todos los registros históricos.");
      }

      setAllMatches((matchesResult.data || []) as HistoryMatch[]);
      setAllPlayers((playersResult.data || []) as HistoryPlayerRow[]);
      setAllSanctions((sanctionsResult.data || []) as HistorySanction[]);
      setGlobalLoading(false);
    }

    loadGlobalHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSeason() {
      setLoading(true);
      setSeasonError(null);

      const [matchesResult, clubsResult, playersResult, awardsResult, sanctionsResult] =
        await Promise.all([
          supabase
            .from("partidos")
            .select(
              "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda, orden, llave, estado",
            )
            .eq("temporada", season)
            .order("id", { ascending: true }),
          supabase
            .from("v_clubes_temporada_public")
            .select("nombre, slug, logo_url, division, temporada, activo")
            .eq("temporada", season)
            .eq("activo", true),
          supabase
            .from("v_ranking_jugadores")
            .select(
              "temporada, division, playerId, nombre, equipo, posicion, partidos_jugados, goals, assists, mvp, gKSaves, rating_apa_promedio, score_total",
            )
            .eq("temporada", season),
          supabase
            .from("premios_apa")
            .select("temporada, division, premio, playerid, nombre, equipo, puntos, posicion")
            .eq("temporada", season)
            .order("posicion", { ascending: true, nullsFirst: false }),
          supabase
            .from("sanciones_equipos")
            .select("temporada, equipo, puntos_descontados, competicion")
            .eq("temporada", season),
        ]);

      if (cancelled) return;

      const firstError =
        matchesResult.error ||
        clubsResult.error ||
        playersResult.error ||
        awardsResult.error ||
        sanctionsResult.error;

      if (firstError) {
        console.error("Error cargando temporada histórica:", firstError);
        setSeasonError("No pudimos cargar todos los datos de esta temporada.");
      }

      setSeasonMatches((matchesResult.data || []) as HistoryMatch[]);
      setClubs((clubsResult.data || []) as HistoryClub[]);
      setSeasonPlayers((playersResult.data || []) as HistoryPlayerRow[]);
      setSeasonAwards((awardsResult.data || []) as HistoryAwardRow[]);
      setSeasonSanctions((sanctionsResult.data || []) as HistorySanction[]);
      setLoading(false);
    }

    loadSeason();
    return () => {
      cancelled = true;
    };
  }, [season]);

  const seasons = useMemo(() => {
    const values = Array.from(
      new Set(allMatches.map((match) => String(match.temporada || "")).filter(Boolean)),
    );
    return sortSeasons(values);
  }, [allMatches]);

  // La temporada más nueva disponible pasa a ser la activa automáticamente.
  useEffect(() => {
    if (initializedSeason.current || seasons.length === 0) return;
    initializedSeason.current = true;
    setSeason(seasons[seasons.length - 1]);
  }, [seasons]);

  const players = useMemo(() => aggregatePlayers(seasonPlayers), [seasonPlayers]);
  const historicalPlayers = useMemo(() => aggregatePlayers(allPlayers), [allPlayers]);

  const tables = useMemo(
    () =>
      buildLeagueTables({
        matches: seasonMatches,
        clubs,
        sanctions: seasonSanctions,
      }),
    [seasonMatches, clubs, seasonSanctions],
  );

  const summary = useMemo(() => seasonSummary(seasonMatches, clubs), [seasonMatches, clubs]);
  const highlighted = useMemo(() => highlightedStats(tables, players), [tables, players]);
  const competitions = useMemo(
    () => competitionSummary(seasonMatches, tables),
    [seasonMatches, tables],
  );
  const awards = useMemo(() => buildAwards(seasonAwards, players), [seasonAwards, players]);
  const seasonRecords = useMemo(
    () => buildSeasonRecords(seasonMatches, players),
    [seasonMatches, players],
  );
  const historicalRecords = useMemo(
    () =>
      buildHistoricalRecords({
        allMatches,
        allPlayers: historicalPlayers,
        allSanctions,
      }),
    [allMatches, historicalPlayers, allSanctions],
  );

  const highlights = useMemo(
    () => [
      {
        label: "Máximo goleador",
        value: highlighted.scorer?.goles ?? 0,
        unit: "goles",
        person: highlighted.scorer?.nombre || "Sin datos",
        team: highlighted.scorer?.equipo || "",
      },
      {
        label: "Más asistencias",
        value: highlighted.assists?.asistencias ?? 0,
        unit: "asistencias",
        person: highlighted.assists?.nombre || "Sin datos",
        team: highlighted.assists?.equipo || "",
      },
      {
        label: "Más MVP",
        value: highlighted.mvp?.mvps ?? 0,
        unit: "MVP",
        person: highlighted.mvp?.nombre || "Sin datos",
        team: highlighted.mvp?.equipo || "",
      },
      {
        label: "Mejor ataque",
        value: highlighted.attack?.gf ?? 0,
        unit: "goles",
        person: highlighted.attack?.nombre || "Sin datos",
        team: highlighted.attack?.nombre || "",
      },
      {
        label: "Mejor defensa",
        value: highlighted.defense?.gc ?? 0,
        unit: "goles recibidos",
        person: highlighted.defense?.nombre || "Sin datos",
        team: highlighted.defense?.nombre || "",
      },
    ],
    [highlighted],
  );

  const champions = useMemo(
    () => [
      { division: "Primera División", team: tables.primera[0]?.nombre || "Por definir" },
      { division: "Segunda División", team: tables.segunda[0]?.nombre || "Por definir" },
    ],
    [tables],
  );

  return {
    season,
    setSeason,
    seasons,
    loading,
    globalLoading,
    error: seasonError || globalError,
    clubs,
    summary,
    tables,
    highlights,
    champions,
    competitions,
    awards,
    seasonRecords,
    historicalRecords,
  };
}
