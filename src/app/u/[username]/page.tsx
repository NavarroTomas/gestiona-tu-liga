"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PerfilPublico = {
  id: string;
  display_name: string | null;
  username: string | null;
  playerid: string | null;
  requested_playerid: string | null;
  playerid_verified: boolean | null;
  verification_status: string | null;
  steam_id: string | null;
  bio: string | null;
  avatar_url: string | null;
  status: string | null;
  visible_role: string | null;
};

type StatJugador = {
  nombre: string | null;
  playerId?: string | null;
  playerid?: string | null;
  equipo: string | null;
  temporada: string | null;
  division: string | null;
  fecha?: string | null;
  goals?: number | null;
  assists?: number | null;
  mvp?: number | null;
  overallRating?: number | null;
  rating_apa?: number | null;
  score?: number | null;
  gKSaves?: number | null;
  gKCatches?: number | null;
};

type Prediccion = {
  id: number;
  partido_id: string;
  prediccion: "local" | "empate" | "visitante";
  usuario: string;
  goles_local?: number | null;
  goles_visitante?: number | null;
};

type Partido = {
  id: string | number;
  partido_id?: string | null;
  resultado?: string | null;
};

type DreamVote = {
  id: number;
  usuario: string;
  temporada: string | null;
  division: string | null;
  fecha: string | null;
  posicion: string | null;
  nombre: string | null;
};

type Plantilla = {
  id: number;
  jugador: string | null;
  playerid: string | null;
  equipo: string | null;
  posicion: string | null;
  temporada: string | null;
  division: string | null;
  estado: string | null;
};

type PremioAPA = {
  id: number;
  temporada: string;
  division: string | null;
  premio: string;
  playerid: string;
  nombre: string;
  equipo: string | null;
  puntos: number | null;
  posicion: number | null;
  created_at: string | null;
};

function premioNombre(premio: string) {
  const mapa: Record<string, string> = {
    balon_oro: "Balón de Oro",
    the_best: "The Best",
    raiko_trophy: "Raiko Trophy",
    bota_oro: "Bota de Oro",
    golden_boy: "Golden Boy",
  };

  return mapa[premio] || premio;
}

function premioIcono(premio: string) {
  const mapa: Record<string, string> = {
    balon_oro: "🏆",
    the_best: "🏅",
    raiko_trophy: "🧤",
    bota_oro: "⚽",
    golden_boy: "⭐",
  };

  return mapa[premio] || "🏆";
}

function premioColor(premio: string) {
  const mapa: Record<string, string> = {
    balon_oro: "text-yellow-300",
    the_best: "text-orange-300",
    raiko_trophy: "text-cyan-300",
    bota_oro: "text-emerald-400",
    golden_boy: "text-purple-300",
  };

  return mapa[premio] || "text-yellow-300";
}

function premioBg(premio: string) {
  const mapa: Record<string, string> = {
    balon_oro: "border-yellow-400/25 bg-yellow-400/10",
    the_best: "border-orange-400/25 bg-orange-400/10",
    raiko_trophy: "border-cyan-400/25 bg-cyan-400/10",
    bota_oro: "border-emerald-400/25 bg-emerald-400/10",
    golden_boy: "border-purple-400/25 bg-purple-400/10",
  };

  return mapa[premio] || "border-yellow-400/25 bg-yellow-400/10";
}

function ocultarSteamId(steamId?: string | null) {
  if (!steamId) return "No vinculado";
  const limpio = steamId.trim();
  if (limpio.length <= 8) return "Vinculado";
  return `${limpio.slice(0, 7)}******${limpio.slice(-4)}`;
}

function partidoKey(partido: Partido) {
  return partido.partido_id || String(partido.id);
}

function golesReales(partido?: Partido | null) {
  const resultado = String(partido?.resultado || "").trim();
  if (!resultado.includes("-")) return null;

  const [localRaw, visitanteRaw] = resultado.split("-");
  const local = Number(localRaw?.trim());
  const visitante = Number(visitanteRaw?.trim());

  if (Number.isNaN(local) || Number.isNaN(visitante)) return null;

  return { local, visitante };
}

function ganadorReal(partido?: Partido | null): "local" | "empate" | "visitante" | null {
  const goles = golesReales(partido);
  if (!goles) return null;

  if (goles.local > goles.visitante) return "local";
  if (goles.visitante > goles.local) return "visitante";
  return "empate";
}

