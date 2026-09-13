import Link from "next/link";
import type { JugadorPremio, PremiosController } from "@/hooks/usePremios";

export default function PremiosGrid({ controller }: { controller: PremiosController }) {
  const cards = [
    ["MVP de la fecha", controller.premios.mvpFecha, `${controller.premios.mvpFecha?.overallRating || 0} rating`],
    ["Goleador", controller.premios.goleador, `${controller.premios.goleador?.goals || 0} goles`],
    ["Asistidor", controller.premios.asistidor, `${controller.premios.asistidor?.assists || 0} asist.`],
    ["Arquero", controller.premios.arquero, `${controller.premios.arquero?.gKSaves || 0} atajadas`],
    ["Muro defensivo", controller.premios.defensor, `${(controller.premios.defensor?.tackles || 0) + (controller.premios.defensor?.interceptions || 0)} acciones`],
    ["Estrella", controller.premios.estrella, `${controller.premios.estrella?.score || 0} score`],
  ] as Array<[string, JugadorPremio | undefined, string]>;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map(([title, player, metric]) => (
        <AwardCard key={title} title={title} player={player} metric={metric} controller={controller} />
      ))}
    </section>
  );
}

function AwardCard({ title, player, metric, controller }: { title: string; player?: JugadorPremio; metric: string; controller: PremiosController }) {
  const logo = controller.logoEquipo(player?.equipo);
  const body = (
    <div className="rounded-2xl border border-[#c9e3f1] bg-white p-5 transition hover:border-[#56afe2]">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2d98d4]">{title}</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#c9e3f1] bg-[#f3fafe]">
          {logo ? <img src={logo} alt={player?.equipo || "Club"} className="h-full w-full object-contain p-1.5" /> : <span className="text-xs font-black text-[#102f55]">{(player?.equipo || "?").slice(0, 2).toUpperCase()}</span>}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-xl font-black uppercase text-[#102f55]">{player?.nombre || "Sin datos"}</h3>
          <p className="mt-1 truncate text-sm text-[#607b90]">{player?.equipo || "Sin club"}{player?.posicion ? ` · ${player.posicion}` : ""}</p>
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#e0eef5] pt-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#7d98aa]">Métrica</p>
          <p className="mt-1 text-2xl font-black text-[#2d98d4]">{metric}</p>
        </div>
        <p className="text-xs font-black uppercase text-[#607b90]">Fecha {controller.fecha}</p>
      </div>
    </div>
  );

  return player?.playerId ? <Link href={`/jugadores/${encodeURIComponent(player.playerId)}`}>{body}</Link> : body;
}
