"use client";

import type {
  DreamTeamPositionId,
  DreamTeamProfiles,
  DreamTeamVoteLeader,
} from "@/lib/dream-team/types";
import {
  DreamTeamPlayerAvatar,
  DreamTeamPlayerName,
} from "./DreamTeamPlayerIdentity";

export default function DreamTeamSlot({
  id,
  selected,
  profiles,
  onSelect,
}: {
  id: DreamTeamPositionId;
  selected?: DreamTeamVoteLeader;
  profiles: DreamTeamProfiles;
  onSelect: (id: DreamTeamPositionId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="group relative min-h-[92px] rounded-2xl border border-sky-400/30 bg-black/55 p-2 text-center sm:min-h-[106px] sm:rounded-3xl sm:p-3 shadow-[0_0_24px_rgba(56,189,248,.10)] transition hover:scale-[1.04] hover:border-yellow-300/70 hover:shadow-[0_0_30px_rgba(250,204,21,.20)]"
    >
      <div className="mx-auto mb-2 flex justify-center">
        {selected ? (
          <DreamTeamPlayerAvatar
            playerId={selected.playerId}
            nombre={selected.nombre}
            profiles={profiles}
          />
        ) : (
          <DreamTeamEmptyBadge id={id} />
        )}
      </div>

      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-yellow-300">
        {id}
      </p>

      <h3 className="mt-1 truncate text-xs font-black uppercase text-white sm:text-base">
        {selected ? (
          <DreamTeamPlayerName
            playerId={selected.playerId}
            nombre={selected.nombre}
            profiles={profiles}
          />
        ) : (
          "Elegir"
        )}
      </h3>

      <p className="mt-1 truncate text-[10px] text-zinc-500 sm:text-xs">
        {selected?.equipo || "Sin jugador"}
      </p>

      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300">
        {selected?.votos || 0} votos
      </p>
    </button>
  );
}

function DreamTeamEmptyBadge({ id }: { id: DreamTeamPositionId }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/30 bg-black sm:h-10 sm:w-10">
      <span className="text-[10px] font-black text-white">{id.slice(0, 1)}</span>
    </div>
  );
}
