"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SubirTxtPage() {
  const temporadas = [
    "Temporada 1",
    "Temporada 2",
    "Temporada 3",
    "Temporada 4",
  ];
  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [archivo, setArchivo] = useState<File | null>(null);
  const [temporada, setTemporada] = useState("Temporada 1");
  const [division, setDivision] = useState("Primera");
  const [fecha, setFecha] = useState("1");
  const [mensaje, setMensaje] = useState("");

  function n(valor: any) {
    return Number(valor || 0);
  }

  function limpiar(txt: string) {
    return (txt || "").trim();
  }

  function partidoId(local: string, visitante: string, resultado: string) {
    return `${temporada}-${division}-fecha-${fecha}-${local}-${resultado}-${visitante}`;
  }

  function normalizarEquipo(stats: any, idPartido: string) {
    return {
      partido_id: idPartido,
      equipo: limpiar(stats.teamName),
      temporada,
      division,
      fecha,

      passes: n(stats.passes),
      keyPasses: n(stats.keyPasses),
      assists: n(stats.assists),
      shots: n(stats.shots),
      shotsOnTarget: n(stats.shotsOnTarget),
      goals: n(stats.goals),
      tackles: n(stats.tackles),
      keyTackles: n(stats.keyTackles),
      interceptions: n(stats.interceptions),
      keyInterceptions: n(stats.keyInterceptions),
      possession: n(stats.possession),
      possessionsLost: n(stats.possessionsLost),
      fouls: n(stats.fouls),
      offsides: n(stats.offsides),
      handballs: n(stats.handballs),
      setPieceTimeouts: n(stats.setPieceTimeouts),
      freeKicks: n(stats.freeKicks),
      penalties: n(stats.penalties),
      goalKicks: n(stats.goalKicks),
      cornerKicks: n(stats.cornerKicks),
      throwIns: n(stats.throwIns),
      yellowCards: n(stats.yellowCards),
      redCards: n(stats.redCards),
    };
  }

  function normalizarJugador(j: any, idPartido: string, esMvp: boolean) {
    return {
      partido_id: idPartido,
      nombre: limpiar(j.playerName),
      playerId: j.playerId || "",
      posicion: j.postion || j.position || "",
      equipo: limpiar(j.team),
      temporada,
      division,
      fecha,

      passes: n(j.passes),
      keyPasses: n(j.keyPasses),
      assists: n(j.assists),
      shots: n(j.shots),
      shotsOnTarget: n(j.shotsOnTarget),
      goals: n(j.goals),
      tackles: n(j.tackles),
      keyTackles: n(j.keyTackles),
      interceptions: n(j.interceptions),
      keyInterceptions: n(j.keyInterceptions),
      possessionsLost: n(j.possessionsLost),
      gKSaves: n(j.gKSaves),
      gKCatches: n(j.gKCatches),
      overallRating: n(j.overallRating),
      score: n(j.score),
      mvp: esMvp ? 1 : 0,
    };
  }

  async function subirTxt() {
    try {
      setMensaje("");

      if (!archivo) {
        alert("Elegí un archivo TXT primero");
        return;
      }

      const texto = await archivo.text();
      const data = JSON.parse(texto);

      const team1 = data.team1Stats;
      const team2 = data.team2Stats;

      if (!team1 || !team2) {
        alert("El TXT no tiene team1Stats o team2Stats");
        return;
      }

      const local = limpiar(team1.teamName);
      const visitante = limpiar(team2.teamName);

      const golesLocal = n(team1.goals);
      const golesVisitante = n(team2.goals);

      const resultado = `${golesLocal}-${golesVisitante}`;
      const idPartido = partidoId(local, visitante, resultado);

      const { data: existe } = await supabase
        .from("partidos")
        .select("*")
        .eq("local", local)
        .eq("visitante", visitante)
        .eq("resultado", resultado)
        .eq("fecha", fecha)
        .eq("temporada", temporada)
        .eq("division", division);

      if (existe && existe.length > 0) {
        alert("Este partido ya fue cargado");
        return;
      }

      const { error: partidoError } = await supabase.from("partidos").insert([
        {
          local,
          visitante,
          resultado,
          fecha,
          temporada,
          division,
        },
      ]);

      if (partidoError) {
        console.log(partidoError);
        alert("Error cargando partido");
        return;
      }

      const equipos = [
        normalizarEquipo(team1, idPartido),
        normalizarEquipo(team2, idPartido),
      ];

      const { error: equiposError } = await supabase
        .from("estadisticas_equipos")
        .insert(equipos);

      if (equiposError) {
        console.log(equiposError);
        alert("Partido cargado, pero error guardando estadísticas de equipos");
        return;
      }

      const jugadoresRaw = [
        ...(data.team1PlayerStats || []),
        ...(data.team2PlayerStats || []),
      ];

      const mejorJugador = jugadoresRaw
        .filter((j: any) => limpiar(j.playerName))
        .sort((a: any, b: any) => n(b.score) - n(a.score))[0];

      const jugadoresDetallados = jugadoresRaw
        .filter((j: any) => limpiar(j.playerName))
        .map((j: any) =>
          normalizarJugador(
            j,
            idPartido,
            mejorJugador?.playerId === j.playerId,
          ),
        );

      const { error: jugadoresDetalleError } = await supabase
        .from("estadisticas_jugadores")
        .insert(jugadoresDetallados);

      if (jugadoresDetalleError) {
        console.log(jugadoresDetalleError);
        alert(
          "Error guardando estadísticas detalladas de jugadores: " +
            jugadoresDetalleError.message,
        );
        return;
      }

      const jugadoresUnicos = Array.from(
        new Set(jugadoresDetallados.map((j) => j.playerId).filter(Boolean)),
      );

      const jugadoresResumen = [];

      for (const playerId of jugadoresUnicos) {
        const jugadorBase = jugadoresDetallados.find(
          (j) => j.playerId === playerId,
        );

        if (!jugadorBase) continue;

        const { data: historialJugador, error: historialError } = await supabase
          .from("estadisticas_jugadores")
          .select("*")
          .eq("playerId", playerId)
          .eq("temporada", temporada)
          .eq("division", division)
          .eq("equipo", jugadorBase.equipo);

        if (historialError) {
          console.log(historialError);
          continue;
        }

        const totalGoles = (historialJugador || []).reduce(
          (acc: number, j: any) => acc + Number(j.goals || 0),
          0,
        );

        const totalAsistencias = (historialJugador || []).reduce(
          (acc: number, j: any) => acc + Number(j.assists || 0),
          0,
        );

        const totalMvps = (historialJugador || []).reduce(
          (acc: number, j: any) => acc + Number(j.mvp || 0),
          0,
        );

        jugadoresResumen.push({
          nombre: jugadorBase.nombre,
          playerId,
          equipo: jugadorBase.equipo,
          goles: totalGoles,
          asistencias: totalAsistencias,
          mvps: totalMvps,
          temporada,
          division,
        });
      }

      const { error: jugadoresError } = await supabase
        .from("jugadores")
        .upsert(jugadoresResumen, {
          onConflict: "playerId,temporada,division,equipo",
        });

      if (jugadoresError) {
        console.log(jugadoresError);
        alert(
          "Stats detalladas cargadas, pero error cargando ranking de jugadores",
        );
        return;
      }

      setMensaje(
        `Cargado perfecto: ${local} ${resultado} ${visitante}. Jugadores: ${jugadoresDetallados.length}. MVP por score: ${
          mejorJugador?.playerName || "Sin MVP"
        }`,
      );

      setArchivo(null);
    } catch (error) {
      console.log(error);
      alert(
        "No pude leer el TXT. Tiene que ser el formato JSON del MatchStats.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-10 space-y-8">
        <div>
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            ADMIN APA PSO
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">
            Subir TXT del Partido
          </h1>

          <p className="mt-4 text-zinc-400">
            Subí el MatchStats. Se cargan automáticamente partido, tabla,
            jugadores, MVP por score y estadísticas avanzadas.
          </p>
        </div>

        <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6 space-y-4">
          <input
            className="input"
            type="file"
            accept=".txt,.json"
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          />

          <input
            className="input"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            placeholder="Fecha"
          />

          <select
            className="input"
            value={temporada}
            onChange={(e) => setTemporada(e.target.value)}
          >
            {temporadas.map((temp) => (
              <option key={temp}>{temp}</option>
            ))}
          </select>

          <select
            className="input"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
          >
            {divisiones.map((div) => (
              <option key={div}>{div}</option>
            ))}
          </select>

          <button onClick={subirTxt} className="btn">
            Cargar Partido Automático
          </button>

          {mensaje && <p className="text-emerald-400 font-bold">{mensaje}</p>}
        </section>
      </div>
    </main>
  );
}
