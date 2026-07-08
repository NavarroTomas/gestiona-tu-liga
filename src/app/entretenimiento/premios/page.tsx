"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Competicion = "liga" | "copa_clasificatoria" | "copa_argentina" | "copa_apa" | "copa_campeones" | "playoffs";

type ContextoCompetencia = {
  id: string;
  label: string;
  competicion: Competicion;
  division?: string;
  divisionDb?: string;
  grupo?: string;
  fase?: string;
  badge: string;
};

type Partido = {
  id: string | number;
  partido_id?: string | null;
  fecha?: string | number | null;
  temporada: string;
  division?: string | null;
  competicion?: string | null;
  grupo?: string | null;
  fase?: string | null;
};

type JugadorPremio = {
  nombre: string;
  playerId: string;
  equipo: string;
  posicion: string;
  goals: number;
  assists: number;
  mvp: number;
  overallRating: number;
  score: number;
  tackles: number;
  interceptions: number;
  gKSaves: number;
  gKCatches: number;
  passes: number;
};

const temporadas = ["Temporada 4"];

const contextos: ContextoCompetencia[] = [
  {
    id: "liga-primera",
    label: "Liga · Primera",
    competicion: "liga",
    division: "primera",
    divisionDb: "Primera",
    badge: "Primera",
  },
  {
    id: "liga-segunda",
    label: "Liga · Segunda",
    competicion: "liga",
    division: "segunda",
    divisionDb: "Segunda",
    badge: "Segunda",
  },
  {
    id: "copas-grupo-a",
    label: "Clasificación · Grupo A",
    competicion: "copa_clasificatoria",
    grupo: "A",
    fase: "grupos",
    badge: "Grupo A",
  },
  {
    id: "copas-grupo-b",
    label: "Clasificación · Grupo B",
    competicion: "copa_clasificatoria",
    grupo: "B",
    fase: "grupos",
    badge: "Grupo B",
  },
  {
    id: "copas-grupo-c",
    label: "Clasificación · Grupo C",
    competicion: "copa_clasificatoria",
    grupo: "C",
    fase: "grupos",
    badge: "Grupo C",
  },
  {
    id: "copas-grupo-d",
    label: "Clasificación · Grupo D",
    competicion: "copa_clasificatoria",
    grupo: "D",
    fase: "grupos",
    badge: "Grupo D",
  },
  {
    id: "copa-argentina-octavos",
    label: "Copa Argentina · Octavos",
    competicion: "copa_argentina",
    fase: "octavos",
    badge: "Octavos",
  },
  {
    id: "copa-argentina-cuartos",
    label: "Copa Argentina · Cuartos",
    competicion: "copa_argentina",
    fase: "cuartos",
    badge: "Cuartos",
  },
  {
    id: "copa-argentina-semis",
    label: "Copa Argentina · Semifinal",
    competicion: "copa_argentina",
    fase: "semifinal",
    badge: "Semifinal",
  },
  {
    id: "copa-argentina-final",
    label: "Copa Argentina · Final",
    competicion: "copa_argentina",
    fase: "final",
    badge: "Final",
  },
  {
    id: "copa-apa-octavos",
    label: "Copa APA · Octavos",
    competicion: "copa_apa",
    fase: "octavos",
    badge: "Octavos",
  },
  {
    id: "copa-apa-cuartos",
    label: "Copa APA · Cuartos",
    competicion: "copa_apa",
    fase: "cuartos",
    badge: "Cuartos",
  },
  {
    id: "copa-apa-semis",
    label: "Copa APA · Semifinal",
    competicion: "copa_apa",
    fase: "semifinal",
    badge: "Semifinal",
  },
  {
    id: "copa-apa-final",
    label: "Copa APA · Final",
    competicion: "copa_apa",
    fase: "final",
    badge: "Final",
  },
  {
    id: "copa-campeones-semis",
    label: "Copa Campeones · Semifinal",
    competicion: "copa_campeones",
    fase: "semifinal",
    badge: "Semifinal",
  },
  {
    id: "copa-campeones-final",
    label: "Copa Campeones · Final",
    competicion: "copa_campeones",
    fase: "final",
    badge: "Final",
  },
  {
    id: "playoffs-semis",
    label: "Playoffs · Semifinal",
    competicion: "playoffs",
    fase: "semifinal",
    badge: "Semifinal",
  },
  {
    id: "playoffs-final-ascenso",
    label: "Playoffs · Final Ascenso",
    competicion: "playoffs",
    fase: "final_ascenso",
    badge: "Final Ascenso",
  },
  {
    id: "playoffs-promocion",
    label: "Playoffs · Promoción",
    competicion: "playoffs",
    fase: "promocion",
    badge: "Promoción",
  },
];

