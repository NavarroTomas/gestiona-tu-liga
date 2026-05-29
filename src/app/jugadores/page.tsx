"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Jugador {
  nombre: string;
  playerId: string;
  equipo: string;
  goles: number;
  asistencias: number;
  mvps: number;
  score: number;
  pases: number;
  tackles: number;
  ratingTotal: number;
  partidos: number;
  atajadas: number;
  atrapadas: number;
}

type RankingTipo =
  | "goles"
  | "asistencias"
  | "mvps"
  | "score"
  | "pases"
  | "tackles"
  | "rating"
  | "atajadas"
  | "atrapadas";

export default function JugadoresPage() {
  const [temporada, setTemporada] = useState("Temporada 1");
  const [division, setDivision] = useState("Primera");
  const [modo, setModo] = useState<"temporada" | "historico">("temporada");

  const temporadas = [
    "Temporada 1",
    "Temporada 2",
    "Temporada 3",
    "Temporada 4",
    "Temporada 5",
  ];
  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [jugadores, setJugadores] = useState<Jugador[]>([]);

  useEffect(() => {
    cargarJugadores();
  }, [temporada, division, modo]);

  function valorGKSave(r: any) {
    return Number(r.gKSAVES || r.gKSaves || r.gksaves || 0);
  }

  async function cargarJugadores() {
    let query = supabase.from("estadisticas_jugadores").select("*");

    if (modo === "temporada") {
      query = query.eq("temporada", temporada).eq("division", division);
    }

    const { data, error } = await query;

    if (error) {
      console.log(error);
      return;
    }

    const mapa: { [key: string]: Jugador } = {};

    data?.forEach((j: any) => {
      const nombre = (j.nombre || "").trim();
      const playerId = (j.playerId || "").trim();

      if (!nombre) return;

      const clave = playerId || nombre;

      if (!mapa[clave]) {
        mapa[clave] = {
          nombre,
          playerId,
          equipo: j.equipo || "Sin Club",
          goles: 0,
          asistencias: 0,
          mvps: 0,
          score: 0,
          pases: 0,
          tackles: 0,
          ratingTotal: 0,
          partidos: 0,
          atajadas: 0,
          atrapadas: 0,
        };
      }

      mapa[clave].goles += Number(j.goals) || 0;
      mapa[clave].asistencias += Number(j.assists) || 0;
      mapa[clave].mvps += Number(j.mvp) || 0;
      mapa[clave].score += Number(j.score) || 0;
      mapa[clave].pases += Number(j.passes) || 0;
      mapa[clave].tackles += Number(j.tackles) || 0;
      mapa[clave].ratingTotal += Number(j.overallRating) || 0;
      mapa[clave].partidos += 1;
      mapa[clave].atajadas += valorGKSave(j);
      mapa[clave].atrapadas += Number(j.gKCatches) || 0;
    });

    setJugadores(Object.values(mapa));
  }

  function Ranking({
    titulo,
    tipo,
    color,
  }: {
    titulo: string;
    tipo: RankingTipo;
    color: string;
  }) {
    const valorJugador = (j: Jugador) => {
      if (tipo === "rating") {
        return j.partidos > 0
          ? Number((j.ratingTotal / j.partidos).toFixed(1))
          : 0;
      }

      return Number(j[tipo]) || 0;
    };

    const ordenados = [...jugadores]
      .filter((j) => valorJugador(j) > 0)
      .sort((a, b) => valorJugador(b) - valorJugador(a))
      .slice(0, 10);

    return (
      <section className="bg-gradient-to-b from-[#101826] to-[#060b13] border border-white/[0.06] rounded-[32px] p-6 shadow-[0_0_30px_rgba(0,120,255,.12)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black">{titulo}</h2>
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
            🏆
          </div>
        </div>

        <div className="space-y-3">
          {ordenados.length === 0 ? (
            <p className="text-zinc-500">No hay datos todavía.</p>
          ) : (
            ordenados.map((jugador, index) => (
              <Link
                key={jugador.playerId || jugador.nombre}
                href={
                  jugador.playerId
                    ? `/jugadores/${encodeURIComponent(jugador.playerId)}`
                    : "#"
                }
                className="flex items-center justify-between bg-gradient-to-r from-[#0a0f18] to-[#111827] border border-white/[0.05] rounded-2xl p-4 hover:border-sky-400/40 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                      index === 0
                        ? "bg-yellow-400 text-black shadow-[0_0_20px_rgba(255,215,0,.8)]"
                        : index === 1
                          ? "bg-zinc-300 text-black"
                          : index === 2
                            ? "bg-orange-500 text-black"
                            : "bg-white/[0.05] text-zinc-400"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-black text-white text-lg">
                      {jugador.nombre}
                    </p>
                    <p className="text-sm text-zinc-500">{jugador.equipo}</p>
                  </div>
                </div>

                <p className={`text-5xl font-black ${color}`}>
                  {valorJugador(jugador)}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-10">
        <div className="relative overflow-hidden rounded-[32px] border border-sky-500/30 bg-gradient-to-r from-[#07152f] via-[#020714] to-[#132d63] p-8 shadow-[0_0_45px_rgba(0,120,255,.25)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,140,255,.25),transparent_30%)]" />

          <div className="relative z-10">
            <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
              APA PSO ARGENTINA
            </p>
            <h1 className="mt-3 text-5xl md:text-7xl font-black leading-none">
              RANKINGS
            </h1>
            <p className="mt-4 text-zinc-300 max-w-2xl text-lg">
              Goleadores, asistentes, MVPs y estadísticas históricas oficiales.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setModo("temporada")}
            className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
              modo === "temporada"
                ? "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,.6)]"
                : "bg-[#11151c] text-zinc-400 hover:text-white"
            }`}
          >
            Temporada actual
          </button>

          <button
            onClick={() => setModo("historico")}
            className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
              modo === "historico"
                ? "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,.6)]"
                : "bg-[#11151c] text-zinc-400 hover:text-white"
            }`}
          >
            Histórico global
          </button>
        </div>

        {modo === "temporada" && (
          <>
            <div className="flex flex-wrap gap-3">
              {temporadas.map((temp) => (
                <button
                  key={temp}
                  onClick={() => setTemporada(temp)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                    temporada === temp
                      ? "bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.7)]"
                      : "bg-[#11151c] text-zinc-400 hover:text-white"
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {divisiones.map((div) => (
                <button
                  key={div}
                  onClick={() => setDivision(div)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm uppercase transition-all ${
                    division === div
                      ? "bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.7)]"
                      : "bg-[#11151c] text-zinc-400 hover:text-white"
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>
          </>
        )}

        <div>
          <p className="text-zinc-500 uppercase tracking-[4px] text-xs font-bold">
            Selección actual
          </p>
          <h2 className="text-3xl font-black mt-2">
            {modo === "historico"
              ? "Histórico Global"
              : `${temporada} · ${division}`}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <Ranking
            titulo={
              modo === "historico"
                ? "⚽ Goleadores históricos"
                : "⚽ Goleadores"
            }
            tipo="goles"
            color="text-emerald-400"
          />
          <Ranking
            titulo={
              modo === "historico"
                ? "🎯 Asistidores históricos"
                : "🎯 Asistencias"
            }
            tipo="asistencias"
            color="text-sky-400"
          />
          <Ranking
            titulo={modo === "historico" ? "👑 MVPs históricos" : "👑 MVPs"}
            tipo="mvps"
            color="text-yellow-300"
          />
          <Ranking
            titulo={
              modo === "historico"
                ? "⭐ Rating promedio histórico"
                : "⭐ Rating promedio"
            }
            tipo="rating"
            color="text-green-400"
          />
          <Ranking
            titulo={modo === "historico" ? "💎 Score histórico" : "💎 Score"}
            tipo="score"
            color="text-yellow-300"
          />
          <Ranking
            titulo={modo === "historico" ? "👟 Pases históricos" : "👟 Pases"}
            tipo="pases"
            color="text-sky-300"
          />
          <Ranking
            titulo={
              modo === "historico" ? "🛡 Tackles históricos" : "🛡 Tackles"
            }
            tipo="tackles"
            color="text-red-400"
          />
          <Ranking
            titulo={
              modo === "historico" ? "🧤 Atajadas históricas" : "🧤 Atajadas"
            }
            tipo="atajadas"
            color="text-cyan-400"
          />
          <Ranking
            titulo={
              modo === "historico" ? "🤲 Atrapadas históricas" : "🤲 Atrapadas"
            }
            tipo="atrapadas"
            color="text-indigo-300"
          />
        </div>
      </div>
    </main>
  );
}
