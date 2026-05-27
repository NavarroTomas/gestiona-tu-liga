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
  const [verDetalleCompleto, setVerDetalleCompleto] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [partidoId]);

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

    setEquipos(equiposData || []);
    setJugadores(jugadoresData || []);
  }

  const local = equipos[0];
  const visitante = equipos[1];
  const mvp = jugadores.find((j) => Number(j.mvp) === 1);
  const topJugadores = jugadores.slice(0, 6);
  const arqueros = jugadores.filter(
    (j) => Number(j.gKSaves) > 0 || Number(j.gKCatches) > 0
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

  function StatBar({ label, a, b }: { label: string; a: number; b: number }) {
    const total = Number(a || 0) + Number(b || 0);
    const porcentajeA = total === 0 ? 50 : (Number(a || 0) / total) * 100;

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 text-sm font-bold text-zinc-400">
          <span>{a || 0}</span>
          <span className="text-center">{label}</span>
          <span className="text-right">{b || 0}</span>
        </div>

        <div className="h-2 bg-[#0b0f14] rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full"
            style={{ width: `${porcentajeA}%` }}
          />
        </div>
      </div>
    );
  }

  function MiniStat({ label, value }: { label: string; value: any }) {
    return (
      <div className="bg-[#0b0f14] border border-white/[0.05] rounded-2xl p-4">
        <p className="text-zinc-500 text-xs uppercase font-bold">{label}</p>
        <p className="text-2xl font-black mt-2">{value ?? 0}</p>
      </div>
    );
  }

  function PlayerStatCard({ label, value }: { label: string; value: any }) {
    return (
      <div className="bg-[#0b0f14] border border-white/[0.05] rounded-xl p-3">
        <p className="text-[10px] text-zinc-500 uppercase font-black">
          {label}
        </p>

        <p className="text-lg font-black mt-1">
          {value ?? 0}
        </p>
      </div>
    );
  }

  function JugadorDetalleCard({ j }: { j: any }) {
    return (
      <div className="bg-[#0b0f14] border border-white/[0.05] rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-white/[0.06] text-zinc-300 px-3 py-1 rounded-xl text-xs font-black">
                {j.posicion || "-"}
              </span>

              <h3 className="text-2xl font-black">
                {j.mvp ? "⭐ " : ""}
                {j.nombre}
              </h3>
            </div>

            <p className="text-zinc-500 text-sm mt-2">
              ID: {j.playerId}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-yellow-300 text-black px-4 py-2 rounded-xl font-black">
              Score {j.score}
            </div>

            <div className="bg-white/[0.06] px-4 py-2 rounded-xl font-black">
              Rating {j.overallRating}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mt-5">
          <PlayerStatCard label="Goles" value={j.goals} />
          <PlayerStatCard label="Asist." value={j.assists} />
          <PlayerStatCard label="Tiros" value={j.shots} />
          <PlayerStatCard label="Tiros arco" value={j.shotsOnTarget} />
          <PlayerStatCard label="Pases" value={j.passes} />
          <PlayerStatCard label="Pases clave" value={j.keyPasses} />
          <PlayerStatCard label="Tackles" value={j.tackles} />
          <PlayerStatCard label="T. clave" value={j.keyTackles} />
          <PlayerStatCard label="Interc." value={j.interceptions} />
          <PlayerStatCard label="I. clave" value={j.keyInterceptions} />
          <PlayerStatCard label="Perdidas" value={j.possessionsLost} />
          <PlayerStatCard label="Atajadas" value={j.gKSaves} />
          <PlayerStatCard label="Atrapadas" value={j.gKCatches} />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 space-y-8">
        <Link href="/estadisticas" className="text-sky-400 font-bold">
          ← Volver a estadísticas
        </Link>

        <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6 md:p-8">
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            Match Center
          </p>

          <div className="mt-6 flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] items-center gap-6">
            <div className="w-full text-center lg:text-left">
              <h1 className="text-2xl md:text-4xl font-black break-words leading-tight">
                {local?.equipo}
              </h1>
            </div>

            <div className="text-center shrink-0">
              <p className="text-5xl md:text-8xl font-black font-mono whitespace-nowrap">
                {local?.goals} - {visitante?.goals}
              </p>

              <p className="mt-3 text-zinc-500 text-sm md:text-base font-bold">
                Fecha {local?.fecha} · {local?.temporada} · {local?.division}
              </p>
            </div>

            <div className="w-full text-center lg:text-right">
              <h1 className="text-2xl md:text-4xl font-black break-words leading-tight">
                {visitante?.equipo}
              </h1>
            </div>
          </div>

          {mvp && (
            <div className="mt-8 bg-yellow-300 text-black rounded-2xl p-5">
              <p className="text-sm font-black uppercase">
                MVP del partido por score
              </p>

              <h2 className="text-3xl font-black mt-1">
                ⭐ {mvp.nombre}
              </h2>

              <p className="font-bold">
                {mvp.equipo} · Score {mvp.score} · Rating {mvp.overallRating}
              </p>
            </div>
          )}
        </section>

        {local && visitante && (
          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6 space-y-5">
            <h2 className="text-3xl font-black">
              Estadísticas principales
            </h2>

            <StatBar label="Posesión" a={local.possession} b={visitante.possession} />
            <StatBar label="Tiros" a={local.shots} b={visitante.shots} />
            <StatBar label="Tiros al arco" a={local.shotsOnTarget} b={visitante.shotsOnTarget} />
            <StatBar label="Pases" a={local.passes} b={visitante.passes} />
            <StatBar label="Pases clave" a={local.keyPasses} b={visitante.keyPasses} />
            <StatBar label="Entradas" a={local.tackles} b={visitante.tackles} />
            <StatBar label="Intercepciones" a={local.interceptions} b={visitante.interceptions} />
            <StatBar label="Faltas" a={local.fouls} b={visitante.fouls} />
            <StatBar label="Corners" a={local.cornerKicks} b={visitante.cornerKicks} />
          </section>
        )}

        <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
          <h2 className="text-3xl font-black mb-6">
            Mejores jugadores por score
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {topJugadores.map((j, index) => (
              <div
                key={j.id}
                className="bg-[#0b0f14] border border-white/[0.05] rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-zinc-500 text-sm font-bold">
                      #{index + 1}
                    </p>

                    <h3 className="text-2xl font-black mt-1">
                      {j.mvp ? "⭐ " : ""}
                      {j.nombre}
                    </h3>

                    <p className="text-zinc-500 text-sm mt-1">
                      {j.equipo} · {j.posicion || "Sin posición"}
                    </p>
                  </div>

                  <div className="bg-yellow-300 text-black px-4 py-2 rounded-xl font-black">
                    {j.score}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
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
                className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6"
              >
                <h2 className="text-2xl font-black mb-5">
                  {equipo.equipo}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <MiniStat label="Goles" value={equipo.goals} />
                  <MiniStat label="Asistencias" value={equipo.assists} />
                  <MiniStat label="Posesión" value={`${equipo.possession}%`} />
                  <MiniStat label="Tiros" value={equipo.shots} />
                  <MiniStat label="Al arco" value={equipo.shotsOnTarget} />
                  <MiniStat label="Pases" value={equipo.passes} />
                  <MiniStat label="Pases clave" value={equipo.keyPasses} />
                  <MiniStat label="Tackles" value={equipo.tackles} />
                  <MiniStat label="Intercepciones" value={equipo.interceptions} />
                  <MiniStat label="Perdidas" value={equipo.possessionsLost} />
                  <MiniStat label="Faltas" value={equipo.fouls} />
                  <MiniStat label="Corners" value={equipo.cornerKicks} />
                  <MiniStat label="Laterales" value={equipo.throwIns} />
                  <MiniStat label="Amarillas" value={equipo.yellowCards} />
                  <MiniStat label="Rojas" value={equipo.redCards} />
                </div>
              </div>
            ))}
          </section>
        )}

        {arqueros.length > 0 && (
          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
            <h2 className="text-3xl font-black mb-6">
              Arqueros
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {arqueros.map((j) => (
                <div
                  key={j.id}
                  className="bg-[#0b0f14] border border-white/[0.05] rounded-2xl p-5"
                >
                  <h3 className="text-2xl font-black">
                    {j.nombre}
                  </h3>

                  <p className="text-zinc-500">
                    {j.equipo}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                    <MiniStat label="Atajadas" value={j.gKSaves} />
                    <MiniStat label="Atrapadas" value={j.gKCatches} />
                    <MiniStat label="Rating" value={j.overallRating} />
                    <MiniStat label="Score" value={j.score} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl font-black">
              Detalle completo
            </h2>

            <button
              onClick={() => setVerDetalleCompleto(!verDetalleCompleto)}
              className="bg-sky-400 text-black px-5 py-3 rounded-2xl font-black"
            >
              {verDetalleCompleto ? "Ocultar" : "Ver detalle"}
            </button>
          </div>

          {verDetalleCompleto && local && visitante && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {[local.equipo, visitante.equipo].map((equipoNombre) => (
                <div key={equipoNombre} className="space-y-4">
                  <div className="bg-[#0b0f14] border border-white/[0.05] rounded-2xl p-5">
                    <h3 className="text-2xl font-black">
                      {equipoNombre}
                    </h3>

                    <p className="text-zinc-500 text-sm mt-1">
                      Ordenado por posición y score
                    </p>
                  </div>

                  {ordenarPorEquipoPosicionScore(jugadores, equipoNombre).map((j) => (
                    <JugadorDetalleCard key={j.id} j={j} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}