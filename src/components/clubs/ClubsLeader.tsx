
import { displayLabel } from "@/lib/displayLabels";
import TeamLink from "@/components/team/TeamLink";
import { clubOpponent, formatClubMatchDate } from "@/lib/clubs";
import type { ClubRecord, ClubStanding } from "@/lib/clubs/types";
import type { FixtureMatch } from "@/lib/fixture";
import { normalizarNombreEquipo } from "@/lib/league/utils";
import { ArrowIcon, CrownIcon } from "./ClubsIcons";

function clubMeta(name: string, clubs: ClubRecord[]) {
  const key = normalizarNombreEquipo(name);
  return clubs.find((club) => normalizarNombreEquipo(club.nombre) === key);
}

function Crest({ name, logo, size = "lg" }: { name: string; logo?: string | null; size?: "md" | "lg" }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  const sizeClass = size === "lg" ? "h-24 w-24 sm:h-28 sm:w-28" : "h-12 w-12";
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-white/95 ${sizeClass}`}>
      {logo ? <img src={logo} alt="" className="h-full w-full object-contain p-2" /> : <span className="text-lg font-black text-[#466a84]">{initials}</span>}
    </span>
  );
}

export default function ClubsLeader({
  leader,
  season,
  division,
  nextMatch,
  clubs,
}: {
  leader: ClubStanding | null;
  season: string;
  division: string;
  nextMatch: FixtureMatch | null;
  clubs: ClubRecord[];
}) {
  if (!leader) {
    return (
      <section className="bg-[#06375e] text-white">
        <div className="mx-auto max-w-[1680px] px-5 py-8 sm:px-8 lg:px-10">
          <p className="text-sm font-bold text-white/60">Todavía no hay clubes con datos para esta selección.</p>
        </div>
      </section>
    );
  }

  const opponentName = clubOpponent(nextMatch, leader.nombre);
  const opponent = opponentName ? clubMeta(opponentName, clubs) : null;

  return (
    <section className="border-y border-[#0d4f7b] bg-[#06375e] text-white">
      <div className="mx-auto max-w-[1680px] px-5 py-7 sm:px-8 lg:px-10">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,.9fr)_minmax(280px,.72fr)] lg:items-center">
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-3 text-[#6fd0f7]">
              <CrownIcon className="h-7 w-7" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#6fd0f7]">Club destacado</p>
                <h2 className="text-[24px] font-black uppercase leading-none sm:text-[28px]">Líder actual</h2>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-5">
              <TeamLink name={leader.nombre} slug={leader.slug} temporada={season} className="shrink-0 text-white">
                <Crest name={leader.nombre} logo={leader.logo_url} />
              </TeamLink>
              <div className="min-w-0">
                <TeamLink name={leader.nombre} slug={leader.slug} temporada={season} className="block max-w-full text-white">
                  <h3 className="truncate text-[23px] font-black uppercase leading-tight sm:text-[30px]">{leader.nombre}</h3>
                </TeamLink>
                <p className="mt-1.5 text-[13px] font-semibold text-white/65 sm:text-sm">{displayLabel(season)} · {division} División</p>
                <div className="mt-4 flex items-center gap-1.5">
                  {leader.forma.length ? leader.forma.map((result, index) => (
                    <span key={`${result}-${index}`} className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-black ${result === "W" ? "bg-[#37b97b] text-white" : result === "D" ? "bg-white/15 text-white" : "bg-[#e0525b] text-white"}`}>
                      {result === "W" ? "G" : result === "D" ? "E" : "P"}
                    </span>
                  )) : <span className="text-[12px] font-semibold text-white/45">Sin forma disponible</span>}
                  {leader.forma.length ? <span className="ml-2 text-[11px] font-semibold text-white/50">Últimos 5 partidos</span> : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 overflow-hidden border-y border-white/12 lg:border-x lg:border-y-0">
            <div className="px-3 py-4 text-center lg:py-7">
              <strong className="block text-[34px] font-black leading-none text-[#71d2fa]">1°</strong>
              <span className="mt-2 block text-[10px] font-black uppercase tracking-wide text-white/55">Posición</span>
            </div>
            <div className="border-x border-white/12 px-3 py-4 text-center lg:py-7">
              <strong className="block text-[34px] font-black leading-none">{leader.puntos}</strong>
              <span className="mt-2 block text-[10px] font-black uppercase tracking-wide text-white/55">Puntos</span>
            </div>
            <div className="px-3 py-4 text-center lg:py-7">
              <strong className="block text-[34px] font-black leading-none">{leader.pj}</strong>
              <span className="mt-2 block text-[10px] font-black uppercase tracking-wide text-white/55">PJ</span>
            </div>
            <div className="col-span-3 grid grid-cols-5 border-t border-white/12 px-3 py-3 text-center">
              {[
                ["G", leader.pg], ["E", leader.pe], ["P", leader.pp], ["GF", leader.gf], ["DG", leader.dg > 0 ? `+${leader.dg}` : leader.dg],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <strong className="block text-[16px] font-black">{value}</strong>
                  <span className="text-[9px] font-black text-white/45">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:pl-2">
            <p className="text-[11px] font-black uppercase tracking-[.12em] text-[#71d2fa]">Próximo partido</p>
            {displayLabel(nextMatch && opponentName ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <Crest name={leader.nombre} logo={leader.logo_url} size="md" />
                  <span className="text-[12px] font-black text-white/55">VS</span>
                  <TeamLink name={opponentName} slug={opponent?.slug} temporada={season} className="text-white">
                    <Crest name={opponentName} logo={opponent?.logo_url} size="md" />
                  </TeamLink>
                </div>
                <p className="mt-3 text-[14px] font-black">{formatClubMatchDate(nextMatch)} {nextMatch.hora ? `· ${nextMatch.hora}` : ""}</p>
                <p className="mt-1 text-[11px] font-semibold text-white/50">{nextMatch.competicion ? String(nextMatch.competicion).replaceAll("_", " ") : "Competición Liga"}</p>
              </>
            ) : (
              <p className="mt-3 text-[13px] font-semibold text-white/55">No hay un próximo partido cargado.</p>
            ))}
            <TeamLink name={leader.nombre} slug={leader.slug} temporada={season} className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-[#5fc4ef] px-5 text-[12px] font-black text-[#7ad5fb] hover:bg-[#0b4c7b] hover:text-white">
              Ver perfil del club <ArrowIcon className="h-4 w-4" />
            </TeamLink>
          </div>
        </div>
      </div>
    </section>
  );
}