export default function PerfilPublicoPage() {
  const params = useParams();
  const usernameParam = String(params?.username || "").toLowerCase();

  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [stats, setStats] = useState<StatJugador[]>([]);
  const [predicciones, setPredicciones] = useState<Prediccion[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [dreamVotes, setDreamVotes] = useState<DreamVote[]>([]);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [premiosApa, setPremiosApa] = useState<PremioAPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarPerfilPublico();
  }, [usernameParam]);

  async function cargarPerfilPublico() {
    setLoading(true);
    setMensaje("");
    setPerfil(null);
    setStats([]);
    setPredicciones([]);
    setPartidos([]);
    setDreamVotes([]);
    setPlantillas([]);
    setPremiosApa([]);

    const { data: perfilData, error: perfilError } = await supabase
      .from("profiles")
      .select(
        "id,display_name,username,playerid,requested_playerid,playerid_verified,verification_status,steam_id,bio,avatar_url,status,visible_role",
      )
      .eq("username", usernameParam)
      .maybeSingle();

    if (perfilError) {
      console.log(perfilError);
      setMensaje("No pude cargar este perfil.");
      setLoading(false);
      return;
    }

    if (!perfilData) {
      setMensaje("No existe este usuario.");
      setLoading(false);
      return;
    }

    const perfilFinal = perfilData as PerfilPublico;
    setPerfil(perfilFinal);

    const statsQuery = perfilFinal.playerid
      ? supabase
          .from("estadisticas_jugadores")
          .select(
            "nombre,playerId,equipo,temporada,division,fecha,goals,assists,mvp,overallRating,rating_apa,score,gKSaves,gKCatches",
          )
          .eq("playerId", perfilFinal.playerid)
      : Promise.resolve({ data: [], error: null });

    const prediccionesQuery = supabase
      .from("predicciones")
      .select("id,partido_id,prediccion,usuario,goles_local,goles_visitante")
      .eq("usuario", perfilFinal.id);

    const dreamQuery = supabase
      .from("dream_team_votos")
      .select("id,usuario,temporada,division,fecha,posicion,nombre")
      .eq("usuario", perfilFinal.id);

    const plantillasQuery = perfilFinal.playerid
      ? supabase
          .from("plantillas")
          .select("id,jugador,playerid,equipo,posicion,temporada,division,estado")
          .eq("playerid", perfilFinal.playerid)
      : Promise.resolve({ data: [], error: null });

    const premiosQuery = perfilFinal.playerid
      ? supabase
          .from("premios_apa")
          .select(
            "id,temporada,division,premio,playerid,nombre,equipo,puntos,posicion,created_at",
          )
          .eq("playerid", perfilFinal.playerid)
          .order("temporada", { ascending: false })
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const [
      { data: statsRaw, error: statsError },
      { data: predDataRaw, error: predError },
      { data: dreamDataRaw, error: dreamError },
      { data: plantillasRaw, error: plantillasError },
      { data: premiosRaw, error: premiosError },
    ] = await Promise.all([
      statsQuery,
      prediccionesQuery,
      dreamQuery,
      plantillasQuery,
      premiosQuery,
    ]);

    if (statsError) console.log(statsError);
    if (predError) console.log(predError);
    if (dreamError) console.log(dreamError);
    if (plantillasError) console.log(plantillasError);
    if (premiosError) console.log(premiosError);

    const statsData = (statsRaw || []) as StatJugador[];
    const predData = (predDataRaw || []) as Prediccion[];
    const dreamData = (dreamDataRaw || []) as DreamVote[];
    const plantillasData = (plantillasRaw || []) as Plantilla[];
    const premiosData = (premiosRaw || []) as PremioAPA[];

    setStats(statsData);
    setPredicciones(predData);
    setDreamVotes(dreamData);
    setPlantillas(plantillasData);
    setPremiosApa(premiosData);

    if (predData.length > 0) {
      const ids = Array.from(
        new Set(predData.map((p) => p.partido_id).filter(Boolean)),
      );

      if (ids.length > 0) {
        const { data: partidosData, error: partidosError } = await supabase
          .from("partidos")
          .select("id,partido_id,resultado")
          .in("partido_id", ids);

        if (partidosError) {
          console.log(partidosError);
          setPartidos([]);
        } else {
          setPartidos((partidosData || []) as Partido[]);
        }
      } else {
        setPartidos([]);
      }
    } else {
      setPartidos([]);
    }

    setLoading(false);
  }

  async function notificarLogrosDesbloqueados(logrosActivos: {
    key: string;
    titulo: string;
    descripcion: string;
    activo: boolean;
  }[]) {
    if (!perfil) return;

    const activos = logrosActivos.filter((logro) => logro.activo);

    if (activos.length === 0) return;

    const { data: yaNotificados, error: yaNotificadosError } = await supabase
      .from("logros_notificados")
      .select("logro_key")
      .eq("user_id", perfil.id);

    if (yaNotificadosError) {
      console.log(yaNotificadosError);
      return;
    }

    const keysYaNotificadas = new Set(
      (yaNotificados || []).map((item: any) => item.logro_key),
    );

    const nuevos = activos.filter((logro) => !keysYaNotificadas.has(logro.key));

    if (nuevos.length === 0) return;

    const registrosLogros = nuevos.map((logro) => ({
      user_id: perfil.id,
      logro_key: logro.key,
    }));

    const { error: logrosError } = await supabase
      .from("logros_notificados")
      .insert(registrosLogros);

    if (logrosError) {
      console.log(logrosError);
      return;
    }

    const notificaciones = nuevos.map((logro) => ({
      user_id: perfil.id,
      tipo: "achievement",
      titulo: "Logro desbloqueado",
      mensaje: `${logro.titulo}: ${logro.descripcion}`,
      href: `/u/${perfil.username}`,
      leida: false,
    }));

    const { error: notificacionesError } = await supabase
      .from("notificaciones")
      .insert(notificaciones);

    if (notificacionesError) {
      console.log(notificacionesError);
    }
  }

  const partidosMap = useMemo(() => {
    const map: Record<string, Partido> = {};
    partidos.forEach((partido) => {
      map[partidoKey(partido)] = partido;
    });
    return map;
  }, [partidos]);

  const plantillaActual = useMemo(() => {
    const activos = plantillas.filter((p) => p.estado !== "baja");

    if (activos.length === 0) return null;

    return activos[activos.length - 1];
  }, [plantillas]);

  const trayectoria = useMemo(() => {
    return [...plantillas].reverse();
  }, [plantillas]);

  const resumen = useMemo(() => {
    const partidosJugados = stats.length;
    const goles = stats.reduce((acc, s) => acc + Number(s.goals || 0), 0);
    const asistencias = stats.reduce((acc, s) => acc + Number(s.assists || 0), 0);
    const mvps = stats.reduce((acc, s) => acc + Number(s.mvp || 0), 0);
    const atajadas = stats.reduce((acc, s) => acc + Number(s.gKSaves || 0), 0);
    const atrapadas = stats.reduce((acc, s) => acc + Number(s.gKCatches || 0), 0);
    const score = stats.reduce((acc, s) => acc + Number(s.score || 0), 0);

    const ratings = stats
      .map((s) => Number(s.rating_apa || s.overallRating || 0))
      .filter((n) => n > 0);

    const ratingPromedio =
      ratings.length > 0
        ? ratings.reduce((acc, n) => acc + n, 0) / ratings.length
        : 0;

    const ultimo = [...stats]
      .filter((s) => s.temporada || s.equipo)
      .slice()
      .reverse()[0];

    const esArquero = atajadas > 0 || atrapadas > 0;

    return {
      partidosJugados,
      goles,
      asistencias,
      mvps,
      atajadas,
      atrapadas,
      score,
      ratingPromedio,
      esArquero,
      equipoActual: plantillaActual?.equipo || ultimo?.equipo || "Sin equipo registrado",
      temporadaActual: plantillaActual?.temporada || ultimo?.temporada || "-",
      divisionActual: plantillaActual?.division || ultimo?.division || "-",
      nombreJugador: ultimo?.nombre || perfil?.display_name || perfil?.username || "Jugador APA",
    };
  }, [stats, perfil, plantillaActual]);

  const historial = useMemo(() => {
    const map: Record<
      string,
      {
        temporada: string;
        division: string;
        equipo: string;
        pj: number;
        goles: number;
        asistencias: number;
        mvps: number;
        atajadas: number;
        ratingTotal: number;
        ratings: number;
      }
    > = {};

    stats.forEach((s) => {
      const temporada = s.temporada || "-";
      const division = s.division || "-";
      const equipo = s.equipo || "Sin equipo";
      const key = `${temporada}-${division}-${equipo}`;

      if (!map[key]) {
        map[key] = {
          temporada,
          division,
          equipo,
          pj: 0,
          goles: 0,
          asistencias: 0,
          mvps: 0,
          atajadas: 0,
          ratingTotal: 0,
          ratings: 0,
        };
      }

      map[key].pj += 1;
      map[key].goles += Number(s.goals || 0);
      map[key].asistencias += Number(s.assists || 0);
      map[key].mvps += Number(s.mvp || 0);
      map[key].atajadas += Number(s.gKSaves || 0);

      const rating = Number(s.rating_apa || s.overallRating || 0);
      if (rating > 0) {
        map[key].ratingTotal += rating;
        map[key].ratings += 1;
      }
    });

    return Object.values(map).reverse();
  }, [stats]);

  const prediccionStats = useMemo(() => {
    let puntos = 0;
    let exactos = 0;
    let ganadores = 0;
    let fallos = 0;
    let pendientes = 0;

    predicciones.forEach((pred) => {
      const partido = partidosMap[pred.partido_id];
      const ganador = ganadorReal(partido);
      const goles = golesReales(partido);

      if (!ganador || !goles) {
        pendientes += 1;
        return;
      }

      const exacto =
        Number(pred.goles_local) === goles.local &&
        Number(pred.goles_visitante) === goles.visitante;

      if (exacto) {
        puntos += 3;
        exactos += 1;
        ganadores += 1;
        return;
      }

      if (pred.prediccion === ganador) {
        puntos += 1;
        ganadores += 1;
        return;
      }

      fallos += 1;
    });

    return {
      total: predicciones.length,
      puntos,
      exactos,
      ganadores,
      fallos,
      pendientes,
    };
  }, [predicciones, partidosMap]);

  const dreamStats = useMemo(() => {
    const equiposCompletos = new Set(
      dreamVotes.map((v) => `${v.temporada}-${v.division}-${v.fecha}`),
    ).size;

    return {
      votos: dreamVotes.length,
      equiposCompletos,
    };
  }, [dreamVotes]);

  const trofeosAgrupados = useMemo(() => {
    const mapa: Record<
      string,
      {
        premio: string;
        cantidad: number;
        items: PremioAPA[];
      }
    > = {};

    premiosApa.forEach((premio) => {
      if (!mapa[premio.premio]) {
        mapa[premio.premio] = {
          premio: premio.premio,
          cantidad: 0,
          items: [],
        };
      }

      mapa[premio.premio].cantidad += 1;
      mapa[premio.premio].items.push(premio);
    });

    return Object.values(mapa).sort((a, b) => b.cantidad - a.cantidad);
  }, [premiosApa]);

  const totalTrofeos = premiosApa.length;

  const logros = useMemo(() => {
    const crearProgreso = (actual: number, objetivo: number) => {
      if (objetivo <= 0) return 0;
      return Math.min(100, Math.round((actual / objetivo) * 100));
    };

    const lista: {
      key: string;
      icono: string;
      titulo: string;
      descripcion: string;
      rareza: "Común" | "Rara" | "Épica" | "Legendaria";
      actual: number;
      objetivo: number;
      activo: boolean;
      textoProgreso: string;
    }[] = [
      {
        key: "primer_gol",
        icono: "🥅",
        titulo: "Primer Gol",
        descripcion: "Convertir el primer gol oficial en APA.",
        rareza: "Común",
        actual: resumen.goles,
        objetivo: 1,
        activo: resumen.goles >= 1,
        textoProgreso: `${Math.min(resumen.goles, 1)} / 1`,
      },
      {
        key: "100_goles",
        icono: "💯",
        titulo: "100 Goles",
        descripcion: "Llegar a los 100 goles oficiales.",
        rareza: "Épica",
        actual: resumen.goles,
        objetivo: 100,
        activo: resumen.goles >= 100,
        textoProgreso: `${Math.min(resumen.goles, 100)} / 100`,
      },
      {
        key: "100_asistencias",
        icono: "🎯",
        titulo: "100 Asistencias",
        descripcion: "Llegar a las 100 asistencias oficiales.",
        rareza: "Épica",
        actual: resumen.asistencias,
        objetivo: 100,
        activo: resumen.asistencias >= 100,
        textoProgreso: `${Math.min(resumen.asistencias, 100)} / 100`,
      },
      {
        key: "primer_mvp",
        icono: "⭐",
        titulo: "Primer MVP",
        descripcion: "Conseguir el primer MVP oficial.",
        rareza: "Común",
        actual: resumen.mvps,
        objetivo: 1,
        activo: resumen.mvps >= 1,
        textoProgreso: `${Math.min(resumen.mvps, 1)} / 1`,
      },
      {
        key: "10_mvp",
        icono: "🌟",
        titulo: "10 MVP",
        descripcion: "Alcanzar 10 MVP oficiales.",
        rareza: "Rara",
        actual: resumen.mvps,
        objetivo: 10,
        activo: resumen.mvps >= 10,
        textoProgreso: `${Math.min(resumen.mvps, 10)} / 10`,
      },
      {
        key: "balon_oro",
        icono: "🏆",
        titulo: "Balón de Oro",
        descripcion: "Ganar un Balón de Oro APA.",
        rareza: "Legendaria",
        actual: premiosApa.filter((p) => p.premio === "balon_oro").length,
        objetivo: 1,
        activo: premiosApa.some((p) => p.premio === "balon_oro"),
        textoProgreso: premiosApa.some((p) => p.premio === "balon_oro") ? "1 / 1" : "Pendiente",
      },
      {
        key: "the_best",
        icono: "🏅",
        titulo: "The Best",
        descripcion: "Ganar The Best como mejor jugador de divisiones inferiores.",
        rareza: "Épica",
        actual: premiosApa.filter((p) => p.premio === "the_best").length,
        objetivo: 1,
        activo: premiosApa.some((p) => p.premio === "the_best"),
        textoProgreso: premiosApa.some((p) => p.premio === "the_best") ? "1 / 1" : "Pendiente",
      },
      {
        key: "raiko_trophy",
        icono: "🧤",
        titulo: "Raiko Trophy",
        descripcion: "Ganar el premio al mejor arquero de APA.",
        rareza: "Legendaria",
        actual: premiosApa.filter((p) => p.premio === "raiko_trophy").length,
        objetivo: 1,
        activo: premiosApa.some((p) => p.premio === "raiko_trophy"),
        textoProgreso: premiosApa.some((p) => p.premio === "raiko_trophy") ? "1 / 1" : "Pendiente",
      },
      {
        key: "bota_oro",
        icono: "⚽",
        titulo: "Bota de Oro",
        descripcion: "Ganar la Bota de Oro APA como máximo goleador.",
        rareza: "Legendaria",
        actual: premiosApa.filter((p) => p.premio === "bota_oro").length,
        objetivo: 1,
        activo: premiosApa.some((p) => p.premio === "bota_oro"),
        textoProgreso: premiosApa.some((p) => p.premio === "bota_oro") ? "1 / 1" : "Pendiente",
      },
      {
        key: "golden_boy",
        icono: "⭐",
        titulo: "Golden Boy",
        descripcion: "Ganar el premio Golden Boy APA como joven promesa.",
        rareza: "Legendaria",
        actual: premiosApa.filter((p) => p.premio === "golden_boy").length,
        objetivo: 1,
        activo: premiosApa.some((p) => p.premio === "golden_boy"),
        textoProgreso: premiosApa.some((p) => p.premio === "golden_boy") ? "1 / 1" : "Pendiente",
      },
      {
        key: "100_partidos",
        icono: "🎮",
        titulo: "100 Partidos",
        descripcion: "Disputar 100 partidos oficiales.",
        rareza: "Rara",
        actual: resumen.partidosJugados,
        objetivo: 100,
        activo: resumen.partidosJugados >= 100,
        textoProgreso: `${Math.min(resumen.partidosJugados, 100)} / 100`,
      },
      {
        key: "pronosticador",
        icono: "🔮",
        titulo: "Pronosticador",
        descripcion: "Realizar al menos una predicción.",
        rareza: "Común",
        actual: prediccionStats.total,
        objetivo: 1,
        activo: prediccionStats.total >= 1,
        textoProgreso: `${Math.min(prediccionStats.total, 1)} / 1`,
      },
      {
        key: "votante_dream_team",
        icono: "💫",
        titulo: "Votante Dream Team",
        descripcion: "Votar al menos una vez el Dream Team.",
        rareza: "Común",
        actual: dreamStats.votos,
        objetivo: 1,
        activo: dreamStats.votos >= 1,
        textoProgreso: `${Math.min(dreamStats.votos, 1)} / 1`,
      },
    ];

    return lista.map((logro) => ({
      ...logro,
      progreso: crearProgreso(logro.actual, logro.objetivo),
    }));
  }, [resumen, prediccionStats, dreamStats, premiosApa]);

  const logrosDesbloqueados = useMemo(() => {
    return logros.filter((logro) => logro.activo).length;
  }, [logros]);

  const porcentajeLogros = useMemo(() => {
    if (logros.length === 0) return 0;
    return Math.round((logrosDesbloqueados / logros.length) * 100);
  }, [logros, logrosDesbloqueados]);


  useEffect(() => {
    if (!perfil || loading || logros.length === 0) return;

    notificarLogrosDesbloqueados(logros);
  }, [perfil?.id, loading, logrosDesbloqueados]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-2xl font-black uppercase tracking-[0.18em] text-sky-300">
          Cargando perfil APA...
        </p>
      </main>
    );
  }

  if (mensaje || !perfil) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 text-white">
        <section className="max-w-xl rounded-[34px] border border-red-400/20 bg-red-400/10 p-8 text-center">
          <h1 className="text-3xl font-black uppercase text-red-300">
            Perfil no encontrado
          </h1>

          <p className="mt-4 text-zinc-300">{mensaje || "No existe este usuario."}</p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-3 text-sm font-black uppercase text-black"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  const inicial = (perfil.display_name || perfil.username || "A").slice(0, 1).toUpperCase();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-10 text-white md:px-8">
      <section className="mx-auto max-w-[1500px] space-y-8">
        <section className="grid grid-cols-1 gap-8 xl:grid-cols-[380px_1fr]">
          <aside className="relative overflow-hidden rounded-[42px] border border-yellow-400/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(250,204,21,.14)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,.20),transparent_48%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 via-black/20 to-black/75" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-300">
                  Carnet APA
                </p>

                <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300">
                  {perfil.status || "pending"}
                </span>
              </div>

              <div className="mt-7 flex justify-center">
                <div className="flex h-52 w-52 items-center justify-center overflow-hidden rounded-full border border-yellow-300/40 bg-black/45 text-6xl font-black text-yellow-300 shadow-[0_0_35px_rgba(250,204,21,.18)]">
                  {perfil.avatar_url ? (
                    <img
                      src={perfil.avatar_url}
                      alt={perfil.display_name || perfil.username || "Avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    inicial
                  )}
                </div>
              </div>

              <div className="mt-7 text-center">
                <h1 className="text-4xl font-black uppercase italic leading-none">
                  {perfil.display_name || perfil.username}
                </h1>

                <p className="mt-3 text-sm font-black uppercase tracking-[0.28em] text-sky-300">
                  @{perfil.username}
                </p>

                <p className="mt-3 inline-flex rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                  {perfil.visible_role || "usuario"}
                </p>

                <div className="mt-4">
                  {perfil.playerid_verified ? (
                    <span className="inline-flex rounded-full border border-green-400/25 bg-green-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-green-300">
                      ✅ Identidad verificada
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                      ⏳ Verificación pendiente
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                    Club actual
                  </p>
                  <p className="mt-2 truncate text-xl font-black text-white">
                    {resumen.equipoActual}
                  </p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                    {resumen.temporadaActual} · {resumen.divisionActual}
                  </p>
                </div>

                <div className={`rounded-2xl border p-4 ${
                  perfil.playerid_verified
                    ? "border-green-400/20 bg-green-400/10"
                    : "border-yellow-400/20 bg-yellow-400/10"
                }`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${
                    perfil.playerid_verified ? "text-green-300" : "text-yellow-300"
                  }`}>
                    Identidad APA
                  </p>

                  <p className="mt-2 break-all text-lg font-black text-white">
                    {perfil.playerid_verified
                      ? (perfil.playerid || "Verificado")
                      : "Pendiente de verificación"}
                  </p>

                  <p className={`mt-2 text-xs font-black uppercase tracking-[0.18em] ${
                    perfil.playerid_verified ? "text-green-300" : "text-yellow-300"
                  }`}>
                    {perfil.playerid_verified
                      ? "✅ Verificado por APA"
                      : "⏳ PlayerId pendiente"}
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-300">
                    Steam
                  </p>
                  <p className="mt-2 break-all text-lg font-black text-white">
                    {ocultarSteamId(perfil.steam_id)}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="relative overflow-hidden rounded-[42px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.18)] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/25" />

            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
                Perfil público APA
              </p>

              <h2 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-7xl">
                {resumen.nombreJugador}
              </h2>

              
              <div className="mt-6 flex flex-wrap gap-3">
                <span className={`rounded-full px-4 py-2 text-xs font-black uppercase ${
                  perfil.playerid_verified ? "border border-green-400/25 bg-green-400/10 text-green-300" : "border border-yellow-400/25 bg-yellow-400/10 text-yellow-300"
                }`}>
                  {perfil.playerid_verified ? "✅ PlayerID verificado" : "⏳ PlayerID pendiente"}
                </span>

                <span className={`rounded-full px-4 py-2 text-xs font-black uppercase ${
                  perfil.steam_id ? "border border-cyan-400/25 bg-cyan-400/10 text-cyan-300" : "border border-zinc-500/25 bg-zinc-500/10 text-zinc-400"
                }`}>
                  {perfil.steam_id ? "🎮 Steam vinculado" : "Steam no vinculado"}
                </span>
              </div>

              
              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-yellow-400/25 bg-yellow-400/10 p-5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-300">
                    Trofeos APA
                  </p>
                  <p className="mt-3 text-5xl font-black text-yellow-300">
                    {totalTrofeos}
                  </p>
                </div>

                <div className="rounded-3xl border border-purple-400/25 bg-purple-400/10 p-5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-300">
                    Logros
                  </p>
                  <p className="mt-3 text-5xl font-black text-purple-300">
                    {logrosDesbloqueados}/{logros.length}
                  </p>
                </div>

                <div className="rounded-3xl border border-green-400/25 bg-green-400/10 p-5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-green-300">
                    Progreso
                  </p>
                  <p className="mt-3 text-5xl font-black text-green-300">
                    {porcentajeLogros}%
                  </p>
                </div>
              </div>

{perfil.bio ? (
                <p className="mt-6 max-w-4xl whitespace-pre-line text-lg leading-8 text-zinc-300">
                  {perfil.bio}
                </p>
              ) : (
                <p className="mt-6 max-w-4xl text-lg leading-8 text-zinc-500">
                  Este usuario todavía no agregó una biografía.
                </p>
              )}

              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-3xl border border-sky-400/20 bg-black/35 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">PJ</p>
                  <p className="mt-3 text-4xl font-black text-sky-300">{resumen.partidosJugados}</p>
                </div>

                <div className="rounded-3xl border border-yellow-400/20 bg-black/35 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                    {resumen.esArquero ? "Atajadas" : "Goles"}
                  </p>
                  <p className="mt-3 text-4xl font-black text-yellow-300">
                    {resumen.esArquero ? resumen.atajadas : resumen.goles}
                  </p>
                </div>

                <div className="rounded-3xl border border-green-400/20 bg-black/35 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Asist.</p>
                  <p className="mt-3 text-4xl font-black text-green-300">{resumen.asistencias}</p>
                </div>

                <div className="rounded-3xl border border-purple-400/20 bg-black/35 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Rating</p>
                  <p className="mt-3 text-4xl font-black text-purple-300">
                    {resumen.ratingPromedio ? resumen.ratingPromedio.toFixed(2) : "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">MVP</p>
                  <p className="mt-3 text-3xl font-black text-white">{resumen.mvps}</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Score</p>
                  <p className="mt-3 text-3xl font-black text-white">{resumen.score}</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Pred.</p>
                  <p className="mt-3 text-3xl font-black text-white">{prediccionStats.total}</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Dream Team</p>
                  <p className="mt-3 text-3xl font-black text-white">{dreamStats.equiposCompletos}</p>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_420px]">
          <section className="space-y-8">
            <section className="relative overflow-hidden rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(250,204,21,.10)] md:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.14),transparent_42%)]" />

              <div className="relative z-10">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                      Vitrina oficial
                    </p>

                    <h2 className="mt-2 text-4xl font-black uppercase">
                      Trofeos APA
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                      Premios individuales oficiales ganados por este jugador en la comunidad.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-5 py-4 text-center">
                    <p className="text-4xl font-black text-yellow-300">
                      {totalTrofeos}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300/70">
                      Trofeos
                    </p>
                  </div>
                </div>

                {totalTrofeos === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                    Este jugador todavía no ganó trofeos individuales APA.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {trofeosAgrupados.map((grupo) => (
                      <article
                        key={grupo.premio}
                        className={`relative overflow-hidden rounded-3xl border p-5 ${premioBg(grupo.premio)}`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.12),transparent_42%)]" />

                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className={`text-xs font-black uppercase tracking-[0.25em] ${premioColor(grupo.premio)}`}>
                                Premio APA
                              </p>

                              <h3 className="mt-2 text-2xl font-black uppercase text-white">
                                {premioIcono(grupo.premio)} {premioNombre(grupo.premio)}
                              </h3>

                              <p className="mt-1 text-sm font-bold text-zinc-500">
                                {grupo.cantidad} {grupo.cantidad === 1 ? "vez" : "veces"}
                              </p>
                            </div>

                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-4xl">
                              {premioIcono(grupo.premio)}
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            {grupo.items.map((trofeo) => (
                              <span
                                key={trofeo.id}
                                className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300"
                              >
                                {trofeo.temporada}
                                {trofeo.division ? ` · ${trofeo.division}` : ""}
                              </span>
                            ))}
                          </div>

                          <div className="mt-5 grid grid-cols-3 gap-2">
                            <div className="rounded-xl border border-white/10 bg-black/35 p-3 text-center">
                              <p className="text-[9px] font-black uppercase text-zinc-500">
                                Últ. Pts
                              </p>
                              <p className={`mt-1 text-lg font-black ${premioColor(grupo.premio)}`}>
                                {Number(grupo.items[0]?.puntos || 0).toFixed(1)}
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/35 p-3 text-center">
                              <p className="text-[9px] font-black uppercase text-zinc-500">
                                Pos.
                              </p>
                              <p className={`mt-1 text-lg font-black ${premioColor(grupo.premio)}`}>
                                #{grupo.items[0]?.posicion || 1}
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/35 p-3 text-center">
                              <p className="text-[9px] font-black uppercase text-zinc-500">
                                Total
                              </p>
                              <p className={`mt-1 text-lg font-black ${premioColor(grupo.premio)}`}>
                                x{grupo.cantidad}
                              </p>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[34px] border border-green-500/20 bg-[#020714] p-6 md:p-8">
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-green-300">
                  Clubes APA
                </p>

                <h2 className="mt-2 text-4xl font-black uppercase">
                  Trayectoria oficial
                </h2>
              </div>

              {trayectoria.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                  Todavía no hay clubes oficiales cargados en plantillas.
                </p>
              ) : (
                <div className="space-y-3">
                  {trayectoria.map((p) => (
                    <article
                      key={`${p.id}-${p.equipo}`}
                      className={`rounded-2xl border p-5 ${
                        p.estado === "baja"
                          ? "border-red-400/15 bg-red-400/5"
                          : "border-green-400/20 bg-green-400/10"
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-2xl font-black uppercase text-white">
                            {p.equipo || "Sin equipo"}
                          </h3>

                          <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                            {p.temporada || "-"} · {p.division || "-"} · {p.posicion || "N/D"}
                          </p>
                        </div>

                        <span
                          className={`rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${
                            p.estado === "baja"
                              ? "border-red-400/25 bg-red-400/10 text-red-300"
                              : "border-green-400/25 bg-green-400/10 text-green-300"
                          }`}
                        >
                          {p.estado === "baja" ? "Baja" : "Actual"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 md:p-8">
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                  Carrera APA
                </p>

                <h2 className="mt-2 text-4xl font-black uppercase">
                  Historial por temporada
                </h2>
              </div>

              {historial.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                  Todavía no hay estadísticas vinculadas a este PSO ID.
                </p>
              ) : (
                <div className="space-y-3">
                  {historial.map((h) => (
                    <article
                      key={`${h.temporada}-${h.division}-${h.equipo}`}
                      className="rounded-2xl border border-white/10 bg-black/35 p-5"
                    >
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_520px] lg:items-center">
                        <div>
                          <h3 className="text-2xl font-black uppercase text-white">
                            {h.equipo}
                          </h3>
                          <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                            {h.temporada} · {h.division}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                          {[
                            ["PJ", h.pj],
                            ["G", h.goles],
                            ["A", h.asistencias],
                            ["MVP", h.mvps],
                            ["ATAJ", h.atajadas],
                            [
                              "RT",
                              h.ratings > 0
                                ? (h.ratingTotal / h.ratings).toFixed(2)
                                : "-",
                            ],
                          ].map(([label, value]) => (
                            <div
                              key={String(label)}
                              className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center"
                            >
                              <p className="text-[9px] font-black uppercase text-zinc-500">
                                {label}
                              </p>
                              <p className="mt-1 text-lg font-black text-sky-300">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[34px] border border-yellow-500/20 bg-[#020714] p-6 md:p-8">
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                  Actividad de comunidad
                </p>

                <h2 className="mt-2 text-4xl font-black uppercase">
                  Predicciones
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                {[
                  ["PTS", prediccionStats.puntos],
                  ["Total", prediccionStats.total],
                  ["Exactos", prediccionStats.exactos],
                  ["Gan.", prediccionStats.ganadores],
                  ["Fallos", prediccionStats.fallos],
                  ["Pend.", prediccionStats.pendientes],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-2xl border border-white/10 bg-black/35 p-5 text-center"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      {label}
                    </p>
                    <p className="mt-3 text-3xl font-black text-yellow-300">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/entretenimiento/predicciones/ranking"
                className="mt-6 inline-flex rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
              >
                Ver ranking de predicciones
              </Link>
            </section>
          </section>

          <aside className="space-y-8">
            <section className="relative overflow-hidden rounded-[34px] border border-purple-500/20 bg-[#020714] p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,.18),transparent_42%)]" />

              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-purple-300">
                  Logros APA
                </p>

                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black uppercase">
                      Insignias
                    </h2>
                    <p className="mt-2 text-sm font-bold text-zinc-500">
                      {logrosDesbloqueados} / {logros.length} desbloqueadas
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-right">
                    <p className="text-3xl font-black text-yellow-300">
                      {porcentajeLogros}%
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-300/70">
                      Progreso
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-4 overflow-hidden rounded-full border border-white/10 bg-black/45">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-sky-400 to-yellow-300 shadow-[0_0_18px_rgba(250,204,21,.45)] transition-all duration-500"
                    style={{ width: `${porcentajeLogros}%` }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3">
                  {logros.map((logro) => (
                    <div
                      key={logro.titulo}
                      className={`group rounded-2xl border p-4 transition ${
                        logro.activo
                          ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300 shadow-[0_0_22px_rgba(250,204,21,.10)]"
                          : "border-white/10 bg-black/25 text-zinc-500 hover:border-white/20"
                      }`}
                      title={logro.descripcion}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl ${
                            logro.activo
                              ? "border-yellow-400/25 bg-yellow-400/10"
                              : "border-white/10 bg-white/[0.03] grayscale"
                          }`}
                        >
                          {logro.icono}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-black uppercase text-white">
                                {logro.titulo}
                              </p>
                              <p className="mt-1 text-xs font-bold text-zinc-500">
                                {logro.descripcion}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${
                                logro.activo
                                  ? "border-green-400/25 bg-green-400/10 text-green-300"
                                  : "border-white/10 bg-white/[0.03] text-zinc-500"
                              }`}
                            >
                              {logro.activo ? "OK" : "LOCK"}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${
                                logro.rareza === "Legendaria"
                                  ? "border-yellow-400/25 bg-yellow-400/10 text-yellow-300"
                                  : logro.rareza === "Épica"
                                    ? "border-purple-400/25 bg-purple-400/10 text-purple-300"
                                    : logro.rareza === "Rara"
                                      ? "border-sky-400/25 bg-sky-400/10 text-sky-300"
                                      : "border-green-400/25 bg-green-400/10 text-green-300"
                              }`}
                            >
                              {logro.rareza}
                            </span>

                            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                              {logro.activo ? "Desbloqueada" : logro.textoProgreso}
                            </span>
                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/50">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                logro.activo
                                  ? "bg-gradient-to-r from-green-400 to-yellow-300"
                                  : "bg-gradient-to-r from-zinc-700 to-zinc-500"
                              }`}
                              style={{ width: `${logro.activo ? 100 : logro.progreso}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Dream Team
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Participación
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-5 text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-500">Votos</p>
                  <p className="mt-3 text-4xl font-black text-sky-300">{dreamStats.votos}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-5 text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-500">Fechas</p>
                  <p className="mt-3 text-4xl font-black text-yellow-300">{dreamStats.equiposCompletos}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-[#020714] p-6">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-green-300">
                Últimos registros
              </p>

              <div className="mt-5 space-y-3">
                {stats.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                    Sin partidos registrados.
                  </p>
                ) : (
                  stats
                    .slice()
                    .reverse()
                    .slice(0, 6)
                    .map((s, index) => (
                      <article
                        key={`${s.temporada}-${s.division}-${s.equipo}-${index}`}
                        className="rounded-2xl border border-white/10 bg-black/35 p-4"
                      >
                        <p className="font-black uppercase text-white">
                          {s.equipo || "Sin equipo"}
                        </p>
                        <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          {s.temporada || "-"} · {s.division || "-"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase">
                          <span className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-sky-300">
                            G {Number(s.goals || 0)}
                          </span>
                          <span className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-yellow-300">
                            A {Number(s.assists || 0)}
                          </span>
                          <span className="rounded-xl border border-purple-400/20 bg-purple-400/10 px-3 py-2 text-purple-300">
                            MVP {Number(s.mvp || 0)}
                          </span>
                          <span className="rounded-xl border border-green-400/20 bg-green-400/10 px-3 py-2 text-green-300">
                            RT {Number(s.rating_apa || s.overallRating || 0)}
                          </span>
                        </div>
                      </article>
                    ))
                )}
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
