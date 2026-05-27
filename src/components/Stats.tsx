"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Stats() {

  const [equipos, setEquipos] = useState(0);
  const [partidos, setPartidos] = useState(0);
  const [jugadores, setJugadores] = useState(0);
  const [topGoleador, setTopGoleador] = useState("");

  useEffect(() => {
    cargarStats();
  }, []);

  async function cargarStats() {

    const { data: equiposData } = await supabase
      .from("equipos")
      .select("*");

    const { data: partidosData } = await supabase
      .from("partidos")
      .select("*");

    const { data: jugadoresData } = await supabase
      .from("jugadores")
      .select("*");

    const { data: goleadorData } = await supabase
      .from("jugadores")
      .select("*")
      .order("goles", { ascending: false })
      .limit(1);

    setEquipos(equiposData?.length || 0);
    setPartidos(partidosData?.length || 0);
    setJugadores(jugadoresData?.length || 0);

    if (goleadorData && goleadorData.length > 0) {
      setTopGoleador(goleadorData[0].nombre);
    }
  }

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-2xl">

        <p className="text-zinc-500 mb-2">
          Equipos
        </p>

        <h2 className="text-5xl font-black">
          {equipos}
        </h2>

      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-2xl">

        <p className="text-zinc-500 mb-2">
          Partidos
        </p>

        <h2 className="text-5xl font-black">
          {partidos}
        </h2>

      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-2xl">

        <p className="text-zinc-500 mb-2">
          Jugadores
        </p>

        <h2 className="text-5xl font-black">
          {jugadores}
        </h2>

      </div>

      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-black rounded-3xl p-6 shadow-2xl">

        <p className="font-semibold mb-2">
          Top Scorer
        </p>

        <h2 className="text-4xl font-black">
          ⚽ {topGoleador}
        </h2>

      </div>

    </div>

  );
}