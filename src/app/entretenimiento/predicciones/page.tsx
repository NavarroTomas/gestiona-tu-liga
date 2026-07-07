"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Competicion = "liga" | "copa_clasificatoria" | "copa_argentina" | "copa_apa";

type Contexto = {
  id: string;
  label: string;
  short: string;
  competicion: Competicion;
  division?: string;
  divisionDb?: string;
  grupo?: string;
  fase?: string;
};

const temporadas = ["Temporada 4"];

const contextos: Contexto[] = [
  { id: "liga-primera", label: "Liga · Primera", short: "Primera", competicion: "liga", division: "primera", divisionDb: "Primera" },
  { id: "liga-segunda", label: "Liga · Segunda", short: "Segunda", competicion: "liga", division: "segunda", divisionDb: "Segunda" },
  { id: "clasificacion-a", label: "Clasificación · Grupo A", short: "Grupo A", competicion: "copa_clasificatoria", fase: "grupos", grupo: "A" },
  { id: "clasificacion-b", label: "Clasificación · Grupo B", short: "Grupo B", competicion: "copa_clasificatoria", fase: "grupos", grupo: "B" },
  { id: "clasificacion-c", label: "Clasificación · Grupo C", short: "Grupo C", competicion: "copa_clasificatoria", fase: "grupos", grupo: "C" },
  { id: "clasificacion-d", label: "Clasificación · Grupo D", short: "Grupo D", competicion: "copa_clasificatoria", fase: "grupos", grupo: "D" },
  { id: "copa-argentina-octavos", label: "Copa Argentina · Octavos", short: "Octavos", competicion: "copa_argentina", fase: "octavos" },
  { id: "copa-argentina-cuartos", label: "Copa Argentina · Cuartos", short: "Cuartos", competicion: "copa_argentina", fase: "cuartos" },
  { id: "copa-argentina-semis", label: "Copa Argentina · Semifinal", short: "Semifinal", competicion: "copa_argentina", fase: "semifinal" },
  { id: "copa-argentina-final", label: "Copa Argentina · Final", short: "Final", competicion: "copa_argentina", fase: "final" },
  { id: "copa-apa-octavos", label: "Copa APA · Octavos", short: "Octavos", competicion: "copa_apa", fase: "octavos" },
  { id: "copa-apa-cuartos", label: "Copa APA · Cuartos", short: "Cuartos", competicion: "copa_apa", fase: "cuartos" },
  { id: "copa-apa-semis", label: "Copa APA · Semifinal", short: "Semifinal", competicion: "copa_apa", fase: "semifinal" },
  { id: "copa-apa-final", label: "Copa APA · Final", short: "Final", competicion: "copa_apa", fase: "final" },
];

type Partido = {
  id: number | string;
  partido_id?: string | null;
  local: string;
  visitante: string;
  resultado?: string | null;
  fecha?: string | number | null;
  temporada: string;
  division?: string | null;
  competicion?: string | null;
  fase?: string | null;
  grupo?: string | null;
  dia?: string | null;
  hora?: string | null;
};

type Prediccion = {
  id: number;
  partido_id: string;
  temporada: string;
  division?: string | null;
  local: string;
  visitante: string;
  prediccion: "local" | "empate" | "visitante";
  usuario: string;
  goles_local?: number | null;
  goles_visitante?: number | null;
};

type PerfilPrediccion = {
  id: string;
  display_name: string | null;
  username: string | null;
};

function partidoKey(partido: Partido) {
  return partido.partido_id || String(partido.id);
}

function esPendiente(partido: Partido) {
  const resultado = String(partido.resultado || "").trim();
  return !resultado || resultado === "-" || resultado.toLowerCase() === "null";
}

function golesReales(partido?: Partido | null) {
  const resultado = String(partido?.resultado || "").trim();
  if (!resultado.includes("-")) return null;

  const [a, b] = resultado.split("-").map((n) => Number(n.trim()));
  if (Number.isNaN(a) || Number.isNaN(b)) return null;

  return { local: a, visitante: b };
}

