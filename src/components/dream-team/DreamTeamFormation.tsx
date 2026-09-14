"use client";

import type { DreamTeamController } from "@/hooks/useDreamTeam";
import type { DreamTeamPositionId } from "@/lib/dream-team/types";
import DreamTeamSlot from "./DreamTeamSlot";

export default function DreamTeamFormation({
  fecha,
  plantillaActual,
  votosPorPosicion,
  votingWindow,
  perfilesJugadores,
  setPosicionActiva,
  puedeEditar,
}: Pick<
  DreamTeamController,
  | "fecha"
  | "plantillaActual"
  | "votosPorPosicion"
  | "votingWindow"
  | "perfilesJugadores"
  | "setPosicionActiva"
  | "puedeEditar"
>) {
  const resultadoFinal = Boolean(votingWindow.isClosed);
  const hayResultado = resultadoFinal && Object.keys(votosPorPosicion).length > 0;

  const slot = (id: DreamTeamPositionId) => {
    const player = hayResultado ? votosPorPosicion[id] : plantillaActual[id];

    return (
      <DreamTeamSlot
        id={id}
        selected={
          player
            ? {
                playerId: player.playerId,
                nombre: player.nombre,
                equipo: player.equipo,
              }
            : undefined
        }
        profiles={perfilesJugadores}
        onSelect={setPosicionActiva}
        disabled={hayResultado || !puedeEditar}
      />
    );
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#071b22] p-3 shadow-[0_0_55px_rgba(34,197,94,.12)] sm:rounded-[42px] sm:p-5 md:p-8 xl:p-10">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,.18),transparent_60%)]" />

      {hayResultado && (
        <div className="relative z-20 mb-4 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-center sm:mb-5 sm:px-5 sm:py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-300 sm:text-xs">
            Elección de la comunidad
          </p>
          <h2 className="mt-1 text-xl font-black uppercase text-white sm:text-2xl">
            Dream Team ganador · Fecha {fecha}
          </h2>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Los jugadores más votados en cada posición.
          </p>
        </div>
      )}

      <div className="relative z-10 min-h-[560px] rounded-[24px] border border-green-300/20 bg-gradient-to-b from-green-700/20 via-green-950/30 to-green-900/20 p-3 sm:min-h-[680px] sm:rounded-[34px] sm:p-5 md:min-h-[760px] md:p-8 xl:min-h-[820px] xl:p-10">
        <div className="absolute left-[12%] right-[12%] top-6 h-24 rounded-b-full border-x border-b border-white/15" />
        <div className="absolute bottom-6 left-[12%] right-[12%] h-24 rounded-t-full border-x border-t border-white/15" />
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />

        <div className="relative z-10 flex h-full min-h-[500px] flex-col justify-between sm:min-h-[620px] md:min-h-[700px] xl:min-h-[740px]">
          <div className="mx-auto grid w-full max-w-[520px] grid-cols-2 gap-3 sm:gap-6 md:gap-8">
            {slot("LST")}
            {slot("RST")}
          </div>

          <div className="mx-auto grid w-full max-w-[430px] grid-cols-2 gap-3 sm:gap-6 md:gap-8">
            {slot("LCM")}
            {slot("RCM")}
          </div>

          <div className="mx-auto grid w-full max-w-[620px] grid-cols-3 gap-2 sm:gap-4 md:gap-6">
            {slot("LB")}
            {slot("CB")}
            {slot("RB")}
          </div>

          <div className="flex w-full justify-center">
            <div className="w-[130px] sm:w-[160px] md:w-[180px]">
              {slot("GK")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
