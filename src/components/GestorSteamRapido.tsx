"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GestorSteamRapido() {
  const [datosAgrupados, setDatosAgrupados] = useState<Record<string, Record<string, any[]>>>({});
  const [steamInputs, setSteamInputs] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState("");
  const [guardandoId, setGuardandoId] = useState<string | null>(null);

  useEffect(() => {
    cargarJugadoresAgrupados();
  }, []);

  async function cargarJugadoresAgrupados() {
    // Traemos las estadísticas incluyendo la división y el equipo del partido
    const { data, error } = await supabase
      .from("estadisticas_jugadores")
      .select("playerId, nombre, equipo, division")
      .limit(1000);

    if (error) {
      console.log(error);
      return;
    }

    const unicosMap: Record<string, boolean> = {};
    const agrupado: Record<string, Record<string, any[]>> = {};

    (data || []).forEach((j: any) => {
      const pid = j.playerId || j.playerid;
      if (!pid || unicosMap[pid]) return; // Evitar duplicados de jugadores
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

    // Traemos los steam_id guardados en profiles
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
      setMensaje(`¡SteamID guardado con éxito!`);
    }
  }

  return (
    <div className="rounded-[28px] border border-yellow-500/20 bg-[#020714] p-4 md:p-6 space-y-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-300">
          Panel ordenado
        </p>
        <h2 className="mt-2 text-xl md:text-2xl font-black uppercase">
          Vincular SteamID por Equipo
        </h2>
        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
          Los jugadores están ordenados por división y club para encontrarlos más rápido.
        </p>
      </div>

      {mensaje && (
        <p className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-3 text-xs font-black text-yellow-300">
          {mensaje}
        </p>
      )}

      <div className="max-h-[500px] overflow-y-auto space-y-5 pr-1">
        {Object.keys(datosAgrupados).length === 0 ? (
          <p className="text-xs text-zinc-500">Cargando equipos y jugadores...</p>
        ) : (
          Object.entries(datosAgrupados).map(([division, equipos]) => (
            <div key={division} className="space-y-3">
              {/* Cabecera de División */}
              <div className="sticky top-0 z-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 px-3 py-1.5 backdrop-blur-md">
                <p className="text-xs font-black uppercase tracking-wider text-yellow-300">
                  📁 {division}
                </p>
              </div>

              {Object.entries(equipos).map(([equipo, jugadores]) => (
                <div key={equipo} className="ml-2 space-y-2 rounded-2xl border border-white/10 bg-black/30 p-3">
                  {/* Cabecera de Equipo */}
                  <p className="text-xs font-bold uppercase tracking-wide text-sky-300 border-b border-white/5 pb-1">
                    🛡️ {equipo}
                  </p>

                  <div className="space-y-2 pt-1">
                    {jugadores.map((j) => (
                      <div 
                        key={j.playerid}
                        className="flex flex-col gap-2 rounded-xl border border-white/5 bg-black/50 p-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate">{j.nombre}</p>
                          <p className="text-[9px] text-zinc-500 uppercase">ID: {j.playerid}</p>
                        </div>

                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="text"
                            placeholder="SteamID64..."
                            value={steamInputs[j.playerid] || ""}
                            onChange={(e) =>
                              setSteamInputs({ ...steamInputs, [j.playerid]: e.target.value })
                            }
                            className="w-full min-w-0 rounded-xl border border-white/20 bg-black px-3 py-1.5 text-xs text-white outline-none focus:border-yellow-400"
                          />

                          <button
                            type="button"
                            onClick={() => guardarSteamJugador(j.playerid)}
                            disabled={guardandoId === j.playerid}
                            className="rounded-xl bg-yellow-400 px-3 py-1.5 text-[10px] font-black uppercase text-black transition hover:bg-white disabled:opacity-50 shrink-0"
                          >
                            {guardandoId === j.playerid ? "..." : "Guardar"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}