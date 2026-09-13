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
  const query = applyMatchContext(
    supabase.from("partidos").select("fecha"),
    context,
  );

  return query.order("fecha", { ascending: true });
}

export async function fetchDreamTeamMatches(context: DreamTeamContext) {
  const query = applyMatchContext(
    supabase
      .from("partidos")
      .select("partido_id, local, visitante")
      .eq("fecha", context.fecha),
    context,
  );

  return query as Promise<{ data: DreamTeamMatch[] | null; error: any }>;
}

export async function fetchDreamTeamPlayerStats(matchIds: Array<string | number>) {
  if (matchIds.length === 0) {
    return { data: [] as DreamTeamRawPlayerStat[], error: null };
  }

  return supabase
    .from("estadisticas_jugadores")
    .select(
      "nombre, playerId, equipo, posicion, goals, assists, overallRating, rating_apa, gKSaves, score, mvp",
    )
    .in("partido_id", matchIds) as Promise<{
      data: DreamTeamRawPlayerStat[] | null;
      error: any;
    }>;
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
  if (!result.error) return result as { data: DreamTeamVote[] | null; error: any };

  // Compatibilidad con la vista vieja si todavía no expone competicion/fase/grupo.
  return supabase
    .from("public_dream_team_votos")
    .select(
      "id, temporada, division, fecha, posicion, playerId, nombre, equipo, usuario, fecha_voto",
    )
    .eq("temporada", context.temporada)
    .eq("division", division)
    .eq("fecha", context.fecha) as Promise<{
      data: DreamTeamVote[] | null;
      error: any;
    }>;
}

export async function fetchDreamTeamProfiles(playerIds: string[]) {
  if (playerIds.length === 0) {
    return { data: [] as DreamTeamProfile[], error: null };
  }

  return supabase
    .from("public_profiles")
    .select("id, display_name, username, playerid, avatar_url")
    .in("playerid", playerIds) as Promise<{
      data: DreamTeamProfile[] | null;
      error: any;
    }>;
}

export async function fetchDreamTeamClubLogos(clubNames: string[]) {
  if (clubNames.length === 0) {
    return { data: [] as Array<{ nombre: string; logo_url: string | null }>, error: null };
  }

  return supabase
    .from("clubes_info")
    .select("nombre, logo_url")
    .in("nombre", clubNames) as Promise<{
      data: Array<{ nombre: string; logo_url: string | null }> | null;
      error: any;
    }>;
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
