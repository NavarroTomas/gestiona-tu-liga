"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type JugadorRanking = {
  nombre: string;
  playerId: string;
  equipo: string;
  goles: number;
  asistencias: number;
};

export default function Jugadores() {
  const [jugadores, setJugadores] = useState<JugadorRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("v_ranking_jugadores")
        .select("playerId, nombre, equipo, goals, assists")
        .order("goals", { ascending: false })
        .limit(10);

      if (cancelado) return;

      if (error) {
        console.error("Error cargando jugadores:", error);
        setJugadores([]);
        setErrorMsg("No se pudieron cargar los jugadores.");
        setLoading(false);
        return;
      }

      const lista = (data || []).map((j: any) => ({
        nombre: j.nombre || "Jugador",
        playerId: j.playerId || "",
        equipo: j.equipo || "Sin Club",
        goles: Number(j.goals || 0),
        asistencias: Number(j.assists || 0),
      }));

      setJugadores(lista);
      setLoading(false);
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div className="bg-zinc-900 p-6 rounded-3xl">
      <h3 className="text-2xl font-bold mb-6">Jugadores</h3>

      {loading ? (
        <p className="text-zinc-400 text-sm">Cargando jugadores...</p>
      ) : errorMsg ? (
        <p className="text-red-300 text-sm">{errorMsg}</p>
      ) : jugadores.length === 0 ? (
        <p className="text-zinc-400 text-sm">No hay jugadores cargados.</p>
      ) : (
        <div className="space-y-3">
          {jugadores.map((jugador, index) => {
            const contenido = (
              <div className="flex justify-between items-center gap-4">
                <div className="min-w-0">
                  <p className="font-bold truncate">
                    #{index + 1} {jugador.nombre}
                  </p>

                  <p className="text-zinc-400 text-sm truncate">
                    {jugador.equipo}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold">⚽ {jugador.goles}</p>

                  <p className="text-zinc-400 text-sm">
                    🎯 {jugador.asistencias}
                  </p>
                </div>
              </div>
            );

            if (!jugador.playerId) {
              return (
                <div
                  key={`${jugador.nombre}-${index}`}
                  className="block bg-zinc-800 p-4 rounded-xl"
                >
                  {contenido}
                </div>
              );
            }

            return (
              <Link
                key={jugador.playerId}
                href={`/jugadores/${encodeURIComponent(jugador.playerId)}`}
                className="block bg-zinc-800 p-4 rounded-xl hover:scale-105 transition"
              >
                {contenido}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
