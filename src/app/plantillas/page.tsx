"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PlantillaJugador = {
  id: number;
  jugador: string;
  equipo: string;
  posicion: string | null;
  estado: string | null;
  temporada: string;
  division: string;
  playerid?: string | null;
  playerId?: string;
};

type ClubInfo = {
  nombre: string;
  logo_url: string | null;
};


export default function PlantillasPage() {
  const temporadas = ["Temporada 4"];

  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const [temporada, setTemporada] = useState("Temporada 4");
  const [division, setDivision] = useState("Primera");
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("Todos");

  const [plantillas, setPlantillas] = useState<PlantillaJugador[]>([]);
  const [equipos, setEquipos] = useState<string[]>([]);
  const [clubesInfo, setClubesInfo] = useState<ClubInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      setLoading(true);
      setErrorMsg(null);

      let plantillasQuery = supabase
        .from("plantillas")
        .select("id,jugador,equipo,posicion,estado,temporada,division,playerid")
        .eq("temporada", temporada)
        .eq("division", division)
        .order("equipo", { ascending: true })
        .order("posicion", { ascending: true })
        .order("jugador", { ascending: true });

      if (equipoSeleccionado !== "Todos") {
        plantillasQuery = plantillasQuery.eq("equipo", equipoSeleccionado);
      }

      const equiposQuery = supabase
        .from("plantillas")
        .select("equipo")
        .eq("temporada", temporada)
        .eq("division", division);

      const [plantillasResult, equiposResult] = await Promise.all([
        plantillasQuery,
        equiposQuery,
      ]);

      if (cancelado) return;

      if (plantillasResult.error || equiposResult.error) {
        console.error("Error cargando plantillas:", {
          plantillasError: plantillasResult.error,
          equiposError: equiposResult.error,
        });

        setPlantillas([]);
        setEquipos([]);
        setClubesInfo([]);
        setErrorMsg("No se pudieron cargar las plantillas.");
        setLoading(false);
        return;
      }

      const plantillasBase = ((plantillasResult.data || []) as unknown as PlantillaJugador[]).map(
        (p) => ({
          ...p,
          playerId: String(p.playerid || "").trim(),
        }),
      );

      const equiposUnicos = Array.from(
        new Set(
          ((equiposResult.data || []) as { equipo: string }[])
            .map((e) => e.equipo)
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b));

      let clubesData: ClubInfo[] = [];

      if (equiposUnicos.length > 0) {
        const { data: clubes, error: clubesError } = await supabase
          .from("clubes_info")
          .select("nombre, logo_url")
          .in("nombre", equiposUnicos);

        if (clubesError) {
          console.error("Error cargando logos de clubes:", clubesError);
        }

        clubesData = (clubes || []) as unknown as ClubInfo[];
      }

      if (cancelado) return;

      setPlantillas(plantillasBase);
      setEquipos(equiposUnicos);
      setClubesInfo(clubesData);
      setLoading(false);
    }

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, [temporada, division, equipoSeleccionado]);

  function cambiarTemporada(temp: string) {
    setTemporada(temp);
    setEquipoSeleccionado("Todos");
  }

  function cambiarDivision(div: string) {
    setDivision(div);
    setEquipoSeleccionado("Todos");
  }

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

  function EscudoEquipo({
    nombre,
    logo,
    size = "md",
  }: {
    nombre?: string;
    logo?: string | null;
    size?: "sm" | "md";
  }) {
    const sizes = {
      sm: "h-9 w-9 rounded-xl text-[10px]",
      md: "h-16 w-16 rounded-2xl text-xl",
    };

    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden border border-sky-300 bg-gradient-to-br from-sky-500 to-blue-950 font-black shadow-[0_0_20px_rgba(56,189,248,.3)] ${sizes[size]}`}
      >
        {logo ? (
          <img
            src={logo}
            alt={nombre || "Club"}
            className="h-full w-full object-contain p-1.5"
            loading="lazy"
          />
        ) : (
          nombre?.slice(0, 2).toUpperCase() || "CL"
        )}
      </div>
    );
  }

  const agrupadoPorEquipo = useMemo(() => {
    const grupos: Record<string, PlantillaJugador[]> = {};

    plantillas.forEach((p) => {
      const equipo = p.equipo || "Sin Club";

      if (!grupos[equipo]) {
        grupos[equipo] = [];
      }

      grupos[equipo].push(p);
    });

    return grupos;
  }, [plantillas]);


  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-sky-400 font-black uppercase tracking-[0.3em]">
          Cargando plantillas...
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] flex items-center justify-center p-6">
        <section className="max-w-xl rounded-[30px] border border-red-500/30 bg-[#020714] p-8 text-center">
          <h1 className="text-3xl font-black uppercase text-red-200">
            Error cargando plantillas
          </h1>
          <p className="mt-3 text-zinc-400">{errorMsg}</p>
        </section>
      </main>
    );
  }
  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 md:p-10 shadow-[0_0_55px_rgba(0,120,255,.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10">
            <p className="text-sky-400 text-xs uppercase tracking-[0.45em] font-black">
              APA PSO ARGENTINA
            </p>

            <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic leading-none">
              <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                Plantillas
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Consultá los jugadores registrados por club, temporada y división.
              Cada jugador con Player ID enlaza directamente a su perfil
              histórico.
            </p>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Temporada
                </p>
                <p className="mt-2 text-2xl font-black text-sky-300">
                  {temporada.replace("Temporada ", "T")}
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  División
                </p>
                <p className="mt-2 text-2xl font-black text-yellow-300">
                  {division}
                </p>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Club
                </p>
                <p className="mt-2 text-2xl font-black text-purple-300 truncate">
                  {equipoSeleccionado}
                </p>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-black/35 p-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.25em] font-black">
                  Jugadores
                </p>
                <p className="mt-2 text-2xl font-black text-green-400">
                  {plantillas.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6 md:p-8 shadow-[0_0_35px_rgba(0,120,255,.12)]">
          <div className="grid gap-7">
            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Temporada
              </p>

              <div className="grid grid-cols-1 gap-3">
                {temporadas.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => cambiarTemporada(temp)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      temporada === temp
                        ? "border-sky-300 bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow-[0_0_20px_rgba(56,189,248,.45)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                División
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {divisiones.map((div) => (
                  <button
                    key={div}
                    onClick={() => cambiarDivision(div)}
                    className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${
                      division === div
                        ? "border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sky-300 uppercase tracking-[0.3em] text-xs font-black mb-4">
                Club
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setEquipoSeleccionado("Todos")}
                  className={`rounded-2xl border px-5 py-3 text-sm font-black uppercase transition-all ${
                    equipoSeleccionado === "Todos"
                      ? "border-sky-300 bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.35)]"
                      : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                  }`}
                >
                  Todos
                </button>

                {equipos.map((equipo) => (
                  <button
                    key={equipo}
                    onClick={() => setEquipoSeleccionado(equipo)}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black uppercase transition-all ${
                      equipoSeleccionado === equipo
                        ? "border-sky-300 bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,.35)]"
                        : "border-sky-500/20 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                    }`}
                  >
                    <EscudoEquipo
                      nombre={equipo}
                      logo={logoEquipo(equipo)}
                      size="sm"
                    />

                    <span>{equipo}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <p className="text-sky-300 uppercase tracking-[0.35em] text-xs font-black">
            Selección actual
          </p>

          <h2 className="mt-3 text-3xl md:text-5xl font-black uppercase">
            {temporada}
            <span className="text-sky-400"> / </span>
            {division}
          </h2>

          <p className="mt-3 text-zinc-500">
            {equipoSeleccionado} · {plantillas.length} jugadores encontrados
          </p>
        </section>

        {plantillas.length === 0 ? (
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-10 text-center">
            <p className="text-zinc-500">
              Todavía no hay jugadores cargados en esta plantilla.
            </p>
          </section>
        ) : (
          <section className="space-y-8">
            {Object.keys(agrupadoPorEquipo).map((equipo) => {
              const jugadores = [...agrupadoPorEquipo[equipo]].sort((a, b) => {
                const orden: Record<string, number> = {
                  GK: 1,
                  POR: 1,
                  CB: 2,
                  LB: 2,
                  RB: 2,
                  DEF: 2,
                  CDM: 3,
                  CM: 3,
                  CAM: 3,
                  MED: 3,
                  LW: 4,
                  RW: 4,
                  ST: 4,
                  CF: 4,
                  DEL: 4,
                };

                const posA = orden[(a.posicion || "").toUpperCase()] || 99;
                const posB = orden[(b.posicion || "").toUpperCase()] || 99;

                return posA - posB;
              });

              return (
                <div
                  key={equipo}
                  className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 shadow-[0_0_30px_rgba(0,120,255,.10)]"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <EscudoEquipo nombre={equipo} logo={logoEquipo(equipo)} />

                      <div>
                        <h2 className="text-3xl font-black uppercase">
                          {equipo}
                        </h2>
                        <p className="text-zinc-500 mt-1">
                          {jugadores.length} jugadores registrados
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/equipos/${encodeURIComponent(equipo)}`}
                      className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-400/20"
                    >
                      Ver club →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {jugadores.map((j: any) => {
                      const card = (
                        <div className="rounded-2xl border border-sky-500/15 bg-black/35 p-5 transition hover:border-sky-400/40 hover:shadow-[0_0_20px_rgba(56,189,248,.10)]">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sky-400 text-[10px] uppercase tracking-[0.25em] font-black mb-2">
                                Jugador
                              </p>

                              <h3 className="text-xl font-black uppercase">
                                {j.jugador}
                              </h3>

                              <p className="text-zinc-500 text-sm mt-1">
                                {j.posicion || "Sin posición"} ·{" "}
                                {j.estado || "Activo"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 font-black text-zinc-300">
                              {j.posicion || "-"}
                            </div>
                          </div>

                          <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                            {j.playerId ? "Ver perfil →" : "Sin Player ID"}
                          </p>
                        </div>
                      );

                      if (j.playerId) {
                        return (
                          <Link
                            key={j.id}
                            href={`/jugadores/${encodeURIComponent(j.playerId)}`}
                          >
                            {card}
                          </Link>
                        );
                      }

                      return <div key={j.id}>{card}</div>;
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
