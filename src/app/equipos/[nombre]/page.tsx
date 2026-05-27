"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Si tira error de ruta, cambialo por "../../../lib/supabase"
import Link from "next/link";

interface Partido {
  id: string;
  local: string;
  visitante: string;
  resultado: string;
  fecha: string;
}

interface EstadisticasJugador {
  jugador: string;
  goles: number;
  asistencias: number;
  mvps: number;
}

export default function PaginaEquipo() {
  const params = useParams();
  
  // Capturamos el nombre de la URL de forma segura
  const nombreEquipoUrl = params?.nombre ? decodeURIComponent(params.nombre as string) : "";

  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [plantel, setPlantel] = useState<EstadisticasJugador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [nombreRealEquipo, setNombreRealEquipo] = useState<string>(nombreEquipoUrl);

  const [stats, setStats] = useState({
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    puntos: 0,
    racha: [] as string[],
  });

  useEffect(() => {
    if (!nombreEquipoUrl) return;

    const fetchDatosEquipo = async () => {
      try {
        setLoading(true);

        // 1. Traer todos los partidos
        const { data: partidosData, error: partidosError } = await supabase
          .from("partidos")
          .select("*");

        if (partidosError) {
          console.error("❌ Error de Supabase en la tabla 'partidos':", partidosError.message, partidosError.details);
          throw partidosError;
        }

        if (partidosData) {
          const partidoEncontrado = partidosData.find(
            (p: any) => p.local?.toLowerCase() === nombreEquipoUrl.toLowerCase() || 
                       p.visitante?.toLowerCase() === nombreEquipoUrl.toLowerCase()
          );

          const nombreExacto = partidoEncontrado 
            ? (partidoEncontrado.local?.toLowerCase() === nombreEquipoUrl.toLowerCase() ? partidoEncontrado.local : partidoEncontrado.visitante)
            : nombreEquipoUrl;

          setNombreRealEquipo(nombreExacto);

          const partidosDelEquipo = partidosData.filter(
            (p: any) => p.local?.toLowerCase() === nombreExacto.toLowerCase() || 
                       p.visitante?.toLowerCase() === nombreExacto.toLowerCase()
          );
          setPartidos(partidosDelEquipo);

          // 2. Traer el plantel desde tu tabla 'jugadores'
          const { data: jugadoresData, error: jugadoresError } = await supabase
            .from("jugadores")
            .select("*");

          if (jugadoresError) {
            console.error("❌ Error de Supabase en la tabla 'jugadores':", jugadoresError.message, jugadoresError.details);
          }

          if (jugadoresData) {
            // Filtramos manualmente por el equipo actual
            const jugadoresFiltrados = jugadoresData.filter(
              (j: any) => j.equipo?.toLowerCase() === nombreExacto.toLowerCase()
            );

            // AGRUPACIÓN CRÍTICA: Sumamos las estadísticas de filas que tengan el mismo nombre de jugador
            const mapaAgrupado: { [key: string]: EstadisticasJugador } = {};

            jugadoresFiltrados.forEach((j: any) => {
              const nombreJugador = (j.jugador || j.nombre || "Sin Nombre").trim();
              if (!nombreJugador) return;

              // Si el jugador no existía en nuestro mapa, lo inicializamos
              if (!mapaAgrupado[nombreJugador]) {
                mapaAgrupado[nombreJugador] = {
                  jugador: nombreJugador,
                  goles: 0,
                  asistencias: 0,
                  mvps: 0
                };
              }

              // Sumamos los valores acumulados de manera segura
              const registro = mapaAgrupado[nombreJugador];
              if (registro) {
                registro.goles += Number(j.goles) || 0;
                registro.asistencias += Number(j.asistencias) || 0;
                registro.mvps += Number(j.mvps) || Number(j.mvp) || 0;
              }
            });

            // Convertimos el mapa agrupado a un Array y lo ordenamos por goles de mayor a menor
            const listaProcesada = Object.values(mapaAgrupado).sort((a, b) => b.goles - a.goles);
            setPlantel(listaProcesada);
          }

          // 3. Calcular números globales del club
          let pj = 0, pg = 0, pe = 0, pp = 0, gf = 0, gc = 0, puntos = 0;
          let rachaAux: string[] = [];

          partidosDelEquipo.forEach((partido: any) => {
            if (!partido.resultado || !partido.resultado.includes("-")) return;

            const golesLocal = parseInt(partido.resultado.split("-")[0].trim());
            const golesVisitante = parseInt(partido.resultado.split("-")[1].trim());

            if (isNaN(golesLocal) || isNaN(golesVisitante)) return;

            pj++;
            const esLocal = partido.local?.toLowerCase() === nombreExacto.toLowerCase();

            if (esLocal) {
              gf += golesLocal;
              gc += golesVisitante;
              if (golesLocal > golesVisitante) {
                pg++; puntos += 3; rachaAux.push("G");
              } else if (golesLocal === golesVisitante) {
                pe++; puntos += 1; rachaAux.push("E");
              } else {
                pp++; rachaAux.push("P");
              }
            } else {
              gf += golesVisitante;
              gc += golesLocal;
              if (golesVisitante > golesLocal) {
                pg++; puntos += 3; rachaAux.push("G");
              } else if (golesVisitante === golesLocal) {
                pe++; puntos += 1; rachaAux.push("E");
              } else {
                pp++; rachaAux.push("P");
              }
            }
          });

          setStats({
            pj, pg, pe, pp, gf, gc, puntos,
            racha: rachaAux.slice(-5)
          });
        }

      } catch (error: any) {
        console.error("🚨 ERROR CRÍTICO DETALLADO:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatosEquipo();
  }, [nombreEquipoUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 sm:p-10 flex items-center justify-center">
        <div className="text-center animate-pulse text-cyan-400 font-bold tracking-wider uppercase">
          ⚡ Cargando Club...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 sm:p-10 font-sans">
      
      {/* Botón Volver */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="text-xs font-bold uppercase tracking-wide bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-lg hover:text-white hover:border-zinc-700 transition-all"
        >
          ← Volver al Panel
        </Link>
      </div>

      {/* Header del Equipo */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-2xl mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Perfil del Club</span>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mt-1">
              {nombreRealEquipo}
            </h1>
            
            {/* Racha Visual */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider mr-2">Racha:</span>
              {stats.racha.length === 0 ? (
                <span className="text-xs text-zinc-500 italic">Sin partidos jugados</span>
              ) : (
                stats.racha.map((r, i) => (
                  <span
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black select-none ${
                      r === "G" ? "bg-emerald-400" : r === "E" ? "bg-zinc-400" : "bg-rose-500"
                    }`}
                  >
                    {r}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Tarjetas de Stats */}
          <div className="grid grid-cols-4 gap-3 bg-zinc-950 border border-zinc-800/60 p-4 rounded-xl min-w-[280px] sm:min-w-[350px]">
            <div className="text-center">
              <p className="text-xs text-zinc-500 font-bold uppercase">PTS</p>
              <p className="text-2xl font-black text-cyan-400">{stats.puntos}</p>
            </div>
            <div className="text-center border-l border-zinc-800">
              <p className="text-xs text-zinc-500 font-bold uppercase">PJ</p>
              <p className="text-2xl font-black text-zinc-300">{stats.pj}</p>
            </div>
            <div className="text-center border-l border-zinc-800">
              <p className="text-xs text-zinc-500 font-bold uppercase">GF</p>
              <p className="text-2xl font-black text-emerald-400">{stats.gf}</p>
            </div>
            <div className="text-center border-l border-zinc-800">
              <p className="text-xs text-zinc-500 font-bold uppercase">GC</p>
              <p className="text-2xl font-black text-rose-400">{stats.gc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Plantel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
              🛡️ Plantel y Estadísticas
            </h2>
            <hr className="border-zinc-800 mb-4" />
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Jugador</th>
                    <th className="py-3 px-2 text-center">⚽ Goles</th>
                    <th className="py-3 px-2 text-center">👟 Asist.</th>
                    <th className="py-3 px-2 text-center">⭐ MVP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {plantel.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-zinc-500 italic">
                        No se encontraron jugadores registrados para este equipo.
                      </td>
                    </tr>
                  ) : (
                    plantel.map((jugador) => (
                      <tr key={jugador.jugador} className="hover:bg-zinc-950/40 transition-colors group">
                        <td className="py-3.5 px-2 font-medium text-zinc-200 group-hover:text-white transition-colors">
                          {jugador.jugador}
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono font-bold text-zinc-300">
                          {jugador.goles}
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono font-bold text-zinc-400">
                          {jugador.asistencias}
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono font-bold text-cyan-400">
                          {jugador.mvps}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Historial de Partidos */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-4">
              📅 Historial de Partidos
            </h2>
            <hr className="border-zinc-800 mb-4" />

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {partidos.length === 0 ? (
                <p className="text-zinc-500 text-sm italic text-center py-6">
                  Este club aún no disputó partidos oficiales.
                </p>
              ) : (
                partidos.map((partido) => {
                  const partes = partido.resultado ? partido.resultado.split("-") : ["-", "-"];
                  const golesLocal = partes[0]?.trim() || "-";
                  const golesVisitante = partes[1]?.trim() || "-";
                  
                  let colorBorde = "border-l-zinc-800";
                  if (golesLocal !== "-" && golesVisitante !== "-") {
                    const gl = parseInt(golesLocal);
                    const gv = parseInt(golesVisitante);
                    const esLocal = partido.local?.toLowerCase() === nombreRealEquipo.toLowerCase();
                    
                    if (gl === gv) {
                      colorBorde = "border-l-zinc-500";
                    } else if ((gl > gv && esLocal) || (gv > gl && !esLocal)) {
                      colorBorde = "border-l-emerald-500";
                    } else {
                      colorBorde = "border-l-rose-500";
                    }
                  }

                  return (
                    <div
                      key={partido.id}
                      className={`bg-zinc-950/60 border border-zinc-800 border-l-4 ${colorBorde} p-3.5 rounded-xl flex flex-col gap-2`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <span>Fecha {partido.fecha}</span>
                      </div>

                      <div className="grid grid-cols-7 items-center text-xs">
                        <span className={`col-span-3 text-right font-semibold truncate ${partido.local?.toLowerCase() === nombreRealEquipo.toLowerCase() ? "text-cyan-400 font-bold" : "text-zinc-400"}`}>
                          {partido.local}
                        </span>

                        <span className="col-span-1 text-center bg-zinc-900 px-1.5 py-1 rounded text-[11px] font-mono font-black text-zinc-200 border border-zinc-800/60 mx-1">
                          {golesLocal}-{golesVisitante}
                        </span>

                        <span className={`col-span-3 text-left font-semibold truncate ${partido.visitante?.toLowerCase() === nombreRealEquipo.toLowerCase() ? "text-cyan-400 font-bold" : "text-zinc-400"}`}>
                          {partido.visitante}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}