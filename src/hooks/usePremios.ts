"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePublicSeasons } from "@/hooks/usePublicSeasons";

export type PremioCompeticion = "liga" | "copa_clasificatoria" | "copa_argentina" | "copa_apa" | "copa_campeones" | "playoffs";

export type PremioContexto = {
  id: string;
  label: string;
  competicion: PremioCompeticion;
  division?: string;
  divisionDb?: string;
  grupo?: string;
  fase?: string;
  badge: string;
};

export type JugadorPremio = {
  nombre: string;
  playerId: string;
  equipo: string;
  posicion: string;
  goals: number;
  assists: number;
  mvp: number;
  overallRating: number;
  score: number;
  tackles: number;
  interceptions: number;
  gKSaves: number;
  gKCatches: number;
  passes: number;
};

type PartidoPremio = {
  id: string | number;
  partido_id?: string | null;
  fecha?: string | number | null;
};

export const PREMIOS_COMPETICIONES: Array<{ value: PremioCompeticion; label: string }> = [
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa APA" },
  { value: "copa_campeones", label: "Copa de Campeones" },
  { value: "playoffs", label: "Playoffs de Ascenso" },
];

export const PREMIOS_CONTEXTOS: PremioContexto[] = [
  { id: "liga-primera", label: "Liga · Primera", competicion: "liga", division: "primera", divisionDb: "Primera", badge: "Primera" },
  { id: "liga-segunda", label: "Liga · Segunda", competicion: "liga", division: "segunda", divisionDb: "Segunda", badge: "Segunda" },
  ...["A", "B", "C", "D"].map((grupo) => ({ id: `copas-grupo-${grupo.toLowerCase()}`, label: `Clasificación · Grupo ${grupo}`, competicion: "copa_clasificatoria" as const, grupo, fase: "grupos", badge: `Grupo ${grupo}` })),
  ...["octavos", "cuartos", "semifinal", "final"].flatMap((fase) => [
    { id: `copa-argentina-${fase}`, label: `Copa Argentina · ${fase}`, competicion: "copa_argentina" as const, fase, badge: fase },
    { id: `copa-apa-${fase}`, label: `Copa APA · ${fase}`, competicion: "copa_apa" as const, fase, badge: fase },
  ]),
  { id: "copa-campeones-semifinal", label: "Copa de Campeones · Semifinal", competicion: "copa_campeones", fase: "semifinal", badge: "Semifinal" },
  { id: "copa-campeones-final", label: "Copa de Campeones · Final", competicion: "copa_campeones", fase: "final", badge: "Final" },
  { id: "playoffs-semifinal", label: "Playoffs · Semifinal", competicion: "playoffs", fase: "semifinal", badge: "Semifinal" },
  { id: "playoffs-final-ascenso", label: "Playoffs · Final Ascenso", competicion: "playoffs", fase: "final_ascenso", badge: "Final Ascenso" },
  { id: "playoffs-promocion", label: "Playoffs · Promoción", competicion: "playoffs", fase: "promocion", badge: "Promoción" },
];

function normalizarJugador(row: any): JugadorPremio {
  return {
    nombre: row.nombre || "Sin nombre",
    playerId: row.playerId || "",
    equipo: row.equipo || "Sin Club",
    posicion: row.posicion || "",
    goals: Number(row.goals || 0),
    assists: Number(row.assists || 0),
    mvp: Number(row.mvp || 0),
    overallRating: Number(row.overallRating || row.rating_apa || 0),
    score: Number(row.score || 0),
    tackles: Number(row.tackles || 0),
    interceptions: Number(row.interceptions || 0),
    gKSaves: Number(row.gKSaves || row.gKSAVES || row.GKSaves || row.gksaves || 0),
    gKCatches: Number(row.gKCatches || 0),
    passes: Number(row.passes || 0),
  };
}

function esArquero(j: JugadorPremio) {
  const pos = j.posicion.toUpperCase();
  return j.gKSaves > 0 || j.gKCatches > 0 || pos.includes("GK") || pos.includes("POR");
}

function esDefensor(j: JugadorPremio) {
  const pos = j.posicion.toUpperCase();
  return ["CB", "LB", "RB", "DEF", "DFC", "LI", "LD"].some((value) => pos.includes(value));
}

function partidoKey(partido: PartidoPremio) {
  return partido.partido_id || String(partido.id);
}

