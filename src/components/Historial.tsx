"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Historial() {

  const [partidos, setPartidos] = useState<any[]>([]);

  useEffect(() => {
    obtenerPartidos();
  }, []);

  async function obtenerPartidos() {

    const { data, error } = await supabase
      .from("partidos")
      .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora")
      .order("fecha", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setPartidos(data || []);
  }

  return (

    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 shadow-2xl">

      <h3 className="text-2xl font-bold mb-6">
        Historial
      </h3>

      <div className="space-y-4 max-h-[500px] overflow-auto pr-2">

        {partidos.map((partido, index) => (

          <div
            key={index}
            className="bg-zinc-800/70 border border-zinc-700 rounded-2xl p-4"
          >

            <div className="flex justify-between items-center mb-3">

              <p className="text-zinc-500 text-sm">
                Fecha {partido.fecha}
              </p>

              <p className="text-green-400 text-sm font-bold">
                FINALIZADO
              </p>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <img
                  src={`/logos/${partido.local.toLowerCase()}.png`}
                  className="w-10 h-10 rounded-full"
                />

                <p className="font-bold">
                  {partido.local}
                </p>

              </div>

              <div className="text-center">

                <p className="text-3xl font-black">
                  {partido.resultado}
                </p>

              </div>

              <div className="flex items-center gap-3">

                <p className="font-bold">
                  {partido.visitante}
                </p>

                <img
                  src={`/logos/${partido.visitante.toLowerCase()}.png`}
                  className="w-10 h-10 rounded-full"
                />

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}