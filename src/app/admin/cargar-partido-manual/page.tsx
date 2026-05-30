"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type JugadorManual = {
  nombre: string;
  playerId: string;
  equipo: string;
  posicion: string;
  goals: string;
  assists: string;
  mvp: boolean;
  score: string;
  overallRating: string;
  passes: string;
  tackles: string;
  interceptions: string;
  gKSAVES: string;
  gKCatches: string;
};

function jugadorVacio(equipo = ""): JugadorManual {
  return {
    nombre: "",
    playerId: "",
    equipo,
    posicion: "",
    goals: "0",
    assists: "0",
    mvp: false,
    score: "0",
    overallRating: "0",
    passes: "0",
    tackles: "0",
    interceptions: "0",
    gKSAVES: "0",
    gKCatches: "0",
  };
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <p className="mb-2 text-zinc-500 text-[10px] uppercase tracking-[0.22em] font-black">
        {label}
      </p>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-sky-400/60"
      />
    </label>
  );
}

export default function CargarPartidoManualPage() {
  const [temporada, setTemporada] = useState("Temporada 1");
  const [division, setDivision] = useState("Primera");
  const [fecha, setFecha] = useState("1");
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");

  const [local, setLocal] = useState("");
  const [visitante, setVisitante] = useState("");
  const [golesLocal, setGolesLocal] = useState("0");
  const [golesVisitante, setGolesVisitante] = useState("0");

  const [jugadores, setJugadores] = useState<JugadorManual[]>([jugadorVacio()]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const partidoId =
    local && visitante
      ? `${local}-${visitante}-${temporada}-${division}-F${fecha}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\\u0300-\\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : "";

  function actualizarJugador(index: number, campo: keyof JugadorManual, valor: any) {
    const copia = [...jugadores];
    copia[index] = {
      ...copia[index],
      [campo]: valor,
    };
    setJugadores(copia);
  }

  function agregarJugador(equipo = "") {
    setJugadores([...jugadores, jugadorVacio(equipo)]);
  }

  function eliminarJugador(index: number) {
    setJugadores(jugadores.filter((_, i) => i !== index));
  }

  async function guardarPartido() {
    setMensaje("");

    if (!local || !visitante) {
      setMensaje("Falta cargar equipo local y visitante.");
      return;
    }

    if (!partidoId) {
      setMensaje("No se pudo generar partido_id.");
      return;
    }

    setGuardando(true);

    const resultado = `${golesLocal}-${golesVisitante}`;

    const partido = {
      local,
      visitante,
      resultado,
      fecha,
      temporada,
      division,
      dia,
      hora,
      partido_id: partidoId,
    };

    const equiposStats = [
      {
        partido_id: partidoId,
        equipo: local,
        goals: Number(golesLocal || 0),
        assists: 0,
        possession: 0,
        shots: 0,
        shotsOnTarget: 0,
        passes: 0,
        keyPasses: 0,
        tackles: 0,
        interceptions: 0,
        possessionsLost: 0,
        fouls: 0,
        cornerKicks: 0,
        temporada,
        division,
        fecha,
      },
      {
        partido_id: partidoId,
        equipo: visitante,
        goals: Number(golesVisitante || 0),
        assists: 0,
        possession: 0,
        shots: 0,
        shotsOnTarget: 0,
        passes: 0,
        keyPasses: 0,
        tackles: 0,
        interceptions: 0,
        possessionsLost: 0,
        fouls: 0,
        cornerKicks: 0,
        temporada,
        division,
        fecha,
      },
    ];

    const jugadoresValidos = jugadores
      .filter((j) => j.nombre.trim() && j.equipo.trim())
      .map((j) => ({
        partido_id: partidoId,
        nombre: j.nombre.trim(),
        playerId: j.playerId.trim(),
        posicion: j.posicion.trim(),
        equipo: j.equipo.trim(),
        temporada,
        division,
        fecha,
        goals: Number(j.goals || 0),
        assists: Number(j.assists || 0),
        mvp: j.mvp ? 1 : 0,
        score: Number(j.score || 0),
        overallRating: Number(j.overallRating || 0),
        passes: Number(j.passes || 0),
        keyPasses: 0,
        tackles: Number(j.tackles || 0),
        keyTackles: 0,
        interceptions: Number(j.interceptions || 0),
        keyInterceptions: 0,
        possessionsLost: 0,
        gKCatches: Number(j.gKCatches || 0),
        gKSAVES: Number(j.gKSAVES || 0),
      }));

    const { error: errorPartido } = await supabase
      .from("partidos")
      .upsert(partido, { onConflict: "partido_id" });

    if (errorPartido) {
      console.log(errorPartido);
      setMensaje("Error guardando partido.");
      setGuardando(false);
      return;
    }

    const { error: errorEquipos } = await supabase
      .from("estadisticas_equipos")
      .insert(equiposStats);

    if (errorEquipos) {
      console.log(errorEquipos);
      setMensaje("Partido guardado, pero falló estadisticas_equipos.");
      setGuardando(false);
      return;
    }

    if (jugadoresValidos.length > 0) {
      const { error: errorJugadores } = await supabase
        .from("estadisticas_jugadores")
        .insert(jugadoresValidos);

      if (errorJugadores) {
        console.log(errorJugadores);
        setMensaje("Partido y equipos guardados, pero falló estadisticas_jugadores.");
        setGuardando(false);
        return;
      }

      const jugadoresBase = jugadoresValidos
        .filter((j) => j.playerId)
        .map((j) => ({
          nombre: j.nombre,
          playerId: j.playerId,
          equipo: j.equipo,
          temporada,
          division,
        }));

      if (jugadoresBase.length > 0) {
        await supabase.from("jugadores").upsert(jugadoresBase, {
          onConflict: "playerId",
        });
      }
    }

    setMensaje("Partido cargado correctamente.");
    setGuardando(false);
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10">
            <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
              APA PSO ARGENTINA
            </p>

            <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic leading-none">
              Carga Manual
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Cargá partidos históricos sin TXT. Guarda partido, estadísticas de equipos y jugadores usando el mismo partido_id.
            </p>

            <div className="mt-6 rounded-2xl border border-sky-500/20 bg-black/35 p-4">
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                Partido ID generado
              </p>
              <p className="mt-2 break-all text-sky-300 font-black">
                {partidoId || "Completá local y visitante"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8 space-y-6">
          <h2 className="text-3xl font-black uppercase">Datos del partido</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Temporada" value={temporada} onChange={setTemporada} />
            <Input label="División" value={division} onChange={setDivision} />
            <Input label="Fecha" value={fecha} onChange={setFecha} />
            <Input label="Día" value={dia} onChange={setDia} placeholder="SÁB" />
            <Input label="Hora" value={hora} onChange={setHora} placeholder="21:00" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_1fr] gap-4 items-end">
            <Input label="Local" value={local} onChange={setLocal} />
            <Input label="Goles local" value={golesLocal} onChange={setGolesLocal} type="number" />
            <Input label="Goles visitante" value={golesVisitante} onChange={setGolesVisitante} type="number" />
            <Input label="Visitante" value={visitante} onChange={setVisitante} />
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black uppercase">Jugadores del partido</h2>
              <p className="mt-2 text-zinc-500">
                Cargá solo los jugadores importantes o todos los que participaron.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => agregarJugador(local)}
                className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-sm font-black uppercase text-sky-300"
              >
                + Local
              </button>

              <button
                type="button"
                onClick={() => agregarJugador(visitante)}
                className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-3 text-sm font-black uppercase text-yellow-300"
              >
                + Visitante
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {jugadores.map((j, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-sky-500/15 bg-black/35 p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-sky-300 text-xs uppercase tracking-[0.25em] font-black">
                    Jugador #{index + 1}
                  </p>

                  <button
                    type="button"
                    onClick={() => eliminarJugador(index)}
                    className="text-red-300 text-xs font-black uppercase"
                  >
                    Eliminar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input label="Nombre" value={j.nombre} onChange={(v) => actualizarJugador(index, "nombre", v)} />
                  <Input label="Player ID" value={j.playerId} onChange={(v) => actualizarJugador(index, "playerId", v)} />
                  <Input label="Equipo" value={j.equipo} onChange={(v) => actualizarJugador(index, "equipo", v)} />
                  <Input label="Posición" value={j.posicion} onChange={(v) => actualizarJugador(index, "posicion", v)} />

                  <Input label="Goles" value={j.goals} onChange={(v) => actualizarJugador(index, "goals", v)} type="number" />
                  <Input label="Asistencias" value={j.assists} onChange={(v) => actualizarJugador(index, "assists", v)} type="number" />
                  <Input label="Score" value={j.score} onChange={(v) => actualizarJugador(index, "score", v)} type="number" />
                  <Input label="Rating" value={j.overallRating} onChange={(v) => actualizarJugador(index, "overallRating", v)} type="number" />

                  <Input label="Pases" value={j.passes} onChange={(v) => actualizarJugador(index, "passes", v)} type="number" />
                  <Input label="Tackles" value={j.tackles} onChange={(v) => actualizarJugador(index, "tackles", v)} type="number" />
                  <Input label="Intercepciones" value={j.interceptions} onChange={(v) => actualizarJugador(index, "interceptions", v)} type="number" />

                  <label className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 flex items-center justify-between gap-3">
                    <span className="text-yellow-300 text-xs uppercase tracking-[0.2em] font-black">
                      MVP
                    </span>
                    <input
                      type="checkbox"
                      checked={j.mvp}
                      onChange={(e) => actualizarJugador(index, "mvp", e.target.checked)}
                      className="h-5 w-5"
                    />
                  </label>

                  <Input label="Atajadas" value={j.gKSAVES} onChange={(v) => actualizarJugador(index, "gKSAVES", v)} type="number" />
                  <Input label="Atrapadas" value={j.gKCatches} onChange={(v) => actualizarJugador(index, "gKCatches", v)} type="number" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8">
          <button
            type="button"
            onClick={guardarPartido}
            disabled={guardando}
            className="w-full rounded-3xl bg-gradient-to-r from-sky-400 to-blue-700 px-6 py-5 text-black font-black uppercase tracking-[0.2em] shadow-[0_0_35px_rgba(56,189,248,.35)] disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar partido manual"}
          </button>

          {mensaje && (
            <p className="mt-5 rounded-2xl border border-sky-500/20 bg-black/35 p-4 text-center text-sky-300 font-black">
              {mensaje}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
