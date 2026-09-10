"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CupClub, CupMatch } from "@/lib/cups/types";
import { buildKnockoutBracket, getKnockoutWinner, normalizeCupText } from "@/lib/cups/knockout";

type KnockoutDataConfig = {
  configTable: string;
  activationField: string;
  competitionKey: string;
  phaseKeywords: {
    roundOf16: readonly string[];
    quarter: readonly string[];
    semifinal: readonly string[];
    final: readonly string[];
    thirdPlace: readonly string[];
  };
};

/**
 * HOOK COMPARTIDO PARA COPAS DE ELIMINACIÓN DIRECTA
 * -------------------------------------------------
 * Copa Argentina y Copa APA usan la misma mecánica de datos. Este hook evita
 * duplicar consultas y lógica: cada copa solamente le pasa su configuración.
 *
 * Si cambia la estructura común de Supabase para ambas copas, modificá acá.
 * Si cambia únicamente una clave/nombre de una copa, modificá su archivo de
 * configuración (`copaArgentina.ts` o `copaApa.ts`).
 */
export function useKnockoutCup(season: string, config: KnockoutDataConfig) {
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
          .from(config.configTable)
          .select(config.activationField)
          .eq("temporada", season)
          .maybeSingle(),
        supabase
          .from("partidos")
          .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda")
          .eq("temporada", season)
          .eq("competicion", config.competitionKey)
          .order("id", { ascending: true }),
        supabase.from("clubes_info").select("nombre, logo_url, slug"),
      ]);

      if (cancelled) return;

      if (configRes.error) console.log(configRes.error);
      if (matchesRes.error) console.log(matchesRes.error);
      if (clubsRes.error) console.log(clubsRes.error);

      const configData = configRes.data as Record<string, unknown> | null;
      const isActive = Boolean(configData?.[config.activationField]);

      setActive(isActive);
      setMatches(isActive && !matchesRes.error ? ((matchesRes.data || []) as CupMatch[]) : []);
      setClubs(!clubsRes.error ? ((clubsRes.data || []) as CupClub[]) : []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [season, config]);

  const logoMap = useMemo(() => {
    const map = new Map<string, string>();
    clubs.forEach((club) => {
      if (club.logo_url) map.set(normalizeCupText(club.nombre), club.logo_url);
    });
    return map;
  }, [clubs]);

  const bracket = useMemo(
    () => buildKnockoutBracket(matches, config.phaseKeywords),
    [matches, config.phaseKeywords],
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
