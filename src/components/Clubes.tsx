"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function Clubes() {

  const [equipos, setEquipos] = useState<any[]>([]);

  useEffect(() => {
    obtenerEquipos();
  }, []);

  async function obtenerEquipos() {

    const { data } = await supabase
      .from("equipos")
      .select("*")
      .order("puntos", { ascending: false });

    setEquipos(data || []);
  }

  return (

    <div>

      <div className="mb-8">

        <p className="
          text-sky-300
          uppercase
          tracking-[5px]
          text-xs
          font-black
          mb-2
        ">
          Clubes Oficiales
        </p>

        <h2 className="
          text-4xl
          font-black
          text-white
        ">
          Equipos
        </h2>

      </div>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      ">

        {equipos.map((equipo, index) => (

          <Link
            key={index}
            href={`/equipos/${equipo.nombre}`}
            className="
              group
              relative overflow-hidden
              rounded-3xl
              bg-[#0b1728]
              border border-sky-300/10
              p-8
              transition-all duration-300
              hover:-translate-y-2
              hover:border-sky-300/30
              hover:shadow-[0_0_40px_rgba(56,189,248,0.3)]
            "
          >

            <div className="
              absolute top-0 right-0
              w-40 h-40
              bg-sky-400/10
              blur-[80px]
            " />

            <div className="
              relative z-10
              flex flex-col items-center
              text-center
            ">

              <div className="
                w-24 h-24
                rounded-full
                bg-black/20
                border-4 border-sky-300/20
                flex items-center justify-center
                text-3xl font-black
                text-sky-300
                mb-5
              ">
                {equipo.nombre.charAt(0)}
              </div>

              <h3 className="
                text-2xl
                font-black
                text-white
              ">
                {equipo.nombre}
              </h3>

              <div className="
                flex gap-6
                mt-5
              ">

                <div>

                  <p className="
                    text-zinc-500
                    text-xs
                    uppercase
                    font-bold
                  ">
                    PTS
                  </p>

                  <h4 className="
                    text-2xl
                    font-black
                    text-sky-300
                  ">
                    {equipo.puntos}
                  </h4>

                </div>

                <div>

                  <p className="
                    text-zinc-500
                    text-xs
                    uppercase
                    font-bold
                  ">
                    PJ
                  </p>

                  <h4 className="
                    text-2xl
                    font-black
                    text-white
                  ">
                    {equipo.pj}
                  </h4>

                </div>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </div>

  );
}