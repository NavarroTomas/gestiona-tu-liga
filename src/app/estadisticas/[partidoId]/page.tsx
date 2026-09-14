"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { matchIds } from "@/lib/competitionData";
import MatchNavigation from "@/components/match-report/MatchNavigation";
import MatchHero from "@/components/match-report/MatchHero";
import {
  FullPlayerDetails,
  Goalkeepers,
  MatchComparison,
  MatchEvents,
  TeamDetails,
  TopPlayers,
} from "@/components/match-report/MatchSections";
import type {
  ClubInfo,
  EquipoStats,
  JugadorStats,
  PartidoInfo,
} from "@/components/match-report/types";
import {
  normalizarNombre,
  ordenarTopJugadores,
  valorGKSave,
} from "@/components/match-report/utils";

const PARTIDO_SELECT =
  "id,partido_id,local,visitante,resultado,fecha,temporada,division,competicion,fase,grupo,dia,hora";

export default function PartidoEstadisticasPage() {
  const params = useParams();
  const partidoId = decodeURIComponent(params.partidoId as string);

  const [equipos, setEquipos] = useState<EquipoStats[]>([]);
  const [jugadores, setJugadores] = useState<JugadorStats[]>([]);
  const [clubesInfo, setClubesInfo] = useState<ClubInfo[]>([]);
  const [partido, setPartido] = useState<PartidoInfo | null>(null);
  const [previousMatch, setPreviousMatch] = useState<PartidoInfo | null>(null);
  const [nextMatch, setNextMatch] = useState<PartidoInfo | null>(null);
  const [verDetalleCompleto, setVerDetalleCompleto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      setLoading(true);
      setErrorMsg(null);
      setPreviousMatch(null);
      setNextMatch(null);

      const numericId = /^\d+$/.test(partidoId) ? Number(partidoId) : null;
      const currentQuery = supabase.from("partidos").select(PARTIDO_SELECT);
      const { data: partidoData, error: partidoError } = numericId !== null
        ? await currentQuery.eq("id", numericId).maybeSingle()
        : await currentQuery.eq("partido_id", partidoId).maybeSingle();

      if (cancelado) return;

      if (partidoError || !partidoData) {
        console.error("Error cargando partido:", partidoError);
        setErrorMsg("No se pudo encontrar el partido solicitado.");
        setLoading(false);
        return;
      }

      const partidoActual = partidoData as unknown as PartidoInfo;
      const idsConsulta = Array.from(
        new Set([partidoId, ...matchIds(partidoActual)].filter(Boolean)),
      );

      let contextoQuery = supabase
        .from("partidos")
        .select(PARTIDO_SELECT)
        .eq("temporada", partidoActual.temporada || "")
        .order("id", { ascending: true });

      if (partidoActual.competicion) {
        contextoQuery = contextoQuery.eq("competicion", partidoActual.competicion);
      }
      if (partidoActual.division) {
        contextoQuery = contextoQuery.eq("division", partidoActual.division);
      }

      const equiposQuery = supabase
        .from("estadisticas_equipos")
        .select(`
          id, partido_id, equipo, temporada, division, fecha,
          passes, keyPasses, assists, shots, shotsOnTarget, goals,
          tackles, keyTackles, interceptions, keyInterceptions,
          possession, possessionsLost, fouls, cornerKicks
        `)
        .in("partido_id", idsConsulta);

      const jugadoresQuery = supabase
        .from("estadisticas_jugadores")
        .select(`
          id, partido_id, nombre, playerId, posicion, equipo, temporada,
          division, fecha, passes, keyPasses, assists, shots, shotsOnTarget,
          goals, tackles, keyTackles, interceptions, keyInterceptions,
          possessionsLost, gKSaves, gKCatches, overallRating, score, mvp,
          rating_apa
        `)
        .in("partido_id", idsConsulta)
        .order("score", { ascending: false });

      const [
        { data: equiposData, error: equiposError },
        { data: jugadoresData, error: jugadoresError },
        { data: contextoData },
      ] = await Promise.all([equiposQuery, jugadoresQuery, contextoQuery]);

      if (cancelado) return;

      if (equiposError || jugadoresError) {
        console.error("Error cargando detalle del partido:", {
          equiposError,
          jugadoresError,
        });
        setErrorMsg("No se pudieron cargar las estadísticas del partido.");
        setLoading(false);
        return;
      }

      const equiposLimpios = (equiposData || []) as unknown as EquipoStats[];
      const jugadoresLimpios = (jugadoresData || []) as unknown as JugadorStats[];

      const nombresEquipos = Array.from(
        new Set(
          [
            partidoActual.local,
            partidoActual.visitante,
            ...equiposLimpios.map((equipo) => equipo.equipo),
          ].filter(Boolean),
        ),
      );

      let clubesData: ClubInfo[] = [];
      if (nombresEquipos.length > 0) {
        const { data: clubes, error: clubesError } = await supabase
          .from("clubes_info")
          .select("nombre, logo_url")
          .in("nombre", nombresEquipos);

        if (clubesError) console.error("Error cargando logos de clubes:", clubesError);
        clubesData = (clubes || []) as unknown as ClubInfo[];
      }

      const contexto = (contextoData || []) as unknown as PartidoInfo[];
      const currentIndex = contexto.findIndex((item) => item.id === partidoActual.id);

      setPartido(partidoActual);
      setEquipos(equiposLimpios);
      setJugadores(jugadoresLimpios);
      setClubesInfo(clubesData);
      setPreviousMatch(currentIndex > 0 ? contexto[currentIndex - 1] : null);
      setNextMatch(
        currentIndex >= 0 && currentIndex < contexto.length - 1
          ? contexto[currentIndex + 1]
          : null,
      );
      setLoading(false);
    }

    cargarDatos();
    return () => {
      cancelado = true;
    };
  }, [partidoId]);

  const logosPorEquipo = useMemo(() => {
    const mapa = new Map<string, string | null>();
    clubesInfo.forEach((club) => mapa.set(normalizarNombre(club.nombre), club.logo_url));
    return mapa;
  }, [clubesInfo]);

  const logoEquipo = (nombre: string) => logosPorEquipo.get(normalizarNombre(nombre)) || null;

  const local = useMemo(() => {
    if (!partido) return equipos[0];
    return (
      equipos.find((e) => normalizarNombre(e.equipo) === normalizarNombre(partido.local)) ||
      equipos[0]
    );
  }, [equipos, partido]);

  const visitante = useMemo(() => {
    if (!partido) return equipos[1];
    return (
      equipos.find((e) => normalizarNombre(e.equipo) === normalizarNombre(partido.visitante)) ||
      equipos.find((e) => e.id !== local?.id) ||
      equipos[1]
    );
  }, [equipos, partido, local]);

  const mvp = jugadores.find((j) => Number(j.mvp) === 1);
  const topJugadores = useMemo(() => ordenarTopJugadores(jugadores).slice(0, 6), [jugadores]);
  const goleadores = useMemo(
    () => [...jugadores].filter((j) => Number(j.goals || 0) > 0).sort((a, b) => Number(b.goals || 0) - Number(a.goals || 0)),
    [jugadores],
  );
  const asistidores = useMemo(
    () => [...jugadores].filter((j) => Number(j.assists || 0) > 0).sort((a, b) => Number(b.assists || 0) - Number(a.assists || 0)),
    [jugadores],
  );
  const arqueros = jugadores.filter(
    (j) => valorGKSave(j as JugadorStats & Record<string, unknown>) > 0 || Number(j.gKCatches) > 0,
  );

  const BackLink = () => (
    <Link href="/estadisticas" className="match-report-back-link inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.18em] sm:px-5 sm:text-sm">
      ← Volver al Match Center
    </Link>
  );

  if (loading) {
    return <main className="min-h-screen"><div className="mx-auto max-w-[1500px] space-y-6 px-4 py-10"><BackLink /><div className="rounded-[28px] border p-10 text-center">Cargando estadísticas del partido...</div></div></main>;
  }

  if (errorMsg || !partido) {
    return <main className="min-h-screen"><div className="mx-auto max-w-[1500px] space-y-6 px-4 py-10"><BackLink /><div className="rounded-[28px] border p-10 text-center">{errorMsg || "Partido no encontrado."}</div></div></main>;
  }

  if (!local || !visitante) {
    return <main className="min-h-screen"><div className="mx-auto max-w-[1500px] space-y-6 px-4 py-10"><BackLink /><div className="rounded-[28px] border p-10 text-center">Este partido todavía no tiene los dos equipos cargados correctamente.</div></div></main>;
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-10">
        <MatchNavigation previous={previousMatch} next={nextMatch} />

        <MatchHero
          partido={partido}
          local={local}
          visitante={visitante}
          mvp={mvp}
          localLogo={logoEquipo(partido.local)}
          visitanteLogo={logoEquipo(partido.visitante)}
        />

        <MatchEvents goleadores={goleadores} asistidores={asistidores} />
        <MatchComparison local={local} visitante={visitante} />
        <TopPlayers players={topJugadores} />
        <TeamDetails teams={[local, visitante]} logoEquipo={logoEquipo} />
        <Goalkeepers players={arqueros} />
        <FullPlayerDetails
          players={jugadores}
          teams={[partido.local, partido.visitante]}
          open={verDetalleCompleto}
          onToggle={() => setVerDetalleCompleto((value) => !value)}
        />
      </div>
    </main>
  );
}
