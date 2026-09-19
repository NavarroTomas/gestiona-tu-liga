"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePublicSeasons } from "@/hooks/usePublicSeasons";
import type { PredictionChoice } from "@/lib/predicciones/types";

export type RankingCompetition =
  | "todas"
  | "liga"
  | "copa_clasificatoria"
  | "copa_argentina"
  | "copa_apa"
  | "copa_campeones"
  | "playoffs";

type RankingMatch = {
  id: string | number;
  partido_id?: string | null;
  resultado?: string | null;
  temporada: string;
  division?: string | null;
  competicion?: string | null;
  fase?: string | null;
  grupo?: string | null;
};

type RankingVote = {
  id: number;
  partido_id: string;
  usuario: string;
  prediccion: PredictionChoice;
  goles_local?: number | null;
  goles_visitante?: number | null;
};

type RankingProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  visible_role: string | null;
  avatar_url: string | null;
};

export type PredictionRankingItem = {
  usuario: string;
  nombre: string;
  username: string | null;
  rol: string | null;
  avatarUrl: string | null;
  puntos: number;
  exactos: number;
  ganadores: number;
  fallos: number;
  jugadas: number;
  pendientes: number;
};

export const RANKING_COMPETITIONS: Array<{ value: RankingCompetition; label: string }> = [
  { value: "todas", label: "Todas" },
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa APA" },
  { value: "copa_campeones", label: "Copa de Campeones" },
  { value: "playoffs", label: "Playoffs de Ascenso" },
];

export const RANKING_DIVISIONS = ["Todas", "Primera", "Segunda"].map((value) => ({ value, label: value }));
export const RANKING_GROUPS = ["Todos", "A", "B", "C", "D"].map((value) => ({ value, label: value === "Todos" ? value : `Grupo ${value}` }));
export const RANKING_PHASES = ["Todas", "octavos", "cuartos", "semifinal", "final"].map((value) => ({ value, label: value === "Todas" ? value : value.charAt(0).toUpperCase() + value.slice(1) }));
export const RANKING_CHAMPIONS_PHASES = ["Todas", "semifinal", "final"].map((value) => ({ value, label: value === "Todas" ? value : value.charAt(0).toUpperCase() + value.slice(1) }));
export const RANKING_PLAYOFF_PHASES = ["Todas", "semifinal", "final_ascenso", "promocion"].map((value) => ({
  value,
  label: value === "Todas" ? value : value === "final_ascenso" ? "Final Ascenso" : value === "promocion" ? "Promoción" : "Semifinal",
}));

function matchKey(match: RankingMatch) {
  return match.partido_id || String(match.id);
}

function realScore(match?: RankingMatch | null) {
  const result = String(match?.resultado || "").trim();
  if (!result.includes("-")) return null;
  const [homeRaw, awayRaw] = result.split("-");
  const home = Number(homeRaw?.trim());
  const away = Number(awayRaw?.trim());
  if (Number.isNaN(home) || Number.isNaN(away)) return null;
  return { home, away };
}

function realWinner(match?: RankingMatch | null): PredictionChoice | null {
  const score = realScore(match);
  if (!score) return null;
  if (score.home > score.away) return "local";
  if (score.away > score.home) return "visitante";
  return "empate";
}

/**
 * Controlador del ranking de Predicciones.
 * La UI no consulta Supabase ni calcula puntajes por su cuenta.
 */
