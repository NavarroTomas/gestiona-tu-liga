"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Panel from "./ui/Panel";

export default function MatchCenter() {

  const [partido, setPartido] = useState<any>(null);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {

    const { data } = await supabase
      .from("partidos")
      .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora")
      .limit(1);

    if (data && data.length > 0) {
      setPartido(data[0]);
    }

  }

  if (!partido) return null;

  return (

    <Panel>

      <div className="relative z-10">

        {/* HEADER */}

        <div
          className="
            flex items-center justify-between
            mb-5
          "
        >

          <div>

            <p
              className="
                text-sky-400
                text-xs
                font-black
                tracking-[5px]
                uppercase
                mb-2
              "
            >
              Match Center
            </p>

            <h2
              className="
                text-2xl
                md:text-4xl
                font-black
                text-white
              "
            >
              PARTIDO DESTACADO
            </h2>

          </div>

        </div>

        {/* SCOREBOARD */}

        <div
          className="
            rounded-[22px]

            bg-gradient-to-br
            from-[#111827]
            to-black

            border
            border-[#334155]

            p-5

            flex flex-col
            lg:flex-row

            items-center
            justify-between

            gap-6
          "
        >

          {/* LOCAL */}

          <div className="flex-1 text-center min-w-0">

            <div
              className="
                w-16 h-16
                md:w-20 md:h-20

                mx-auto mb-4

                rounded-full

                bg-gradient-to-b
                from-sky-400
                to-blue-900
              "
            />

            <h3
              className="
                text-xl
                md:text-3xl

                font-black
                uppercase
                text-white

                truncate
              "
            >
              {partido.local}
            </h3>

          </div>

          {/* RESULTADO */}

          <div className="flex flex-col items-center shrink-0">

            <div
              className="
                flex items-center
                gap-3
              "
            >

              <div
                className="
                  text-4xl
                  md:text-6xl

                  font-black
                  font-mono
                  text-white
                "
              >
                {partido.resultado?.split("-")[0]}
              </div>

              <div
                className="
                  text-sky-400
                  text-lg
                  md:text-xl
                  font-black
                "
              >
                VS
              </div>

              <div
                className="
                  text-4xl
                  md:text-6xl

                  font-black
                  font-mono
                  text-white
                "
              >
                {partido.resultado?.split("-")[1]}
              </div>

            </div>

            <div
              className="
                mt-4

                bg-[#0d131d]
                border border-[#243041]

                px-4 py-2
                rounded-xl

                text-zinc-400
                text-xs
                font-black
                uppercase
                tracking-widest
              "
            >
              FECHA {partido.fecha}
            </div>

          </div>

          {/* VISITANTE */}

          <div className="flex-1 text-center min-w-0">

            <div
              className="
                w-16 h-16
                md:w-20 md:h-20

                mx-auto mb-4

                rounded-full

                bg-gradient-to-b
                from-sky-400
                to-blue-900
              "
            />

            <h3
              className="
                text-xl
                md:text-3xl

                font-black
                uppercase
                text-white

                truncate
              "
            >
              {partido.visitante}
            </h3>

          </div>

        </div>

      </div>

    </Panel>

  );

}