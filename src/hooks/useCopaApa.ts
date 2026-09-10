"use client";

import { COPA_APA_CONFIG } from "@/config/copaApa";
import { useKnockoutCup } from "@/hooks/useKnockoutCup";

/**
 * Hook específico de Copa APA.
 * La lógica compartida vive en `useKnockoutCup.ts`; este archivo solo conecta
 * la configuración de Copa APA con esa lógica común.
 */
export function useCopaApa(season: string) {
  return useKnockoutCup(season, COPA_APA_CONFIG);
}
