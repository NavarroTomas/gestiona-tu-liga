"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Equipos() {

  const [equipos, setEquipos] = useState<any[]>([]);

  useEffect(() => {
    obtenerEquipos();
  }, []);

  async function obtenerEquipos() {

    const { data, error } = await supabase
      .from("equipos")
      .select("*")
      .order("puntos", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setEquipos(data || []);
  }

  return (

    <div className="bg-zinc-900 rounded-3xl p-6">

      <h3 className="text-2xl font-bold mb-5">
        Equipos
      </h3>

      <div className="space-y-3">

        {equipos.map((equipo, index) => (

          <a
            key={index}
            href={`/equipo/${equipo.nombre}`}
            className="block bg-zinc-800 p-4 rounded-xl hover:scale-105 transition"
          >

            <div className="flex justify-between">

              <p className="font-bold">
                #{index + 1} {equipo.nombre}
              </p>

              <p className="text-zinc-400">
                {equipo.puntos} pts
              </p>

            </div>

          </a>

        ))}

      </div>

    </div>
  );
}