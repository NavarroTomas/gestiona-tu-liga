"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Jugadores() {

  const [jugadores, setJugadores] = useState<any[]>([]);

  useEffect(() => {
    cargar();

    const interval = setInterval(() => {
      cargar();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  async function cargar() {

    const { data, error } = await supabase
      .from("jugadores")
      .select("*")
      .order("goles", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setJugadores(data || []);
  }

  return (

    <div className="bg-zinc-900 p-6 rounded-3xl">

      <h3 className="text-2xl font-bold mb-6">
        Jugadores
      </h3>

      <div className="space-y-3">

        {jugadores.map((jugador, index) => (

          <a
            key={index}
            href={`/jugador/${jugador.nombre}`}
            className="block bg-zinc-800 p-4 rounded-xl hover:scale-105 transition"
          >

            <div className="flex justify-between items-center">

              <div>
                <p className="font-bold">
                  #{index + 1} {jugador.nombre}
                </p>

                <p className="text-zinc-400 text-sm">
                  {jugador.equipo}
                </p>
              </div>

              <div className="text-right">

                <p className="font-bold">
                  ⚽ {jugador.goles}
                </p>

                <p className="text-zinc-400 text-sm">
                  🎯 {jugador.asistencias}
                </p>

              </div>

            </div>

          </a>

        ))}

      </div>

    </div>
  );
}