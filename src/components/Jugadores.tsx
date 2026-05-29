"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Jugadores() {
  const [jugadores, setJugadores] = useState<any[]>([]);

  useEffect(() => {
    cargar();

    const interval = setInterval(() => {
      cargar();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  async function cargar() {
    const { data, error } = await supabase
      .from("estadisticas_jugadores")
      .select("*");

    if (error) {
      console.log(error);
      return;
    }

    const mapa: { [key: string]: any } = {};

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
        };
      }

      mapa[clave].goles += Number(j.goals) || 0;
      mapa[clave].asistencias += Number(j.assists) || 0;
    });

    const ordenados = Object.values(mapa)
      .sort((a: any, b: any) => Number(b.goles) - Number(a.goles))
      .slice(0, 10);

    setJugadores(ordenados);
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-3xl">
      <h3 className="text-2xl font-bold mb-6">Jugadores</h3>

      <div className="space-y-3">
        {jugadores.map((jugador, index) => (
          <Link
            key={jugador.playerId || jugador.nombre}
            href={
              jugador.playerId
                ? `/jugadores/${encodeURIComponent(jugador.playerId)}`
                : "#"
            }
            className="block bg-zinc-800 p-4 rounded-xl hover:scale-105 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">
                  #{index + 1} {jugador.nombre}
                </p>

                <p className="text-zinc-400 text-sm">{jugador.equipo}</p>
              </div>

              <div className="text-right">
                <p className="font-bold">⚽ {jugador.goles}</p>

                <p className="text-zinc-400 text-sm">
                  🎯 {jugador.asistencias}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}