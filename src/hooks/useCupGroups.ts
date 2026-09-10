"use client";

import { useEffect, useMemo, useState } from "react";
import { CUPS_CONFIG } from "@/config/cups";
import { calculateCupGroupStandings } from "@/lib/cups/calculateGroupStandings";
import type { CupClub, CupMatch, CupSanction } from "@/lib/cups/types";
import { hasCupResult, normalizeCupText } from "@/lib/cups/utils";
import { supabase } from "@/lib/supabase";

/**
 * Hook único de datos para Clasificación a Copas.
 *
 * Si mañana cambiás el diseño, no deberías tocar este archivo.
 * Si cambia de dónde salen los datos (otra vista/tabla/campos de Supabase),
 * este es el lugar indicado para modificar la consulta.
 */
export function useCupGroups(season: string, selectedGroup: string) {
  const [matches, setMatches] = useState<CupMatch[]>([]);
  const [clubs, setClubs] = useState<CupClub[]>([]);
  const [sanctions, setSanctions] = useState<CupSanction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const [matchesRes, clubsRes, sanctionsRes] = await Promise.all([
        supabase
          .from("partidos")
          .select(
            "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda",
          )
          .eq("temporada", season)
          .eq("competicion", CUPS_CONFIG.competitionKey)
          .eq("fase", CUPS_CONFIG.phaseKey)
          .order("grupo", { ascending: true })
          .order("fecha", { ascending: true }),
        supabase
          .from("v_clubes_temporada_public")
          .select("nombre, slug, logo_url")
          .eq("temporada", season)
          .eq("activo", true),
        supabase
          .from("sanciones_equipos")
          .select("id, temporada, competicion, equipo, puntos_descontados, motivo")
          .eq("temporada", season)
          .eq("competicion", CUPS_CONFIG.competitionKey),
      ]);

      if (!active) return;

      if (matchesRes.error) console.log(matchesRes.error);
      if (clubsRes.error) console.log(clubsRes.error);
      if (sanctionsRes.error) console.log(sanctionsRes.error);

      setMatches((matchesRes.data || []) as CupMatch[]);
      setClubs((clubsRes.data || []) as CupClub[]);
      setSanctions((sanctionsRes.data || []) as CupSanction[]);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [season]);

  const clubMap = useMemo(() => {
    const map = new Map<string, CupClub>();
    clubs.forEach((club) => map.set(normalizeCupText(club.nombre), club));
    return map;
  }, [clubs]);

  const groupMatches = useMemo(
    () =>
      matches.filter(
        (match) => normalizeCupText(match.grupo) === normalizeCupText(selectedGroup),
      ),
    [matches, selectedGroup],
  );

  const standings = useMemo(
    () => calculateCupGroupStandings(matches, selectedGroup, sanctions),
    [matches, sanctions, selectedGroup],
  );

  const pendingMatches = useMemo(
    () => groupMatches.filter((match) => !hasCupResult(match)),
    [groupMatches],
  );

  const nextMatch = pendingMatches[0] || null;

  /**
   * Para el panel derecho mostramos la misma "fecha" que el próximo partido.
   * Si `dia` no está cargado en Supabase, mostramos hasta cinco pendientes.
   */
  const nextMatchdayMatches = useMemo(() => {
    if (!nextMatch) return [];
    if (!nextMatch.dia) return pendingMatches.slice(0, 5);
    return pendingMatches.filter((match) => match.dia === nextMatch.dia).slice(0, 5);
  }, [nextMatch, pendingMatches]);

  function getClub(name?: string | null) {
    if (!name) return undefined;
    return clubMap.get(normalizeCupText(name));
  }

  function getLogo(name?: string | null) {
    return getClub(name)?.logo_url || null;
  }

  return {
    loading,
    standings,
    groupMatches,
    pendingMatches,
    nextMatch,
    nextMatchdayMatches,
    getClub,
    getLogo,
  };
}
