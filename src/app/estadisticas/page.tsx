"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EstadisticasPage() {
  const temporadas = [
    "Temporada 1",
    "Temporada 2",
    "Temporada 3",
    "Temporada 4",
    "Temporada 5",
  ];

  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [temporada, setTemporada] = useState("Temporada 1");
  const [division, setDivision] = useState("Primera");
  const [fecha, setFecha] = useState("Todas");

  const [fechas, setFechas] = useState<string[]>([]);
  const [partidos, setPartidos] = useState<any[]>([]);

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
      new Set((data || []).map((item: any) => item.fecha))
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
      (a: any, b: any) => Number(b.fecha) - Number(a.fecha)
    );

    setPartidos(lista);
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-8">
        <div>
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            APA PSO ARGENTINA
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">
            Estadísticas de Partidos
          </h1>

          <p className="mt-4 text-zinc-400">
            Filtrá los partidos cargados desde TXT por temporada, división y fecha.
          </p>
        </div>

        <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6 space-y-6">
          <div>
            <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold mb-3">
              Temporada
            </p>

            <div className="flex flex-wrap gap-3">
              {temporadas.map((temp) => (
                <button
                  key={temp}
                  onClick={() => {
                    setTemporada(temp);
                    setFecha("Todas");
                  }}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                    temporada === temp
                      ? "bg-sky-400 text-black"
                      : "bg-[#0b0f14] text-zinc-400 hover:text-white"
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold mb-3">
              División
            </p>

            <div className="flex flex-wrap gap-3">
              {divisiones.map((div) => (
                <button
                  key={div}
                  onClick={() => {
                    setDivision(div);
                    setFecha("Todas");
                  }}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                    division === div
                      ? "bg-sky-400 text-black"
                      : "bg-[#0b0f14] text-zinc-400 hover:text-white"
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold mb-3">
              Fecha
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFecha("Todas")}
                className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                  fecha === "Todas"
                    ? "bg-sky-400 text-black"
                    : "bg-[#0b0f14] text-zinc-400 hover:text-white"
                }`}
              >
                Todas
              </button>

              {fechas.map((f) => (
                <button
                  key={f}
                  onClick={() => setFecha(f)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                    fecha === f
                      ? "bg-sky-400 text-black"
                      : "bg-[#0b0f14] text-zinc-400 hover:text-white"
                  }`}
                >
                  Fecha {f}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div>
          <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold">
            Selección actual
          </p>

          <h2 className="text-3xl font-black mt-2">
            {temporada} · {division} ·{" "}
            {fecha === "Todas" ? "Todas las fechas" : `Fecha ${fecha}`}
          </h2>
        </div>

        <div className="space-y-4">
          {partidos.length === 0 ? (
            <div className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-8 text-zinc-500">
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
                    partido.partido_id
                  )}`}
                  className="block bg-[#11151c] border border-white/[0.06] rounded-3xl p-6 hover:border-sky-400/40 transition"
                >
                  <div className="flex items-center justify-between mb-4 gap-4">
                    <p className="text-zinc-500 text-sm font-bold uppercase">
                      Fecha {partido.fecha} · {partido.temporada} ·{" "}
                      {partido.division}
                    </p>

                    <span className="text-sky-400 text-sm font-bold">
                      Ver detalle →
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-5">
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl font-black break-words">
                        {e1?.equipo}
                      </h2>
                    </div>

                    <div className="text-center">
                      <span className="text-5xl font-black font-mono whitespace-nowrap">
                        {e1?.goals} - {e2?.goals}
                      </span>
                    </div>

                    <div className="text-center md:text-right">
                      <h2 className="text-2xl font-black break-words">
                        {e2?.equipo}
                      </h2>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}