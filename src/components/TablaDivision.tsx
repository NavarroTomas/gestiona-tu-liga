"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface EquipoTabla {
  nombre: string;
  logo_url?: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  puntos: number;
  forma: ("W" | "D" | "L")[];
}

function normalizarDivision(division: string) {
  const value = String(division || "").toLowerCase();

  if (value.includes("primera")) return "primera";
  if (value.includes("segunda")) return "segunda";

  return value;
}

export default function TablaDivision({
  temporada,
  division,
}: {
  temporada: string;
  division: string;
}) {
  const [tabla, setTabla] = useState<EquipoTabla[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});

  useEffect(() => {
    cargarTabla();
  }, [temporada, division]);

  async function cargarTabla() {
    const { data, error } = await supabase
      .from("partidos")
      .select(
        "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora",
      )
      .eq("temporada", temporada)
      .eq("division", division);

    if (error) {
      console.log(error);
      return;
    }
    const divisionKey = normalizarDivision(division);

    const { data: equiposData, error: equiposError } = await supabase
      .from("v_clubes_temporada_public")
      .select("*")
      .eq("temporada", temporada)
      .eq("activo", true)
      .order("nombre", { ascending: true });

    if (equiposError) {
      console.log(equiposError);
    }

    const equiposFiltrados = (equiposData || []).filter(
      (e: any) => normalizarDivision(e.division) === divisionKey,
    );

    const logosMap: Record<string, string> = {};

    equiposFiltrados?.forEach((e) => {
      if (e.logo_url) {
        logosMap[e.nombre] = e.logo_url;
      }
    });

    setLogos(logosMap);

    const equipos: { [key: string]: EquipoTabla } = {};

    equiposFiltrados?.forEach((e) => {
      equipos[e.nombre] = {
        nombre: e.nombre,
        logo_url: e.logo_url || undefined,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0,
        puntos: 0,
        forma: [],
      };
    });

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
          forma: [],
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
          forma: [],
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
        equipos[local].forma.push("W");

        equipos[visitante].pp += 1;
        equipos[visitante].forma.push("L");
      } else if (golesVisitante > golesLocal) {
        equipos[visitante].pg += 1;
        equipos[visitante].puntos += 3;
        equipos[visitante].forma.push("W");

        equipos[local].pp += 1;
        equipos[local].forma.push("L");
      } else {
        equipos[local].pe += 1;
        equipos[visitante].pe += 1;

        equipos[local].puntos += 1;
        equipos[visitante].puntos += 1;

        equipos[local].forma.push("D");
        equipos[visitante].forma.push("D");
      }
    });

    const tablaFinal = Object.values(equipos)
      .map((equipo) => ({
        ...equipo,
        dg: equipo.gf - equipo.gc,
        forma: equipo.forma.slice(-5),
      }))
      .sort((a, b) => b.puntos - a.puntos || b.dg - a.dg || b.gf - a.gf);

    setTabla(tablaFinal);
  }

  function movimiento(index: number) {
    if (index === 0) return "▲";
    if (index === tabla.length - 1) return "▼";
    return "▬";
  }

  function colorMovimiento(index: number) {
    if (index === 0) return "text-green-400";
    if (index === tabla.length - 1) return "text-red-500";
    return "text-zinc-500";
  }

  function colorForma(resultado: "W" | "D" | "L") {
    if (resultado === "W")
      return "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,.7)]";

    if (resultado === "D")
      return "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,.6)]";

    return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,.65)]";
  }

  function zonaEquipo(index: number) {
    const puesto = index + 1;
    const esPrimera = normalizarDivision(division) === "primera";
    const esSegunda = normalizarDivision(division) === "segunda";

    if (esPrimera) {
      if (puesto === 1) {
        return {
          barra: "bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,.85)]",
          punto: "bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,.85)]",
          fila: "bg-gradient-to-r from-[#2b2306] via-[#101827] to-[#030b18] ring-1 ring-yellow-300/40 shadow-[0_0_28px_rgba(250,204,21,.16)]",
          movimiento: "text-yellow-300",
          simbolo: "★",
          etiqueta: "Campeón",
        };
      }

      if (puesto === tabla.length - 1) {
        return {
          barra: "bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,.75)]",
          punto: "bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,.75)]",
          fila: "bg-gradient-to-r from-[#2b1606] via-[#111827] to-[#030b18] ring-1 ring-orange-400/30",
          movimiento: "text-orange-300",
          simbolo: "◆",
          etiqueta: "Promoción",
        };
      }

      if (puesto === tabla.length) {
        return {
          barra: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.75)]",
          punto: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.75)]",
          fila: "bg-gradient-to-r from-[#2b0710] via-[#111827] to-[#030b18] ring-1 ring-red-500/30",
          movimiento: "text-red-400",
          simbolo: "▼",
          etiqueta: "Descenso",
        };
      }
    }

    if (esSegunda) {
      if (puesto === 1) {
        return {
          barra: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]",
          punto: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]",
          fila: "bg-gradient-to-r from-[#062b1b] via-[#071c36] to-[#030b18] ring-1 ring-emerald-400/35 shadow-[0_0_28px_rgba(52,211,153,.14)]",
          movimiento: "text-emerald-300",
          simbolo: "▲",
          etiqueta: "Ascenso",
        };
      }

      if (puesto >= 2 && puesto <= 5) {
        return {
          barra: "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,.75)]",
          punto: "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,.75)]",
          fila: "bg-gradient-to-r from-[#06233d] via-[#071a33] to-[#030b18] ring-1 ring-sky-400/20",
          movimiento: "text-sky-300",
          simbolo: "●",
          etiqueta: "Playoffs",
        };
      }
    }

    return {
      barra: "bg-zinc-600/60",
      punto: "bg-zinc-400 shadow-[0_0_8px_rgba(161,161,170,.45)]",
      fila: "bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18]",
      movimiento: "text-zinc-500",
      simbolo: "▬",
      etiqueta: "Normal",
    };
  }

  function textoReglamento() {
    if (normalizarDivision(division) === "primera") {
      return "★ 1° CAMPEÓN · 7° PROMOCIÓN · 8° DESCENSO DIRECTO ★";
    }

    if (normalizarDivision(division) === "segunda") {
      return "★ 1° ASCENSO DIRECTO · 2° AL 5° PLAYOFFS DE ASCENSO ★";
    }

    return "★ Torneo de Liga APA ★";
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-[#020814] shadow-[0_0_35px_rgba(0,120,255,.22)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,.13),transparent_58%)]" />

      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[880px] border-separate border-spacing-y-[6px] px-2 pb-2">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#061a33] text-[11px] font-black uppercase tracking-[0.28em] text-sky-300/80">
              <th className="py-3 text-center w-[68px] rounded-l-xl">#</th>
              <th className="py-3 text-left">Equipo</th>
              <th className="py-3 text-center">PJ</th>
              <th className="py-3 text-center">PG</th>
              <th className="py-3 text-center">PE</th>
              <th className="py-3 text-center">PP</th>
              <th className="py-3 text-center">GF</th>
              <th className="py-3 text-center">GC</th>
              <th className="py-3 text-center">DG</th>
              <th className="py-3 text-center">Forma</th>
              <th className="py-3 text-center rounded-r-xl">PTS</th>
            </tr>
          </thead>

          <tbody>
            {tabla.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-zinc-500">
                  No hay clubes cargados para esta temporada y división.
                </td>
              </tr>
            ) : (
              tabla.map((equipo, index) => {
                const zona = zonaEquipo(index);

                return (
                  <tr
                    key={equipo.nombre}
                    title={zona.etiqueta}
                    className={`group relative text-[12px] font-black uppercase transition-all duration-300 hover:scale-[1.008] hover:shadow-[0_0_22px_rgba(56,189,248,.16)] ${zona.fila}`}
                  >
                    <td className="relative rounded-l-xl py-3 text-center overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full w-[3px] ${zona.barra}`}
                      />

                      <div className="grid grid-cols-[22px_16px] items-center justify-center gap-1">
                        <span className="text-sky-200 text-center">
                          {index + 1}
                        </span>

                        <span
                          className={`flex h-[16px] w-[16px] items-center justify-center text-[9px] font-black leading-none ${zona.movimiento}`}
                        >
                          {zona.simbolo}
                        </span>
                      </div>
                    </td>

                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${zona.punto}`} />

                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-sky-400/40 bg-black">
                          {logos[equipo.nombre] ? (
                            <img
                              src={logos[equipo.nombre]}
                              alt={equipo.nombre}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-[10px] text-white">
                              {equipo.nombre.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <span className="max-w-[280px] truncate text-white">
                          {equipo.nombre}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-center text-zinc-300">
                      {equipo.pj}
                    </td>

                    <td className="py-3 text-center text-zinc-300">
                      {equipo.pg}
                    </td>

                    <td className="py-3 text-center text-zinc-300">
                      {equipo.pe}
                    </td>

                    <td className="py-3 text-center text-zinc-300">
                      {equipo.pp}
                    </td>

                    <td className="py-3 text-center text-zinc-300">
                      {equipo.gf}
                    </td>

                    <td className="py-3 text-center text-zinc-300">
                      {equipo.gc}
                    </td>

                    <td
                      className={`py-3 text-center ${
                        equipo.dg >= 0 ? "text-sky-300" : "text-red-400"
                      }`}
                    >
                      {equipo.dg > 0 ? "+" : ""}
                      {equipo.dg}
                    </td>

                    <td className="py-3">
                      <div className="flex justify-center gap-1.5">
                        {equipo.forma.length === 0 ? (
                          <span className="text-zinc-600">—</span>
                        ) : (
                          equipo.forma.map((resultado, i) => (
                            <span
                              key={`${equipo.nombre}-${i}`}
                              className={`h-2.5 w-2.5 rounded-full ${colorForma(
                                resultado,
                              )}`}
                            />
                          ))
                        )}
                      </div>
                    </td>

                    <td className="rounded-r-xl py-3 text-center">
                      <span className="bg-gradient-to-b from-yellow-300 to-amber-500 bg-clip-text text-2xl font-black text-transparent drop-shadow-[0_0_8px_rgba(250,204,21,.55)]">
                        {equipo.puntos}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="relative border-t border-sky-500/20 px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.25em] text-sky-300">
        {textoReglamento()}
      </div>
    </section>
  );
}
