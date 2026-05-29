"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function JugadorPage() {
  const params = useParams();
  const playerIdUrl = params?.playerId
    ? decodeURIComponent(params.playerId as string)
    : "";

  const [stats, setStats] = useState<any[]>([]);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerIdUrl) return;
    cargarJugador();
  }, [playerIdUrl]);

  async function cargarJugador() {
    setLoading(true);

    const playerId = playerIdUrl;

    const query = supabase
      .from("estadisticas_jugadores")
      .select("*")
      .eq("playerId", playerId);

    const { data, error } = await query;

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    const registros = data || [];
    setStats(registros);

    const partidosIds = registros.map((r: any) => r.partido_id).filter(Boolean);

    if (partidosIds.length > 0) {
      const { data: partidosData } = await supabase
        .from("partidos")
        .select("*")
        .in("partido_id", partidosIds);

      setPartidos(partidosData || []);
    }

    setLoading(false);
  }

  function sumar(campo: string) {
    return stats.reduce((acc, r) => acc + Number(r[campo] || 0), 0);
  }

  function promedio(campo: string) {
    if (stats.length === 0) return 0;

    const total = stats.reduce((acc, r) => acc + Number(r[campo] || 0), 0);
    return (total / stats.length).toFixed(1);
  }
  function valorGKSave(r: any) {
    return Number(r.gKSAVES || r.gKSaves || r.gksaves || 0);
  }
  function esPartidoArquero(r: any) {
    return valorGKSave(r) > 0 || Number(r.gKCatches || 0) > 0;
  }

  const nombreActual = stats[0]?.nombre || "Jugador";
  const playerId = stats[0]?.playerId || "Sin ID";

  const equipos = Array.from(
    new Set(stats.map((s) => s.equipo).filter(Boolean)),
  );
  const temporadas = Array.from(
    new Set(stats.map((s) => s.temporada).filter(Boolean)),
  );
  const divisiones = Array.from(
    new Set(stats.map((s) => s.division).filter(Boolean)),
  );

  const totales = {
    partidos: stats.length,
    goles: sumar("goals"),
    asistencias: sumar("assists"),
    mvp: sumar("mvp"),
    pases: sumar("passes"),
    pasesClave: sumar("keyPasses"),
    tiros: sumar("shots"),
    tackles: sumar("tackles"),
    tacklesClave: sumar("keyTackles"),
    intercepciones: sumar("interceptions"),
    intercepcionesClave: sumar("keyInterceptions"),
    perdidas: sumar("possessionsLost"),
    atrapadas: sumar("gKCatches"),
    atajadas: stats.reduce((acc, r) => acc + valorGKSave(r), 0),
    score: sumar("score"),
    rating: promedio("overallRating"),
  };
  const carreraPorTemporada = Object.values(
    stats.reduce((acc: any, r: any) => {
      const key = `${r.temporada}-${r.division}-${r.equipo}`;

      if (!acc[key]) {
        acc[key] = {
          temporada: r.temporada,
          division: r.division,
          equipo: r.equipo,
          partidos: 0,
          goles: 0,
          asistencias: 0,
          atajadas: 0,
          atrapadas: 0,
          mvps: 0,
          score: 0,
          ratingTotal: 0,
        };
      }

      acc[key].partidos += 1;
      acc[key].goles += Number(r.goals) || 0;
      acc[key].asistencias += Number(r.assists) || 0;
      acc[key].atajadas += valorGKSave(r);
      acc[key].atrapadas += Number(r.gKCatches) || 0;
      acc[key].mvps += Number(r.mvp) || 0;
      acc[key].score += Number(r.score) || 0;
      acc[key].ratingTotal += Number(r.overallRating) || 0;

      return acc;
    }, {}),
  ).map((item: any) => ({
    ...item,
    rating:
      item.partidos > 0 ? (item.ratingTotal / item.partidos).toFixed(1) : "0.0",
  }));
  const esArquero = totales.atajadas > 0 || totales.atrapadas > 0;

  const mejorPartido =
    stats.length > 0
      ? [...stats].sort(
          (a, b) => Number(b.overallRating || 0) - Number(a.overallRating || 0),
        )[0]
      : null;

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-sky-400 font-black uppercase tracking-[0.3em]">
          Cargando jugador...
        </div>
      </main>
    );
  }

  if (stats.length === 0) {
    return (
      <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] flex items-center justify-center p-6">
        <section className="max-w-xl rounded-[30px] border border-sky-500/30 bg-[#020714] p-8 text-center">
          <h1 className="text-3xl font-black uppercase">
            Jugador no encontrado
          </h1>
          <p className="mt-3 text-zinc-400">
            No hay estadísticas para este Player ID.
          </p>
          <Link
            href="/jugadores"
            className="mt-6 inline-flex rounded-2xl border border-sky-500/30 bg-sky-500/10 px-5 py-3 text-sm font-black uppercase text-sky-300"
          >
            Volver a jugadores
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <section className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <Link
          href="/jugadores"
          className="inline-flex rounded-2xl border border-sky-500/20 bg-sky-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-sky-300 hover:bg-sky-500/20 transition"
        >
          ← Volver a jugadores
        </Link>

        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/40 bg-[#020714] shadow-[0_0_55px_rgba(0,120,255,.28)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />

          <div className="relative z-10 p-7 md:p-10">
            <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
              Perfil histórico por Player ID
            </p>

            <div className="mt-8 flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="h-36 w-36 shrink-0 rounded-full border border-sky-400/40 bg-gradient-to-b from-sky-400/30 to-blue-950 shadow-[0_0_35px_rgba(56,189,248,.28)] flex items-center justify-center text-5xl font-black">
                {nombreActual.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-none">
                  <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                    {nombreActual}
                  </span>
                </h1>

                <p className="mt-4 text-zinc-500 text-xs uppercase tracking-[0.25em]">
                  Player ID: {playerId}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-black uppercase text-sky-300">
                    {equipos.length} clubes
                  </span>

                  <span className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black uppercase text-yellow-300">
                    {temporadas.length} temporadas
                  </span>

                  <span className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm font-black uppercase text-zinc-400">
                    {divisiones.length} divisiones
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {[
            ["Partidos", totales.partidos, "text-white"],
            ["Goles", totales.goles, "text-yellow-400"],
            ["Asist.", totales.asistencias, "text-sky-300"],
            ["MVP", totales.mvp, "text-green-400"],
            ["Score", totales.score, "text-yellow-300"],
            ["Rating", totales.rating, "text-sky-300"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-[26px] border border-sky-500/20 bg-[#020714] p-5"
            >
              <p className="text-sky-300 uppercase tracking-[0.25em] text-xs font-black">
                {label}
              </p>
              <p className={`mt-3 text-4xl font-black ${color}`}>{value}</p>
            </div>
          ))}
          
        </section>
        {mejorPartido && (
          <section className="relative overflow-hidden rounded-[34px] border border-yellow-400/30 bg-[#020714] p-6 shadow-[0_0_45px_rgba(250,204,21,.12)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.16),transparent_40%)]" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-yellow-300 text-xs uppercase tracking-[0.35em] font-black">
                    Partido destacado
                  </p>
                  <h2 className="mt-2 text-3xl md:text-4xl font-black uppercase italic">
                    🏆 Mejor Partido
                  </h2>
                </div>

                <div className="rounded-3xl border border-green-400/30 bg-green-400/10 px-6 py-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-green-300 font-black">
                    Rating
                  </p>
                  <p className="text-5xl font-black text-green-400">
                    {mejorPartido.overallRating || 0}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                    Equipo
                  </p>
                  <p className="mt-2 font-black uppercase">
                    {mejorPartido.equipo}
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                    Temporada
                  </p>
                  <p className="mt-2 font-black">{mejorPartido.temporada}</p>
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                    División
                  </p>
                  <p className="mt-2 font-black">{mejorPartido.division}</p>
                </div>

                <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-300 font-black">
                    Score
                  </p>
                  <p className="mt-2 text-3xl font-black text-yellow-400">
                    {mejorPartido.score || 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-400/30 bg-purple-400/10 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-purple-300 font-black">
                    MVP
                  </p>
                  <p className="mt-2 text-3xl font-black text-purple-300">
                    {Number(mejorPartido.mvp || 0) > 0 ? "Sí" : "No"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                    Fecha
                  </p>
                  <p className="mt-2 font-black">{mejorPartido.fecha || "-"}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {esPartidoArquero(mejorPartido) ? (
                  <>
                    <span className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-black text-cyan-300">
                      🧤 {valorGKSave(mejorPartido)} Atajadas
                    </span>

                    <span className="rounded-2xl border border-indigo-400/30 bg-indigo-400/10 px-5 py-3 font-black text-indigo-300">
                      🤲 {mejorPartido.gKCatches || 0} Atrapadas
                    </span>
                  </>
                ) : (
                  <>
                    <span className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-3 font-black text-yellow-300">
                      ⚽ {mejorPartido.goals || 0} Goles
                    </span>

                    <span className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 font-black text-sky-300">
                      🎯 {mejorPartido.assists || 0} Asistencias
                    </span>
                  </>
                )}

                <span className="rounded-2xl border border-purple-400/30 bg-purple-400/10 px-5 py-3 font-black text-purple-300">
                  🎯 {mejorPartido.passes || 0} Pases
                </span>

                <span className="rounded-2xl border border-blue-400/30 bg-blue-400/10 px-5 py-3 font-black text-blue-300">
                  🛡️ {mejorPartido.tackles || 0} Tackles
                </span>
              </div>
            </div>
          </section>
        )}
        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
          <h2 className="text-3xl font-black uppercase mb-6">
            Carrera por temporada
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.25em] text-sky-300/80">
                  <th className="text-left py-3">Equipo</th>
                  <th className="text-center py-3">Temporada</th>
                  <th className="text-center py-3">División</th>
                  <th className="text-center py-3">PJ</th>
                  <th className="text-center py-3">G</th>
                  <th className="text-center py-3">A</th>
                  <th className="text-center py-3">Ataj.</th>
                  <th className="text-center py-3">Atrap.</th>
                  <th className="text-center py-3">MVP</th>
                  <th className="text-center py-3">Rating</th>
                </tr>
              </thead>

              <tbody>
                {carreraPorTemporada.map((item: any) => (
                  <tr
                    key={`${item.temporada}-${item.division}-${item.equipo}`}
                    className="bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18]"
                  >
                    <td className="rounded-l-xl py-4 px-4 font-black uppercase">
                      {item.equipo}
                    </td>
                    <td className="py-4 text-center font-black">
                      {item.temporada}
                    </td>
                    <td className="py-4 text-center font-black">
                      {item.division}
                    </td>
                    <td className="py-4 text-center font-black text-white">
                      {item.partidos}
                    </td>
                    <td className="py-4 text-center font-black text-yellow-400">
                      {item.goles}
                    </td>
                    <td className="py-4 text-center font-black text-sky-300">
                      {item.asistencias}
                    </td>
                    <td className="py-4 text-center font-black text-cyan-400">
                      {item.atajadas || 0}
                    </td>
                    <td className="py-4 text-center font-black text-indigo-300">
                      {item.atrapadas || 0}
                    </td>

                    <td className="py-4 text-center font-black text-green-400">
                      {item.mvps}
                    </td>
                    <td className="rounded-r-xl py-4 text-center font-black text-purple-300">
                      {item.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
          <h2 className="text-3xl font-black uppercase mb-6">
            Estadísticas acumuladas
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {[
              ["Pases", totales.pases],
              ["Pases clave", totales.pasesClave],
              ["Tiros", totales.tiros],
              ["Tackles", totales.tackles],
              ["Tackles clave", totales.tacklesClave],
              ["Intercepciones", totales.intercepciones],
              ["Interc. clave", totales.intercepcionesClave],
              ["Pérdidas", totales.perdidas],
              ["Atajadas", totales.atajadas],
              ["Atrapadas", totales.atrapadas],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-sky-500/15 bg-black/35 p-4"
              >
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black">
                  {label}
                </p>
                <p className="mt-3 text-3xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
          <div className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
            <h2 className="text-3xl font-black uppercase mb-6">
              Partidos jugados
            </h2>

            <div className="space-y-4">
              {stats.map((r) => (
                <div
                  key={r.id}
                  className="rounded-[28px] border border-sky-500/20 bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18] p-5"
                >
                  <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5 items-center">
                    <div>
                      <Link
                        href={`/equipos/${encodeURIComponent(r.equipo)}`}
                        className="text-xl font-black uppercase hover:text-sky-300 transition"
                      >
                        {r.equipo}
                      </Link>

                      <p className="mt-2 text-xs text-zinc-500 uppercase tracking-[0.18em]">
                        {r.temporada} · {r.division} · Fecha {r.fecha}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                      {esPartidoArquero(r) ? (
                        <>
                          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-3 text-center">
                            <p className="text-[10px] uppercase text-cyan-300">
                              Atajadas
                            </p>
                            <p className="mt-2 text-3xl font-black text-cyan-300">
                              {valorGKSave(r)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-indigo-400/30 bg-indigo-400/10 p-3 text-center">
                            <p className="text-[10px] uppercase text-indigo-300">
                              Atrapadas
                            </p>
                            <p className="mt-2 text-3xl font-black text-indigo-300">
                              {r.gKCatches || 0}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-3 text-center">
                            <p className="text-[10px] uppercase text-yellow-300">
                              Goles
                            </p>
                            <p className="mt-2 text-3xl font-black text-yellow-400">
                              {r.goals || 0}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-sky-400/30 bg-sky-400/10 p-3 text-center">
                            <p className="text-[10px] uppercase text-sky-300">
                              Asist.
                            </p>
                            <p className="mt-2 text-3xl font-black text-sky-300">
                              {r.assists || 0}
                            </p>
                          </div>
                        </>
                      )}

                      <div className="rounded-2xl border border-purple-400/30 bg-purple-400/10 p-3 text-center">
                        <p className="text-[10px] uppercase text-purple-300">
                          Pases
                        </p>
                        <p className="mt-2 text-3xl font-black text-purple-300">
                          {r.passes || 0}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-blue-400/30 bg-blue-400/10 p-3 text-center">
                        <p className="text-[10px] uppercase text-blue-300">
                          Tackles
                        </p>
                        <p className="mt-2 text-3xl font-black text-white">
                          {r.tackles || 0}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-green-400/30 bg-green-400/10 p-3 text-center">
                        <p className="text-[10px] uppercase text-green-300">
                          Rating
                        </p>
                        <p className="mt-2 text-3xl font-black text-green-400">
                          {r.overallRating || 0}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-3 text-center">
                        <p className="text-[10px] uppercase text-yellow-300">
                          Score
                        </p>
                        <p className="mt-2 text-3xl font-black text-yellow-400">
                          {r.score || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
            <h2 className="text-2xl font-black uppercase mb-6">Partidos</h2>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {partidos.length === 0 ? (
                <p className="text-zinc-500 text-sm">
                  No hay partidos relacionados.
                </p>
              ) : (
                partidos.map((partido) => {
                  const partes = partido.resultado
                    ? partido.resultado.split("-")
                    : ["-", "-"];
                  const golesLocal = partes[0]?.trim() || "-";
                  const golesVisitante = partes[1]?.trim() || "-";

                  return (
                    <Link
                      key={partido.id}
                      href={`/estadisticas/${encodeURIComponent(partido.partido_id)}`}
                      className="block rounded-2xl border border-sky-500/20 bg-black/35 p-4 transition hover:border-sky-400/50 hover:bg-sky-500/10"
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

                      <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        Ver partido →
                      </p>
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