const gruposContextosPremios = [
  {
    titulo: "Liga",
    items: contextos.filter((item) => item.competicion === "liga"),
  },
  {
    titulo: "Clasificación",
    items: contextos.filter((item) => item.competicion === "copa_clasificatoria"),
  },
  {
    titulo: "Copas",
    items: contextos.filter((item) => item.competicion === "copa_argentina" || item.competicion === "copa_apa"),
  },
  {
    titulo: "Finales",
    items: contextos.filter((item) => item.competicion === "copa_campeones" || item.competicion === "playoffs"),
  },
];



const competicionesPrincipalesPremios: { value: Competicion; label: string }[] = [
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa APA" },
  { value: "copa_campeones", label: "Copa Campeones" },
  { value: "playoffs", label: "Playoffs" },
];

function valorGKSave(r: any) {
  return Number(r.gKSaves || r.gKSAVES || r.GKSaves || r.gksaves || 0);
}

function normalizarJugador(r: any): JugadorPremio {
  return {
    nombre: r.nombre || "Sin nombre",
    playerId: r.playerId || "",
    equipo: r.equipo || "Sin Club",
    posicion: r.posicion || "",
    goals: Number(r.goals || 0),
    assists: Number(r.assists || 0),
    mvp: Number(r.mvp || 0),
    overallRating: Number(r.overallRating || r.rating_apa || 0),
    score: Number(r.score || 0),
    tackles: Number(r.tackles || 0),
    interceptions: Number(r.interceptions || 0),
    gKSaves: valorGKSave(r),
    gKCatches: Number(r.gKCatches || 0),
    passes: Number(r.passes || 0),
  };
}

function esArquero(j: JugadorPremio) {
  const pos = j.posicion.toUpperCase();
  return (
    j.gKSaves > 0 ||
    j.gKCatches > 0 ||
    pos.includes("GK") ||
    pos.includes("POR")
  );
}

function esDefensor(j: JugadorPremio) {
  const pos = j.posicion.toUpperCase();
  return (
    pos.includes("CB") ||
    pos.includes("LB") ||
    pos.includes("RB") ||
    pos.includes("DEF") ||
    pos.includes("DFC") ||
    pos.includes("LI") ||
    pos.includes("LD")
  );
}

function partidoKey(partido: Partido) {
  return partido.partido_id || String(partido.id);
}

function normalizarTexto(value?: string | number | null) {
  return String(value || "").toLowerCase().trim();
}

function ordenFecha(a: string, b: string) {
  return Number(a) - Number(b);
}

function getNombreCompeticion(contexto: ContextoCompetencia) {
  if (contexto.competicion === "liga") return "Torneo de Liga";
  if (contexto.competicion === "copa_clasificatoria") return "Clasificación a Copas";
  if (contexto.competicion === "copa_argentina") return "Copa Argentina";
  if (contexto.competicion === "copa_campeones") return "Copa de Campeones";
  if (contexto.competicion === "playoffs") return "Playoffs de Ascenso";
  return "Copa APA";
}

