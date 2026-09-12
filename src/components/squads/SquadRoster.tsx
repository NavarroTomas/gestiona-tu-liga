import Link from "next/link";
import TeamLink from "@/components/team/TeamLink";
import type { SquadClub, SquadPlayerView } from "@/lib/squads/types";

export default function SquadRoster({
  club,
  clubName,
  season,
  division,
  players,
}: {
  club: SquadClub | null;
  clubName: string;
  season: string;
  division: string;
  players: SquadPlayerView[];
}) {
  const totalPlayers = players.length;
  const avgRating = totalPlayers ? players.reduce((acc, p) => acc + Number(p.rating || 0), 0) / totalPlayers : 0;
  const captain = players[0]?.jugador || "Sin definir";

  return (
    <section className="mx-auto grid max-w-[1680px] gap-4 px-5 py-5 sm:px-8 xl:grid-cols-[minmax(0,1fr)_340px] lg:px-10">
      <div className="min-w-0 space-y-3">
        <div className="rounded-[10px] border border-[#d6e9f3] bg-white px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#eef7fc] sm:h-20 sm:w-20">
              {club?.logo_url ? <img src={club.logo_url} alt="" className="h-full w-full object-contain p-2" /> : <span className="text-xl font-black text-[#6f8ca0]">{clubName.slice(0,2).toUpperCase()}</span>}
            </span>
            <div className="min-w-0">
              <TeamLink name={clubName} slug={club?.slug} className="block truncate text-[24px] font-black text-[#102f55] sm:text-[30px]">{clubName}</TeamLink>
              <p className="mt-1 text-[13px] font-bold text-[#52738d]">{season} <span className="px-2 text-[#b8ccd8]">|</span> {division} División</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-[#d6e9f3] bg-white">
          <div className="border-b border-[#dbeaf2] px-4 py-4 sm:px-5">
            <h2 className="text-lg font-black text-[#102f55] sm:text-xl">Plantel completo ({totalPlayers})</h2>
          </div>

          <div className="hidden md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#eef8fd] text-[10px] font-black uppercase tracking-wide text-[#315f89]">
                <tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Jugador</th><th className="px-4 py-3 text-center">Posición</th><th className="px-4 py-3 text-center">PJ</th><th className="px-4 py-3 text-center">Goles</th><th className="px-4 py-3 text-center">Asist.</th><th className="px-4 py-3 text-center">MVP</th></tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player.id} className="border-t border-[#e2edf4] text-[12px] font-semibold text-[#173b62] hover:bg-[#f7fcff]">
                    <td className="px-4 py-3 text-[#5a7d96]">{index + 1}</td>
                    <td className="px-4 py-3">
                      {player.playerId ? <Link href={`/jugadores/${encodeURIComponent(player.playerId)}`} className="font-black hover:text-[#2598d7]">{player.jugador}</Link> : <span className="font-black">{player.jugador}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">{player.posicion || "—"}</td>
                    <td className="px-4 py-3 text-center">{player.pj}</td>
                    <td className="px-4 py-3 text-center">{player.goles}</td>
                    <td className="px-4 py-3 text-center">{player.asistencias}</td>
                    <td className="px-4 py-3 text-center">{player.mvps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[#e2edf4] md:hidden">
            {players.map((player) => (
              <div key={player.id} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3">
                <div className="min-w-0">
                  {player.playerId ? <Link href={`/jugadores/${encodeURIComponent(player.playerId)}`} className="block truncate text-[14px] font-black text-[#102f55]">{player.jugador}</Link> : <span className="block truncate text-[14px] font-black text-[#102f55]">{player.jugador}</span>}
                  <p className="mt-1 text-[11px] font-bold text-[#68859a]">{player.posicion || "Sin posición"} · {player.pj} PJ</p>
                </div>
                <div className="flex gap-3 text-center text-[11px] font-black text-[#315f89]">
                  <span>{player.goles}<small className="block text-[8px] uppercase text-[#8aa1b2]">G</small></span>
                  <span>{player.asistencias}<small className="block text-[8px] uppercase text-[#8aa1b2]">A</small></span>
                </div>
              </div>
            ))}
          </div>

          {players.length === 0 ? <p className="px-4 py-12 text-center text-sm font-bold text-[#8096a8]">No hay jugadores para esta selección.</p> : null}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-[10px] border border-[#d6e9f3] bg-white">
          {club?.banner_url ? (
            <div className="relative h-40 bg-[#07345b]">
              <img src={club.banner_url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#062a48] via-[#062a48]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-4 text-center text-white">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm">{club.logo_url ? <img src={club.logo_url} alt="" className="h-full w-full object-contain p-1" /> : null}</div>
                <strong className="block text-base font-black uppercase">{clubName}</strong>
              </div>
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center bg-[#07345b] text-white">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-white/10">{club?.logo_url ? <img src={club.logo_url} alt="" className="h-full w-full object-contain p-2" /> : null}</div>
              <strong className="mt-3 text-base font-black uppercase">{clubName}</strong>
            </div>
          )}

          <div className="divide-y divide-[#e2edf4] px-4">
            <div className="flex justify-between py-3 text-[12px]"><span className="font-bold text-[#56768e]">Cantidad de jugadores</span><strong className="text-[#102f55]">{totalPlayers}</strong></div>
            <div className="flex justify-between py-3 text-[12px]"><span className="font-bold text-[#56768e]">Rating APA medio</span><strong className="text-[#102f55]">{avgRating ? avgRating.toFixed(2) : "—"}</strong></div>
            <div className="flex justify-between py-3 text-[12px]"><span className="font-bold text-[#56768e]">Capitán</span><strong className="max-w-[140px] truncate text-[#102f55]">{captain}</strong></div>
          </div>

          <div className="p-4">
            <TeamLink name={clubName} slug={club?.slug} className="flex h-11 items-center justify-center rounded-[7px] bg-[#168fd4] text-[12px] font-black text-white hover:text-white">Ver perfil del club →</TeamLink>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#d6e9f3] bg-white p-5">
          <h3 className="text-sm font-black text-[#102f55]">Temporada actual</h3>
          <p className="mt-4 text-base font-black text-[#102f55]">{season}</p>
          <p className="mt-1 text-[13px] font-semibold text-[#58768d]">{division} División</p>
        </div>
      </aside>
    </section>
  );
}
