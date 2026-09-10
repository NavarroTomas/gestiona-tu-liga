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
  const [proximosRivales, setProximosRivales] = useState<Record<string, string>>({});

  useEffect(() => {
    cargarTabla();
  }, [temporada, division]);

  async function cargarTabla() {
    const [partidosRes, equiposRes, sancionesRes] = await Promise.all([
      supabase
        .from("partidos")
        .select(
          "id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora",
        )
        .eq("temporada", temporada)
        .order("id", { ascending: true }),

      supabase
        .from("v_clubes_temporada_public")
        .select("*")
        .eq("temporada", temporada)
        .eq("activo", true)
        .order("nombre", { ascending: true }),

      supabase
        .from("sanciones_equipos")
        .select("equipo, puntos_descontados, competicion")
        .eq("temporada", temporada)
        .eq("competicion", "liga"),
    ]);

    if (partidosRes.error) {
      console.log(partidosRes.error);
      return;
    }

    if (equiposRes.error) {
      console.log(equiposRes.error);
    }

    const divisionKey = normalizarDivision(division);

    const partidosFiltrados = (partidosRes.data || []).filter(
      (p: any) => normalizarDivision(p.division) === divisionKey,
    );

    const equiposFiltrados = (equiposRes.data || []).filter(
      (e: any) => normalizarDivision(e.division) === divisionKey,
    );

    const logosMap: Record<string, string> = {};

    equiposFiltrados.forEach((e: any) => {
      if (e.logo_url) logosMap[e.nombre] = e.logo_url;
    });

    setLogos(logosMap);

    const equipos: Record<string, EquipoTabla> = {};

    equiposFiltrados.forEach((e: any) => {
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

    partidosFiltrados.forEach((partido: any) => {
      if (!partido.resultado) return;

      const match = String(partido.resultado).match(/(\d+)\s*[^0-9]\s*(\d+)/);
      if (!match) return;

      const local = partido.local;
      const visitante = partido.visitante;
      const golesLocal = Number(match[1]);
      const golesVisitante = Number(match[2]);

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

    if (sancionesRes.data?.length) {
      sancionesRes.data.forEach((sancion: any) => {
        if (equipos[sancion.equipo]) {
          equipos[sancion.equipo].puntos -= Number(sancion.puntos_descontados || 0);
        }
      });
    }

    const tablaFinal = Object.values(equipos)
      .map((equipo) => ({
        ...equipo,
        dg: equipo.gf - equipo.gc,
        forma: equipo.forma.slice(-5),
      }))
      .sort((a, b) => b.puntos - a.puntos || b.dg - a.dg || b.gf - a.gf);

    const proximos: Record<string, string> = {};

    partidosFiltrados.forEach((partido: any) => {
      if (partido.resultado) return;
      if (!partido.local || !partido.visitante) return;

      if (!proximos[partido.local]) proximos[partido.local] = partido.visitante;
      if (!proximos[partido.visitante]) proximos[partido.visitante] = partido.local;
    });

    setProximosRivales(proximos);
    setTabla(tablaFinal);
  }

  function colorForma(resultado: "W" | "D" | "L") {
    if (resultado === "W") return "bg-[#2fb56d]";
    if (resultado === "D") return "bg-[#b9c3cc]";
    return "bg-[#f0525d]";
  }

  function zonaEquipo(index: number) {
    const puesto = index + 1;
    const total = tabla.length;
    const esPrimera = normalizarDivision(division) === "primera";
    const esSegunda = normalizarDivision(division) === "segunda";

    if (esPrimera) {
      if (puesto === 1) return { barra: "bg-[#2497e6]", etiqueta: "Campeón" };
      if (puesto === total - 1) return { barra: "bg-[#f1a33b]", etiqueta: "Promoción" };
      if (puesto === total) return { barra: "bg-[#ef4855]", etiqueta: "Descenso" };
    }

    if (esSegunda) {
      if (puesto === 1) return { barra: "bg-[#2fb56d]", etiqueta: "Ascenso directo" };
      if (puesto >= 2 && puesto <= 5) return { barra: "bg-[#2497e6]", etiqueta: "Playoffs" };
    }

    return { barra: "bg-transparent", etiqueta: "" };
  }

  return (
    <section className="overflow-hidden rounded-[10px] border border-[#d7e6f0] bg-white text-[#102f55]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse">
          <thead>
            <tr className="h-11 border-b border-[#d7e6f0] bg-[#eef6fb] text-[11px] font-black uppercase tracking-[.04em] text-[#244d76]">
              <th className="w-[58px] px-3 text-center">#</th>
              <th className="min-w-[220px] px-3 text-left">Club</th>
              <th className="w-[58px] px-2 text-center">PJ</th>
              <th className="w-[52px] px-2 text-center">G</th>
              <th className="w-[52px] px-2 text-center">E</th>
              <th className="w-[52px] px-2 text-center">P</th>
              <th className="w-[68px] px-2 text-center">DG</th>
              <th className="w-[68px] px-2 text-center">PTS</th>
              <th className="w-[140px] px-3 text-center">Forma</th>
              <th className="min-w-[180px] px-3 text-left">Próximo rival</th>
            </tr>
          </thead>

          <tbody>
            {tabla.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-14 text-center text-sm font-semibold text-[#7890a8]">
                  No hay clubes cargados para esta temporada y división.
                </td>
              </tr>
            ) : (
              tabla.map((equipo, index) => {
                const zona = zonaEquipo(index);
                const rival = proximosRivales[equipo.nombre];

                return (
                  <tr
                    key={equipo.nombre}
                    title={zona.etiqueta || undefined}
                    className="group h-[46px] border-b border-[#e1ebf2] bg-white text-[12px] font-semibold transition-colors last:border-b-0 hover:bg-[#f5faff]"
                  >
                    <td className="relative px-3 text-center font-medium text-[#46698d]">
                      <span className={`absolute bottom-0 left-0 top-0 w-[3px] ${zona.barra}`} />
                      {index + 1}
                    </td>

                    <td className="px-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                          {logos[equipo.nombre] ? (
                            <img
                              src={logos[equipo.nombre]}
                              alt={equipo.nombre}
                              className="h-7 w-7 object-contain"
                            />
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#edf5fa] text-[9px] font-black text-[#597895]">
                              {equipo.nombre.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <span className="truncate font-bold text-[#173e68]">
                          {equipo.nombre}
                        </span>
                      </div>
                    </td>

                    <td className="px-2 text-center text-[#45698e]">{equipo.pj}</td>
                    <td className="px-2 text-center text-[#45698e]">{equipo.pg}</td>
                    <td className="px-2 text-center text-[#45698e]">{equipo.pe}</td>
                    <td className="px-2 text-center text-[#45698e]">{equipo.pp}</td>
                    <td className="px-2 text-center text-[#45698e]">
                      {equipo.dg > 0 ? "+" : ""}{equipo.dg}
                    </td>
                    <td className="px-2 text-center text-[13px] font-black text-[#102f55]">
                      {equipo.puntos}
                    </td>

                    <td className="px-3">
                      <div className="flex justify-center gap-[6px]">
                        {equipo.forma.length === 0 ? (
                          <span className="text-[#9aabb9]">—</span>
                        ) : (
                          equipo.forma.map((resultado, i) => (
                            <span
                              key={`${equipo.nombre}-${i}`}
                              className={`h-[11px] w-[11px] rounded-[3px] ${colorForma(resultado)}`}
                              title={resultado === "W" ? "Victoria" : resultado === "D" ? "Empate" : "Derrota"}
                            />
                          ))
                        )}
                      </div>
                    </td>

                    <td className="px-3">
                      {rival ? (
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                            {logos[rival] ? (
                              <img src={logos[rival]} alt={rival} className="h-6 w-6 object-contain" />
                            ) : (
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#edf5fa] text-[8px] font-black text-[#597895]">
                                {rival.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="truncate text-[11px] font-semibold text-[#355d83]">{rival}</span>
                        </div>
                      ) : (
                        <span className="text-[#9aabb9]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#d7e6f0] bg-[#fbfdff] px-4 py-3 text-[10px] font-semibold text-[#67819a]">
        {normalizarDivision(division) === "primera" ? (
          <>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#2497e6]" /> Campeón</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#f1a33b]" /> Promoción</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#ef4855]" /> Descenso</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#2fb56d]" /> Ascenso directo</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#2497e6]" /> Playoffs de ascenso</span>
          </>
        )}
      </div>
    </section>
  );
}
