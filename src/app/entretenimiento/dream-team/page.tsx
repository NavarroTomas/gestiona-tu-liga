"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Jugador = {
  nombre: string;
  playerId: string;
  equipo: string;
  posicion: string;
  partidos: number;
  goles: number;
  asistencias: number;
  rating: number;
  atajadas: number;
};

type PerfilDreamTeam = {
  id: string;
  display_name: string | null;
  username: string | null;
};

const posiciones = [
  { id: "LST", tipo: "delantero" },
  { id: "RST", tipo: "delantero" },
  { id: "LCM", tipo: "medio" },
  { id: "RCM", tipo: "medio" },
  { id: "LB", tipo: "defensa" },
  { id: "CB", tipo: "defensa" },
  { id: "RB", tipo: "defensa" },
  { id: "GK", tipo: "arquero" },
];

function valorGKSave(r: any) {
  return Number(r.gKSaves || r.gKSAVES || r.GKSaves || r.gksaves || 0);
}

function tipoJugador(j: Jugador) {
  const pos = (j.posicion || "").toUpperCase();

  if (j.atajadas > 0 || pos.includes("GK") || pos.includes("POR")) return "arquero";

  if (
    pos.includes("CB") ||
    pos.includes("LB") ||
    pos.includes("RB") ||
    pos.includes("DEF") ||
    pos.includes("DFC") ||
    pos.includes("LI") ||
    pos.includes("LD")
  ) {
    return "defensa";
  }

  if (
    pos.includes("CM") ||
    pos.includes("CAM") ||
    pos.includes("CDM") ||
    pos.includes("MC") ||
    pos.includes("MCD") ||
    pos.includes("MCO") ||
    pos.includes("MED")
  ) {
    return "medio";
  }

  if (
    pos.includes("ST") ||
    pos.includes("CF") ||
    pos.includes("LW") ||
    pos.includes("RW") ||
    pos.includes("DC") ||
    pos.includes("DEL") ||
    pos.includes("EXT")
  ) {
    return "delantero";
  }

  if (j.goles > 0 || j.asistencias > 0) return "delantero";

  return "medio";
}

function fechaActualISO() {
  return new Date().toISOString().slice(0, 10);
}


