"use client";

import { COPA_ARGENTINA_CONFIG } from "@/config/copaArgentina";
import { useKnockoutCup } from "@/hooks/useKnockoutCup";

/**
 * Hook específico de Copa Argentina.
 * La lectura y armado común de copas vive en `useKnockoutCup.ts`; este wrapper
 * mantiene una API clara para la página de Copa Argentina.
 */
export function useCopaArgentina(season: string) {
  return useKnockoutCup(season, COPA_ARGENTINA_CONFIG);
}
