"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SubirPartido() {
  const [file, setFile] = useState<File | null>(null);
  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("primera");
  const [fecha, setFecha] = useState("1");

  async function handleUpload() {
    if (!file) {
      alert("Elegí un archivo");
      return;
    }

    const text = await file.text();
    await procesarJSON(text);
  }

  async function procesarJSON(text: string) {
    try {
      const data = JSON.parse(text);

      const team1 = data.team1Stats.teamName;
      const team2 = data.team2Stats.teamName;

      const goles1 = data.team1Stats.goals || 0;
      const goles2 = data.team2Stats.goals || 0;

      const resultado = `${goles1}-${goles2}`;

      const { data: existe } = await supabase
        .from("partidos")
        .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora")
        .eq("local", team1)
        .eq("visitante", team2)
        .eq("resultado", resultado)
        .eq("temporada", temporada)
        .eq("division", division)
        .eq("fecha", fecha);

      if (existe && existe.length > 0) {
        alert("⚠️ Partido ya cargado");
        return;
      }

      await supabase.from("partidos").insert([
        {
          local: team1,
          visitante: team2,
          resultado,
          temporada,
          division,
          fecha,
        },
      ]);

      const jugadoresTeam1 = (data.team1PlayerStats || []).map((j: any) => ({
        ...j,
        equipoReal: team1,
      }));

      const jugadoresTeam2 = (data.team2PlayerStats || []).map((j: any) => ({
        ...j,
        equipoReal: team2,
      }));

      const jugadores = [...jugadoresTeam1, ...jugadoresTeam2];

      const jugadorMVP = jugadores.reduce((best: any, current: any) =>
        (current.score || 0) > (best.score || 0) ? current : best
      );

      for (const j of jugadores) {
        const nombre = j.playerName;
        const equipo = j.equipoReal;
        const goles = j.goals || 0;
        const asistencias = j.assists || 0;
        const mvp = nombre === jugadorMVP.playerName ? 1 : 0;

        await supabase.from("partido_jugadores").insert([
          {
            nombre,
            equipo,
            temporada,
            division,
            partido_local: team1,
            partido_visitante: team2,
            resultado,
            goles,
            asistencias,
            mvp,
          },
        ]);

        const { data: existente } = await supabase
          .from("jugadores")
          .select("id, nombre, playerId, equipo, goles, asistencias, mvps, temporada, division")
          .eq("nombre", nombre)
          .eq("equipo", equipo)
          .eq("temporada", temporada)
          .eq("division", division)
          .maybeSingle();

        if (existente) {
          await supabase
            .from("jugadores")
            .update({
              goles: (existente.goles || 0) + goles,
              asistencias: (existente.asistencias || 0) + asistencias,
              mvps: (existente.mvps || 0) + mvp,
            })
            .eq("id", existente.id);
        } else {
          await supabase.from("jugadores").insert([
            {
              nombre,
              equipo,
              temporada,
              division,
              goles,
              asistencias,
              mvps: mvp,
            },
          ]);
        }
      }

      alert("🔥 Partido cargado correctamente");
      window.location.reload();
    } catch (err) {
      console.log(err);
      alert("Error procesando archivo");
    }
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-3xl">
      <h3 className="text-2xl font-bold mb-4">Subir Partido</h3>

      <select
        value={temporada}
        onChange={(e) => setTemporada(e.target.value)}
        className="mb-3 p-2 text-black rounded w-full"
      >
        <option>Temporada 1</option>
        <option>Temporada 2</option>
        <option>Temporada 3</option>
      </select>

      <select
        value={division}
        onChange={(e) => setDivision(e.target.value)}
        className="mb-3 p-2 text-black rounded w-full"
      >
        <option value="primera">Primera División</option>
        <option value="segunda">Segunda División</option>
        <option value="tercera">Tercera División</option>
      </select>

      <select
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="mb-4 p-2 text-black rounded w-full"
      >
        <option value="1">Fecha 1</option>
        <option value="2">Fecha 2</option>
        <option value="3">Fecha 3</option>
        <option value="4">Fecha 4</option>
        <option value="5">Fecha 5</option>
      </select>

      <input
        type="file"
        accept=".txt,.json"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="bg-white text-black px-4 py-2 rounded-xl font-bold w-full"
      >
        Subir archivo
      </button>
    </div>
  );
}