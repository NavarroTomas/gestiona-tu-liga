"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/AdminGuard";

export default function AdminPlantillasPage() {
  const temporadas = ["Temporada 1", "Temporada 2", "Temporada 3", "Temporada 4"];
  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];
  const posiciones = ["GK", "LB", "CB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"];
  const estados = ["Activo", "Suplente", "Libre", "Baja"];
  const tipos = ["Fichaje", "Salida", "Libre", "Préstamo"];

  const [jugador, setJugador] = useState("");
  const [equipo, setEquipo] = useState("");
  const [posicion, setPosicion] = useState("CM");
  const [temporada, setTemporada] = useState("Temporada 1");
  const [division, setDivision] = useState("Primera");
  const [estado, setEstado] = useState("Activo");

  const [transferJugador, setTransferJugador] = useState("");
  const [desde, setDesde] = useState("");
  const [hacia, setHacia] = useState("");
  const [tipo, setTipo] = useState("Fichaje");
  const [fecha, setFecha] = useState("");
  const [transferTemporada, setTransferTemporada] = useState("Temporada 1");
  const [transferDivision, setTransferDivision] = useState("Primera");

  async function agregarJugadorPlantilla() {
    const { error } = await supabase.from("plantillas").insert([
      {
        jugador,
        equipo,
        posicion,
        temporada,
        division,
        estado,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Error cargando jugador");
      return;
    }

    alert("Jugador agregado a plantilla");
    setJugador("");
    setEquipo("");
    setPosicion("CM");
    setEstado("Activo");
  }

  async function registrarTransferencia() {
    const { error } = await supabase.from("transferencias").insert([
      {
        jugador: transferJugador,
        desde,
        hacia,
        temporada: transferTemporada,
        division: transferDivision,
        tipo,
        fecha,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Error registrando transferencia");
      return;
    }

    alert("Transferencia registrada");
    setTransferJugador("");
    setDesde("");
    setHacia("");
    setFecha("");
    setTipo("Fichaje");
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-10 space-y-10">
        <div>
          <p className="text-sky-400 text-xs uppercase tracking-[4px] font-bold">
            ADMIN APA PSO
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">
            Plantillas y Mercado
          </h1>

          <p className="mt-4 text-zinc-400">
            Cargá jugadores a plantillas y registrá movimientos del mercado.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-5">
              Agregar jugador a plantilla
            </h2>

            <div className="space-y-4">
              <input className="input" placeholder="Jugador" value={jugador} onChange={(e) => setJugador(e.target.value)} />
              <input className="input" placeholder="Equipo" value={equipo} onChange={(e) => setEquipo(e.target.value)} />

              <select className="input" value={posicion} onChange={(e) => setPosicion(e.target.value)}>
                {posiciones.map((p) => <option key={p}>{p}</option>)}
              </select>

              <select className="input" value={temporada} onChange={(e) => setTemporada(e.target.value)}>
                {temporadas.map((t) => <option key={t}>{t}</option>)}
              </select>

              <select className="input" value={division} onChange={(e) => setDivision(e.target.value)}>
                {divisiones.map((d) => <option key={d}>{d}</option>)}
              </select>

              <select className="input" value={estado} onChange={(e) => setEstado(e.target.value)}>
                {estados.map((e) => <option key={e}>{e}</option>)}
              </select>

              <button onClick={agregarJugadorPlantilla} className="btn">
                Guardar en plantilla
              </button>
            </div>
          </section>

          <section className="bg-[#11151c] border border-white/[0.06] rounded-3xl p-6">
            <h2 className="text-2xl font-black mb-5">
              Registrar transferencia
            </h2>

            <div className="space-y-4">
              <input className="input" placeholder="Jugador" value={transferJugador} onChange={(e) => setTransferJugador(e.target.value)} />
              <input className="input" placeholder="Desde" value={desde} onChange={(e) => setDesde(e.target.value)} />
              <input className="input" placeholder="Hacia" value={hacia} onChange={(e) => setHacia(e.target.value)} />
              <input className="input" placeholder="Fecha / Jornada" value={fecha} onChange={(e) => setFecha(e.target.value)} />

              <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {tipos.map((t) => <option key={t}>{t}</option>)}
              </select>

              <select className="input" value={transferTemporada} onChange={(e) => setTransferTemporada(e.target.value)}>
                {temporadas.map((t) => <option key={t}>{t}</option>)}
              </select>

              <select className="input" value={transferDivision} onChange={(e) => setTransferDivision(e.target.value)}>
                {divisiones.map((d) => <option key={d}>{d}</option>)}
              </select>

              <button onClick={registrarTransferencia} className="btn">
                Guardar transferencia
              </button>
            </div>
          </section>
        </div>
      </div>
      </main>
    </AdminGuard>
  );
}
