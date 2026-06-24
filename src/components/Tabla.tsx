"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Panel from "./ui/Panel";

interface EquipoTabla {
  nombre: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  puntos: number;
}

export default function Tabla() {

  const [equipos, setEquipos] = useState<EquipoTabla[]>([]);

  useEffect(() => {
    cargarTabla();
  }, []);

  async function cargarTabla() {

    const { data: partidos } = await supabase
      .from("partidos")
      .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora");

    if (!partidos) return;

    const tabla: { [key: string]: EquipoTabla } = {};

    partidos.forEach((p: any) => {

      if (
        !p.resultado ||
        !p.resultado.includes("-")
      ) return;

      const local = p.local;
      const visitante = p.visitante;

      const golesLocal = parseInt(
        p.resultado.split("-")[0]
      );

      const golesVisitante = parseInt(
        p.resultado.split("-")[1]
      );

      if (!tabla[local]) {

        tabla[local] = {
          nombre: local,
          pj: 0,
          pg: 0,
          pe: 0,
          pp: 0,
          gf: 0,
          gc: 0,
          dg: 0,
          puntos: 0,
        };

      }

      if (!tabla[visitante]) {

        tabla[visitante] = {
          nombre: visitante,
          pj: 0,
          pg: 0,
          pe: 0,
          pp: 0,
          gf: 0,
          gc: 0,
          dg: 0,
          puntos: 0,
        };

      }

      // PJ

      tabla[local].pj += 1;
      tabla[visitante].pj += 1;

      // GOLES

      tabla[local].gf += golesLocal;
      tabla[local].gc += golesVisitante;

      tabla[visitante].gf += golesVisitante;
      tabla[visitante].gc += golesLocal;

      // RESULTADO

      if (golesLocal > golesVisitante) {

        tabla[local].pg += 1;
        tabla[local].puntos += 3;

        tabla[visitante].pp += 1;

      }

      else if (golesVisitante > golesLocal) {

        tabla[visitante].pg += 1;
        tabla[visitante].puntos += 3;

        tabla[local].pp += 1;

      }

      else {

        tabla[local].pe += 1;
        tabla[visitante].pe += 1;

        tabla[local].puntos += 1;
        tabla[visitante].puntos += 1;

      }

    });

    const lista = Object.values(tabla)
      .map((e) => ({
        ...e,
        dg: e.gf - e.gc,
      }))
      .sort((a, b) =>
        b.puntos - a.puntos ||
        b.dg - a.dg ||
        b.gf - a.gf
      );

    setEquipos(lista);

  }

  return (

    <Panel>

      <div className="relative z-10">

        {/* HEADER */}

        <div className="
          flex items-center justify-between
          mb-6
        ">

          <div>

            <p className="
              text-sky-400
              text-xs
              font-black
              tracking-[5px]
              uppercase
              mb-2
            ">
              League Table
            </p>

            <h2 className="
              text-3xl
              md:text-4xl
              font-black
              text-white
            ">
              CLASIFICACIÓN
            </h2>

          </div>

        </div>

        {/* COLUMNAS */}

        <div className="
          hidden md:grid
          grid-cols-[80px_1.7fr_repeat(6,90px)]
          gap-2
          mb-3
          px-3
        ">

          <div className="text-zinc-500 text-xs font-black uppercase">
            POS
          </div>

          <div className="text-zinc-500 text-xs font-black uppercase">
            CLUB
          </div>

          <div className="text-zinc-500 text-xs font-black uppercase text-center">
            PJ
          </div>

          <div className="text-zinc-500 text-xs font-black uppercase text-center">
            PG
          </div>

          <div className="text-zinc-500 text-xs font-black uppercase text-center">
            PE
          </div>

          <div className="text-zinc-500 text-xs font-black uppercase text-center">
            PP
          </div>

          <div className="text-zinc-500 text-xs font-black uppercase text-center">
            DG
          </div>

          <div className="text-zinc-500 text-xs font-black uppercase text-center">
            PTS
          </div>

        </div>

        {/* FILAS */}

        <div className="space-y-3">

          {equipos.map((equipo, index) => (

            <div
              key={equipo.nombre}
              className="
                grid
                grid-cols-1
                md:grid-cols-[80px_1.7fr_repeat(6,90px)]
                items-center
                gap-2

                rounded-2xl
                border-2
                p-4

                bg-gradient-to-b
                from-[#222a36]
                to-[#121820]

                border-[#334155]

                hover:border-sky-400/40
                transition-all
              "
            >

              {/* POS */}

              <div className="
                w-12 h-12
                rounded-2xl
                bg-[#0d131d]
                border border-[#243041]

                flex items-center justify-center

                text-xl
                font-black
                font-mono
                text-white
              ">
                {index + 1}
              </div>

              {/* CLUB */}

              <div>

                <h3 className="
                  text-lg
                  font-black
                  uppercase
                  text-white
                ">
                  {equipo.nombre}
                </h3>

              </div>

              {/* STATS */}

              <div className="text-center text-white font-black font-mono">
                {equipo.pj}
              </div>

              <div className="text-center text-emerald-400 font-black font-mono">
                {equipo.pg}
              </div>

              <div className="text-center text-zinc-300 font-black font-mono">
                {equipo.pe}
              </div>

              <div className="text-center text-rose-400 font-black font-mono">
                {equipo.pp}
              </div>

              <div className="text-center text-cyan-300 font-black font-mono">
                {equipo.dg}
              </div>

              <div className="
                flex justify-center
              ">

                <div className="
                  bg-black/40
                  border border-sky-400/20
                  px-4 py-2
                  rounded-xl
                ">

                  <span className="
                    text-sky-300
                    text-2xl
                    font-black
                    font-mono
                  ">
                    {equipo.puntos}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </Panel>

  );

}