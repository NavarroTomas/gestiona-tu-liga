"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {

  const [local, setLocal] = useState("");
  const [visitante, setVisitante] = useState("");
  const [resultado, setResultado] = useState("");
  const [fecha, setFecha] = useState("");

  async function agregarPartido() {

    const { error } = await supabase
      .from("partidos")
      .insert([
        {
          local,
          visitante,
          resultado,
          fecha: Number(fecha),
        },
      ]);

    if (error) {
      console.log(error);
      alert("Error");
      return;
    }

    alert("Resultado guardado");

    window.location.reload();
  }

  return (

    <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-8">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-4xl font-black">
            Panel Administrativo
          </h2>

          <p className="text-zinc-500 mt-2">
            Gestioná partidos y estadísticas
          </p>

        </div>

        <div className="bg-cyan-400 text-black px-5 py-3 rounded-2xl font-black">
          Liga ADMIN
        </div>

      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <div className="bg-black border border-zinc-800 rounded-2xl p-4">

          <p className="text-zinc-500 text-sm">
            Partidos cargados
          </p>

          <h2 className="text-3xl font-black mt-2">
            12
          </h2>

        </div>

        <div className="bg-black border border-zinc-800 rounded-2xl p-4">

          <p className="text-zinc-500 text-sm">
            Equipos activos
          </p>

          <h2 className="text-3xl font-black mt-2">
            4
          </h2>

        </div>

        <div className="bg-black border border-zinc-800 rounded-2xl p-4">

          <p className="text-zinc-500 text-sm">
            Torneo
          </p>

          <h2 className="text-3xl font-black mt-2">
            T1
          </h2>

        </div>

      </div>

      {/* FORM */}
      <div className="grid md:grid-cols-2 gap-4">

        <input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Equipo local"
          className="bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-cyan-400"
        />

        <input
          value={visitante}
          onChange={(e) => setVisitante(e.target.value)}
          placeholder="Equipo visitante"
          className="bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-cyan-400"
        />

        <input
          value={resultado}
          onChange={(e) => setResultado(e.target.value)}
          placeholder="Resultado"
          className="bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-cyan-400"
        />

        <input
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          placeholder="Fecha"
          className="bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-cyan-400"
        />

      </div>

      <button
        onClick={agregarPartido}
        className="mt-8 bg-cyan-400 hover:bg-cyan-300 transition text-black font-black px-8 py-4 rounded-2xl"
      >
        Guardar Resultado
      </button>

    </div>

  );
}