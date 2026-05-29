"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Club {
  id: string;
  nombre: string;
  temporada: string;
  division: string;
  logo_url?: string | null;
}

export default function ClubesPage() {
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

  function iniciales(nombre?: string) {
    if (!nombre) return "CL";

    return nombre
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <section className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="relative overflow-hidden rounded-[34px] border border-sky-500/40 bg-[#020714] shadow-[0_0_55px_rgba(0,120,255,.28)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_40%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 p-7 md:p-10">
            <div>
              <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
                APA PSO ARGENTINA
              </p>

              <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  CLUBES
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                  OFICIALES
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-zinc-400">
                Explorá los clubes registrados por temporada y división dentro
                de APA PSO Argentina UE5.
              </p>
            </div>

            <div className="hidden lg:flex h-36 w-36 items-center justify-center rounded-full border border-sky-400/40 bg-black/40 shadow-[0_0_35px_rgba(0,120,255,.45)]">
              <span className="text-5xl">🏟️</span>
            </div>
          </div>
        </div>

        <section className="rounded-[30px] border border-sky-500/30 bg-[#020714] p-5 md:p-7 shadow-[0_0_35px_rgba(0,120,255,.14)] space-y-6">
          <div>
            <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
              Temporadas
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {temporadas.map((temp) => (
                <button
                  key={temp}
                  onClick={() => setTemporada(temp)}
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
              Divisiones
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {divisiones.map((div) => (
                <button
                  key={div}
                  onClick={() => setDivision(div)}
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
        </section>

        <div>
          <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
            Clubes registrados
          </p>

          <h2 className="mt-3 text-3xl md:text-5xl font-black uppercase">
            {temporada}
            <span className="text-sky-400"> / </span>
            {division}
          </h2>
        </div>

        {clubes.length === 0 ? (
          <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-10 text-center text-zinc-500">
            Todavía no hay clubes cargados para esta temporada y división.
          </section>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {clubes.map((club) => (
              <Link
                key={club.id}
                href={`/equipos/${encodeURIComponent(club.nombre || "")}`}
                className="group relative overflow-hidden rounded-[30px] border border-sky-500/20 bg-[#020714] p-5 transition-all duration-300 hover:scale-[1.015] hover:border-sky-400/50 hover:shadow-[0_0_30px_rgba(56,189,248,.16)]"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_40%)]" />

                <div className="relative z-10">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="h-20 w-20 overflow-hidden rounded-full border border-sky-400/40 bg-gradient-to-b from-sky-400/30 to-blue-950 shadow-[0_0_20px_rgba(56,189,248,.2)]">
                      {club.logo_url ? (
                        <img
                          src={club.logo_url}
                          alt={club.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-black text-white">
                          {iniciales(club.nombre)}
                        </div>
                      )}
                    </div>

                    <span className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                      {club.division}
                    </span>
                  </div>

                  <h3 className="truncate text-2xl font-black uppercase text-white group-hover:text-sky-300 transition-colors">
                    {club.nombre || "Club sin nombre"}
                  </h3>

                  <p className="mt-3 text-sm text-zinc-400">
                    {club.temporada} · {club.division}
                  </p>

                  <div className="mt-6 flex items-center justify-between rounded-2xl border border-sky-500/20 bg-black/35 px-4 py-3">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
                      Perfil
                    </span>

                    <span className="text-sky-300 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}