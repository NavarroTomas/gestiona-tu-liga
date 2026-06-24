"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Partido {
  id: string;
  local: string;
  visitante: string;
  resultado: string;
  fecha: string;
  partido_id?: string | null;
  dia?: string | null;
  hora?: string | null;
  temporada?: string | null;
  division?: string | null;
}

interface EstadisticasJugador {
  jugador: string;
  playerId: string;
  goles: number;
  asistencias: number;
  mvps: number;
}

interface ClubVisual {
  nombre: string;
  slug: string;
  logo_url?: string | null;
  banner_url?: string | null;
  descripcion?: string | null;
  color_principal?: string | null;
}

interface PlantillaClub {
  jugador: string;
  playerid: string;
  equipo: string;
  posicion?: string;
  estado?: string;
}

interface EquipoTemporada {
  nombre: string;
  temporada: string;
  division: string;
  club_slug?: string | null;
}

type ResultadoEquipo = "G" | "E" | "P" | "-";

export default function PaginaEquipo() {
  const params = useParams();

  const nombreEquipoUrl = params?.nombre
    ? decodeURIComponent(params.nombre as string)
    : "";

  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [plantel, setPlantel] = useState<EstadisticasJugador[]>([]);
  const [clubVisual, setClubVisual] = useState<ClubVisual | null>(null);
  const [equipoTemporada, setEquipoTemporada] =
    useState<EquipoTemporada | null>(null);
  const [loading, setLoading] = useState(true);
  const [nombreRealEquipo, setNombreRealEquipo] = useState(nombreEquipoUrl);
  const [posicionLiga, setPosicionLiga] = useState<number | null>(null);
  const [titulos, setTitulos] = useState<any[]>([]);

  const [stats, setStats] = useState({
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    puntos: 0,
    racha: [] as ResultadoEquipo[],
  });

  useEffect(() => {
    if (!nombreEquipoUrl) return;
    fetchDatosEquipo();
  }, [nombreEquipoUrl]);

  async function fetchDatosEquipo() {
    try {
      setLoading(true);

      const { data: equiposData, error: equiposError } = await supabase
        .from("equipos")
        .select("id, nombre, puntos, pj, temporada, division, logo_url, banner_url, descripcion, color_principal, club_slug");

      if (equiposError) {
        console.log(equiposError);
        return;
      }

      const equipoEncontrado = equiposData?.find(
        (e: any) => e.nombre?.toLowerCase() === nombreEquipoUrl.toLowerCase(),
      );

      const nombreExacto = equipoEncontrado?.nombre || nombreEquipoUrl;

      setNombreRealEquipo(nombreExacto);
      setEquipoTemporada(equipoEncontrado || null);

      if (equipoEncontrado?.temporada && equipoEncontrado?.division) {
        const tablaCompetencia = (equiposData || [])
          .filter(
            (e: any) =>
              e.temporada === equipoEncontrado.temporada &&
              e.division === equipoEncontrado.division,
          )
          .sort((a: any, b: any) => {
            const puntosA = Number(a.puntos || 0);
            const puntosB = Number(b.puntos || 0);
            if (puntosB !== puntosA) return puntosB - puntosA;
            return String(a.nombre || "").localeCompare(String(b.nombre || ""));
          });

        const posicion = tablaCompetencia.findIndex(
          (e: any) => e.nombre?.toLowerCase() === nombreExacto.toLowerCase(),
        );

        setPosicionLiga(posicion >= 0 ? posicion + 1 : null);
      } else {
        setPosicionLiga(null);
      }

      if (equipoEncontrado?.club_slug) {
        const { data: clubData, error: clubError } = await supabase
          .from("clubes_info")
          .select("id, nombre, slug, logo_url, banner_url, descripcion, color_principal, created_at, updated_at")
          .eq("slug", equipoEncontrado.club_slug)
          .single();

        if (clubError) {
          console.log(clubError);
        } else {
          setClubVisual(clubData);
        }
      }

      const { data: titulosData } = await supabase
        .from("titulos")
        .select("id, equipo, competicion, temporada, division, descripcion, created_at")
        .ilike("equipo", nombreExacto);

      setTitulos(titulosData || []);

      const { data: partidosData } = await supabase.from("partidos").select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora");

      const partidosDelEquipo = (partidosData || []).filter(
        (p: any) =>
          p.local?.toLowerCase() === nombreExacto.toLowerCase() ||
          p.visitante?.toLowerCase() === nombreExacto.toLowerCase(),
      );

      setPartidos(partidosDelEquipo);

      const { data: jugadoresData } = await supabase
        .from("jugadores")
        .select("id, nombre, playerId, equipo, goles, asistencias, mvps, temporada, division");

      const { data: plantillasData } = await supabase
        .from("plantillas")
        .select("id, jugador, playerid, steam_id, profile_id, equipo, posicion, temporada, division, estado")
        .eq("equipo", nombreExacto)
        .neq("estado", "baja");

      const playerIdsActivos = new Set(
        (plantillasData || []).map((p: any) => String(p.playerid || "").trim()),
      );

      const jugadoresFiltrados = (jugadoresData || []).filter((j: any) => {
        const pid = String(j.playerId || j.player_id || "").trim();
        return playerIdsActivos.has(pid);
      });

      const mapaAgrupado: { [key: string]: EstadisticasJugador } = {};

      jugadoresFiltrados.forEach((j: any) => {
        const playerId = String(j.playerId || j.player_id || "").trim();
        const nombreJugador = String(
          j.jugador || j.nombre || j.playerName || "Sin Nombre",
        ).trim();

        if (!playerId && !nombreJugador) return;

        const clave = playerId || nombreJugador;

        if (!mapaAgrupado[clave]) {
          mapaAgrupado[clave] = {
            jugador: nombreJugador || "Sin Nombre",
            playerId: playerId || encodeURIComponent(nombreJugador),
            goles: 0,
            asistencias: 0,
            mvps: 0,
          };
        }

        mapaAgrupado[clave].goles += Number(j.goles ?? j.goals ?? 0) || 0;
        mapaAgrupado[clave].asistencias +=
          Number(j.asistencias ?? j.assists ?? 0) || 0;
        mapaAgrupado[clave].mvps += Number(j.mvps ?? 0) || 0;
      });

      setPlantel(
        Object.values(mapaAgrupado).sort((a, b) => {
          if (b.goles !== a.goles) return b.goles - a.goles;
          if (b.asistencias !== a.asistencias) return b.asistencias - a.asistencias;
          return b.mvps - a.mvps;
        }),
      );

      let pj = 0;
      let pg = 0;
      let pe = 0;
      let pp = 0;
      let gf = 0;
      let gc = 0;
      let puntos = 0;
      const rachaAux: ResultadoEquipo[] = [];

      partidosDelEquipo.forEach((partido: any) => {
        if (!partido.resultado || !partido.resultado.includes("-")) return;

        const golesLocal = parseInt(partido.resultado.split("-")[0].trim());
        const golesVisitante = parseInt(partido.resultado.split("-")[1].trim());

        if (isNaN(golesLocal) || isNaN(golesVisitante)) return;

        pj++;

        const esLocal =
          partido.local?.toLowerCase() === nombreExacto.toLowerCase();

        const golesFavor = esLocal ? golesLocal : golesVisitante;
        const golesContra = esLocal ? golesVisitante : golesLocal;

        gf += golesFavor;
        gc += golesContra;

        if (golesFavor > golesContra) {
          pg++;
          puntos += 3;
          rachaAux.push("G");
        } else if (golesFavor === golesContra) {
          pe++;
          puntos += 1;
          rachaAux.push("E");
        } else {
          pp++;
          rachaAux.push("P");
        }
      });

      setStats({
        pj,
        pg,
        pe,
        pp,
        gf,
        gc,
        puntos,
        racha: rachaAux.slice(-5),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function iniciales(nombre?: string) {
    if (!nombre) return "CL";

    return nombre
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  }

  function parsePartido(partido: Partido) {
    const partes = partido.resultado ? partido.resultado.split("-") : ["-", "-"];
    const golesLocal = Number(partes[0]?.trim());
    const golesVisitante = Number(partes[1]?.trim());
    const tieneResultado = !isNaN(golesLocal) && !isNaN(golesVisitante);

    const esLocal = partido.local?.toLowerCase() === nombreRealEquipo.toLowerCase();
    const golesFavor = esLocal ? golesLocal : golesVisitante;
    const golesContra = esLocal ? golesVisitante : golesLocal;

    let estado: ResultadoEquipo = "-";
    let texto = "Pendiente";

    if (tieneResultado) {
      if (golesFavor > golesContra) {
        estado = "G";
        texto = "Victoria";
      } else if (golesFavor === golesContra) {
        estado = "E";
        texto = "Empate";
      } else {
        estado = "P";
        texto = "Derrota";
      }
    }

    return {
      golesLocal: tieneResultado ? golesLocal : "-",
      golesVisitante: tieneResultado ? golesVisitante : "-",
      estado,
      texto,
      esLocal,
    };
  }

  function claseResultado(resultado: ResultadoEquipo) {
    if (resultado === "G") {
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    }

    if (resultado === "E") {
      return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
    }

    if (resultado === "P") {
      return "border-red-400/30 bg-red-400/10 text-red-300";
    }

    return "border-white/10 bg-white/[0.04] text-zinc-400";
  }

  const topGoleador = plantel[0];

  const topAsistidor = [...plantel].sort(
    (a, b) => b.asistencias - a.asistencias,
  )[0];

  const topMvp = [...plantel].sort((a, b) => b.mvps - a.mvps)[0];

  const colorPrincipal = clubVisual?.color_principal || "#38bdf8";
  const diferenciaGol = stats.gf - stats.gc;
  const figuraClub = topGoleador || topAsistidor || topMvp;

  const proximosPartidos = partidos.filter(
    (p) => !p.resultado || !p.resultado.includes("-"),
  );

  const proximoPartido = proximosPartidos[0];

  const palmaresAgrupado = titulos.reduce((acc: Record<string, number>, t: any) => {
    const key = t.competicion || "Título";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const totalTitulos = titulos.length;

  const ultimosPartidos = partidos
    .filter((p) => p.resultado && p.resultado.includes("-"))
    .slice(-5)
    .reverse();

  function textoPosicion(posicion: number | null) {
    if (!posicion) return "Sin posición";
    if (posicion === 1) return "👑 Líder";
    if (posicion === 2) return "🥈 2° Puesto";
    if (posicion === 3) return "🥉 3° Puesto";
    return `#${posicion} Puesto`;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="animate-pulse text-sky-400 font-black uppercase tracking-[0.3em]">
          Cargando club...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 md:px-8">
        <Link
          href="/clubes"
          className="inline-flex rounded-2xl border border-sky-500/20 bg-sky-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-500/20"
        >
          ← Volver a clubes
        </Link>

        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/35 bg-[#020714] shadow-[0_0_55px_rgba(0,120,255,.24)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{
              backgroundImage: `url(${
                clubVisual?.banner_url ||
                "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop"
              })`,
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/86 to-black/35" />

          <div
            className="absolute inset-0 opacity-45"
            style={{
              background: `radial-gradient(circle at top right, ${colorPrincipal}66, transparent 42%)`,
            }}
          />

          <div className="relative z-10 p-6 md:p-8">
            <div className="grid gap-7 xl:grid-cols-[1fr_460px] xl:items-center">
              <div>
                <div className="mb-6 flex flex-wrap gap-3">
                  <span className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-300">
                    🏆 Torneo de Liga APA
                  </span>

                  <span className="rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-300">
                    Clubes APA · Perfil oficial
                  </span>
                </div>

                <div className="flex flex-col gap-7 lg:flex-row lg:items-center">
                  <div
                    className="h-28 w-28 shrink-0 overflow-hidden rounded-[34px] border bg-gradient-to-b from-sky-400/30 to-blue-950 shadow-[0_0_35px_rgba(56,189,248,.28)] sm:h-32 sm:w-32 md:h-40 md:w-40"
                    style={{ borderColor: `${colorPrincipal}99` }}
                  >
                    {clubVisual?.logo_url ? (
                      <img
                        src={clubVisual.logo_url}
                        alt={nombreRealEquipo}
                        className="h-full w-full object-contain p-3"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-black">
                        {iniciales(nombreRealEquipo)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h1 className="overflow-visible px-2 py-2 text-3xl font-black uppercase leading-[1.08] sm:text-4xl md:text-5xl xl:text-7xl">
                      <span className="block overflow-visible break-words bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                        {nombreRealEquipo}
                      </span>
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg md:leading-8">
                      {clubVisual?.descripcion ||
                        "Institución oficial registrada en APA PSO Argentina UE5. Perfil competitivo con plantel, estadísticas, racha e historial del club."}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <span className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-black uppercase text-sky-300">
                        {equipoTemporada?.temporada || "Temporada"}
                      </span>

                      <span className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black uppercase text-yellow-300">
                        {equipoTemporada?.division || "División"}
                      </span>

                      <span
                        className={`rounded-2xl border px-4 py-2 text-sm font-black uppercase ${
                          posicionLiga === 1
                            ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-300"
                            : "border-sky-400/30 bg-sky-400/10 text-sky-300"
                        }`}
                      >
                        {textoPosicion(posicionLiga)}
                      </span>

                      <span className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm font-black uppercase text-zinc-400">
                        DG {diferenciaGol > 0 ? `+${diferenciaGol}` : diferenciaGol}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-black/35 p-5 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,.22)]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">
                      Resumen competitivo
                    </p>
                    <h2 className="mt-1 text-2xl font-black uppercase">
                      {textoPosicion(posicionLiga)}
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 text-2xl">
                    🛡️
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["PTS", stats.puntos, "text-yellow-300"],
                    ["PJ", stats.pj, "text-sky-300"],
                    ["GF", stats.gf, "text-emerald-300"],
                    ["GC", stats.gc, "text-red-300"],
                  ].map(([label, value, color]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                        {label}
                      </p>

                      <p className={`mt-2 text-4xl md:text-5xl font-black leading-none ${color}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    Últimos 5 partidos
                  </p>

                  <div className="flex gap-2">
                    {stats.racha.length === 0 ? (
                      <span className="text-sm text-zinc-500">Sin racha</span>
                    ) : (
                      stats.racha.map((r, index) => (
                        <span
                          key={`${r}-${index}`}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black ${claseResultado(r)}`}
                        >
                          {r}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(250,204,21,.08)]">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-300">
                Palmarés oficial
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Títulos del club
              </h2>
            </div>

            <span className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-5 py-3 text-sm font-black uppercase text-yellow-300">
              🏆 {totalTitulos} títulos
            </span>
          </div>

          {titulos.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
              Este club todavía no tiene títulos cargados en el palmarés.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
              <div className="rounded-[28px] border border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 via-black/30 to-black/50 p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300">
                  Resumen
                </p>

                <div className="mt-5 space-y-3">
                  {Object.entries(palmaresAgrupado).map(([competicion, cantidad]) => (
                    <div
                      key={competicion}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 p-4"
                    >
                      <span className="font-black uppercase text-zinc-200">
                        {competicion}
                      </span>

                      <span className="text-2xl font-black text-yellow-300">
                        ×{cantidad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {titulos.map((titulo: any) => (
                  <div
                    key={titulo.id}
                    className="rounded-2xl border border-white/10 bg-black/35 p-5"
                  >
                    <p className="text-2xl font-black text-yellow-300">
                      🏆 {titulo.competicion}
                    </p>

                    <p className="mt-2 text-sm font-black uppercase tracking-[0.12em] text-zinc-500">
                      {titulo.temporada}
                      {titulo.division ? ` · ${titulo.division}` : ""}
                    </p>

                    {titulo.descripcion && (
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {titulo.descripcion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
          <div className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.10)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">
                  Agenda del club
                </p>

                <h2 className="mt-2 text-3xl font-black uppercase">
                  Próximo partido
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 text-2xl">
                📅
              </div>
            </div>

            {proximoPartido ? (
              <Link
                href={proximoPartido.partido_id ? `/estadisticas/${proximoPartido.partido_id}` : "#"}
                className="block rounded-[28px] border border-sky-500/20 bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18] p-5 transition hover:border-sky-400/45 hover:shadow-[0_0_25px_rgba(56,189,248,.14)]"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-300">
                    Fecha {proximoPartido.fecha || "-"}
                  </span>

                  <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                    {proximoPartido.dia || "Sin día"} · {proximoPartido.hora || "Sin hora"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_80px_1fr] items-center gap-3">
                  <p className="text-center md:text-right text-xl font-black uppercase md:text-2xl">
                    {proximoPartido.local}
                  </p>

                  <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-3 text-center text-xl font-black text-yellow-300">
                    VS
                  </div>

                  <p className="text-center md:text-left text-xl font-black uppercase md:text-2xl">
                    {proximoPartido.visitante}
                  </p>
                </div>

                <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  {proximoPartido.temporada || equipoTemporada?.temporada} · {proximoPartido.division || equipoTemporada?.division}
                </p>
              </Link>
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-black/35 p-6 text-zinc-500">
                No hay próximos partidos programados para este club.
              </div>
            )}
          </div>

          <div className="rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6 shadow-[0_0_35px_rgba(250,204,21,.08)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-300">
                  Historia competitiva
                </p>

                <h2 className="mt-2 text-3xl font-black uppercase">
                  Récord del club
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 text-2xl">
                🏟️
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-2">
              {[
                ["PJ", stats.pj, "text-sky-300"],
                ["PG", stats.pg, "text-emerald-300"],
                ["PE", stats.pe, "text-yellow-300"],
                ["PP", stats.pp, "text-red-300"],
                ["GF", stats.gf, "text-emerald-300"],
                ["GC", stats.gc, "text-red-300"],
                ["DG", diferenciaGol > 0 ? `+${diferenciaGol}` : diferenciaGol, "text-sky-300"],
                ["PTS", stats.puntos, "text-yellow-300"],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-black/35 p-4"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    {label}
                  </p>

                  <p className={`mt-2 text-3xl font-black ${color}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">
                Forma reciente
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Últimos partidos
              </h2>
            </div>

            <div className="flex gap-2">
              {stats.racha.length === 0 ? (
                <span className="text-sm text-zinc-500">Sin racha</span>
              ) : (
                stats.racha.map((r, index) => (
                  <span
                    key={`${r}-forma-${index}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black ${claseResultado(r)}`}
                  >
                    {r}
                  </span>
                ))
              )}
            </div>
          </div>

          {ultimosPartidos.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
              Todavía no hay partidos finalizados.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
              {ultimosPartidos.map((partido) => {
                const parsed = parsePartido(partido);

                return (
                  <Link
                    key={`forma-${partido.id}`}
                    href={partido.partido_id ? `/estadisticas/${partido.partido_id}` : "#"}
                    className="rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-sky-400/40 hover:bg-sky-500/10"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${claseResultado(parsed.estado)}`}
                      >
                        {parsed.texto}
                      </span>

                      <span className="text-[10px] font-black uppercase text-zinc-600">
                        F{partido.fecha || "-"}
                      </span>
                    </div>

                    <p className="truncate text-sm font-black uppercase text-zinc-300">
                      {partido.local}
                    </p>

                    <p className="my-2 rounded-xl border border-yellow-400/25 bg-yellow-400/10 py-2 text-center text-xl font-black text-yellow-300">
                      {parsed.golesLocal}-{parsed.golesVisitante}
                    </p>

                    <p className="truncate text-sm font-black uppercase text-zinc-300">
                      {partido.visitante}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div className="xl:col-span-4">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
              Destacados del club
            </p>

            <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">
              Figura y líderes internos
            </h2>
          </div>
          <Link
            href={figuraClub?.playerId ? `/jugadores/${figuraClub.playerId}` : "#"}
            className="group relative overflow-hidden rounded-[30px] border border-yellow-400/25 bg-gradient-to-br from-yellow-400/12 via-[#020714] to-black p-6 shadow-[0_0_35px_rgba(250,204,21,.10)] transition hover:-translate-y-1 hover:border-yellow-300/45"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_40%)]" />

            <div className="relative z-10">
              <div className="mb-7 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-300">
                    Figura del club
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase">
                    ⭐ Jugador clave
                  </h2>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-yellow-400/25 bg-yellow-400/10 text-3xl">
                  ⭐
                </div>
              </div>

              <h3 className="break-words text-2xl md:text-4xl font-black uppercase transition group-hover:text-yellow-300">
                {figuraClub?.jugador || "Sin datos"}
              </h3>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                  <p className="text-[10px] font-black uppercase text-zinc-500">
                    Goles
                  </p>
                  <p className="mt-1 text-2xl font-black text-yellow-300">
                    {figuraClub?.goles || 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                  <p className="text-[10px] font-black uppercase text-zinc-500">
                    Asist.
                  </p>
                  <p className="mt-1 text-2xl font-black text-sky-300">
                    {figuraClub?.asistencias || 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                  <p className="text-[10px] font-black uppercase text-zinc-500">
                    MVP
                  </p>
                  <p className="mt-1 text-2xl font-black text-purple-300">
                    {figuraClub?.mvps || 0}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {[
            {
              titulo: "Top goleador",
              jugador: topGoleador,
              dato: `${topGoleador?.goles || 0} goles`,
              icon: "⚽",
            },
            {
              titulo: "Top asistidor",
              jugador: topAsistidor,
              dato: `${topAsistidor?.asistencias || 0} asistencias`,
              icon: "🎯",
            },
            {
              titulo: "Más MVP",
              jugador: topMvp,
              dato: `${topMvp?.mvps || 0} MVP`,
              icon: "👑",
            },
          ].map(({ titulo, jugador, dato, icon }) => (
            <Link
              key={titulo}
              href={jugador?.playerId ? `/jugadores/${jugador.playerId}` : "#"}
              className="group relative overflow-hidden rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 transition hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,.16)]"
            >
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.14),transparent_36%)]" />

              <div className="relative z-10">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-400/10 text-2xl">
                  {icon}
                </div>

                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                  {titulo}
                </p>

                <h3 className="mt-2 truncate text-2xl font-black uppercase transition group-hover:text-sky-300">
                  {jugador?.jugador || "Sin datos"}
                </h3>

                <p className="mt-2 text-xl font-black text-yellow-400">{dato}</p>
              </div>
            </Link>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_410px]">
          <div className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">
                  Plantel oficial
                </p>

                <h2 className="mt-2 text-3xl font-black uppercase">
                  Escuadra del club
                </h2>
              </div>

              <p className="text-sm font-bold text-zinc-500">
                {plantel.length} jugadores
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.25em] text-sky-300/80">
                    <th className="py-3 text-left">#</th>
                    <th className="py-3 text-left">Jugador</th>
                    <th className="py-3 text-center">Goles</th>
                    <th className="py-3 text-center">Asist.</th>
                    <th className="py-3 text-center">MVP</th>
                    <th className="py-3 text-right">Perfil</th>
                  </tr>
                </thead>

                <tbody>
                  {plantel.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-zinc-500">
                        No se encontraron jugadores registrados.
                      </td>
                    </tr>
                  ) : (
                    plantel.map((jugador, index) => (
                      <tr
                        key={jugador.playerId || jugador.jugador}
                        className={`transition hover:brightness-125 ${
                          index < 3
                            ? "bg-gradient-to-r from-sky-500/14 via-[#071a33] to-[#030b18]"
                            : "bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18]"
                        }`}
                      >
                        <td className="rounded-l-xl px-4 py-4 font-black text-sky-300">
                          #{index + 1}
                        </td>

                        <td className="px-4 py-4 font-black uppercase">
                          <Link
                            href={`/jugadores/${jugador.playerId}`}
                            className="block transition hover:text-sky-300"
                          >
                            {jugador.jugador}
                          </Link>
                        </td>

                        <td className="py-4 text-center font-black text-yellow-400">
                          {jugador.goles}
                        </td>

                        <td className="py-4 text-center font-black text-zinc-300">
                          {jugador.asistencias}
                        </td>

                        <td className="py-4 text-center font-black text-sky-300">
                          {jugador.mvps}
                        </td>

                        <td className="rounded-r-xl px-4 py-4 text-right">
                          <Link
                            href={`/jugadores/${jugador.playerId}`}
                            className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-300 transition hover:text-white"
                          >
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">
                Historial
              </p>

              <h2 className="mt-2 text-2xl font-black uppercase">
                Partidos del club
              </h2>
            </div>

            <div className="max-h-[680px] space-y-3 overflow-y-auto pr-1">
              {partidos.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Este club aún no disputó partidos oficiales.
                </p>
              ) : (
                partidos.map((partido) => {
                  const parsed = parsePartido(partido);

                  return (
                    <Link
                      key={partido.id}
                      href={
                        partido.partido_id
                          ? `/estadisticas/${partido.partido_id}`
                          : "#"
                      }
                      className="block rounded-2xl border border-sky-500/20 bg-black/35 p-4 transition hover:border-sky-400/45 hover:bg-sky-500/10"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-400">
                          📅 Fecha {partido.fecha || "-"}
                        </p>

                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${claseResultado(parsed.estado)}`}
                        >
                          {parsed.texto}
                        </span>
                      </div>

                      <div className="grid grid-cols-[1fr_70px_1fr] items-center gap-2">
                        <span
                          className={`truncate text-right text-xs font-black ${
                            parsed.esLocal ? "text-white" : "text-zinc-400"
                          }`}
                        >
                          {partido.local}
                        </span>

                        <span className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-2 py-1 text-center font-black text-yellow-400">
                          {parsed.golesLocal}-{parsed.golesVisitante}
                        </span>

                        <span
                          className={`truncate text-left text-xs font-black ${
                            !parsed.esLocal ? "text-white" : "text-zinc-400"
                          }`}
                        >
                          {partido.visitante}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between text-[11px] text-zinc-600">
                        <span>{partido.temporada || equipoTemporada?.temporada}</span>
                        <span>{partido.division || equipoTemporada?.division}</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
