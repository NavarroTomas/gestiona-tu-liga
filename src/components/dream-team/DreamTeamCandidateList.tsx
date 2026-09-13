"use client";

import {
  DreamTeamAvatar,
  DreamTeamPlayerName,
} from "./DreamTeamPlayerIdentity";
import type {
  DreamTeamPlayer,
  DreamTeamPositionId,
  DreamTeamProfilesMap,
} from "@/lib/dream-team/types";

export function DreamTeamCandidateList({
  posicionActiva,
  candidatos,
  perfiles,
  onVote,
}: {
  posicionActiva: DreamTeamPositionId | null;
  candidatos: DreamTeamPlayer[];
  perfiles: DreamTeamProfilesMap;
  onVote: (player: DreamTeamPlayer) => void;
}) {
  return (
    <section className="max-h-[560px] overflow-y-auto rounded-[28px] border border-sky-500/25 bg-[#020714] p-4 sm:max-h-[760px] sm:rounded-[34px]">
      {!posicionActiva ? (
        <div className="p-8 text-center text-zinc-500">
          No hay posición seleccionada.
        </div>
      ) : candidatos.length === 0 ? (
        <div className="p-8 text-center text-zinc-500">
          No hay candidatos para esta posición.
        </div>
      ) : (
        <div className="space-y-3">
          {candidatos.map((player) => (
            <button
              key={player.playerId || player.nombre}
              type="button"
              onClick={() => onVote(player)}
              className="w-full rounded-2xl border border-sky-500/15 bg-black/35 p-3 text-left transition hover:border-yellow-300/60 hover:bg-yellow-400/10 sm:p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <DreamTeamAvatar
                    playerId={player.playerId}
                    nombre={player.nombre}
                    perfiles={perfiles}
                  />
                  <div className="min-w-0">
                    <p className="break-words text-base font-black uppercase sm:truncate sm:text-lg">
                      <DreamTeamPlayerName
                        playerId={player.playerId}
                        nombre={player.nombre}
                        perfiles={perfiles}
                      />
                    </p>
                    <p className="truncate text-sm text-zinc-500">
                      {player.equipo} · {player.posicion || "Sin posición"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-yellow-300 sm:text-2xl">
                    {player.rating}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    rating
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                <Stat value={player.partidos} label="PJ" />
                <Stat value={player.goles} label="G" />
                <Stat value={player.asistencias} label="A" />
                <Stat value={player.atajadas} label="ATAJ" />
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-2">
      <b>{value}</b>
      <p className="text-zinc-500">{label}</p>
    </div>
  );
}
