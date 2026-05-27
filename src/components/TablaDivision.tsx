"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

export default function TablaDivision({
  temporada,
  division,
}: {
  temporada: string;
  division: string;
}) {
  const [tabla, setTabla] = useState<EquipoTabla[]>([]);

  useEffect(() => {
    cargarTabla();
  }, [temporada, division]);

  async function cargarTabla() {
    const { data, error } = await supabase
      .from("partidos")
      .select("*")
      .eq("temporada", temporada)
      .eq("division", division);

    if (error) {
      console.log(error);
      return;
    }

    const equipos: { [key: string]: EquipoTabla } = {};

    data?.forEach((partido: any) => {
      if (!partido.resultado || !partido.resultado.includes("-")) return;

      const local = partido.local;
      const visitante = partido.visitante;

      const golesLocal = parseInt(partido.resultado.split("-")[0].trim());
      const golesVisitante = parseInt(partido.resultado.split("-")[1].trim());

      if (isNaN(golesLocal) || isNaN(golesVisitante)) return;

      if (!equipos[local]) {
        equipos[local] = {
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

      if (!equipos[visitante]) {
        equipos[visitante] = {
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

      equipos[local].pj += 1;
      equipos[visitante].pj += 1;

      equipos[local].gf += golesLocal;
      equipos[local].gc += golesVisitante;

      equipos[visitante].gf += golesVisitante;
      equipos[visitante].gc += golesLocal;

      if (golesLocal > golesVisitante) {
        equipos[local].pg += 1;
        equipos[local].puntos += 3;
        equipos[visitante].pp += 1;
      } else if (golesVisitante > golesLocal) {
        equipos[visitante].pg += 1;
        equipos[visitante].puntos += 3;
        equipos[local].pp += 1;
      } else {
        equipos[local].pe += 1;
        equipos[visitante].pe += 1;
        equipos[local].puntos += 1;
        equipos[visitante].puntos += 1;
      }
    });

    const tablaFinal = Object.values(equipos)
      .map((equipo) => ({
        ...equipo,
        dg: equipo.gf - equipo.gc,
      }))
      .sort(
        (a, b) =>
          b.puntos - a.puntos ||
          b.dg - a.dg ||
          b.gf - a.gf
      );

    setTabla(tablaFinal);
  }

  return (
    <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-widest border-b border-white/[0.06]">
              <th className="py-4 text-left">#</th>
              <th className="py-4 text-left">Equipo</th>
              <th className="py-4 text-center">PJ</th>
              <th className="py-4 text-center">PG</th>
              <th className="py-4 text-center">PE</th>
              <th className="py-4 text-center">PP</th>
              <th className="py-4 text-center">DG</th>
              <th className="py-4 text-center">PTS</th>
            </tr>
          </thead>

          <tbody>
            {tabla.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-zinc-500">
                  Todavía no hay partidos cargados para esta temporada y división.
                </td>
              </tr>
            ) : (
              tabla.map((equipo, index) => (
                <tr
                  key={equipo.nombre}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition"
                >
                  <td className="py-4 font-black text-sky-400">
                    {index + 1}
                  </td>

                  <td className="py-4 font-black text-white">
                    {equipo.nombre}
                  </td>

                  <td className="py-4 text-center font-bold">{equipo.pj}</td>
                  <td className="py-4 text-center font-bold text-emerald-400">{equipo.pg}</td>
                  <td className="py-4 text-center font-bold text-zinc-300">{equipo.pe}</td>
                  <td className="py-4 text-center font-bold text-rose-400">{equipo.pp}</td>

                  <td className="py-4 text-center font-bold text-cyan-300">
                    {equipo.dg > 0 ? "+" : ""}
                    {equipo.dg}
                  </td>

                  <td className="py-4 text-center">
                    <span className="bg-sky-400 text-black px-4 py-2 rounded-xl font-black">
                      {equipo.puntos}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}