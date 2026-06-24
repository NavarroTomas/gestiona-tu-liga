"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Prediccion = {
  id: number;
  partido_id: string;
  temporada: string;
  division: string;
  local: string;
  visitante: string;
  prediccion: "local" | "empate" | "visitante";
  usuario: string;
  goles_local?: number | null;
  goles_visitante?: number | null;
};

type Partido = {
  id: string | number;
  partido_id?: string | null;
  local: string;
  visitante: string;
  resultado?: string | null;
  temporada: string;
  division: string;
};

type Perfil = {
  id: string;
  display_name: string | null;
  username: string | null;
  visible_role: string | null;
  avatar_url: string | null;
};

type RankingItem = {
  usuario: string;
  nombre: string;
  username: string | null;
  rol: string | null;
  puntos: number;
  exactos: number;
  ganadores: number;
  fallos: number;
  jugadas: number;
  pendientes: number;
};

const temporadas = ["Temporada 4"];

const divisiones = ["Todas", "Primera", "Segunda", "Tercera", "Cuarta"];

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

export default function RankingPrediccionesPage() {
  const [temporada, setTemporada] = useState("Todas");
  const [division, setDivision] = useState("Todas");
  const [predicciones, setPredicciones] = useState<Prediccion[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [perfiles, setPerfiles] = useState<Record<string, Perfil>>({});
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarRanking();
  }, [temporada, division]);

  async function cargarRanking() {
    setLoading(true);
    setMensaje("");

    let predQuery = supabase.from("predicciones").select("id, partido_id, local, visitante, prediccion, usuario, goles_local, goles_visitante, temporada, division, created_at");
    let partidosQuery = supabase.from("partidos").select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora");

    if (temporada !== "Todas") {
      predQuery = predQuery.eq("temporada", temporada);
      partidosQuery = partidosQuery.eq("temporada", temporada);
    }

    if (division !== "Todas") {
      predQuery = predQuery.eq("division", division);
      partidosQuery = partidosQuery.eq("division", division);
    }

    const [predRes, partidosRes] = await Promise.all([predQuery, partidosQuery]);

    if (predRes.error) {
      console.log(predRes.error);
      setMensaje("No pude cargar las predicciones.");
      setLoading(false);
      return;
    }

    if (partidosRes.error) {
      console.log(partidosRes.error);
      setMensaje("No pude cargar los partidos.");
      setLoading(false);
      return;
    }

    const predData = (predRes.data || []) as unknown as Prediccion[];
    const partidosData = (partidosRes.data || []) as unknown as Partido[];

    setPredicciones(predData);
    setPartidos(partidosData);

    const usuariosIds = Array.from(
      new Set(predData.map((p) => p.usuario).filter(Boolean)),
    );

    if (usuariosIds.length > 0) {
      const { data: perfilesData, error: perfilesError } = await supabase
        .from("profiles")
        .select("id, display_name, username, visible_role, avatar_url")
        .in("id", usuariosIds);

      if (perfilesError) {
        console.log(perfilesError);
      } else {
        const mapa: Record<string, Perfil> = {};
        (perfilesData || []).forEach((perfil: any) => {
          mapa[perfil.id] = perfil;
        });
        setPerfiles(mapa);
      }
    } else {
      setPerfiles({});
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

  const ranking = useMemo(() => {
    const tabla: Record<string, RankingItem> = {};

    predicciones.forEach((pred) => {
      const perfil = perfiles[pred.usuario];

      if (!tabla[pred.usuario]) {
        tabla[pred.usuario] = {
          usuario: pred.usuario,
          nombre:
            perfil?.display_name ||
            perfil?.username ||
            (pred.usuario ? pred.usuario.slice(0, 8) + "..." : "Usuario"),
          username: perfil?.username || null,
          rol: perfil?.visible_role || null,
          puntos: 0,
          exactos: 0,
          ganadores: 0,
          fallos: 0,
          jugadas: 0,
          pendientes: 0,
        };
      }

      const partido = partidosMap[pred.partido_id];
      const ganador = ganadorReal(partido);
      const goles = golesReales(partido);

      if (!ganador || !goles) {
        tabla[pred.usuario].pendientes += 1;
        return;
      }

      tabla[pred.usuario].jugadas += 1;

      const exacto =
        Number(pred.goles_local) === goles.local &&
        Number(pred.goles_visitante) === goles.visitante;

      if (exacto) {
        tabla[pred.usuario].puntos += 3;
        tabla[pred.usuario].exactos += 1;
        tabla[pred.usuario].ganadores += 1;
        return;
      }

      if (pred.prediccion === ganador) {
        tabla[pred.usuario].puntos += 1;
        tabla[pred.usuario].ganadores += 1;
        return;
      }

      tabla[pred.usuario].fallos += 1;
    });

    return Object.values(tabla).sort(
      (a, b) =>
        b.puntos - a.puntos ||
        b.exactos - a.exactos ||
        b.ganadores - a.ganadores ||
        b.jugadas - a.jugadas,
    );
  }, [predicciones, perfiles, partidosMap]);

  const resumen = useMemo(() => {
    return {
      usuarios: ranking.length,
      predicciones: predicciones.length,
      jugadas: ranking.reduce((acc, r) => acc + r.jugadas, 0),
      exactos: ranking.reduce((acc, r) => acc + r.exactos, 0),
    };
  }, [ranking, predicciones]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-10 text-white md:px-8">
      <section className="mx-auto max-w-[1500px] space-y-8">
        <section className="relative overflow-hidden rounded-[40px] border border-yellow-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(250,204,21,.14)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/25" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-yellow-300">
                Comunidad APA
              </p>

              <h1 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-7xl">
                Ranking de Predicciones
              </h1>

              <p className="mt-5 max-w-3xl text-zinc-300">
                Tabla pública de pronosticadores. Marcador exacto suma 3 puntos;
                ganador correcto suma 1 punto.
              </p>
            </div>

            <div className="rounded-[34px] border border-yellow-400/25 bg-black/35 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300">
                Resumen
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-black uppercase text-zinc-500">Usuarios</p>
                  <p className="mt-2 text-3xl font-black text-yellow-300">{resumen.usuarios}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-black uppercase text-zinc-500">Predicciones</p>
                  <p className="mt-2 text-3xl font-black text-sky-300">{resumen.predicciones}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-black uppercase text-zinc-500">Jugadas</p>
                  <p className="mt-2 text-3xl font-black text-green-300">{resumen.jugadas}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-black uppercase text-zinc-500">Exactos</p>
                  <p className="mt-2 text-3xl font-black text-purple-300">{resumen.exactos}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8">
          <div className="grid gap-7">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                Temporada
              </p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                {temporadas.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setTemporada(temp)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition ${
                      temporada === temp
                        ? "border-sky-300 bg-sky-400 text-black shadow-[0_0_22px_rgba(56,189,248,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                División
              </p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {divisiones.map((div) => (
                  <button
                    key={div}
                    onClick={() => setDivision(div)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition ${
                      division === div
                        ? "border-yellow-300 bg-yellow-400 text-black shadow-[0_0_22px_rgba(250,204,21,.30)]"
                        : "border-yellow-500/20 bg-black/35 text-zinc-400 hover:border-yellow-400/40 hover:text-white"
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {mensaje && (
          <section className="rounded-3xl border border-red-400/20 bg-red-400/10 p-5 text-center font-black text-red-300">
            {mensaje}
          </section>
        )}

        <section className="rounded-[34px] border border-white/10 bg-[#020714] p-4 md:p-6">
          {loading ? (
            <p className="p-10 text-center text-xl font-black uppercase tracking-[0.2em] text-sky-300">
              Cargando ranking...
            </p>
          ) : ranking.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/35 p-8 text-center text-zinc-500">
              Todavía no hay predicciones para este filtro.
            </p>
          ) : (
            <div className="space-y-3">
              {ranking.map((item, index) => (
                <article
                  key={item.usuario}
                  className={`rounded-[28px] border p-5 transition ${
                    index === 0
                      ? "border-yellow-400/35 bg-yellow-400/10 shadow-[0_0_28px_rgba(250,204,21,.12)]"
                      : "border-white/10 bg-black/30 hover:border-sky-400/25"
                  }`}
                >
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-[80px_1fr_620px] xl:items-center">
                    <div className="flex items-center gap-4 xl:block xl:text-center">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl font-black ${
                          index === 0
                            ? "border-yellow-300 bg-yellow-400 text-black"
                            : "border-sky-400/25 bg-sky-400/10 text-sky-300"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500 xl:mt-2">
                        Puesto
                      </p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/25 bg-sky-400/10 text-xl font-black text-sky-300">
                          {perfiles[item.usuario]?.avatar_url ? (
                            <img
                              src={perfiles[item.usuario].avatar_url!}
                              alt={item.nombre}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            item.nombre.slice(0, 1).toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            {item.username ? (
                              <Link
                                href={`/u/${item.username}`}
                                className="truncate text-2xl font-black uppercase transition hover:text-yellow-300"
                              >
                                {item.nombre}
                              </Link>
                            ) : (
                              <h2 className="truncate text-2xl font-black uppercase">
                                {item.nombre}
                              </h2>
                            )}

                            {item.rol && (
                              <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300">
                                {item.rol}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-3">
                            {item.username ? (
                              <Link
                                href={`/u/${item.username}`}
                                className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-xs font-black uppercase text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                              >
                                @{item.username}
                              </Link>
                            ) : (
                              <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase text-zinc-500">
                                Sin perfil público
                              </span>
                            )}

                            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase text-zinc-500">
                              {item.jugadas} partidos resueltos
                            </span>

                            {item.pendientes > 0 && (
                              <span className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-black uppercase text-sky-300">
                                {item.pendientes} pendientes
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300">
                          PTS
                        </p>
                        <p className="mt-2 text-3xl font-black text-yellow-300">
                          {item.puntos}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-purple-400/20 bg-purple-400/10 p-4 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
                          Exactos
                        </p>
                        <p className="mt-2 text-3xl font-black text-purple-300">
                          {item.exactos}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-300">
                          Gan.
                        </p>
                        <p className="mt-2 text-3xl font-black text-green-300">
                          {item.ganadores}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">
                          Fallos
                        </p>
                        <p className="mt-2 text-3xl font-black text-red-300">
                          {item.fallos}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">
                          PJ
                        </p>
                        <p className="mt-2 text-3xl font-black text-sky-300">
                          {item.jugadas}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
