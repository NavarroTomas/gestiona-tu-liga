"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PREDICTIONS_CONFIG,
  PREDICTION_SUBCATEGORIES,
} from "@/config/predicciones";
import {
  ensurePredictionUser,
  fetchPredictionCurrentUser,
  fetchPredictionMatches,
  fetchPredictionProfiles,
  fetchPredictionVotes,
  insertPredictionVote,
} from "@/lib/predicciones/api";
import type {
  PredictionChoice,
  PredictionCompetition,
  PredictionMatch,
  PredictionProfile,
  PredictionScoreDraft,
  PredictionVote,
} from "@/lib/predicciones/types";
import {
  buildPredictionContext,
  buildPredictionRanking,
  isPredictionVotingOpen,
  normalizePredictionDate,
  predictionDivisionForStorage,
  predictionFromScore,
  predictionMatchKey,
  predictionPoints,
  realPredictionScore,
} from "@/lib/predicciones/utils";

/**
 * Controlador principal de Predicciones.
 *
 * Responsabilidades:
 * - filtros y contexto seleccionado;
 * - carga de partidos/votos/perfiles;
 * - identidad anónima o cuenta existente;
 * - validación temporal del voto;
 * - envío único por partido;
 * - ranking y datos derivados.
 *
 * La página y los componentes solo consumen este controlador.
 */
