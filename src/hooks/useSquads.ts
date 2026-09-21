"use client";

import { useEffect, useMemo, useState } from "react";
import { SQUADS_CONFIG, normalizeSquadDivision, sortSquadSeasons } from "@/config/squads";
import { supabase } from "@/lib/supabase";
import { usePublicSeasons } from "@/hooks/usePublicSeasons";
import type {
  SquadClub,
  SquadPlayer,
  SquadPlayerView,
  SquadPublicProfile,
  SquadRankingRow,
} from "@/lib/squads/types";

function normalizeName(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function useSquads() {
  const { seasons, activeSeason, loading: seasonsLoading } = usePublicSeasons(SQUADS_CONFIG.defaultSeason);
  const [season, setSeason] = useState<string>(SQUADS_CONFIG.defaultSeason);
  const [division, setDivision] = useState<string>(SQUADS_CONFIG.defaultDivision);
  const [clubName, setClubName] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<SquadPlayer[]>([]);
  const [rankings, setRankings] = useState<SquadRankingRow[]>([]);
  const [profiles, setProfiles] = useState<SquadPublicProfile[]>([]);
  const [clubs, setClubs] = useState<SquadClub[]>([]);
  const [seasonClubs, setSeasonClubs] = useState<SquadClub[]>([]);

  useEffect(() => {
    if (!seasonsLoading) setSeason(activeSeason);
  }, [activeSeason, seasonsLoading]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [playersRes, clubsRes, rankingsRes, profilesRes] = await Promise.all([
        supabase
          .from("plantillas")
          .select("id,jugador,equipo,posicion,estado,temporada,division,playerid,profile_id")
          .eq("temporada", season),
        supabase
          .from("v_clubes_temporada_public")
          .select("club_id,nombre,slug,logo_url,banner_url,descripcion,color_principal,temporada,division,activo")
          .eq("temporada", season)
          .eq("activo", true),
        supabase
          .from("v_ranking_jugadores")
          .select("temporada,division,playerId,nombre,equipo,posicion,partidos_jugados,goals,assists,mvp,rating_apa_promedio")
          .eq("temporada", season),
        supabase.from("public_profiles").select("id,playerid,avatar_url"),
      ]);

      if (cancelled) return;

      const firstError = playersRes.error || clubsRes.error || rankingsRes.error;
      if (firstError) {
        console.error("Error cargando plantillas:", firstError);
        setError("No pudimos cargar todos los datos de plantillas.");
      }

      // Los avatares son un dato complementario: si esta vista pública falla,
      // la plantilla sigue funcionando con el placeholder gris.
      if (profilesRes.error) {
        console.error("No se pudieron cargar avatares públicos:", profilesRes.error);
      }

      const divisionKey = normalizeSquadDivision(division);
      const activePlayers = ((playersRes.data || []) as SquadPlayer[]).filter((player) => {
        if (normalizeSquadDivision(player.division) !== divisionKey) return false;
        const status = normalizeName(player.estado);
        return status !== "baja";
      });

      const uniquePlayers = Array.from(
        activePlayers.reduce((map, player) => {
          const playerKey = String(player.playerid || "").trim();
          const fallbackKey = `${normalizeName(player.equipo)}::${normalizeName(player.jugador)}`;
          const key = playerKey || fallbackKey;
          if (!map.has(key)) map.set(key, player);
          return map;
        }, new Map<string, SquadPlayer>()).values(),
      );

      setPlayers(uniquePlayers);
      const clubsForSeason = (clubsRes.data || []) as SquadClub[];
      setSeasonClubs(clubsForSeason);
      setClubs(
        clubsForSeason.filter(
          (club) => normalizeSquadDivision(club.division) === divisionKey,
        ),
      );
      // La división define qué plantel mostramos, no qué partidos cuentan.
      // Conservamos todas las filas de ranking de la temporada para poder sumar
      // Liga + copas + playoffs del jugador con su club.
      setRankings((rankingsRes.data || []) as SquadRankingRow[]);
      setProfiles((profilesRes.data || []) as SquadPublicProfile[]);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [season, division]);

  useEffect(() => {
    if (clubName !== "Todos" && !clubs.some((club) => club.nombre === clubName)) {
      setClubName("Todos");
    }
  }, [clubs, clubName]);

  const divisions = useMemo(() => {
    const normalized = new Map<string, string>();

    seasonClubs.forEach((club) => {
      const raw = String(club.division || "").trim();
      const key = normalizeSquadDivision(raw);
      if (!raw || !key) return;

      const label =
        key === "primera" ? "Primera" :
        key === "segunda" ? "Segunda" :
        raw;

      if (!normalized.has(key)) normalized.set(key, label);
    });

    const values = Array.from(normalized.entries())
      .sort(([a], [b]) => {
        const order = ["primera", "segunda"];
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);
        if (ai !== -1 || bi !== -1) {
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        }
        return a.localeCompare(b);
      })
      .map(([, label]) => label);

    return values.length ? values : ["Primera", "Segunda"];
  }, [seasonClubs]);

  const rankingByPlayer = useMemo(() => {
    type AggregatedRanking = SquadRankingRow & {
      ratingWeightedTotal: number;
    };

    const map = new Map<string, AggregatedRanking>();

    rankings.forEach((row) => {
      const playerKey = String(row.playerId || "").trim() || normalizeName(row.nombre);
      const teamKey = normalizeName(row.equipo);
      if (!playerKey || !teamKey) return;

      const key = `${teamKey}::${playerKey}`;
      const matches = Number(row.partidos_jugados || 0);
      const rating = Number(row.rating_apa_promedio || 0);

      const current = map.get(key) || {
        ...row,
        partidos_jugados: 0,
        goals: 0,
        assists: 0,
        mvp: 0,
        rating_apa_promedio: 0,
        ratingWeightedTotal: 0,
      };

      current.partidos_jugados = Number(current.partidos_jugados || 0) + matches;
      current.goals = Number(current.goals || 0) + Number(row.goals || 0);
      current.assists = Number(current.assists || 0) + Number(row.assists || 0);
      current.mvp = Number(current.mvp || 0) + Number(row.mvp || 0);
      current.ratingWeightedTotal += rating * matches;

      if (row.nombre) current.nombre = row.nombre;
      if (row.playerId) current.playerId = row.playerId;
      if (row.equipo) current.equipo = row.equipo;
      if (row.posicion) current.posicion = row.posicion;

      map.set(key, current);
    });

    map.forEach((row) => {
      const matches = Number(row.partidos_jugados || 0);
      row.rating_apa_promedio =
        matches > 0 ? Math.round((row.ratingWeightedTotal / matches) * 100) / 100 : 0;
    });

    return map;
  }, [rankings]);

  const profileByPlayer = useMemo(() => {
    const byPlayerId = new Map<string, SquadPublicProfile>();
    const byProfileId = new Map<string, SquadPublicProfile>();

    profiles.forEach((profile) => {
      const playerId = String(profile.playerid || "").trim();
      const profileId = String(profile.id || "").trim();
      if (playerId) byPlayerId.set(playerId, profile);
      if (profileId) byProfileId.set(profileId, profile);
    });

    return { byPlayerId, byProfileId };
  }, [profiles]);

  const playerViews = useMemo<SquadPlayerView[]>(
    () =>
      players.map((player) => {
        const teamKey = normalizeName(player.equipo);
        const playerIdKey = String(player.playerid || "").trim();
        const playerNameKey = normalizeName(player.jugador);
        const ranking =
          (playerIdKey ? rankingByPlayer.get(`${teamKey}::${playerIdKey}`) : undefined) ||
          (playerNameKey ? rankingByPlayer.get(`${teamKey}::${playerNameKey}`) : undefined);
        const resolvedPlayerId = String(player.playerid || ranking?.playerId || "").trim();
        const profile =
          profileByPlayer.byPlayerId.get(resolvedPlayerId) ||
          profileByPlayer.byProfileId.get(String(player.profile_id || "").trim());

        return {
          ...player,
          playerId: resolvedPlayerId,
          avatar_url: profile?.avatar_url || null,
          pj: Number(ranking?.partidos_jugados || 0),
          goles: Number(ranking?.goals || 0),
          asistencias: Number(ranking?.assists || 0),
          mvps: Number(ranking?.mvp || 0),
          rating: Number(ranking?.rating_apa_promedio || 0),
        };
      }),
    [players, rankingByPlayer, profileByPlayer],
  );

  const selectedClub = useMemo(() => {
    if (clubName !== "Todos") {
      return clubs.find((club) => club.nombre === clubName) || null;
    }
    return clubs[0] || null;
  }, [clubName, clubs]);

  const filteredPlayers = useMemo(() => {
    const term = normalizeName(search);
    return playerViews.filter((player) => {
      if (clubName !== "Todos" && player.equipo !== clubName) return false;
      if (
        term &&
        !normalizeName(player.jugador).includes(term) &&
        !normalizeName(player.playerId).includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [playerViews, clubName, search]);

  const displayedClubName =
    clubName === "Todos" ? selectedClub?.nombre || "Todos" : clubName;
  const displayedPlayers =
    clubName === "Todos"
      ? filteredPlayers.filter((player) => player.equipo === displayedClubName)
      : filteredPlayers;

  return {
    season,
    setSeason,
    division,
    setDivision,
    clubName,
    setClubName,
    search,
    setSearch,
    seasons: sortSquadSeasons(seasons),
    divisions,
    clubs,
    selectedClub,
    displayedClubName,
    players: displayedPlayers,
    loading,
    error,
  };
}
