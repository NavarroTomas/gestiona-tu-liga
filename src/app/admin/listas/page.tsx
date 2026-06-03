"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";

export default function AdminListasPage() {
  const temporadas = ["Temporada 1", "Temporada 2", "Temporada 3", "Temporada 4"];
  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [equipos, setEquipos] = useState<any[]>([]);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [jugadores, setJugadores] = useState<any[]>([]);

  const [editandoJugador, setEditandoJugador] = useState<any>(null);
  const [editandoPartido, setEditandoPartido] = useState<any>(null);
  const [editandoEquipo, setEditandoEquipo] = useState<any>(null);

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    const { data: equiposData } = await supabase.from("equipos").select("*").order("nombre");
    const { data: partidosData } = await supabase.from("partidos").select("*").order("fecha");
    const { data: jugadoresData } = await supabase.from("jugadores").select("*").order("nombre");

    setEquipos(equiposData || []);
    setPartidos(partidosData || []);
    setJugadores(jugadoresData || []);
  }

  async function borrar(tabla: string, id: string) {
    if (!confirm("¿Seguro que querés borrar esto?")) return;

    const { error } = await supabase.from(tabla).delete().eq("id", id);

    if (error) {
      console.log(error);
      alert("Error al borrar. Revisá RLS en Supabase.");
      return;
    }

    alert("Borrado correctamente");
    cargarTodo();
  }

  async function guardarJugador() {
    if (!editandoJugador) return;

    const { error } = await supabase
      .from("jugadores")
      .update({
        nombre: editandoJugador.nombre,
        equipo: editandoJugador.equipo,
        goles: Number(editandoJugador.goles),
        asistencias: Number(editandoJugador.asistencias),
        mvps: Number(editandoJugador.mvps),
        temporada: editandoJugador.temporada,
        division: editandoJugador.division,
      })
      .eq("id", editandoJugador.id);

    if (error) {
      console.log(error);
      alert("Error guardando jugador");
      return;
    }

    alert("Jugador actualizado");
    setEditandoJugador(null);
    cargarTodo();
  }

  async function guardarPartido() {
    if (!editandoPartido) return;

    const { error } = await supabase
      .from("partidos")
      .update({
        local: editandoPartido.local,
        visitante: editandoPartido.visitante,
        resultado: editandoPartido.resultado,
        fecha: editandoPartido.fecha,
        temporada: editandoPartido.temporada,
        division: editandoPartido.division,
        dia: editandoPartido.dia,
        hora: editandoPartido.hora,
      })
      .eq("id", editandoPartido.id);

    if (error) {
      console.log(error);
      alert("Error guardando partido");
      return;
    }

    alert("Partido actualizado");
    setEditandoPartido(null);
    cargarTodo();
  }

  async function guardarEquipo() {
    if (!editandoEquipo) return;

    const { error } = await supabase
      .from("equipos")
      .update({
        nombre: editandoEquipo.nombre,
        temporada: editandoEquipo.temporada,
        division: editandoEquipo.division,
      })
      .eq("id", editandoEquipo.id);

    if (error) {
      console.log(error);
      alert("Error guardando equipo");
      return;
    }

    alert("Equipo actualizado");
    setEditandoEquipo(null);
    cargarTodo();
  }

  return (
    <PermissionGuard permission="matches.edit">
      <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-10">
        <div>
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            ADMIN APA PSO
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">
            Listas, Edición y Borrado
          </h1>

          <p className="mt-4 text-zinc-400">
            Revisá, editá y borrá clubes, partidos y jugadores.
          </p>
        </div>

        {editandoJugador && (
          <section className="bg-[#11151c] border border-sky-400/30 rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-5">Editar Jugador</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-bold text-zinc-400 mb-2">👤 Nombre</p>
                <input
                  className="input"
                  value={editandoJugador.nombre || ""}
                  onChange={(e) =>
                    setEditandoJugador({ ...editandoJugador, nombre: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-400 mb-2">🛡️ Equipo</p>
                <input
                  className="input"
                  value={editandoJugador.equipo || ""}
                  onChange={(e) =>
                    setEditandoJugador({ ...editandoJugador, equipo: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-400 mb-2">⚽ Goles</p>
                <input
                  className="input"
                  type="number"
                  value={editandoJugador.goles ?? 0}
                  onChange={(e) =>
                    setEditandoJugador({ ...editandoJugador, goles: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-400 mb-2">👟 Asistencias</p>
                <input
                  className="input"
                  type="number"
                  value={editandoJugador.asistencias ?? 0}
                  onChange={(e) =>
                    setEditandoJugador({ ...editandoJugador, asistencias: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-400 mb-2">⭐ MVPs</p>
                <input
                  className="input"
                  type="number"
                  value={editandoJugador.mvps ?? 0}
                  onChange={(e) =>
                    setEditandoJugador({ ...editandoJugador, mvps: e.target.value })
                  }
                />
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-400 mb-2">🏆 Temporada</p>
                <select
                  className="input"
                  value={editandoJugador.temporada || "Temporada 1"}
                  onChange={(e) =>
                    setEditandoJugador({ ...editandoJugador, temporada: e.target.value })
                  }
                >
                  {temporadas.map((temp) => (
                    <option key={temp}>{temp}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-400 mb-2">📈 División</p>
                <select
                  className="input"
                  value={editandoJugador.division || "Primera"}
                  onChange={(e) =>
                    setEditandoJugador({ ...editandoJugador, division: e.target.value })
                  }
                >
                  {divisiones.map((div) => (
                    <option key={div}>{div}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={guardarJugador} className="btn">
                Guardar Cambios
              </button>

              <button
                onClick={() => setEditandoJugador(null)}
                className="bg-zinc-700 hover:bg-zinc-600 px-5 py-3 rounded-2xl font-bold transition-all"
              >
                Cancelar
              </button>
            </div>
          </section>
        )}

        {editandoPartido && (
          <section className="bg-[#11151c] border border-sky-400/30 rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-5">Editar Partido</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="input"
                value={editandoPartido.local || ""}
                onChange={(e) =>
                  setEditandoPartido({ ...editandoPartido, local: e.target.value })
                }
                placeholder="Local"
              />
              <input
                className="input"
                value={editandoPartido.visitante || ""}
                onChange={(e) =>
                  setEditandoPartido({ ...editandoPartido, visitante: e.target.value })
                }
                placeholder="Visitante"
              />
              <input
                className="input"
                value={editandoPartido.resultado || ""}
                onChange={(e) =>
                  setEditandoPartido({ ...editandoPartido, resultado: e.target.value })
                }
                placeholder="Resultado"
              />
              <input
                 className="input"
                 value={editandoPartido.fecha || ""}
                 onChange={(e) =>
                  setEditandoPartido({ ...editandoPartido, fecha: e.target.value })
                 }
                 placeholder="Fecha"
               />

              <input
                className="input"
                value={editandoPartido.dia || ""}
                onChange={(e) =>
                  setEditandoPartido({ ...editandoPartido, dia: e.target.value })
                }
                placeholder="Día: Sábado"
              />

              <input
                className="input"
                value={editandoPartido.hora || ""}
                onChange={(e) =>
                  setEditandoPartido({ ...editandoPartido, hora: e.target.value })
                }
                placeholder="Hora: 21:00"
              />
              <input
                className="input"
                value={editandoPartido.fecha || ""}
                onChange={(e) =>
                  setEditandoPartido({ ...editandoPartido, fecha: e.target.value })
                }
                placeholder="Fecha"
              />

              <select
                className="input"
                value={editandoPartido.temporada || "Temporada 1"}
                onChange={(e) =>
                  setEditandoPartido({ ...editandoPartido, temporada: e.target.value })
                }
              >
                {temporadas.map((temp) => (
                  <option key={temp}>{temp}</option>
                ))}
              </select>

              <select
                className="input"
                value={editandoPartido.division || "Primera"}
                onChange={(e) =>
                  setEditandoPartido({ ...editandoPartido, division: e.target.value })
                }
              >
                {divisiones.map((div) => (
                  <option key={div}>{div}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={guardarPartido} className="btn">
                Guardar Cambios
              </button>

              <button
                onClick={() => setEditandoPartido(null)}
                className="bg-zinc-700 hover:bg-zinc-600 px-5 py-3 rounded-2xl font-bold transition-all"
              >
                Cancelar
              </button>
            </div>
          </section>
        )}

        {editandoEquipo && (
          <section className="bg-[#11151c] border border-sky-400/30 rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-5">Editar Equipo</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="input"
                value={editandoEquipo.nombre || ""}
                onChange={(e) =>
                  setEditandoEquipo({ ...editandoEquipo, nombre: e.target.value })
                }
                placeholder="Nombre"
              />

              <select
                className="input"
                value={editandoEquipo.temporada || "Temporada 1"}
                onChange={(e) =>
                  setEditandoEquipo({ ...editandoEquipo, temporada: e.target.value })
                }
              >
                {temporadas.map((temp) => (
                  <option key={temp}>{temp}</option>
                ))}
              </select>

              <select
                className="input"
                value={editandoEquipo.division || "Primera"}
                onChange={(e) =>
                  setEditandoEquipo({ ...editandoEquipo, division: e.target.value })
                }
              >
                {divisiones.map((div) => (
                  <option key={div}>{div}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={guardarEquipo} className="btn">
                Guardar Cambios
              </button>

              <button
                onClick={() => setEditandoEquipo(null)}
                className="bg-zinc-700 hover:bg-zinc-600 px-5 py-3 rounded-2xl font-bold transition-all"
              >
                Cancelar
              </button>
            </div>
          </section>
        )}

        <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
          <h2 className="text-2xl font-black mb-5">Clubes</h2>

          <div className="space-y-3">
            {equipos.map((equipo) => (
              <div
                key={equipo.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#0b0f14] rounded-2xl p-4 border border-white/[0.05] gap-4"
              >
                <div>
                  <p className="font-black">{equipo.nombre}</p>
                  <p className="text-sm text-zinc-500">
                    {equipo.temporada} · {equipo.division}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditandoEquipo(equipo)}
                    className="bg-sky-400 text-black px-4 py-2 rounded-xl font-bold"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => borrar("equipos", equipo.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
          <h2 className="text-2xl font-black mb-5">Partidos</h2>

          <div className="space-y-3">
            {partidos.map((partido) => (
              <div
                key={partido.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#0b0f14] rounded-2xl p-4 border border-white/[0.05] gap-4"
              >
                <div>
                  <p className="font-black">
                    {partido.local} {partido.resultado} {partido.visitante}
                  </p>

                  <p className="text-sm text-zinc-500">
                    Fecha {partido.fecha} · {partido.temporada} · {partido.division}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditandoPartido(partido)}
                    className="bg-sky-400 text-black px-4 py-2 rounded-xl font-bold"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => borrar("partidos", partido.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
          <h2 className="text-2xl font-black mb-5">Jugadores</h2>

          <div className="space-y-3">
            {jugadores.map((jugador) => (
              <div
                key={jugador.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between bg-[#0b0f14] rounded-2xl p-4 border border-white/[0.05] gap-4"
              >
                <div>
                  <p className="font-black">{jugador.nombre}</p>

                  <p className="text-sm text-zinc-500">
                    {jugador.equipo} · Goles: {jugador.goles} · AST:{" "}
                    {jugador.asistencias} · MVP: {jugador.mvps}
                  </p>

                  <p className="text-xs text-zinc-600">
                    {jugador.temporada} · {jugador.division}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditandoJugador(jugador)}
                    className="bg-sky-400 text-black px-4 py-2 rounded-xl font-bold"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => borrar("jugadores", jugador.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      </main>
    </PermissionGuard>
  );
}
