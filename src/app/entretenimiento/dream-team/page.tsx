"use client";

import { DreamTeamHero } from "@/components/dream-team/DreamTeamHero";
import { DreamTeamFilters } from "@/components/dream-team/DreamTeamFilters";
import { DreamTeamFormation } from "@/components/dream-team/DreamTeamFormation";
import { DreamTeamSidebar } from "@/components/dream-team/DreamTeamSidebar";
import { useDreamTeam } from "@/hooks/useDreamTeam";

export default function DreamTeamPage() {
  const dreamTeam = useDreamTeam();

  return (
    <main className="min-h-screen overflow-x-hidden text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
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
          setTemporada={dreamTeam.setTemporada}
          competicion={dreamTeam.competicion}
          setCompeticion={dreamTeam.setCompeticion}
          division={dreamTeam.division}
          setDivision={dreamTeam.setDivision}
          grupo={dreamTeam.grupo}
          setGrupo={dreamTeam.setGrupo}
          fase={dreamTeam.fase}
          setFase={dreamTeam.setFase}
          fecha={dreamTeam.fecha}
          setFecha={dreamTeam.setFecha}
          fechas={dreamTeam.fechas}
        />

        {dreamTeam.mensaje && (
          <section className="rounded-3xl border border-sky-500/20 bg-black/35 p-5 text-center font-black text-sky-300">
            {dreamTeam.mensaje}
          </section>
        )}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-8">
          <DreamTeamFormation
            votosPorPosicion={dreamTeam.votosPorPosicion}
            perfilesJugadores={dreamTeam.perfilesJugadores}
            logos={dreamTeam.logos}
            setPosicionActiva={dreamTeam.setPosicionActiva}
          />

          <DreamTeamSidebar
            jugadorMasVotado={dreamTeam.jugadorMasVotado}
            perfilesJugadores={dreamTeam.perfilesJugadores}
            miDreamTeam={dreamTeam.miDreamTeam}
            compartir={dreamTeam.compartir}
            posicionActiva={dreamTeam.posicionActiva}
            topPorPosicion={dreamTeam.topPorPosicion}
            candidatos={dreamTeam.candidatos}
            votar={dreamTeam.votar}
          />
        </section>
      </div>
    </main>
  );
}
