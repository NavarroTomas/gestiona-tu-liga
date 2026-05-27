"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function JugadorPage() {
  const params = useParams();
  const nombre = decodeURIComponent(params.nombre as string);

  const [partidos, setPartidos] = useState<any[]>([]);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const { data, error } = await supabase
      .from("partido_jugadores")
      .select("*")
      .eq("nombre", nombre);

    if (error) {
      console.log(error);
      return;
    }

    setPartidos(data || []);
  }

  const totalGoles = partidos.reduce((acc, p) => acc + (p.goles || 0), 0);
  const totalAsistencias = partidos.reduce((acc, p) => acc + (p.asistencias || 0), 0);
  const totalMvp = partidos.reduce((acc, p) => acc + (p.mvp || 0), 0);

  const carrera: any = {};

  partidos.forEach((p) => {
    const key = `${p.equipo}-${p.temporada}-${p.division}`;

    if (!carrera[key]) {
      carrera[key] = {
        equipo: p.equipo,
        temporada: p.temporada,
        division: p.division,
        goles: 0,
        asistencias: 0,
        mvp: 0,
        partidos: 0,
      };
    }

    carrera[key].goles += p.goles || 0;
    carrera[key].asistencias += p.asistencias || 0;
    carrera[key].mvp += p.mvp || 0;
    carrera[key].partidos += 1;
  });

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-black mb-8">{nombre}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">Goles totales</p>
          <h2 className="text-4xl font-black">⚽ {totalGoles}</h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">Asistencias</p>
          <h2 className="text-4xl font-black">🎯 {totalAsistencias}</h2>
        </div>

        <div className="bg-yellow-500 text-black p-6 rounded-2xl">
          <p>MVP</p>
          <h2 className="text-4xl font-black">👑 {totalMvp}</h2>
        </div>

        <div className="bg-green-500 text-black p-6 rounded-2xl">
          <p>Partidos</p>
          <h2 className="text-4xl font-black">{partidos.length}</h2>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-4">Carrera por club</h2>

      <div className="space-y-4">
        {Object.values(carrera).map((c: any, index) => (
          <div key={index} className="bg-zinc-900 p-5 rounded-2xl flex justify-between">
            <div>
              <p className="text-xl font-bold">{c.equipo}</p>
              <p className="text-zinc-400">
                {c.temporada} — {c.division}
              </p>
            </div>

            <div className="text-right">
              <p>⚽ {c.goles} | 🎯 {c.asistencias} | 👑 {c.mvp}</p>
              <p className="text-zinc-400">{c.partidos} partidos</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}