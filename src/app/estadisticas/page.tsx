"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EstadisticasPage() {
  const temporadas = ["Temporada 4"];

  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [fecha, setFecha] = useState("Todas");

  const [fechas, setFechas] = useState<string[]>([]);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);

  useEffect(() => {
    cargarFechas();
    cargarPartidos();
  }, [temporada, division, fecha]);

  async function cargarFechas() {
    const { data, error } = await supabase
      .from("estadisticas_equipos")
      .select("fecha")
      .eq("temporada", temporada)
      .eq("division", division);

    if (error) {
      console.log(error);
      return;
    }

    const fechasUnicas = Array.from(
      new Set((data || []).map((item: any) => item.fecha)),
    )
      .filter(Boolean)
      .sort((a: any, b: any) => Number(a) - Number(b));

    setFechas(fechasUnicas as string[]);
  }

  async function cargarPartidos() {
    let query = supabase
      .from("estadisticas_equipos")
      .select("*")
      .eq("temporada", temporada)
      .eq("division", division);

    if (fecha !== "Todas") {
      query = query.eq("fecha", fecha);
    }

    const { data, error } = await query.order("fecha", {
      ascending: false,
    });

    if (error) {
      console.log(error);
      return;
    }

    const agrupados: any = {};

    data?.forEach((e: any) => {
      if (!agrupados[e.partido_id]) {
        agrupados[e.partido_id] = {
          partido_id: e.partido_id,
          temporada: e.temporada,
          division: e.division,
          fecha: e.fecha,
          equipos: [],
        };
      }

      agrupados[e.partido_id].equipos.push(e);
    });

    const lista = Object.values(agrupados).sort(
      (a: any, b: any) => Number(b.fecha) - Number(a.fecha),
    );

    const nombresEquipos = Array.from(
      new Set(
        (lista as any[])
          .flatMap((p: any) => p.equipos.map((e: any) => e.equipo))
          .filter(Boolean),
      ),
    );

    if (nombresEquipos.length > 0) {
      const { data: clubesData, error: clubesError } = await supabase
        .from("clubes_info")
        .select("nombre, logo_url")
        .in("nombre", nombresEquipos);

      if (clubesError) {
        console.log(clubesError);
      }

      setClubesInfo(clubesData || []);
    } else {
      setClubesInfo([]);
    }

    setPartidos(lista);
  }


  function logoEquipo(nombre?: string) {
    if (!nombre) return null;

    const club = clubesInfo.find(
      (c) =>
        String(c.nombre || "").toLowerCase().trim() ===
        String(nombre || "").toLowerCase().trim(),
    );

    return club?.logo_url || null;
  }

  function EscudoEquipo({
    nombre,
    logo,
  }: {
    nombre?: string;
    logo?: string | null;
  }) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-500 to-blue-950 text-sm font-black shadow-[0_0_15px_rgba(56,189,248,.22)]">
        {logo ? (
          <img
            src={logo}
            alt={nombre || "Equipo"}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          nombre?.slice(0, 2).toUpperCase()
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <section className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="relative overflow-hidden rounded-[34px] border border-sky-500/40 bg-[#020714] shadow-[0_0_55px_rgba(0,120,255,.28)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_40%)]" />

          <div className="relative z-10 p-7 md:p-10">
            <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
              APA PSO ARGENTINA
            </p>

            <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic leading-none">
              <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                MATCH
              </span>

              <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                CENTER
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400 text-sm md:text-base">
              Explorá estadísticas completas, resultados y rendimiento de cada
              partido de APA PSO Argentina UE5.
            </p>
          </div>
        </div>

        <section className="rounded-[30px] border border-sky-500/30 bg-[#020714] p-6 md:p-7 shadow-[0_0_35px_rgba(0,120,255,.14)]">
          <div className="grid gap-6">
            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Temporada
              </p>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                {temporadas.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => {
                      setTemporada(temp);
                      setFecha("Todas");
                    }}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      temporada === temp
                        ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {temp.replace("Temporada ", "")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                División
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {divisiones.map((div) => (
                  <button
                    key={div}
                    onClick={() => {
                      setDivision(div);
                      setFecha("Todas");
                    }}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      division === div
                        ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    🛡️ {div}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Fecha
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFecha("Todas")}
                  className={`rounded-2xl border px-5 py-3 text-sm font-black uppercase transition-all ${
                    fecha === "Todas"
                      ? "border-sky-300 bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.35)]"
                      : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                  }`}
                >
                  Todas
                </button>

                {fechas.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFecha(f)}
                    className={`rounded-2xl border px-5 py-3 text-sm font-black uppercase transition-all ${
                      fecha === f
                        ? "border-sky-300 bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    Fecha {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div>
          <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
            Selección actual
          </p>

          <h2 className="mt-3 text-3xl md:text-5xl font-black uppercase">
            {temporada}
            <span className="text-sky-400"> / </span>
            {division}
          </h2>

          <p className="mt-2 text-zinc-500 uppercase tracking-[0.25em] text-xs font-black">
            {fecha === "Todas" ? "Todas las fechas" : `Fecha ${fecha}`}
          </p>
        </div>

        <div className="space-y-5">
          {partidos.length === 0 ? (
            <div className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-10 text-center text-zinc-500">
              No hay partidos cargados para esta selección.
            </div>
          ) : (
            partidos.map((partido: any) => {
              const e1 = partido.equipos[0];
              const e2 = partido.equipos[1];

              return (
                <Link
                  key={partido.partido_id}
                  href={`/estadisticas/${encodeURIComponent(
                    partido.partido_id,
                  )}`}
                  className="group relative block overflow-hidden rounded-[32px] border border-sky-500/20 bg-[#020714] p-6 md:p-8 transition-all duration-300 hover:border-sky-400/50 hover:shadow-[0_0_35px_rgba(56,189,248,.16)]"
                >
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.12),transparent_35%)]" />

                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div>
                        <p className="text-zinc-500 text-[11px] uppercase tracking-[0.28em] font-black">
                          Fecha {partido.fecha}
                        </p>

                        <p className="mt-2 text-sky-300 text-xs uppercase tracking-[0.2em] font-black">
                          {partido.temporada} · {partido.division}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-sky-300 transition group-hover:bg-sky-400/20">
                        Ver detalle →
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
                      <div className="flex items-center gap-4 min-w-0">
                        <EscudoEquipo
                          nombre={e1?.equipo}
                          logo={logoEquipo(e1?.equipo)}
                        />

                        <div className="min-w-0">
                          <h2 className="truncate text-lg md:text-3xl font-black uppercase">
                            {e1?.equipo}
                          </h2>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="min-w-[140px] rounded-3xl border border-yellow-400/30 bg-yellow-400/10 px-6 py-4 text-center shadow-[0_0_20px_rgba(250,204,21,.08)]">
                          <span className="text-4xl md:text-5xl font-black text-yellow-400 whitespace-nowrap drop-shadow-[0_0_10px_rgba(250,204,21,.45)]">
                            {e1?.goals}-{e2?.goals}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-4 min-w-0">
                        <div className="min-w-0 text-right">
                          <h2 className="truncate text-lg md:text-3xl font-black uppercase">
                            {e2?.equipo}
                          </h2>
                        </div>

                        <EscudoEquipo
                          nombre={e2?.equipo}
                          logo={logoEquipo(e2?.equipo)}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
