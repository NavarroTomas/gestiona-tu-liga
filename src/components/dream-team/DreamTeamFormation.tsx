"use client";

import type { DreamTeamController } from "@/hooks/useDreamTeam";
import type { DreamTeamPositionId } from "@/lib/dream-team/types";
import DreamTeamSlot from "./DreamTeamSlot";

export default function DreamTeamFormation({
  votosPorPosicion,
  perfilesJugadores,
  setPosicionActiva,
}: Pick<
  DreamTeamController,
  "votosPorPosicion" | "perfilesJugadores" | "setPosicionActiva"
>) {
  const slot = (id: DreamTeamPositionId) => (
    <DreamTeamSlot
      id={id}
      selected={votosPorPosicion[id]}
      profiles={perfilesJugadores}
      onSelect={setPosicionActiva}
    />
  );

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#071b22] p-3 sm:rounded-[42px] sm:p-5 md:p-8 xl:p-10 shadow-[0_0_55px_rgba(34,197,94,.12)]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,.18),transparent_60%)]" />

      <div className="relative z-10 min-h-[560px] rounded-[24px] border border-green-300/20 bg-gradient-to-b from-green-700/20 via-green-950/30 to-green-900/20 p-3 sm:min-h-[680px] sm:rounded-[34px] sm:p-5 md:min-h-[760px] md:p-8 xl:min-h-[820px] xl:p-10">
        <div className="absolute left-[12%] right-[12%] top-6 h-24 rounded-b-full border-x border-b border-white/15" />
        <div className="absolute left-[12%] right-[12%] bottom-6 h-24 rounded-t-full border-x border-t border-white/15" />
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
