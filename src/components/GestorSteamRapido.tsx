"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GestorSteamRapido() {
  const [datosAgrupados, setDatosAgrupados] = useState<Record<string, Record<string, any[]>>>({});
  const [steamInputs, setSteamInputs] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState("");
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarJugadoresAgrupados();
  }, []);

  async function cargarJugadoresAgrupados() {
    const { data, error } = await supabase
      .from("estadisticas_jugadores")
      .select("playerId, nombre, equipo, division")
      .limit(1000);

    if (error) {
      console.log(error);
      setMensaje("No pude cargar los jugadores.");
      return;
    }

    const unicosMap: Record<string, boolean> = {};
    const agrupado: Record<string, Record<string, any[]>> = {};

    (data || []).forEach((j: any) => {
      const pid = j.playerId || j.playerid;
      if (!pid || unicosMap[pid]) return;
      unicosMap[pid] = true;

      const division = j.division ? j.division.trim() : "Sin División";
      const equipo = j.equipo ? j.equipo.trim() : "Sin Equipo";

      if (!agrupado[division]) agrupado[division] = {};
      if (!agrupado[division][equipo]) agrupado[division][equipo] = [];

      agrupado[division][equipo].push({
        playerid: pid,
        nombre: j.nombre || "Sin nombre",
      });
    });

    const { data: perfiles } = await supabase
      .from("profiles")
      .select("playerid, steam_id");

    const inputsMap: Record<string, string> = {};
    (perfiles || []).forEach((p: any) => {
      if (p.playerid && p.steam_id) {
        inputsMap[p.playerid] = p.steam_id;
      }
    });

    setSteamInputs(inputsMap);
    setDatosAgrupados(agrupado);
  }

  async function guardarSteamJugador(playerid: string) {
    setGuardandoId(playerid);
    setMensaje("");

    const steamIdValue = steamInputs[playerid] || "";

    const { error } = await supabase
      .from("profiles")
      .update({ steam_id: steamIdValue.trim() })
      .eq("playerid", playerid);

    setGuardandoId(null);

    if (error) {
      setMensaje(`Error al guardar: ${error.message}`);
    } else {
      setMensaje("SteamID guardado.");
    }
  }

  const datosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return datosAgrupados;

    const filtrado: Record<string, Record<string, any[]>> = {};

    Object.entries(datosAgrupados).forEach(([division, equipos]) => {
      Object.entries(equipos).forEach(([equipo, jugadores]) => {
        const visibles = jugadores.filter((j) =>
          [j.nombre, j.playerid, equipo, division]
            .some((valor) => String(valor || "").toLowerCase().includes(q)),
        );

        if (visibles.length === 0) return;
        if (!filtrado[division]) filtrado[division] = {};
        filtrado[division][equipo] = visibles;
      });
    });

    return filtrado;
  }, [busqueda, datosAgrupados]);

  const totalJugadores = useMemo(
    () =>
      Object.values(datosAgrupados).reduce(
        (total, equipos) =>
          total + Object.values(equipos).reduce((subtotal, jugadores) => subtotal + jugadores.length, 0),
        0,
      ),
    [datosAgrupados],
  );

  return (
    <section className="overflow-hidden rounded-[26px] border border-[#d8e2ec] bg-white shadow-[0_14px_38px_rgba(11,39,71,0.08)]">
      <div className="border-b border-[#d8e2ec] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#245f8e]">
              Identidades Steam
            </p>
            <h2 className="mt-1 text-xl font-black uppercase text-[#0b2747] md:text-2xl">
              Vincular SteamID
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-[#5f7185]">
              Buscá un jugador y guardá su SteamID sin recorrer todo el listado.
            </p>
          </div>

          <div className="rounded-xl bg-[#f3f4f6] px-3 py-2 text-xs font-black text-[#173f73]">
            {totalJugadores} jugadores
          </div>
        </div>

        <div className="mt-4">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar jugador, club o PlayerID..."
            className="w-full rounded-xl border border-[#cbd9e3] bg-white px-4 py-3 text-sm font-semibold text-[#0b2747] outline-none placeholder:text-[#7b8da0] focus:border-[#245f8e]"
          />
        </div>
      </div>

      {mensaje && (
        <div className="border-b border-[#d8e2ec] bg-[#f5f6f8] px-5 py-3 text-xs font-bold text-[#173f73] md:px-6">
          {mensaje}
        </div>
      )}

      <div className="max-h-[520px] space-y-5 overflow-y-auto bg-[#f5f6f8] p-4 md:p-5">
        {Object.keys(datosAgrupados).length === 0 ? (
          <div className="rounded-2xl border border-[#d8e2ec] bg-white p-5 text-sm font-semibold text-[#5f7185]">
            Cargando jugadores...
          </div>
        ) : Object.keys(datosFiltrados).length === 0 ? (
          <div className="rounded-2xl border border-[#d8e2ec] bg-white p-5 text-sm font-semibold text-[#5f7185]">
            No encontré jugadores con esa búsqueda.
          </div>
        ) : (
          Object.entries(datosFiltrados).map(([division, equipos]) => (
            <div key={division} className="space-y-3">
              <div className="sticky top-0 z-10 rounded-xl border border-[#cbd9e3] bg-white px-3 py-2 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#173f73]">
                  {division}
                </p>
              </div>

              {Object.entries(equipos).map(([equipo, jugadores]) => (
                <div key={equipo} className="overflow-hidden rounded-2xl border border-[#d8e2ec] bg-white">
                  <div className="border-b border-[#e2e8ef] bg-[#f3f4f6] px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[#123f69]">
                      {equipo}
                    </p>
                  </div>

                  <div className="divide-y divide-[#e7edf2]">
                    {jugadores.map((j) => (
                      <div key={j.playerid} className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,1.4fr)_auto] md:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#0b2747]">{j.nombre}</p>
                          <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-[#6f8193]">
                            ID: {j.playerid}
                          </p>
                        </div>

                        <input
                          type="text"
                          placeholder="SteamID64..."
                          value={steamInputs[j.playerid] || ""}
                          onChange={(e) =>
                            setSteamInputs((prev) => ({ ...prev, [j.playerid]: e.target.value }))
                          }
                          className="w-full rounded-xl border border-[#cbd9e3] bg-white px-3 py-2.5 text-xs font-semibold text-[#0b2747] outline-none placeholder:text-[#8797a7] focus:border-[#245f8e]"
                        />

                        <button
                          type="button"
                          onClick={() => guardarSteamJugador(j.playerid)}
                          disabled={guardandoId === j.playerid}
                          className="rounded-xl bg-[#173f73] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.04em] text-white transition hover:bg-[#245f8e] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {guardandoId === j.playerid ? "Guardando..." : "Guardar"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