export function usePremios() {
  const { seasons: temporadas, activeSeason, loading: seasonsLoading } = usePublicSeasons("Temporada 4");
  const [temporada, setTemporada] = useState("Temporada 4");

  useEffect(() => {
    if (!seasonsLoading) setTemporada(activeSeason);
  }, [activeSeason, seasonsLoading]);
  const [contextoId, setContextoId] = useState("liga-primera");
  const [fecha, setFecha] = useState("1");
  const [fechas, setFechas] = useState<string[]>([]);
  const [jugadores, setJugadores] = useState<JugadorPremio[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);

  const contexto = PREMIOS_CONTEXTOS.find((item) => item.id === contextoId) || PREMIOS_CONTEXTOS[0];

  useEffect(() => {
    let cancelled = false;

    async function cargar() {
      setCargando(true);
      let query = supabase
        .from("partidos")
        .select("id, partido_id, fecha, temporada, division, competicion, grupo, fase")
        .eq("temporada", temporada)
        .eq("competicion", contexto.competicion)
        .order("fecha", { ascending: true });

      if (contexto.competicion === "liga") query = query.in("division", [contexto.division, contexto.divisionDb].filter(Boolean) as string[]);
      if (contexto.competicion === "copa_clasificatoria") query = query.eq("fase", "grupos").eq("grupo", contexto.grupo || "");
      if (["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(contexto.competicion)) query = query.eq("fase", contexto.fase || "");

      const partidosRes = await query;
      if (cancelled) return;
      if (partidosRes.error) {
        console.error(partidosRes.error);
        setFechas([]); setJugadores([]); setLogos({}); setCargando(false); return;
      }

      const partidos = (partidosRes.data || []) as PartidoPremio[];
      const disponibles = Array.from(new Set(partidos.map((p) => String(p.fecha || "")).filter(Boolean))).sort((a, b) => Number(a) - Number(b));
      setFechas(disponibles);
      const fechaValida = disponibles.includes(fecha) ? fecha : disponibles[0] || "1";
      if (fechaValida !== fecha) { setFecha(fechaValida); setCargando(false); return; }

      const ids = partidos.filter((p) => String(p.fecha || "") === fechaValida).map(partidoKey).filter(Boolean);
      if (!ids.length) { setJugadores([]); setLogos({}); setCargando(false); return; }

      const statsRes = await supabase
        .from("estadisticas_jugadores")
        .select("nombre, playerId, equipo, posicion, goals, assists, mvp, overallRating, rating_apa, score, tackles, interceptions, gKSaves, gKCatches, passes, partido_id")
        .in("partido_id", ids);
      if (cancelled) return;
      if (statsRes.error) { console.error(statsRes.error); setJugadores([]); setLogos({}); setCargando(false); return; }

      const normalizados = (statsRes.data || []).map(normalizarJugador);
      setJugadores(normalizados);
      const equipos = Array.from(new Set(normalizados.map((j) => j.equipo).filter(Boolean)));
      if (equipos.length) {
        const clubesRes = await supabase.from("clubes_info").select("nombre, logo_url").in("nombre", equipos);
        const map: Record<string, string> = {};
        (clubesRes.data || []).forEach((club: any) => { if (club.nombre && club.logo_url) map[String(club.nombre).toLowerCase().trim()] = club.logo_url; });
        setLogos(map);
      } else setLogos({});
      setCargando(false);
    }

    void cargar();
    return () => { cancelled = true; };
  }, [temporada, contextoId, fecha, contexto]);

  const premios = useMemo(() => {
    const ordenar = (fn: (j: JugadorPremio) => number) => [...jugadores].sort((a, b) => fn(b) - fn(a))[0];
    return {
      mvpFecha: ordenar((j) => j.mvp * 1000 + j.overallRating * 10 + j.score / 100),
      goleador: ordenar((j) => j.goals * 100 + j.overallRating),
      asistidor: ordenar((j) => j.assists * 100 + j.passes / 50 + j.overallRating),
      arquero: [...jugadores].filter(esArquero).sort((a, b) => (b.gKSaves + b.gKCatches * 2 + b.overallRating) - (a.gKSaves + a.gKCatches * 2 + a.overallRating))[0],
      defensor: [...jugadores].filter((j) => esDefensor(j) || j.tackles > 0 || j.interceptions > 0).sort((a, b) => (b.tackles + b.interceptions * 2 + b.overallRating) - (a.tackles + a.interceptions * 2 + a.overallRating))[0],
      estrella: ordenar((j) => j.overallRating * 100 + j.score / 10),
    };
  }, [jugadores]);

  const topGeneral = useMemo(() => [...jugadores].sort((a, b) => b.overallRating - a.overallRating || b.score - a.score).slice(0, 10), [jugadores]);

  const cambiarCompeticion = (competicion: PremioCompeticion) => {
    const first = PREMIOS_CONTEXTOS.find((item) => item.competicion === competicion);
    if (first) { setContextoId(first.id); setFecha("1"); }
  };

  const logoEquipo = (equipo?: string) => logos[String(equipo || "").toLowerCase().trim()] || "";

  return { temporada, temporadas, setTemporada, contextoId, setContextoId, contexto, fecha, setFecha, fechas, jugadores, premios, topGeneral, cargando, cambiarCompeticion, logoEquipo };
}

export type PremiosController = ReturnType<typeof usePremios>;
