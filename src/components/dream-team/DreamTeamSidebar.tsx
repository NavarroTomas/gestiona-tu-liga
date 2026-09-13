"use client";

import { DREAM_TEAM_POSITIONS } from "@/config/dreamTeam";
import type { UseDreamTeamReturn } from "@/hooks/useDreamTeam";
import {
  DreamTeamAvatar,
  DreamTeamPlayerName,
} from "./DreamTeamPlayerIdentity";
import { DreamTeamCandidateList } from "./DreamTeamCandidateList";

export function DreamTeamSidebar({
  jugadorMasVotado,
  perfilesJugadores,
  miDreamTeam,
  compartir,
  posicionActiva,
  topPorPosicion,
  candidatos,
  votar,
}: Pick<
  UseDreamTeamReturn,
  | "jugadorMasVotado"
  | "perfilesJugadores"
  | "miDreamTeam"
  | "compartir"
  | "posicionActiva"
  | "topPorPosicion"
  | "candidatos"
  | "votar"
>) {
  const candidatosActuales = posicionActiva ? candidatos(posicionActiva) : [];
  const topActual = posicionActiva ? topPorPosicion(posicionActiva) : [];

  return (
    <aside className="space-y-6">
      <section className="rounded-[28px] border border-yellow-500/25 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
          MVP de la fecha
        </p>
        <div className="mt-4 flex items-center gap-4">
          <DreamTeamAvatar
            playerId={jugadorMasVotado?.playerId}
            nombre={jugadorMasVotado?.nombre || "-"}
            perfiles={perfilesJugadores}
          />
          <div className="min-w-0">
            <h2 className="break-words text-2xl font-black uppercase sm:truncate sm:text-3xl">
              <DreamTeamPlayerName
                playerId={jugadorMasVotado?.playerId}
                nombre={jugadorMasVotado?.nombre || "-"}
                perfiles={perfilesJugadores}
              />
            </h2>
            <p className="mt-2 truncate text-zinc-500">
              {jugadorMasVotado?.equipo || "Sin votos todavía"}
            </p>
          </div>
        </div>
        <p className="mt-5 text-4xl font-black text-yellow-300 sm:text-5xl">
          {jugadorMasVotado?.votos || 0}
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
          votos totales
        </p>
      </section>

      <section className="rounded-[28px] border border-sky-500/25 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
              Mi equipo
            </p>
            <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
              Mi Dream Team
            </h2>
          </div>

          <button
            type="button"
            onClick={compartir}
            className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-xs font-black uppercase text-sky-300"
          >
            Compartir
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2">
          {DREAM_TEAM_POSITIONS.map((position) => {
            const selected = miDreamTeam[position.id];
            return (
              <div
                key={position.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3"
              >
                <span className="font-black text-yellow-300">{position.id}</span>
                <div className="flex min-w-0 items-center gap-2">
                  {selected && (
                    <DreamTeamAvatar
                      playerId={selected.playerId}
                      nombre={selected.nombre}
                      perfiles={perfilesJugadores}
                      size="sm"
                    />
                  )}
                  <span className="truncate text-sm text-zinc-300">
                    {selected ? (
                      <DreamTeamPlayerName
                        playerId={selected.playerId}
                        nombre={selected.nombre}
                        perfiles={perfilesJugadores}
                      />
                    ) : (
                      "-"
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-sky-500/25 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
          Votación
        </p>
        <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
          {posicionActiva ? `Elegir ${posicionActiva}` : "Seleccioná una posición"}
        </h2>
        <p className="mt-3 text-zinc-500">
          Tocá una posición en la formación y elegí un jugador candidato.
        </p>

        {posicionActiva && (
          <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
              Top 3 actual
            </p>
            <div className="space-y-2">
              {topActual.length === 0 ? (
                <p className="text-sm text-zinc-500">Sin votos todavía.</p>
              ) : (
                topActual.map((player, index) => (
                  <div
                    key={player.playerId || player.nombre}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="font-black text-zinc-500">{index + 1}.</span>
                      <DreamTeamAvatar
                        playerId={player.playerId}
                        nombre={player.nombre}
                        perfiles={perfilesJugadores}
                        size="sm"
                      />
                      <span className="truncate text-white">
                        <DreamTeamPlayerName
                          playerId={player.playerId}
                          nombre={player.nombre}
                          perfiles={perfilesJugadores}
                        />
                      </span>
                    </div>
                    <span className="font-black text-yellow-300">{player.votos}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      <DreamTeamCandidateList
        posicionActiva={posicionActiva}
        candidatos={candidatosActuales}
        perfiles={perfilesJugadores}
        onVote={votar}
      />
    </aside>
  );
}
