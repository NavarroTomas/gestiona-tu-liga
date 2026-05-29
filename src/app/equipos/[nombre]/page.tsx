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
}

interface EstadisticasJugador {
  jugador: string;
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

interface EquipoTemporada {
  nombre: string;
  temporada: string;
  division: string;
  club_slug?: string | null;
}

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

  const [stats, setStats] = useState({
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    puntos: 0,
    racha: [] as string[],
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
        .select("*");

      if (equiposError) {
        console.log(equiposError);
        return;
      }

      const equipoEncontrado = equiposData?.find(
        (e: any) => e.nombre?.toLowerCase() === nombreEquipoUrl.toLowerCase()
      );

      const nombreExacto = equipoEncontrado?.nombre || nombreEquipoUrl;

      setNombreRealEquipo(nombreExacto);
      setEquipoTemporada(equipoEncontrado || null);

      if (equipoEncontrado?.club_slug) {
        const { data: clubData, error: clubError } = await supabase
          .from("clubes_info")
          .select("*")
          .eq("slug", equipoEncontrado.club_slug)
          .single();

        if (clubError) {
          console.log(clubError);
        } else {
          setClubVisual(clubData);
        }
      }

      const { data: partidosData } = await supabase.from("partidos").select("*");

      const partidosDelEquipo = (partidosData || []).filter(
        (p: any) =>
          p.local?.toLowerCase() === nombreExacto.toLowerCase() ||
          p.visitante?.toLowerCase() === nombreExacto.toLowerCase()
      );

      setPartidos(partidosDelEquipo);

      const { data: jugadoresData } = await supabase
        .from("jugadores")
        .select("*");

      const jugadoresFiltrados = (jugadoresData || []).filter(
        (j: any) => j.equipo?.toLowerCase() === nombreExacto.toLowerCase()
      );

      const mapaAgrupado: { [key: string]: EstadisticasJugador } = {};

      jugadoresFiltrados.forEach((j: any) => {
        const nombreJugador = (j.jugador || j.nombre || "Sin Nombre").trim();
        if (!nombreJugador) return;

        if (!mapaAgrupado[nombreJugador]) {
          mapaAgrupado[nombreJugador] = {
            jugador: nombreJugador,
            goles: 0,
            asistencias: 0,
            mvps: 0,
          };
        }

        mapaAgrupado[nombreJugador].goles += Number(j.goles) || 0;
        mapaAgrupado[nombreJugador].asistencias += Number(j.asistencias) || 0;
        mapaAgrupado[nombreJugador].mvps +=
          Number(j.mvps) || Number(j.mvp) || 0;
      });

      setPlantel(
        Object.values(mapaAgrupado).sort((a, b) => b.goles - a.goles)
      );

      let pj = 0;
      let pg = 0;
      let pe = 0;
      let pp = 0;
      let gf = 0;
      let gc = 0;
      let puntos = 0;
      const rachaAux: string[] = [];

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

  const topGoleador = plantel[0];

  const topAsistidor = [...plantel].sort(
    (a, b) => b.asistencias - a.asistencias
  )[0];

  const topMvp = [...plantel].sort((a, b) => b.mvps - a.mvps)[0];

  const colorPrincipal = clubVisual?.color_principal || "#38bdf8";

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-sky-400 font-black uppercase tracking-[0.3em]">
          Cargando club...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <section className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <Link
          href="/clubes"
          className="inline-flex rounded-2xl border border-sky-500/20 bg-sky-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-sky-300 hover:bg-sky-500/20 transition"
        >
          ← Volver a clubes
        </Link>

        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/40 bg-[#020714] shadow-[0_0_55px_rgba(0,120,255,.28)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35"
            style={{
              backgroundImage: `url(${
                clubVisual?.banner_url ||
                "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop"
              })`,
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30" />

          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(circle at top right, ${colorPrincipal}55, transparent 42%)`,
            }}
          />

          <div className="relative z-10 p-7 md:p-10">
            <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
              Perfil del club
            </p>

            <div className="mt-8 flex flex-col lg:flex-row lg:items-center gap-8">
              <div
                className="h-36 w-36 shrink-0 overflow-hidden rounded-full border bg-gradient-to-b from-sky-400/30 to-blue-950 shadow-[0_0_35px_rgba(56,189,248,.28)]"
                style={{ borderColor: `${colorPrincipal}99` }}
              >
                {clubVisual?.logo_url ? (
                  <img
                    src={clubVisual.logo_url}
                    alt={nombreRealEquipo}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-black">
                    {iniciales(nombreRealEquipo)}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-none">
                  <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                    {nombreRealEquipo}
                  </span>
                </h1>

                <p className="mt-4 text-zinc-300 max-w-2xl">
                  {clubVisual?.descripcion ||
                    "Club oficial registrado en APA PSO Argentina UE5."}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-black uppercase text-sky-300">
                    {equipoTemporada?.temporada || "Temporada"}
                  </span>

                  <span className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black uppercase text-yellow-300">
                    {equipoTemporada?.division || "División"}
                  </span>

                  {equipoTemporada?.club_slug && (
                    <span className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm font-black uppercase text-zinc-400">
                      {equipoTemporada.club_slug}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["PTS", stats.puntos, "text-yellow-400"],
            ["PJ", stats.pj, "text-sky-300"],
            ["GF", stats.gf, "text-green-400"],
            ["GC", stats.gc, "text-red-400"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-[26px] border border-sky-500/20 bg-[#020714] p-5 shadow-[0_0_25px_rgba(0,120,255,.12)]"
            >
              <p className="text-zinc-500 text-xs uppercase tracking-[0.25em] font-black">
                {label}
              </p>

              <p className={`mt-3 text-4xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            ["Top goleador", topGoleador, `${topGoleador?.goles || 0} goles`],
            [
              "Top asistidor",
              topAsistidor,
              `${topAsistidor?.asistencias || 0} asistencias`,
            ],
            ["Más MVP", topMvp, `${topMvp?.mvps || 0} MVP`],
          ].map(([titulo, jugador, dato]: any) => (
            <Link
              key={titulo}
              href={
                jugador?.jugador
                  ? `/jugadores/${encodeURIComponent(jugador.jugador)}`
                  : "#"
           }
            className="group rounded-[26px] border border-sky-500/20 bg-[#020714] p-5 transition hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,.16)]"
          >
            <p className="text-sky-300 uppercase tracking-[0.25em] text-xs font-black">
              {titulo}
            </p>

            <h3 className="mt-3 text-2xl font-black uppercase group-hover:text-sky-300 transition">
              {jugador?.jugador || "Sin datos"}
            </h3>

            <p className="mt-2 text-yellow-400 font-black">
              {dato}
            </p>

            <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-zinc-500 group-hover:text-sky-300">
              Ver jugador →
            </p>
          </Link>
        ))}
      </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
          <div className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
            <h2 className="text-3xl font-black uppercase mb-6">
              Plantel y estadísticas
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.25em] text-sky-300/80">
                    <th className="text-left py-3">Jugador</th>
                    <th className="text-center py-3">Goles</th>
                    <th className="text-center py-3">Asist.</th>
                    <th className="text-center py-3">MVP</th>
                  </tr>
                </thead>

                <tbody>
                  {plantel.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-zinc-500">
                        No se encontraron jugadores registrados.
                      </td>
                    </tr>
                  ) : (
                    plantel.map((jugador, index) => (
                      <tr
                        key={jugador.jugador}
                        className="bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18] transition hover:brightness-125"
                      >
                        <td className="rounded-l-xl py-4 px-4 font-black uppercase">
                          <Link
                            href={`/jugadores/${encodeURIComponent(jugador.jugador)}`}
                            className="block hover:text-sky-300 transition"
                          >
                            <span className="text-sky-400 mr-3">
                              #{index + 1}
                            </span>
                            {jugador.jugador}
                            </Link>
                          </td>

                          <td className="py-4 text-center font-black text-yellow-400">
                            <Link
                              href={`/jugadores/${encodeURIComponent(jugador.jugador)}`}
                              className="block"
                            >
                              {jugador.goles}
                            </Link>
                          </td>

                          <td className="py-4 text-center font-black text-zinc-300">
                            <Link
                            href={`/jugadores/${encodeURIComponent(jugador.jugador)}`}
                            className="block"
                          >
                            {jugador.asistencias}
                          </Link>
                        </td>

                        <td className="rounded-r-xl py-4 text-center font-black text-sky-300">
                          <Link
                          href={`/jugadores/${encodeURIComponent(jugador.jugador)}`}
                          className="block"
                        >
                          {jugador.mvps}
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
            <h2 className="text-2xl font-black uppercase mb-6">Historial</h2>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {partidos.length === 0 ? (
                <p className="text-zinc-500 text-sm">
                  Este club aún no disputó partidos oficiales.
                </p>
              ) : (
                partidos.map((partido) => {
                  const partes = partido.resultado
                    ? partido.resultado.split("-")
                    : ["-", "-"];

                  const golesLocal = partes[0]?.trim() || "-";
                  const golesVisitante = partes[1]?.trim() || "-";

                  return (
                    <div
                      key={partido.id}
                      className="rounded-2xl border border-sky-500/20 bg-black/35 p-4"
                    >
                      <p className="text-[10px] text-sky-400 uppercase tracking-[0.22em] font-black mb-3">
                        Fecha {partido.fecha || "-"}
                      </p>

                      <div className="grid grid-cols-[1fr_70px_1fr] items-center gap-2">
                        <span className="truncate text-right text-xs font-black">
                          {partido.local}
                        </span>

                        <span className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-2 py-1 text-center text-yellow-400 font-black">
                          {golesLocal}-{golesVisitante}
                        </span>

                        <span className="truncate text-left text-xs font-black">
                          {partido.visitante}
                        </span>
                      </div>
                    </div>
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