"use client";

import { COPA_CAMPEONES_CONFIG } from "@/config/copaCampeones";
import { useKnockoutCup } from "@/hooks/useKnockoutCup";

/**
 * Copa de Campeones reutiliza el hook común de copas knockout.
 * No tiene flag de activación propio: consulta directamente sus partidos.
 */
export function useCopaCampeones(season: string) {
  return useKnockoutCup(season, COPA_CAMPEONES_CONFIG);
}
