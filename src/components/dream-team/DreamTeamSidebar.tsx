"use client";

import { DREAM_TEAM_POSITIONS } from "@/config/dreamTeam";
import type { DreamTeamController } from "@/hooks/useDreamTeam";
import type { DreamTeamPositionId } from "@/lib/dream-team/types";
import {
  DreamTeamPlayerAvatar,
  DreamTeamPlayerName,
} from "./DreamTeamPlayerIdentity";

export default function DreamTeamSidebar({
  jugadorMasVotado,
  miDreamTeam,
  perfilesJugadores,
  compartir,
  posicionActiva,
  topPorPosicion,
  candidatos,
  votar,
}: Pick<
  DreamTeamController,
  | "jugadorMasVotado"
  | "miDreamTeam"
  | "perfilesJugadores"
  | "compartir"
  | "posicionActiva"
  | "topPorPosicion"
  | "candidatos"
  | "votar"
>) {
  const top = posicionActiva ? topPorPosicion(posicionActiva) : [];
  const candidates = posicionActiva ? candidatos(posicionActiva) : [];

  return (
    <aside className="space-y-6">
      <section className="rounded-[28px] border border-yellow-500/25 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
          MVP de la fecha
        </p>
        <div className="mt-4 flex items-center gap-4">
          <DreamTeamPlayerAvatar
            playerId={jugadorMasVotado?.playerId}
            nombre={jugadorMasVotado?.nombre || "-"}
            profiles={perfilesJugadores}
          />
          <div className="min-w-0">
            <h2 className="break-words text-2xl font-black uppercase sm:truncate sm:text-3xl">
              <DreamTeamPlayerName
                playerId={jugadorMasVotado?.playerId}
                nombre={jugadorMasVotado?.nombre || "-"}
                profiles={perfilesJugadores}
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
            const player = miDreamTeam[position.id];
            return (
              <div
                key={position.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3"
              >
                <span className="font-black text-yellow-300">{position.id}</span>
                <div className="flex min-w-0 items-center gap-2">
                  {player && (
                    <DreamTeamPlayerAvatar
                      playerId={player.playerId}
                      nombre={player.nombre}
                      profiles={perfilesJugadores}
                      size="sm"
                    />
                  )}
                  <span className="truncate text-sm text-zinc-300">
                    {player ? (
                      <DreamTeamPlayerName
                        playerId={player.playerId}
                        nombre={player.nombre}
                        profiles={perfilesJugadores}
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
              {top.length === 0 ? (
                <p className="text-sm text-zinc-500">Sin votos todavía.</p>
              ) : (
                top.map((player, index) => (
                  <div
                    key={player.playerId || player.nombre}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="font-black text-zinc-500">{index + 1}.</span>
                      <DreamTeamPlayerAvatar
                        playerId={player.playerId}
                        nombre={player.nombre}
                        profiles={perfilesJugadores}
                        size="sm"
                      />
                      <span className="truncate text-white">
                        <DreamTeamPlayerName
                          playerId={player.playerId}
                          nombre={player.nombre}
                          profiles={perfilesJugadores}
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

      <CandidateList
        position={posicionActiva}
        candidates={candidates}
        profiles={perfilesJugadores}
        onVote={votar}
      />
    </aside>
  );
}

function CandidateList({
  position,
  candidates,
  profiles,
  onVote,
}: {
  position: DreamTeamPositionId | null;
  candidates: ReturnType<DreamTeamController["candidatos"]>;
  profiles: DreamTeamController["perfilesJugadores"];
  onVote: DreamTeamController["votar"];
}) {
  return (
    <section className="max-h-[560px] overflow-y-auto rounded-[28px] border border-sky-500/25 bg-[#020714] p-4 sm:max-h-[760px] sm:rounded-[34px]">
      {!position ? (
        <div className="p-8 text-center text-zinc-500">No hay posición seleccionada.</div>
      ) : candidates.length === 0 ? (
        <div className="p-8 text-center text-zinc-500">
          No hay candidatos para esta posición.
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((player) => (
            <button
              key={player.playerId || player.nombre}
              type="button"
              onClick={() => onVote(player)}
              className="w-full rounded-2xl border border-sky-500/15 bg-black/35 p-3 text-left transition hover:border-yellow-300/60 hover:bg-yellow-400/10 sm:p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <DreamTeamPlayerAvatar
                    playerId={player.playerId}
                    nombre={player.nombre}
                    profiles={profiles}
                  />
                  <div className="min-w-0">
                    <p className="break-words text-base font-black uppercase sm:truncate sm:text-lg">
                      <DreamTeamPlayerName
                        playerId={player.playerId}
                        nombre={player.nombre}
                        profiles={profiles}
                      />
                    </p>
                    <p className="truncate text-sm text-zinc-500">
                      {player.equipo} · {player.posicion || "Sin posición"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-yellow-300 sm:text-2xl">{player.rating}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">rating</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                <CandidateStat value={player.partidos} label="PJ" />
                <CandidateStat value={player.goles} label="G" />
                <CandidateStat value={player.asistencias} label="A" />
                <CandidateStat value={player.atajadas} label="ATAJ" />
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function CandidateStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-2">
      <b>{value}</b>
      <p className="text-zinc-500">{label}</p>
    </div>
  );
}
