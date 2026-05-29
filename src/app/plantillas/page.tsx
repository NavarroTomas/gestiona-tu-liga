"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PlantillasPage() {
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
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("Todos");

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

    const plantillasBase = data || [];

    const { data: statsJugadores } = await supabase
      .from("estadisticas_jugadores")
      .select("nombre, playerId, equipo")
      .eq("temporada", temporada)
      .eq("division", division);

    const plantillasConPlayerId = plantillasBase.map((p: any) => {
      const encontrado = (statsJugadores || []).find((s: any) => {
        const nombreStats = (s.nombre || "").trim().toLowerCase();
        const nombrePlantilla = (p.jugador || "").trim().toLowerCase();

        const equipoStats = (s.equipo || "").trim().toLowerCase();
        const equipoPlantilla = (p.equipo || "").trim().toLowerCase();

        return (
          nombreStats === nombrePlantilla && equipoStats === equipoPlantilla
        );
      });

      return {
        ...p,
        playerId: encontrado?.playerId || "",
      };
    });

    setPlantillas(plantillasConPlayerId);

    const { data: equiposData } = await supabase
      .from("plantillas")
      .select("equipo")
      .eq("temporada", temporada)
      .eq("division", division);

    const equiposUnicos = Array.from(
      new Set((equiposData || []).map((e: any) => e.equipo).filter(Boolean)),
    ).sort();

    setEquipos(equiposUnicos as string[]);
  }

  function cambiarTemporada(temp: string) {
    setTemporada(temp);
    setEquipoSeleccionado("Todos");
  }

  function cambiarDivision(div: string) {
    setDivision(div);
    setEquipoSeleccionado("Todos");
  }

  const agrupadoPorEquipo: any = {};

  plantillas.forEach((p) => {
    if (!agrupadoPorEquipo[p.equipo]) {
      agrupadoPorEquipo[p.equipo] = [];
    }

    agrupadoPorEquipo[p.equipo].push(p);
  });

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10">
            <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
              APA PSO ARGENTINA
            </p>

            <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic leading-none">
              <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                Plantillas
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Consultá los jugadores registrados por club, temporada y división.
              Cada jugador con Player ID enlaza directamente a su perfil histórico.
            </p>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Temporada
                </p>
                <p className="mt-2 text-2xl font-black text-sky-300">
                  {temporada.replace("Temporada ", "T")}
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
                  Club
                </p>
                <p className="mt-2 text-2xl font-black text-purple-300 truncate">
                  {equipoSeleccionado}
                </p>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Jugadores
                </p>
                <p className="mt-2 text-2xl font-black text-green-400">
                  {plantillas.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]">
          <div className="grid gap-7">
            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Temporada
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {temporadas.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => cambiarTemporada(temp)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      temporada === temp
                        ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {temp}
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
                    onClick={() => cambiarDivision(div)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      division === div
                        ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Club
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setEquipoSeleccionado("Todos")}
                  className={`rounded-2xl border px-5 py-3 text-sm font-black uppercase transition-all ${
                    equipoSeleccionado === "Todos"
                      ? "border-sky-300 bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.35)]"
                      : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                  }`}
                >
                  Todos
                </button>

                {equipos.map((equipo) => (
                  <button
                    key={equipo}
                    onClick={() => setEquipoSeleccionado(equipo)}
                    className={`rounded-2xl border px-5 py-3 text-sm font-black uppercase transition-all ${
                      equipoSeleccionado === equipo
                        ? "border-sky-300 bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {equipo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
            Selección actual
          </p>

          <h2 className="mt-3 text-3xl md:text-5xl font-black uppercase">
            {temporada}
            <span className="text-sky-400"> / </span>
            {division}
          </h2>

          <p className="mt-3 text-zinc-500">
            {equipoSeleccionado} · {plantillas.length} jugadores encontrados
          </p>
        </section>

        {plantillas.length === 0 ? (
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-10 text-center">
            <p className="text-zinc-500">
              Todavía no hay jugadores cargados en esta plantilla.
            </p>
          </section>
        ) : (
          <section className="space-y-8">
            {Object.keys(agrupadoPorEquipo).map((equipo) => {
              const jugadores = [...agrupadoPorEquipo[equipo]].sort((a, b) => {
                const orden: Record<string, number> = {
                  GK: 1,
                  POR: 1,
                  CB: 2,
                  LB: 2,
                  RB: 2,
                  DEF: 2,
                  CDM: 3,
                  CM: 3,
                  CAM: 3,
                  MED: 3,
                  LW: 4,
                  RW: 4,
                  ST: 4,
                  CF: 4,
                  DEL: 4,
                };

                const posA = orden[(a.posicion || "").toUpperCase()] || 99;
                const posB = orden[(b.posicion || "").toUpperCase()] || 99;

                return posA - posB;
              });

              return (
                <div
                  key={equipo}
                  className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 shadow-[0_0_30px_rgba(0,120,255,.10)]"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-950 border border-sky-300 flex items-center justify-center text-xl font-black shadow-[0_0_20px_rgba(56,189,248,.3)]">
                        {equipo.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <h2 className="text-3xl font-black uppercase">
                          {equipo}
                        </h2>
                        <p className="text-zinc-500 mt-1">
                          {jugadores.length} jugadores registrados
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/equipos/${encodeURIComponent(equipo)}`}
                      className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-400/20"
                    >
                      Ver club →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {jugadores.map((j: any) => {
                      const card = (
                        <div className="rounded-2xl border border-sky-500/15 bg-black/35 p-5 transition hover:border-sky-400/40 hover:shadow-[0_0_20px_rgba(56,189,248,.10)]">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sky-400 text-[10px] uppercase tracking-[0.25em] font-black mb-2">
                                Jugador
                              </p>

                              <h3 className="text-xl font-black uppercase">
                                {j.jugador}
                              </h3>

                              <p className="text-zinc-500 text-sm mt-1">
                                {j.posicion || "Sin posición"} ·{" "}
                                {j.estado || "Activo"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 font-black text-zinc-300">
                              {j.posicion || "-"}
                            </div>
                          </div>

                          <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                            {j.playerId ? "Ver perfil →" : "Sin Player ID"}
                          </p>
                        </div>
                      );

                      if (j.playerId) {
                        return (
                          <Link
                            key={j.id}
                            href={`/jugadores/${encodeURIComponent(j.playerId)}`}
                          >
                            {card}
                          </Link>
                        );
                      }

                      return <div key={j.id}>{card}</div>;
                    })}
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
