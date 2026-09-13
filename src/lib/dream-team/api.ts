import { supabase } from "@/lib/supabase";
import type {
  DreamTeamCompetition,
  DreamTeamContext,
  DreamTeamMatch,
  DreamTeamProfile,
  DreamTeamRawPlayerStat,
  DreamTeamVote,
} from "./types";
import {
  getDreamTeamContextLabel,
  isKnockoutDreamTeamCompetition,
  normalizeDreamTeamPhase,
} from "./utils";

function applyMatchContext(query: any, context: DreamTeamContext) {
  let next = query
    .eq("temporada", context.temporada)
    .eq("competicion", context.competicion);

  if (context.competicion === "liga") {
    next = next.in("division", [context.division, context.division.toLowerCase()]);
  }

  if (context.competicion === "copa_clasificatoria") {
    next = next.eq("fase", "grupos").eq("grupo", context.grupo);
  }

  if (isKnockoutDreamTeamCompetition(context.competicion)) {
    next = next.eq("fase", normalizeDreamTeamPhase(context.fase));
  }

  return next;
}

export async function fetchDreamTeamCurrentUser() {
  return supabase.auth.getUser();
}

export async function fetchDreamTeamUserProfile(userId: string) {
  return supabase
    .from("profiles")
    .select("id, display_name, username, playerid, avatar_url")
    .eq("id", userId)
    .maybeSingle();
}

export async function fetchDreamTeamAvailableDates(context: DreamTeamContext) {
  const result = await applyMatchContext(
    supabase.from("partidos").select("fecha"),
    context,
  ).order("fecha", { ascending: true });

  return {
    data: (result.data || []) as Array<{ fecha?: string | number | null }>,
    error: result.error,
  };
}

export async function fetchDreamTeamMatches(context: DreamTeamContext) {
  const result = await applyMatchContext(
    supabase
      .from("partidos")
      .select("partido_id, local, visitante")
      .eq("fecha", context.fecha),
    context,
  );

  return {
    data: (result.data || []) as DreamTeamMatch[],
    error: result.error,
  };
}

export async function fetchDreamTeamPlayerStats(matchIds: Array<string | number>) {
  if (matchIds.length === 0) {
    return { data: [] as DreamTeamRawPlayerStat[], error: null };
  }

  const result = await supabase
    .from("estadisticas_jugadores")
    .select(
      "nombre, playerId, equipo, posicion, goals, assists, overallRating, rating_apa, gKSaves, score, mvp",
    )
    .in("partido_id", matchIds);

  return {
    data: (result.data || []) as DreamTeamRawPlayerStat[],
    error: result.error,
  };
}

export async function fetchDreamTeamVotes(context: DreamTeamContext) {
  const division = getDreamTeamContextLabel(context);

  let query: any = supabase
    .from("public_dream_team_votos")
    .select(
      "id, temporada, division, competicion, fase, grupo, fecha, posicion, playerId, nombre, equipo, usuario, fecha_voto",
    )
    .eq("temporada", context.temporada)
    .eq("division", division)
    .eq("fecha", context.fecha)
    .eq("competicion", context.competicion);

  if (context.competicion === "copa_clasificatoria") {
    query = query.eq("grupo", context.grupo).eq("fase", "grupos");
  }

  if (isKnockoutDreamTeamCompetition(context.competicion)) {
    query = query.eq("fase", normalizeDreamTeamPhase(context.fase));
  }

  const result = await query;
  if (!result.error) {
    return {
      data: (result.data || []) as DreamTeamVote[],
      error: null,
    };
  }

  // Compatibilidad con la vista vieja si todavía no expone competicion/fase/grupo.
  const legacyResult = await supabase
    .from("public_dream_team_votos")
    .select(
      "id, temporada, division, fecha, posicion, playerId, nombre, equipo, usuario, fecha_voto",
    )
    .eq("temporada", context.temporada)
    .eq("division", division)
    .eq("fecha", context.fecha);

  return {
    data: (legacyResult.data || []) as DreamTeamVote[],
    error: legacyResult.error,
  };
}

export async function fetchDreamTeamProfiles(playerIds: string[]) {
  if (playerIds.length === 0) {
    return { data: [] as DreamTeamProfile[], error: null };
  }

  const result = await supabase
    .from("public_profiles")
    .select("id, display_name, username, playerid, avatar_url")
    .in("playerid", playerIds);

  return {
    data: (result.data || []) as DreamTeamProfile[],
    error: result.error,
  };
}

export type DreamTeamVotePayload = {
  temporada: string;
  division: string;
  competicion: DreamTeamCompetition;
  fase: string | null;
  grupo: string | null;
  fecha: string;
  posicion: string;
  playerId: string;
  nombre: string;
  equipo: string;
  usuario: string;
  fecha_voto: string;
};

export async function insertDreamTeamVote(payload: DreamTeamVotePayload) {
  let result = await supabase.from("dream_team_votos").insert([payload]);

  if (result.error && String(result.error.message || "").toLowerCase().includes("column")) {
    const { competicion: _competition, fase: _phase, grupo: _group, ...legacyPayload } = payload;
    result = await supabase.from("dream_team_votos").insert([legacyPayload]);
  }

  return result;
}