export default function PremiosPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [contextoId, setContextoId] = useState("liga-primera");
  const [fecha, setFecha] = useState("1");
  const [fechas, setFechas] = useState<string[]>([]);
  const [jugadores, setJugadores] = useState<JugadorPremio[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);

  const contexto = contextos.find((item) => item.id === contextoId) || contextos[0];
  const nombreCompeticion = getNombreCompeticion(contexto);

  useEffect(() => {
    cargarDatos();
  }, [temporada, contextoId, fecha]);

  function aplicarFiltroContexto(query: any) {
    query = query.eq("temporada", temporada).eq("competicion", contexto.competicion);

    if (contexto.competicion === "liga") {
      query = query.in(
        "division",
        [contexto.division, contexto.divisionDb].filter(Boolean),
      );
    }

    if (contexto.competicion === "copa_clasificatoria") {
      query = query.eq("fase", "grupos").eq("grupo", contexto.grupo);
    }

    if (
      contexto.competicion === "copa_argentina" ||
      contexto.competicion === "copa_apa" ||
      contexto.competicion === "copa_campeones" ||
      contexto.competicion === "playoffs"
    ) {
      query = query.eq("fase", contexto.fase);
    }

    return query;
  }

  async function cargarDatos() {
    setCargando(true);

    let partidosQuery = supabase
      .from("partidos")
      .select("id, partido_id, fecha, temporada, division, competicion, grupo, fase")
      .order("fecha", { ascending: true });

    partidosQuery = aplicarFiltroContexto(partidosQuery);

    const { data: partidosData, error: partidosError } = await partidosQuery;

    if (partidosError) {
      console.log(partidosError);
      setJugadores([]);
      setLogos({});
      setFechas([]);
      setCargando(false);
      return;
    }

    const partidos = (partidosData || []) as unknown as Partido[];

    const fechasDisponibles = Array.from(
      new Set(partidos.map((p) => String(p.fecha || "")).filter(Boolean)),
    ).sort(ordenFecha);

    const fechaValida = fechasDisponibles.includes(fecha)
      ? fecha
      : fechasDisponibles[0] || "1";

    setFechas(fechasDisponibles);

    if (fechaValida !== fecha) {
      setFecha(fechaValida);
      setCargando(false);
      return;
    }

    const partidosFecha = partidos.filter(
      (p) => String(p.fecha || "") === String(fechaValida),
    );

    const partidoIds = partidosFecha.map(partidoKey).filter(Boolean);

    if (partidoIds.length === 0) {
      setJugadores([]);
      setLogos({});
      setCargando(false);
      return;
    }

    const { data: statsData, error: statsError } = await supabase
      .from("estadisticas_jugadores")
      .select(
        "nombre, playerId, equipo, posicion, goals, assists, mvp, overallRating, rating_apa, score, tackles, interceptions, gKSaves, gKCatches, passes, partido_id",
      )
      .in("partido_id", partidoIds);

    if (statsError) {
      console.log(statsError);
      setJugadores([]);
      setLogos({});
      setCargando(false);
      return;
    }

    const jugadoresNormalizados = (statsData || []).map(normalizarJugador);
    setJugadores(jugadoresNormalizados);

    const equipos = Array.from(
      new Set(jugadoresNormalizados.map((j) => j.equipo).filter(Boolean)),
    );

    if (equipos.length > 0) {
      const { data: clubesData, error: clubesError } = await supabase
        .from("clubes_info")
        .select("nombre, logo_url")
        .in("nombre", equipos);

      if (clubesError) {
        console.log(clubesError);
      }

      const mapLogos: Record<string, string> = {};
      (clubesData || []).forEach((e: any) => {
        if (e.nombre && e.logo_url) mapLogos[e.nombre] = e.logo_url;
      });

      setLogos(mapLogos);
    } else {
      setLogos({});
    }

    setCargando(false);
  }

  const premios = useMemo(() => {
    const ordenar = (fn: (j: JugadorPremio) => number) =>
      [...jugadores].sort((a, b) => fn(b) - fn(a))[0];

    const mvpFecha = ordenar(
      (j) => j.mvp * 1000 + j.overallRating * 10 + j.score / 100,
    );

    const goleador = ordenar((j) => j.goals * 100 + j.overallRating);
    const asistidor = ordenar(
      (j) => j.assists * 100 + j.passes / 50 + j.overallRating,
    );

    const arquero = [...jugadores]
      .filter(esArquero)
      .sort(
        (a, b) =>
          b.gKSaves + b.gKCatches * 2 + b.overallRating -
          (a.gKSaves + a.gKCatches * 2 + a.overallRating),
      )[0];

    const defensor = [...jugadores]
      .filter((j) => esDefensor(j) || j.tackles > 0 || j.interceptions > 0)
      .sort(
        (a, b) =>
          b.tackles + b.interceptions * 2 + b.overallRating -
          (a.tackles + a.interceptions * 2 + a.overallRating),
      )[0];

    const estrella = ordenar((j) => j.overallRating * 100 + j.score / 10);

    return {
      mvpFecha,
      goleador,
      asistidor,
      arquero,
      defensor,
      estrella,
    };
  }, [jugadores]);

  const topGeneral = useMemo(() => {
    return [...jugadores]
      .sort((a, b) => b.overallRating - a.overallRating || b.score - a.score)
      .slice(0, 10);
  }, [jugadores]);

  function LogoEquipo({ equipo }: { equipo?: string }) {
    const logo = equipo
      ? Object.entries(logos).find(
          ([nombre]) => normalizarTexto(nombre) === normalizarTexto(equipo),
        )?.[1]
      : "";

    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sky-400/30 bg-black shadow-[0_0_18px_rgba(56,189,248,.18)]">
        {logo ? (
          <img
            src={logo}
            alt={equipo}
            loading="lazy"
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <span className="text-xs font-black text-white">
            {(equipo || "?").slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
    );
  }

  function PremioCard({
    titulo,
    icono,
    jugador,
    metrica,
    color,
  }: {
    titulo: string;
    icono: string;
    jugador?: JugadorPremio;
    metrica: string;
    color: string;
  }) {
    const contenido = (
      <>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.10),transparent_40%)]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className={`text-xs font-black uppercase tracking-[0.28em] ${color}`}>
                {titulo}
              </p>

              <h3 className="mt-5 truncate text-3xl font-black uppercase">
                {jugador?.nombre || "-"}
              </h3>

              <p className="mt-2 truncate text-sm text-zinc-500">
                {jugador?.equipo || "Sin datos"} · {jugador?.posicion || "Sin posición"}
              </p>
            </div>

            <div className="text-5xl">{icono}</div>
          </div>

          <div className="mt-7 flex items-end justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <LogoEquipo equipo={jugador?.equipo} />

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-black">
                  Métrica
                </p>
                <p className={`truncate text-2xl font-black ${color}`}>{metrica}</p>
              </div>
            </div>

            <p className="shrink-0 text-right text-xs uppercase tracking-[0.2em] text-zinc-500">
              Fecha {fecha}
            </p>
          </div>
        </div>
      </>
    );

    if (jugador?.playerId) {
      return (
        <Link
          href={`/jugadores/${encodeURIComponent(jugador.playerId)}`}
          className="relative block overflow-hidden rounded-[34px] border border-white/10 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.10)] transition hover:scale-[1.01] hover:border-sky-400/45"
        >
          {contenido}
        </Link>
      );
    }

    return (
      <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.10)]">
        {contenido}
      </div>
    );
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-yellow-500/30 bg-[#020714] p-7 md:p-10 shadow-[0_0_55px_rgba(250,204,21,.14)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <p className="text-yellow-300 text-xs uppercase tracking-[0.45em] font-black">
                APA PSO ARGENTINA
              </p>

              <h1 className="mt-4 max-w-[850px] text-[clamp(2rem,5.3vw,4.1rem)] font-black uppercase italic leading-[0.92]">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  Premios
                </span>

                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  de la Fecha
                </span>

                <span className="mt-2 block text-[clamp(1.45rem,4vw,2.8rem)] text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,.55)]">
                  Fecha {fecha}
                </span>
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
                Reconocimientos automáticos otorgados a los mejores jugadores de cada fecha según sus estadísticas oficiales.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Jugadores
                  </p>
                  <p className="mt-1 text-2xl font-black text-sky-300">
                    {jugadores.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Competición
                  </p>
                  <p className="mt-1 font-black text-yellow-300">
                    {nombreCompeticion}
                  </p>
                </div>

                <div className="rounded-2xl border border-green-500/20 bg-black/35 px-5 py-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Contexto
                  </p>
                  <p className="mt-1 font-black text-green-400">{contexto.badge}</p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-black/35 px-5 py-4">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                    Fecha
                  </p>
                  <p className="mt-1 font-black text-purple-300">Fecha {fecha}</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex h-40 w-40 items-center justify-center rounded-full border border-yellow-400/40 bg-black/40 shadow-[0_0_35px_rgba(250,204,21,.25)]">
              <span className="text-6xl">🏆</span>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]">
          <div className="grid gap-7">
            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Temporada
              </p>

              <div className="grid grid-cols-1 gap-3">
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
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Competencia
              </p>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                {competicionesPrincipalesPremios.map((item) => {
                  const activo = contexto.competicion === item.value;
                  const primerContexto = contextos.find((ctx) => ctx.competicion === item.value);

                  return (
                    <button
                      key={item.value}
                      onClick={() => {
                        if (!primerContexto) return;
                        setContextoId(primerContexto.id);
                        setFecha("1");
                      }}
                      className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase transition-all sm:px-4 sm:py-4 sm:text-sm ${
                        activo
                          ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                          : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Subcategoría
              </p>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-5">
                {contextos
                  .filter((item) => item.competicion === contexto.competicion)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setContextoId(item.id);
                        setFecha("1");
                      }}
                      className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase transition-all sm:px-4 sm:py-4 sm:text-sm ${
                        contextoId === item.id
                          ? "border-green-300 bg-gradient-to-r from-green-400 to-emerald-600 text-black shadow-[0_0_20px_rgba(74,222,128,.35)]"
                          : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                      }`}
                    >
                      {item.badge}
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Fecha
              </p>

              {fechas.length === 0 ? (
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-4 text-sm font-black uppercase text-yellow-300">
                  No hay fechas cargadas para esta competencia.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
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
              )}
            </div>
          </div>
        </section>

        {cargando ? (
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-10 text-center text-sky-300 font-black uppercase tracking-[0.25em]">
            Cargando premios...
          </section>
        ) : jugadores.length === 0 ? (
          <section className="relative overflow-hidden rounded-[34px] border border-yellow-500/20 bg-[#020714] p-10 text-center shadow-[0_0_35px_rgba(250,204,21,.10)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,.12),transparent_45%)]" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 text-5xl">
                🏆
              </div>

              <h2 className="mt-6 text-4xl font-black uppercase">
                No hay estadísticas en esta fecha
              </h2>

              <p className="mt-4 text-zinc-400">
                Cuando cargues estadísticas de jugadores para esta fecha y competencia, los premios aparecerán automáticamente.
              </p>
            </div>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <PremioCard
                titulo="MVP de la Fecha"
                icono="⭐"
                jugador={premios.mvpFecha}
                metrica={`${premios.mvpFecha?.overallRating || 0} rating`}
                color="text-yellow-300"
              />

              <PremioCard
                titulo="Goleador"
                icono="⚽"
                jugador={premios.goleador}
                metrica={`${premios.goleador?.goals || 0} goles`}
                color="text-green-400"
              />

              <PremioCard
                titulo="Asistidor"
                icono="🎯"
                jugador={premios.asistidor}
                metrica={`${premios.asistidor?.assists || 0} asist.`}
                color="text-sky-300"
              />

              <PremioCard
                titulo="Arquero"
                icono="🧤"
                jugador={premios.arquero}
                metrica={`${premios.arquero?.gKSaves || 0} atajadas`}
                color="text-cyan-300"
              />

              <PremioCard
                titulo="Muro Defensivo"
                icono="🛡️"
                jugador={premios.defensor}
                metrica={`${(premios.defensor?.tackles || 0) + (premios.defensor?.interceptions || 0)} acciones`}
                color="text-red-300"
              />

              <PremioCard
                titulo="Estrella"
                icono="🔥"
                jugador={premios.estrella}
                metrica={`${premios.estrella?.score || 0} score`}
                color="text-orange-300"
              />
            </section>

            <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_380px]">
              <div className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
                <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black">
                  Top rendimiento
                </p>

                <h2 className="mt-3 text-3xl font-black uppercase">
                  Ranking de la Fecha
                </h2>

                <div className="mt-6 space-y-3">
                  {topGeneral.map((j, index) => (
                    <Link
                      key={`${j.playerId || j.nombre}-${index}`}
                      href={j.playerId ? `/jugadores/${encodeURIComponent(j.playerId)}` : "#"}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-sky-400/45 hover:bg-sky-400/10"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black ${
                            index === 0
                              ? "bg-yellow-400 text-black"
                              : index === 1
                                ? "bg-zinc-200 text-black"
                                : index === 2
                                  ? "bg-orange-500 text-black"
                                  : "bg-white/[0.06] text-zinc-400"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <LogoEquipo equipo={j.equipo} />

                        <div className="min-w-0">
                          <p className="truncate font-black uppercase text-white">
                            {j.nombre}
                          </p>
                          <p className="truncate text-sm text-zinc-500">
                            {j.equipo} · {j.posicion || "Sin posición"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-3xl font-black text-yellow-300">
                          {j.overallRating}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                          rating
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <aside className="space-y-6">
                <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6">
                  <p className="text-yellow-300 uppercase tracking-[0.3em] text-xs font-black">
                    Resumen
                  </p>

                  <h2 className="mt-3 text-3xl font-black uppercase">
                    Fecha {fecha}
                  </h2>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                      <span className="text-zinc-400">Jugadores evaluados</span>
                      <b className="text-sky-300">{jugadores.length}</b>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                      <span className="text-zinc-400">Competencia</span>
                      <b className="text-yellow-300">{nombreCompeticion}</b>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                      <span className="text-zinc-400">Contexto</span>
                      <b className="text-green-400">{contexto.badge}</b>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                      <span className="text-zinc-400">Goles totales</span>
                      <b className="text-green-400">
                        {jugadores.reduce((acc, j) => acc + j.goals, 0)}
                      </b>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                      <span className="text-zinc-400">Asistencias</span>
                      <b className="text-sky-300">
                        {jugadores.reduce((acc, j) => acc + j.assists, 0)}
                      </b>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                      <span className="text-zinc-400">Atajadas</span>
                      <b className="text-cyan-300">
                        {jugadores.reduce((acc, j) => acc + j.gKSaves, 0)}
                      </b>
                    </div>
                  </div>
                </section>

                <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
                  <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black">
                    Criterio
                  </p>

                  <h2 className="mt-3 text-3xl font-black uppercase">
                    Cómo se elige
                  </h2>

                  <div className="mt-5 space-y-3 text-sm text-zinc-400">
                    <p>⭐ MVP: MVP marcado + rating + score.</p>
                    <p>⚽ Goleador: más goles y rating.</p>
                    <p>🎯 Asistidor: asistencias, pases y rating.</p>
                    <p>🧤 Arquero: atajadas, atrapadas y rating.</p>
                    <p>🛡️ Defensa: tackles, intercepciones y rating.</p>
                  </div>
                </section>
              </aside>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
