"use client";

import { useEffect, useMemo, useState } from "react";
import { COPA_ARGENTINA_CONFIG } from "@/config/copaArgentina";
import { supabase } from "@/lib/supabase";
import type { CupClub, CupMatch } from "@/lib/cups/types";
import { buildKnockoutBracket, getKnockoutWinner, normalizeCupText } from "@/lib/cups/knockout";

/**
 * Toda la lectura de Supabase de Copa Argentina vive acá.
 * Si alguna vez cambia una tabla, columna o filtro de la base de datos,
 * modificá este hook y mantené los componentes visuales intactos.
 */
export function useCopaArgentina(season: string) {
  const [active, setActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<CupMatch[]>([]);
  const [clubs, setClubs] = useState<CupClub[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const [configRes, matchesRes, clubsRes] = await Promise.all([
        supabase
          .from(COPA_ARGENTINA_CONFIG.configTable)
          .select(COPA_ARGENTINA_CONFIG.activationField)
          .eq("temporada", season)
          .maybeSingle(),
        supabase
          .from("partidos")
          .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda")
          .eq("temporada", season)
          .eq("competicion", COPA_ARGENTINA_CONFIG.competitionKey)
          .order("id", { ascending: true }),
        supabase.from("clubes_info").select("nombre, logo_url, slug"),
      ]);

      if (cancelled) return;

      if (configRes.error) console.log(configRes.error);
      if (matchesRes.error) console.log(matchesRes.error);
      if (clubsRes.error) console.log(clubsRes.error);

      const configData = configRes.data as Record<string, unknown> | null;
      const isActive = Boolean(configData?.[COPA_ARGENTINA_CONFIG.activationField]);

      setActive(isActive);
      setMatches(isActive && !matchesRes.error ? ((matchesRes.data || []) as CupMatch[]) : []);
      setClubs(!clubsRes.error ? ((clubsRes.data || []) as CupClub[]) : []);
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
      if (club.logo_url) map.set(normalizeCupText(club.nombre), club.logo_url);
    });
    return map;
  }, [clubs]);

  const bracket = useMemo(
    () => buildKnockoutBracket(matches, COPA_ARGENTINA_CONFIG.phaseKeywords),
    [matches],
  );

  const champion = getKnockoutWinner(bracket.final);

  function getLogo(name?: string | null) {
    if (!name) return null;
    return logoMap.get(normalizeCupText(name)) || null;
  }

  return {
    active,
    loading,
    matches,
    bracket,
    champion,
    getLogo,
  };
}
