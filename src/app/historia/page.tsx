"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface RankingJugador {
  nombre: string;
  playerId: string;
  equipo: string;
  partidos: number;
  goles: number;
  asistencias: number;
  mvps: number;
  score: number;
  ratingPromedio: number;
  atajadas: number;
  tackles: number;
  intercepciones: number;
}

export default function HistoriaPage() {
  const [jugadores, setJugadores] = useState<RankingJugador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHistoria();
  }, []);

  async function cargarHistoria() {
    const { data, error } = await supabase
      .from("estadisticas_jugadores")
      .select("*");

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    const mapa: { [key: string]: any } = {};

    data?.forEach((j: any) => {
      const nombre = (j.nombre || "").trim();
      const playerId = (j.playerId || "").trim();

      if (!nombre) return;

      const clave = playerId || nombre;

      if (!mapa[clave]) {
        mapa[clave] = {
          nombre,
          playerId,
          equipo: j.equipo || "Sin Club",
          partidos: 0,
          goles: 0,
          asistencias: 0,
          mvps: 0,
          score: 0,
          ratingTotal: 0,
          ratingPromedio: 0,
          atajadas: 0,
          tackles: 0,
          intercepciones: 0,
        };
      }

      mapa[clave].partidos += 1;
      mapa[clave].goles += Number(j.goals) || 0;
      mapa[clave].asistencias += Number(j.assists) || 0;
      mapa[clave].mvps += Number(j.mvp) || 0;
      mapa[clave].score += Number(j.score) || 0;
      mapa[clave].ratingTotal += Number(j.overallRating) || 0;
      mapa[clave].atajadas += Number(j.gKSAVES) || 0;
      mapa[clave].tackles += Number(j.tackles) || 0;
      mapa[clave].intercepciones += Number(j.interceptions) || 0;

      if (j.equipo) mapa[clave].equipo = j.equipo;
      if (j.nombre) mapa[clave].nombre = j.nombre;
      if (j.playerId) mapa[clave].playerId = j.playerId;
    });

    const lista = Object.values(mapa).map((j: any) => ({
      ...j,
      ratingPromedio:
        j.partidos > 0
          ? Math.round((j.ratingTotal / j.partidos) * 10) / 10
          : 0,
    }));

    setJugadores(lista);
    setLoading(false);
  }

  function top(campo: keyof RankingJugador) {
    return [...jugadores]
      .filter((j) => Number(j[campo]) > 0)
      .sort((a, b) => Number(b[campo]) - Number(a[campo]))
      .slice(0, 10);
  }

  function RankingBox({
    titulo,
    campo,
    color,
    sufijo = "",
  }: {
    titulo: string;
    campo: keyof RankingJugador;
    color: string;
    sufijo?: string;
  }) {
    const lista = top(campo);

    return (
      <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
        <h2 className="text-2xl font-black mb-5">{titulo}</h2>

        <div className="space-y-3">
          {lista.length === 0 ? (
            <p className="text-zinc-500">Todavía no hay datos.</p>
          ) : (
            lista.map((j, index) => (
              <Link
                key={j.playerId || j.nombre}
                href={
                  j.playerId
                    ? `/jugadores/${encodeURIComponent(j.playerId)}`
                    : "#"
                }
                className="flex items-center justify-between bg-[#0b0f14] border border-white/[0.05] rounded-2xl p-4 hover:border-sky-400/40 transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center font-black text-zinc-400 shrink-0">
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <p className="font-black text-white truncate">{j.nombre}</p>
                    <p className="text-sm text-zinc-500 truncate">
                      {j.equipo} · {j.partidos} PJ
                    </p>
                  </div>
                </div>

                <p className={`text-3xl font-black ${color} shrink-0`}>
                  {j[campo]}
                  {sufijo}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    );
  }

  const totalPartidos = jugadores.reduce((acc, j) => acc + j.partidos, 0);
  const totalGoles = jugadores.reduce((acc, j) => acc + j.goles, 0);
  const totalAsistencias = jugadores.reduce((acc, j) => acc + j.asistencias, 0);
  const totalMvps = jugadores.reduce((acc, j) => acc + j.mvps, 0);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0f14] text-white flex items-center justify-center">
        <p className="text-zinc-400">Cargando historia...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-10">
        <div>
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            APA PSO ARGENTINA
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">
            Historia de la Liga
          </h1>

          <p className="mt-4 text-zinc-400 max-w-2xl">
            Rankings históricos acumulados desde todos los TXT cargados.
          </p>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
            <p className="text-zinc-500 text-xs uppercase font-bold">
              Jugadores
            </p>
            <h2 className="text-5xl font-black mt-3">{jugadores.length}</h2>
          </div>

          <div className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
            <p className="text-zinc-500 text-xs uppercase font-bold">
              Registros
            </p>
            <h2 className="text-5xl font-black mt-3">{totalPartidos}</h2>
          </div>

          <div className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
            <p className="text-zinc-500 text-xs uppercase font-bold">
              Goles
            </p>
            <h2 className="text-5xl font-black mt-3 text-emerald-400">
              {totalGoles}
            </h2>
          </div>

          <div className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
            <p className="text-zinc-500 text-xs uppercase font-bold">
              MVPs
            </p>
            <h2 className="text-5xl font-black mt-3 text-yellow-300">
              {totalMvps}
            </h2>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <RankingBox
            titulo="Máximos goleadores históricos"
            campo="goles"
            color="text-emerald-400"
          />

          <RankingBox
            titulo="Máximos asistidores históricos"
            campo="asistencias"
            color="text-sky-400"
          />

          <RankingBox
            titulo="Más MVPs históricos"
            campo="mvps"
            color="text-yellow-300"
          />

          <RankingBox
            titulo="Mayor score total"
            campo="score"
            color="text-yellow-300"
          />

          <RankingBox
            titulo="Mejor rating promedio"
            campo="ratingPromedio"
            color="text-purple-300"
          />

          <RankingBox
            titulo="Más atajadas"
            campo="atajadas"
            color="text-cyan-300"
          />

          <RankingBox
            titulo="Más tackles"
            campo="tackles"
            color="text-rose-300"
          />

          <RankingBox
            titulo="Más intercepciones"
            campo="intercepciones"
            color="text-orange-300"
          />
        </section>
      </div>
    </main>
  );
}