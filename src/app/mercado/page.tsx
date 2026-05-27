"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MercadoPage() {
  const temporadas = [
    "Temporada 1",
    "Temporada 2",
    "Temporada 3",
    "Temporada 4",
    "Temporada 5",
  ];

  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [temporada, setTemporada] = useState("Temporada 1");
  const [division, setDivision] = useState("Primera");
  const [movimientos, setMovimientos] = useState<any[]>([]);

  useEffect(() => {
    cargarMovimientos();
  }, [temporada, division]);

  async function cargarMovimientos() {
    const { data, error } = await supabase
      .from("transferencias")
      .select("*")
      .eq("temporada", temporada)
      .eq("division", division)
      .order("fecha", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setMovimientos(data || []);
  }

  function colorTipo(tipo: string) {
    if (tipo === "Fichaje") return "bg-emerald-400 text-black";
    if (tipo === "Salida") return "bg-red-500 text-white";
    if (tipo === "Préstamo") return "bg-yellow-300 text-black";
    return "bg-sky-400 text-black";
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-10">
        <div>
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            APA PSO ARGENTINA
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">
            Mercado de Pases
          </h1>

          <p className="mt-4 text-zinc-400">
            Fichajes, salidas, préstamos y jugadores libres.
          </p>
        </div>

        <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6 space-y-6">
          <div>
            <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold mb-3">
              Temporada
            </p>

            <div className="flex flex-wrap gap-3">
              {temporadas.map((temp) => (
                <button
                  key={temp}
                  onClick={() => setTemporada(temp)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase ${
                    temporada === temp
                      ? "bg-sky-400 text-black"
                      : "bg-[#0b0f14] text-zinc-400 hover:text-white"
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold mb-3">
              División
            </p>

            <div className="flex flex-wrap gap-3">
              {divisiones.map((div) => (
                <button
                  key={div}
                  onClick={() => setDivision(div)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase ${
                    division === div
                      ? "bg-sky-400 text-black"
                      : "bg-[#0b0f14] text-zinc-400 hover:text-white"
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {movimientos.length === 0 ? (
            <div className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-8 text-zinc-500">
              Todavía no hay movimientos cargados.
            </div>
          ) : (
            movimientos.map((m) => (
              <div
                key={m.id}
                className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <span
                      className={`inline-block px-4 py-2 rounded-xl font-black text-sm ${colorTipo(
                        m.tipo
                      )}`}
                    >
                      {m.tipo}
                    </span>

                    <h2 className="text-3xl font-black mt-4">
                      {m.jugador}
                    </h2>

                    <p className="text-zinc-400 mt-2">
                      {m.desde || "Libre"} → {m.hacia || "Sin destino"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-zinc-500 text-sm font-bold">
                      {m.temporada} · {m.division}
                    </p>

                    <p className="text-sky-400 font-black mt-1">
                      {m.fecha || "Sin fecha"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}