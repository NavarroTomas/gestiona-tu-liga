"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Header() {

  const [temporada, setTemporada] = useState("");

  useEffect(() => {
    obtenerTemporada();
  }, []);

  async function obtenerTemporada() {

    const { data } = await supabase
      .from("temporadas")
      .select("id, nombre, campeon, activa, created_at")
      .eq("activa", true)
      .single();

    if (data) {
      setTemporada(data.nombre);
    }
  }

  return (

    <div className="mb-10">

      <div className="flex items-center justify-between mb-6">

        <div>

          <p className="uppercase text-cyan-400 text-sm tracking-[5px] mb-3 font-bold">
            APA PSO ARGENTINA
          </p>

          <h1 className="text-6xl font-black tracking-tight">
            {temporada}
          </h1>

          <p className="text-zinc-500 mt-3 text-lg">
            Estadísticas, fixture y resultados en tiempo real
          </p>

        </div>

        <div className="bg-[#111111] border border-zinc-800 rounded-2xl px-6 py-4">

          <p className="text-zinc-500 text-sm mb-1">
            Estado de Liga
          </p>

          <p className="text-green-400 font-bold">
            ● En Competencia
          </p>

        </div>

      </div>

    </div>

  );
}