import Link from "next/link";
import type { EquipoStats, JugadorStats, PartidoInfo } from "./types";
import { ratingJugador } from "./utils";

function TeamIdentity({
  name,
  logo,
  align = "left",
}: {
  name: string;
  logo: string | null;
  align?: "left" | "right";
}) {
  return (
    <Link
      href={`/equipos/${encodeURIComponent(name)}`}
      className={`match-report-team ${align === "right" ? "match-report-team-right" : ""}`}
    >
      <div className="match-report-crest-plate">
        <div className="match-report-crest">
          {logo ? (
            <img
              src={logo}
              alt={name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          ) : (
            <span>{name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
      </div>
      <h1>{name}</h1>
    </Link>
  );
}

export default function MatchHero({
  partido,
  local,
  visitante,
  mvp,
  localLogo,
  visitanteLogo,
}: {
  partido: PartidoInfo;
  local: EquipoStats;
  visitante: EquipoStats;
  mvp: JugadorStats | undefined;
  localLogo: string | null;
  visitanteLogo: string | null;
}) {
  return (
    <section className="match-report-hero relative overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020714] p-5 sm:rounded-[36px] md:p-10 shadow-[0_0_55px_rgba(0,120,255,.2)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.12),transparent_40%)]" />
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-400 sm:text-xs sm:tracking-[0.45em]">
          APA PSO ARGENTINA
        </p>

        <div className="mt-7 grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8">
          <TeamIdentity name={partido.local || local.equipo} logo={localLogo} />

          <div className="text-center">
            <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] font-black">Resultado final</p>
            <div className="match-report-score mt-4 inline-flex items-center justify-center rounded-[24px] border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 sm:rounded-[30px] sm:px-8 sm:py-6 shadow-[0_0_30px_rgba(250,204,21,.12)]">
              <span className="text-4xl font-black text-yellow-400 sm:text-5xl md:text-7xl whitespace-nowrap">
                {local.goals ?? 0}-{visitante.goals ?? 0}
              </span>
            </div>
            <p className="mt-5 text-zinc-500 uppercase tracking-[0.18em] text-xs font-black">
              Fecha {partido.fecha || local.fecha} · {partido.temporada || local.temporada} · {partido.division || local.division}
            </p>
            {(partido.dia || partido.hora) && (
              <p className="mt-2 text-zinc-500 uppercase tracking-[0.14em] text-[10px] font-black">
                {[partido.dia, partido.hora].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          <TeamIdentity name={partido.visitante || visitante.equipo} logo={visitanteLogo} align="right" />
        </div>

        {mvp && (
          <div className="match-report-mvp mt-8 rounded-[24px] border border-yellow-400/30 bg-gradient-to-r from-yellow-300 to-amber-500 p-5 text-black sm:rounded-[28px] sm:p-6">
            <p className="text-sm uppercase tracking-[0.25em] font-black">MVP del partido</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              <div>
                {mvp.playerId ? (
                  <Link href={`/jugadores/${encodeURIComponent(mvp.playerId)}`} className="block">
                    <h2 className="text-xl font-black uppercase sm:text-3xl md:text-4xl">{mvp.nombre}</h2>
                  </Link>
                ) : (
                  <h2 className="text-xl font-black uppercase sm:text-3xl md:text-4xl">{mvp.nombre}</h2>
                )}
                <Link href={`/equipos/${encodeURIComponent(mvp.equipo)}`} className="mt-2 inline-block font-bold uppercase tracking-[0.1em]">
                  {mvp.equipo}
                </Link>
              </div>

              <div className="flex gap-3">
                <div className="rounded-2xl bg-black/15 px-5 py-3 font-black">Score {mvp.score ?? 0}</div>
                <div className="rounded-2xl bg-black/15 px-5 py-3 font-black">Rating {ratingJugador(mvp)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
