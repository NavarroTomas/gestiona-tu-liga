"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type PartidoCopa = {
  id: string;
  local: string;
  visitante: string;
  resultado?: string | null;
  fecha?: string | number | null;
  temporada: string;
  division: string;
  dia?: string | null;
  hora?: string | null;
  competicion?: string | null;
  grupo?: string | null;
  fase?: string | null;
  ronda?: string | null;
};

type ClubVisual = {
  nombre: string;
  logo_url?: string | null;
  slug?: string | null;
};

type EquipoTabla = {
  equipo: string;
  grupo: string;
  pts: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
};

const TEMPORADA = "Temporada 4";
const GRUPOS = ["A", "B", "C", "D"];
const COMPETICION_GRUPOS = "copa_clasificatoria";

function normalizar(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function calcularTablaGrupo(partidos: PartidoCopa[], grupo: string): EquipoTabla[] {
  const mapa: Record<string, EquipoTabla> = {};

  function asegurar(nombre: string) {
    if (!mapa[nombre]) {
      mapa[nombre] = {
        equipo: nombre,
        grupo,
        pts: 0,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0,
      };
    }
  }

  partidos
    .filter((p) => p.grupo === grupo)
    .forEach((p) => {
      asegurar(p.local);
      asegurar(p.visitante);

      if (!p.resultado || !p.resultado.includes("-")) return;

      const [glRaw, gvRaw] = p.resultado.split("-");
      const gl = Number(glRaw?.trim());
      const gv = Number(gvRaw?.trim());

      if (Number.isNaN(gl) || Number.isNaN(gv)) return;

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
      } else if (gl < gv) {
        mapa[p.visitante].pg += 1;
        mapa[p.visitante].pts += 3;
        mapa[p.local].pp += 1;
      } else {
        mapa[p.local].pe += 1;
        mapa[p.visitante].pe += 1;
        mapa[p.local].pts += 1;
        mapa[p.visitante].pts += 1;
      }
    });

  return Object.values(mapa)
    .map((e) => ({ ...e, dg: e.gf - e.gc }))
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.equipo.localeCompare(b.equipo);
    });
}

function destinoPorPosicion(index: number) {
  return index <= 1 ? "Copa Argentina" : "Copa APA";
}

function claseFila(index: number) {
  if (index <= 1) {
    return {
      border: "border-l-yellow-400",
      dot: "bg-yellow-300",
      text: "text-yellow-300",
      bg: "bg-yellow-400/10",
      label: "ARG",
    };
  }

  return {
    border: "border-l-sky-400",
    dot: "bg-sky-300",
    text: "text-sky-300",
    bg: "bg-sky-400/10",
    label: "APA",
  };
}

