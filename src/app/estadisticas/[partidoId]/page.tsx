"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PartidoEstadisticasPage() {
  const params = useParams();
  const partidoId = decodeURIComponent(params.partidoId as string);

  const [equipos, setEquipos] = useState<any[]>([]);
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);
  const [verDetalleCompleto, setVerDetalleCompleto] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [partidoId]);

  function valorGKSave(r: any) {
    return Number(r.gKSAVES || r.gKSaves || r.gksaves || 0);
  }

  async function cargarDatos() {
    const { data: equiposData } = await supabase
      .from("estadisticas_equipos")
      .select("*")
      .eq("partido_id", partidoId);

    const { data: jugadoresData } = await supabase
      .from("estadisticas_jugadores")
      .select("*")
      .eq("partido_id", partidoId)
      .order("score", { ascending: false });

    const nombresEquipos = (equiposData || [])
      .map((e: any) => e.equipo)
      .filter(Boolean);

    const { data: clubesData } = await supabase
      .from("clubes_info")
      .select("*")
      .in("nombre", nombresEquipos);

    setEquipos(equiposData || []);
    setJugadores(jugadoresData || []);
    setClubesInfo(clubesData || []);
  }

  const local = equipos[0];
  const visitante = equipos[1];

  const mvp = jugadores.find((j) => Number(j.mvp) === 1);

  const topJugadores = jugadores.slice(0, 6);

  const goleadores = jugadores
    .filter((j) => Number(j.goals || 0) > 0)
    .sort((a, b) => Number(b.goals || 0) - Number(a.goals || 0));

  const asistidores = jugadores
    .filter((j) => Number(j.assists || 0) > 0)
    .sort((a, b) => Number(b.assists || 0) - Number(a.assists || 0));

  function logoEquipo(nombre?: string) {
    if (!nombre) return null;

    const club = clubesInfo.find(
      (c) =>
        String(c.nombre || "").toLowerCase().trim() ===
        String(nombre || "").toLowerCase().trim(),
    );

    return club?.logo_url || null;
  }

  const arqueros = jugadores.filter(
    (j) => valorGKSave(j) > 0 || Number(j.gKCatches) > 0,
  );

  const ordenPosiciones: Record<string, number> = {
    GK: 1,
    LB: 2,
    CB: 3,
    RB: 4,
    CDM: 5,
    CM: 6,
    CAM: 7,
    LW: 8,
    RW: 9,
    ST: 10,
  };

  function ordenarPorEquipoPosicionScore(lista: any[], equipo: string) {
    return lista
      .filter((j) => j.equipo === equipo)
      .sort((a, b) => {
        const posA = ordenPosiciones[a.posicion] || 99;
        const posB = ordenPosiciones[b.posicion] || 99;

        if (posA !== posB) return posA - posB;

        return Number(b.score || 0) - Number(a.score || 0);
      });
  }


  function EscudoReal({ nombre, grande = false }: { nombre?: string; grande?: boolean }) {
    const logo = logoEquipo(nombre);
    const size = grande ? "h-28 w-28 text-3xl" : "h-16 w-16 text-lg";

    return (
      <div
        className={`${size} overflow-hidden rounded-full border border-sky-400/30 bg-gradient-to-b from-sky-400/20 to-blue-950 flex items-center justify-center font-black shadow-[0_0_25px_rgba(56,189,248,.18)]`}
      >
        {logo ? (
          <img
            src={logo}
            alt={nombre || "Equipo"}
            className="h-full w-full object-cover"
          />
        ) : (
          nombre?.slice(0, 2).toUpperCase()
        )}
      </div>
    );
  }

  function EventoCard({
    icon,
    title,
    lista,
    stat,
    empty,
  }: {
    icon: string;
    title: string;
    lista: any[];
    stat: "goals" | "assists";
    empty: string;
  }) {
    return (
      <div className="rounded-[30px] border border-sky-500/20 bg-[#020714] p-6 shadow-[0_0_24px_rgba(0,120,255,.08)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
            {icon}
          </div>

          <h3 className="text-2xl font-black uppercase">{title}</h3>
        </div>

        {lista.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
            {empty}
          </p>
        ) : (
          <div className="space-y-3">
            {lista.slice(0, 5).map((j) => (
              <div
                key={`${title}-${j.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-lg font-black uppercase">
                    {j.nombre}
                  </p>

                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    {j.equipo}
                  </p>
                </div>

                <p className="text-4xl font-black text-yellow-300">
                  {Number(j[stat] || 0)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function StatBar({ label, a, b }: { label: string; a: number; b: number }) {
    const total = Number(a || 0) + Number(b || 0);

    const porcentajeA = total === 0 ? 50 : (Number(a || 0) / total) * 100;

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 text-sm font-black uppercase tracking-[0.15em]">
          <span className="text-sky-300">{a || 0}</span>

          <span className="text-center text-zinc-500">{label}</span>

          <span className="text-right text-sky-300">{b || 0}</span>
        </div>

        <div className="h-3 rounded-full overflow-hidden bg-black/50 border border-sky-500/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_18px_rgba(56,189,248,.45)]"
            style={{ width: `${porcentajeA}%` }}
          />
        </div>
      </div>
    );
  }

  function MiniStat({ label, value }: { label: string; value: any }) {
    return (
      <div className="rounded-2xl border border-sky-500/15 bg-black/35 p-4 backdrop-blur-sm">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.22em] font-black">
          {label}
        </p>

        <p className="text-3xl font-black mt-3 text-white">{value ?? 0}</p>
      </div>
    );
  }

  function PlayerStatCard({ label, value }: { label: string; value: any }) {
    return (
      <div className="rounded-xl border border-sky-500/10 bg-black/35 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-black">
          {label}
        </p>

        <p className="text-xl font-black mt-2">{value ?? 0}</p>
      </div>
    );
  }

  function JugadorDetalleCard({ j }: { j: any }) {
    return (
      <div className="rounded-[28px] border border-sky-500/15 bg-[#020714] p-5 shadow-[0_0_20px_rgba(0,120,255,.08)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
                {j.posicion || "-"}
              </span>

              <h3 className="text-3xl font-black uppercase">
                {j.mvp ? "⭐ " : ""}
                {j.nombre}
              </h3>
            </div>

            <p className="text-zinc-500 text-sm mt-3 uppercase tracking-[0.12em]">
              {j.equipo}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-2xl bg-yellow-300 text-black px-5 py-3 font-black shadow-[0_0_20px_rgba(250,204,21,.25)]">
              Score {j.score}
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-black/40 px-5 py-3 font-black">
              Rating {j.overallRating}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mt-6">
          <PlayerStatCard label="Goles" value={j.goals} />
          <PlayerStatCard label="Asist." value={j.assists} />
          <PlayerStatCard label="Tiros" value={j.shots} />
          <PlayerStatCard label="Al arco" value={j.shotsOnTarget} />
          <PlayerStatCard label="Pases" value={j.passes} />
          <PlayerStatCard label="P. clave" value={j.keyPasses} />
          <PlayerStatCard label="Tackles" value={j.tackles} />
          <PlayerStatCard label="T. clave" value={j.keyTackles} />
          <PlayerStatCard label="Interc." value={j.interceptions} />
          <PlayerStatCard label="I. clave" value={j.keyInterceptions} />
          <PlayerStatCard label="Perdidas" value={j.possessionsLost} />
          <PlayerStatCard label="Atajadas" value={valorGKSave(j)} />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-8">
        <Link
          href="/estadisticas"
          className="inline-flex items-center gap-2 rounded-2xl border border-sky-500/20 bg-sky-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-500/20"
        >
          ← Volver al Match Center
        </Link>

        <section className="relative overflow-hidden rounded-[36px] border border-sky-500/30 bg-[#020714] p-6 md:p-10 shadow-[0_0_55px_rgba(0,120,255,.2)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.12),transparent_40%)]" />

          <div className="relative z-10">
            <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
              APA PSO ARGENTINA
            </p>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8">
              <div className="text-center lg:text-left">
                <div className="flex lg:block justify-center">
                  <EscudoReal nombre={local?.equipo} grande />
                </div>

                <h1 className="mt-5 text-3xl md:text-5xl font-black uppercase leading-tight">
                  {local?.equipo}
                </h1>
              </div>

              <div className="text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] font-black">
                  Resultado final
                </p>

                <div className="mt-4 inline-flex items-center justify-center rounded-[30px] border border-yellow-400/30 bg-yellow-400/10 px-8 py-6 shadow-[0_0_30px_rgba(250,204,21,.12)]">
                  <span className="text-5xl md:text-7xl font-black text-yellow-400 whitespace-nowrap drop-shadow-[0_0_10px_rgba(250,204,21,.45)]">
                    {local?.goals}-{visitante?.goals}
                  </span>
                </div>

                <p className="mt-5 text-zinc-500 uppercase tracking-[0.18em] text-xs font-black">
                  Fecha {local?.fecha} · {local?.temporada} · {local?.division}
                </p>
              </div>

              <div className="text-center lg:text-right">
                <div className="flex lg:block justify-center">
                  <EscudoReal nombre={visitante?.equipo} grande />
                </div>

                <h1 className="mt-5 text-3xl md:text-5xl font-black uppercase leading-tight">
                  {visitante?.equipo}
                </h1>
              </div>
            </div>

            {mvp && (
              <div className="mt-10 rounded-[28px] border border-yellow-400/30 bg-gradient-to-r from-yellow-300 to-amber-500 text-black p-6 shadow-[0_0_30px_rgba(250,204,21,.22)]">
                <p className="text-sm uppercase tracking-[0.25em] font-black">
                  MVP del partido
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-black uppercase">
                      ⭐ {mvp.nombre}
                    </h2>

                    <p className="mt-2 font-bold uppercase tracking-[0.1em]">
                      {mvp.equipo}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="rounded-2xl bg-black/15 px-5 py-3 font-black">
                      Score {mvp.score}
                    </div>

                    <div className="rounded-2xl bg-black/15 px-5 py-3 font-black">
                      Rating {mvp.overallRating}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <EventoCard
            icon="⚽"
            title="Goleadores"
            lista={goleadores}
            stat="goals"
            empty="No hay goles registrados."
          />

          <EventoCard
            icon="🎯"
            title="Asistidores"
            lista={asistidores}
            stat="assists"
            empty="No hay asistencias registradas."
          />
        </section>

        {local && visitante && (
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 md:p-8 space-y-6">
            <h2 className="text-4xl font-black uppercase">
              Estadísticas principales
            </h2>

            <StatBar
              label="Posesión"
              a={local.possession}
              b={visitante.possession}
            />
            <StatBar label="Tiros" a={local.shots} b={visitante.shots} />
            <StatBar
              label="Al arco"
              a={local.shotsOnTarget}
              b={visitante.shotsOnTarget}
            />
            <StatBar label="Pases" a={local.passes} b={visitante.passes} />
            <StatBar
              label="P. clave"
              a={local.keyPasses}
              b={visitante.keyPasses}
            />
            <StatBar label="Tackles" a={local.tackles} b={visitante.tackles} />
            <StatBar
              label="Intercepciones"
              a={local.interceptions}
              b={visitante.interceptions}
            />
            <StatBar label="Faltas" a={local.fouls} b={visitante.fouls} />
            <StatBar
              label="Corners"
              a={local.cornerKicks}
              b={visitante.cornerKicks}
            />
          </section>
        )}

        <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 md:p-8">
          <h2 className="text-4xl font-black uppercase mb-8">
            Mejores jugadores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {topJugadores.map((j, index) => (
              <div
                key={j.id}
                className="rounded-[28px] border border-sky-500/15 bg-black/35 p-5 transition hover:border-sky-400/35 hover:shadow-[0_0_20px_rgba(56,189,248,.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.15em]">
                      #{index + 1}
                    </p>

                    <h3 className="mt-2 text-3xl font-black uppercase">
                      {j.mvp ? "⭐ " : ""}
                      {j.nombre}
                    </h3>

                    <p className="mt-2 text-zinc-500 uppercase tracking-[0.1em] text-xs">
                      {j.equipo} · {j.posicion || "Sin posición"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-yellow-300 text-black px-4 py-2 font-black shadow-[0_0_18px_rgba(250,204,21,.18)]">
                    {j.score}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <MiniStat label="Goles" value={j.goals} />
                  <MiniStat label="Asist." value={j.assists} />
                  <MiniStat label="Rating" value={j.overallRating} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {local && visitante && (
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {[local, visitante].map((equipo) => (
              <div
                key={equipo.id}
                className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 md:p-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <EscudoReal nombre={equipo.equipo} />

                  <div>
                    <h2 className="text-3xl font-black uppercase">
                      {equipo.equipo}
                    </h2>

                    <p className="text-zinc-500 uppercase tracking-[0.15em] text-xs mt-1">
                      Estadísticas completas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <MiniStat label="Goles" value={equipo.goals} />
                  <MiniStat label="Asistencias" value={equipo.assists} />
                  <MiniStat label="Posesión" value={`${equipo.possession}%`} />
                  <MiniStat label="Tiros" value={equipo.shots} />
                  <MiniStat label="Al arco" value={equipo.shotsOnTarget} />
                  <MiniStat label="Pases" value={equipo.passes} />
                  <MiniStat label="P. clave" value={equipo.keyPasses} />
                  <MiniStat label="Tackles" value={equipo.tackles} />
                  <MiniStat
                    label="Intercepciones"
                    value={equipo.interceptions}
                  />
                  <MiniStat label="Perdidas" value={equipo.possessionsLost} />
                  <MiniStat label="Faltas" value={equipo.fouls} />
                  <MiniStat label="Corners" value={equipo.cornerKicks} />
                </div>
              </div>
            ))}
          </section>
        )}

        {arqueros.length > 0 && (
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 md:p-8">
            <h2 className="text-4xl font-black uppercase mb-8">Arqueros</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {arqueros.map((j) => (
                <div
                  key={j.id}
                  className="rounded-[28px] border border-sky-500/15 bg-black/35 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-black uppercase">
                        {j.nombre}
                      </h3>

                      <p className="text-zinc-500 uppercase tracking-[0.12em] text-xs mt-2">
                        {j.equipo}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-sky-400/10 border border-sky-400/20 px-4 py-2 text-sky-300 font-black">
                      GK
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <MiniStat label="Atajadas" value={valorGKSave(j)} />
                    <MiniStat label="Atrapadas" value={j.gKCatches} />
                    <MiniStat label="Rating" value={j.overallRating} />
                    <MiniStat label="Score" value={j.score} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-4xl font-black uppercase">
                Detalle completo
              </h2>

              <p className="text-zinc-500 uppercase tracking-[0.15em] text-xs mt-2">
                Ordenado por posición y score
              </p>
            </div>

            <button
              onClick={() => setVerDetalleCompleto(!verDetalleCompleto)}
              className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-400/20"
            >
              {verDetalleCompleto ? "Ocultar detalle" : "Ver detalle"}
            </button>
          </div>

          {verDetalleCompleto && local && visitante && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {[local.equipo, visitante.equipo].map((equipoNombre) => (
                <div key={equipoNombre} className="space-y-5">
                  <div className="rounded-[28px] border border-sky-500/15 bg-black/35 p-5">
                    <h3 className="text-3xl font-black uppercase">
                      {equipoNombre}
                    </h3>
                  </div>

                  {ordenarPorEquipoPosicionScore(jugadores, equipoNombre).map(
                    (j) => (
                      <JugadorDetalleCard key={j.id} j={j} />
                    ),
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
