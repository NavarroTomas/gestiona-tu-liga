"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  rating_apa: number;
  atajadas: number;
  score: number;
  mvps: number;
};

type PerfilDreamTeam = {
  id: string;
  display_name: string | null;
  username: string | null;
  playerid?: string | null;
  avatar_url?: string | null;
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

  if (j.atajadas > 0 || pos.includes("GK") || pos.includes("POR"))
    return "arquero";

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

type Competicion = "liga" | "copa_clasificatoria" | "copa_argentina" | "copa_apa" | "copa_campeones";

const temporadasDisponibles = ["Temporada 4"];
const competicionesDisponibles: { value: Competicion; label: string }[] = [
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa APA" },
  { value: "copa_campeones", label: "Copa de Campeones" },
];
const divisionesDisponibles = ["Primera", "Segunda"];
const gruposDisponibles = ["A", "B", "C", "D"];
const fasesDisponibles = ["Octavos", "Cuartos", "Semifinal", "Final"];
const fasesCampeonesDisponibles = ["Semifinal", "Final"];

function faseDb(value: string) {
  const v = String(value || "").toLowerCase().trim();
  if (v === "octavos") return "octavos";
  if (v === "cuartos") return "cuartos";
  if (v === "semifinal" || v === "semis") return "semifinal";
  if (v === "final") return "final";
  return v;
}

function competicionNombre(value: Competicion) {
  return competicionesDisponibles.find((c) => c.value === value)?.label || "Competición";
}

export default function DreamTeamPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [competicion, setCompeticion] = useState<Competicion>("liga");
  const [division, setDivision] = useState("Primera");
  const [grupo, setGrupo] = useState("A");
  const [fase, setFase] = useState("Octavos");
  const [fecha, setFecha] = useState("1");
  const [fechas, setFechas] = useState<string[]>([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [miPerfil, setMiPerfil] = useState<PerfilDreamTeam | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [votos, setVotos] = useState<any[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [perfilesJugadores, setPerfilesJugadores] = useState<
    Record<string, PerfilDreamTeam>
  >({});
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
      .select("id, display_name, username, playerid, avatar_url")
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
  }, [temporada, competicion, division, grupo, fase, fecha]);

  const competicionLabel = competicionNombre(competicion);
  const contextoLabel =
    competicion === "liga"
      ? division
      : competicion === "copa_clasificatoria"
        ? `Grupo ${grupo}`
        : fase;

  const contextoVoto = contextoLabel;

  function aplicarFiltroPartidos(query: any) {
    query = query.eq("temporada", temporada).eq("competicion", competicion);

    if (competicion === "liga") {
      const divisionLower = division.toLowerCase();
      query = query.in("division", [division, divisionLower]);
    }

    if (competicion === "copa_clasificatoria") {
      query = query.eq("fase", "grupos").eq("grupo", grupo);
    }

    if (competicion === "copa_argentina" || competicion === "copa_apa" || competicion === "copa_campeones") {
      query = query.eq("fase", faseDb(fase));
    }

    return query;
  }

  async function cargarFechasDisponibles() {
    let query = supabase
      .from("partidos")
      .select("fecha")
      .eq("temporada", temporada)
      .eq("competicion", competicion);

    query = aplicarFiltroPartidos(query);

    const { data, error } = await query.order("fecha", { ascending: true });

    if (error) {
      console.log(error);
      setFechas(["1"]);
      return ["1"];
    }

    const lista = Array.from(
      new Set((data || []).map((p: any) => String(p.fecha || "")).filter(Boolean)),
    ).sort((a, b) => Number(a) - Number(b));

    const fechasFinales = lista.length > 0 ? lista : ["1"];
    setFechas(fechasFinales);

    if (!fechasFinales.includes(String(fecha))) {
      setFecha(fechasFinales[0]);
    }

    return fechasFinales;
  }

  async function cargarVotos() {
    let query: any = supabase
      .from("public_dream_team_votos")
      .select(
        "id, temporada, division, competicion, fase, grupo, fecha, posicion, playerId, nombre, equipo, usuario, fecha_voto",
      )
      .eq("temporada", temporada)
      .eq("division", contextoVoto)
      .eq("fecha", fecha);

    query = query.eq("competicion", competicion);

    if (competicion === "copa_clasificatoria") {
      query = query.eq("grupo", grupo).eq("fase", "grupos");
    }

    if (competicion === "copa_argentina" || competicion === "copa_apa" || competicion === "copa_campeones") {
      query = query.eq("fase", faseDb(fase));
    }

    const result = await query;

    if (!result.error) return result;

    // Compatibilidad con la tabla/vista vieja, por si todavía no tiene competicion/fase/grupo.
    return await supabase
      .from("public_dream_team_votos")
      .select(
        "id, temporada, division, fecha, posicion, playerId, nombre, equipo, usuario, fecha_voto",
      )
      .eq("temporada", temporada)
      .eq("division", contextoVoto)
      .eq("fecha", fecha);
  }

  async function cargarDatos() {
    setMensaje("");
    setPosicionActiva(null);

    await cargarFechasDisponibles();

    let partidosQuery = supabase
      .from("partidos")
      .select("partido_id, local, visitante")
      .eq("fecha", fecha);

    partidosQuery = aplicarFiltroPartidos(partidosQuery);

    const { data: partidosData, error: partidosError } = await partidosQuery;

    if (partidosError) {
      console.log(partidosError);
      setJugadores([]);
      setVotos([]);
      setLogos({});
      setPerfilesJugadores({});
      return;
    }

    const partidoIds = Array.from(
      new Set((partidosData || []).map((p: any) => p.partido_id).filter(Boolean)),
    );

    let statsResult: any = { data: [], error: null };

    if (partidoIds.length > 0) {
      statsResult = await supabase
        .from("estadisticas_jugadores")
        .select(
          "nombre, playerId, equipo, posicion, goals, assists, overallRating, rating_apa, gKSaves, score, mvp",
        )
        .in("partido_id", partidoIds);
    }

    const votosResult = await cargarVotos();

    if (statsResult.error) {
      console.log(statsResult.error);
      setJugadores([]);
      setVotos([]);
      setPerfilesJugadores({});
      return;
    }

    if (votosResult.error) {
      console.log(votosResult.error);
      setVotos([]);
    }

    const stats = statsResult.data || [];
    const votosData = votosResult.data || [];

    const mapa: Record<string, any> = {};

    stats.forEach((r: any) => {
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
          ratingApaTotal: 0,
          score: 0,
          mvps: 0,
          rating: 0,
          rating_apa: 0,
          atajadas: 0,
        };
      }

      mapa[clave].partidos += 1;
      mapa[clave].goles += Number(r.goals || 0);
      mapa[clave].asistencias += Number(r.assists || 0);
      mapa[clave].ratingTotal += Number(r.overallRating || 0);
      mapa[clave].ratingApaTotal += Number(r.rating_apa || r.overallRating || 0);
      mapa[clave].atajadas += valorGKSave(r);
      mapa[clave].score += Number(r.score || 0);
      mapa[clave].mvps += Number(r.mvp || 0);

      if (r.equipo) mapa[clave].equipo = r.equipo;
      if (r.posicion) mapa[clave].posicion = r.posicion;
      if (r.playerId) mapa[clave].playerId = r.playerId;
      if (r.nombre) mapa[clave].nombre = r.nombre;
    });

    setJugadores(
      Object.values(mapa).map((j: any) => ({
        ...j,
        rating_apa:
          j.partidos > 0
            ? Math.round((j.ratingApaTotal / j.partidos) * 10) / 10
            : 0,
        rating:
          j.partidos > 0
            ? Math.round((j.ratingApaTotal / j.partidos) * 10) / 10
            : 0,
      })),
    );

    setVotos(votosData || []);

    const playerIdsPerfil = Array.from(
      new Set([
        ...Object.values(mapa)
          .map((j: any) => j.playerId)
          .filter(Boolean),
        ...(votosData || []).map((v: any) => v.playerId).filter(Boolean),
      ]),
    );

    if (playerIdsPerfil.length > 0) {
      const { data: perfilesData, error: perfilesError } = await supabase
        .from("public_profiles")
        .select("id, display_name, username, playerid, avatar_url")
        .in("playerid", playerIdsPerfil);

      if (perfilesError) {
        console.log(perfilesError);
        setPerfilesJugadores({});
      } else {
        const mapaPerfiles: Record<string, PerfilDreamTeam> = {};
        (perfilesData || []).forEach((p: any) => {
          if (p.playerid) mapaPerfiles[p.playerid] = p;
        });
        setPerfilesJugadores(mapaPerfiles);
      }
    } else {
      setPerfilesJugadores({});
    }

    const nombresClubes = Array.from(
      new Set([
        ...(partidosData || []).flatMap((p: any) => [p.local, p.visitante]),
        ...Object.values(mapa).map((j: any) => j.equipo),
        ...(votosData || []).map((v: any) => v.equipo),
      ].filter(Boolean)),
    );

    if (nombresClubes.length > 0) {
      const { data: clubesData, error: clubesError } = await supabase
        .from("clubes_info")
        .select("nombre, logo_url")
        .in("nombre", nombresClubes);

      if (clubesError) console.log(clubesError);

      const mapLogos: Record<string, string> = {};
      (clubesData || []).forEach((e: any) => {
        if (e.nombre && e.logo_url) mapLogos[e.nombre] = e.logo_url;
      });
      setLogos(mapLogos);
    } else {
      setLogos({});
    }
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

      const ganador = Object.values(conteo).sort(
        (a: any, b: any) => b.votos - a.votos,
      )[0];
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

    return Object.values(conteo).sort(
      (a: any, b: any) => b.votos - a.votos,
    )[0] as any;
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

    return Object.values(conteo)
      .sort((a: any, b: any) => b.votos - a.votos)
      .slice(0, 3);
  }

  function scoreCandidato(j: Jugador, tipo?: string) {
    const rating = Number(j.rating_apa || j.rating || 0);
    const goles = Number(j.goles || 0);
    const asistencias = Number(j.asistencias || 0);
    const atajadas = Number(j.atajadas || 0);
    const score = Number(j.score || 0);
    const mvps = Number(j.mvps || 0);
    const partidos = Number(j.partidos || 0);

    if (tipo === "arquero") {
      return atajadas * 2 + rating * 5 + mvps * 6 + score * 0.05 + partidos * 0.2;
    }

    if (tipo === "delantero") {
      return goles * 5 + asistencias * 3 + rating * 4 + mvps * 6 + score * 0.05;
    }

    if (tipo === "medio") {
      return rating * 5 + asistencias * 4 + goles * 2 + mvps * 5 + score * 0.05;
    }

    return rating * 6 + mvps * 5 + score * 0.06 + partidos * 0.4;
  }

  function candidatos(posicion: string) {
    const tipo = posiciones.find((p) => p.id === posicion)?.tipo;

    return jugadores
      .filter((j) => tipoJugador(j) === tipo)
      .sort((a, b) => {
        const diff = scoreCandidato(b, tipo) - scoreCandidato(a, tipo);
        if (diff !== 0) return diff;
        return Number(b.rating || 0) - Number(a.rating || 0);
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
        v.division === contextoVoto &&
        String(v.fecha) === String(fecha) &&
        (!v.competicion || v.competicion === competicion) &&
        v.usuario === user.id,
    );

    const yaVotoEstaPosicion = votosMismaFecha.some(
      (v) => v.posicion === posicionActiva,
    );

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

    const votoPayload = {
      temporada,
      division: contextoVoto,
      competicion,
      fase:
        competicion === "liga"
          ? null
          : competicion === "copa_clasificatoria"
            ? "grupos"
            : faseDb(fase),
      grupo: competicion === "copa_clasificatoria" ? grupo : null,
      fecha,
      posicion: posicionActiva,
      playerId: jugador.playerId,
      nombre: jugador.nombre,
      equipo: jugador.equipo,
      usuario: user.id,
      fecha_voto: fechaActualISO(),
    };

    let { error } = await supabase.from("dream_team_votos").insert([votoPayload]);

    if (error && String(error.message || "").toLowerCase().includes("column")) {
      const { competicion: _competicion, fase: _fase, grupo: _grupo, ...payloadViejo } = votoPayload;
      const retry = await supabase.from("dream_team_votos").insert([payloadViejo]);
      error = retry.error;
    }

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

  function perfilPorPlayerId(playerId?: string | null) {
    if (!playerId) return null;
    return perfilesJugadores[playerId] || null;
  }

  function AvatarJugador({
    playerId,
    nombre,
    size = "md",
  }: {
    playerId?: string | null;
    nombre?: string | null;
    size?: "sm" | "md";
  }) {
    const perfil = perfilPorPlayerId(playerId || "");
    const inicial = String(nombre || "J")
      .slice(0, 1)
      .toUpperCase();
    const sizeClass =
      size === "sm"
        ? "h-9 w-9 sm:h-10 sm:w-10 text-sm"
        : "h-11 w-11 sm:h-14 sm:w-14 text-base sm:text-lg";

    const avatar = (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-yellow-400/25 bg-yellow-400/10 font-black text-yellow-300 ${sizeClass}`}
      >
        {perfil?.avatar_url ? (
          <img
            src={perfil.avatar_url}
            alt={nombre || "Jugador"}
            className="h-full w-full object-cover"
          />
        ) : (
          inicial
        )}
      </div>
    );

    if (perfil?.username) {
      return (
        <Link
          href={`/u/${perfil.username}`}
          className="transition hover:scale-105"
        >
          {avatar}
        </Link>
      );
    }

    return avatar;
  }

  function NombreJugadorLink({
    playerId,
    nombre,
    className = "",
  }: {
    playerId?: string | null;
    nombre?: string | null;
    className?: string;
  }) {
    const perfil = perfilPorPlayerId(playerId || "");
    const texto = nombre || "Sin nombre";

    if (perfil?.username) {
      return (
        <Link
          href={`/u/${perfil.username}`}
          className={`transition hover:text-yellow-300 ${className}`}
        >
          {texto}
        </Link>
      );
    }

    return <span className={className}>{texto}</span>;
  }

  function LogoEquipo({ equipo }: { equipo?: string }) {
    const logo = equipo ? logos[equipo] : "";

    return (
      <div className="flex h-8 w-8 shrink-0 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-full border border-sky-400/30 bg-black">
        {logo ? (
          <img
            src={logo}
            alt={equipo}
            className="h-full w-full object-contain p-1"
          />
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
        className="group relative min-h-[92px] rounded-2xl border border-sky-400/30 bg-black/55 p-2 text-center sm:min-h-[106px] sm:rounded-3xl sm:p-3 shadow-[0_0_24px_rgba(56,189,248,.10)] transition hover:scale-[1.04] hover:border-yellow-300/70 hover:shadow-[0_0_30px_rgba(250,204,21,.20)]"
      >
        <div className="mx-auto mb-2 flex justify-center">
          {elegido ? (
            <AvatarJugador
              playerId={elegido.playerId}
              nombre={elegido.nombre}
            />
          ) : (
            <LogoEquipo equipo={elegido?.equipo} />
          )}
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-yellow-300">
          {id}
        </p>

        <h3 className="mt-1 truncate text-xs font-black uppercase text-white sm:text-base">
          {elegido ? (
            <NombreJugadorLink
              playerId={elegido.playerId}
              nombre={elegido.nombre}
            />
          ) : (
            "Elegir"
          )}
        </h3>

        <p className="mt-1 truncate text-[10px] text-zinc-500 sm:text-xs">
          {elegido?.equipo || "Sin jugador"}
        </p>

        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300">
          {elegido?.votos || 0} votos
        </p>
      </button>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020714] p-5 sm:rounded-[38px] md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-400 sm:text-xs sm:tracking-[0.45em]">
              APA PSO ARGENTINA
            </p>

            <h1 className="mt-4 text-[clamp(2.5rem,9vw,5rem)] font-black uppercase italic leading-none">
              <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                Dream Team
              </span>
              <span className="block text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,.55)]">
                Fecha {fecha}
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Votá el Dream Team de la fecha con formación oficial: GK, LB, CB,
              RB, LCM, RCM, LST y RST.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
              <div className="rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Cuenta
                </p>
                <p className="mt-1 truncate font-black text-sky-300">
                  {usuarioId
                    ? miPerfil?.display_name ||
                      miPerfil?.username ||
                      "Usuario APA"
                    : "Iniciá sesión"}
                </p>
              </div>

              <div className="rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Temporada
                </p>
                <p className="mt-1 font-black text-sky-300">{temporada}</p>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Competición
                </p>
                <p className="mt-1 font-black text-yellow-300">{competicionLabel}</p>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-black/35 px-5 py-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Contexto
                </p>
                <p className="mt-1 font-black text-green-400">{contextoLabel}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-sky-500/25 bg-[#020714] p-5 sm:rounded-[34px] md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]">
          <div className="grid gap-7">
            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Temporada
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {temporadasDisponibles.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setTemporada(temp)}
                    className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase sm:px-4 sm:py-4 sm:text-sm transition-all ${
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
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Competencia
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                {competicionesDisponibles.map((comp) => (
                  <button
                    key={comp.value}
                    onClick={() => {
                      setCompeticion(comp.value);
                      setFecha("1");
                    }}
                    className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase transition-all sm:px-4 sm:py-4 sm:text-sm ${
                      competicion === comp.value
                        ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {comp.label}
                  </button>
                ))}
              </div>
            </div>

            {competicion === "liga" && (
              <div>
                <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                  División
                </p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {divisionesDisponibles.map((div) => (
                    <button
                      key={div}
                      onClick={() => {
                        setDivision(div);
                        setFecha("1");
                      }}
                      className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase transition-all sm:px-4 sm:py-4 sm:text-sm ${
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
            )}

            {competicion === "copa_clasificatoria" && (
              <div>
                <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                  Grupo
                </p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {gruposDisponibles.map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setGrupo(g);
                        setFecha("1");
                      }}
                      className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase transition-all sm:px-4 sm:py-4 sm:text-sm ${
                        grupo === g
                          ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                          : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                      }`}
                    >
                      Grupo {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(competicion === "copa_argentina" || competicion === "copa_apa" || competicion === "copa_campeones") && (
              <div>
                <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                  Fase
                </p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {(competicion === "copa_campeones" ? fasesCampeonesDisponibles : fasesDisponibles).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFase(f);
                        setFecha("1");
                      }}
                      className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase transition-all sm:px-4 sm:py-4 sm:text-sm ${
                        fase === f
                          ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                          : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Fecha
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {fechas.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFecha(f)}
                    className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase sm:px-4 sm:py-4 sm:text-sm transition-all ${
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

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-8">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#071b22] p-3 sm:rounded-[42px] sm:p-5 md:p-8 xl:p-10 shadow-[0_0_55px_rgba(34,197,94,.12)]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,.18),transparent_60%)]" />

            <div className="relative z-10 min-h-[560px] rounded-[24px] border border-green-300/20 bg-gradient-to-b from-green-700/20 via-green-950/30 to-green-900/20 p-3 sm:min-h-[680px] sm:rounded-[34px] sm:p-5 md:min-h-[760px] md:p-8 xl:min-h-[820px] xl:p-10">
              <div className="absolute left-[12%] right-[12%] top-6 h-24 rounded-b-full border-x border-b border-white/15" />
              <div className="absolute left-[12%] right-[12%] bottom-6 h-24 rounded-t-full border-x border-t border-white/15" />
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />

              <div className="relative z-10 flex h-full min-h-[500px] flex-col justify-between sm:min-h-[620px] md:min-h-[700px] xl:min-h-[740px]">
                <div className="mx-auto grid w-full max-w-[520px] grid-cols-2 gap-3 sm:gap-6 md:gap-8">
                  <Slot id="LST" />
                  <Slot id="RST" />
                </div>

                <div className="mx-auto grid w-full max-w-[430px] grid-cols-2 gap-3 sm:gap-6 md:gap-8">
                  <Slot id="LCM" />
                  <Slot id="RCM" />
                </div>

                <div className="mx-auto grid w-full max-w-[620px] grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                  <Slot id="LB" />
                  <Slot id="CB" />
                  <Slot id="RB" />
                </div>

                <div className="flex w-full justify-center">
                  <div className="w-[130px] sm:w-[160px] md:w-[180px]">
                    <Slot id="GK" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-yellow-500/25 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6">
              <p className="text-yellow-300 uppercase tracking-[0.3em] text-xs font-black">
                MVP de la fecha
              </p>
              <div className="mt-4 flex items-center gap-4">
                <AvatarJugador
                  playerId={jugadorMasVotado?.playerId}
                  nombre={jugadorMasVotado?.nombre || "-"}
                />
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black uppercase sm:truncate sm:text-3xl">
                    <NombreJugadorLink
                      playerId={jugadorMasVotado?.playerId}
                      nombre={jugadorMasVotado?.nombre || "-"}
                    />
                  </h2>
                  <p className="mt-2 truncate text-zinc-500">
                    {jugadorMasVotado?.equipo || "Sin votos todavía"}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-4xl font-black text-yellow-300 sm:text-5xl">
                {jugadorMasVotado?.votos || 0}
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-black">
                votos totales
              </p>
            </section>

            <section className="rounded-[28px] border border-sky-500/25 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black">
                    Mi equipo
                  </p>
                  <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                    Mi Dream Team
                  </h2>
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
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3"
                  >
                    <span className="font-black text-yellow-300">{p.id}</span>
                    <div className="flex min-w-0 items-center gap-2">
                      {miDreamTeam[p.id] && (
                        <AvatarJugador
                          playerId={miDreamTeam[p.id]?.playerId}
                          nombre={miDreamTeam[p.id]?.nombre}
                          size="sm"
                        />
                      )}
                      <span className="truncate text-sm text-zinc-300">
                        {miDreamTeam[p.id] ? (
                          <NombreJugadorLink
                            playerId={miDreamTeam[p.id]?.playerId}
                            nombre={miDreamTeam[p.id]?.nombre}
                          />
                        ) : (
                          "-"
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-sky-500/25 bg-[#020714] p-5 sm:rounded-[34px] sm:p-6">
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black">
                Votación
              </p>
              <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                {posicionActiva
                  ? `Elegir ${posicionActiva}`
                  : "Seleccioná una posición"}
              </h2>
              <p className="mt-3 text-zinc-500">
                Tocá una posición en la cancha y elegí un jugador candidato.
              </p>

              {posicionActiva && (
                <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                  <p className="text-yellow-300 text-xs font-black uppercase tracking-[0.25em] mb-3">
                    Top 3 actual
                  </p>
                  <div className="space-y-2">
                    {topPorPosicion(posicionActiva).length === 0 ? (
                      <p className="text-zinc-500 text-sm">
                        Sin votos todavía.
                      </p>
                    ) : (
                      topPorPosicion(posicionActiva).map((j: any, index) => (
                        <div
                          key={j.playerId || j.nombre}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="font-black text-zinc-500">
                              {index + 1}.
                            </span>
                            <AvatarJugador
                              playerId={j.playerId}
                              nombre={j.nombre}
                              size="sm"
                            />
                            <span className="truncate text-white">
                              <NombreJugadorLink
                                playerId={j.playerId}
                                nombre={j.nombre}
                              />
                            </span>
                          </div>
                          <span className="font-black text-yellow-300">
                            {j.votos}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="max-h-[560px] overflow-y-auto rounded-[28px] sm:max-h-[760px] sm:rounded-[34px] border border-sky-500/25 bg-[#020714] p-4">
              {!posicionActiva ? (
                <div className="p-8 text-center text-zinc-500">
                  No hay posición seleccionada.
                </div>
              ) : candidatos(posicionActiva).length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  No hay candidatos para esta posición.
                </div>
              ) : (
                <div className="space-y-3">
                  {candidatos(posicionActiva).map((j) => (
                    <button
                      key={j.playerId || j.nombre}
                      onClick={() => votar(j)}
                      className="w-full rounded-2xl border border-sky-500/15 bg-black/35 p-3 text-left sm:p-4 transition hover:border-yellow-300/60 hover:bg-yellow-400/10"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <AvatarJugador
                            playerId={j.playerId}
                            nombre={j.nombre}
                          />
                          <div className="min-w-0">
                            <p className="break-words text-base font-black uppercase sm:truncate sm:text-lg">
                              <NombreJugadorLink
                                playerId={j.playerId}
                                nombre={j.nombre}
                              />
                            </p>
                            <p className="truncate text-sm text-zinc-500">
                              {j.equipo} · {j.posicion || "Sin posición"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-black text-yellow-300 sm:text-2xl">
                            {j.rating}
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                            rating
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                        <div className="rounded-xl bg-white/[0.04] p-2">
                          <b>{j.partidos}</b>
                          <p className="text-zinc-500">PJ</p>
                        </div>
                        <div className="rounded-xl bg-white/[0.04] p-2">
                          <b>{j.goles}</b>
                          <p className="text-zinc-500">G</p>
                        </div>
                        <div className="rounded-xl bg-white/[0.04] p-2">
                          <b>{j.asistencias}</b>
                          <p className="text-zinc-500">A</p>
                        </div>
                        <div className="rounded-xl bg-white/[0.04] p-2">
                          <b>{j.atajadas}</b>
                          <p className="text-zinc-500">ATAJ</p>
                        </div>
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
