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
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarPerfilPublico();
  }, [usernameParam]);

  async function cargarPerfilPublico() {
    setLoading(true);
    setMensaje("");

    const { data: perfilData, error: perfilError } = await supabase
      .from("profiles")
      .select("id,display_name,username,playerid,steam_id,bio,avatar_url,status,visible_role")
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

    let statsData: StatJugador[] = [];

    if (perfilFinal.playerid) {
      const { data, error } = await supabase
        .from("estadisticas_jugadores")
        .select("*")
        .eq("playerId", perfilFinal.playerid);

      if (error) {
        console.log(error);
      } else {
        statsData = (data || []) as StatJugador[];
      }
    }

    const { data: predDataRaw, error: predError } = await supabase
      .from("predicciones")
      .select("*")
      .eq("usuario", perfilFinal.id);

    if (predError) console.log(predError);

    const { data: dreamDataRaw, error: dreamError } = await supabase
      .from("dream_team_votos")
      .select("*")
      .eq("usuario", perfilFinal.id);

    if (dreamError) console.log(dreamError);

    const predData = (predDataRaw || []) as Prediccion[];
    const dreamData = (dreamDataRaw || []) as DreamVote[];

    setStats(statsData);
    setPredicciones(predData);
    setDreamVotes(dreamData);

    if (predData.length > 0) {
      const ids = Array.from(new Set(predData.map((p) => p.partido_id).filter(Boolean)));

      if (ids.length > 0) {
        const { data: partidosData, error: partidosError } = await supabase
          .from("partidos")
          .select("id,partido_id,resultado")
          .in("partido_id", ids);

        if (partidosError) {
          console.log(partidosError);
        } else {
          setPartidos((partidosData || []) as Partido[]);
        }
      }
    } else {
      setPartidos([]);
    }

    setLoading(false);
  }

  const partidosMap = useMemo(() => {
    const map: Record<string, Partido> = {};
    partidos.forEach((partido) => {
      map[partidoKey(partido)] = partido;
    });
    return map;
  }, [partidos]);

  const resumen = useMemo(() => {
    const partidosJugados = stats.length;
    const goles = stats.reduce((acc, s) => acc + Number(s.goals || 0), 0);
    const asistencias = stats.reduce((acc, s) => acc + Number(s.assists || 0), 0);
    const mvps = stats.reduce((acc, s) => acc + Number(s.mvp || 0), 0);
    const atajadas = stats.reduce((acc, s) => acc + Number(s.gKSaves || 0), 0);
    const atrapadas = stats.reduce((acc, s) => acc + Number(s.gKCatches || 0), 0);
    const score = stats.reduce((acc, s) => acc + Number(s.score || 0), 0);

    const ratings = stats
      .map((s) => Number(s.overallRating || 0))
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
      equipoActual: ultimo?.equipo || "Sin equipo registrado",
      temporadaActual: ultimo?.temporada || "-",
      divisionActual: ultimo?.division || "-",
      nombreJugador: ultimo?.nombre || perfil?.display_name || perfil?.username || "Jugador APA",
    };
  }, [stats, perfil]);

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

      const rating = Number(s.overallRating || 0);
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

  const logros = useMemo(() => {
    const lista: { icono: string; titulo: string; activo: boolean }[] = [
      { icono: "⚽", titulo: "Primer gol", activo: resumen.goles >= 1 },
      { icono: "🔥", titulo: "10 goles", activo: resumen.goles >= 10 },
      { icono: "🎯", titulo: "10 asistencias", activo: resumen.asistencias >= 10 },
      { icono: "⭐", titulo: "Primer MVP", activo: resumen.mvps >= 1 },
      { icono: "🧱", titulo: "Arquero registrado", activo: resumen.esArquero },
      { icono: "📊", titulo: "10 partidos", activo: resumen.partidosJugados >= 10 },
      { icono: "🔮", titulo: "Pronosticador", activo: prediccionStats.total >= 1 },
      { icono: "💫", titulo: "Votante Dream Team", activo: dreamStats.votos >= 1 },
    ];

    return lista;
  }, [resumen, prediccionStats, dreamStats]);

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
                <div className="flex h-36 w-36 items-center justify-center rounded-full border border-yellow-300/40 bg-black/45 text-6xl font-black text-yellow-300 shadow-[0_0_35px_rgba(250,204,21,.18)]">
                  {inicial}
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

                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-300">
                    PSO ID
                  </p>
                  <p className="mt-2 break-all text-lg font-black text-white">
                    {perfil.playerid || "No vinculado"}
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
            <section className="rounded-[34px] border border-purple-500/20 bg-[#020714] p-6">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-purple-300">
                Logros APA
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Insignias
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-3">
                {logros.map((logro) => (
                  <div
                    key={logro.titulo}
                    className={`rounded-2xl border p-4 ${
                      logro.activo
                        ? "border-yellow-400/25 bg-yellow-400/10 text-yellow-300"
                        : "border-white/10 bg-black/25 text-zinc-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{logro.icono}</span>
                      <span className="font-black uppercase">{logro.titulo}</span>
                    </div>
                  </div>
                ))}
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
                            RT {Number(s.overallRating || 0)}
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