export default function DreamTeamPage() {
  const temporadas = ["Temporada 1", "Temporada 2", "Temporada 3", "Temporada 4", "Temporada 5"];
  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];
  const fechas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  const [temporada, setTemporada] = useState("Temporada 1");
  const [division, setDivision] = useState("Primera");
  const [fecha, setFecha] = useState("1");
  const [usuarioId, setUsuarioId] = useState("");
  const [miPerfil, setMiPerfil] = useState<PerfilDreamTeam | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [votos, setVotos] = useState<any[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [posicionActiva, setPosicionActiva] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarUsuario();
  }, []);

  async function cargarUsuario() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUsuarioId("");
      setMiPerfil(null);
      return;
    }

    setUsuarioId(user.id);

    const { data: perfilData, error } = await supabase
      .from("profiles")
      .select("id, display_name, username")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      setMiPerfil(null);
      return;
    }

    setMiPerfil((perfilData || null) as PerfilDreamTeam | null);
  }

  useEffect(() => {
    cargarDatos();
  }, [temporada, division, fecha]);

  async function cargarDatos() {
    setMensaje("");

    const { data: stats, error: statsError } = await supabase
      .from("estadisticas_jugadores")
      .select("*")
      .eq("temporada", temporada)
      .eq("division", division)
      .eq("fecha", fecha);

    if (statsError) {
      console.log(statsError);
      return;
    }

    const mapa: Record<string, any> = {};

    stats?.forEach((r: any) => {
      const nombre = (r.nombre || "").trim();
      const playerId = (r.playerId || "").trim();
      if (!nombre) return;

      const clave = playerId || nombre;

      if (!mapa[clave]) {
        mapa[clave] = {
          nombre,
          playerId,
          equipo: r.equipo || "Sin Club",
          posicion: r.posicion || "",
          partidos: 0,
          goles: 0,
          asistencias: 0,
          ratingTotal: 0,
          rating: 0,
          atajadas: 0,
        };
      }

      mapa[clave].partidos += 1;
      mapa[clave].goles += Number(r.goals || 0);
      mapa[clave].asistencias += Number(r.assists || 0);
      mapa[clave].ratingTotal += Number(r.overallRating || 0);
      mapa[clave].atajadas += valorGKSave(r);

      if (r.equipo) mapa[clave].equipo = r.equipo;
      if (r.posicion) mapa[clave].posicion = r.posicion;
      if (r.playerId) mapa[clave].playerId = r.playerId;
      if (r.nombre) mapa[clave].nombre = r.nombre;
    });

    setJugadores(
      Object.values(mapa).map((j: any) => ({
        ...j,
        rating: j.partidos > 0 ? Math.round((j.ratingTotal / j.partidos) * 10) / 10 : 0,
      })),
    );

    const { data: votosData, error: votosError } = await supabase
      .from("dream_team_votos")
      .select("*")
      .eq("temporada", temporada)
      .eq("division", division)
      .eq("fecha", fecha);

    if (votosError) {
      console.log(votosError);
      return;
    }

    setVotos(votosData || []);

    const { data: equiposData } = await supabase
      .from("equipos")
      .select("nombre, logo_url")
      .eq("temporada", temporada)
      .eq("division", division);

    const mapLogos: Record<string, string> = {};
    equiposData?.forEach((e: any) => {
      if (e.nombre && e.logo_url) mapLogos[e.nombre] = e.logo_url;
    });
    setLogos(mapLogos);
  }

  const votosPorPosicion = useMemo(() => {
    const resultado: Record<string, any> = {};

    posiciones.forEach((p) => {
      const votosPos = votos.filter((v) => v.posicion === p.id);
      const conteo: Record<string, any> = {};

      votosPos.forEach((v) => {
        const clave = v.playerId || v.nombre;

        if (!conteo[clave]) {
          conteo[clave] = {
            posicion: p.id,
            playerId: v.playerId,
            nombre: v.nombre,
            equipo: v.equipo,
            votos: 0,
          };
        }

        conteo[clave].votos += 1;
      });

      const ganador = Object.values(conteo).sort((a: any, b: any) => b.votos - a.votos)[0];
      if (ganador) resultado[p.id] = ganador;
    });

    return resultado;
  }, [votos]);

  const miDreamTeam = useMemo(() => {
    const map: Record<string, any> = {};

    if (!usuarioId) return map;

    votos
      .filter((v) => v.usuario === usuarioId)
      .forEach((v) => {
        map[v.posicion] = v;
      });

    return map;
  }, [votos, usuarioId]);

  const jugadorMasVotado = useMemo(() => {
    const conteo: Record<string, any> = {};

    votos.forEach((v) => {
      const clave = v.playerId || v.nombre;
      if (!conteo[clave]) {
        conteo[clave] = {
          nombre: v.nombre,
          equipo: v.equipo,
          playerId: v.playerId,
          votos: 0,
        };
      }
      conteo[clave].votos += 1;
    });

    return Object.values(conteo).sort((a: any, b: any) => b.votos - a.votos)[0] as any;
  }, [votos]);

  function topPorPosicion(posicion: string) {
    const conteo: Record<string, any> = {};

    votos
      .filter((v) => v.posicion === posicion)
      .forEach((v) => {
        const clave = v.playerId || v.nombre;
        if (!conteo[clave]) {
          conteo[clave] = {
            nombre: v.nombre,
            equipo: v.equipo,
            playerId: v.playerId,
            votos: 0,
          };
        }
        conteo[clave].votos += 1;
      });

    return Object.values(conteo).sort((a: any, b: any) => b.votos - a.votos).slice(0, 3);
  }

  function candidatos(posicion: string) {
    const tipo = posiciones.find((p) => p.id === posicion)?.tipo;

    return jugadores
      .filter((j) => tipoJugador(j) === tipo)
      .sort((a, b) => {
        if (tipo === "arquero") return b.atajadas - a.atajadas;
        if (tipo === "delantero") return b.goles - a.goles || b.asistencias - a.asistencias;
        if (tipo === "medio") return b.asistencias - a.asistencias || b.rating - a.rating;
        return b.rating - a.rating || b.partidos - a.partidos;
      })
      .slice(0, 40);
  }

  async function votar(jugador: Jugador) {
    setMensaje("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMensaje("Tenés que iniciar sesión para votar el Dream Team.");
      return;
    }

    setUsuarioId(user.id);

    if (!posicionActiva) return;

    const votosMismaFecha = votos.filter(
      (v) =>
        v.temporada === temporada &&
        v.division === division &&
        String(v.fecha) === String(fecha) &&
        v.usuario === user.id,
    );

    const yaVotoEstaPosicion = votosMismaFecha.some((v) => v.posicion === posicionActiva);

    if (yaVotoEstaPosicion) {
      setMensaje(
        `Ya votaste la posición ${posicionActiva} en tu Dream Team de la Fecha ${fecha}.`,
      );
      return;
    }

    const yaCompletoDreamTeam = votosMismaFecha.length >= posiciones.length;

    if (yaCompletoDreamTeam) {
      setMensaje(`Ya completaste tu Dream Team de la Fecha ${fecha}.`);
      return;
    }

    const yaVotoEseJugador = votosMismaFecha.some(
      (v) => (v.playerId || v.nombre) === (jugador.playerId || jugador.nombre),
    );

    if (yaVotoEseJugador) {
      setMensaje(
        `${jugador.nombre} ya está en otra posición de tu Dream Team de la Fecha ${fecha}. Elegí otro jugador.`,
      );
      return;
    }

    const { error } = await supabase.from("dream_team_votos").insert([
      {
        temporada,
        division,
        fecha,
        posicion: posicionActiva,
        playerId: jugador.playerId,
        nombre: jugador.nombre,
        equipo: jugador.equipo,
        usuario: user.id,
        votar_key: null,
        fecha_voto: fechaActualISO(),
      },
    ]);

    if (error) {
      console.log(error);

      if (error.code === "23505") {
        setMensaje("Ya registraste ese voto para esta fecha.");
        return;
      }

      setMensaje("Error guardando voto.");
      return;
    }

    setMensaje(`Voto guardado para ${posicionActiva}: ${jugador.nombre}`);
    setPosicionActiva(null);
    await cargarDatos();
  }

  async function compartir() {
    const texto = posiciones
      .map((p) => `${p.id}: ${miDreamTeam[p.id]?.nombre || "-"}`)
      .join("\n");

    const mensaje = `⭐ Mi Dream Team Fecha ${fecha}\n${temporada} / ${division}\n\n${texto}`;

    await navigator.clipboard.writeText(mensaje);
    setMensaje("Dream Team copiado al portapapeles.");
  }

  function LogoEquipo({ equipo }: { equipo?: string }) {
    const logo = equipo ? logos[equipo] : "";

    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/30 bg-black">
        {logo ? (
          <img src={logo} alt={equipo} className="h-full w-full object-contain p-1" />
        ) : (
          <span className="text-[10px] font-black text-white">
            {(equipo || "?").slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
    );
  }

  function Slot({ id }: { id: string }) {
    const elegido = votosPorPosicion[id];

    return (
      <button
        type="button"
        onClick={() => setPosicionActiva(id)}
        className="group relative min-h-[106px] rounded-3xl border border-sky-400/30 bg-black/55 p-3 text-center shadow-[0_0_24px_rgba(56,189,248,.10)] transition hover:scale-[1.04] hover:border-yellow-300/70 hover:shadow-[0_0_30px_rgba(250,204,21,.20)]"
      >
        <div className="mx-auto mb-2 flex justify-center">
          <LogoEquipo equipo={elegido?.equipo} />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-yellow-300">
          {id}
        </p>

        <h3 className="mt-1 truncate text-base font-black uppercase text-white">
          {elegido?.nombre || "Elegir"}
        </h3>

        <p className="mt-1 truncate text-xs text-zinc-500">
          {elegido?.equipo || "Sin jugador"}
        </p>

        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300">
          {elegido?.votos || 0} votos
        </p>
      </button>
    );
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10">
            <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
              APA PSO ARGENTINA
            </p>

            <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic leading-none">
              <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                Dream Team
              </span>
              <span className="block text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,.55)]">
                Fecha {fecha}
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Votá el Dream Team de la fecha con formación oficial:
              GK, LB, CB, RB, LCM, RCM, LST y RST.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">Cuenta</p>
                <p className="mt-1 truncate font-black text-sky-300">
                  {usuarioId
                    ? miPerfil?.display_name || miPerfil?.username || "Usuario APA"
                    : "Iniciá sesión"}
                </p>
              </div>

              <div className="rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">Temporada</p>
                <p className="mt-1 font-black text-sky-300">{temporada}</p>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">División</p>
                <p className="mt-1 font-black text-yellow-300">{division}</p>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-black/35 px-5 py-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">Fecha</p>
                <p className="mt-1 font-black text-green-400">Fecha {fecha}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]">
          <div className="grid gap-7">
            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">Temporada</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {temporadas.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setTemporada(temp)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      temporada === temp
                        ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">División</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {divisiones.map((div) => (
                  <button
                    key={div}
                    onClick={() => setDivision(div)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      division === div
                        ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">Fecha</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {fechas.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFecha(f)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      fecha === f
                        ? "border-green-300 bg-gradient-to-r from-green-400 to-emerald-600 text-black shadow-[0_0_20px_rgba(74,222,128,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    Fecha {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {mensaje && (
          <section className="rounded-3xl border border-sky-500/20 bg-black/35 p-5 text-center font-black text-sky-300">
            {mensaje}
          </section>
        )}

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">
          <div className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[#071b22] p-6 md:p-10 shadow-[0_0_55px_rgba(34,197,94,.12)]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,.18),transparent_60%)]" />

            <div className="relative z-10 min-h-[820px] rounded-[34px] border border-green-300/20 bg-gradient-to-b from-green-700/20 via-green-950/30 to-green-900/20 p-6 md:p-10">
              <div className="absolute left-[12%] right-[12%] top-6 h-24 rounded-b-full border-x border-b border-white/15" />
              <div className="absolute left-[12%] right-[12%] bottom-6 h-24 rounded-t-full border-x border-t border-white/15" />
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />

              <div className="relative z-10 flex h-full min-h-[740px] flex-col justify-between">
                <div className="grid grid-cols-2 gap-8 max-w-[520px] mx-auto w-full">
                  <Slot id="LST" />
                  <Slot id="RST" />
                </div>

                <div className="grid grid-cols-2 gap-8 max-w-[430px] mx-auto w-full">
                  <Slot id="LCM" />
                  <Slot id="RCM" />
                </div>

                <div className="grid grid-cols-3 gap-6 max-w-[620px] mx-auto w-full">
                  <Slot id="LB" />
                  <Slot id="CB" />
                  <Slot id="RB" />
                </div>

                <div className="flex w-full justify-center">
                  <div className="w-[180px]">
                    <Slot id="GK" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6">
              <p className="text-yellow-300 uppercase tracking-[0.3em] text-xs font-black">MVP de la fecha</p>
              <h2 className="mt-3 text-3xl font-black uppercase">{jugadorMasVotado?.nombre || "-"}</h2>
              <p className="mt-2 text-zinc-500">{jugadorMasVotado?.equipo || "Sin votos todavía"}</p>
              <p className="mt-5 text-5xl font-black text-yellow-300">{jugadorMasVotado?.votos || 0}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-black">votos totales</p>
            </section>

            <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black">Mi equipo</p>
                  <h2 className="mt-3 text-3xl font-black uppercase">Mi Dream Team</h2>
                </div>

                <button
                  type="button"
                  onClick={compartir}
                  className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-xs font-black uppercase text-sky-300"
                >
                  Compartir
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2">
                {posiciones.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                    <span className="font-black text-yellow-300">{p.id}</span>
                    <span className="truncate text-sm text-zinc-300">{miDreamTeam[p.id]?.nombre || "-"}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black">Votación</p>
              <h2 className="mt-3 text-3xl font-black uppercase">
                {posicionActiva ? `Elegir ${posicionActiva}` : "Seleccioná una posición"}
              </h2>
              <p className="mt-3 text-zinc-500">
                Tocá una posición en la cancha y elegí un jugador candidato.
              </p>

              {posicionActiva && (
                <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                  <p className="text-yellow-300 text-xs font-black uppercase tracking-[0.25em] mb-3">Top 3 actual</p>
                  <div className="space-y-2">
                    {topPorPosicion(posicionActiva).length === 0 ? (
                      <p className="text-zinc-500 text-sm">Sin votos todavía.</p>
                    ) : (
                      topPorPosicion(posicionActiva).map((j: any, index) => (
                        <div key={j.playerId || j.nombre} className="flex items-center justify-between text-sm">
                          <span className="truncate text-white">{index + 1}. {j.nombre}</span>
                          <span className="font-black text-yellow-300">{j.votos}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="max-h-[760px] overflow-y-auto rounded-[34px] border border-sky-500/25 bg-[#020714] p-4">
              {!posicionActiva ? (
                <div className="p-8 text-center text-zinc-500">No hay posición seleccionada.</div>
              ) : candidatos(posicionActiva).length === 0 ? (
                <div className="p-8 text-center text-zinc-500">No hay candidatos para esta posición.</div>
              ) : (
                <div className="space-y-3">
                  {candidatos(posicionActiva).map((j) => (
                    <button
                      key={j.playerId || j.nombre}
                      onClick={() => votar(j)}
                      className="w-full rounded-2xl border border-sky-500/15 bg-black/35 p-4 text-left transition hover:border-yellow-300/60 hover:bg-yellow-400/10"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <LogoEquipo equipo={j.equipo} />
                          <div className="min-w-0">
                            <p className="truncate text-lg font-black uppercase">{j.nombre}</p>
                            <p className="truncate text-sm text-zinc-500">{j.equipo} · {j.posicion || "Sin posición"}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-black text-yellow-300">{j.rating}</p>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">rating</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-white/[0.04] p-2"><b>{j.partidos}</b><p className="text-zinc-500">PJ</p></div>
                        <div className="rounded-xl bg-white/[0.04] p-2"><b>{j.goles}</b><p className="text-zinc-500">G</p></div>
                        <div className="rounded-xl bg-white/[0.04] p-2"><b>{j.asistencias}</b><p className="text-zinc-500">A</p></div>
                        <div className="rounded-xl bg-white/[0.04] p-2"><b>{j.atajadas}</b><p className="text-zinc-500">ATAJ</p></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
