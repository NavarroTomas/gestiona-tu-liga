"use client";

import { useState } from "react";
import TablaDivision from "@/components/TablaDivision";

export default function DivisionesPage() {
  const [temporada, setTemporada] = useState("Temporada 1");
  const [division, setDivision] = useState("Primera");

  const temporadas = [
    "Temporada 1",
    "Temporada 2",
    "Temporada 3",
    "Temporada 4",
    "Temporada 5",
  ];

  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="bg-[#11151c] border-b border-white/[0.05]">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8">
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            APA PSO ARGENTINA
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">
            Divisiones
          </h1>

          <p className="mt-4 text-zinc-400 max-w-2xl">
            Tablas oficiales por temporada y categoría.
          </p>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-10">
        <div className="space-y-4">
          <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold">
            Temporadas
          </p>

          <div className="flex flex-wrap gap-3">
            {temporadas.map((temp) => (
              <button
                key={temp}
                onClick={() => setTemporada(temp)}
                className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                  temporada === temp
                    ? "bg-sky-400 text-black"
                    : "bg-[#11151c] text-zinc-400 hover:text-white"
                }`}
              >
                {temp}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold">
            Divisiones
          </p>

          <div className="flex flex-wrap gap-3">
            {divisiones.map((div) => (
              <button
                key={div}
                onClick={() => setDivision(div)}
                className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                  division === div
                    ? "bg-sky-400 text-black"
                    : "bg-[#11151c] text-zinc-400 hover:text-white"
                }`}
              >
                {div}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold">
            Tabla seleccionada
          </p>

          <h2 className="text-3xl font-black mt-2">
            {temporada} · {division}
          </h2>
        </div>

        <TablaDivision temporada={temporada} division={division} />
      </div>
    </main>
  );
}