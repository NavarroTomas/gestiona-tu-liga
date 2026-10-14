import Link from "next/link";
import type { EquipoStats, JugadorStats } from "./types";
import { ordenarPorEquipoPosicionScore, ratingJugador, valorGKSave } from "./utils";

function MiniStat({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-2xl border border-sky-500/15 bg-black/35 p-4 backdrop-blur-sm">
      <p className="text-zinc-500 text-[10px] uppercase tracking-[0.22em] font-black">{label}</p>
      <p className="mt-3 text-2xl font-black text-white sm:text-3xl">{String(value ?? 0)}</p>
    </div>
  );
}

function PlayerName({ player }: { player: JugadorStats }) {
  return player.playerId ? (
    <Link href={`/jugadores/${encodeURIComponent(player.playerId)}`} className="hover:underline">
      {player.nombre}
    </Link>
  ) : (
    <>{player.nombre}</>
  );
}

function TeamName({ name }: { name: string }) {
  return (
    <Link href={`/equipos/${encodeURIComponent(name)}`} className="hover:underline">
      {name}
    </Link>
  );
}

function EventoCard({
  title,
  lista,
  stat,
  empty,
}: {
  title: string;
  lista: JugadorStats[];
  stat: "goals" | "assists";
  empty: string;
}) {
  return (
    <div className="rounded-[24px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[30px] sm:p-6">
      <h3 className="text-xl font-black uppercase sm:text-2xl">{title}</h3>
      {lista.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">{empty}</p>
      ) : (
        <div className="mt-5 space-y-3">
          {lista.slice(0, 5).map((j) => (
            <div key={`${title}-${j.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 p-4">
              <div className="min-w-0">
                <p className="break-words text-base font-black uppercase sm:truncate sm:text-lg"><PlayerName player={j} /></p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500"><TeamName name={j.equipo} /></p>
              </div>
              <p className="text-3xl font-black sm:text-4xl">{Number(j[stat] || 0)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MatchEvents({ goleadores, asistidores }: { goleadores: JugadorStats[]; asistidores: JugadorStats[] }) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <EventoCard title="Goleadores" lista={goleadores} stat="goals" empty="No hay goles registrados." />
      <EventoCard title="Asistidores" lista={asistidores} stat="assists" empty="No hay asistencias registradas." />
    </section>
  );
}

function StatBar({ label, a, b }: { label: string; a?: number | null; b?: number | null }) {
  const total = Number(a || 0) + Number(b || 0);
  const porcentajeA = total === 0 ? 50 : (Number(a || 0) / total) * 100;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 text-sm font-black uppercase tracking-[0.15em]">
        <span>{a || 0}</span><span className="text-center">{label}</span><span className="text-right">{b || 0}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden border">
        <div className="h-full rounded-full" style={{ width: `${porcentajeA}%` }} />
      </div>
    </div>
  );
}

export function MatchComparison({ local, visitante }: { local: EquipoStats; visitante: EquipoStats }) {
  return (
    <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-8 space-y-6">
      <h2 className="text-xl font-black uppercase sm:text-3xl md:text-4xl">Estadísticas principales</h2>
      <StatBar label="Posesión" a={local.possession} b={visitante.possession} />
      <StatBar label="Tiros" a={local.shots} b={visitante.shots} />
      <StatBar label="Al arco" a={local.shotsOnTarget} b={visitante.shotsOnTarget} />
      <StatBar label="Pases" a={local.passes} b={visitante.passes} />
      <StatBar label="P. clave" a={local.keyPasses} b={visitante.keyPasses} />
      <StatBar label="Tackles" a={local.tackles} b={visitante.tackles} />
      <StatBar label="Intercepciones" a={local.interceptions} b={visitante.interceptions} />
      <StatBar label="Faltas" a={local.fouls} b={visitante.fouls} />
      <StatBar label="Corners" a={local.cornerKicks} b={visitante.cornerKicks} />
    </section>
  );
}

export function TopPlayers({ players }: { players: JugadorStats[] }) {
  return (
    <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-8">
      <h2 className="mb-8 text-xl font-black uppercase sm:text-3xl md:text-4xl">Mejores jugadores</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {players.map((j, index) => (
          <div key={j.id} className="rounded-[24px] border border-sky-500/15 bg-black/35 p-4 sm:rounded-[28px] sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.15em]">#{index + 1}</p>
                <h3 className="mt-2 break-words text-2xl font-black uppercase md:text-3xl"><PlayerName player={j} /></h3>
                <p className="mt-2 text-zinc-500 uppercase tracking-[0.1em] text-xs"><TeamName name={j.equipo} /> · {j.posicion || "Sin posición"}</p>
              </div>
              <div className="rounded-2xl px-4 py-2 font-black">{j.score ?? 0}</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <MiniStat label="Goles" value={j.goals} />
              <MiniStat label="Asist." value={j.assists} />
              <MiniStat label="Valoración" value={ratingJugador(j)} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TeamDetails({ teams, logoEquipo }: { teams: EquipoStats[]; logoEquipo: (name: string) => string | null }) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {teams.map((equipo) => (
        <div key={equipo.id} className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 overflow-hidden rounded-full border flex items-center justify-center">
              {logoEquipo(equipo.equipo) ? <img src={logoEquipo(equipo.equipo) || ""} alt={equipo.equipo} className="h-full w-full object-contain" /> : equipo.equipo.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase md:text-3xl"><TeamName name={equipo.equipo} /></h2>
              <p className="text-zinc-500 uppercase tracking-[0.15em] text-xs mt-1">Estadísticas completas</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MiniStat label="Goles" value={equipo.goals} /><MiniStat label="Asistencias" value={equipo.assists} /><MiniStat label="Posesión" value={`${equipo.possession ?? 0}%`} />
            <MiniStat label="Tiros" value={equipo.shots} /><MiniStat label="Al arco" value={equipo.shotsOnTarget} /><MiniStat label="Pases" value={equipo.passes} />
            <MiniStat label="P. clave" value={equipo.keyPasses} /><MiniStat label="Tackles" value={equipo.tackles} /><MiniStat label="Intercepciones" value={equipo.interceptions} />
            <MiniStat label="Perdidas" value={equipo.possessionsLost} /><MiniStat label="Faltas" value={equipo.fouls} /><MiniStat label="Corners" value={equipo.cornerKicks} />
          </div>
        </div>
      ))}
    </section>
  );
}

export function Goalkeepers({ players }: { players: JugadorStats[] }) {
  if (players.length === 0) return null;
  return (
    <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-8">
      <h2 className="mb-8 text-xl font-black uppercase sm:text-3xl md:text-4xl">Arqueros</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {players.map((j) => (
          <div key={j.id} className="rounded-[24px] border border-sky-500/15 bg-black/35 p-4 sm:rounded-[28px] sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div><h3 className="text-2xl font-black uppercase md:text-3xl"><PlayerName player={j} /></h3><p className="text-zinc-500 uppercase tracking-[0.12em] text-xs mt-2"><TeamName name={j.equipo} /></p></div>
              <div className="rounded-2xl border px-4 py-2 font-black">GK</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <MiniStat label="Atajadas" value={valorGKSave(j as JugadorStats & Record<string, unknown>)} />
              <MiniStat label="Atrapadas" value={j.gKCatches} />
              <MiniStat label="Valoración" value={ratingJugador(j)} />
              <MiniStat label="Score" value={j.score} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlayerStatCard({ label, value }: { label: string; value: unknown }) {
  return <div className="rounded-xl border p-3"><p className="text-[10px] uppercase tracking-[0.18em] font-black">{label}</p><p className="text-xl font-black mt-2">{String(value ?? 0)}</p></div>;
}

function PlayerDetailCard({ j }: { j: JugadorStats }) {
  return (
    <div className="rounded-[28px] border p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div><div className="flex flex-wrap items-center gap-3"><span className="rounded-xl border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]">{j.posicion || "-"}</span><h3 className="text-2xl font-black uppercase md:text-3xl"><PlayerName player={j} /></h3></div><p className="text-sm mt-3 uppercase tracking-[0.12em]"><TeamName name={j.equipo} /></p></div>
        <div className="flex gap-3"><div className="rounded-2xl px-4 py-3 font-black">Score {j.score ?? 0}</div><div className="rounded-2xl border px-4 py-3 font-black">Rating {ratingJugador(j)}</div></div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <PlayerStatCard label="Goles" value={j.goals} /><PlayerStatCard label="Asist." value={j.assists} /><PlayerStatCard label="Tiros" value={j.shots} /><PlayerStatCard label="Al arco" value={j.shotsOnTarget} /><PlayerStatCard label="Pases" value={j.passes} /><PlayerStatCard label="P. clave" value={j.keyPasses} />
        <PlayerStatCard label="Tackles" value={j.tackles} /><PlayerStatCard label="T. clave" value={j.keyTackles} /><PlayerStatCard label="Interc." value={j.interceptions} /><PlayerStatCard label="I. clave" value={j.keyInterceptions} /><PlayerStatCard label="Perdidas" value={j.possessionsLost} /><PlayerStatCard label="Atajadas" value={valorGKSave(j as JugadorStats & Record<string, unknown>)} />
      </div>
    </div>
  );
}

export function FullPlayerDetails({ players, teams, open, onToggle }: { players: JugadorStats[]; teams: string[]; open: boolean; onToggle: () => void }) {
  return (
    <section className="rounded-[28px] border p-5 sm:rounded-[34px] md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div><h2 className="text-xl font-black uppercase sm:text-3xl md:text-4xl">Detalle completo</h2><p className="uppercase tracking-[0.15em] text-xs mt-2">Ordenado por posición y score</p></div>
        <button onClick={onToggle} className="rounded-2xl border px-6 py-4 text-sm font-black uppercase tracking-[0.18em]">{open ? "Ocultar detalle" : "Ver detalle"}</button>
      </div>
      {open && <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">{teams.map((team) => <div key={team} className="space-y-5"><div className="rounded-[24px] border p-5"><h3 className="text-2xl font-black uppercase md:text-3xl"><TeamName name={team} /></h3></div>{ordenarPorEquipoPosicionScore(players, team).map((j) => <PlayerDetailCard key={j.id} j={j} />)}</div>)}</div>}
    </section>
  );
}
