"use client";

import { useEffect, useMemo, useState } from "react";
import { SQUADS_CONFIG, normalizeSquadDivision, sortSquadSeasons } from "@/config/squads";
import { supabase } from "@/lib/supabase";
import type { SquadClub, SquadPlayer, SquadPlayerView, SquadRankingRow } from "@/lib/squads/types";

function normalizeName(value?: string | null) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export function useSquads() {
  const [season, setSeason] = useState<string>(SQUADS_CONFIG.defaultSeason);
  const [division, setDivision] = useState<string>(SQUADS_CONFIG.defaultDivision);
  const [clubName, setClubName] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<SquadPlayer[]>([]);
  const [rankings, setRankings] = useState<SquadRankingRow[]>([]);
  const [clubs, setClubs] = useState<SquadClub[]>([]);
  const [allSeasons, setAllSeasons] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadSeasons() {
      const { data } = await supabase.from("plantillas").select("temporada");
      if (cancelled) return;
      const values = Array.from(new Set((data || []).map((row: any) => String(row.temporada || "")).filter(Boolean)));
      setAllSeasons(sortSquadSeasons(values));
    }
    loadSeasons();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const [playersRes, clubsRes, rankingsRes] = await Promise.all([
        supabase.from("plantillas").select("id,jugador,equipo,posicion,estado,temporada,division,playerid").eq("temporada", season),
        supabase.from("v_clubes_temporada_public").select("club_id,nombre,slug,logo_url,banner_url,descripcion,color_principal,temporada,division,activo").eq("temporada", season).eq("activo", true),
        supabase.from("v_ranking_jugadores").select("temporada,division,playerId,nombre,equipo,posicion,partidos_jugados,goals,assists,mvp,rating_apa_promedio").eq("temporada", season),
      ]);
      if (cancelled) return;
      const firstError = playersRes.error || clubsRes.error || rankingsRes.error;
      if (firstError) {
        console.error("Error cargando plantillas:", firstError);
        setError("No pudimos cargar todos los datos de plantillas.");
      }
      const divisionKey = normalizeSquadDivision(division);
      setPlayers(((playersRes.data || []) as SquadPlayer[]).filter((p) => normalizeSquadDivision(p.division) === divisionKey));
      setClubs(((clubsRes.data || []) as SquadClub[]).filter((c) => normalizeSquadDivision(c.division) === divisionKey));
      setRankings(((rankingsRes.data || []) as SquadRankingRow[]).filter((r) => normalizeSquadDivision(r.division) === divisionKey));
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [season, division]);

  useEffect(() => {
    if (clubName !== "Todos" && !clubs.some((club) => club.nombre === clubName)) setClubName("Todos");
  }, [clubs, clubName]);

  const divisions = useMemo(() => {
    const values = Array.from(new Set(clubs.map((club) => String(club.division || "")).filter(Boolean)));
    return values.length ? values : ["Primera", "Segunda"];
  }, [clubs]);

  const rankingByPlayer = useMemo(() => {
    const map = new Map<string, SquadRankingRow>();
    rankings.forEach((row) => {
      const keys = [String(row.playerId || ""), normalizeName(row.nombre)].filter(Boolean);
      keys.forEach((key) => map.set(key, row));
    });
    return map;
  }, [rankings]);

  const playerViews = useMemo<SquadPlayerView[]>(() => players.map((player) => {
    const ranking = rankingByPlayer.get(String(player.playerid || "")) || rankingByPlayer.get(normalizeName(player.jugador));
    return {
      ...player,
      playerId: String(player.playerid || ranking?.playerId || ""),
      pj: Number(ranking?.partidos_jugados || 0),
      goles: Number(ranking?.goals || 0),
      asistencias: Number(ranking?.assists || 0),
      mvps: Number(ranking?.mvp || 0),
      rating: Number(ranking?.rating_apa_promedio || 0),
    };
  }), [players, rankingByPlayer]);

  const selectedClub = useMemo(() => {
    if (clubName !== "Todos") return clubs.find((club) => club.nombre === clubName) || null;
    return clubs[0] || null;
  }, [clubName, clubs]);

  const filteredPlayers = useMemo(() => {
    const term = normalizeName(search);
    return playerViews.filter((player) => {
      if (clubName !== "Todos" && player.equipo !== clubName) return false;
      if (term && !normalizeName(player.jugador).includes(term) && !normalizeName(player.playerId).includes(term)) return false;
      return true;
    });
  }, [playerViews, clubName, search]);

  const displayedClubName = clubName === "Todos" ? selectedClub?.nombre || "Todos" : clubName;
  const displayedPlayers = clubName === "Todos"
    ? filteredPlayers.filter((player) => player.equipo === displayedClubName)
    : filteredPlayers;

  return {
    season, setSeason,
    division, setDivision,
    clubName, setClubName,
    search, setSearch,
    seasons: allSeasons.length ? allSeasons : [season],
    divisions,
    clubs,
    selectedClub,
    displayedClubName,
    players: displayedPlayers,
    loading,
    error,
  };
}
