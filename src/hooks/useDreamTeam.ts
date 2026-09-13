"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DREAM_TEAM_CONFIG, DREAM_TEAM_POSITIONS } from "@/config/dreamTeam";
import {
  buildUserDreamTeam,
  buildVoteWinners,
  currentDateIso,
  getCandidates,
  getCompetitionLabel,
  getContextLabel,
  getGkSaves,
  getMostVotedPlayer,
  getTopVotesForPosition,
  phaseToDb,
} from "@/lib/dream-team/utils";
import type {
  DreamTeamCompetition,
  DreamTeamLogosMap,
  DreamTeamPlayer,
  DreamTeamPositionId,
  DreamTeamProfile,
  DreamTeamProfilesMap,
  DreamTeamVote,
} from "@/lib/dream-team/types";

export function useDreamTeam() {
  const [temporada, setTemporada] = useState<string>(DREAM_TEAM_CONFIG.defaultSeason);
  const [competicion, setCompeticion] = useState<DreamTeamCompetition>(
    DREAM_TEAM_CONFIG.defaultCompetition,
  );
  const [division, setDivision] = useState<string>(DREAM_TEAM_CONFIG.defaultDivision);
  const [grupo, setGrupo] = useState<string>(DREAM_TEAM_CONFIG.defaultGroup);
  const [fase, setFase] = useState<string>(DREAM_TEAM_CONFIG.defaultPhase);
  const [fecha, setFecha] = useState<string>("1");
  const [fechas, setFechas] = useState<string[]>([]);
  const [usuarioId, setUsuarioId] = useState<string>("");
  const [miPerfil, setMiPerfil] = useState<DreamTeamProfile | null>(null);
  const [jugadores, setJugadores] = useState<DreamTeamPlayer[]>([]);
  const [votos, setVotos] = useState<DreamTeamVote[]>([]);
  const [logos, setLogos] = useState<DreamTeamLogosMap>({});
  const [perfilesJugadores, setPerfilesJugadores] = useState<DreamTeamProfilesMap>({});
  const [posicionActiva, setPosicionActiva] = useState<DreamTeamPositionId | null>(null);
  const [mensaje, setMensaje] = useState<string>("");

  const competicionLabel = getCompetitionLabel(competicion);
  const contextoLabel = getContextLabel(competicion, division, grupo, fase);
  const contextoVoto = contextoLabel;

  useEffect(() => {
    void cargarUsuario();
  }, []);

  useEffect(() => {
    if (
      competicion === "copa_campeones" &&
      !DREAM_TEAM_CONFIG.championsPhases.includes(
        fase as (typeof DREAM_TEAM_CONFIG.championsPhases)[number],
      )
    ) {
      setFase("Semifinal");
    }

    if (
      competicion === "playoffs" &&
      !DREAM_TEAM_CONFIG.playoffsPhases.includes(
        fase as (typeof DREAM_TEAM_CONFIG.playoffsPhases)[number],
      )
    ) {
      setFase("Semifinal");
    }
  }, [competicion, fase]);

  useEffect(() => {
    void cargarDatos();
    // cargarDatos depende exactamente del contexto competitivo de esta lista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporada, competicion, division, grupo, fase, fecha]);

  async function cargarUsuario() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUsuarioId("");
      setMiPerfil(null);
      return;
    }

    setUsuarioId(user.id);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, username, playerid, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      setMiPerfil(null);
      return;
    }

    setMiPerfil((data || null) as DreamTeamProfile | null);
  }

  function aplicarFiltroPartidos(query: any) {
    query = query.eq("temporada", temporada).eq("competicion", competicion);

    if (competicion === "liga") {
      query = query.in("division", [division, division.toLowerCase()]);
    }

    if (competicion === "copa_clasificatoria") {
      query = query.eq("fase", "grupos").eq("grupo", grupo);
    }

    if (
      ["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(
        competicion,
      )
    ) {
      query = query.eq("fase", phaseToDb(fase));
    }

    return query;
  }

  async function cargarFechasDisponibles() {
    let query: any = supabase.from("partidos").select("fecha");
    query = aplicarFiltroPartidos(query);

    const { data, error } = await query.order("fecha", { ascending: true });

    if (error) {
      console.log(error);
      setFechas(["1"]);
      return ["1"];
    }

    const lista = Array.from(
      new Set(
        (data || [])
          .map((partido: any) => String(partido.fecha || ""))
          .filter(Boolean),
      ),
    ).sort((a, b) => Number(a) - Number(b));

    const finales = lista.length > 0 ? lista : ["1"];
    setFechas(finales);

    if (!finales.includes(String(fecha))) {
      setFecha(finales[0]);
    }

    return finales;
  }

  async function cargarVotos(fechaObjetivo = fecha) {
    let query: any = supabase
      .from("public_dream_team_votos")
      .select(
        "id, temporada, division, competicion, fase, grupo, fecha, posicion, playerId, nombre, equipo, usuario, fecha_voto",
      )
      .eq("temporada", temporada)
      .eq("division", contextoVoto)
      .eq("fecha", fechaObjetivo)
      .eq("competicion", competicion);

    if (competicion === "copa_clasificatoria") {
      query = query.eq("grupo", grupo).eq("fase", "grupos");
    }

    if (
      ["copa_argentina", "copa_apa", "copa_campeones", "playoffs"].includes(
        competicion,
      )
    ) {
      query = query.eq("fase", phaseToDb(fase));
    }

    const result = await query;
    if (!result.error) return result;

    return supabase
      .from("public_dream_team_votos")
      .select(
        "id, temporada, division, fecha, posicion, playerId, nombre, equipo, usuario, fecha_voto",
      )
      .eq("temporada", temporada)
      .eq("division", contextoVoto)
      .eq("fecha", fechaObjetivo);
  }

  async function cargarDatos() {
    setMensaje("");
    setPosicionActiva(null);

    const disponibles = await cargarFechasDisponibles();
    const fechaObjetivo = disponibles.includes(String(fecha))
      ? String(fecha)
      : disponibles[0];

    let partidosQuery: any = supabase
      .from("partidos")
      .select("partido_id, local, visitante")
      .eq("fecha", fechaObjetivo);
    partidosQuery = aplicarFiltroPartidos(partidosQuery);

    const { data: partidosData, error: partidosError } = await partidosQuery;

    if (partidosError) {
      console.log(partidosError);
      setJugadores([]);
      setVotos([]);
      setLogos({});
      setPerfilesJugadores({});
      return;
    }

    const partidoIds = Array.from(
      new Set(
        (partidosData || [])
          .map((partido: any) => partido.partido_id)
          .filter(Boolean),
      ),
    );

    let statsResult: any = { data: [], error: null };
    if (partidoIds.length > 0) {
      statsResult = await supabase
        .from("estadisticas_jugadores")
        .select(
          "nombre, playerId, equipo, posicion, goals, assists, overallRating, rating_apa, gKSaves, score, mvp",
        )
        .in("partido_id", partidoIds);
    }

    const votosResult = await cargarVotos(fechaObjetivo);

    if (statsResult.error) {
      console.log(statsResult.error);
      setJugadores([]);
      setVotos([]);
      setPerfilesJugadores({});
      return;
    }

    if (votosResult.error) console.log(votosResult.error);

    const mapa: Record<string, any> = {};
    for (const row of statsResult.data || []) {
      const nombre = String(row.nombre || "").trim();
      const playerId = String(row.playerId || "").trim();
      if (!nombre) continue;

      const key = playerId || nombre;
      if (!mapa[key]) {
        mapa[key] = {
          nombre,
          playerId,
          equipo: row.equipo || "Sin Club",
          posicion: row.posicion || "",
          partidos: 0,
          goles: 0,
          asistencias: 0,
          ratingApaTotal: 0,
          score: 0,
          mvps: 0,
          atajadas: 0,
        };
      }

      mapa[key].partidos += 1;
      mapa[key].goles += Number(row.goals || 0);
      mapa[key].asistencias += Number(row.assists || 0);
      mapa[key].ratingApaTotal += Number(row.rating_apa || row.overallRating || 0);
      mapa[key].atajadas += getGkSaves(row);
      mapa[key].score += Number(row.score || 0);
      mapa[key].mvps += Number(row.mvp || 0);
      if (row.equipo) mapa[key].equipo = row.equipo;
      if (row.posicion) mapa[key].posicion = row.posicion;
      if (row.playerId) mapa[key].playerId = row.playerId;
      if (row.nombre) mapa[key].nombre = row.nombre;
    }

    const players: DreamTeamPlayer[] = Object.values(mapa).map((player: any) => {
      const rating =
        player.partidos > 0
          ? Math.round((player.ratingApaTotal / player.partidos) * 10) / 10
          : 0;
      return { ...player, rating, rating_apa: rating };
    });

    const voteData = (votosResult.data || []) as DreamTeamVote[];
    setJugadores(players);
    setVotos(voteData);

    const playerIds = Array.from(
      new Set(
        [
          ...players.map((player) => player.playerId),
          ...voteData.map((vote) => vote.playerId || ""),
        ].filter((value): value is string => Boolean(value)),
      ),
    );

    if (playerIds.length > 0) {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("id, display_name, username, playerid, avatar_url")
        .in("playerid", playerIds);

      if (error) {
        console.log(error);
        setPerfilesJugadores({});
      } else {
        const profiles: DreamTeamProfilesMap = {};
        for (const profile of data || []) {
          if (profile.playerid) profiles[profile.playerid] = profile as DreamTeamProfile;
        }
        setPerfilesJugadores(profiles);
      }
    } else {
      setPerfilesJugadores({});
    }

    const clubNames = Array.from(
      new Set(
        [
          ...(partidosData || []).flatMap((partido: any) => [partido.local, partido.visitante]),
          ...players.map((player) => player.equipo),
          ...voteData.map((vote) => vote.equipo),
        ].filter((value): value is string => Boolean(value)),
      ),
    );

    if (clubNames.length > 0) {
      const { data, error } = await supabase
        .from("clubes_info")
        .select("nombre, logo_url")
        .in("nombre", clubNames);

      if (error) console.log(error);
      const logoMap: DreamTeamLogosMap = {};
      for (const club of data || []) {
        if (club.nombre && club.logo_url) logoMap[club.nombre] = club.logo_url;
      }
      setLogos(logoMap);
    } else {
      setLogos({});
    }
  }

  const votosPorPosicion = useMemo(() => buildVoteWinners(votos), [votos]);
  const miDreamTeam = useMemo(
    () => buildUserDreamTeam(votos, usuarioId),
    [votos, usuarioId],
  );
  const jugadorMasVotado = useMemo(() => getMostVotedPlayer(votos), [votos]);

  function topPorPosicion(position: DreamTeamPositionId) {
    return getTopVotesForPosition(votos, position);
  }

  function candidatos(position: DreamTeamPositionId) {
    return getCandidates(jugadores, position);
  }

  async function votar(jugador: DreamTeamPlayer) {
    setMensaje("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMensaje("Tenés que iniciar sesión para votar el Dream Team.");
      return;
    }

    if (!posicionActiva) return;
    setUsuarioId(user.id);

    const votosMismaFecha = votos.filter(
      (vote) =>
        vote.temporada === temporada &&
        vote.division === contextoVoto &&
        String(vote.fecha) === String(fecha) &&
        (!vote.competicion || vote.competicion === competicion) &&
        vote.usuario === user.id,
    );

    if (votosMismaFecha.some((vote) => vote.posicion === posicionActiva)) {
      setMensaje(
        `Ya votaste la posición ${posicionActiva} en tu Dream Team de la Fecha ${fecha}.`,
      );
      return;
    }

    if (votosMismaFecha.length >= DREAM_TEAM_POSITIONS.length) {
      setMensaje(`Ya completaste tu Dream Team de la Fecha ${fecha}.`);
      return;
    }

    if (
      votosMismaFecha.some(
        (vote) =>
          (vote.playerId || vote.nombre) === (jugador.playerId || jugador.nombre),
      )
    ) {
      setMensaje(
        `${jugador.nombre} ya está en otra posición de tu Dream Team de la Fecha ${fecha}. Elegí otro jugador.`,
      );
      return;
    }

    const payload = {
      temporada,
      division: contextoVoto,
      competicion,
      fase:
        competicion === "liga"
          ? null
          : competicion === "copa_clasificatoria"
            ? "grupos"
            : phaseToDb(fase),
      grupo: competicion === "copa_clasificatoria" ? grupo : null,
      fecha,
      posicion: posicionActiva,
      playerId: jugador.playerId,
      nombre: jugador.nombre,
      equipo: jugador.equipo,
      usuario: user.id,
      fecha_voto: currentDateIso(),
    };

    let { error } = await supabase.from("dream_team_votos").insert([payload]);

    if (error && String(error.message || "").toLowerCase().includes("column")) {
      const {
        competicion: _competition,
        fase: _phase,
        grupo: _group,
        ...legacyPayload
      } = payload;
      const retry = await supabase.from("dream_team_votos").insert([legacyPayload]);
      error = retry.error;
    }

    if (error) {
      console.log(error);
      setMensaje(
        error.code === "23505"
          ? "Ya registraste ese voto para esta fecha."
          : "Error guardando voto.",
      );
      return;
    }

    setMensaje(`Voto guardado para ${posicionActiva}: ${jugador.nombre}`);
    setPosicionActiva(null);
    await cargarDatos();
  }

  async function compartir() {
    const texto = DREAM_TEAM_POSITIONS.map(
      (position) => `${position.id}: ${miDreamTeam[position.id]?.nombre || "-"}`,
    ).join("\n");

    const mensajeCompartir = `Mi Dream Team Fecha ${fecha}\n${temporada} / ${contextoLabel}\n\n${texto}`;

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(mensajeCompartir);
      setMensaje("Dream Team copiado al portapapeles.");
    }
  }

  return {
    temporada,
    setTemporada,
    competicion,
    setCompeticion,
    division,
    setDivision,
    grupo,
    setGrupo,
    fase,
    setFase,
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
    competicionLabel,
    contextoLabel,
    votosPorPosicion,
    miDreamTeam,
    jugadorMasVotado,
    topPorPosicion,
    candidatos,
    votar,
    compartir,
  };
}

export type UseDreamTeamReturn = ReturnType<typeof useDreamTeam>;
