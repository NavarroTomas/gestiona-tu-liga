"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Club {
  id: string;
  nombre: string;
  temporada: string;
  division: string;
}

export default function ClubesPage() {
  const searchParams = useSearchParams();

  const temporada = searchParams.get("temporada") || "Temporada 1";
  const division = searchParams.get("division") || "Primera";

  const temporadas = ["Temporada 1", "Temporada 2", "Temporada 3", "Temporada 4"];
  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [clubes, setClubes] = useState<Club[]>([]);

  useEffect(() => {
    cargarClubes();
  }, [temporada, division]);

  async function cargarClubes() {
    const { data, error } = await supabase
      .from("equipos")
      .select("*")
      .eq("temporada", temporada)
      .eq("division", division)
      .order("nombre", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setClubes(data || []);
  }

  function iniciales(nombre: string) {
    return nombre
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="bg-[#11151c] border-b border-white/[0.05]">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8">
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            APA PSO ARGENTINA
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">
            CLUBES
          </h1>

          <p className="mt-4 text-zinc-400 max-w-2xl">
            Historial completo de clubes por temporadas y divisiones.
          </p>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-10">
        <div className="space-y-4">
          <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold">
            TEMPORADAS
          </p>

          <div className="flex flex-wrap gap-3">
            {temporadas.map((temp) => (
              <a
                key={temp}
                href={`/clubes?temporada=${encodeURIComponent(temp)}&division=${encodeURIComponent(division)}`}
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
        </div>

        <div className="space-y-4">
          <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold">
            DIVISIONES
          </p>

          <div className="flex flex-wrap gap-3">
            {divisiones.map((div) => (
              <a
                key={div}
                href={`/clubes?temporada=${encodeURIComponent(temporada)}&division=${encodeURIComponent(div)}`}
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
        </div>

        <div>
          <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold">
            CLUBES REGISTRADOS
          </p>

          <h2 className="text-3xl font-black mt-2">
            {temporada} · {division}
          </h2>
        </div>

        {clubes.length === 0 ? (
          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-8">
            <p className="text-zinc-500">
              Todavía no hay clubes cargados para esta temporada y división.
            </p>
          </section>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {clubes.map((club) => (
              <Link
                key={club.id}
                href={`/equipos/${encodeURIComponent(club.nombre)}`}
                className="group bg-[#11151c] border border-white/[0.05] rounded-3xl p-5 hover:border-sky-400/40 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-sky-400 to-blue-900 mb-5 flex items-center justify-center text-black font-black text-xl">
                  {iniciales(club.nombre)}
                </div>

                <h3 className="text-xl font-black group-hover:text-sky-400 transition-colors">
                  {club.nombre}
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  {club.temporada} · {club.division}
                </p>

                <p className="mt-5 text-sm text-sky-400 font-bold">
                  Ver perfil completo →
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}