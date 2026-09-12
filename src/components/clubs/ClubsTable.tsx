"use client";

import { useMemo, useState } from "react";
import ClubIdentity from "./ClubIdentity";
import { ArrowIcon } from "./ClubsIcons";
import type { ClubStanding } from "@/lib/clubs/types";
import TeamLink from "@/components/team/TeamLink";

const selectStyle = {
  backgroundColor: "#ffffff",
  color: "#102f55",
  borderColor: "#c9e3f1",
} as const;

type SortMode = "position" | "points" | "name" | "goals";

export default function ClubsTable({
  standings,
  season,
  division,
}: {
  standings: ClubStanding[];
  season: string;
  division: string;
}) {
  const [sortMode, setSortMode] = useState<SortMode>("position");

  const rows = useMemo(() => {
    const indexed = standings.map((team, index) => ({ team, position: index + 1 }));
    if (sortMode === "name") return indexed.sort((a, b) => a.team.nombre.localeCompare(b.team.nombre));
    if (sortMode === "points") return indexed.sort((a, b) => b.team.puntos - a.team.puntos || a.position - b.position);
    if (sortMode === "goals") return indexed.sort((a, b) => b.team.gf - a.team.gf || a.position - b.position);
    return indexed;
  }, [standings, sortMode]);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1680px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.14em] text-[#1593d0]">Clubes</p>
            <h2 className="mt-1 text-[29px] font-black uppercase leading-tight tracking-[-.035em] text-[#102f55] sm:text-[36px]">
              {season} <span className="text-[#38a8df]">/</span> {division} División
            </h2>
            <p className="mt-1 text-[13px] font-medium text-[#5a788e]">{standings.length} clubes encontrados</p>
          </div>

          <label className="flex items-center gap-3 self-start md:self-auto">
            <span className="text-[12px] font-black text-[#173d65]">Ordenar por:</span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              style={selectStyle}
              className="h-11 rounded-[9px] border px-3 text-[12px] font-black outline-none focus:border-[#56afe2] focus:ring-2 focus:ring-[#56afe2]/20"
            >
              <option value="position" style={selectStyle}>Posición en la tabla</option>
              <option value="points" style={selectStyle}>Puntos</option>
              <option value="goals" style={selectStyle}>Goles a favor</option>
              <option value="name" style={selectStyle}>Nombre</option>
            </select>
          </label>
        </div>

        {standings.length === 0 ? (
          <div className="rounded-[12px] border border-[#d6e8f2] bg-[#f7fcff] px-5 py-12 text-center text-[14px] font-semibold text-[#6f879d]">
            Todavía no hay clubes cargados para esta temporada y división.
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-[12px] border border-[#cce4f0] md:block">
              <table className="w-full border-collapse text-left">
                <thead className="bg-[#06375e] text-white">
                  <tr className="text-[10px] font-black uppercase tracking-[.05em]">
                    <th className="w-14 px-4 py-3 text-center">#</th>
                    <th className="px-4 py-3">Club</th>
                    <th className="px-4 py-3">División</th>
                    {[
                      "PJ", "G", "E", "P", "GF", "GC", "DG", "PTS",
                    ].map((label) => <th key={label} className="px-3 py-3 text-center">{label}</th>)}
                    <th className="w-16 px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ team, position }, index) => (
                    <tr key={team.nombre} className={`${index % 2 === 0 ? "bg-white" : "bg-[#f2f9fd]"} border-b border-[#dbeaf2] last:border-0 transition hover:bg-[#eaf6fc]`}>
                      <td className="px-4 py-2.5 text-center text-[13px] font-black text-[#173d65]">{position}</td>
                      <td className="px-4 py-2.5">
                        <ClubIdentity name={team.nombre} slug={team.slug} logo={team.logo_url} compact />
                      </td>
                      <td className="px-4 py-2.5 text-[12px] font-semibold text-[#466d89]">{division} División</td>
                      {[team.pj, team.pg, team.pe, team.pp, team.gf, team.gc].map((value, cell) => (
                        <td key={cell} className="px-3 py-2.5 text-center text-[12px] font-bold text-[#173d65]">{value}</td>
                      ))}
                      <td className="px-3 py-2.5 text-center text-[12px] font-bold text-[#173d65]">{team.dg > 0 ? `+${team.dg}` : team.dg}</td>
                      <td className="px-3 py-2.5 text-center text-[13px] font-black text-[#102f55]">{team.puntos}</td>
                      <td className="px-3 py-2.5 text-center">
                        <TeamLink name={team.nombre} slug={team.slug} ariaLabel={`Ver perfil de ${team.nombre}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#b8ddf0] text-[#1a94d1] hover:bg-[#e7f6fd]">
                          <ArrowIcon className="h-4 w-4" />
                        </TeamLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-2.5 md:hidden">
              {rows.map(({ team, position }) => (
                <div key={team.nombre} className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 rounded-[11px] border border-[#d2e6f1] bg-[#f8fcff] px-3 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f4fb] text-[12px] font-black text-[#173d65]">{position}</span>
                  <div className="min-w-0">
                    <ClubIdentity name={team.nombre} slug={team.slug} logo={team.logo_url} compact />
                    <div className="mt-1.5 flex gap-3 pl-11 text-[10px] font-black uppercase text-[#658398]">
                      <span>{team.pj} PJ</span>
                      <span>{team.dg > 0 ? `+${team.dg}` : team.dg} DG</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="block text-xl font-black text-[#102f55]">{team.puntos}</strong>
                    <span className="text-[9px] font-black uppercase text-[#6d899c]">PTS</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