function ganadorReal(partido?: Partido | null): "local" | "empate" | "visitante" | null {
  const goles = golesReales(partido);
  if (!goles) return null;
  if (goles.local > goles.visitante) return "local";
  if (goles.visitante > goles.local) return "visitante";
  return "empate";
}

function divisionParaGuardar(contexto: Contexto) {
  if (contexto.competicion === "liga") return contexto.divisionDb || contexto.division || "Liga";
  if (contexto.competicion === "copa_clasificatoria") return `Grupo ${contexto.grupo}`;
  return contexto.fase || contexto.short;
}

function normalizarFecha(value: any) {
  return String(value || "").trim();
}

export default function PrediccionesPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [contextoId, setContextoId] = useState("liga-primera");
  const [fechaActiva, setFechaActiva] = useState("Todas");
  const [usuarioId, setUsuarioId] = useState("");
  const [miPerfil, setMiPerfil] = useState<PerfilPrediccion | null>(null);
  const [perfiles, setPerfiles] = useState<Record<string, PerfilPrediccion>>({});
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [predicciones, setPredicciones] = useState<Prediccion[]>([]);
  const [marcadores, setMarcadores] = useState<Record<string, { local: string; visitante: string }>>({});
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  const contexto = contextos.find((c) => c.id === contextoId) || contextos[0];

  useEffect(() => {
    setFechaActiva("Todas");
  }, [temporada, contextoId]);

  useEffect(() => {
    cargarDatos();
  }, [temporada, contextoId]);

  function aplicarFiltroContexto(query: any) {
    query = query.eq("temporada", temporada).eq("competicion", contexto.competicion);

    if (contexto.competicion === "liga") {
      query = query.in("division", [contexto.division, contexto.divisionDb].filter(Boolean));
    }

    if (contexto.competicion === "copa_clasificatoria") {
      query = query.eq("fase", "grupos").eq("grupo", contexto.grupo);
    }

    if (contexto.competicion === "copa_argentina" || contexto.competicion === "copa_apa") {
      query = query.eq("fase", contexto.fase);
    }

    return query;
  }

  async function cargarDatos() {
    setCargando(true);
    setMensaje("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUsuarioId(user.id);
      const { data: perfilData } = await supabase
        .from("profiles")
        .select("id, display_name, username")
        .eq("id", user.id)
        .maybeSingle();
      setMiPerfil((perfilData || null) as PerfilPrediccion | null);
    } else {
      setUsuarioId("");
      setMiPerfil(null);
    }

    let partidosQuery = supabase
      .from("partidos")
      .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, competicion, fase, grupo, dia, hora")
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    partidosQuery = aplicarFiltroContexto(partidosQuery);

    const { data: partidosData, error: partidosError } = await partidosQuery;

    if (partidosError) {
      console.log(partidosError);
      setPartidos([]);
      setPredicciones([]);
      setCargando(false);
      return;
    }

    const partidosLimpios = ((partidosData || []) as unknown as Partido[]).sort((a, b) => {
      const fechaA = Number(a.fecha || 999);
      const fechaB = Number(b.fecha || 999);
      if (fechaA !== fechaB) return fechaA - fechaB;
      return String(a.hora || "99:99").localeCompare(String(b.hora || "99:99"));
    });

    setPartidos(partidosLimpios);

    const partidoIds = partidosLimpios.map(partidoKey).filter(Boolean);

    if (partidoIds.length === 0) {
      setPredicciones([]);
      setPerfiles({});
      setCargando(false);
      return;
    }

    const { data: predData, error: predError } = await supabase
      .from("predicciones")
      .select("id, partido_id, temporada, division, local, visitante, prediccion, usuario, goles_local, goles_visitante")
      .in("partido_id", partidoIds);

    if (predError) {
      console.log(predError);
      setPredicciones([]);
      setCargando(false);
      return;
    }

    const prediccionesData = (predData || []) as unknown as Prediccion[];
    setPredicciones(prediccionesData);

    const usuariosIds = Array.from(new Set(prediccionesData.map((p) => p.usuario).filter(Boolean)));

    if (usuariosIds.length > 0) {
      const { data: perfilesData, error: perfilesError } = await supabase
        .from("public_profiles")
        .select("id, display_name, username")
        .in("id", usuariosIds);

      if (perfilesError) {
        console.log(perfilesError);
        setPerfiles({});
      } else {
        const mapa: Record<string, PerfilPrediccion> = {};
        (perfilesData || []).forEach((perfil: any) => {
          mapa[perfil.id] = perfil;
        });
        setPerfiles(mapa);
      }
    } else {
      setPerfiles({});
    }

    setCargando(false);
  }

  const fechas = useMemo(() => {
    const lista = Array.from(new Set(partidos.map((p) => normalizarFecha(p.fecha)).filter(Boolean))).sort((a, b) => Number(a) - Number(b));
    return ["Todas", ...lista];
  }, [partidos]);

  function puntosPrediccion(pred: Prediccion) {
    const partido = partidos.find((p) => partidoKey(p) === pred.partido_id);
    const ganador = ganadorReal(partido);
    const goles = golesReales(partido);
    if (!ganador || !goles) return 0;

    const exacto = Number(pred.goles_local) === goles.local && Number(pred.goles_visitante) === goles.visitante;
    if (exacto) return 3;
    if (ganador === pred.prediccion) return 1;
    return 0;
  }

  function estadoPrediccion(pred: Prediccion) {
    const partido = partidos.find((p) => partidoKey(p) === pred.partido_id);
    const ganador = ganadorReal(partido);
    const goles = golesReales(partido);

    if (!partido) return { texto: "Sin partido", puntos: 0, clase: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400" };
    if (!ganador || !goles) return { texto: "⏳ Pendiente", puntos: 0, clase: "border-sky-500/20 bg-sky-500/10 text-sky-300" };

    const puntos = puntosPrediccion(pred);
    if (puntos === 3) return { texto: "✅ Exacto", puntos, clase: "border-yellow-400/25 bg-yellow-400/10 text-yellow-300" };
    if (puntos === 1) return { texto: "✅ Ganador", puntos, clase: "border-green-400/25 bg-green-400/10 text-green-300" };
    return { texto: "❌ Fallaste", puntos: 0, clase: "border-red-400/25 bg-red-400/10 text-red-300" };
  }

  function resultadoRealTexto(partidoId: string) {
    const partido = partidos.find((p) => partidoKey(p) === partidoId);
    const goles = golesReales(partido);
    if (!partido || !goles) return "Pendiente";
    return `${goles.local}-${goles.visitante}`;
  }

  const partidosFiltrados = useMemo(() => {
    return partidos
      .filter((p) => esPendiente(p))
      .filter((p) => fechaActiva === "Todas" || normalizarFecha(p.fecha) === fechaActiva);
  }, [partidos, fechaActiva]);

  const partidosJugados = useMemo(() => partidos.filter((p) => ganadorReal(p)), [partidos]);

  const ranking = useMemo(() => {
    const tabla: Record<string, { usuario: string; puntos: number; exactos: number; aciertos: number; jugadas: number }> = {};

    predicciones.forEach((pred) => {
      if (!tabla[pred.usuario]) tabla[pred.usuario] = { usuario: pred.usuario, puntos: 0, exactos: 0, aciertos: 0, jugadas: 0 };

      const partido = partidos.find((p) => partidoKey(p) === pred.partido_id);
      const ganador = ganadorReal(partido);
      const goles = golesReales(partido);
      if (!ganador || !goles) return;

      tabla[pred.usuario].jugadas += 1;
      const puntos = puntosPrediccion(pred);
      tabla[pred.usuario].puntos += puntos;
      if (puntos === 3) {
        tabla[pred.usuario].exactos += 1;
        tabla[pred.usuario].aciertos += 1;
      } else if (puntos === 1) {
        tabla[pred.usuario].aciertos += 1;
      }
    });

    return Object.values(tabla).sort((a, b) => b.puntos - a.puntos || b.exactos - a.exactos || b.aciertos - a.aciertos).slice(0, 10);
  }, [predicciones, partidos]);

  const resumenGlobal = useMemo(() => ({
    partidos: partidosFiltrados.length,
    votos: predicciones.length,
    usuarios: new Set(predicciones.map((p) => p.usuario)).size,
    jugados: partidosJugados.length,
  }), [partidosFiltrados, predicciones, partidosJugados]);

  function votosDelPartido(partido: Partido) {
    const key = partidoKey(partido);
    return predicciones.filter((p) => p.partido_id === key);
  }

  function porcentaje(partido: Partido, tipo: "local" | "empate" | "visitante") {
    const votos = votosDelPartido(partido);
    if (votos.length === 0) return 0;
    const cantidad = votos.filter((v) => v.prediccion === tipo).length;
    return Math.round((cantidad / votos.length) * 100);
  }

  function votoUsuario(partido: Partido) {
    const key = partidoKey(partido);
    if (!usuarioId) return undefined;
    return predicciones.find((p) => p.partido_id === key && p.usuario === usuarioId);
  }

  function nombreUsuario(userId: string) {
    const perfil = perfiles[userId];
    return perfil?.display_name || perfil?.username || (userId ? userId.slice(0, 8) + "..." : "Usuario");
  }

  function prediccionPorMarcador(local: number, visitante: number): "local" | "empate" | "visitante" {
    if (local > visitante) return "local";
    if (visitante > local) return "visitante";
    return "empate";
  }

  async function votar(partido: Partido, prediccionManual?: "local" | "empate" | "visitante") {
    setMensaje("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMensaje("Tenés que iniciar sesión para hacer una predicción.");
      return;
    }

    const key = partidoKey(partido);
    const yaVoto = predicciones.some((p) => p.partido_id === key && p.usuario === user.id);
    if (yaVoto) {
      setMensaje("Ya realizaste una predicción para este partido y no puede modificarse.");
      return;
    }

    const marcador = marcadores[key] || { local: "", visitante: "" };
    const tieneMarcador = marcador.local !== "" && marcador.visitante !== "" && !Number.isNaN(Number(marcador.local)) && !Number.isNaN(Number(marcador.visitante));
    const golesLocal = tieneMarcador ? Number(marcador.local) : null;
    const golesVisitante = tieneMarcador ? Number(marcador.visitante) : null;
    const prediccion = tieneMarcador && golesLocal !== null && golesVisitante !== null ? prediccionPorMarcador(golesLocal, golesVisitante) : prediccionManual;

    if (!prediccion) {
      setMensaje("Elegí ganador o cargá un marcador exacto.");
      return;
    }

    const { error } = await supabase.from("predicciones").insert([
      {
        partido_id: key,
        temporada,
        division: divisionParaGuardar(contexto),
        local: partido.local,
        visitante: partido.visitante,
        prediccion,
        usuario: user.id,
        goles_local: golesLocal,
        goles_visitante: golesVisitante,
      },
    ]);

    if (error) {
      console.log(error);
      setMensaje("Error guardando predicción.");
      return;
    }

    setMensaje("Predicción guardada correctamente.");
    await cargarDatos();
  }

  function actualizarMarcador(partido: Partido, lado: "local" | "visitante", valor: string) {
    const key = partidoKey(partido);
    setMarcadores((prev) => ({ ...prev, [key]: { local: prev[key]?.local || "", visitante: prev[key]?.visitante || "", [lado]: valor } }));
  }

  function textoPrediccion(partido: Partido, prediccion: "local" | "empate" | "visitante") {
    if (prediccion === "local") return partido.local;
    if (prediccion === "visitante") return partido.visitante;
    return "Empate";
  }

  function favoritoComunidad(partido: Partido) {
    const opciones = [
      { tipo: "local" as const, nombre: partido.local, porcentaje: porcentaje(partido, "local") },
      { tipo: "empate" as const, nombre: "Empate", porcentaje: porcentaje(partido, "empate") },
      { tipo: "visitante" as const, nombre: partido.visitante, porcentaje: porcentaje(partido, "visitante") },
    ];
    return opciones.sort((a, b) => b.porcentaje - a.porcentaje)[0];
  }

  function Barra({ label, value }: { label: string; value: number }) {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="text-zinc-500">{label}</span>
          <span className="text-sky-300">{value}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-700 shadow-[0_0_12px_rgba(56,189,248,.45)]" style={{ width: `${value}%` }} />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-[28px] border border-yellow-500/30 bg-[#020714] p-5 shadow-[0_0_55px_rgba(250,204,21,.12)] sm:rounded-[38px] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300 sm:text-xs sm:tracking-[0.45em]">APA PSO ARGENTINA</p>
              <h1 className="mt-4 text-[clamp(2.5rem,9vw,5rem)] font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">Predicciones</span>
                <span className="block text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,.55)]">Marcador Exacto</span>
              </h1>
              <p className="mt-5 max-w-2xl text-zinc-400">Pronosticá ganador o marcador exacto. Ganador correcto suma 1 punto; marcador exacto suma 3 puntos.</p>

              <div className="mt-6">
                <Link href="/entretenimiento/predicciones/ranking" className="inline-flex items-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-yellow-300 transition hover:bg-yellow-400 hover:text-black">
                  🏆 Ver Ranking de Pronosticadores
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                <Info label="Cuenta" value={usuarioId ? miPerfil?.display_name || miPerfil?.username || "Usuario APA" : "Iniciá sesión"} color="text-yellow-300" />
                <Info label="Disponibles" value={resumenGlobal.partidos} color="text-sky-300" />
                <Info label="Votos" value={resumenGlobal.votos} color="text-yellow-300" />
                <Info label="Usuarios" value={resumenGlobal.usuarios} color="text-green-400" />
              </div>
            </div>

            <div className="hidden h-32 w-32 items-center justify-center rounded-full border border-yellow-400/40 bg-black/40 shadow-[0_0_35px_rgba(250,204,21,.25)] lg:flex xl:h-40 xl:w-40">
              <span className="text-6xl">🎯</span>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-sky-500/25 bg-[#020714] p-5 shadow-[0_0_35px_rgba(0,120,255,.12)] sm:rounded-[34px] md:p-8">
          <div className="grid gap-7">
            <Filtro label="Temporada" items={temporadas} value={temporada} setValue={setTemporada} color="sky" />
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-yellow-300">Competencia / División / Grupo / Fase</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {contextos.map((ctx) => (
                  <button key={ctx.id} onClick={() => setContextoId(ctx.id)} className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase transition-all sm:px-4 sm:py-4 sm:text-sm ${contextoId === ctx.id ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]" : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"}`}>
                    {ctx.label}
                  </button>
                ))}
              </div>
            </div>
            <Filtro label="Fecha" items={fechas} value={fechaActiva} setValue={setFechaActiva} color="green" />
          </div>
        </section>

        {mensaje && <section className="rounded-3xl border border-yellow-500/20 bg-black/35 p-5 text-center font-black text-yellow-300">{mensaje}</section>}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px] xl:gap-8">
          <div className="space-y-6">
            <section>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">Partidos disponibles</p>
              <h2 className="mt-3 text-[clamp(1.8rem,7vw,3rem)] font-black uppercase">
                {temporada}<span className="text-sky-400"> / </span>{contexto.label}
              </h2>
              <p className="mt-3 text-zinc-500">Solo aparecen partidos sin resultado cargado.</p>
            </section>

            {cargando ? (
              <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-6 text-center font-black uppercase tracking-[0.25em] text-sky-300 sm:p-10">Cargando predicciones...</section>
            ) : partidosFiltrados.length === 0 ? (
              <section className="relative overflow-hidden rounded-[28px] border border-yellow-500/20 bg-[#020714] p-6 text-center shadow-[0_0_35px_rgba(250,204,21,.10)] sm:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,.12),transparent_45%)]" />
                <div className="relative z-10 mx-auto max-w-2xl">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 text-5xl">🎯</div>
                  <h2 className="mt-6 text-4xl font-black uppercase">No hay partidos para predecir</h2>
                  <p className="mt-4 text-zinc-400">Cargá partidos futuros sin resultado para este contexto y van a aparecer acá.</p>
                </div>
              </section>
            ) : (
              <section className="grid grid-cols-1 gap-6">
                {partidosFiltrados.map((partido) => {
                  const key = partidoKey(partido);
                  const miVoto = votoUsuario(partido);
                  const votosTotal = votosDelPartido(partido).length;
                  const favorito = favoritoComunidad(partido);
                  const marcadorActual = marcadores[key] || { local: "", visitante: "" };

                  return (
                    <article key={key} className="relative overflow-hidden rounded-[28px] border border-sky-500/20 bg-[#020714] p-4 shadow-[0_0_30px_rgba(0,120,255,.10)] sm:rounded-[34px] sm:p-6">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.11),transparent_40%)]" />
                      <div className="relative z-10">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">{contexto.short} · Fecha {partido.fecha || "-"}</p>
                            <h3 className="mt-3 text-2xl font-black uppercase sm:text-3xl">{partido.local}<span className="text-sky-400"> vs </span>{partido.visitante}</h3>
                            <p className="mt-2 text-zinc-500">{partido.dia || "Sin día"} · {partido.hora || "Sin hora"}</p>
                          </div>
                          <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-5 py-3 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300">Favorito APA</p>
                            <p className="text-xl font-black text-yellow-300">{favorito?.nombre || "-"}</p>
                            <p className="text-xs text-zinc-500">{favorito?.porcentaje || 0}% · {votosTotal} votos</p>
                          </div>
                        </div>

                        <div className="mt-6 rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5">
                          <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-yellow-300">Marcador exacto</p>
                          <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_90px_40px_90px_1fr]">
                            <p className="truncate text-center font-black uppercase md:text-right">{partido.local}</p>
                            <input type="number" min="0" value={marcadorActual.local} onChange={(e) => actualizarMarcador(partido, "local", e.target.value)} className="rounded-2xl border border-yellow-400/25 bg-black/50 px-3 py-3 text-center text-2xl font-black text-white outline-none" />
                            <p className="text-center text-2xl font-black text-yellow-300">-</p>
                            <input type="number" min="0" value={marcadorActual.visitante} onChange={(e) => actualizarMarcador(partido, "visitante", e.target.value)} className="rounded-2xl border border-yellow-400/25 bg-black/50 px-3 py-3 text-center text-2xl font-black text-white outline-none" />
                            <p className="truncate text-center font-black uppercase md:text-left">{partido.visitante}</p>
                          </div>
                          <button type="button" disabled={!!miVoto} onClick={() => votar(partido)} className="mt-4 w-full rounded-2xl bg-yellow-400 px-4 py-4 text-sm font-black uppercase tracking-[0.2em] text-black disabled:cursor-not-allowed disabled:opacity-50">Guardar marcador exacto</button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                          {(["local", "empate", "visitante"] as const).map((tipo) => {
                            const activo = miVoto?.prediccion === tipo && miVoto?.goles_local == null;
                            return (
                              <button key={tipo} disabled={!!miVoto} onClick={() => votar(partido, tipo)} className={`rounded-2xl border px-4 py-4 text-center transition disabled:cursor-not-allowed disabled:opacity-50 ${activo ? "border-yellow-300 bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]" : "border-sky-500/20 bg-black/35 text-zinc-300 hover:border-yellow-300/60 hover:text-white"}`}>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{tipo === "local" ? "Gana local" : tipo === "visitante" ? "Gana visita" : "Empate"}</p>
                                <p className="mt-2 truncate text-lg font-black uppercase">{textoPrediccion(partido, tipo)}</p>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-6 space-y-4">
                          <Barra label={partido.local} value={porcentaje(partido, "local")} />
                          <Barra label="Empate" value={porcentaje(partido, "empate")} />
                          <Barra label={partido.visitante} value={porcentaje(partido, "visitante")} />
                        </div>

                        {miVoto && <p className="mt-5 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm font-black text-green-300">Tu voto: {textoPrediccion(partido, miVoto.prediccion)}{miVoto.goles_local != null && miVoto.goles_visitante != null ? ` · ${miVoto.goles_local}-${miVoto.goles_visitante}` : ""}</p>}
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">Ranking</p>
              <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">Pronosticadores</h2>
              <p className="mt-2 text-zinc-500">Exacto = 3 pts · Ganador = 1 pt.</p>
              <div className="mt-5 space-y-3">
                {ranking.length === 0 ? <p className="rounded-2xl border border-white/10 bg-black/35 p-4 text-zinc-500">Todavía no hay puntos.</p> : ranking.map((r, index) => (
                  <div key={r.usuario} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                    <div>
                      <p className="font-black uppercase text-white">{index + 1}. {nombreUsuario(r.usuario)}</p>
                      <p className="text-xs text-zinc-500">{r.aciertos}/{r.jugadas} aciertos · {r.exactos} exactos</p>
                    </div>
                    <p className="text-2xl font-black text-yellow-300 sm:text-3xl">{r.puntos}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">Mis predicciones</p>
              <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">{usuarioId ? miPerfil?.display_name || miPerfil?.username || "Usuario" : "Sin sesión"}</h2>
              <div className="mt-5 space-y-3">
                {!usuarioId ? <p className="rounded-2xl border border-white/10 bg-black/35 p-4 text-zinc-500">Iniciá sesión para ver tus predicciones.</p> : predicciones.filter((p) => p.usuario === usuarioId).length === 0 ? <p className="rounded-2xl border border-white/10 bg-black/35 p-4 text-zinc-500">Todavía no votaste.</p> : predicciones.filter((p) => p.usuario === usuarioId).slice(0, 8).map((p) => {
                  const estado = estadoPrediccion(p);
                  return (
                    <div key={p.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-center font-black uppercase md:text-left">{p.local} vs {p.visitante}</p>
                          <p className="mt-1 text-sm text-yellow-300">Voto: {p.prediccion}{p.goles_local != null && p.goles_visitante != null ? ` · ${p.goles_local}-${p.goles_visitante}` : ""}</p>
                          <p className="mt-1 text-xs text-zinc-500">Resultado real: {resultadoRealTexto(p.partido_id)}</p>
                        </div>
                        <div className={`shrink-0 rounded-xl border px-3 py-2 text-center text-xs font-black uppercase ${estado.clase}`}><p>{estado.texto}</p><p className="mt-1 text-lg">{estado.puntos}</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className={`mt-1 truncate text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}

function Filtro({ label, items, value, setValue, color }: { label: string; items: string[]; value: string; setValue: (v: string) => void; color: "sky" | "green" }) {
  const active = color === "green" ? "border-green-300 bg-gradient-to-r from-green-400 to-emerald-600 text-black shadow-[0_0_20px_rgba(74,222,128,.35)]" : "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]";
  return (
    <div>
      <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">{label}</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {items.map((item) => (
          <button key={item} onClick={() => setValue(item)} className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase transition-all sm:px-4 sm:py-4 sm:text-sm ${value === item ? active : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"}`}>
            {item === "Todas" ? "Todas" : label === "Fecha" ? `Fecha ${item}` : item}
          </button>
        ))}
      </div>
    </div>
  );
}
