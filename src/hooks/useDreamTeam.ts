"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DREAM_TEAM_CONFIG,
  DREAM_TEAM_POSITIONS,
  getDreamTeamCompetitionLabel,
  getDreamTeamPhases,
} from "@/config/dreamTeam";
import {
  ensureDreamTeamUser,
  fetchDreamTeamAvailableDates,
  fetchDreamTeamCurrentUser,
  fetchDreamTeamMatches,
  fetchDreamTeamPlayerStats,
  fetchDreamTeamProfiles,
  fetchDreamTeamUserProfile,
  fetchDreamTeamVotes,
  fetchDreamTeamVotingWindow,
  insertDreamTeamVotes,
} from "@/lib/dream-team/api";
import type {
  DreamTeamCompetition,
  DreamTeamPlayer,
  DreamTeamPositionId,
  DreamTeamProfile,
  DreamTeamProfiles,
  DreamTeamVote,
  DreamTeamVotingWindow,
  UserDreamTeam,
} from "@/lib/dream-team/types";
import {
  aggregateDreamTeamPlayers,
  buildUserDreamTeam,
  buildVotesByPosition,
  currentDreamTeamDateISO,
  getDreamTeamCandidates,
  getDreamTeamContextLabel,
  getDreamTeamTopByPosition,
  getMostVotedDreamTeamPlayer,
  normalizeDreamTeamPhase,
} from "@/lib/dream-team/utils";

const EMPTY_WINDOW: DreamTeamVotingWindow = {
  openAt: null,
  closeAt: null,
  isOpen: false,
};

