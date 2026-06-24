"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface JugadorGoles {
  nombre: string;
  equipo: string;
  goles: number;
}

export default function Goleadores() {
  const [goleadores, setGoleadores] = useState<JugadorGoles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerGoleadores();
  }, []);

  async function obtenerGoleadores() {
    try {
      const { data } = await supabase.from("jugadores").select("id, nombre, playerId, equipo, goles, asistencias, mvps, temporada, division");
      if (data) {
        const mapa: { [key: string]: JugadorGoles } = {};
        data.forEach((j: any) => {
          const name = (j.jugador || j.nombre || "").trim();
          if (!name) return;
          if (!mapa[name]) {
            mapa[name] = { nombre: name, equipo: j.equipo || "Sin Club", goles: 0 };
          }
          mapa[name].goles += Number(j.goles) || 0;
        });

        const ordenados = Object.values(mapa)
          .filter((j) => j.goles > 0)
          .sort((a, b) => b.goles - a.goles)
          .slice(0, 5);

        setGoleadores(ordenados);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || goleadores.length === 0) return null;

  const top1 = goleadores[0];
  const elResto = goleadores.slice(1, 5);

  return (
    /* 🎛️ PANEL PRINCIPAL: Ahora se expande a todo el ancho disponible (w-full) */
    <div className="w-full bg-gradient-to-br from-[#28303d] via-[#151a22] to-[#0b0f14] border-[3px] border-[#384556] border-t-[#50637a] border-b-[#0f141a] rounded-[28px] p-5 md:p-6 shadow-[0_25px_50px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1)] relative overflow-hidden font-sans">
      
      {/* Brillo reflejado superior */}
      <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none"></div>

      {/* CABECERA */}
      <div className="flex items-center justify-between mb-5 relative z-10 pl-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-sky-400 via-blue-600 to-blue-950 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-sky-300/50">
            <span className="text-white text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">⚽</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            TABLA DE ARTILLEROS
          </h3>
        </div>
        <span className="text-[10px] font-mono font-black tracking-widest text-sky-400 bg-[#0c121a] border border-[#232d3a] px-3 py-1 rounded-xl">
          TOP 5
        </span>
      </div>

      {/* 👑 TARJETA DEL LÍDER (Ancho Completo) */}
      {top1 && (
        <div className="relative mb-4 w-full rounded-2xl border-2 border-[#8a99ad] border-t-white border-b-[#475363] bg-gradient-to-br from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] p-4 md:p-5 flex justify-between items-center shadow-[0_15px_30px_rgba(0,0,0,0.6)] group overflow-hidden">
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out pointer-events-none z-20"></div>

          <div className="min-w-0 flex items-center gap-5 relative z-10 flex-1 pr-4">
            {/* Número 01 de fondo */}
            <div className="text-5xl md:text-6xl font-black font-mono text-[#475569]/30 select-none tracking-tighter leading-none shrink-0">
              01
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-amber-500 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">⭐⭐⭐</span>
                <span className="text-[9px] font-black uppercase bg-gradient-to-b from-[#fcd34d] via-[#f59e0b] to-[#b45309] text-amber-950 px-2 py-0.5 rounded font-mono tracking-wider shadow-sm">
                  LÍDER
                </span>
              </div>
              
              {/* Espacio gigante para el nombre del Top 1 */}
              <h4 className="text-2xl md:text-3xl font-black text-[#0f172a] uppercase tracking-tight leading-tight truncate">
                {top1.nombre}
              </h4>
              <p className="text-xs md:text-sm text-[#334155] font-black font-mono tracking-wide mt-1 uppercase truncate opacity-95">
                🛡️ {top1.equipo}
              </p>
            </div>
          </div>

          {/* Caja de Goles Dorada */}
          <div className="text-center min-w-[90px] md:min-w-[100px] bg-gradient-to-b from-[#fbbf24] via-[#d97706] to-[#78350f] p-[2px] rounded-xl shadow-md relative z-10 shrink-0">
            <div className="bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] px-3 py-2.5 rounded-[9px] border-t-2 border-white/60">
              <p className="text-3xl md:text-4xl font-mono font-black text-[#451a03] leading-none">
                {top1.goles}
              </p>
              <p className="text-[8px] md:text-[9px] font-black uppercase text-[#451a03]/80 tracking-widest mt-1 font-mono">
                GOLES
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 📊 FILAS DEL PUESTO 2 AL 5: Una debajo de la otra (1 Sola Columna Ancha) */}
      <div className="flex flex-col gap-2.5 relative z-10 w-full">
        {elResto.map((jugador, index) => {
          const posicion = index + 2;

          return (
            <div
              key={jugador.nombre}
              className="w-full bg-gradient-to-b from-[#222a36] to-[#121820] border-2 border-[#334155] border-t-[#475569] border-b-[#0c1117] p-3.5 rounded-xl flex justify-between items-center shadow-md group/row hover:from-[#2a3545] hover:to-[#161e29] transition-all duration-200"
            >
              {/* Bloque Izquierdo con todo el ancho disponible */}
              <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                {/* Posición numérica */}
                <span className="font-mono text-xl font-black text-[#475569] group-hover/row:text-sky-400 transition-colors w-5 text-center shrink-0">
                  {posicion}
                </span>
                
                {/* Nombre y Club con espacio de sobra de punta a punta */}
                <div className="min-w-0 flex-1">
                  <p className="font-black text-base md:text-lg text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 group-hover/row:to-white transition-colors uppercase tracking-tight truncate">
                    {jugador.nombre}
                  </p>
                  <p className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wide mt-0.5 truncate">
                    🛡️ {jugador.equipo}
                  </p>
                </div>
              </div>

              {/* Caja de Goles compacta a la derecha */}
              <div className="font-mono text-sm font-black text-white bg-gradient-to-b from-[#090d14] to-[#04060a] px-4 py-2 rounded-xl border-2 border-[#1e293b] border-b-[#334155] border-t-black shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1.5 min-w-[65px] shrink-0 group-hover/row:border-sky-500/30 transition-all">
                <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{jugador.goles}</span> 
                <span className="text-[11px] font-black text-sky-400">G</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}