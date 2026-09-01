"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { matchFitsContext, normalizeDivision, normalizeRound, stableMatchId } from "../../../lib/competitionData";

function Escudo({ nombre, logo }: { nombre: string; logo?: string | null }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sky-300/30 bg-gradient-to-br from-sky-500 to-blue-950 text-sm font-black shadow-[0_0_18px_rgba(0,140,255,.55)]">
      {logo ? (
        <img src={logo} alt={nombre} className="h-full w-full object-contain p-1.5" />
      ) : (
        nombre?.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}

export default function PlayoffsPage() {
  const searchParams = useSearchParams();
  const temporada = searchParams.get("temporada") || "Temporada 4";
  const faseActual = searchParams.get("fase") || "Semifinal";

  const [partidos, setPartidos] = useState<any[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);

  const fasesPlayoffs = [
    { label: "Semifinales", value: "Semifinal", desc: "2° al 5° de Segunda División" },
    { label: "Final Ascenso", value: "Final Ascenso", desc: "Ganador SF1 vs Ganador SF2" },
    { label: "Promoción", value: "Promoción", desc: "Ganador Final vs Anteúltimo Primera" },
  ];

  useEffect(() => {
    cargarPartidosPlayoffs();
  }, [temporada, faseActual]);

  async function cargarPartidosPlayoffs() {
    const { data, error } = await supabase
      .from("partidos")
      .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda")
      .order("fecha", { ascending: true });

    if (error) {
      console.error("Error cargando partidos de playoffs:", error);
      setPartidos([]);
      setClubesInfo([]);
      return;
    }

    const context = {
      temporada,
      competicion: "playoffs",
      fase: faseActual,
    };

    const partidosLimpios = (data || []).filter((partido: any) =>
      matchFitsContext(partido, context)
    );

    setPartidos(partidosLimpios);

    const nombresEquipos = Array.from(
      new Set(partidosLimpios.flatMap((p: any) => [p.local, p.visitante]).filter(Boolean))
    );

    if (nombresEquipos.length > 0) {
      const { data: clubesData, error: clubesError } = await supabase
        .from("v_clubes_temporada_public")
        .select("*")
        .eq("temporada", temporada)
        .eq("activo", true)
        .in("nombre", nombresEquipos);

      if (clubesError) console.error("Error cargando clubes:", clubesError);
      setClubesInfo(clubesData || []);
    } else {
      setClubesInfo([]);
    }
  }

  function estadoPartido(p: any) {
    if (p.resultado) return "finalizado";
    if (p.dia || p.hora) return "programado";
    return "pendiente";
  }

  function claseEstado(p: any) {
    const estado = estadoPartido(p);
    if (estado === "finalizado") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    if (estado === "programado") return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
    return "border-sky-400/30 bg-sky-400/10 text-sky-300";
  }

  function logoEquipo(nombre?: string) {
    if (!nombre) return null;
    const club = clubesInfo.find(
      (c) => String(c.nombre || "").toLowerCase().trim() === String(nombre || "").toLowerCase().trim()
    );
    return club?.logo_url || null;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#3b1607_0%,#081427_28%,#020714_58%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1400px] space-y-8 px-4 py-8 md:px-8">
        
        {/* Cabecera Principal */}
        <section className="relative min-h-[430px] overflow-hidden rounded-[42px] border border-orange-400/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(251,146,60,.18)] md:p-10">
          <img
            src="/images/competicion/playoffs.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020714]/96 via-[#020714]/78 to-[#020714]/35" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020714] to-transparent" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="relative z-10 flex min-h-[380px] items-center">
            <div className="max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[0.45em] text-orange-300">
                APA PSO Argentina · {temporada}
              </p>
              <h1 className="mt-5 text-[clamp(3rem,9vw,7rem)] font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-700 bg-clip-text text-transparent">
                  Playoffs
                </span>
                <span className="block text-orange-300 drop-shadow-[0_0_24px_rgba(251,146,60,.55)]">
                  de Ascenso
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
                Del 2° al 5° de Segunda División pelean por llegar a la final de ascenso.
                El ganador juega la promoción contra el anteúltimo de Primera.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link 
                  href={`/fixture/playoffs?temporada=${encodeURIComponent(temporada)}`} 
                  className="rounded-2xl border border-orange-300/35 bg-orange-300 px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-white"
                >
                  Ver fixture completo
                </Link>
                <Link 
                  href="/estadisticas" 
                  className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black"
                >
                  Ver estadísticas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pestañas de Navegación de Fases */}
        <section className="flex flex-wrap gap-3">
          {fasesPlayoffs.map((fase) => {
            const isActive = faseActual === fase.value;
            return (
              <Link
                key={fase.value}
                href={`/competicion/playoffs?temporada=${encodeURIComponent(temporada)}&fase=${encodeURIComponent(fase.value)}`}
                className={`rounded-2xl border px-6 py-4 transition ${
                  isActive
                    ? "border-orange-400 bg-orange-400/20 text-orange-300 shadow-[0_0_20px_rgba(251,146,60,0.3)]"
                    : "border-orange-400/20 bg-[#020714]/95 text-zinc-400 hover:border-orange-400/50 hover:text-white"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">{fase.desc}</p>
                <p className="mt-1 text-lg font-black uppercase">{fase.label}</p>
              </Link>
            );
          })}
        </section>

        {/* Contenedor dinámico de Partidos */}
        <section className="rounded-[30px] border border-orange-400/20 bg-[#020714]/95 p-6 md:p-8 shadow-[0_0_30px_rgba(251,146,60,.10)]">
          <div className="flex items-center justify-between border-b border-orange-400/15 pb-4 mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-300">Fase Seleccionada</p>
              <h2 className="mt-1 text-2xl font-black uppercase text-white">{faseActual}</h2>
            </div>
            <span className="rounded-full bg-orange-400/10 border border-orange-400/30 px-4 py-1.5 text-xs font-bold text-orange-300">
              {temporada}
            </span>
          </div>

          {partidos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {partidos.map((p, index) => {
                const estado = estadoPartido(p);
                const tarjetaPartido = (
                  <div className="group overflow-hidden rounded-[28px] border border-orange-500/20 bg-gradient-to-r from-[#020814] via-[#1a0c04] to-[#020814] transition hover:border-orange-400/60 hover:shadow-[0_0_28px_rgba(251,146,60,.15)] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${claseEstado(p)}`}>
                        {estado === "finalizado" ? "🟢 Finalizado" : estado === "programado" ? "🟡 Programado" : "🔵 Pendiente"}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">
                        {p.dia || "Sin día"} · {p.hora || "Sin hora"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 items-center gap-4 xl:grid-cols-[1fr_140px_1fr]">
                      <div className="flex items-center justify-center gap-4 xl:justify-end">
                        <p className="max-w-[380px] break-words text-center text-xl font-black uppercase leading-tight xl:text-right md:text-2xl">
                          {p.local}
                        </p>
                        <Escudo nombre={p.local} logo={logoEquipo(p.local)} />
                      </div>

                      <div className="mx-auto min-w-[132px] rounded-2xl border border-orange-400/35 bg-orange-400/10 px-5 py-4 text-center shadow-[0_0_22px_rgba(251,146,60,.18)]">
                        <p className="text-4xl font-black text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,.45)]">
                          {p.resultado ? p.resultado.replace(/\s/g, "") : "VS"}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-4 xl:justify-start">
                        <Escudo nombre={p.visitante} logo={logoEquipo(p.visitante)} />
                        <p className="max-w-[380px] break-words text-center text-xl font-black uppercase leading-tight xl:text-left md:text-2xl">
                          {p.visitante}
                        </p>
                      </div>
                    </div>
                  </div>
                );

                return (p.partido_id || p.id) ? (
                  <Link key={p.id || index} href={`/estadisticas/${encodeURIComponent(p.partido_id || stableMatchId(p.temporada, p.id))}`}>
                    {tarjetaPartido}
                  </Link>
                ) : (
                  <div key={p.id || index}>{tarjetaPartido}</div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-400/10 border border-orange-400/20 text-orange-300 mb-4 text-2xl">
                ⚽
              </div>
              <h3 className="text-lg font-black uppercase text-white">No hay partidos cargados para esta fase</h3>
              <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
                Los encuentros correspondientes a <span className="text-orange-300 font-bold">{faseActual}</span> aparecerán aquí una vez que sean programados o cargados desde el panel de administración.
              </p>
              <div className="mt-6">
                <Link
                  href={`/fixture/playoffs?temporada=${encodeURIComponent(temporada)}&fase=${encodeURIComponent(faseActual)}`}
                  className="inline-block rounded-xl border border-orange-300/40 bg-orange-400/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-orange-300 transition hover:bg-orange-400 hover:text-black"
                >
                  Ver en el Fixture General →
                </Link>
              </div>
            </div>
          )}
        </section>

      </section>
    </main>
  );
}