export function usePredicciones() {
  const [temporada, setTemporada] = useState(PREDICTIONS_CONFIG.defaultSeason);
  const [competicion, setCompeticion] = useState<PredictionCompetition>(
    PREDICTIONS_CONFIG.defaultCompetition,
  );
  const [subcategoria, setSubcategoria] = useState(PREDICTIONS_CONFIG.defaultSubcategory);
  const [fechaActiva, setFechaActiva] = useState(PREDICTIONS_CONFIG.defaultDate);
  const [usuarioId, setUsuarioId] = useState("");
  const [partidos, setPartidos] = useState<PredictionMatch[]>([]);
  const [predicciones, setPredicciones] = useState<PredictionVote[]>([]);
  const [perfiles, setPerfiles] = useState<Record<string, PredictionProfile>>({});
  const [marcadores, setMarcadores] = useState<Record<string, PredictionScoreDraft>>({});
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const contexto = useMemo(
    () => buildPredictionContext(competicion, subcategoria),
    [competicion, subcategoria],
  );

  useEffect(() => {
    void fetchPredictionCurrentUser().then(({ data }) => {
      setUsuarioId(data.user?.id || "");
    });
  }, []);

  useEffect(() => {
    setFechaActiva(PREDICTIONS_CONFIG.defaultDate);
  }, [temporada, competicion, subcategoria]);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setMensaje("");

    try {
      const matchesResult = await fetchPredictionMatches(temporada, contexto);
      if (matchesResult.error) {
        console.error(matchesResult.error);
        setPartidos([]);
        setPredicciones([]);
        return;
      }

      const matches = ((matchesResult.data || []) as PredictionMatch[]).sort((a, b) => {
        const dateA = Number(a.fecha || 999);
        const dateB = Number(b.fecha || 999);
        if (dateA !== dateB) return dateA - dateB;
        return String(a.scheduled_at || "9999").localeCompare(String(b.scheduled_at || "9999"));
      });
      setPartidos(matches);

      const matchIds = matches.map(predictionMatchKey).filter(Boolean);
      const votesResult = await fetchPredictionVotes(matchIds);
      if (votesResult.error) {
        console.error(votesResult.error);
        setPredicciones([]);
        return;
      }

      const votes = (votesResult.data || []) as PredictionVote[];
      setPredicciones(votes);

      const profileIds = Array.from(new Set(votes.map((vote) => vote.usuario).filter(Boolean)));
      const profilesResult = await fetchPredictionProfiles(profileIds);
      if (profilesResult.error) {
        console.error(profilesResult.error);
        setPerfiles({});
      } else {
        const map: Record<string, PredictionProfile> = {};
        (profilesResult.data || []).forEach((profile) => {
          map[profile.id] = profile;
        });
        setPerfiles(map);
      }
    } finally {
      setCargando(false);
    }
  }, [contexto, temporada]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const fechas = useMemo(() => {
    const values = Array.from(
      new Set(partidos.map((match) => normalizePredictionDate(match.fecha)).filter(Boolean)),
    ).sort((a, b) => Number(a) - Number(b));
    return ["Todas", ...values];
  }, [partidos]);

  const partidosFiltrados = useMemo(
    () =>
      partidos.filter(
        (match) =>
          fechaActiva === "Todas" || normalizePredictionDate(match.fecha) === fechaActiva,
      ),
    [fechaActiva, partidos],
  );

  const partidosDisponibles = useMemo(
    () => partidosFiltrados.filter((match) => isPredictionVotingOpen(match)),
    [partidosFiltrados],
  );

  const ranking = useMemo(
    () => buildPredictionRanking(predicciones, partidos).slice(0, 10),
    [partidos, predicciones],
  );

  const misPredicciones = useMemo(
    () => predicciones.filter((vote) => vote.usuario === usuarioId),
    [predicciones, usuarioId],
  );

  const resumen = useMemo(
    () => ({
      disponibles: partidosDisponibles.length,
      predicciones: predicciones.length,
      participantes: new Set(predicciones.map((vote) => vote.usuario)).size,
    }),
    [partidosDisponibles.length, predicciones],
  );

  const cambiarCompeticion = useCallback((value: PredictionCompetition) => {
    setCompeticion(value);
    setSubcategoria(PREDICTION_SUBCATEGORIES[value][0]?.value || "");
  }, []);

  const actualizarMarcador = useCallback(
    (match: PredictionMatch, side: "local" | "visitante", value: string) => {
      const key = predictionMatchKey(match);
      setMarcadores((current) => ({
        ...current,
        [key]: {
          local: current[key]?.local || "",
          visitante: current[key]?.visitante || "",
          [side]: value,
        },
      }));
    },
    [],
  );

  const votoUsuario = useCallback(
    (match: PredictionMatch) => {
      if (!usuarioId) return undefined;
      const key = predictionMatchKey(match);
      return predicciones.find(
        (vote) => vote.partido_id === key && vote.usuario === usuarioId,
      );
    },
    [predicciones, usuarioId],
  );

  const votosDelPartido = useCallback(
    (match: PredictionMatch) => {
      const key = predictionMatchKey(match);
      return predicciones.filter((vote) => vote.partido_id === key);
    },
    [predicciones],
  );

  const porcentaje = useCallback(
    (match: PredictionMatch, choice: PredictionChoice) => {
      const votes = votosDelPartido(match);
      if (!votes.length) return 0;
      return Math.round((votes.filter((vote) => vote.prediccion === choice).length / votes.length) * 100);
    },
    [votosDelPartido],
  );

  const enviarPrediccion = useCallback(
    async (match: PredictionMatch, manualChoice?: PredictionChoice) => {
      setMensaje("");

      if (!isPredictionVotingOpen(match)) {
        setMensaje("La votación de este partido ya cerró porque llegó su horario de inicio.");
        return;
      }

      setEnviando(true);
      try {
        const auth = await ensurePredictionUser();
        if (auth.error || !auth.data.user) {
          console.error(auth.error);
          setMensaje("No se pudo iniciar el modo invitado para votar.");
          return;
        }

        const userId = auth.data.user.id;
        setUsuarioId(userId);
        const key = predictionMatchKey(match);

        const existing = predicciones.find(
          (vote) => vote.partido_id === key && vote.usuario === userId,
        );
        if (existing) {
          setMensaje("Ya hiciste tu predicción para este partido y no puede modificarse.");
          return;
        }

        const score = marcadores[key] || { local: "", visitante: "" };
        const hasScore = score.local !== "" && score.visitante !== "";
        const home = hasScore ? Number(score.local) : null;
        const away = hasScore ? Number(score.visitante) : null;

        if (
          (home !== null && (!Number.isFinite(home) || home < 0)) ||
          (away !== null && (!Number.isFinite(away) || away < 0))
        ) {
          setMensaje("El marcador debe usar números válidos y no negativos.");
          return;
        }

        const choice =
          home !== null && away !== null ? predictionFromScore(home, away) : manualChoice;
        if (!choice) {
          setMensaje("Elegí un ganador o cargá un marcador exacto.");
          return;
        }

        const result = await insertPredictionVote({
          partido_id: key,
          temporada,
          division: predictionDivisionForStorage(contexto),
          local: match.local,
          visitante: match.visitante,
          prediccion: choice,
          usuario: userId,
          goles_local: home,
          goles_visitante: away,
          created_at: new Date().toISOString(),
        });

        if (result.error) {
          const text = result.error.message.toLowerCase();
          if (result.error.code === "23505") {
            setMensaje("Ya hiciste tu predicción para este partido.");
          } else if (result.error.code === "42501" || text.includes("row-level security")) {
            setMensaje("La votación ya cerró o este voto no está permitido.");
          } else {
            console.error(result.error);
            setMensaje("No se pudo guardar la predicción. Intentá nuevamente.");
          }
          return;
        }

        setMarcadores((current) => {
          const next = { ...current };
          delete next[key];
          return next;
        });
        setMensaje("Predicción guardada. Ya no puede modificarse.");
        await cargarDatos();
      } finally {
        setEnviando(false);
      }
    },
    [cargarDatos, contexto, marcadores, predicciones, temporada],
  );

  const nombreUsuario = useCallback(
    (userId: string) => {
      if (userId === usuarioId) return "Vos";
      const profile = perfiles[userId];
      return profile?.display_name || profile?.username || "Invitado APA";
    },
    [perfiles, usuarioId],
  );

  const estadoPrediccion = useCallback(
    (vote: PredictionVote) => {
      const match = partidos.find((item) => predictionMatchKey(item) === vote.partido_id);
      const score = realPredictionScore(match);
      if (!score) return { label: "Pendiente", points: 0 };
      const points = predictionPoints(vote, match);
      if (points === 3) return { label: "Exacto", points };
      if (points === 1) return { label: "Ganador", points };
      return { label: "Fallaste", points: 0 };
    },
    [partidos],
  );

  return {
    temporada,
    setTemporada,
    competicion,
    cambiarCompeticion,
    subcategoria,
    setSubcategoria,
    fechaActiva,
    setFechaActiva,
    contexto,
    fechas,
    partidos: partidosFiltrados,
    partidosDisponibles,
    predicciones,
    ranking,
    misPredicciones,
    resumen,
    marcadores,
    actualizarMarcador,
    votoUsuario,
    votosDelPartido,
    porcentaje,
    enviarPrediccion,
    nombreUsuario,
    estadoPrediccion,
    mensaje,
    cargando,
    enviando,
  };
}

export type PrediccionesController = ReturnType<typeof usePredicciones>;
