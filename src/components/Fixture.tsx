"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Fixture() {

  const [partidos, setPartidos] = useState<any[]>([]);

  useEffect(() => {
    obtenerPartidos();
  }, []);

  async function obtenerPartidos() {

    const { data } = await supabase
      .from("partidos")
      .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora")
      .order("fecha", { ascending: true });

    setPartidos(data || []);
  }

  return (

    <div className="relative overflow-hidden rounded-[35px] border border-sky-300/20 bg-gradient-to-br from-sky-400/10 via-white/5 to-cyan-400/10 backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(56,189,248,0.15)]">

      {/* GLOW */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-sky-400/10 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/10 blur-[150px]" />

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between mb-8">

        <div>

          <p className="uppercase tracking-[5px] text-sky-300 text-sm font-black mb-2">
            APA PSO ARGENTINA
          </p>

          <h2 className="text-4xl font-black text-white">
            Fixture Oficial
          </h2>

        </div>

        <div className="
          bg-gradient-to-r
          from-sky-300
          to-cyan-300
          text-black
          px-5 py-3
          rounded-2xl
          font-black
        ">
          EN VIVO
        </div>

      </div>

      {/* PARTIDOS */}
      <div className="relative z-10 space-y-6">

        {partidos.map((partido, index) => (

          <div
            key={index}
            className="
              relative
              overflow-hidden
              bg-[#0b1220]
              border border-sky-300/20
              rounded-[28px]
              px-8 py-6
              hover:scale-[1.01]
              hover:border-sky-300/40
              transition-all duration-300
            "
          >

            {/* BRILLO */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 via-transparent to-cyan-300/5" />

            {/* FECHA */}
            <div className="relative z-10 flex justify-between items-center mb-6">

              <div className="flex items-center gap-3">

                <div className="w-3 h-3 rounded-full bg-sky-300" />

                <p className="text-sky-200 font-bold tracking-wide">
                  FECHA {partido.fecha}
                </p>

              </div>

              <div className="
                bg-green-400/20
                border border-green-400/20
                px-4 py-1
                rounded-full
              ">

                <p className="text-green-300 text-sm font-black">
                  FINALIZADO
                </p>

              </div>

            </div>

            {/* SCOREBOARD */}
            <div className="relative z-10 grid grid-cols-3 items-center">

              {/* LOCAL */}
              <div className="flex items-center gap-4">

                <img
                  src={`/logos/${partido.local.toLowerCase()}.png`}
                  className="
                    w-16 h-16
                    rounded-full
                    object-cover
                    border-2 border-sky-300/30
                    shadow-xl
                  "
                />

                <div>

                  <p className="text-2xl font-black text-white">
                    {partido.local}
                  </p>

                  <p className="text-sky-200 text-sm font-semibold">
                    LOCAL
                  </p>

                </div>

              </div>

              {/* RESULTADO */}
              <div className="flex justify-center">

                <div className="
                  relative
                  bg-white
                  text-black
                  px-10 py-4
                  rounded-[18px]
                  border-[3px] border-sky-300
                  shadow-[0_0_30px_rgba(125,211,252,0.4)]
                  min-w-[220px]
                  text-center
                ">

                  {/* BARRAS */}
                  <div className="
                    absolute
                    top-0 left-0
                    w-5 h-full
                    bg-sky-300
                    skew-x-[-20deg]
                    -translate-x-2
                  " />

                  <div className="
                    absolute
                    top-0 right-0
                    w-5 h-full
                    bg-cyan-300
                    skew-x-[-20deg]
                    translate-x-2
                  " />

                  <p className="
                    relative z-10
                    text-5xl
                    font-black
                    tracking-widest
                  ">
                    {partido.resultado}
                  </p>

                </div>

              </div>

              {/* VISITANTE */}
              <div className="flex items-center justify-end gap-4">

                <div className="text-right">

                  <p className="text-2xl font-black text-white">
                    {partido.visitante}
                  </p>

                  <p className="text-sky-200 text-sm font-semibold">
                    VISITANTE
                  </p>

                </div>

                <img
                  src={`/logos/${partido.visitante.toLowerCase()}.png`}
                  className="
                    w-16 h-16
                    rounded-full
                    object-cover
                    border-2 border-cyan-300/30
                    shadow-xl
                  "
                />

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}