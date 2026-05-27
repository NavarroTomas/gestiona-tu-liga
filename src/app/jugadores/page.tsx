"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Jugador {
  nombre: string;
  equipo: string;
  goles: number;
  asistencias: number;
  mvps: number;
}

export default function JugadoresPage() {
  const searchParams = useSearchParams();

  const temporada = searchParams.get("temporada") || "Temporada 1";
  const division = searchParams.get("division") || "Primera";

  const temporadas = ["Temporada 1", "Temporada 2", "Temporada 3", "Temporada 4"];
  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [jugadores, setJugadores] = useState<Jugador[]>([]);

  useEffect(() => {
    cargarJugadores();
  }, [temporada, division]);

  async function cargarJugadores() {
    const { data, error } = await supabase
      .from("jugadores")
      .select("*")
      .eq("temporada", temporada)
      .eq("division", division);

    if (error) {
      console.log(error);
      return;
    }

    const mapa: { [key: string]: Jugador } = {};

    data?.forEach((j: any) => {
      const nombre = (j.nombre || "").trim();
      if (!nombre) return;

      if (!mapa[nombre]) {
        mapa[nombre] = {
          nombre,
          equipo: j.equipo || "Sin Club",
          goles: 0,
          asistencias: 0,
          mvps: 0,
        };
      }

      mapa[nombre].goles += Number(j.goles) || 0;
      mapa[nombre].asistencias += Number(j.asistencias) || 0;
      mapa[nombre].mvps += Number(j.mvps) || 0;
    });

    setJugadores(Object.values(mapa));
  }

  function Ranking({
    titulo,
    tipo,
    color,
  }: {
    titulo: string;
    tipo: "goles" | "asistencias" | "mvps";
    color: string;
  }) {
    const ordenados = [...jugadores]
      .filter((j) => Number(j[tipo]) > 0)
      .sort((a, b) => Number(b[tipo]) - Number(a[tipo]))
      .slice(0, 10);

    return (
      <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
        <h2 className="text-2xl font-black mb-5">{titulo}</h2>

        <div className="space-y-3">
          {ordenados.length === 0 ? (
            <p className="text-zinc-500">No hay datos todavía.</p>
          ) : (
            ordenados.map((jugador, index) => (
              <Link
                key={jugador.nombre}
                href={`/jugador/${encodeURIComponent(jugador.nombre)}`}
                className="flex items-center justify-between bg-[#0b0f14] border border-white/[0.05] rounded-2xl p-4 hover:border-sky-400/40 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center font-black text-zinc-400">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-black text-white">{jugador.nombre}</p>
                    <p className="text-sm text-zinc-500">{jugador.equipo}</p>
                  </div>
                </div>

                <p className={`text-3xl font-black ${color}`}>
                  {jugador[tipo]}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-10">
        <div>
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            APA PSO ARGENTINA
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">
            Jugadores
          </h1>

          <p className="mt-4 text-zinc-400 max-w-2xl">
            Rankings oficiales por temporada y división.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {temporadas.map((temp) => (
            <a
              key={temp}
              href={`/jugadores?temporada=${encodeURIComponent(temp)}&division=${encodeURIComponent(division)}`}
              className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                temporada === temp
                  ? "bg-sky-400 text-black"
                  : "bg-[#11151c] text-zinc-400 hover:text-white"
              }`}
            >
              {temp}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {divisiones.map((div) => (
            <a
              key={div}
              href={`/jugadores?temporada=${encodeURIComponent(temporada)}&division=${encodeURIComponent(div)}`}
              className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                division === div
                  ? "bg-sky-400 text-black"
                  : "bg-[#11151c] text-zinc-400 hover:text-white"
              }`}
            >
              {div}
            </a>
          ))}
        </div>

        <div>
          <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold">
            Selección actual
          </p>

          <h2 className="text-3xl font-black mt-2">
            {temporada} · {division}
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <Ranking titulo="Goleadores" tipo="goles" color="text-emerald-400" />
          <Ranking titulo="Asistencias" tipo="asistencias" color="text-sky-400" />
          <Ranking titulo="MVPs" tipo="mvps" color="text-yellow-300" />
        </div>
      </div>
    </main>
  );
}