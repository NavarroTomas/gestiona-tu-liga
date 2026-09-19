"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CupClub, CupMatch } from "@/lib/cups/types";
import { buildKnockoutBracket, getKnockoutWinner, normalizeCupText } from "@/lib/cups/knockout";

type KnockoutDataConfig = {
  /**
   * Algunas copas tienen un flag de activación en `configuracion_copas` y
   * otras no. Si estos dos campos se omiten, la competición se considera activa.
   */
  configTable?: string;
  activationField?: string;
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
 * Copa Argentina, Copa APA y Copa de Campeones comparten esta mecánica.
 * Cada competición solamente aporta su configuración.
 *
 * Si una copa usa un flag de activación, pasá `configTable` + `activationField`.
 * Si no usa flag, omitilos y el hook consulta directamente sus partidos.
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
      let isActive = true;

      // Fuente principal: la configuración moderna por temporada.
      const competitionConfigRes = await supabase
        .from("competicion_config")
        .select("activa,reglas")
        .eq("temporada", season)
        .eq("slug", config.competitionKey)
        .maybeSingle();

      if (cancelled) return;

      if (!competitionConfigRes.error && competitionConfigRes.data) {
        isActive = competitionConfigRes.data.activa !== false;
      } else if (config.configTable && config.activationField) {
        // Compatibilidad histórica para temporadas creadas antes del nuevo sistema.
        const legacyConfigRes = await supabase
          .from(config.configTable)
          .select(config.activationField)
          .eq("temporada", season)
          .maybeSingle();

        if (cancelled) return;
        if (legacyConfigRes.error) console.log(legacyConfigRes.error);

        const configData = legacyConfigRes.data as Record<string, unknown> | null;
        isActive = Boolean(configData?.[config.activationField]);
      }

      if (!isActive) {
        setActive(false);
        setMatches([]);
        setClubs([]);
        setLoading(false);
        return;
      }

      const [matchesRes, clubsRes] = await Promise.all([
        supabase
          .from("partidos")
          .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda")
          .eq("temporada", season)
          .eq("competicion", config.competitionKey)
          .order("id", { ascending: true }),
        supabase.from("clubes_info").select("nombre, logo_url, slug"),
      ]);

      if (cancelled) return;

      if (matchesRes.error) console.log(matchesRes.error);
      if (clubsRes.error) console.log(clubsRes.error);

      setActive(true);
      setMatches(!matchesRes.error ? ((matchesRes.data || []) as CupMatch[]) : []);
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
