"use client";

import PremiosFilters from "@/components/premios/PremiosFilters";
import PremiosGrid from "@/components/premios/PremiosGrid";
import PremiosHero from "@/components/premios/PremiosHero";
import PremiosTop from "@/components/premios/PremiosTop";
import { usePremios } from "@/hooks/usePremios";

/**
 * Ensamblador de /entretenimiento/premios.
 *
 * Arquitectura:
 * - estado, consultas y cálculo de premios: src/hooks/usePremios.ts
 * - filtros: src/components/premios/PremiosFilters.tsx
 * - hero/resumen: src/components/premios/PremiosHero.tsx
 * - premios destacados: src/components/premios/PremiosGrid.tsx
 * - top rendimiento: src/components/premios/PremiosTop.tsx
 *
 * Esta página no contiene consultas directas a Supabase ni reglas de negocio.
 */
export default function PremiosPage() {
  const premios = usePremios();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f3fafe_0%,#edf7fc_58%,#f7fbfe_100%)] text-[#102f55]">
      <div className="mx-auto max-w-[1680px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <PremiosHero controller={premios} />
        <PremiosFilters controller={premios} />

        {premios.cargando ? (
          <section className="rounded-2xl border border-[#c9e3f1] bg-white p-10 text-center text-sm font-black uppercase tracking-[0.18em] text-[#2d98d4]">
            Cargando premios...
          </section>
        ) : premios.jugadores.length === 0 ? (
          <section className="rounded-2xl border border-[#c9e3f1] bg-white p-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2d98d4]">Sin datos</p>
            <h2 className="mt-3 text-3xl font-black uppercase text-[#102f55]">No hay estadísticas en esta fecha</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#607b90]">
              Cuando se carguen las estadísticas oficiales de esta jornada, los premios aparecerán automáticamente.
            </p>
          </section>
        ) : (
          <>
            <PremiosGrid controller={premios} />
            <PremiosTop controller={premios} />
          </>
        )}
      </div>
    </main>
  );
}
