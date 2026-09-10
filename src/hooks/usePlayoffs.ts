"use client";

import { useEffect, useMemo, useState } from "react";
import { PLAYOFFS_CONFIG } from "@/config/playoffs";
import { supabase } from "@/lib/supabase";
import { matchFitsContext } from "@/lib/competitionData";
import type { CupClub, CupMatch } from "@/lib/cups/types";
import { buildPlayoffsRoad, normalizePlayoffText } from "@/lib/playoffs";

/**
 * Toda la lectura de datos de Playoffs vive en este hook.
 * Si algún día cambia la tabla/vista de Supabase, modificá este archivo y
 * mantené intactos page.tsx y los componentes visuales.
 */
export function usePlayoffs(season: string) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<CupMatch[]>([]);
  const [clubs, setClubs] = useState<CupClub[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const matchesRes = await supabase
        .from("partidos")
        .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda")
        .eq("temporada", season)
        .order("id", { ascending: true });

      if (cancelled) return;

      if (matchesRes.error) {
        console.error("Error cargando playoffs:", matchesRes.error);
        setMatches([]);
        setClubs([]);
        setLoading(false);
        return;
      }

      const playoffMatches = ((matchesRes.data || []) as CupMatch[]).filter((match) =>
        matchFitsContext(match, {
          temporada: season,
          competicion: PLAYOFFS_CONFIG.competitionKey,
        }),
      );

      const teamNames = Array.from(
        new Set(playoffMatches.flatMap((match) => [match.local, match.visitante]).filter(Boolean)),
      );

      let loadedClubs: CupClub[] = [];
      if (teamNames.length > 0) {
        const clubsRes = await supabase
          .from("v_clubes_temporada_public")
          .select("nombre, logo_url, slug")
          .eq("temporada", season)
          .eq("activo", true)
          .in("nombre", teamNames);

        if (clubsRes.error) console.error("Error cargando clubes de playoffs:", clubsRes.error);
        loadedClubs = !clubsRes.error ? ((clubsRes.data || []) as CupClub[]) : [];
      }

      if (cancelled) return;
      setMatches(playoffMatches);
      setClubs(loadedClubs);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [season]);

  const logoMap = useMemo(() => {
    const map = new Map<string, string>();
    clubs.forEach((club) => {
      if (club.logo_url) map.set(normalizePlayoffText(club.nombre), club.logo_url);
    });
    return map;
  }, [clubs]);

  const road = useMemo(() => buildPlayoffsRoad(matches), [matches]);

  function getLogo(name?: string | null) {
    if (!name) return null;
    return logoMap.get(normalizePlayoffText(name)) || null;
  }

  return {
    loading,
    matches,
    road,
    getLogo,
  };
}
