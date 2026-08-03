"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { matchFitsContext, normalizeDivision, normalizeRound, parseScore, stableMatchId } from "../../../lib/competitionData";

function Escudo({
  nombre,
  logo,
}: {
  nombre: string;
  logo?: string | null;
}) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sky-300/30 bg-gradient-to-br from-sky-500 to-blue-950 text-sm font-black shadow-[0_0_18px_rgba(0,140,255,.55)]">
      {logo ? (
        <img
          src={logo}
          alt={nombre}
          className="h-full w-full object-contain p-1.5"
        />
      ) : (
        nombre?.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}

function MiniEscudo({
  nombre,
  logo,
}: {
  nombre: string;
  logo?: string | null;
}) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-300/25 bg-gradient-to-br from-sky-500 to-blue-950 text-[10px] font-black shadow-[0_0_12px_rgba(0,140,255,.35)]">
      {logo ? (
        <img
          src={logo}
          alt={nombre}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        nombre?.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}

const nombresDivision: Record<string, string> = {
  primera: "Primera División",
  segunda: "Segunda División",
  "grupo-a": "Grupo A",
  "grupo-b": "Grupo B",
  "grupo-c": "Grupo C",
  "grupo-d": "Grupo D",
  "copa-argentina": "Copa Argentina",
  "copa-apa": "Copa APA",
  "copa-campeones": "Copa de Campeones",
  playoffs: "Playoffs de Ascenso",
};

const gruposCopa: Record<string, string> = {
  "grupo-a": "A",
  "grupo-b": "B",
  "grupo-c": "C",
  "grupo-d": "D",
};

function normalizarDivisionUrl(value: string) {
  const permitido = [
    "primera",
    "segunda",
    "grupo-a",
    "grupo-b",
    "grupo-c",
    "grupo-d",
    "copa-argentina",
    "copa-apa",
    "copa-campeones",
    "playoffs",
  ];
  return permitido.includes(value) ? value : "primera";
}

export default function FixtureDivisionPage() {
  const params = useParams();
  const divisionParam = params.division as string;
  const division = normalizarDivisionUrl(divisionParam);

  const esCopaGrupos = Boolean(gruposCopa[division]);
  const esCopaArgentina = division === "copa-argentina";
  const esCopaApa = division === "copa-apa";
  const esCopaCampeones = division === "copa-campeones";
  const esPlayoffs = division === "playoffs";
  const grupoCopa = gruposCopa[division];
  const divisionDb = division === "primera" ? "primera" : "segunda";

  const searchParams = useSearchParams();
  const temporada = searchParams.get("temporada") || "Temporada 4";
  const faseCopaCampeones = searchParams.get("fase") || "";
  const fasePlayoffs = searchParams.get("fase") || "";

  const [partidos, setPartidos] = useState<any[]>([]);
  const [clubesInfo, setClubesInfo] = useState<any[]>([]);
  const [fechaActiva, setFechaActiva] = useState("1");

  useEffect(() => {
    cargarPartidos();
  }, [division, divisionDb, grupoCopa, temporada, faseCopaCampeones, fasePlayoffs]);

  async function cargarPartidos() {
    const { data, error } = await supabase
      .from("partidos")
      .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda")
      .order("fecha", { ascending: true });

    if (error) {
      console.error("Error cargando fixture:", error);
      setPartidos([]);
      setClubesInfo([]);
      return;
    }

    const context = esCopaGrupos
      ? { temporada, competicion: "copa_clasificatoria", grupo: grupoCopa }
      : esCopaArgentina
        ? { temporada, competicion: "copa_argentina" }
        : esCopaApa
          ? { temporada, competicion: "copa_apa" }
          : esCopaCampeones
            ? { temporada, competicion: "copa_campeones", fase: faseCopaCampeones || undefined }
            : esPlayoffs
              ? { temporada, competicion: "playoffs", fase: fasePlayoffs || undefined }
              : { temporada, competicion: "liga", division: divisionDb };

    const partidosLimpios = (data || []).filter((partido: any) =>
      matchFitsContext(partido, context),
    );

    setPartidos(partidosLimpios);

    const nombresEquipos = Array.from(
      new Set(partidosLimpios.flatMap((p: any) => [p.local, p.visitante]).filter(Boolean)),
    );

    if (nombresEquipos.length > 0) {
      const { data: clubesData, error: clubesError } = await supabase
        .from("v_clubes_temporada_public")
        .select("*")
        .eq("temporada", temporada)
        .eq("activo", true)
        .in("nombre", nombresEquipos);

      if (clubesError) console.error("Error cargando clubes:", clubesError);

      setClubesInfo(
        esCopaGrupos || esCopaArgentina || esCopaApa || esCopaCampeones || esPlayoffs
          ? (clubesData || [])
          : (clubesData || []).filter(
              (club: any) => normalizeDivision(club.division) === normalizeDivision(division),
            ),
      );
    } else {
      setClubesInfo([]);
    }

    const primeraFecha = partidosLimpios
      .map((partido: any) => normalizeRound(partido.fecha || partido.fase || partido.ronda || "1"))
      .filter(Boolean)[0];
    if (primeraFecha) setFechaActiva(primeraFecha);
  }

  const fechas = Array.from(
    new Set(partidos.map((p) => normalizeRound(p.fecha || p.ronda || p.fase || "1"))),
  );

  const partidosFecha = partidos.filter(
    (p) => normalizeRound(p.fecha || p.ronda || p.fase || "1") === fechaActiva,
  );

  const indiceFecha = fechas.indexOf(fechaActiva);
  const fechaAnterior = indiceFecha > 0 ? fechas[indiceFecha - 1] : null;
  const fechaSiguiente =
    indiceFecha >= 0 && indiceFecha < fechas.length - 1
      ? fechas[indiceFecha + 1]
      : null;

  function estadoPartido(p: any) {
    if (p.resultado) return "finalizado";
    if (p.dia || p.hora) return "programado";
    return "pendiente";
  }

  function claseEstado(p: any) {
    const estado = estadoPartido(p);

    if (estado === "finalizado") {
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    }

    if (estado === "programado") {
      return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
    }

    return "border-sky-400/30 bg-sky-400/10 text-sky-300";
  }

  function logoEquipo(nombre?: string) {
    if (!nombre) return null;

    const club = clubesInfo.find(
      (c) =>
        String(c.nombre || "").toLowerCase().trim() ===
        String(nombre || "").toLowerCase().trim(),
    );

    return club?.logo_url || null;
  }

  const equiposCantidad = new Set(
    partidos.flatMap((p) => [p.local, p.visitante]).filter(Boolean),
  ).size;

  const jugados = partidos.filter((p) => estadoPartido(p) === "finalizado").length;
  const programados = partidos.filter(
    (p) => estadoPartido(p) === "programado",
  ).length;
  const pendientes = partidos.filter(
    (p) => estadoPartido(p) === "pendiente",
  ).length;

  const tabla = useMemo(() => {
    const mapa: Record<
      string,
      {
        equipo: string;
        pts: number;
        pj: number;
        pg: number;
        pe: number;
        pp: number;
        gf: number;
        gc: number;
        dg: number;
        ultimos: string[];
      }
    > = {};

    function asegurar(nombre: string) {
      if (!nombre) return;

      if (!mapa[nombre]) {
        mapa[nombre] = {
          equipo: nombre,
          pts: 0,
          pj: 0,
          pg: 0,
          pe: 0,
          pp: 0,
          gf: 0,
          gc: 0,
          dg: 0,
          ultimos: [],
        };
      }
    }

    partidos.forEach((p) => {
      asegurar(p.local);
      asegurar(p.visitante);

      const score = parseScore(p.resultado);
      if (!score) return;
      const [gl, gv] = score;

      mapa[p.local].pj += 1;
      mapa[p.visitante].pj += 1;

      mapa[p.local].gf += gl;
      mapa[p.local].gc += gv;

      mapa[p.visitante].gf += gv;
      mapa[p.visitante].gc += gl;

      if (gl > gv) {
        mapa[p.local].pg += 1;
        mapa[p.local].pts += 3;
        mapa[p.visitante].pp += 1;
        mapa[p.local].ultimos.push("G");
        mapa[p.visitante].ultimos.push("P");
      } else if (gl < gv) {
        mapa[p.visitante].pg += 1;
        mapa[p.visitante].pts += 3;
        mapa[p.local].pp += 1;
        mapa[p.visitante].ultimos.push("G");
        mapa[p.local].ultimos.push("P");
      } else {
        mapa[p.local].pe += 1;
        mapa[p.visitante].pe += 1;
        mapa[p.local].pts += 1;
        mapa[p.visitante].pts += 1;
        mapa[p.local].ultimos.push("E");
        mapa[p.visitante].ultimos.push("E");
      }
    });

    return Object.values(mapa)
      .map((e) => ({ ...e, dg: e.gf - e.gc, ultimos: e.ultimos.slice(-5) }))
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        return b.gf - a.gf;
      });
  }, [partidos]);

  const lider = tabla[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-8 text-white md:px-6">
      <section className="mx-auto max-w-[1600px] space-y-8">
        <Link
          href="/fixture"
          className="inline-flex rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black"
        >
          ← Volver a fixture
        </Link>

        <section className="relative overflow-hidden rounded-[40px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.22)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/25" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_360px] xl:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
                {esCopaArgentina || esCopaApa
                  ? "Fixture Copas Oficiales"
                  : esCopaCampeones
                  ? "Fixture Copa de Campeones"
                  : esCopaGrupos
                  ? "Fixture Clasificación a Copas"
                  : "Fixture oficial"}
              </p>

              <h1 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-7xl">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  {nombresDivision[division] || division}
                </span>
                <span className="block text-sky-400 drop-shadow-[0_0_22px_rgba(56,189,248,.55)]">
                  {temporada}
                </span>
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
                Centro de calendario, resultados y programación de {nombresDivision[division]}.
              </p>
            </div>

            <div className="rounded-[34px] border border-sky-400/25 bg-black/35 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">
                Resumen de competición
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ["Equipos", equiposCantidad, "text-sky-300"],
                  ["Fases/Fechas", fechas.length, "text-yellow-300"],
                  ["Partidos", partidos.length, "text-white"],
                  ["Jugados", jugados, "text-emerald-300"],
                ].map(([label, value, color]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                      {label}
                    </p>
                    <p className={`mt-2 text-3xl font-black ${color}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                  <p className="text-[10px] font-black uppercase text-yellow-300">
                    Programados
                  </p>
                  <p className="mt-2 text-3xl font-black text-yellow-300">
                    {programados}
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
                  <p className="text-[10px] font-black uppercase text-sky-300">
                    Pendientes
                  </p>
                  <p className="mt-2 text-3xl font-black text-sky-300">
                    {pendientes}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[480px_1fr]">
          <aside className="space-y-6">
            {!esCopaArgentina && !esCopaApa && (
              <section className="rounded-[34px] border border-yellow-500/25 bg-[#020714]/95 p-6 shadow-[0_0_35px_rgba(250,204,21,.08)]">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                      Tabla de posiciones
                    </p>

                    <h2 className="mt-2 text-3xl font-black uppercase">
                      Clasificación
                    </h2>
                  </div>

                  {lider && (
                    <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-[10px] font-black uppercase text-yellow-300">
                      👑 Líder
                    </span>
                  )}
                </div>

                {tabla.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                    La tabla aparecerá cuando haya resultados cargados.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[440px] border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-[9px] uppercase tracking-[0.18em] text-sky-300/80">
                          <th className="py-2 text-left">#</th>
                          <th className="py-2 text-left">Equipo</th>
                          <th className="py-2 text-center">PTS</th>
                          <th className="py-2 text-center">PJ</th>
                          <th className="py-2 text-center">DG</th>
                          <th className="py-2 text-center">Últ.</th>
                        </tr>
                      </thead>

                      <tbody>
                        {tabla.map((e, index) => (
                          <tr
                            key={e.equipo}
                            className="bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18]"
                          >
                            <td className="rounded-l-xl px-3 py-3 text-sm font-black text-sky-300">
                              {index + 1}
                            </td>

                            <td className="max-w-[170px] px-3 py-3">
                              <div className="flex items-center gap-2">
                                <MiniEscudo
                                  nombre={e.equipo}
                                  logo={logoEquipo(e.equipo)}
                                />

                                <span className="truncate text-sm font-black uppercase">
                                  {e.equipo}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 text-center text-sm font-black text-yellow-300">
                              {e.pts}
                            </td>

                            <td className="py-3 text-center text-sm font-black">
                              {e.pj}
                            </td>

                            <td className="py-3 text-center text-sm font-black text-sky-300">
                              {e.dg > 0 ? `+${e.dg}` : e.dg}
                            </td>

                            <td className="rounded-r-xl py-3 text-center">
                              <div className="flex justify-center gap-1">
                                {e.ultimos.length === 0 ? (
                                  <span className="text-xs text-zinc-600">-</span>
                                ) : (
                                  e.ultimos.map((r, i) => (
                                    <span
                                      key={`${e.equipo}-${i}`}
                                      className={`h-2.5 w-2.5 rounded-full ${
                                        r === "G"
                                          ? "bg-emerald-400"
                                          : r === "E"
                                          ? "bg-zinc-400"
                                          : "bg-red-400"
                                      }`}
                                    />
                                  ))
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-[34px] border border-sky-500/25 bg-[#020714]/95 p-6">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                {esCopaArgentina || esCopaApa ? "Fases Eliminatorias" : "Fechas"}
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Navegación
              </h2>

              <div className="mt-5 grid max-h-[390px] grid-cols-2 gap-3 overflow-y-auto pr-1 md:grid-cols-3 xl:grid-cols-2">
                {fechas.length === 0 ? (
                  <p className="col-span-2 rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                    No hay fases cargadas.
                  </p>
                ) : (
                  fechas.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFechaActiva(f)}
                      className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                        fechaActiva === f
                          ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
                          : "border-white/10 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                      }`}
                    >
                      {isNaN(Number(f)) ? f : `Fecha ${f}`}
                    </button>
                  ))
                )}
              </div>
            </section>
          </aside>

          <section className="rounded-[34px] border border-sky-500/25 bg-[#020714]/95 shadow-[0_0_35px_rgba(0,120,255,.12)]">
            <div className="border-b border-sky-500/25 bg-gradient-to-r from-blue-900 via-blue-950 to-black p-6 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                    Partidos
                  </p>

                  <h2 className="mt-2 text-4xl font-black uppercase text-blue-100">
                    📅 {isNaN(Number(fechaActiva)) ? fechaActiva : `Fecha ${fechaActiva}`}
                  </h2>

                  <p className="mt-2 text-zinc-400">
                    {partidosFecha.length} partidos visibles
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    disabled={!fechaAnterior}
                    onClick={() => fechaAnterior && setFechaActiva(fechaAnterior)}
                    className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs font-black uppercase text-zinc-300 transition hover:border-sky-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    ← Anterior
                  </button>

                  <button
                    disabled={!fechaSiguiente}
                    onClick={() =>
                      fechaSiguiente && setFechaActiva(fechaSiguiente)
                    }
                    className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs font-black uppercase text-zinc-300 transition hover:border-sky-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 md:p-6">
              {partidosFecha.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/35 p-10 text-zinc-500">
                  No hay partidos cargados para esta fase o fecha.
                </div>
              )}

              {partidosFecha.map((p, index) => {
                const estado = estadoPartido(p);

                const contenido = (
                  <div className="group overflow-hidden rounded-[28px] border border-sky-500/20 bg-gradient-to-r from-[#020814] via-[#071b36] to-[#020814] transition hover:border-sky-400/60 hover:shadow-[0_0_28px_rgba(56,189,248,.12)]">
                    <div className="border-b border-white/10 bg-black/25 px-5 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${claseEstado(
                            p,
                          )}`}
                        >
                          {estado === "finalizado"
                            ? "🟢 Finalizado"
                            : estado === "programado"
                            ? "🟡 Programado"
                            : "🔵 Pendiente"}
                        </span>

                        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                          {p.ronda || p.fase || "Partido"} · {p.dia || "Sin día"} · {p.hora || "Sin hora"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 items-center gap-4 p-5 xl:grid-cols-[1fr_140px_1fr]">
                      <div className="flex items-center justify-center gap-4 xl:justify-end">
                        <p className="max-w-[380px] break-words text-center text-2xl font-black uppercase leading-tight xl:text-right md:text-3xl">
                          {p.local}
                        </p>
                        <Escudo nombre={p.local} logo={logoEquipo(p.local)} />
                      </div>

                      <div className="mx-auto min-w-[132px] rounded-2xl border border-yellow-400/35 bg-yellow-400/10 px-5 py-4 text-center shadow-[0_0_22px_rgba(250,204,21,.18)]">
                        <p className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,.45)]">
                          {p.resultado ? p.resultado.replace(/\s/g, "") : "VS"}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-4 xl:justify-start">
                        <Escudo nombre={p.visitante} logo={logoEquipo(p.visitante)} />
                        <p className="max-w-[380px] break-words text-center text-2xl font-black uppercase leading-tight xl:text-left md:text-3xl">
                          {p.visitante}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/10 bg-black/25 px-5 py-4 md:flex-row md:items-center md:justify-between">
                      <div className="text-sm font-bold text-zinc-400">
                        {p.dia || p.hora ? (
                          <>
                            Programación:{" "}
                            <span className="text-sky-300">
                              {p.dia || "-"} · {p.hora || "-"}
                            </span>
                          </>
                        ) : (
                          <span className="text-zinc-500">
                            Sin programación confirmada
                          </span>
                        )}
                      </div>

                      {(p.partido_id || p.id) ? (
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-sky-300 transition group-hover:text-white">
                          Ver estadísticas →
                        </span>
                      ) : (
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-600">
                          Stats no cargadas
                        </span>
                      )}
                    </div>
                  </div>
                );

                return (p.partido_id || p.id) ? (
                  <Link
                    key={p.id || index}
                    href={`/estadisticas/${encodeURIComponent(p.partido_id || stableMatchId(p.temporada, p.id))}`}
                  >
                    {contenido}
                  </Link>
                ) : (
                  <div key={p.id || index}>{contenido}</div>
                );
              })}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}