export default function CopasPublicPage() {
  const [partidos, setPartidos] = useState<PartidoCopa[]>([]);
  const [clubes, setClubes] = useState<ClubVisual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);

    const [partidosRes, clubesRes] = await Promise.all([
      supabase
        .from("partidos")
        .select("id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda")
        .eq("temporada", TEMPORADA)
        .eq("competicion", COMPETICION_GRUPOS)
        .eq("fase", "grupos")
        .order("grupo", { ascending: true })
        .order("fecha", { ascending: true }),

      supabase
        .from("v_clubes_temporada_public")
        .select("nombre, slug, logo_url")
        .eq("temporada", TEMPORADA)
        .eq("activo", true),
    ]);

    if (partidosRes.error) {
      console.log(partidosRes.error);
      setPartidos([]);
    } else {
      setPartidos((partidosRes.data || []) as PartidoCopa[]);
    }

    if (clubesRes.error) {
      console.log(clubesRes.error);
      setClubes([]);
    } else {
      setClubes((clubesRes.data || []) as ClubVisual[]);
    }

    setLoading(false);
  }

  const mapaClubes = useMemo(() => {
    const mapa = new Map<string, ClubVisual>();

    clubes.forEach((club) => {
      mapa.set(normalizar(club.nombre), club);
    });

    return mapa;
  }, [clubes]);

  const tablas = useMemo(() => {
    return Object.fromEntries(
      GRUPOS.map((grupo) => [grupo, calcularTablaGrupo(partidos, grupo)]),
    ) as Record<string, EquipoTabla[]>;
  }, [partidos]);

  const resumenClasificacion = useMemo(() => {
    let argentina = 0;
    let apa = 0;

    GRUPOS.forEach((grupo) => {
      const tabla = tablas[grupo] || [];
      argentina += Math.min(tabla.length, 2);
      apa += Math.max(tabla.length - 2, 0);
    });

    return { argentina, apa };
  }, [tablas]);

  function logoEquipo(nombre: string) {
    return mapaClubes.get(normalizar(nombre))?.logo_url || "/placeholder-logo.png";
  }

  function slugEquipo(nombre: string) {
    return mapaClubes.get(normalizar(nombre))?.slug;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-[1800px] space-y-8">
        <section className="relative overflow-hidden rounded-[40px] border border-yellow-500/25 bg-[#020714] p-7 shadow-[0_0_55px_rgba(250,204,21,.12)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/30" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_390px] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-yellow-300">
                Competición APA
              </p>

              <h1 className="mt-5 text-5xl font-black uppercase italic leading-none md:text-7xl">
                Clasificación a Copas
              </h1>

              <p className="mt-6 max-w-4xl text-lg leading-8 text-zinc-300">
                Cuatro grupos de cuatro equipos. Los dos primeros de cada grupo van a Copa Argentina y los dos últimos a Copa APA.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/competicion"
                  className="rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-white"
                >
                  Volver a competición
                </Link>

                <Link
                  href="/fixture"
                  className="rounded-2xl border border-white/10 bg-black/35 px-5 py-3 text-xl font-black uppercase text-white transition hover:border-white/30"
                >
                  Ver fixture
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-black/35 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                Destinos actuales
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-6">
                  <p className="text-[10px] font-black uppercase text-yellow-300">
                    Copa Argentina
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {resumenClasificacion.argentina}
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-400/25 bg-sky-400/10 p-6">
                  <p className="text-[10px] font-black uppercase text-sky-300">
                    Copa APA
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {resumenClasificacion.apa}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#020714]/85 px-7 py-5">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-yellow-300" />
              1° y 2° clasifican a Copa Argentina
            </span>

            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-sky-300" />
              3° y 4° clasifican a Copa APA
            </span>

            <span className="ml-auto text-zinc-600">
              Orden: PTS · DG · GF
            </span>
          </div>
        </section>

        {loading ? (
          <p className="rounded-3xl border border-white/10 bg-black/35 p-6 text-center text-zinc-400">
            Cargando clasificación...
          </p>
        ) : (
          <section className="grid grid-cols-1 gap-6 grid-cols-1">
            {GRUPOS.map((grupo) => (
              <section
                key={grupo}
                className="overflow-hidden rounded-[36px] border border-sky-500/25 bg-[#020714]/95 shadow-[0_0_35px_rgba(0,0,0,.25)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-7 py-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">
                      Grupo {grupo}
                    </p>
                    <h2 className="mt-1 text-4xl font-black uppercase">
                      Tabla de posiciones
                    </h2>
                  </div>

                  <span className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                    {tablas[grupo]?.length || 0} equipos
                  </span>
                </div>

                <div className="p-6">
                  <table className="w-full table-fixed border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-xs uppercase tracking-[0.14em] text-sky-300/80">
                        <th className="w-[64px] py-4 text-center">#</th>
                        <th className="py-4 text-left">Equipo</th>
                        <th className="w-[64px] py-4 text-center">PJ</th>
                        <th className="hidden w-[64px] py-4 text-center md:table-cell">PG</th>
                        <th className="hidden w-[64px] py-4 text-center md:table-cell">PE</th>
                        <th className="hidden w-[64px] py-4 text-center md:table-cell">PP</th>
                        <th className="hidden w-[64px] py-4 text-center lg:table-cell">GF</th>
                        <th className="hidden w-[64px] py-4 text-center lg:table-cell">GC</th>
                        <th className="w-[64px] py-4 text-center">DG</th>
                        <th className="w-[72px] py-4 text-center">PTS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(tablas[grupo] || []).length === 0 ? (
                        <tr>
                          <td colSpan={10} className="rounded-2xl border border-white/10 bg-black/35 py-8 text-center text-zinc-500">
                            Sin datos cargados para este grupo.
                          </td>
                        </tr>
                      ) : (
                        tablas[grupo].map((equipo, index) => {
                          const estilo = claseFila(index);
                          const slug = slugEquipo(equipo.equipo);
                          const href = slug
                            ? `/equipos/${encodeURIComponent(slug)}`
                            : `/equipos/${encodeURIComponent(equipo.equipo)}`;

                          return (
                            <tr
                              key={`${grupo}-${equipo.equipo}`}
                              className={`border-l-4 ${estilo.border} bg-gradient-to-r from-[#06152c] via-[#071a33] to-[#030b18]`}
                            >
                              <td className={`rounded-l-xl border-l-4 ${estilo.border} px-4 py-6 text-center font-black text-zinc-300`}>
                                <div className="flex items-center justify-center gap-2">
                                  <span>{index + 1}</span>
                                  <span className={`h-3.5 w-3.5 rounded-full ${estilo.dot}`} />
                                </div>
                              </td>

                              <td className="px-4 py-6">
                                <Link href={href} className="group flex min-w-0 items-center gap-3">
                                  <img
                                    src={logoEquipo(equipo.equipo)}
                                    alt={equipo.equipo}
                                    className="h-12 w-12 shrink-0 rounded-full border border-white/10 bg-black/60 object-contain"
                                  />

                                  <div className="min-w-0">
                                    <p className="truncate text-xl font-black uppercase text-white group-hover:text-sky-300">
                                      {equipo.equipo}
                                    </p>
                                    <p className={`mt-1 text-xs font-black uppercase tracking-[0.13em] ${estilo.text}`}>
                                      {destinoPorPosicion(index)}
                                    </p>
                                  </div>
                                </Link>
                              </td>

                              <td className="py-6 text-center text-lg font-black">{equipo.pj}</td>
                              <td className="hidden py-6 text-center text-lg font-black md:table-cell">{equipo.pg}</td>
                              <td className="hidden py-6 text-center text-lg font-black md:table-cell">{equipo.pe}</td>
                              <td className="hidden py-6 text-center text-lg font-black md:table-cell">{equipo.pp}</td>
                              <td className="hidden py-6 text-center text-lg font-black text-emerald-300 lg:table-cell">{equipo.gf}</td>
                              <td className="hidden py-6 text-center text-lg font-black text-red-300 lg:table-cell">{equipo.gc}</td>
                              <td className="py-6 text-center text-lg font-black text-sky-300">
                                {equipo.dg > 0 ? `+${equipo.dg}` : equipo.dg}
                              </td>
                              <td className="rounded-r-xl py-6 text-center text-xl font-black text-yellow-300">
                                {equipo.pts}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-zinc-400">
                    <span className="text-yellow-300">★ 1°-2° Copa Argentina</span>
                    <span className="text-sky-300">★ 3°-4° Copa APA</span>
                  </div>
                </div>
              </section>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
