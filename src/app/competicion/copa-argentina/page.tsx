"use client";

import { useState } from "react";
import KnockoutBracket from "@/components/cups/knockout/KnockoutBracket";
import KnockoutCupHero from "@/components/cups/knockout/KnockoutCupHero";
import KnockoutCupTabs from "@/components/cups/knockout/KnockoutCupTabs";
import LeagueFooter from "@/components/league/LeagueFooter";
import { COPA_ARGENTINA_CONFIG } from "@/config/copaArgentina";
import { useCopaArgentina } from "@/hooks/useCopaArgentina";

/**
 * PÁGINA COPA ARGENTINA
 * ---------------------
 * Esta página solo compone módulos.
 *
 * Si querés cambiar algo vos mismo:
 * - temporadas, textos, fondo y fases -> `src/config/copaArgentina.ts`
 * - datos/consultas de Supabase       -> `src/hooks/useCopaArgentina.ts`
 * - armado lógico de rondas           -> `src/lib/cups/knockout.ts`
 * - aspecto del cuadro                -> `src/components/cups/knockout/KnockoutBracket.tsx`
 *
 * No hace falta agregar lógica nueva a este page.tsx para cambios normales.
 */
export default function CopaArgentinaPage() {
  const [season, setSeason] = useState<string>(COPA_ARGENTINA_CONFIG.defaultSeason);
  const { active, loading, bracket, getLogo } = useCopaArgentina(season);

  return (
    <main className="min-h-screen bg-[#f4f9fd] text-[#102f55]">
      <KnockoutCupHero season={season} />
      <KnockoutCupTabs season={season} onSeasonChange={setSeason} />

      <section className="mx-auto w-full max-w-[1480px] px-5 py-4 sm:px-8 sm:py-5 lg:px-12">
        {loading ? (
          <section className="rounded-[10px] border border-[#d7e6f0] bg-white px-5 py-14 text-center text-sm font-semibold text-[#7890a7]">
            Cargando cuadro de Copa Argentina…
          </section>
        ) : !active ? (
          <section className="rounded-[10px] border border-[#d7e6f0] bg-white px-5 py-12 text-center">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#56afe2]">Competición pendiente</p>
            <h2 className="mt-2 text-[24px] font-black uppercase tracking-[-.035em] text-[#102f55]">Copa Argentina todavía no está activa</h2>
            <p className="mx-auto mt-2 max-w-[640px] text-[12px] font-semibold leading-5 text-[#6a839b]">
              Cuando la habilites para {season} y cargues los cruces en Supabase, este cuadro se completa automáticamente.
            </p>
          </section>
        ) : (
          <KnockoutBracket
            bracket={bracket}
            getLogo={getLogo}
            showThirdPlace={COPA_ARGENTINA_CONFIG.showThirdPlace}
          />
        )}
      </section>

      <LeagueFooter />
    </main>
  );
}
