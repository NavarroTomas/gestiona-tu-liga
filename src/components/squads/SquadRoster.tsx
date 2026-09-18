"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import TeamLink from "@/components/team/TeamLink";
import { teamHref } from "@/lib/teams/teamRoutes";
import type { SquadClub, SquadPlayerView } from "@/lib/squads/types";

function PlayerAvatar({ player }: { player: SquadPlayerView }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d9e6ee] bg-[#edf2f5] sm:h-10 sm:w-10">
      {player.avatar_url ? (
        <img
          src={player.avatar_url}
          alt={`Foto de ${player.jugador}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <svg viewBox="0 0 40 40" className="h-full w-full text-[#aab7c0]" aria-hidden="true">
          <circle cx="20" cy="15" r="7" fill="currentColor" />
          <path d="M7 35c.7-8.2 5.8-12.5 13-12.5S32.3 26.8 33 35H7Z" fill="currentColor" />
        </svg>
      )}
    </span>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 1 0 0-6m-7 9c-4.4 0-7 2.1-7 5.5V20h14v-1.5C16 15.1 13.4 13 9 13Zm7.5 0c3.4.3 5.5 2.2 5.5 5V20h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CaptainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M8 4h8v3.5c0 3-1.75 5.5-4 5.5s-4-2.5-4-5.5V4Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 6H5.8c0 3 1.2 4.7 3.6 5.2M16 6h2.2c0 3-1.2 4.7-3.6 5.2M12 13v3.2M8.5 20h7M9.5 16.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

type SortKey = "pj" | "goles" | "asistencias" | "mvps" | "rating";

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
  const captain =
    players.find((player) =>
      String(player.estado || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes("capitan"),
    )?.jugador || "Por definir";
  const profileHref = teamHref({ name: clubName, slug: club?.slug }) || "/clubes";
  const [sortKey, setSortKey] = useState<SortKey | null>(null);

  const sortedPlayers = useMemo(() => {
    if (!sortKey) return players;
    return [...players].sort((a, b) => {
      const diff = Number(b[sortKey] || 0) - Number(a[sortKey] || 0);
      if (diff !== 0) return diff;
      return a.jugador.localeCompare(b.jugador, "es");
    });
  }, [players, sortKey]);

  const sortLabel = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => setSortKey(key)}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 transition hover:bg-[#dff2fb] hover:text-[#0f5f93] ${sortKey === key ? "bg-[#dff2fb] text-[#0f5f93]" : ""}`}
      title={`Ordenar ${label} de mayor a menor`}
    >
      <span>{label}</span>
      <span aria-hidden="true">{sortKey === key ? "↓" : "↕"}</span>
    </button>
  );


  return (
    <section className="mx-auto grid max-w-[1680px] gap-4 px-5 py-5 sm:px-8 xl:grid-cols-[minmax(0,1fr)_360px] lg:px-10">
      <div className="min-w-0 space-y-3">
        <div className="overflow-hidden rounded-[10px] border border-[#d6e9f3] bg-white">
          <div className="flex min-w-0 items-center gap-4 px-4 py-4 sm:px-5">
            <TeamLink name={clubName} slug={club?.slug} className="shrink-0" ariaLabel={`Ver perfil de ${clubName}`}>
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-[#eef7fc] transition hover:bg-[#e0f3fc] sm:h-20 sm:w-20">
                {club?.logo_url ? (
                  <img src={club.logo_url} alt="" className="h-full w-full object-contain p-2" />
                ) : (
                  <span className="text-xl font-black text-[#6f8ca0]">
                    {clubName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </span>
            </TeamLink>

            <div className="min-w-0">
              <TeamLink
                name={clubName}
                slug={club?.slug}
                className="block truncate text-[24px] font-black text-[#102f55] sm:text-[30px]"
              >
                {clubName}
              </TeamLink>
              <p className="mt-1 text-[13px] font-bold text-[#52738d]">
                {season}
                <span className="px-2 text-[#b8ccd8]">|</span>
                {division} División
              </p>
            </div>
          </div>

          <nav className="flex min-w-0 overflow-x-auto border-t border-[#e2edf4] px-4 sm:px-5" aria-label="Secciones del club">
            <a
              href="#plantel"
              className="shrink-0 border-b-[3px] border-[#24a5e7] px-3 py-3 text-[12px] font-black text-[#168fd4] sm:text-[13px]"
            >
              Plantel
            </a>
            <Link
              href={profileHref}
              className="shrink-0 border-b-[3px] border-transparent px-3 py-3 text-[12px] font-black text-[#315f89] transition hover:text-[#168fd4] sm:text-[13px]"
            >
              Estadísticas
            </Link>
            <Link
              href={`${profileHref}#historial`}
              className="shrink-0 border-b-[3px] border-transparent px-3 py-3 text-[12px] font-black text-[#315f89] transition hover:text-[#168fd4] sm:text-[13px]"
            >
              Historial
            </Link>
          </nav>
        </div>

        <div id="plantel" className="scroll-mt-28 overflow-hidden rounded-[10px] border border-[#d6e9f3] bg-white">
          <div className="border-b border-[#dbeaf2] px-4 py-4 sm:px-5">
            <h2 className="text-lg font-black text-[#102f55] sm:text-xl">
              Plantel completo ({totalPlayers})
            </h2>
          </div>

          <div className="hidden md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#eef8fd] text-[10px] font-black uppercase tracking-wide text-[#315f89]">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Jugador</th>
                  <th className="px-4 py-3 text-center">Posición</th>
                  <th className="px-2 py-2 text-center">{sortLabel("pj", "PJ")}</th>
                  <th className="px-2 py-2 text-center">{sortLabel("goles", "Goles")}</th>
                  <th className="px-2 py-2 text-center">{sortLabel("asistencias", "Asist.")}</th>
                  <th className="px-2 py-2 text-center">{sortLabel("mvps", "MVP")}</th>
                  <th className="px-2 py-2 text-center">{sortLabel("rating", "Rating")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player, index) => (
                  <tr
                    key={player.id}
                    className="border-t border-[#e2edf4] text-[12px] font-semibold text-[#173b62] hover:bg-[#f7fcff]"
                  >
                    <td className="px-4 py-2.5 text-[#5a7d96]">{index + 1}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <PlayerAvatar player={player} />
                        {player.playerId ? (
                          <Link
                            href={`/jugadores/${encodeURIComponent(player.playerId)}`}
                            className="truncate font-black hover:text-[#2598d7]"
                          >
                            {player.jugador}
                          </Link>
                        ) : (
                          <span className="truncate font-black">{player.jugador}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">{player.posicion || "N/D"}</td>
                    <td className="px-4 py-2.5 text-center">{player.pj}</td>
                    <td className="px-4 py-2.5 text-center">{player.goles}</td>
                    <td className="px-4 py-2.5 text-center">{player.asistencias}</td>
                    <td className="px-4 py-2.5 text-center">{player.mvps}</td>
                    <td className="px-4 py-2.5 text-center font-black">{player.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[#e2edf4] md:hidden">
            {sortedPlayers.map((player) => (
              <div key={player.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <PlayerAvatar player={player} />
                  <div className="min-w-0">
                    {player.playerId ? (
                      <Link
                        href={`/jugadores/${encodeURIComponent(player.playerId)}`}
                        className="block truncate text-[14px] font-black text-[#102f55]"
                      >
                        {player.jugador}
                      </Link>
                    ) : (
                      <span className="block truncate text-[14px] font-black text-[#102f55]">
                        {player.jugador}
                      </span>
                    )}
                    <p className="mt-1 text-[11px] font-bold text-[#68859a]">
                      {player.posicion || "N/D"} · {player.pj} PJ
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 text-center text-[11px] font-black text-[#315f89]">
                  <button type="button" onClick={() => setSortKey("goles")} title="Ordenar por goles">
                    {player.goles}
                    <small className="block text-[8px] uppercase text-[#8aa1b2]">G</small>
                  </button>
                  <button type="button" onClick={() => setSortKey("asistencias")} title="Ordenar por asistencias">
                    {player.asistencias}
                    <small className="block text-[8px] uppercase text-[#8aa1b2]">A</small>
                  </button>
                  <button type="button" onClick={() => setSortKey("mvps")} title="Ordenar por MVP">
                    {player.mvps}
                    <small className="block text-[8px] uppercase text-[#8aa1b2]">MVP</small>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {players.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm font-bold text-[#8096a8]">
              No hay jugadores para esta selección.
            </p>
          ) : null}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-[10px] border border-[#d6e9f3] bg-white">
          <div className="flex min-h-[210px] flex-col items-center justify-center border-b border-[#dcebf3] bg-[#eef8fd] px-5 py-7 text-center">
            <TeamLink name={clubName} slug={club?.slug} className="flex flex-col items-center" ariaLabel={`Ver perfil de ${clubName}`}>
              <span className="flex h-28 w-28 items-center justify-center overflow-hidden sm:h-32 sm:w-32">
                {club?.logo_url ? (
                  <img src={club.logo_url} alt={`Escudo de ${clubName}`} className="h-full w-full object-contain" />
                ) : (
                  <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-2xl font-black text-[#7390a4]">
                    {clubName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </span>
              <strong className="mt-4 block text-[18px] font-black uppercase leading-tight text-[#102f55]">
                {clubName}
              </strong>
            </TeamLink>
            <span className="mt-1 text-[12px] font-bold text-[#5f7d93]">{division} División</span>
          </div>

          <div className="divide-y divide-[#e2edf4] px-4">
            <div className="flex items-center justify-between gap-4 py-3.5 text-[12px]">
              <span className="flex items-center gap-2.5 font-bold text-[#56768e]">
                <span className="text-[#197fbd]"><UsersIcon /></span>
                Cantidad de jugadores
              </span>
              <strong className="text-[#102f55]">{totalPlayers}</strong>
            </div>
            <div className="flex items-center justify-between gap-4 py-3.5 text-[12px]">
              <span className="flex items-center gap-2.5 font-bold text-[#56768e]">
                <span className="text-[#197fbd]"><CaptainIcon /></span>
                Capitán
              </span>
              <strong className="max-w-[150px] truncate text-[#102f55]">{captain}</strong>
            </div>
          </div>

          <div className="p-4">
            <TeamLink
              name={clubName}
              slug={club?.slug}
              className="flex h-11 items-center justify-center rounded-[7px] bg-[#168fd4] text-[12px] font-black text-white hover:text-white"
            >
              Ver perfil del club →
            </TeamLink>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#d6e9f3] bg-white p-5">
          <div className="flex items-center gap-2.5 text-[#168fd4]">
            <TrophyIcon />
            <h3 className="text-sm font-black text-[#102f55]">Temporada actual</h3>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-[8px] border border-[#e0edf4] bg-[#f8fcff] p-4">
            <div>
              <p className="text-base font-black text-[#102f55]">{season}</p>
              <p className="mt-1 text-[13px] font-semibold text-[#58768d]">{division} División</p>
            </div>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden">
              {club?.logo_url ? (
                <img src={club.logo_url} alt="" className="h-full w-full object-contain" />
              ) : null}
            </span>
          </div>
        </div>
      </aside>
    </section>
  );
}
