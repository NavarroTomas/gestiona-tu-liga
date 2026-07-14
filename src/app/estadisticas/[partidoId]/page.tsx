"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { matchIds } from "@/lib/competitionData";

type EquipoStats = {
  id: number;
  partido_id: string;
  equipo: string;
  temporada: string;
  division: string;
  fecha: string;
  passes: number | null;
  keyPasses: number | null;
  assists: number | null;
  shots: number | null;
  shotsOnTarget: number | null;
  goals: number | null;
  tackles: number | null;
  keyTackles: number | null;
  interceptions: number | null;
  keyInterceptions: number | null;
  possession: number | null;
  possessionsLost: number | null;
  fouls: number | null;
  cornerKicks: number | null;
};

type JugadorStats = {
  id: number;
  partido_id: string;
  nombre: string;
  playerId: string | null;
  posicion: string | null;
  equipo: string;
  temporada: string;
  division: string;
  fecha: string;
  passes: number | null;
  keyPasses: number | null;
  assists: number | null;
  shots: number | null;
  shotsOnTarget: number | null;
  goals: number | null;
  tackles: number | null;
  keyTackles: number | null;
  interceptions: number | null;
  keyInterceptions: number | null;
  possessionsLost: number | null;
  gKSaves: number | null;
  gKCatches: number | null;
  overallRating: number | null;
  score: number | null;
  mvp: number | null;
  rating_apa: number | null;
};

type ClubInfo = {
  nombre: string;
  logo_url: string | null;
};

