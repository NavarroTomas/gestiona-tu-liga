"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PlantillasPage() {
  const searchParams = useSearchParams();

  const temporada = searchParams.get("temporada") || "Temporada 1";
  const division = searchParams.get("division") || "Primera";
  const equipoSeleccionado = searchParams.get("equipo") || "Todos";

  const temporadas = ["Temporada 1", "Temporada 2", "Temporada 3", "Temporada 4"];
  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [plantillas, setPlantillas] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<string[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [temporada, division, equipoSeleccionado]);

  async function cargarDatos() {
    let query = supabase
      .from("plantillas")
      .select("*")
      .eq("temporada", temporada)
      .eq("division", division)
      .order("equipo", { ascending: true });

    if (equipoSeleccionado !== "Todos") {
      query = query.eq("equipo", equipoSeleccionado);
    }

    const { data, error } = await query;

    if (error) {
      console.log(error);
      return;
    }

    setPlantillas(data || []);

    const { data: equiposData } = await supabase
      .from("plantillas")
      .select("equipo")
      .eq("temporada", temporada)
      .eq("division", division);

    const equiposUnicos = Array.from(
      new Set((equiposData || []).map((e: any) => e.equipo).filter(Boolean))
    ).sort();

    setEquipos(equiposUnicos as string[]);
  }

  function crearUrl(temp: string, div: string, equipo: string) {
    return `/plantillas?temporada=${encodeURIComponent(temp)}&division=${encodeURIComponent(
      div
    )}&equipo=${encodeURIComponent(equipo)}`;
  }

  const agrupadoPorEquipo: any = {};

  plantillas.forEach((p) => {
    if (!agrupadoPorEquipo[p.equipo]) {
      agrupadoPorEquipo[p.equipo] = [];
    }

    agrupadoPorEquipo[p.equipo].push(p);
  });

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-10">
        <div>
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            APA PSO ARGENTINA
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">
            Plantillas
          </h1>

          <p className="mt-4 text-zinc-400 max-w-2xl">
            Jugadores registrados por club, temporada y división.
          </p>
        </div>

        <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6 space-y-6">
          <div>
            <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold mb-3">
              Temporada
            </p>

            <div className="flex flex-wrap gap-3">
              {temporadas.map((temp) => (
                <Link
                  key={temp}
                  href={crearUrl(temp, division, "Todos")}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                    temporada === temp
                      ? "bg-sky-400 text-black"
                      : "bg-[#0b0f14] text-zinc-400 hover:text-white"
                  }`}
                >
                  {temp}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold mb-3">
              División
            </p>

            <div className="flex flex-wrap gap-3">
              {divisiones.map((div) => (
                <Link
                  key={div}
                  href={crearUrl(temporada, div, "Todos")}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                    division === div
                      ? "bg-sky-400 text-black"
                      : "bg-[#0b0f14] text-zinc-400 hover:text-white"
                  }`}
                >
                  {div}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold mb-3">
              Club
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={crearUrl(temporada, division, "Todos")}
                className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                  equipoSeleccionado === "Todos"
                    ? "bg-sky-400 text-black"
                    : "bg-[#0b0f14] text-zinc-400 hover:text-white"
                }`}
              >
                Todos
              </Link>

              {equipos.map((equipo) => (
                <Link
                  key={equipo}
                  href={crearUrl(temporada, division, equipo)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                    equipoSeleccionado === equipo
                      ? "bg-sky-400 text-black"
                      : "bg-[#0b0f14] text-zinc-400 hover:text-white"
                  }`}
                >
                  {equipo}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div>
          <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold">
            Selección actual
          </p>

          <h2 className="text-3xl font-black mt-2">
            {temporada} · {division} · {equipoSeleccionado}
          </h2>
        </div>

        {plantillas.length === 0 ? (
          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-8">
            <p className="text-zinc-500">
              Todavía no hay jugadores cargados en esta plantilla.
            </p>
          </section>
        ) : (
          <section className="space-y-8">
            {Object.keys(agrupadoPorEquipo).map((equipo) => {
              const jugadores = agrupadoPorEquipo[equipo];

              return (
                <div
                  key={equipo}
                  className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-3xl font-black">
                        {equipo}
                      </h2>

                      <p className="text-zinc-500 mt-1">
                        {jugadores.length} jugadores registrados
                      </p>
                    </div>

                    <Link
                      href={`/equipos/${encodeURIComponent(equipo)}`}
                      className="text-sky-400 font-bold"
                    >
                      Ver club →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {jugadores.map((j: any) => (
                      <Link
                        key={j.id}
                        href={`/jugador/${encodeURIComponent(j.jugador)}`}
                        className="bg-[#0b0f14] border border-white/[0.05] rounded-2xl p-5 hover:border-sky-400/40 transition"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-2xl font-black">
                              {j.jugador}
                            </h3>

                            <p className="text-zinc-500 text-sm mt-1">
                              {j.posicion || "Sin posición"} · {j.estado || "Activo"}
                            </p>
                          </div>

                          <div className="bg-white/[0.06] px-4 py-2 rounded-xl font-black text-zinc-300">
                            {j.posicion || "-"}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}