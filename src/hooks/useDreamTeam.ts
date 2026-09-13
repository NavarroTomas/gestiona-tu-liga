"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DREAM_TEAM_CONFIG,
  DREAM_TEAM_PHASES,
  DREAM_TEAM_POSITIONS,
  getDreamTeamCompetitionLabel,
  getDreamTeamPhases,
} from "@/config/dreamTeam";
import {
  fetchDreamTeamAvailableDates,
  fetchDreamTeamClubLogos,
  fetchDreamTeamCurrentUser,
  fetchDreamTeamMatches,
  fetchDreamTeamPlayerStats,
  fetchDreamTeamProfiles,
  fetchDreamTeamUserProfile,
  fetchDreamTeamVotes,
  insertDreamTeamVote,
} from "@/lib/dream-team/api";
import type {
  DreamTeamCompetition,
  DreamTeamLogos,
  DreamTeamPlayer,
  DreamTeamPositionId,
  DreamTeamProfile,
  DreamTeamProfiles,
  DreamTeamVote,
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
  const [logos, setLogos] = useState<DreamTeamLogos>({});
  const [perfilesJugadores, setPerfilesJugadores] = useState<DreamTeamProfiles>({});
  const [posicionActiva, setPosicionActiva] = useState<DreamTeamPositionId | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

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
      const profileResult = await fetchDreamTeamUserProfile(data.user.id);
      if (!active) return;

      if (profileResult.error) {
        console.log(profileResult.error);
        setMiPerfil(null);
        return;
      }

      setMiPerfil((profileResult.data || null) as DreamTeamProfile | null);
    }

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    setCargando(true);
    setMensaje("");
    setPosicionActiva(null);

    try {
      const datesResult = await fetchDreamTeamAvailableDates(context);
      let availableDates = [DREAM_TEAM_CONFIG.defaultDate];

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

      const [matchesResult, votesResult] = await Promise.all([
        fetchDreamTeamMatches(context),
        fetchDreamTeamVotes(context),
      ]);

      if (matchesResult.error) {
        console.log(matchesResult.error);
        setJugadores([]);
        setVotos([]);
        setLogos({});
        setPerfilesJugadores({});
        return;
      }

      const matches = matchesResult.data || [];
      const matchIds = Array.from(
        new Set(matches.map((match) => match.partido_id).filter((id): id is string | number => id !== null && id !== undefined)),
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

      const clubNames = Array.from(
        new Set(
          [
            ...matches.flatMap((match) => [match.local || "", match.visitante || ""]),
            ...players.map((player) => player.equipo),
            ...voteRows.map((vote) => vote.equipo),
          ].filter(Boolean),
        ),
      );

      const logosResult = await fetchDreamTeamClubLogos(clubNames);
      if (logosResult.error) console.log(logosResult.error);

      const logoMap: DreamTeamLogos = {};
      (logosResult.data || []).forEach((club) => {
        if (club.nombre && club.logo_url) logoMap[club.nombre] = club.logo_url;
      });
      setLogos(logoMap);
    } finally {
      setCargando(false);
    }
  }, [context, fecha]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const votosPorPosicion = useMemo(() => buildVotesByPosition(votos), [votos]);
  const miDreamTeam = useMemo(() => buildUserDreamTeam(votos, usuarioId), [votos, usuarioId]);
  const jugadorMasVotado = useMemo(() => getMostVotedDreamTeamPlayer(votos), [votos]);

  const topPorPosicion = useCallback(
    (position: DreamTeamPositionId) => getDreamTeamTopByPosition(votos, position),
    [votos],
  );

  const candidatos = useCallback(
    (position: DreamTeamPositionId) => getDreamTeamCandidates(jugadores, position),
    [jugadores],
  );

  const votar = useCallback(
    async (jugador: DreamTeamPlayer) => {
      setMensaje("");

      const { data, error: authError } = await fetchDreamTeamCurrentUser();
      if (authError || !data.user) {
        setMensaje("Tenés que iniciar sesión para votar el Dream Team.");
        return;
      }

      if (!posicionActiva) return;
      setUsuarioId(data.user.id);

      const userVotes = votos.filter(
        (vote) =>
          vote.temporada === temporada &&
          vote.division === contextoLabel &&
          String(vote.fecha) === String(fecha) &&
          (!vote.competicion || vote.competicion === competicion) &&
          vote.usuario === data.user.id,
      );

      if (userVotes.some((vote) => vote.posicion === posicionActiva)) {
        setMensaje(`Ya votaste la posición ${posicionActiva} en tu Dream Team de la Fecha ${fecha}.`);
        return;
      }

      if (userVotes.length >= DREAM_TEAM_POSITIONS.length) {
        setMensaje(`Ya completaste tu Dream Team de la Fecha ${fecha}.`);
        return;
      }

      if (userVotes.some((vote) => (vote.playerId || vote.nombre) === (jugador.playerId || jugador.nombre))) {
        setMensaje(`${jugador.nombre} ya está en otra posición de tu Dream Team de la Fecha ${fecha}. Elegí otro jugador.`);
        return;
      }

      const result = await insertDreamTeamVote({
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
        usuario: data.user.id,
        fecha_voto: currentDreamTeamDateISO(),
      });

      if (result.error) {
        console.log(result.error);
        setMensaje(result.error.code === "23505" ? "Ya registraste ese voto para esta fecha." : "Error guardando voto.");
        return;
      }

      setMensaje(`Voto guardado para ${posicionActiva}: ${jugador.nombre}`);
      setPosicionActiva(null);
      await loadData();
    },
    [competicion, contextoLabel, fase, fecha, grupo, loadData, posicionActiva, temporada, votos],
  );

  const compartir = useCallback(async () => {
    const texto = DREAM_TEAM_POSITIONS
      .map((position) => `${position.id}: ${miDreamTeam[position.id]?.nombre || "-"}`)
      .join("\n");
    const shareText = `Mi Dream Team Fecha ${fecha}\n${temporada} / ${division}\n\n${texto}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setMensaje("Dream Team copiado al portapapeles.");
    } catch {
      setMensaje("No se pudo copiar el Dream Team.");
    }
  }, [division, fecha, miDreamTeam, temporada]);

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
    logos,
    perfilesJugadores,
    posicionActiva,
    setPosicionActiva,
    mensaje,
    cargando,
    competicionLabel,
    contextoLabel,
    fasesDisponibles: getDreamTeamPhases(competicion),
    votosPorPosicion,
    miDreamTeam,
    jugadorMasVotado,
    topPorPosicion,
    candidatos,
    votar,
    compartir,
  };
}

export type DreamTeamController = ReturnType<typeof useDreamTeam>;