export function useDreamTeam() {
  const [temporada, setTemporada] = useState<string>(DREAM_TEAM_CONFIG.defaultSeason);
  const [competicion, setCompeticion] = useState<DreamTeamCompetition>(DREAM_TEAM_CONFIG.defaultCompetition);
  const [division, setDivision] = useState<string>(DREAM_TEAM_CONFIG.defaultDivision);
  const [grupo, setGrupo] = useState<string>(DREAM_TEAM_CONFIG.defaultGroup);
  const [fase, setFase] = useState<string>(DREAM_TEAM_CONFIG.defaultPhase);
  const [fecha, setFecha] = useState<string>(DREAM_TEAM_CONFIG.defaultDate);
  const [fechas, setFechas] = useState<string[]>([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [miPerfil, setMiPerfil] = useState<DreamTeamProfile | null>(null);
  const [jugadores, setJugadores] = useState<DreamTeamPlayer[]>([]);
  const [votos, setVotos] = useState<DreamTeamVote[]>([]);
  const [perfilesJugadores, setPerfilesJugadores] = useState<DreamTeamProfiles>({});
  const [posicionActiva, setPosicionActiva] = useState<DreamTeamPositionId | null>(null);
  const [plantillaBorrador, setPlantillaBorrador] = useState<UserDreamTeam>({});
  const [votingWindow, setVotingWindow] = useState<DreamTeamVotingWindow>(EMPTY_WINDOW);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const context = useMemo(
    () => ({ temporada, competicion, division, grupo, fase, fecha }),
    [temporada, competicion, division, grupo, fase, fecha],
  );

  const competicionLabel = useMemo(
    () => getDreamTeamCompetitionLabel(competicion),
    [competicion],
  );
  const contextoLabel = useMemo(() => getDreamTeamContextLabel(context), [context]);

  useEffect(() => {
    const allowedPhases = getDreamTeamPhases(competicion);
    if (!allowedPhases.includes(fase)) {
      setFase(allowedPhases[0] ?? DREAM_TEAM_CONFIG.defaultPhase);
    }
  }, [competicion, fase]);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const { data, error } = await fetchDreamTeamCurrentUser();
      if (!active) return;

      if (error || !data.user) {
        setUsuarioId("");
        setMiPerfil(null);
        return;
      }

      setUsuarioId(data.user.id);

      if (data.user.is_anonymous) {
        setMiPerfil(null);
        return;
      }

      const profileResult = await fetchDreamTeamUserProfile(data.user.id);
      if (!active) return;

      if (profileResult.error) {
        console.log(profileResult.error);
        setMiPerfil(null);
        return;
      }

      setMiPerfil((profileResult.data || null) as DreamTeamProfile | null);
    }

    void loadUser();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setPlantillaBorrador({});
    setPosicionActiva(null);
  }, [temporada, competicion, division, grupo, fase, fecha]);

  const loadData = useCallback(async () => {
    setCargando(true);
    setMensaje("");
    setPosicionActiva(null);

    try {
      const datesResult = await fetchDreamTeamAvailableDates(context);
      let availableDates: string[] = [DREAM_TEAM_CONFIG.defaultDate];

      if (datesResult.error) {
        console.log(datesResult.error);
      } else {
        const parsedDates = Array.from(
          new Set(
            (datesResult.data || [])
              .map((row: { fecha?: string | number | null }) => String(row.fecha || ""))
              .filter(Boolean),
          ),
        ).sort((a, b) => {
          const aNumber = Number(a);
          const bNumber = Number(b);
          if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) return aNumber - bNumber;
          return a.localeCompare(b, "es", { numeric: true });
        });

        if (parsedDates.length > 0) availableDates = parsedDates;
      }

      setFechas(availableDates);
      if (!availableDates.includes(fecha)) {
        setFecha(availableDates[0]);
        return;
      }

      const [matchesResult, votesResult, windowResult] = await Promise.all([
        fetchDreamTeamMatches(context),
        fetchDreamTeamVotes(context),
        fetchDreamTeamVotingWindow(context),
      ]);

      if (windowResult.error) {
        console.log(windowResult.error);
        setVotingWindow(EMPTY_WINDOW);
      } else {
        setVotingWindow(windowResult.data);
      }

      if (matchesResult.error) {
        console.log(matchesResult.error);
        setJugadores([]);
        setVotos([]);
        setPerfilesJugadores({});
        return;
      }

      const matches = matchesResult.data || [];
      const matchIds = Array.from(
        new Set(
          matches
            .map((match) => match.partido_id)
            .filter((id): id is string | number => id !== null && id !== undefined),
        ),
      );

      const statsResult = await fetchDreamTeamPlayerStats(matchIds);
      if (statsResult.error) {
        console.log(statsResult.error);
        setJugadores([]);
        setVotos([]);
        setPerfilesJugadores({});
        return;
      }

      if (votesResult.error) console.log(votesResult.error);

      const players = aggregateDreamTeamPlayers(statsResult.data || []);
      const voteRows = (votesResult.data || []) as DreamTeamVote[];
      setJugadores(players);
      setVotos(voteRows);

      const playerIds = Array.from(
        new Set([
          ...players.map((player) => player.playerId).filter(Boolean),
          ...voteRows.map((vote) => vote.playerId || "").filter(Boolean),
        ]),
      );

      const profilesResult = await fetchDreamTeamProfiles(playerIds);
      if (profilesResult.error) {
        console.log(profilesResult.error);
        setPerfilesJugadores({});
      } else {
        const profileMap: DreamTeamProfiles = {};
        (profilesResult.data || []).forEach((profile) => {
          if (profile.playerid) profileMap[profile.playerid] = profile;
        });
        setPerfilesJugadores(profileMap);
      }
    } finally {
      setCargando(false);
    }
  }, [context, fecha]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const votosPorPosicion = useMemo(() => buildVotesByPosition(votos), [votos]);
  const miDreamTeamGuardado = useMemo(
    () => buildUserDreamTeam(votos, usuarioId),
    [votos, usuarioId],
  );
  const plantillaEnviada = useMemo(
    () => DREAM_TEAM_POSITIONS.every((position) => Boolean(miDreamTeamGuardado[position.id])),
    [miDreamTeamGuardado],
  );
  const plantillaCompleta = useMemo(
    () => DREAM_TEAM_POSITIONS.every((position) => Boolean(plantillaBorrador[position.id])),
    [plantillaBorrador],
  );
  const plantillaActual = plantillaEnviada ? miDreamTeamGuardado : plantillaBorrador;
  const puedeEditar = votingWindow.isOpen && !plantillaEnviada && !enviando;
  const jugadorMasVotado = useMemo(() => getMostVotedDreamTeamPlayer(votos), [votos]);

  const topPorPosicion = useCallback(
    (position: DreamTeamPositionId) => getDreamTeamTopByPosition(votos, position),
    [votos],
  );

  const candidatos = useCallback(
    (position: DreamTeamPositionId) => getDreamTeamCandidates(jugadores, position),
    [jugadores],
  );

  const seleccionarJugador = useCallback(
    (jugador: DreamTeamPlayer) => {
      setMensaje("");

      if (!posicionActiva || !puedeEditar) return;

      const jugadorKey = jugador.playerId || jugador.nombre;
      const repetido = Object.entries(plantillaBorrador).some(
        ([position, vote]) =>
          position !== posicionActiva &&
          vote &&
          (vote.playerId || vote.nombre) === jugadorKey,
      );

      if (repetido) {
        setMensaje(`${jugador.nombre} ya está elegido en otra posición. Elegí otro jugador.`);
        return;
      }

      setPlantillaBorrador((current) => ({
        ...current,
        [posicionActiva]: {
          temporada,
          division: contextoLabel,
          competicion,
          fase:
            competicion === "liga"
              ? null
              : competicion === "copa_clasificatoria"
                ? "grupos"
                : normalizeDreamTeamPhase(fase),
          grupo: competicion === "copa_clasificatoria" ? grupo : null,
          fecha,
          posicion: posicionActiva,
          playerId: jugador.playerId,
          nombre: jugador.nombre,
          equipo: jugador.equipo,
          usuario: usuarioId || null,
          fecha_voto: null,
        },
      }));

      setPosicionActiva(null);
    },
    [competicion, contextoLabel, fase, fecha, grupo, plantillaBorrador, posicionActiva, puedeEditar, temporada, usuarioId],
  );

  const enviarPlantilla = useCallback(async () => {
    setMensaje("");

    if (plantillaEnviada) {
      setMensaje(`Ya enviaste tu Dream Team de la Fecha ${fecha}.`);
      return;
    }

    if (!votingWindow.isOpen) {
      setMensaje("La votación no está abierta para esta fecha.");
      return;
    }

    if (!plantillaCompleta) {
      setMensaje("Completá las 8 posiciones antes de enviar tu Dream Team.");
      return;
    }

    setEnviando(true);

    try {
      const { data, error: authError } = await ensureDreamTeamUser();
      if (authError || !data.user) {
        console.log(authError);
        setMensaje("No se pudo iniciar el modo invitado para enviar tu Dream Team.");
        return;
      }

      const userId = data.user.id;
      setUsuarioId(userId);
      const fechaVoto = currentDreamTeamDateISO();

      const payloads = DREAM_TEAM_POSITIONS.map((position) => {
        const player = plantillaBorrador[position.id];
        if (!player) throw new Error(`Falta la posición ${position.id}`);

        return {
          temporada,
          division: contextoLabel,
          competicion,
          fase:
            competicion === "liga"
              ? null
              : competicion === "copa_clasificatoria"
                ? "grupos"
                : normalizeDreamTeamPhase(fase),
          grupo: competicion === "copa_clasificatoria" ? grupo : null,
          fecha,
          posicion: position.id,
          playerId: player.playerId || "",
          nombre: player.nombre,
          equipo: player.equipo,
          usuario: userId,
          fecha_voto: fechaVoto,
        };
      });

      const result = await insertDreamTeamVotes(payloads);
      if (result.error) {
        console.log(result.error);
        const errorText = String(result.error.message || "").toLowerCase();

        if (result.error.code === "23505") {
          setMensaje(`Ya enviaste tu Dream Team de la Fecha ${fecha}.`);
        } else if (errorText.includes("todavía no está abierta")) {
          setMensaje("La votación todavía no está abierta.");
        } else if (errorText.includes("ya cerró")) {
          setMensaje("La votación de esta fecha ya cerró.");
        } else if (errorText.includes("siguiente fecha comenzó")) {
          setMensaje("La votación de esta fecha ya no está disponible porque comenzó la siguiente.");
        } else {
          setMensaje("No se pudo guardar el Dream Team. Intentá nuevamente.");
        }
        return;
      }

      setMensaje(`Tu Dream Team de la Fecha ${fecha} fue enviado. Ya no se puede modificar.`);
      setPosicionActiva(null);
      await loadData();
    } catch (error) {
      console.log(error);
      setMensaje("No se pudo enviar el Dream Team.");
    } finally {
      setEnviando(false);
    }
  }, [competicion, contextoLabel, fase, fecha, grupo, loadData, plantillaBorrador, plantillaCompleta, plantillaEnviada, temporada, votingWindow.isOpen]);

  const compartir = useCallback(async () => {
    const texto = DREAM_TEAM_POSITIONS
      .map((position) => `${position.id}: ${plantillaActual[position.id]?.nombre || "-"}`)
      .join("\n");
    const shareText = `Mi Dream Team Fecha ${fecha}\n${temporada} / ${division}\n\n${texto}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setMensaje("Dream Team copiado al portapapeles.");
    } catch {
      setMensaje("No se pudo copiar el Dream Team.");
    }
  }, [division, fecha, plantillaActual, temporada]);

  const setCompetition = useCallback((value: DreamTeamCompetition) => {
    setCompeticion(value);
    setFecha(DREAM_TEAM_CONFIG.defaultDate);
  }, []);

  const setDivisionFilter = useCallback((value: string) => {
    setDivision(value);
    setFecha(DREAM_TEAM_CONFIG.defaultDate);
  }, []);

  const setGroupFilter = useCallback((value: string) => {
    setGrupo(value);
    setFecha(DREAM_TEAM_CONFIG.defaultDate);
  }, []);

  const setPhaseFilter = useCallback((value: string) => {
    setFase(value);
    setFecha(DREAM_TEAM_CONFIG.defaultDate);
  }, []);

  return {
    temporada,
    setTemporada,
    competicion,
    setCompetition,
    division,
    setDivisionFilter,
    grupo,
    setGroupFilter,
    fase,
    setPhaseFilter,
    fecha,
    setFecha,
    fechas,
    usuarioId,
    miPerfil,
    jugadores,
    votos,
    perfilesJugadores,
    posicionActiva,
    setPosicionActiva,
    mensaje,
    cargando,
    enviando,
    competicionLabel,
    contextoLabel,
    fasesDisponibles: getDreamTeamPhases(competicion),
    votosPorPosicion,
    miDreamTeam: miDreamTeamGuardado,
    plantillaActual,
    plantillaCompleta,
    plantillaEnviada,
    puedeEditar,
    votingWindow,
    jugadorMasVotado,
    topPorPosicion,
    candidatos,
    seleccionarJugador,
    enviarPlantilla,
    compartir,
  };
}

export type DreamTeamController = ReturnType<typeof useDreamTeam>;
