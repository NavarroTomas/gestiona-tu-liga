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

const temporadas = ["Temporada 4"];

const divisiones = [
  { nombre: "Primera", icon: "🏆", color: "text-yellow-300" },
  { nombre: "Segunda", icon: "🥈", color: "text-sky-300" },
  { nombre: "Tercera", icon: "🥉", color: "text-orange-300" },
  { nombre: "Cuarta", icon: "⭐", color: "text-purple-300" },
];

export default function ClubesPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [clubes, setClubes] = useState<Club[]>([]);

  useEffect(() => {
    cargarClubes();
  }, [temporada, division]);

  async function cargarClubes() {
    const { data, error } = await supabase
      .from("equipos")
      .select("id, nombre, puntos, pj, temporada, division, logo_url, banner_url, descripcion, color_principal, club_slug")
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

  const divisionActual =
    divisiones.find((d) => d.nombre === division) || divisiones[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 md:px-8">
        <section className="relative overflow-hidden rounded-[40px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.22)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.20),transparent_42%)]" />
          <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/30" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
                Clubes APA · Instituciones oficiales
              </p>

              <h1 className="mt-5 text-4xl font-black uppercase italic leading-none sm:text-5xl md:text-6xl xl:text-7xl">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Clubes
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_22px_rgba(56,189,248,.55)]">
                  APA
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                Las instituciones que forman la identidad competitiva de APA PSO
                Argentina. Explorá clubes por temporada y categoría, entrá a sus
                perfiles, planteles, estadísticas e historial.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-black uppercase text-sky-300">
                  🛡️ Clubes oficiales
                </span>

                <span className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black uppercase text-yellow-300">
                  {divisionActual.icon} {division} División
                </span>

                <span className="rounded-2xl border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-black uppercase text-green-300">
                  ● {temporada}
                </span>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative rounded-[34px] border border-sky-400/25 bg-black/35 p-6 shadow-[0_0_38px_rgba(56,189,248,.18)]">
                <div className="absolute -inset-5 rounded-full bg-sky-400/10 blur-3xl" />

                <div className="relative z-10 text-center">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[32px] border border-sky-400/30 bg-sky-400/10 text-6xl">
                    🏟️
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-sky-300">
                    Galería oficial
                  </p>

                  <h2 className="mt-2 text-3xl font-black uppercase">
                    Club Hub
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
          <section className="rounded-[34px] border border-sky-500/25 bg-[#020714]/90 p-6 shadow-[0_0_35px_rgba(0,120,255,.12)] md:p-8">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                  Filtros
                </p>

                <h2 className="mt-2 text-3xl font-black uppercase">
                  Temporada y categoría
                </h2>
              </div>

              <p className="text-sm leading-6 text-zinc-500">
                Elegí el contexto competitivo para ver los clubes registrados.
              </p>
            </div>

            <div className="grid gap-7">
              <div>
                <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                  Temporadas
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {temporadas.map((temp) => (
                    <button
                      key={temp}
                      onClick={() => setTemporada(temp)}
                      className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                        temporada === temp
                          ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
                          : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white"
                      }`}
                    >
                      {temp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                  Categorías
                </p>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {divisiones.map((div) => (
                    <button
                      key={div.nombre}
                      onClick={() => setDivision(div.nombre)}
                      className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                        division === div.nombre
                          ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                          : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white"
                      }`}
                    >
                      {div.icon} {div.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[34px] border border-yellow-400/25 bg-gradient-to-br from-yellow-400/12 via-[#020714] to-black p-6 shadow-[0_0_35px_rgba(250,204,21,.10)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_40%)]" />

            <div className="relative z-10">
              <div className="mb-7 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300">
                    Club destacado
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase">
                    👑 Líder actual
                  </h2>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-yellow-400/25 bg-yellow-400/10 text-3xl">
                  👑
                </div>
              </div>

              {lider ? (
                <Link
                  href={`/equipos/${encodeURIComponent(lider.nombre || "")}`}
                  className="group block"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className="flex h-20 w-20 md:h-24 md:w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border bg-black/40 shadow-[0_0_25px_rgba(250,204,21,.14)]"
                      style={{
                        borderColor: `${lider.color_principal || "#facc15"}99`,
                      }}
                    >
                      {lider.logo_url ? (
                        <img
                          src={lider.logo_url}
                          alt={lider.nombre}
                          className="h-full w-full object-contain p-3"
                        />
                      ) : (
                        <span className="text-3xl font-black">
                          {iniciales(lider.nombre)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-3xl font-black uppercase transition group-hover:text-yellow-300">
                        {lider.nombre}
                      </h3>

                      <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-zinc-500">
                        {temporada} · {division} División
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        Puntos
                      </p>
                      <p className="mt-2 text-4xl font-black text-yellow-300">
                        {lider.puntos || 0}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        PJ
                      </p>
                      <p className="mt-2 text-4xl font-black text-sky-300">
                        {lider.pj || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between rounded-2xl border border-yellow-400/20 bg-black/35 px-4 py-3">
                    <span className="text-sm font-black uppercase text-yellow-300">
                      Ver perfil
                    </span>
                    <span className="text-yellow-300 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              ) : (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                  No hay líder cargado para esta selección.
                </p>
              )}
            </div>
          </section>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Clubes", totalClubes, "text-sky-300", "🏟️"],
            ["Categoría", division, "text-yellow-300", divisionActual.icon],
            ["PJ acumulados", totalPJ, "text-purple-300", "📅"],
            ["Puntos", totalPuntos, "text-green-300", "📊"],
          ].map(([label, value, color, icon]) => (
            <div
              key={label}
              className="rounded-[26px] border border-sky-500/20 bg-[#020714]/90 p-5 shadow-[0_0_25px_rgba(0,120,255,.10)]"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                {icon} {label}
              </p>
              <p className={`mt-2 truncate text-2xl md:text-3xl font-black uppercase ${color}`}>
                {value}
              </p>
            </div>
          ))}
        </section>

        <section>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
            Galería de clubes
          </p>

          <h2 className="mt-3 text-3xl font-black uppercase md:text-5xl">
            {temporada}
            <span className="text-sky-400"> / </span>
            {division} División
          </h2>

          <p className="mt-3 text-base leading-7 text-zinc-400">
            {totalClubes} clubes encontrados · {totalPuntos} puntos acumulados
          </p>
        </section>

        {clubes.length === 0 ? (
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-10 text-center">
            <p className="text-zinc-500">
              Todavía no hay clubes cargados para esta temporada y categoría.
            </p>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clubes.map((club, index) => {
              const colorClub = club.color_principal || "#38bdf8";
              const esLider = lider?.id === club.id;

              return (
                <Link
                  key={club.id}
                  href={`/equipos/${encodeURIComponent(club.nombre || "")}`}
                  className="group relative overflow-hidden rounded-[34px] border border-sky-500/20 bg-[#020714] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_0_30px_rgba(56,189,248,.16)]"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-24 opacity-35"
                    style={{
                      background: `linear-gradient(135deg, ${colorClub}88, transparent 72%)`,
                    }}
                  />

                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_40%)]" />

                  <div className="relative z-10">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div
                        className="flex h-20 w-20 md:h-24 md:w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border bg-black/45 shadow-[0_0_24px_rgba(56,189,248,.18)]"
                        style={{ borderColor: `${colorClub}99` }}
                      >
                        {club.logo_url ? (
                          <img
                            src={club.logo_url}
                            alt={club.nombre}
                            className="h-full w-full object-contain p-3"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white">
                            {iniciales(club.nombre)}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-300">
                          #{index + 1}
                        </span>

                        {esLider && (
                          <span className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                            👑 Líder
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="truncate text-2xl font-black uppercase text-white transition-colors group-hover:text-sky-300">
                      {club.nombre || "Club sin nombre"}
                    </h3>

                    <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-zinc-500">
                      {club.temporada} · {club.division} División
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                          PJ
                        </p>
                        <p className="mt-2 text-3xl font-black text-white">
                          {club.pj || 0}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300">
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
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
