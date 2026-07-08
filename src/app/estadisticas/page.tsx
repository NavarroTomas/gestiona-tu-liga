"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type CompeticionValue = "liga" | "copa_clasificatoria" | "copa_argentina" | "copa_apa" | "copa_campeones" | "playoffs";

type EquipoPartido = {
  partido_id: string;
  temporada: string;
  competicion?: string | null;
  division?: string | null;
  grupo?: string | null;
  fase?: string | null;
  fecha: string;
  equipo: string;
  goals: number | null;
};

type PartidoAgrupado = {
  partido_id: string;
  temporada: string;
  competicion?: string | null;
  division?: string | null;
  grupo?: string | null;
  fase?: string | null;
  fecha: string;
  equipos: EquipoPartido[];
};

type ClubInfo = {
  nombre: string;
  logo_url: string | null;
};

const temporadas = ["Temporada 4"];

const competiciones: { value: CompeticionValue; label: string; short: string }[] = [
  { value: "liga", label: "Torneo de Liga", short: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas", short: "Clasificación" },
  { value: "copa_argentina", label: "Copa Argentina", short: "Argentina" },
  { value: "copa_apa", label: "Copa APA", short: "APA" },
  { value: "copa_campeones", label: "Copa de Campeones", short: "Campeones" },
  { value: "playoffs", label: "Playoffs de Ascenso", short: "Playoffs" },
];

const divisiones = ["Primera", "Segunda"];
const grupos = ["A", "B", "C", "D"];
const fasesEliminacion = ["Octavos", "Cuartos", "Semifinal", "Final"];
const fasesCampeones = ["Semifinal", "Final"];
const fasesPlayoffs = ["Semifinal", "Final Ascenso", "Promoción"];

function normalizarDivision(value?: string | null) {
  const v = String(value || "").toLowerCase().trim();

  if (v === "primera" || v === "primera division" || v === "primera división") return "primera";
  if (v === "segunda" || v === "segunda division" || v === "segunda división") return "segunda";

  return v;
}

function faseDb(value: string) {
  const v = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (v === "semifinal" || v === "semis") return "semifinal";
  if (v === "final") return "final";
  if (v === "final ascenso" || v === "final_ascenso") return "final_ascenso";
  if (v === "promocion" || v === "promoción") return "promocion";
  if (v === "octavos") return "octavos";
  if (v === "cuartos") return "cuartos";

  return v;
}

function labelCompeticion(value?: string | null) {
  return competiciones.find((c) => c.value === value)?.label || "Competición oficial";
}

function labelContexto(competicion: CompeticionValue, division: string, grupo: string, fase: string) {
  if (competicion === "liga") return division;
  if (competicion === "copa_clasificatoria") return `Grupo ${grupo}`;
  return fase;
}

function labelContextoPartido(partido: PartidoAgrupado) {
  const competicion = String(partido.competicion || "liga") as CompeticionValue;

  if (competicion === "copa_clasificatoria") return `Grupo ${partido.grupo || "-"}`;
  if (competicion === "copa_argentina" || competicion === "copa_apa" || competicion === "copa_campeones" || competicion === "playoffs") return partido.fase || "Fase";

  return partido.division || "División";
}

export default function EstadisticasPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [competicion, setCompeticion] = useState<CompeticionValue>("liga");
  const [division, setDivision] = useState("Primera");
  const [grupo, setGrupo] = useState("A");
  const [fase, setFase] = useState("Octavos");
  const [fecha, setFecha] = useState("Todas");

  const [fechas, setFechas] = useState<string[]>([]);
  const [partidos, setPartidos] = useState<PartidoAgrupado[]>([]);
  const [clubesInfo, setClubesInfo] = useState<ClubInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const contextoActual = labelContexto(competicion, division, grupo, fase);
  const fasesDisponibles = competicion === "copa_campeones" ? fasesCampeones : competicion === "playoffs" ? fasesPlayoffs : fasesEliminacion;

  useEffect(() => {
    setFecha("Todas");
  }, [temporada, competicion, division, grupo, fase]);

  useEffect(() => {
    if (competicion === "copa_campeones" && !fasesCampeones.includes(fase)) {
      setFase("Semifinal");
    }

    if (competicion === "playoffs" && !fasesPlayoffs.includes(fase)) {
      setFase("Semifinal");
    }
  }, [competicion, fase]);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      setLoading(true);

      let partidosQuery = supabase
        .from("partidos")
        .select("id, partido_id, local, visitante, resultado, fecha, temporada, competicion, division, grupo, fase")
        .eq("temporada", temporada)
        .eq("competicion", competicion);

      if (competicion === "liga") {
        partidosQuery = partidosQuery.in("division", [division, normalizarDivision(division)]);
      }

      if (competicion === "copa_clasificatoria") {
        partidosQuery = partidosQuery.eq("grupo", grupo);
      }

      if (competicion === "copa_argentina" || competicion === "copa_apa" || competicion === "copa_campeones" || competicion === "playoffs") {
        partidosQuery = partidosQuery.eq("fase", faseDb(fase));
      }

      if (fecha !== "Todas") {
        partidosQuery = partidosQuery.eq("fecha", fecha);
      }

      const { data: partidosBase, error: partidosBaseError } = await partidosQuery.order("fecha", {
        ascending: false,
      });

      if (cancelado) return;

      if (partidosBaseError) {
        console.error("Error cargando partidos base:", partidosBaseError);
        setFechas([]);
        setPartidos([]);
        setClubesInfo([]);
        setLoading(false);
        return;
      }

      const partidosBaseLimpios = ((partidosBase || []) as any[]).filter((p) => p.partido_id);

      const partidoIds = Array.from(
        new Set(partidosBaseLimpios.map((p) => String(p.partido_id)).filter(Boolean)),
      );

      if (partidoIds.length === 0) {
        setFechas([]);
        setPartidos([]);
        setClubesInfo([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("estadisticas_equipos")
        .select("partido_id, temporada, division, fecha, equipo, goals")
        .in("partido_id", partidoIds)
        .order("fecha", { ascending: false });

      if (cancelado) return;

      if (error) {
        console.error("Error cargando estadísticas de equipos:", error);
        setFechas([]);
        setPartidos([]);
        setClubesInfo([]);
        setLoading(false);
        return;
      }

      const metaPorPartido = new Map<string, any>();

      partidosBaseLimpios.forEach((p: any) => {
        metaPorPartido.set(String(p.partido_id), p);
      });

      const filas = ((data || []) as any[]).map((item) => {
        const meta = metaPorPartido.get(String(item.partido_id));

        return {
          ...item,
          temporada: meta?.temporada || item.temporada || temporada,
          competicion: meta?.competicion || competicion,
          division: meta?.division || item.division || division,
          grupo: meta?.grupo || null,
          fase: meta?.fase || null,
          fecha: String(meta?.fecha || item.fecha || ""),
        };
      }) as EquipoPartido[];

      const fechasUnicas = Array.from(
        new Set(filas.map((item) => String(item.fecha || "")).filter(Boolean)),
      ).sort((a, b) => Number(a) - Number(b));

      const agrupados = new Map<string, PartidoAgrupado>();

      filas.forEach((equipo) => {
        if (!agrupados.has(equipo.partido_id)) {
          agrupados.set(equipo.partido_id, {
            partido_id: equipo.partido_id,
            temporada: equipo.temporada,
            competicion: equipo.competicion,
            division: equipo.division,
            grupo: equipo.grupo,
            fase: equipo.fase,
            fecha: equipo.fecha,
            equipos: [],
          });
        }

        agrupados.get(equipo.partido_id)?.equipos.push(equipo);
      });

      const lista = Array.from(agrupados.values()).sort((a, b) => Number(b.fecha) - Number(a.fecha));

      const nombresEquipos = Array.from(
        new Set(
          lista
            .flatMap((partido) => partido.equipos.map((equipo) => equipo.equipo))
            .filter(Boolean),
        ),
      );

      let clubesData: ClubInfo[] = [];

      if (nombresEquipos.length > 0) {
        const { data: clubes, error: clubesError } = await supabase
          .from("clubes_info")
          .select("nombre, logo_url")
          .in("nombre", nombresEquipos);

        if (clubesError) console.error("Error cargando clubes:", clubesError);

        clubesData = (clubes || []) as unknown as ClubInfo[];
      }

      if (cancelado) return;

      setFechas(fechasUnicas);
      setPartidos(lista);
      setClubesInfo(clubesData);
      setLoading(false);
    }

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, [temporada, competicion, division, grupo, fase, fecha]);

  const logosPorEquipo = useMemo(() => {
    const mapa = new Map<string, string | null>();

    clubesInfo.forEach((club) => {
      mapa.set(String(club.nombre || "").toLowerCase().trim(), club.logo_url);
    });

    return mapa;
  }, [clubesInfo]);

  function logoEquipo(nombre?: string) {
    if (!nombre) return null;
    return logosPorEquipo.get(String(nombre).toLowerCase().trim()) || null;
  }

  function EscudoEquipo({ nombre, logo }: { nombre?: string; logo?: string | null }) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-500 to-blue-950 text-sm font-black shadow-[0_0_15px_rgba(56,189,248,.22)]">
        {logo ? (
          <img src={logo} alt={nombre || "Equipo"} className="h-full w-full object-contain p-1.5" loading="lazy" />
        ) : (
          nombre?.slice(0, 2).toUpperCase()
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 md:px-8">
        <div className="relative min-h-[330px] overflow-hidden rounded-[34px] border border-sky-500/40 bg-[#020714] shadow-[0_0_55px_rgba(0,120,255,.28)] md:min-h-[390px]">
          <Image
            src="/images/stats/stats.png"
            alt="Match Center APA"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#020714]/96 via-[#020714]/74 to-[#020714]/20" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020714]/90 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_40%)]" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="relative z-10 flex min-h-[330px] items-center p-7 md:min-h-[390px] md:p-10">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
                APA PSO ARGENTINA
              </p>

              <h1 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-7xl">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  MATCH
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                  CENTER
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base md:leading-8">
                Explorá estadísticas completas, resultados y rendimiento de cada
                partido de APA PSO Argentina UE5.
              </p>
            </div>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[30px] border border-sky-500/30 bg-[#020714] p-6 shadow-[0_0_35px_rgba(0,120,255,.14)] md:p-7">
          <Image
            src="/images/stats/seleccion.png"
            alt="Selector de estadísticas APA"
            fill
            sizes="100vw"
            className="object-cover object-center opacity-40"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#020714]/97 via-[#020714]/84 to-[#020714]/58" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.12),transparent_42%)]" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

          <div className="relative z-10 grid gap-6">
            <FilterBlock title="Temporada">
              <div className="grid grid-cols-1 gap-3">
                {temporadas.map((temp) => (
                  <FilterButton key={temp} active={temporada === temp} variant="sky" onClick={() => setTemporada(temp)}>
                    {temp.replace("Temporada ", "Temporada ")}
                  </FilterButton>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock title="Competencia">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                {competiciones.map((item) => (
                  <FilterButton key={item.value} active={competicion === item.value} variant="yellow" onClick={() => setCompeticion(item.value)}>
                    {item.short}
                  </FilterButton>
                ))}
              </div>
            </FilterBlock>

            {competicion === "liga" && (
              <FilterBlock title="División">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {divisiones.map((div) => (
                    <FilterButton key={div} active={division === div} variant="yellow" onClick={() => setDivision(div)}>
                      {div}
                    </FilterButton>
                  ))}
                </div>
              </FilterBlock>
            )}

            {competicion === "copa_clasificatoria" && (
              <FilterBlock title="Grupo">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {grupos.map((g) => (
                    <FilterButton key={g} active={grupo === g} variant="yellow" onClick={() => setGrupo(g)}>
                      Grupo {g}
                    </FilterButton>
                  ))}
                </div>
              </FilterBlock>
            )}

            {(competicion === "copa_argentina" || competicion === "copa_apa" || competicion === "copa_campeones") && (
              <FilterBlock title="Fase">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {fasesDisponibles.map((f) => (
                    <FilterButton key={f} active={fase === f} variant="yellow" onClick={() => setFase(f)}>
                      {f}
                    </FilterButton>
                  ))}
                </div>
              </FilterBlock>
            )}

            <FilterBlock title="Fecha">
              <div className="flex flex-wrap gap-3">
                <FilterButton active={fecha === "Todas"} variant="sky" onClick={() => setFecha("Todas")}>
                  Todas
                </FilterButton>

                {fechas.map((f) => (
                  <FilterButton key={f} active={fecha === f} variant="sky" onClick={() => setFecha(f)}>
                    Fecha {f}
                  </FilterButton>
                ))}
              </div>
            </FilterBlock>
          </div>
        </section>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">Selección actual</p>

          <h2 className="mt-3 text-3xl font-black uppercase md:text-5xl">
            {temporada}
            <span className="text-sky-400"> / </span>
            {labelCompeticion(competicion)}
            <span className="text-sky-400"> / </span>
            {contextoActual}
          </h2>

          <p className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
            {fecha === "Todas" ? "Todas las fechas" : `Fecha ${fecha}`}
          </p>
        </div>

        <div className="space-y-5">
          {loading ? (
            <div className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-10 text-center text-zinc-500">Cargando partidos...</div>
          ) : partidos.length === 0 ? (
            <div className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-10 text-center text-zinc-500">
              No hay partidos cargados para esta selección.
            </div>
          ) : (
            partidos.map((partido) => {
              const e1 = partido.equipos[0];
              const e2 = partido.equipos[1];

              if (!e1 || !e2) {
                return (
                  <div key={partido.partido_id} className="rounded-[28px] border border-yellow-400/20 bg-yellow-400/10 p-6 text-sm text-yellow-200">
                    Partido incompleto: {partido.partido_id}
                  </div>
                );
              }

              return (
                <Link
                  key={partido.partido_id}
                  href={`/estadisticas/${encodeURIComponent(partido.partido_id)}`}
                  className="group relative block overflow-hidden rounded-[32px] border border-sky-500/20 bg-[#020714] p-6 transition-all duration-300 hover:border-sky-400/50 hover:shadow-[0_0_35px_rgba(56,189,248,.16)] md:p-8"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.12),transparent_35%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative z-10">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-zinc-500">Fecha {partido.fecha}</p>

                        <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                          {partido.temporada} · {labelCompeticion(partido.competicion)} · {labelContextoPartido(partido)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-sky-300 transition group-hover:bg-sky-400/20">
                        Ver detalle →
                      </div>
                    </div>

                    <div className="grid grid-cols-1 items-center gap-4 md:gap-8 xl:grid-cols-[1fr_auto_1fr]">
                      <div className="flex min-w-0 items-center gap-4">
                        <EscudoEquipo nombre={e1.equipo} logo={logoEquipo(e1.equipo)} />

                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-black uppercase md:text-3xl">{e1.equipo}</h2>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="min-w-[140px] rounded-3xl border border-yellow-400/30 bg-yellow-400/10 px-6 py-4 text-center shadow-[0_0_20px_rgba(250,204,21,.08)]">
                          <span className="whitespace-nowrap text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,.45)] md:text-5xl">
                            {e1.goals ?? 0}-{e2.goals ?? 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center justify-end gap-4">
                        <div className="min-w-0 text-right">
                          <h2 className="truncate text-lg font-black uppercase md:text-3xl">{e2.equipo}</h2>
                        </div>

                        <EscudoEquipo nombre={e2.equipo} logo={logoEquipo(e2.equipo)} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-300">{title}</p>
      {children}
    </div>
  );
}

function FilterButton({
  active,
  variant,
  onClick,
  children,
}: {
  active: boolean;
  variant: "sky" | "yellow";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const activeClass =
    variant === "yellow"
      ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
      : "border-sky-300 bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.35)]";

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-5 py-3 text-sm font-black uppercase transition-all ${
        active ? activeClass : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
      }`}
      type="button"
    >
      {children}
    </button>
  );
}
