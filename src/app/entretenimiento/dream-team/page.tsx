"use client";

import DreamTeamFilters from "@/components/dream-team/DreamTeamFilters";
import DreamTeamFormation from "@/components/dream-team/DreamTeamFormation";
import DreamTeamHero from "@/components/dream-team/DreamTeamHero";
import DreamTeamSidebar from "@/components/dream-team/DreamTeamSidebar";
import { useDreamTeam } from "@/hooks/useDreamTeam";

/**
 * Ensamblador de la pantalla Dream Team.
 *
 * - Configuración editable: `src/config/dreamTeam.ts`
 * - Estado y acciones: `src/hooks/useDreamTeam.ts`
 * - Acceso a Supabase: `src/lib/dream-team/api.ts`
 * - Cálculos puros: `src/lib/dream-team/utils.ts`
 * - UI: `src/components/dream-team/*`
 *
 * La página no contiene reglas de negocio ni consultas a la base de datos.
 */
export default function DreamTeamPage() {
  const dreamTeam = useDreamTeam();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <DreamTeamHero
          fecha={dreamTeam.fecha}
          usuarioId={dreamTeam.usuarioId}
          miPerfil={dreamTeam.miPerfil}
          temporada={dreamTeam.temporada}
          competicionLabel={dreamTeam.competicionLabel}
          contextoLabel={dreamTeam.contextoLabel}
        />

        <DreamTeamFilters
          temporada={dreamTeam.temporada}
          temporadas={dreamTeam.temporadas}
          setTemporada={dreamTeam.setTemporada}
          competicion={dreamTeam.competicion}
          setCompetition={dreamTeam.setCompetition}
          division={dreamTeam.division}
          setDivisionFilter={dreamTeam.setDivisionFilter}
          grupo={dreamTeam.grupo}
          setGroupFilter={dreamTeam.setGroupFilter}
          fase={dreamTeam.fase}
          setPhaseFilter={dreamTeam.setPhaseFilter}
          fecha={dreamTeam.fecha}
          setFecha={dreamTeam.setFecha}
          fechas={dreamTeam.fechas}
          fasesDisponibles={dreamTeam.fasesDisponibles}
        />

        {dreamTeam.mensaje && (
          <section className="rounded-3xl border border-sky-500/20 bg-black/35 p-5 text-center font-black text-sky-300">
            {dreamTeam.mensaje}
          </section>
        )}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-8">
          <DreamTeamFormation
            fecha={dreamTeam.fecha}
            plantillaActual={dreamTeam.plantillaActual}
            votosPorPosicion={dreamTeam.votosPorPosicion}
            votingWindow={dreamTeam.votingWindow}
            perfilesJugadores={dreamTeam.perfilesJugadores}
            setPosicionActiva={dreamTeam.setPosicionActiva}
            puedeEditar={dreamTeam.puedeEditar}
          />

          <DreamTeamSidebar
            jugadorMasVotado={dreamTeam.jugadorMasVotado}
            plantillaActual={dreamTeam.plantillaActual}
            perfilesJugadores={dreamTeam.perfilesJugadores}
            compartir={dreamTeam.compartir}
            posicionActiva={dreamTeam.posicionActiva}
            topPorPosicion={dreamTeam.topPorPosicion}
            candidatos={dreamTeam.candidatos}
            seleccionarJugador={dreamTeam.seleccionarJugador}
            enviarPlantilla={dreamTeam.enviarPlantilla}
            plantillaCompleta={dreamTeam.plantillaCompleta}
            plantillaEnviada={dreamTeam.plantillaEnviada}
            votingWindow={dreamTeam.votingWindow}
            puedeEditar={dreamTeam.puedeEditar}
            enviando={dreamTeam.enviando}
          />
        </section>
      </div>
    </main>
  );
}
