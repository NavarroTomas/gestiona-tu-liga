"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface JugadorMVP {
  nombre: string;
  equipo: string;
  mvps: number;
}

export default function TopMVP() {
  const [jugadores, setJudadores] = useState<JugadorMVP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMVPs();
  }, []);

  async function cargarMVPs() {
    try {
      const { data } = await supabase.from("jugadores").select("*");
      if (data) {
        const mapa: { [key: string]: JugadorMVP } = {};
        data.forEach((j: any) => {
          const name = (j.jugador || j.nombre || "").trim();
          if (!name) return;
          if (!mapa[name]) {
            mapa[name] = { nombre: name, equipo: j.equipo || "Sin Club", mvps: 0 };
          }
          mapa[name].mvps += Number(j.mvp) || Number(j.mvps) || 0;
        });

        const procesados = Object.values(mapa)
          .filter((j) => j.mvps > 0)
          .sort((a, b) => b.mvps - a.mvps)
          .slice(0, 5);

        setJudadores(procesados);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || jugadores.length === 0) return null;

  const top1 = jugadores[0];
  const elResto = jugadores.slice(1, 5);

  return (
    <div className="w-full bg-gradient-to-br from-[#28303d] via-[#151a22] to-[#0b0f14] border-[3px] border-[#384556] border-t-[#50637a] border-b-[#0f141a] rounded-[28px] p-5 md:p-6 shadow-[0_25px_50px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1)] relative overflow-hidden font-sans">
      
      <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none"></div>

      {/* CABECERA */}
      <div className="flex items-center justify-between mb-5 relative z-10 pl-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-amber-400 via-yellow-600 to-amber-900 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] border border-amber-300/50">
            <span className="text-white text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">⭐</span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            RANKING DE MVPs
          </h3>
        </div>
        <span className="text-[10px] font-mono font-black tracking-widest text-amber-400 bg-[#14120a] border border-[#3a3223] px-3 py-1 rounded-xl">
          DESTACADOS
        </span>
      </div>

      {/* 👑 LÍDER MVP */}
      {top1 && (
        <div className="relative mb-4 w-full rounded-2xl border-2 border-[#8a99ad] border-t-white border-b-[#475363] bg-gradient-to-br from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] p-4 md:p-5 flex justify-between items-center shadow-[0_15px_30px_rgba(0,0,0,0.6)] group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out pointer-events-none z-20"></div>

          <div className="min-w-0 flex items-center gap-5 relative z-10 flex-1 pr-4">
            <div className="text-5xl md:text-6xl font-black font-mono text-[#475569]/30 select-none tracking-tighter leading-none shrink-0">
              01
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sky-500 text-sm animate-pulse">✨</span>
                <span className="text-[9px] font-black uppercase bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] text-white px-2 py-0.5 rounded font-mono tracking-wider shadow-sm">
                  MVP LÍDER
                </span>
              </div>
              <h4 className="text-2xl md:text-3xl font-black text-[#0f172a] uppercase tracking-tight leading-tight truncate">
                {top1.nombre}
              </h4>
              <p className="text-xs md:text-sm text-[#334155] font-black font-mono tracking-wide mt-1 uppercase truncate opacity-95">
                👑 {top1.equipo}
              </p>
            </div>
          </div>

          <div className="text-center min-w-[90px] md:min-w-[100px] bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] p-[2px] rounded-xl shadow-md relative z-10 shrink-0">
            <div className="bg-gradient-to-b from-[#7dd3fc] via-[#0284c7] to-[#0369a1] px-3 py-2.5 rounded-[9px] border-t-2 border-white/60">
              <p className="text-3xl md:text-4xl font-mono font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {top1.mvps}
              </p>
              <p className="text-[8px] md:text-[9px] font-black uppercase text-white/90 tracking-widest mt-1 font-mono">
                MVPs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 📊 GRILLA MVP */}
      <div className="flex flex-col gap-2.5 relative z-10 w-full">
        {elResto.map((jugador, index) => {
          const posicion = index + 2;
          return (
            <div
              key={jugador.nombre}
              className="w-full bg-gradient-to-b from-[#222a36] to-[#121820] border-2 border-[#334155] border-t-[#475569] border-b-[#0c1117] p-3.5 rounded-xl flex justify-between items-center shadow-md group/row hover:from-[#2a3545] hover:to-[#161e29] transition-all duration-200"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                <span className="font-mono text-xl font-black text-[#475569] group-hover/row:text-amber-400 transition-colors w-5 text-center shrink-0">
                  {posicion}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-base md:text-lg text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 group-hover/row:to-white transition-colors uppercase tracking-tight truncate">
                    {jugador.nombre}
                  </p>
                  <p className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wide mt-0.5 truncate">
                    ✨ {jugador.equipo}
                  </p>
                </div>
              </div>
              <div className="font-mono text-sm font-black text-white bg-gradient-to-b from-[#090d14] to-[#04060a] px-4 py-2 rounded-xl border-2 border-[#1e293b] border-b-[#334155] border-t-black shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1.5 min-w-[65px] shrink-0 group-hover/row:border-amber-500/30 transition-all">
                <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{jugador.mvps}</span> 
                <span className="text-[11px] font-black text-amber-500">★</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}