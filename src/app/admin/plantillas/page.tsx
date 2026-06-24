"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";

type Plantilla = {
  id: number;
  jugador: string | null;
  playerid: string | null;
  steam_id: string | null;
  profile_id: string | null;
  equipo: string | null;
  posicion: string | null;
  temporada: string | null;
  division: string | null;
  estado: string | null;
};

type Equipo = {
  nombre: string;
};

type Perfil = {
  id: string;
  display_name: string | null;
  username: string | null;
  playerid: string | null;
  steam_id: string | null;
};

type StatJugador = {
  nombre: string | null;
  playerId: string | null;
  posicion: string | null;
};

const PLANTILLAS_SELECT =
  "id,jugador,playerid,steam_id,profile_id,equipo,posicion,temporada,division,estado";

export default function AdminPlantillasPage() {
  const temporadas = ["Temporada 4"];

  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];
  const posiciones = ["GK", "LB", "CB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST", "N/D"];
  const estados = ["activo", "suplente", "libre", "baja"];

  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [equipo, setEquipo] = useState("");
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  const [jugador, setJugador] = useState("");
  const [playerid, setPlayerid] = useState("");
  const [steamId, setSteamId] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [posicion, setPosicion] = useState("CM");
  const [estado, setEstado] = useState("activo");

  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"activos" | "bajas" | "todos">("activos");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [buscandoJugador, setBuscandoJugador] = useState(false);

  const [transferJugador, setTransferJugador] = useState("");
  const [transferPlayerid, setTransferPlayerid] = useState("");
  const [desde, setDesde] = useState("");
  const [hacia, setHacia] = useState("");
  const [tipo, setTipo] = useState("Fichaje");
  const [fecha, setFecha] = useState("");
  const [transferTemporada, setTransferTemporada] = useState("Temporada 4");
  const [transferDivision, setTransferDivision] = useState("Primera");

  useEffect(() => {
    cargarContexto();
  }, [temporada, division]);

  async function cargarContexto() {
    setMensaje("");

    const [equiposRes, plantillasRes] = await Promise.all([
      supabase
        .from("equipos")
        .select("nombre")
        .eq("temporada", temporada)
        .eq("division", division)
        .order("nombre", { ascending: true }),
      supabase
        .from("plantillas")
        .select(PLANTILLAS_SELECT)
        .eq("temporada", temporada)
        .eq("division", division)
        .order("equipo", { ascending: true })
        .order("jugador", { ascending: true }),
    ]);

    if (equiposRes.error) console.log(equiposRes.error);
    if (plantillasRes.error) {
      console.log(plantillasRes.error);
      setMensaje("No pude cargar las plantillas.");
    }

    const listaEquipos = (equiposRes.data || []) as unknown as Equipo[];
    setEquipos(listaEquipos);

    if (!equipo && listaEquipos.length > 0) {
      setEquipo(listaEquipos[0].nombre);
    }

    setPlantillas((plantillasRes.data || []) as unknown as Plantilla[]);
  }

  async function cargarPlantillas() {
    const { data, error } = await supabase
      .from("plantillas")
      .select(PLANTILLAS_SELECT)
      .eq("temporada", temporada)
      .eq("division", division)
      .order("equipo", { ascending: true })
      .order("jugador", { ascending: true });

    if (error) {
      console.log(error);
      setMensaje("No pude cargar las plantillas.");
      return;
    }

    setPlantillas((data || []) as unknown as Plantilla[]);
  }

  function limpiar(value: string) {
    return value.trim();
  }

  async function buscarPorPsoId() {
    setMensaje("");

    const idLimpio = limpiar(playerid);

    if (!idLimpio) {
      setMensaje("Escribí un PSO ID primero.");
      return;
    }

    setBuscandoJugador(true);

    const { data: perfilData, error: perfilError } = await supabase
      .from("profiles")
      .select("id, display_name, username, playerid, steam_id")
      .ilike("playerid", idLimpio)
      .maybeSingle();

    if (perfilError) console.log(perfilError);

    if (perfilData) {
      const perfil = perfilData as Perfil;

      setJugador(perfil.display_name || perfil.username || jugador);
      setSteamId(perfil.steam_id || "");
      setProfileId(perfil.id);
      setPlayerid(perfil.playerid || idLimpio);
      setMensaje("Jugador encontrado en perfiles APA.");
      setBuscandoJugador(false);
      return;
    }

    const { data: statsData, error: statsError } = await supabase
      .from("estadisticas_jugadores")
      .select("nombre, playerId, posicion")
      .ilike("playerId", idLimpio)
      .order("temporada", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (statsError) console.log(statsError);

    if (statsData) {
      const stat = statsData as StatJugador;

      setJugador(stat.nombre || jugador);
      setPlayerid(stat.playerId || idLimpio);
      setPosicion(stat.posicion || posicion || "N/D");
      setProfileId(null);
      setMensaje("Jugador encontrado en estadísticas APA.");
      setBuscandoJugador(false);
      return;
    }

    setProfileId(null);
    setMensaje("No encontré ese PSO ID. Podés cargarlo manualmente igual.");
    setBuscandoJugador(false);
  }

  async function guardarJugadorPlantilla() {
    setMensaje("");

    const jugadorLimpio = limpiar(jugador);
    const playeridLimpio = limpiar(playerid);
    const equipoLimpio = limpiar(equipo);

    if (!playeridLimpio) {
      setMensaje("El PSO ID es obligatorio.");
      return;
    }

    if (!jugadorLimpio) {
      setMensaje("El nombre del jugador es obligatorio.");
      return;
    }

    if (!equipoLimpio) {
      setMensaje("El equipo es obligatorio.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("plantillas").upsert(
      [
        {
          jugador: jugadorLimpio,
          playerid: playeridLimpio,
          steam_id: steamId.trim() || null,
          profile_id: profileId,
          equipo: equipoLimpio,
          posicion,
          temporada,
          division,
          estado,
        },
      ],
      {
        onConflict: "temporada,division,equipo,playerid",
      },
    );

    setLoading(false);

    if (error) {
      console.log(error);
      setMensaje("Error guardando jugador: " + error.message);
      return;
    }

    setMensaje("Jugador guardado en plantilla.");
    setJugador("");
    setPlayerid("");
    setSteamId("");
    setProfileId(null);
    setPosicion("CM");
    setEstado("activo");
    await cargarPlantillas();
  }

  async function cambiarCampo(
    item: Plantilla,
    campo: "posicion" | "estado" | "equipo",
    valor: string,
  ) {
    setMensaje("");

    const { error } = await supabase
      .from("plantillas")
      .update({ [campo]: valor })
      .eq("id", item.id);

    if (error) {
      console.log(error);
      setMensaje("No pude actualizar el jugador.");
      return;
    }

    await cargarPlantillas();
  }

  async function quitarDePlantilla(item: Plantilla) {
    const confirmar = window.confirm(
      `¿Quitar a ${item.jugador} de la plantilla de ${item.equipo}?`,
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("plantillas")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.log(error);
      setMensaje("No pude quitar el jugador.");
      return;
    }

    setMensaje("Jugador quitado de la plantilla.");
    await cargarPlantillas();
  }

  function prepararTransferencia(item: Plantilla) {
    setTransferJugador(item.jugador || "");
    setTransferPlayerid(item.playerid || "");
    setDesde(item.equipo || "");
    setHacia("");
    setTransferTemporada(item.temporada || temporada);
    setTransferDivision(item.division || division);
    setTipo("Fichaje");
    setFecha("");
    setMensaje("Datos enviados al formulario de transferencia.");
  }

  async function registrarTransferencia() {
    setMensaje("");

    const jugadorLimpio = transferJugador.trim();
    const playeridLimpio = transferPlayerid.trim();
    const desdeLimpio = desde.trim();
    const haciaLimpio = hacia.trim();

    if (!jugadorLimpio) {
      setMensaje("Escribí el jugador de la transferencia.");
      return;
    }

    if (!desdeLimpio) {
      setMensaje("Seleccioná el equipo origen.");
      return;
    }

    if (!haciaLimpio && tipo !== "Salida" && tipo !== "Libre") {
      setMensaje("Seleccioná el equipo destino.");
      return;
    }

    if (desdeLimpio && haciaLimpio && desdeLimpio === haciaLimpio) {
      setMensaje("El equipo origen y destino no pueden ser el mismo.");
      return;
    }

    const { error } = await supabase.from("transferencias").insert([
      {
        jugador: jugadorLimpio,
        desde: desdeLimpio || null,
        hacia: haciaLimpio || null,
        temporada: transferTemporada,
        division: transferDivision,
        tipo,
        fecha: fecha.trim() || null,
      },
    ]);

    if (error) {
      console.log(error);
      setMensaje("Error registrando transferencia: " + error.message);
      return;
    }

    let jugadorOrigen: Plantilla | null = null;

    if (playeridLimpio) {
      const { data: origenData, error: origenError } = await supabase
        .from("plantillas")
        .select(PLANTILLAS_SELECT)
        .eq("temporada", transferTemporada)
        .eq("division", transferDivision)
        .eq("equipo", desdeLimpio)
        .eq("playerid", playeridLimpio)
        .maybeSingle();

      if (origenError) {
        console.log(origenError);
      }

      jugadorOrigen = (origenData || null) as Plantilla | null;

      const { error: bajaError } = await supabase
        .from("plantillas")
        .update({ estado: "baja" })
        .eq("temporada", transferTemporada)
        .eq("division", transferDivision)
        .eq("equipo", desdeLimpio)
        .eq("playerid", playeridLimpio);

      if (bajaError) {
        console.log(bajaError);
        setMensaje("Transferencia registrada, pero no pude marcar la baja en el club origen.");
        await cargarPlantillas();
        return;
      }
    } else {
      const { error: bajaError } = await supabase
        .from("plantillas")
        .update({ estado: "baja" })
        .eq("temporada", transferTemporada)
        .eq("division", transferDivision)
        .eq("equipo", desdeLimpio)
        .eq("jugador", jugadorLimpio);

      if (bajaError) {
        console.log(bajaError);
      }
    }

    if (playeridLimpio && haciaLimpio && tipo !== "Salida" && tipo !== "Libre") {
      const { error: altaError } = await supabase.from("plantillas").upsert(
        [
          {
            jugador: jugadorOrigen?.jugador || jugadorLimpio,
            playerid: playeridLimpio,
            steam_id: jugadorOrigen?.steam_id || null,
            profile_id: jugadorOrigen?.profile_id || null,
            equipo: haciaLimpio,
            posicion: jugadorOrigen?.posicion || "N/D",
            temporada: transferTemporada,
            division: transferDivision,
            estado: "activo",
          },
        ],
        {
          onConflict: "temporada,division,equipo,playerid",
        },
      );

      if (altaError) {
        console.log(altaError);
        setMensaje("Transferencia registrada y baja aplicada, pero no pude crear el alta en destino.");
        await cargarPlantillas();
        return;
      }
    }

    setMensaje("Transferencia inteligente aplicada: origen en baja y destino activo.");
    setTransferJugador("");
    setTransferPlayerid("");
    setDesde("");
    setHacia("");
    setFecha("");
    setTipo("Fichaje");
    await cargarPlantillas();
  }

  const plantillasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    return plantillas.filter((p) => {
      const coincideEquipo = !equipo || p.equipo === equipo;
      const coincideBusqueda =
        !q ||
        String(p.jugador || "").toLowerCase().includes(q) ||
        String(p.playerid || "").toLowerCase().includes(q) ||
        String(p.equipo || "").toLowerCase().includes(q);

      const coincideEstado =
        filtroEstado === "todos"
          ? true
          : filtroEstado === "activos"
            ? p.estado !== "baja"
            : p.estado === "baja";

      return coincideEstado && coincideEquipo && coincideBusqueda;
    });
  }, [plantillas, busqueda, equipo, filtroEstado]);

  return (
    <PermissionGuard permission="transfers.manage">
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
        <div className="mx-auto max-w-[1500px] space-y-8 px-4 py-10 md:px-8">
          <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.22)] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/30" />

            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
                Admin APA PSO
              </p>

              <h1 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-6xl">
                Plantillas y Mercado
              </h1>

              <p className="mt-5 max-w-3xl text-zinc-300">
                Administrá jugadores por club usando siempre PSO ID. El TXT puede crear plantillas automáticamente y esta página permite corregir o cargar manualmente.
              </p>
            </div>
          </section>

          <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
              Contexto
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <select className="input" value={temporada} onChange={(e) => setTemporada(e.target.value)}>
                {temporadas.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <select className="input" value={division} onChange={(e) => setDivision(e.target.value)}>
                {divisiones.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <select className="input" value={equipo} onChange={(e) => setEquipo(e.target.value)}>
                <option value="">Todos los equipos</option>
                {equipos.map((e) => (
                  <option key={e.nombre} value={e.nombre}>
                    {e.nombre}
                  </option>
                ))}
              </select>

              <input
                className="input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar jugador, PSO ID o equipo"
              />
            </div>
          </section>

          {mensaje && (
            <section className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-center font-black text-yellow-300">
              {mensaje}
            </section>
          )}

          <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_460px]">
            <section className="rounded-[34px] border border-white/10 bg-[#020714] p-6 md:p-8">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                    Plantel
                  </p>
                  <h2 className="mt-2 text-4xl font-black uppercase">
                    {equipo || "Todos los equipos"}
                  </h2>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-black uppercase text-zinc-500">
                    {plantillasFiltradas.length} jugadores
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFiltroEstado("activos")}
                      className={`rounded-xl px-4 py-2 text-xs font-black uppercase transition ${
                        filtroEstado === "activos"
                          ? "bg-green-400 text-black"
                          : "border border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                      }`}
                    >
                      Activos
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltroEstado("bajas")}
                      className={`rounded-xl px-4 py-2 text-xs font-black uppercase transition ${
                        filtroEstado === "bajas"
                          ? "bg-red-400 text-black"
                          : "border border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                      }`}
                    >
                      Bajas
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltroEstado("todos")}
                      className={`rounded-xl px-4 py-2 text-xs font-black uppercase transition ${
                        filtroEstado === "todos"
                          ? "bg-sky-400 text-black"
                          : "border border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                      }`}
                    >
                      Todos
                    </button>
                  </div>
                </div>
              </div>

              {plantillasFiltradas.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-6 text-zinc-500">
                  No hay jugadores cargados para este filtro.
                </p>
              ) : (
                <div className="space-y-3">
                  {plantillasFiltradas.map((p) => (
                    <article
                      key={p.id}
                      className="rounded-2xl border border-white/10 bg-black/35 p-4"
                    >
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px] xl:items-center">
                        <div>
                          <h3 className="text-2xl font-black uppercase text-white">
                            {p.jugador}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs font-black uppercase">
                            <span className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-sky-300">
                              {p.playerid || "Sin PSO ID"}
                            </span>

                            <span className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-yellow-300">
                              {p.equipo || "Sin equipo"}
                            </span>

                            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-zinc-400">
                              {p.temporada} · {p.division}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-2">
                          <select
                            className="input"
                            value={p.posicion || "N/D"}
                            onChange={(e) => cambiarCampo(p, "posicion", e.target.value)}
                          >
                            {posiciones.map((pos) => (
                              <option key={pos}>{pos}</option>
                            ))}
                          </select>

                          <select
                            className="input"
                            value={p.estado || "activo"}
                            onChange={(e) => cambiarCampo(p, "estado", e.target.value)}
                          >
                            {estados.map((est) => (
                              <option key={est}>{est}</option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => prepararTransferencia(p)}
                            className="w-full rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-xs font-black uppercase text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                          >
                            Transferir
                          </button>

                          <button
                            type="button"
                            onClick={() => quitarDePlantilla(p)}
                            className="w-full rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-xs font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-8">
              <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                  Agregar jugador
                </p>

                <h2 className="mt-2 text-3xl font-black uppercase">
                  Manual por PSO ID
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <input
                      className="input"
                      value={playerid}
                      onChange={(e) => setPlayerid(e.target.value)}
                      placeholder="PSO ID obligatorio"
                    />

                    <button
                      type="button"
                      onClick={buscarPorPsoId}
                      disabled={buscandoJugador}
                      className="rounded-2xl border border-sky-400/25 bg-sky-400/10 px-4 py-3 text-xs font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black disabled:opacity-50"
                    >
                      {buscandoJugador ? "..." : "Buscar"}
                    </button>
                  </div>

                  <input
                    className="input"
                    value={jugador}
                    onChange={(e) => setJugador(e.target.value)}
                    placeholder="Nombre del jugador"
                  />

                  <input
                    className="input"
                    value={steamId}
                    onChange={(e) => setSteamId(e.target.value)}
                    placeholder="Steam ID opcional"
                  />

                  <select className="input" value={equipo} onChange={(e) => setEquipo(e.target.value)}>
                    <option value="">Equipo</option>
                    {equipos.map((e) => (
                      <option key={e.nombre} value={e.nombre}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>

                  <select className="input" value={posicion} onChange={(e) => setPosicion(e.target.value)}>
                    {posiciones.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>

                  <select className="input" value={estado} onChange={(e) => setEstado(e.target.value)}>
                    {estados.map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={guardarJugadorPlantilla}
                    disabled={loading}
                    className="btn disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Guardando..." : "Guardar en plantilla"}
                  </button>
                </div>
              </section>

              <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                  Mercado
                </p>

                <h2 className="mt-2 text-3xl font-black uppercase">
                  Registrar transferencia
                </h2>

                <div className="mt-6 space-y-4">
                  <input
                    className="input"
                    placeholder="Jugador"
                    value={transferJugador}
                    onChange={(e) => setTransferJugador(e.target.value)}
                  />

                  <input
                    className="input"
                    placeholder="PSO ID"
                    value={transferPlayerid}
                    onChange={(e) => setTransferPlayerid(e.target.value)}
                  />

                  <select
                    className="input"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                  >
                    <option value="">Equipo origen</option>
                    {equipos.map((e) => (
                      <option key={`desde-${e.nombre}`} value={e.nombre}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>

                  <select
                    className="input"
                    value={hacia}
                    onChange={(e) => setHacia(e.target.value)}
                  >
                    <option value="">Equipo destino</option>
                    {equipos.map((e) => (
                      <option key={`hacia-${e.nombre}`} value={e.nombre}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>

                  <input
                    className="input"
                    placeholder="Fecha / Jornada"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />

                  <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                    {["Fichaje", "Salida", "Libre", "Préstamo"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>

                  <select className="input" value={transferTemporada} onChange={(e) => setTransferTemporada(e.target.value)}>
                    {temporadas.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>

                  <select className="input" value={transferDivision} onChange={(e) => setTransferDivision(e.target.value)}>
                    {divisiones.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>

                  <button type="button" onClick={registrarTransferencia} className="btn">
                    Guardar transferencia
                  </button>
                </div>
              </section>
            </aside>
          </section>
        </div>
      </main>
    </PermissionGuard>
  );
}
