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
  puntos?: number | string | null;
  pj?: number | string | null;
  color_principal?: string | null;
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

  const totalClubes = clubes.length;
  const totalPJ = clubes.reduce((acc, club) => acc + Number(club.pj || 0), 0);
  const totalPuntos = clubes.reduce(
    (acc, club) => acc + Number(club.puntos || 0),
    0,
  );

  const lider =
    clubes.length > 0
      ? [...clubes].sort(
          (a, b) => Number(b.puntos || 0) - Number(a.puntos || 0),
        )[0]
      : null;

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <section className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
                APA PSO ARGENTINA
              </p>

              <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Clubes
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                  Oficiales
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-zinc-400">
                Explorá los clubes registrados por temporada y división dentro
                de APA PSO Argentina UE5. Cada club enlaza a su perfil con
                estadísticas, plantel e historial.
              </p>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Clubes
                  </p>
                  <p className="mt-2 text-3xl font-black text-sky-300">
                    {totalClubes}
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    División
                  </p>
                  <p className="mt-2 text-2xl font-black text-yellow-300">
                    {division}
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-black/35 p-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    PJ acumulados
                  </p>
                  <p className="mt-2 text-3xl font-black text-purple-300">
                    {totalPJ}
                  </p>
                </div>

                <div className="rounded-2xl border border-green-500/20 bg-black/35 p-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Líder
                  </p>
                  <p className="mt-2 truncate text-2xl font-black text-green-400">
                    {lider?.nombre || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex h-40 w-40 items-center justify-center rounded-full border border-sky-400/40 bg-black/40 shadow-[0_0_35px_rgba(0,120,255,.45)]">
              <span className="text-6xl">🏟️</span>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]">
          <div className="grid gap-7">
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
                    {temp.replace("Temporada ", "Temporada ")}
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
          </div>
        </section>

        <section>
          <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
            Clubes registrados
          </p>

          <h2 className="mt-3 text-3xl md:text-5xl font-black uppercase">
            {temporada}
            <span className="text-sky-400"> / </span>
            {division}
          </h2>

          <p className="mt-3 text-zinc-500">
            {totalClubes} clubes encontrados · {totalPuntos} puntos acumulados
          </p>
        </section>

        {clubes.length === 0 ? (
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-10 text-center">
            <p className="text-zinc-500">
              Todavía no hay clubes cargados para esta temporada y división.
            </p>
          </section>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {clubes.map((club) => (
              <Link
                key={club.id}
                href={`/equipos/${encodeURIComponent(club.nombre || "")}`}
                className="group relative overflow-hidden rounded-[34px] border border-sky-500/20 bg-[#020714] p-5 transition-all duration-300 hover:scale-[1.015] hover:border-sky-400/50 hover:shadow-[0_0_30px_rgba(56,189,248,.16)]"
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_40%)]" />

                <div className="relative z-10">
                  <div className="mb-5 rounded-[26px] border border-sky-500/15 bg-gradient-to-br from-sky-400/10 via-black/20 to-blue-950/40 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-sky-400/40 bg-gradient-to-b from-sky-400/30 to-blue-950 shadow-[0_0_24px_rgba(56,189,248,.25)]">
                        {club.logo_url ? (
                          <img
                            src={club.logo_url}
                            alt={club.nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white">
                            {iniciales(club.nombre)}
                          </div>
                        )}
                      </div>

                      <span className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                        {club.division}
                      </span>
                    </div>

                    <h3 className="mt-5 truncate text-2xl font-black uppercase text-white group-hover:text-sky-300 transition-colors">
                      {club.nombre || "Club sin nombre"}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      {club.temporada} · {club.division}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black">
                        PJ
                      </p>
                      <p className="mt-2 text-3xl font-black text-white">
                        {club.pj || 0}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                      <p className="text-yellow-300 text-[10px] uppercase tracking-[0.2em] font-black">
                        Puntos
                      </p>
                      <p className="mt-2 text-3xl font-black text-yellow-300">
                        {club.puntos || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-2xl border border-sky-500/20 bg-black/35 px-4 py-3">
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
                      Ver perfil del club
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
