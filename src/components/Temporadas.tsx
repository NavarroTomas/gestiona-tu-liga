"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Panel from "./ui/Panel";

export default function Temporadas() {

  const [temporadas, setTemporadas] = useState<any[]>([]);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {

    const { data } = await supabase
      .from("temporadas")
      .select("id, nombre, campeon, activa, created_at");

    setTemporadas(data || []);

  }

  return (

    <Panel>

      <div className="relative z-10">

        <div className="flex items-center justify-between mb-6">

          <div>

            <p className="
              text-sky-400
              text-xs
              font-black
              tracking-[5px]
              uppercase
              mb-2
            ">
              League History
            </p>

            <h2 className="
              text-3xl
              font-black
              text-white
            ">
              TORNEOS
            </h2>

          </div>

        </div>

        <div className="space-y-3">

          {temporadas.map((t, index) => (

            <div
              key={index}
              className="
                rounded-2xl
                bg-gradient-to-b
                from-[#1f2937]
                to-[#111827]
                border-2
                border-[#334155]
                p-5
                flex items-center justify-between
              "
            >

              <div>

                <h3 className="
                  text-2xl
                  font-black
                  text-white
                ">
                  {t.nombre}
                </h3>

              </div>

              <div className="
                text-yellow-300
                font-black
                text-xl
              ">
                🏆 {t.campeon}
              </div>

            </div>

          ))}

        </div>

      </div>

    </Panel>

  );

}