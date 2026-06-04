"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";

type PremioKey = "balon_oro" | "raiko_trophy" | "bota_oro" | "golden_boy";

type PremioConfig = {
  key: PremioKey;
  nombre: string;
  icono: string;
  descripcion: string;
};

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
  overallRating?: number | null;
  rating_apa?: number | null;
  score?: number | null;
  gKSaves?: number | null;
  gKCatches?: number | null;
};

type Perfil = {
  id: string;
  display_name: string | null;
  username: string | null;
  playerid: string | null;
  steam_id: string | null;
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
  puntos: number;
  posicion: number;
  steamId?: string | null;
  steamHours?: number | null;
  steamFound?: boolean;
  steamReason?: string | null;
  elegibleGoldenBoy?: boolean;
  motivoNoElegible?: string[];
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

const premios: PremioConfig[] = [
  {
    key: "balon_oro",
    nombre: "Balón de Oro",
    icono: "🏆",
    descripcion: "Mejor jugador general de la temporada.",
  },
  {
    key: "raiko_trophy",
    nombre: "Raiko Trophy",
    icono: "🧤",
    descripcion: "Mejor arquero de la temporada.",
  },
  {
    key: "bota_oro",
    nombre: "Bota de Oro",
    icono: "⚽",
    descripcion: "Máximo goleador de la temporada.",
  },
  {
    key: "golden_boy",
    nombre: "Golden Boy",
    icono: "⭐",
    descripcion: "Mejor promesa: máximo 2 temporadas, menos de 25 PJ y menos de 500 hs en PSO.",
  },
];

function valorGKSave(r: StatJugador) {
  return Number((r as any).gKSAVES || r.gKSaves || (r as any).gksaves || 0);
}

function valorGKCatches(r: StatJugador) {
  return Number((r as any).gKCatches || (r as any).gKCATCHES || (r as any).gkcatches || 0);
}

function normalizarPlayerId(stat: StatJugador) {
  return String(stat.playerId || stat.playerid || "").trim();
}

function nombrePremio(key: string) {
  return premios.find((p) => p.key === key)?.nombre || key;
}

function iconoPremio(key: string) {
  return premios.find((p) => p.key === key)?.icono || "🏆";
}

function calcularPuntos(premio: PremioKey, c: Omit<Candidato, "puntos" | "posicion">) {
  if (premio === "balon_oro") {
    return (
      c.goles * 3 +
      c.asistencias * 2 +
      c.mvps * 10 +
      c.ratingPromedio * 15 +
      c.score / 5
    );
  }

  if (premio === "raiko_trophy") {
    return (
      c.atajadas * 2 +
      c.atrapadas * 2 +
      c.mvps * 10 +
      c.ratingPromedio * 15
    );
  }

  if (premio === "bota_oro") {
    return (
      c.goles * 100000 +
      c.asistencias * 1000 +
      c.mvps * 100 +
      c.ratingPromedio
    );
  }

  if (premio === "golden_boy") {
    return (
      c.goles * 4 +
      c.asistencias * 3 +
      c.mvps * 8 +
      c.ratingPromedio * 10 +
      c.score / 10
    );
  }

  return 0;
}

export default function AdminPremiosPage() {
  const [temporada, setTemporada] = useState("Temporada 5");
  const [division, setDivision] = useState("Todas");
  const [premio, setPremio] = useState<PremioKey>("balon_oro");

  const [stats, setStats] = useState<StatJugador[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [premiosGuardados, setPremiosGuardados] = useState<PremioGuardado[]>([]);

  const [loading, setLoading] = useState(true);
  const [calculandoSteam, setCalculandoSteam] = useState(false);
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [steamCache, setSteamCache] = useState<Record<string, { found: boolean; hours: number; reason?: string | null }>>({});

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    setMensaje("");

    const [statsRes, profilesRes, premiosRes] = await Promise.all([
      supabase.from("estadisticas_jugadores").select("*"),
      supabase.from("profiles").select("id,display_name,username,playerid,steam_id"),
      supabase.from("premios_apa").select("*").order("created_at", { ascending: false }),
    ]);

    if (statsRes.error) {
      console.log(statsRes.error);
      setMensaje("Error cargando estadísticas: " + statsRes.error.message);
    } else {
      setStats((statsRes.data || []) as StatJugador[]);
    }

    if (profilesRes.error) {
      console.log(profilesRes.error);
      setMensaje("Error cargando perfiles: " + profilesRes.error.message);
    } else {
      setPerfiles((profilesRes.data || []) as Perfil[]);
    }

    if (premiosRes.error) {
      console.log(premiosRes.error);
      setMensaje("Error cargando premios: " + premiosRes.error.message);
    } else {
      setPremiosGuardados((premiosRes.data || []) as PremioGuardado[]);
    }

    setLoading(false);
  }

  const perfilesPorPlayerId = useMemo(() => {
    const mapa: Record<string, Perfil> = {};

    perfiles.forEach((p) => {
      const key = String(p.playerid || "").trim();
      if (key) mapa[key] = p;
    });

    return mapa;
  }, [perfiles]);

  const candidatosBase = useMemo(() => {
    const mapa: Record<string, any> = {};

    stats.forEach((s) => {
      const playerid = normalizarPlayerId(s);
      const nombre = String(s.nombre || "").trim();

      if (!playerid && !nombre) return;
      if (s.temporada !== temporada) return;
      if (division !== "Todas" && s.division !== division) return;

      const key = playerid || nombre;

      if (!mapa[key]) {
        mapa[key] = {
          playerid,
          nombre: nombre || "Jugador APA",
          equipo: s.equipo || "Sin club",
          partidos: 0,
          temporadasSet: new Set<string>(),
          goles: 0,
          asistencias: 0,
          mvps: 0,
          score: 0,
          ratingTotal: 0,
          ratings: 0,
          atajadas: 0,
          atrapadas: 0,
        };
      }

      mapa[key].partidos += 1;
      if (s.temporada) mapa[key].temporadasSet.add(s.temporada);
      mapa[key].goles += Number(s.goals || 0);
      mapa[key].asistencias += Number(s.assists || 0);
      mapa[key].mvps += Number(s.mvp || 0);
      mapa[key].score += Number(s.score || 0);
      mapa[key].atajadas += valorGKSave(s);
      mapa[key].atrapadas += valorGKCatches(s);

      const rating = Number(s.rating_apa || s.overallRating || 0);
      if (rating > 0) {
        mapa[key].ratingTotal += rating;
        mapa[key].ratings += 1;
      }

      if (s.equipo) mapa[key].equipo = s.equipo;
      if (s.nombre) mapa[key].nombre = s.nombre;
      if (playerid) mapa[key].playerid = playerid;
    });

    return Object.values(mapa).map((j: any) => {
      const base = {
        playerid: j.playerid || "",
        nombre: j.nombre,
        equipo: j.equipo,
        partidos: j.partidos,
        temporadasJugadas: j.temporadasSet.size,
        goles: j.goles,
        asistencias: j.asistencias,
        mvps: j.mvps,
        score: j.score,
        ratingPromedio:
          j.ratings > 0 ? Math.round((j.ratingTotal / j.ratings) * 100) / 100 : 0,
        atajadas: j.atajadas,
        atrapadas: j.atrapadas,
      };

      return base;
    }) as Omit<Candidato, "puntos" | "posicion">[];
  }, [stats, temporada, division]);

  const candidatos = useMemo(() => {
    let lista = candidatosBase.map((c) => {
      const perfil = perfilesPorPlayerId[c.playerid];
      const steamId = perfil?.steam_id || null;
      const steamInfo = steamId ? steamCache[steamId] : null;

      const motivoNoElegible: string[] = [];
      let elegibleGoldenBoy = true;

      if (premio === "golden_boy") {
        if (c.temporadasJugadas > 2) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("más de 2 temporadas");
        }

        if (c.partidos >= 25) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("25 o más PJ");
        }

        if (!steamId) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("sin SteamID");
        } else if (!steamInfo) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("horas sin consultar");
        } else if (!steamInfo.found) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("horas no verificables");
        } else if (steamInfo.hours >= 500) {
          elegibleGoldenBoy = false;
          motivoNoElegible.push("500 hs o más");
        }
      }

      const item: Candidato = {
        ...c,
        puntos: Math.round(calcularPuntos(premio, c) * 10) / 10,
        posicion: 0,
        steamId,
        steamFound: steamInfo?.found,
        steamHours: steamInfo?.hours,
        steamReason: steamInfo?.reason || null,
        elegibleGoldenBoy,
        motivoNoElegible,
      };

      return item;
    });

    if (premio === "raiko_trophy") {
      lista = lista.filter((c) => c.atajadas > 0 || c.atrapadas > 0);
    }

    if (premio === "golden_boy") {
      lista = lista.filter((c) => c.elegibleGoldenBoy);
    }

    lista = lista
      .filter((c) => c.playerid)
      .sort((a, b) => b.puntos - a.puntos)
      .map((c, index) => ({
        ...c,
        posicion: index + 1,
      }));

    return lista;
  }, [candidatosBase, perfilesPorPlayerId, premio, steamCache]);

  const candidatosNoElegiblesGoldenBoy = useMemo(() => {
    if (premio !== "golden_boy") return [];

    return candidatosBase
      .map((c) => {
        const perfil = perfilesPorPlayerId[c.playerid];
        const steamId = perfil?.steam_id || null;
        const steamInfo = steamId ? steamCache[steamId] : null;

        const motivoNoElegible: string[] = [];

        if (c.temporadasJugadas > 2) motivoNoElegible.push("más de 2 temporadas");
        if (c.partidos >= 25) motivoNoElegible.push("25 o más PJ");
        if (!steamId) motivoNoElegible.push("sin SteamID");
        else if (!steamInfo) motivoNoElegible.push("horas sin consultar");
        else if (!steamInfo.found) motivoNoElegible.push("horas no verificables");
        else if (steamInfo.hours >= 500) motivoNoElegible.push("500 hs o más");

        return {
          ...c,
          steamId,
          steamFound: steamInfo?.found,
          steamHours: steamInfo?.hours,
          motivoNoElegible,
        };
      })
      .filter((c) => c.motivoNoElegible.length > 0)
      .slice(0, 10);
  }, [candidatosBase, perfilesPorPlayerId, premio, steamCache]);

  async function consultarHorasSteam() {
    if (premio !== "golden_boy") return;

    setCalculandoSteam(true);
    setMensaje("");

    const steamIds = Array.from(
      new Set(
        candidatosBase
          .map((c) => perfilesPorPlayerId[c.playerid]?.steam_id)
          .filter(Boolean) as string[],
      ),
    );

    if (steamIds.length === 0) {
      setMensaje("No hay SteamID cargados para consultar.");
      setCalculandoSteam(false);
      return;
    }

    const nuevoCache = { ...steamCache };

    for (const steamId of steamIds) {
      if (nuevoCache[steamId]) continue;

      try {
        const res = await fetch(`/api/steam/hours?steamId=${encodeURIComponent(steamId)}`, {
          cache: "no-store",
        });

        const data = await res.json();

        nuevoCache[steamId] = {
          found: !!data.found,
          hours: Number(data.hours || 0),
          reason: data.reason || null,
        };
      } catch (error) {
        console.log(error);
        nuevoCache[steamId] = {
          found: false,
          hours: 0,
          reason: "No se pudo consultar Steam.",
        };
      }
    }

    setSteamCache(nuevoCache);
    setCalculandoSteam(false);
  }

  async function asignarGanador(candidato: Candidato) {
    if (!candidato.playerid) {
      setMensaje("Este candidato no tiene PlayerId.");
      return;
    }

    const confirmar = window.confirm(
      `¿Asignar ${iconoPremio(premio)} ${nombrePremio(premio)} a ${candidato.nombre}?`,
    );

    if (!confirmar) return;

    setGuardandoId(candidato.playerid);
    setMensaje("");

    const { error } = await supabase.from("premios_apa").insert({
      temporada,
      division: division === "Todas" ? null : division,
      premio,
      playerid: candidato.playerid,
      nombre: candidato.nombre,
      equipo: candidato.equipo,
      puntos: candidato.puntos,
      posicion: candidato.posicion,
    });

    setGuardandoId(null);

    if (error) {
      console.log(error);
      setMensaje("Error guardando premio: " + error.message);
      return;
    }

    setMensaje("Premio asignado correctamente.");
    await cargarDatos();
  }

  async function borrarPremio(id: number) {
    const confirmar = window.confirm("¿Borrar este premio?");
    if (!confirmar) return;

    const { error } = await supabase.from("premios_apa").delete().eq("id", id);

    if (error) {
      console.log(error);
      setMensaje("Error borrando premio: " + error.message);
      return;
    }

    setMensaje("Premio borrado.");
    await cargarDatos();
  }

  const premioActual = premios.find((p) => p.key === premio) || premios[0];

  return (
    <PermissionGuard permission="titles.manage">
      <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
        <section className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
          <section className="relative overflow-hidden rounded-[28px] border border-yellow-500/30 bg-[#020714] p-5 shadow-[0_0_55px_rgba(250,204,21,.16)] sm:rounded-[38px] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_42%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/25" />

            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300 sm:text-xs sm:tracking-[0.45em]">
                Premios APA
              </p>

              <h1 className="mt-4 text-[clamp(2.3rem,8vw,5rem)] font-black uppercase italic leading-none">
                Trofeos individuales
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base md:text-lg">
                Seleccioná temporada y premio. APA calcula automáticamente los candidatos y el staff solamente confirma al ganador.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[460px_1fr]">
            <aside className="space-y-6">
              <section className="rounded-[28px] border border-yellow-500/20 bg-[#020714] p-5 shadow-[0_0_35px_rgba(250,204,21,.10)] sm:rounded-[34px] md:p-6">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                  Configuración
                </p>

                <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                  Seleccionar premio
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
                    <select
                      value={premio}
                      onChange={(e) => setPremio(e.target.value as PremioKey)}
                      className="w-full rounded-2xl border border-yellow-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-yellow-400/60"
                    >
                      {premios.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.icono} {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                    <p className="text-4xl">{premioActual.icono}</p>
                    <h3 className="mt-3 text-2xl font-black uppercase">
                      {premioActual.nombre}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {premioActual.descripcion}
                    </p>
                  </div>

                  {premio === "golden_boy" && (
                    <button
                      type="button"
                      onClick={consultarHorasSteam}
                      disabled={calculandoSteam || loading}
                      className="w-full rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {calculandoSteam ? "Consultando Steam..." : "Consultar horas Steam"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={cargarDatos}
                    disabled={loading}
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-sm font-black uppercase text-zinc-300 transition hover:border-yellow-400/40 hover:text-white disabled:opacity-50"
                  >
                    Actualizar datos
                  </button>

                  {mensaje && (
                    <p className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm font-black text-yellow-300">
                      {mensaje}
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-6">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                  Premios cargados
                </p>

                <h2 className="mt-3 text-2xl font-black uppercase">
                  Historial
                </h2>

                <div className="mt-5 space-y-3">
                  {premiosGuardados.length === 0 ? (
                    <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                      Todavía no hay premios cargados.
                    </p>
                  ) : (
                    premiosGuardados.map((p) => (
                      <article
                        key={p.id}
                        className="rounded-2xl border border-white/10 bg-black/35 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-lg font-black uppercase text-white">
                              {iconoPremio(p.premio)} {nombrePremio(p.premio)}
                            </p>
                            <p className="mt-1 truncate text-sm font-black uppercase tracking-[0.12em] text-yellow-300">
                              {p.nombre}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {p.temporada}
                              {p.division ? ` · ${p.division}` : ""} · {p.equipo || "Sin club"} · {Number(p.puntos || 0).toFixed(1)} pts
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => borrarPremio(p.id)}
                            className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-[10px] font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                          >
                            Borrar
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </aside>

            <section className="rounded-[28px] border border-yellow-500/20 bg-[#020714] p-5 shadow-[0_0_35px_rgba(250,204,21,.10)] sm:rounded-[34px] md:p-6">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                    Ranking automático
                  </p>

                  <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                    {premioActual.icono} Candidatos
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    {temporada} {division !== "Todas" ? `· ${division}` : "· Todas las divisiones"}
                  </p>
                </div>

                <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-xs font-black text-yellow-300">
                  {candidatos.length} candidatos
                </span>
              </div>

              {loading ? (
                <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                  Cargando datos...
                </p>
              ) : premio === "golden_boy" && Object.keys(steamCache).length === 0 ? (
                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-5">
                  <p className="font-black uppercase text-sky-300">
                    Primero consultá las horas de Steam.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Golden Boy necesita verificar automáticamente que el jugador tenga menos de 500 horas de Pro Soccer Online.
                  </p>
                </div>
              ) : candidatos.length === 0 ? (
                <div className="space-y-4">
                  <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                    No hay candidatos para este premio con los filtros actuales.
                  </p>

                  {premio === "golden_boy" && candidatosNoElegiblesGoldenBoy.length > 0 && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-5">
                      <p className="font-black uppercase text-red-300">
                        Jugadores descartados
                      </p>

                      <div className="mt-4 space-y-2">
                        {candidatosNoElegiblesGoldenBoy.map((c) => (
                          <div
                            key={c.playerid || c.nombre}
                            className="rounded-xl border border-red-400/10 bg-black/25 p-3 text-sm"
                          >
                            <p className="font-black text-white">{c.nombre}</p>
                            <p className="text-red-200">
                              {c.motivoNoElegible.join(", ")}
                              {typeof c.steamHours === "number" ? ` · ${c.steamHours} hs` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {candidatos.slice(0, 10).map((c) => (
                    <article
                      key={c.playerid}
                      className="rounded-[24px] border border-white/10 bg-black/35 p-4 transition hover:border-yellow-400/35 hover:bg-yellow-400/5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
                              c.posicion === 1
                                ? "bg-yellow-400 text-black"
                                : c.posicion === 2
                                  ? "bg-zinc-200 text-black"
                                  : c.posicion === 3
                                    ? "bg-orange-500 text-black"
                                    : "bg-white/10 text-zinc-400"
                            }`}
                          >
                            {c.posicion}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xl font-black uppercase text-white">
                              {c.nombre}
                            </p>
                            <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
                              {c.equipo} · {c.partidos} PJ · RT {c.ratingPromedio}
                            </p>

                            {premio === "golden_boy" && (
                              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-sky-300">
                                {typeof c.steamHours === "number"
                                  ? `${c.steamHours} hs PSO`
                                  : "Horas no consultadas"}
                                {" · "}
                                {c.temporadasJugadas} temp.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 md:w-[410px] md:grid-cols-6">
                          {[
                            ["G", c.goles],
                            ["A", c.asistencias],
                            ["MVP", c.mvps],
                            ["SCORE", c.score],
                            ["ATAJ", c.atajadas],
                            ["PTS", c.puntos.toFixed(1)],
                          ].map(([label, value]) => (
                            <div
                              key={String(label)}
                              className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-center"
                            >
                              <p className="text-[9px] font-black uppercase text-zinc-500">
                                {label}
                              </p>
                              <p className="mt-1 text-sm font-black text-yellow-300">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => asignarGanador(c)}
                        disabled={guardandoId === c.playerid}
                        className="mt-4 w-full rounded-2xl border border-yellow-400/30 bg-yellow-400 px-5 py-3 text-xs font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {guardandoId === c.playerid ? "Guardando..." : "Asignar ganador"}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>
        </section>
      </main>
    </PermissionGuard>
  );
}