export default function PartidoEstadisticasPage() {
  const params = useParams();
  const partidoId = decodeURIComponent(params.partidoId as string);

  const [equipos, setEquipos] = useState<EquipoStats[]>([]);
  const [jugadores, setJugadores] = useState<JugadorStats[]>([]);
  const [clubesInfo, setClubesInfo] = useState<ClubInfo[]>([]);
  const [verDetalleCompleto, setVerDetalleCompleto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      setLoading(true);
      setErrorMsg(null);

      let idsConsulta = [partidoId];
      const numericId = /^\d+$/.test(partidoId) ? Number(partidoId) : null;
      let partidoRelacionado: any = null;

      if (numericId !== null) {
        const { data } = await supabase
          .from("partidos")
          .select("id,partido_id,temporada")
          .eq("id", numericId)
          .maybeSingle();
        partidoRelacionado = data;
      } else {
        const { data } = await supabase
          .from("partidos")
          .select("id,partido_id,temporada")
          .eq("partido_id", partidoId)
          .maybeSingle();
        partidoRelacionado = data;
      }

      if (partidoRelacionado) {
        idsConsulta = Array.from(new Set([partidoId, ...matchIds(partidoRelacionado)]));
      }

      const equiposQuery = supabase
        .from("estadisticas_equipos")
        .select(
          `
          id,
          partido_id,
          equipo,
          temporada,
          division,
          fecha,
          passes,
          keyPasses,
          assists,
          shots,
          shotsOnTarget,
          goals,
          tackles,
          keyTackles,
          interceptions,
          keyInterceptions,
          possession,
          possessionsLost,
          fouls,
          cornerKicks
        `,
        )
        .in("partido_id", idsConsulta);

      const jugadoresQuery = supabase
        .from("estadisticas_jugadores")
        .select(
          `
          id,
          partido_id,
          nombre,
          playerId,
          posicion,
          equipo,
          temporada,
          division,
          fecha,
          passes,
          keyPasses,
          assists,
          shots,
          shotsOnTarget,
          goals,
          tackles,
          keyTackles,
          interceptions,
          keyInterceptions,
          possessionsLost,
          gKSaves,
          gKCatches,
          overallRating,
          score,
          mvp,
          rating_apa
        `,
        )
        .in("partido_id", idsConsulta)
        .order("score", { ascending: false });

      const [
        { data: equiposData, error: equiposError },
        { data: jugadoresData, error: jugadoresError },
      ] = await Promise.all([equiposQuery, jugadoresQuery]);

      if (cancelado) return;

      if (equiposError || jugadoresError) {
        console.error("Error cargando detalle del partido:", {
          equiposError,
          jugadoresError,
        });

        setEquipos([]);
        setJugadores([]);
        setClubesInfo([]);
        setErrorMsg("No se pudieron cargar las estadísticas del partido.");
        setLoading(false);
        return;
      }

      const equiposLimpios = (equiposData || []) as unknown as EquipoStats[];
      const jugadoresLimpios = (jugadoresData || []) as unknown as JugadorStats[];

      const nombresEquipos = Array.from(
        new Set(equiposLimpios.map((equipo) => equipo.equipo).filter(Boolean)),
      );

      let clubesData: ClubInfo[] = [];

      if (nombresEquipos.length > 0) {
        const { data: clubes, error: clubesError } = await supabase
          .from("clubes_info")
          .select("nombre, logo_url")
          .in("nombre", nombresEquipos);

        if (clubesError) {
          console.error("Error cargando logos de clubes:", clubesError);
        }

        clubesData = (clubes || []) as unknown as ClubInfo[];
      }

      if (cancelado) return;

      setEquipos(equiposLimpios);
      setJugadores(jugadoresLimpios);
      setClubesInfo(clubesData);
      setLoading(false);
    }

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, [partidoId]);

  function valorGKSave(r: any) {
    return Number(r.gKSAVES || r.gKSaves || r.gksaves || 0);
  }

  const local = equipos[0];
  const visitante = equipos[1];

  const mvp = jugadores.find((j) => Number(j.mvp) === 1);

  const topJugadores = jugadores.slice(0, 6);

  const goleadores = jugadores
    .filter((j) => Number(j.goals || 0) > 0)
    .sort((a, b) => Number(b.goals || 0) - Number(a.goals || 0));

  const asistidores = jugadores
    .filter((j) => Number(j.assists || 0) > 0)
    .sort((a, b) => Number(b.assists || 0) - Number(a.assists || 0));

  const logosPorEquipo = useMemo(() => {
    const mapa = new Map<string, string | null>();

    clubesInfo.forEach((club) => {
      mapa.set(
        String(club.nombre || "")
          .toLowerCase()
          .trim(),
        club.logo_url,
      );
    });

    return mapa;
  }, [clubesInfo]);

  function logoEquipo(nombre?: string) {
    if (!nombre) return null;

    return logosPorEquipo.get(String(nombre).toLowerCase().trim()) || null;
  }

  const arqueros = jugadores.filter(
    (j) => valorGKSave(j) > 0 || Number(j.gKCatches) > 0,
  );

  const ordenPosiciones: Record<string, number> = {
    GK: 1,
    LB: 2,
    CB: 3,
    RB: 4,
    CDM: 5,
    CM: 6,
    CAM: 7,
    LW: 8,
    RW: 9,
    ST: 10,
  };

  function ordenarPorEquipoPosicionScore(lista: any[], equipo: string) {
    return lista
      .filter((j) => j.equipo === equipo)
      .sort((a, b) => {
        const posA = ordenPosiciones[a.posicion] || 99;
        const posB = ordenPosiciones[b.posicion] || 99;

        if (posA !== posB) return posA - posB;

        return Number(b.score || 0) - Number(a.score || 0);
      });
  }

  function EscudoReal({
    nombre,
    grande = false,
  }: {
    nombre?: string;
    grande?: boolean;
  }) {
    const logo = logoEquipo(nombre);
    const size = grande
      ? "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 text-2xl sm:text-3xl"
      : "h-12 w-12 sm:h-16 sm:w-16 text-base sm:text-lg";

    return (
      <div
        className={`${size} overflow-hidden rounded-full border border-sky-400/30 bg-gradient-to-b from-sky-400/20 to-blue-950 flex items-center justify-center font-black shadow-[0_0_25px_rgba(56,189,248,.18)]`}
      >
        {logo ? (
          <img
            src={logo}
            alt={nombre || "Equipo"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          nombre?.slice(0, 2).toUpperCase()
        )}
      </div>
    );
  }

  function EventoCard({
    icon,
    title,
    lista,
    stat,
    empty,
  }: {
    icon: string;
    title: string;
    lista: any[];
    stat: "goals" | "assists";
    empty: string;
  }) {
    return (
      <div className="rounded-[24px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[30px] sm:p-6 shadow-[0_0_24px_rgba(0,120,255,.08)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl">
            {icon}
          </div>

          <h3 className="text-xl font-black uppercase sm:text-2xl">{title}</h3>
        </div>

        {lista.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
            {empty}
          </p>
        ) : (
          <div className="space-y-3">
            {lista.slice(0, 5).map((j) => (
              <div
                key={`${title}-${j.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 p-4"
              >
                <div className="min-w-0">
                  <p className="break-words text-base font-black uppercase sm:truncate sm:text-lg">
                    {j.nombre}
                  </p>

                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    {j.equipo}
                  </p>
                </div>

                <p className="text-3xl font-black text-yellow-300 sm:text-4xl">
                  {Number(j[stat] || 0)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function StatBar({
    label,
    a,
    b,
  }: {
    label: string;
    a?: number | null;
    b?: number | null;
  }) {
    const total = Number(a || 0) + Number(b || 0);

    const porcentajeA = total === 0 ? 50 : (Number(a || 0) / total) * 100;

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 text-sm font-black uppercase tracking-[0.15em]">
          <span className="text-sky-300">{a || 0}</span>

          <span className="text-center text-zinc-500">{label}</span>

          <span className="text-right text-sky-300">{b || 0}</span>
        </div>

        <div className="h-3 rounded-full overflow-hidden bg-black/50 border border-sky-500/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_18px_rgba(56,189,248,.45)]"
            style={{ width: `${porcentajeA}%` }}
          />
        </div>
      </div>
    );
  }

  function MiniStat({ label, value }: { label: string; value: any }) {
    return (
      <div className="rounded-2xl border border-sky-500/15 bg-black/35 p-4 backdrop-blur-sm">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.22em] font-black">
          {label}
        </p>

        <p className="mt-3 text-2xl font-black text-white sm:text-3xl">
          {value ?? 0}
        </p>
      </div>
    );
  }

  function PlayerStatCard({ label, value }: { label: string; value: any }) {
    return (
      <div className="rounded-xl border border-sky-500/10 bg-black/35 p-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-black">
          {label}
        </p>

        <p className="text-xl font-black mt-2">{value ?? 0}</p>
      </div>
    );
  }

  function JugadorDetalleCard({ j }: { j: any }) {
    return (
      <div className="rounded-[28px] border border-sky-500/15 bg-[#020714] p-5 shadow-[0_0_20px_rgba(0,120,255,.08)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-sky-300">
                {j.posicion || "-"}
              </span>

              <h3 className="text-2xl font-black uppercase md:text-3xl">
                {j.mvp ? "⭐ " : ""}
                {j.nombre}
              </h3>
            </div>

            <p className="text-zinc-500 text-sm mt-3 uppercase tracking-[0.12em]">
              {j.equipo}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-2xl bg-yellow-300 px-4 py-3 font-black text-black sm:px-5 shadow-[0_0_20px_rgba(250,204,21,.25)]">
              Score {j.score}
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-black/40 px-4 py-3 font-black sm:px-5">
              Rating {j.overallRating}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
          <PlayerStatCard label="Goles" value={j.goals} />
          <PlayerStatCard label="Asist." value={j.assists} />
          <PlayerStatCard label="Tiros" value={j.shots} />
          <PlayerStatCard label="Al arco" value={j.shotsOnTarget} />
          <PlayerStatCard label="Pases" value={j.passes} />
          <PlayerStatCard label="P. clave" value={j.keyPasses} />
          <PlayerStatCard label="Tackles" value={j.tackles} />
          <PlayerStatCard label="T. clave" value={j.keyTackles} />
          <PlayerStatCard label="Interc." value={j.interceptions} />
          <PlayerStatCard label="I. clave" value={j.keyInterceptions} />
          <PlayerStatCard label="Perdidas" value={j.possessionsLost} />
          <PlayerStatCard label="Atajadas" value={valorGKSave(j)} />
        </div>
      </div>
    );
  }

  function BackLink() {
    return (
      <Link
        href="/estadisticas"
        className="inline-flex items-center gap-2 rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-xs sm:px-5 sm:text-sm font-black uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-500/20"
      >
        ← Volver al Match Center
      </Link>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen overflow-x-hidden text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
        <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-10">
          <BackLink />
          <div className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-10 text-center text-zinc-500">
            Cargando estadísticas del partido...
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="min-h-screen overflow-x-hidden text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
        <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-10">
          <BackLink />
          <div className="rounded-[28px] border border-red-500/30 bg-red-500/10 p-10 text-center text-red-200">
            {errorMsg}
          </div>
        </div>
      </main>
    );
  }

  if (equipos.length < 2) {
    return (
      <main className="min-h-screen overflow-x-hidden text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
        <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-10">
          <BackLink />
          <div className="rounded-[28px] border border-yellow-400/30 bg-yellow-400/10 p-10 text-center text-yellow-200">
            Este partido todavía no tiene los dos equipos cargados
            correctamente.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-white bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]">
      <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-10">
        <BackLink />

        <section className="relative overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020714] p-5 sm:rounded-[36px] md:p-10 shadow-[0_0_55px_rgba(0,120,255,.2)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.12),transparent_40%)]" />

          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-400 sm:text-xs sm:tracking-[0.45em]">
              APA PSO ARGENTINA
            </p>

            <div className="mt-7 grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8">
              <div className="text-center lg:text-left">
                <div className="flex lg:block justify-center">
                  <EscudoReal nombre={local?.equipo} grande />
                </div>

                <h1 className="mt-4 break-words text-xl font-black uppercase sm:text-2xl leading-tight sm:text-3xl md:text-5xl">
                  {local?.equipo}
                </h1>
              </div>

              <div className="text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] font-black">
                  Resultado final
                </p>

                <div className="mt-4 inline-flex items-center justify-center rounded-[24px] border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 sm:rounded-[30px] sm:px-8 sm:py-6 shadow-[0_0_30px_rgba(250,204,21,.12)]">
                  <span className="text-4xl font-black text-yellow-400 sm:text-5xl md:text-7xl whitespace-nowrap drop-shadow-[0_0_10px_rgba(250,204,21,.45)]">
                    {local?.goals}-{visitante?.goals}
                  </span>
                </div>

                <p className="mt-5 text-zinc-500 uppercase tracking-[0.18em] text-xs font-black">
                  Fecha {local?.fecha} · {local?.temporada} · {local?.division}
                </p>
              </div>

              <div className="text-center lg:text-right">
                <div className="flex lg:block justify-center">
                  <EscudoReal nombre={visitante?.equipo} grande />
                </div>

                <h1 className="mt-4 break-words text-xl font-black uppercase sm:text-2xl leading-tight sm:text-3xl md:text-5xl">
                  {visitante?.equipo}
                </h1>
              </div>
            </div>

            {mvp && (
              <div className="mt-8 rounded-[24px] border border-yellow-400/30 bg-gradient-to-r from-yellow-300 to-amber-500 p-5 text-black sm:rounded-[28px] sm:p-6 shadow-[0_0_30px_rgba(250,204,21,.22)]">
                <p className="text-sm uppercase tracking-[0.25em] font-black">
                  MVP del partido
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black uppercase sm:text-2xl sm:text-3xl md:text-4xl">
                      ⭐ {mvp.nombre}
                    </h2>

                    <p className="mt-2 font-bold uppercase tracking-[0.1em]">
                      {mvp.equipo}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="rounded-2xl bg-black/15 px-5 py-3 font-black">
                      Score {mvp.score}
                    </div>

                    <div className="rounded-2xl bg-black/15 px-5 py-3 font-black">
                      Rating {mvp.overallRating}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <EventoCard
            icon="⚽"
            title="Goleadores"
            lista={goleadores}
            stat="goals"
            empty="No hay goles registrados."
          />

          <EventoCard
            icon="🎯"
            title="Asistidores"
            lista={asistidores}
            stat="assists"
            empty="No hay asistencias registradas."
          />
        </section>

        {local && visitante && (
          <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-8 space-y-6">
            <h2 className="text-xl font-black uppercase sm:text-2xl sm:text-3xl md:text-4xl">
              Estadísticas principales
            </h2>

            <StatBar
              label="Posesión"
              a={local.possession}
              b={visitante.possession}
            />
            <StatBar label="Tiros" a={local.shots} b={visitante.shots} />
            <StatBar
              label="Al arco"
              a={local.shotsOnTarget}
              b={visitante.shotsOnTarget}
            />
            <StatBar label="Pases" a={local.passes} b={visitante.passes} />
            <StatBar
              label="P. clave"
              a={local.keyPasses}
              b={visitante.keyPasses}
            />
            <StatBar label="Tackles" a={local.tackles} b={visitante.tackles} />
            <StatBar
              label="Intercepciones"
              a={local.interceptions}
              b={visitante.interceptions}
            />
            <StatBar label="Faltas" a={local.fouls} b={visitante.fouls} />
            <StatBar
              label="Corners"
              a={local.cornerKicks}
              b={visitante.cornerKicks}
            />
          </section>
        )}

        <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-8">
          <h2 className="text-xl font-black uppercase sm:text-2xl sm:text-3xl md:text-4xl mb-8">
            Mejores jugadores
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {topJugadores.map((j, index) => (
              <div
                key={j.id}
                className="rounded-[24px] border border-sky-500/15 bg-black/35 p-4 sm:rounded-[28px] sm:p-5 transition hover:border-sky-400/35 hover:shadow-[0_0_20px_rgba(56,189,248,.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.15em]">
                      #{index + 1}
                    </p>

                    <h3 className="mt-2 break-words text-2xl font-black uppercase md:text-3xl">
                      {j.mvp ? "⭐ " : ""}
                      {j.nombre}
                    </h3>

                    <p className="mt-2 text-zinc-500 uppercase tracking-[0.1em] text-xs">
                      {j.equipo} · {j.posicion || "Sin posición"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-yellow-300 text-black px-4 py-2 font-black shadow-[0_0_18px_rgba(250,204,21,.18)]">
                    {j.score}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <MiniStat label="Goles" value={j.goals} />
                  <MiniStat label="Asist." value={j.assists} />
                  <MiniStat label="Rating" value={j.overallRating} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {local && visitante && (
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {[local, visitante].map((equipo) => (
              <div
                key={equipo.id}
                className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <EscudoReal nombre={equipo.equipo} />

                  <div>
                    <h2 className="text-2xl font-black uppercase md:text-3xl">
                      {equipo.equipo}
                    </h2>

                    <p className="text-zinc-500 uppercase tracking-[0.15em] text-xs mt-1">
                      Estadísticas completas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <MiniStat label="Goles" value={equipo.goals} />
                  <MiniStat label="Asistencias" value={equipo.assists} />
                  <MiniStat label="Posesión" value={`${equipo.possession}%`} />
                  <MiniStat label="Tiros" value={equipo.shots} />
                  <MiniStat label="Al arco" value={equipo.shotsOnTarget} />
                  <MiniStat label="Pases" value={equipo.passes} />
                  <MiniStat label="P. clave" value={equipo.keyPasses} />
                  <MiniStat label="Tackles" value={equipo.tackles} />
                  <MiniStat
                    label="Intercepciones"
                    value={equipo.interceptions}
                  />
                  <MiniStat label="Perdidas" value={equipo.possessionsLost} />
                  <MiniStat label="Faltas" value={equipo.fouls} />
                  <MiniStat label="Corners" value={equipo.cornerKicks} />
                </div>
              </div>
            ))}
          </section>
        )}

        {arqueros.length > 0 && (
          <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-8">
            <h2 className="text-xl font-black uppercase sm:text-2xl sm:text-3xl md:text-4xl mb-8">
              Arqueros
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {arqueros.map((j) => (
                <div
                  key={j.id}
                  className="rounded-[24px] border border-sky-500/15 bg-black/35 p-4 sm:rounded-[28px] sm:p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black uppercase md:text-3xl">
                        {j.nombre}
                      </h3>

                      <p className="text-zinc-500 uppercase tracking-[0.12em] text-xs mt-2">
                        {j.equipo}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-sky-400/10 border border-sky-400/20 px-4 py-2 text-sky-300 font-black">
                      GK
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <MiniStat label="Atajadas" value={valorGKSave(j)} />
                    <MiniStat label="Atrapadas" value={j.gKCatches} />
                    <MiniStat label="Rating" value={j.overallRating} />
                    <MiniStat label="Score" value={j.score} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-black uppercase sm:text-2xl sm:text-3xl md:text-4xl">
                Detalle completo
              </h2>

              <p className="text-zinc-500 uppercase tracking-[0.15em] text-xs mt-2">
                Ordenado por posición y score
              </p>
            </div>

            <button
              onClick={() => setVerDetalleCompleto(!verDetalleCompleto)}
              className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-400/20"
            >
              {verDetalleCompleto ? "Ocultar detalle" : "Ver detalle"}
            </button>
          </div>

          {verDetalleCompleto && local && visitante && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {[local.equipo, visitante.equipo].map((equipoNombre) => (
                <div key={equipoNombre} className="space-y-5">
                  <div className="rounded-[24px] border border-sky-500/15 bg-black/35 p-4 sm:rounded-[28px] sm:p-5">
                    <h3 className="text-2xl font-black uppercase md:text-3xl">
                      {equipoNombre}
                    </h3>
                  </div>

                  {ordenarPorEquipoPosicionScore(jugadores, equipoNombre).map(
                    (j) => (
                      <JugadorDetalleCard key={j.id} j={j} />
                    ),
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
