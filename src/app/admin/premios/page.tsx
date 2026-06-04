"use client";

import { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import { supabase } from "@/lib/supabase";

type PremioTipo = "balon_oro" | "raiko_trophy" | "bota_oro" | "golden_boy";

type StatJugador = {
  nombre: string | null;
  playerId?: string | null;
  playerid?: string | null;
  equipo: string | null;
  temporada: string | null;
  division: string | null;
  goals?: number | null;
  assists?: number | null;
  mvp?: number | null;
  score?: number | null;
  rating_apa?: number | null;
  overallRating?: number | null;
  gKSaves?: number | null;
  gKSAVES?: number | null;
  gksaves?: number | null;
  gKCatches?: number | null;
  gKCATCHES?: number | null;
  gkcatches?: number | null;
};

type PerfilHoras = {
  id: string;
  playerid: string | null;
  steam_hours?: number | null;
};

type Candidato = {
  playerid: string;
  nombre: string;
  equipo: string;
  partidos: number;
  temporadasJugadas: number;
  goles: number;
  asistencias: number;
  mvps: number;
  score: number;
  ratingPromedio: number;
  atajadas: number;
  atrapadas: number;
  steam_hours: number;
  puntos: number;
};

type PremioGuardado = {
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

const temporadas = [
  "Temporada 1",
  "Temporada 2",
  "Temporada 3",
  "Temporada 4",
  "Temporada 5",
  "Temporada 6",
];

const divisiones = ["Todas", "Primera", "Segunda", "Tercera", "Cuarta"];

const premios: { id: PremioTipo; nombre: string; icono: string; descripcion: string }[] = [
  {
    id: "balon_oro",
    nombre: "Balón de Oro",
    icono: "🏆",
    descripcion: "Mejor jugador general de la temporada por rendimiento completo.",
  },
  {
    id: "raiko_trophy",
    nombre: "Raiko Trophy",
    icono: "🧤",
    descripcion: "Mejor arquero de la temporada según estadísticas de GK.",
  },
  {
    id: "bota_oro",
    nombre: "Bota de Oro",
    icono: "⚽",
    descripcion: "Máximo goleador de la temporada con desempates automáticos.",
  },
  {
    id: "golden_boy",
    nombre: "Golden Boy",
    icono: "⭐",
    descripcion: "Mejor promesa: máximo 2 temporadas, menos de 25 partidos y menos de 500 horas Steam.",
  },
];

function normalizarPlayerId(row: StatJugador) {
  return String(row.playerId || row.playerid || "").trim();
}

function valorNumero(valor: unknown) {
  const n = Number(valor || 0);
  return Number.isFinite(n) ? n : 0;
}

function valorGKSave(row: StatJugador) {
  return valorNumero(row.gKSaves || row.gKSAVES || row.gksaves);
}

function valorGKCatches(row: StatJugador) {
  return valorNumero(row.gKCatches || row.gKCATCHES || row.gkcatches);
}

function premioLabel(tipo: string) {
  return premios.find((p) => p.id === tipo)?.nombre || tipo;
}

function premioIcono(tipo: string) {
  return premios.find((p) => p.id === tipo)?.icono || "🏆";
}

function calcularPuntos(tipo: PremioTipo, c: Omit<Candidato, "puntos">) {
  if (tipo === "balon_oro") {
    return c.goles * 3 + c.asistencias * 2 + c.mvps * 10 + c.ratingPromedio * 15 + c.score / 5;
  }

  if (tipo === "raiko_trophy") {
    return c.atajadas * 2 + c.atrapadas * 2 + c.mvps * 10 + c.ratingPromedio * 15;
  }

  if (tipo === "bota_oro") {
    return c.goles * 100000 + c.asistencias * 1000 + c.mvps * 100 + c.ratingPromedio;
  }

  return c.goles * 4 + c.asistencias * 3 + c.mvps * 8 + c.ratingPromedio * 10 + c.score / 10;
}

export default function AdminPremiosPage() {
  const [temporada, setTemporada] = useState("Temporada 5");
  const [division, setDivision] = useState("Todas");
  const [premio, setPremio] = useState<PremioTipo>("balon_oro");
  const [stats, setStats] = useState<StatJugador[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilHoras[]>([]);
  const [premiosGuardados, setPremiosGuardados] = useState<PremioGuardado[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    setMensaje("");

    const [statsResult, perfilesResult, premiosResult] = await Promise.all([
      supabase.from("estadisticas_jugadores").select("*"),
      supabase.from("profiles").select("id, playerid, steam_hours"),
      supabase.from("premios_apa").select("*").order("created_at", { ascending: false }),
    ]);

    if (statsResult.error) {
      console.log(statsResult.error);
      setMensaje("Error cargando estadísticas: " + statsResult.error.message);
    } else {
      setStats((statsResult.data || []) as StatJugador[]);
    }

    if (perfilesResult.error) {
      console.log(perfilesResult.error);
      setMensaje("Error cargando perfiles: " + perfilesResult.error.message);
    } else {
      setPerfiles((perfilesResult.data || []) as PerfilHoras[]);
    }

    if (premiosResult.error) {
      console.log(premiosResult.error);
      setMensaje("Error cargando premios: " + premiosResult.error.message);
    } else {
      setPremiosGuardados((premiosResult.data || []) as PremioGuardado[]);
    }

    setLoading(false);
  }

  const horasPorPlayerId = useMemo(() => {
    const map: Record<string, number> = {};

    perfiles.forEach((perfil) => {
      const playerid = String(perfil.playerid || "").trim();
      if (!playerid) return;
      map[playerid] = valorNumero(perfil.steam_hours);
    });

    return map;
  }, [perfiles]);

  const candidatos = useMemo(() => {
    const mapa: Record<string, Omit<Candidato, "puntos"> & { ratingTotal: number; ratings: number; temporadasSet: Set<string> }> = {};

    stats.forEach((row) => {
      if (String(row.temporada || "") !== temporada) return;
      if (division !== "Todas" && String(row.division || "") !== division) return;

      const playerid = normalizarPlayerId(row);
      const nombre = String(row.nombre || "").trim();
      if (!playerid && !nombre) return;

      const key = playerid || nombre;

      if (!mapa[key]) {
        mapa[key] = {
          playerid,
          nombre: nombre || "Jugador APA",
          equipo: row.equipo || "Sin equipo",
          partidos: 0,
          temporadasJugadas: 0,
          goles: 0,
          asistencias: 0,
          mvps: 0,
          score: 0,
          ratingPromedio: 0,
          atajadas: 0,
          atrapadas: 0,
          steam_hours: playerid ? horasPorPlayerId[playerid] || 0 : 0,
          ratingTotal: 0,
          ratings: 0,
          temporadasSet: new Set<string>(),
        };
      }

      mapa[key].partidos += 1;
      mapa[key].goles += valorNumero(row.goals);
      mapa[key].asistencias += valorNumero(row.assists);
      mapa[key].mvps += valorNumero(row.mvp);
      mapa[key].score += valorNumero(row.score);
      mapa[key].atajadas += valorGKSave(row);
      mapa[key].atrapadas += valorGKCatches(row);
      if (row.equipo) mapa[key].equipo = row.equipo;
      if (row.nombre) mapa[key].nombre = row.nombre;
      if (playerid) mapa[key].playerid = playerid;
      if (row.temporada) mapa[key].temporadasSet.add(row.temporada);

      const rating = valorNumero(row.rating_apa || row.overallRating);
      if (rating > 0) {
        mapa[key].ratingTotal += rating;
        mapa[key].ratings += 1;
      }
    });

    let lista = Object.values(mapa).map((item) => {
      const base = {
        playerid: item.playerid,
        nombre: item.nombre,
        equipo: item.equipo,
        partidos: item.partidos,
        temporadasJugadas: item.temporadasSet.size,
        goles: item.goles,
        asistencias: item.asistencias,
        mvps: item.mvps,
        score: item.score,
        ratingPromedio: item.ratings > 0 ? item.ratingTotal / item.ratings : 0,
        atajadas: item.atajadas,
        atrapadas: item.atrapadas,
        steam_hours: item.playerid ? horasPorPlayerId[item.playerid] || 0 : 0,
      };

      return {
        ...base,
        puntos: calcularPuntos(premio, base),
      };
    });

    if (premio === "raiko_trophy") {
      lista = lista.filter((c) => c.atajadas > 0 || c.atrapadas > 0);
    }

    if (premio === "golden_boy") {
      lista = lista.filter(
        (c) => c.temporadasJugadas <= 2 && c.partidos < 25 && c.steam_hours < 500,
      );
    }

    if (premio === "bota_oro") {
      return lista
        .filter((c) => c.goles > 0)
        .sort((a, b) => {
          if (b.goles !== a.goles) return b.goles - a.goles;
          if (b.asistencias !== a.asistencias) return b.asistencias - a.asistencias;
          if (b.mvps !== a.mvps) return b.mvps - a.mvps;
          return b.ratingPromedio - a.ratingPromedio;
        })
        .slice(0, 10);
    }

    return lista.sort((a, b) => b.puntos - a.puntos).slice(0, 10);
  }, [stats, temporada, division, premio, horasPorPlayerId]);

  async function asignarGanador(candidato: Candidato, posicion: number) {
    if (!candidato.playerid) {
      setMensaje("Este candidato no tiene PlayerId. No se puede asignar el premio.");
      return;
    }

    const divisionFinal = division === "Todas" ? null : division;

    const yaExiste = premiosGuardados.find(
      (p) =>
        p.temporada === temporada &&
        (p.division || null) === divisionFinal &&
        p.premio === premio,
    );

    if (yaExiste) {
      const reemplazar = window.confirm(
        `Ya existe ${premioLabel(premio)} para ${temporada}${divisionFinal ? ` · ${divisionFinal}` : ""}. ¿Querés reemplazarlo?`,
      );

      if (!reemplazar) return;

      const { error: deleteError } = await supabase
        .from("premios_apa")
        .delete()
        .eq("id", yaExiste.id);

      if (deleteError) {
        console.log(deleteError);
        setMensaje("Error reemplazando premio: " + deleteError.message);
        return;
      }
    }

    setGuardando(true);
    setMensaje("");

    const { error } = await supabase.from("premios_apa").insert({
      temporada,
      division: divisionFinal,
      premio,
      playerid: candidato.playerid,
      nombre: candidato.nombre,
      equipo: candidato.equipo,
      puntos: Number(candidato.puntos.toFixed(2)),
      posicion,
    });

    setGuardando(false);

    if (error) {
      console.log(error);
      setMensaje("Error guardando premio: " + error.message);
      return;
    }

    setMensaje(`${premioLabel(premio)} asignado a ${candidato.nombre}.`);
    await cargarDatos();
  }

  async function borrarPremio(premioGuardado: PremioGuardado) {
    const ok = window.confirm(
      `¿Borrar ${premioLabel(premioGuardado.premio)} de ${premioGuardado.nombre}?`,
    );

    if (!ok) return;

    const { error } = await supabase.from("premios_apa").delete().eq("id", premioGuardado.id);

    if (error) {
      console.log(error);
      setMensaje("Error borrando premio: " + error.message);
      return;
    }

    setMensaje("Premio borrado.");
    await cargarDatos();
  }

  const premioActual = premios.find((p) => p.id === premio) || premios[0];

  return (
    <PermissionGuard permission="titles.manage">
      <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
        <section className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
          <section className="relative overflow-hidden rounded-[28px] border border-yellow-500/30 bg-[#020714] p-5 shadow-[0_0_55px_rgba(250,204,21,.18)] sm:rounded-[38px] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_42%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/25" />

            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300 sm:text-xs sm:tracking-[0.45em]">
                Historia APA
              </p>

              <h1 className="mt-4 text-[clamp(2.3rem,8vw,5rem)] font-black uppercase italic leading-none">
                Premios APA
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base md:text-lg">
                Calculá candidatos automáticamente y asigná ganadores oficiales sin escribir nombres ni PlayerId a mano.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
            <aside className="rounded-[28px] border border-yellow-500/20 bg-[#020714] p-5 shadow-[0_0_35px_rgba(250,204,21,.10)] sm:rounded-[34px] md:p-6">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                Configuración
              </p>

              <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                Elegir premio
              </h2>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                    Temporada
                  </label>
                  <select
                    value={temporada}
                    onChange={(e) => setTemporada(e.target.value)}
                    className="w-full rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-yellow-400/60"
                  >
                    {temporadas.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                    División
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-yellow-400/60"
                  >
                    {divisiones.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                    Premio
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {premios.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPremio(p.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          premio === p.id
                            ? "border-yellow-400/45 bg-yellow-400/15 text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,.12)]"
                            : "border-white/10 bg-black/35 text-zinc-400 hover:border-yellow-400/25 hover:text-white"
                        }`}
                      >
                        <p className="text-lg font-black uppercase">
                          {p.icono} {p.nombre}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          {p.descripcion}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={cargarDatos}
                  disabled={loading}
                  className="w-full rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-4 text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black disabled:opacity-50"
                >
                  {loading ? "Calculando..." : "Recalcular candidatos"}
                </button>

                {mensaje && (
                  <p className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm font-black text-yellow-300">
                    {mensaje}
                  </p>
                )}
              </div>
            </aside>

            <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 shadow-[0_0_35px_rgba(0,120,255,.10)] sm:rounded-[34px] md:p-6">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                    Candidatos automáticos
                  </p>
                  <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                    {premioActual.icono} {premioActual.nombre}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    {temporada} {division !== "Todas" ? `· ${division}` : "· Todas las divisiones"}
                  </p>
                </div>

                <span className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-black uppercase text-sky-300">
                  Top {candidatos.length}
                </span>
              </div>

              {loading ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                  Calculando candidatos...
                </p>
              ) : candidatos.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                  No hay candidatos para este filtro. En Golden Boy recordá cargar steam_hours en profiles.
                </p>
              ) : (
                <div className="space-y-3">
                  {candidatos.map((candidato, index) => (
                    <article
                      key={`${candidato.playerid || candidato.nombre}-${index}`}
                      className="rounded-[24px] border border-white/10 bg-black/35 p-4 transition hover:border-yellow-400/30"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
                              index === 0
                                ? "bg-yellow-400 text-black shadow-[0_0_18px_rgba(250,204,21,.35)]"
                                : index === 1
                                  ? "bg-zinc-200 text-black"
                                  : index === 2
                                    ? "bg-orange-500 text-black"
                                    : "bg-white/[0.06] text-zinc-400"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-xl font-black uppercase text-white">
                              {candidato.nombre}
                            </h3>
                            <p className="mt-1 truncate text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                              {candidato.equipo} · {candidato.playerid || "Sin PlayerId"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:min-w-[520px]">
                          <Dato label="PTS" value={candidato.puntos.toFixed(1)} color="text-yellow-300" />
                          <Dato label="PJ" value={candidato.partidos} color="text-sky-300" />
                          <Dato label="G" value={candidato.goles} color="text-emerald-300" />
                          <Dato label="A" value={candidato.asistencias} color="text-cyan-300" />
                          <Dato label="MVP" value={candidato.mvps} color="text-purple-300" />
                          <Dato label="RT" value={candidato.ratingPromedio.toFixed(2)} color="text-pink-300" />
                        </div>
                      </div>

                      {premio === "raiko_trophy" && (
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <Dato label="Atajadas" value={candidato.atajadas} color="text-cyan-300" />
                          <Dato label="Atrapadas" value={candidato.atrapadas} color="text-sky-300" />
                        </div>
                      )}

                      {premio === "golden_boy" && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <Dato label="Temporadas" value={candidato.temporadasJugadas} color="text-yellow-300" />
                          <Dato label="Oficiales" value={candidato.partidos} color="text-sky-300" />
                          <Dato label="Horas" value={candidato.steam_hours} color="text-emerald-300" />
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={guardando || !candidato.playerid}
                        onClick={() => asignarGanador(candidato, index + 1)}
                        className="mt-4 w-full rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-3 text-xs font-black uppercase text-yellow-300 transition hover:bg-yellow-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {guardando ? "Guardando..." : `Asignar ganador #${index + 1}`}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#020714] p-5 shadow-[0_0_35px_rgba(0,120,255,.10)] sm:rounded-[34px] md:p-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                  Historial
                </p>
                <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                  Premios cargados
                </h2>
              </div>

              <span className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-xs font-black uppercase text-yellow-300">
                {premiosGuardados.length} premios
              </span>
            </div>

            {premiosGuardados.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                Todavía no hay premios cargados.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {premiosGuardados.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[24px] border border-white/10 bg-black/35 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <p className="text-xl font-black uppercase text-white">
                          {premioIcono(item.premio)} {premioLabel(item.premio)}
                        </p>
                        <p className="mt-2 text-2xl font-black uppercase text-yellow-300">
                          {item.nombre}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                          {item.temporada}{item.division ? ` · ${item.division}` : ""} · {item.equipo || "Sin equipo"}
                        </p>
                        <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-sky-300">
                          #{item.posicion || "-"} · {Number(item.puntos || 0).toFixed(1)} pts
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => borrarPremio(item)}
                        className="rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-xs font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                      >
                        Borrar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </PermissionGuard>
  );
}

function Dato({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 text-sm font-black sm:text-base ${color}`}>{value}</p>
    </div>
  );
}
