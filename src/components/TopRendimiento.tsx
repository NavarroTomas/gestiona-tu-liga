"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function TopRendimiento() {

  const [jugadores, setJugadores] = useState<any[]>([]);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {

    const { data, error } = await supabase
      .from("jugadores")
      .select("*");

    if (error) {
      console.log(error);
      return;
    }

    if (!data) return;

    const conPromedio = data.map((j) => ({
      ...j,
      rendimiento: (j.goles || 0) + (j.asistencias || 0) + (j.mvp || 0) * 2,
    }));

    const ordenados = conPromedio.sort(
      (a, b) => b.rendimiento - a.rendimiento
    );

    setJugadores(ordenados.slice(0, 5));
  }

  return (

    <div className="bg-zinc-900 p-6 rounded-3xl">

      <h3 className="text-2xl font-bold mb-6">
        Rendimiento
      </h3>

      {jugadores.map((j, i) => (

        <div key={i} className="bg-zinc-800 p-3 rounded-xl mb-2">

          #{i + 1} {j.nombre} — 🔥 {j.rendimiento}

        </div>

      ))}

    </div>
  );
}