export function usePredictionRanking() {
  const { seasons } = usePublicSeasons("Temporada 4");
  const [temporada, setTemporada] = useState("Todas");
  const [competicion, setCompeticion] = useState<RankingCompetition>("todas");
  const [division, setDivision] = useState("Todas");
  const [grupo, setGrupo] = useState("Todos");
  const [fase, setFase] = useState("Todas");
  const [partidos, setPartidos] = useState<RankingMatch[]>([]);
  const [predicciones, setPredicciones] = useState<RankingVote[]>([]);
  const [perfiles, setPerfiles] = useState<Record<string, RankingProfile>>({});
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setDivision("Todas");
    setGrupo("Todos");
    setFase("Todas");
  }, [competicion]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMensaje("");

      let query = supabase
        .from("partidos")
        .select("id, partido_id, resultado, temporada, division, competicion, fase, grupo");

      if (temporada !== "Todas") query = query.eq("temporada", temporada);
      if (competicion !== "todas") {
        query = query.eq("competicion", competicion);
        if (competicion === "liga" && division !== "Todas") {
          query = query.in("division", [division, division.toLowerCase()]);
        }
        if (competicion === "copa_clasificatoria") {
          query = query.eq("fase", "grupos");
          if (grupo !== "Todos") query = query.eq("grupo", grupo);
        }
        if (
          ["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(competicion) &&
          fase !== "Todas"
        ) {
          query = query.eq("fase", fase);
        }
      }

      const matchesResult = await query;
      if (cancelled) return;
      if (matchesResult.error) {
        console.error(matchesResult.error);
        setMensaje("No se pudo cargar el ranking.");
        setPartidos([]);
        setPredicciones([]);
        setLoading(false);
        return;
      }

      const matches = (matchesResult.data || []) as RankingMatch[];
      setPartidos(matches);
      const ids = matches.map(matchKey).filter(Boolean);

      if (!ids.length) {
        setPredicciones([]);
        setPerfiles({});
        setLoading(false);
        return;
      }

      const votesResult = await supabase
        .from("predicciones")
        .select("id, partido_id, usuario, prediccion, goles_local, goles_visitante")
        .in("partido_id", ids);

      if (cancelled) return;
      if (votesResult.error) {
        console.error(votesResult.error);
        setMensaje("No se pudieron cargar las predicciones.");
        setPredicciones([]);
        setLoading(false);
        return;
      }

      const votes = (votesResult.data || []) as RankingVote[];
      setPredicciones(votes);
      const userIds = Array.from(new Set(votes.map((vote) => vote.usuario).filter(Boolean)));

      if (!userIds.length) {
        setPerfiles({});
        setLoading(false);
        return;
      }

      const profilesResult = await supabase
        .from("public_profiles")
        .select("id, display_name, username, visible_role, avatar_url")
        .in("id", userIds);

      if (cancelled) return;
      if (profilesResult.error) {
        console.error(profilesResult.error);
        setPerfiles({});
      } else {
        const map: Record<string, RankingProfile> = {};
        (profilesResult.data || []).forEach((profile: RankingProfile) => {
          map[profile.id] = profile;
        });
        setPerfiles(map);
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [temporada, competicion, division, grupo, fase]);

  const ranking = useMemo(() => {
    const matchesMap = new Map(partidos.map((match) => [matchKey(match), match]));
    const table: Record<string, PredictionRankingItem> = {};

    predicciones.forEach((vote) => {
      const profile = perfiles[vote.usuario];
      if (!table[vote.usuario]) {
        table[vote.usuario] = {
          usuario: vote.usuario,
          nombre: profile?.display_name || profile?.username || "Invitado APA",
          username: profile?.username || null,
          rol: profile?.visible_role || null,
          avatarUrl: profile?.avatar_url || null,
          puntos: 0,
          exactos: 0,
          ganadores: 0,
          fallos: 0,
          jugadas: 0,
          pendientes: 0,
        };
      }

      const match = matchesMap.get(vote.partido_id);
      const winner = realWinner(match);
      const score = realScore(match);
      if (!winner || !score) {
        table[vote.usuario].pendientes += 1;
        return;
      }

      table[vote.usuario].jugadas += 1;
      const exact = Number(vote.goles_local) === score.home && Number(vote.goles_visitante) === score.away;
      if (exact) {
        table[vote.usuario].puntos += 3;
        table[vote.usuario].exactos += 1;
        table[vote.usuario].ganadores += 1;
      } else if (vote.prediccion === winner) {
        table[vote.usuario].puntos += 1;
        table[vote.usuario].ganadores += 1;
      } else {
        table[vote.usuario].fallos += 1;
      }
    });

    return Object.values(table).sort(
      (a, b) => b.puntos - a.puntos || b.exactos - a.exactos || b.ganadores - a.ganadores || b.jugadas - a.jugadas,
    );
  }, [partidos, predicciones, perfiles]);

  const resumen = useMemo(
    () => ({
      participantes: ranking.length,
      predicciones: predicciones.length,
      resueltas: ranking.reduce((total, row) => total + row.jugadas, 0),
      exactos: ranking.reduce((total, row) => total + row.exactos, 0),
    }),
    [ranking, predicciones.length],
  );

  const filtroTexto = useMemo(() => {
    const competitionLabel = RANKING_COMPETITIONS.find((item) => item.value === competicion)?.label || competicion;
    return [
      temporada,
      competitionLabel,
      competicion === "liga" ? division : "",
      competicion === "copa_clasificatoria" ? (grupo === "Todos" ? "Todos los grupos" : `Grupo ${grupo}`) : "",
      competicion !== "todas" && !["liga", "copa_clasificatoria"].includes(competicion) ? fase : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }, [temporada, competicion, division, grupo, fase]);

  return {
    temporada,
    temporadas: ["Todas", ...seasons],
    setTemporada,
    competicion,
    setCompeticion,
    division,
    setDivision,
    grupo,
    setGrupo,
    fase,
    setFase,
    ranking,
    resumen,
    filtroTexto,
    loading,
    mensaje,
  };
}

export type PredictionRankingController = ReturnType<typeof usePredictionRanking>;
