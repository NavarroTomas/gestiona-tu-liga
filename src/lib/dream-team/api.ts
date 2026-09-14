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

export async function ensureDreamTeamUser() {
  const current = await supabase.auth.getUser();
  if (!current.error && current.data.user) return current;

  const anonymous = await supabase.auth.signInAnonymously();
  return {
    data: { user: anonymous.data.user },
    error: anonymous.error,
  };
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
      .select("partido_id, local, visitante, fecha, dia, hora, estado, scheduled_at")
      .eq("fecha", context.fecha),
    context,
  );

  return {
    data: (result.data || []) as DreamTeamMatch[],
    error: result.error,
  };
}

export async function fetchDreamTeamVotingWindow(context: DreamTeamContext) {
  const result = await supabase.rpc("get_dream_team_voting_window", {
    p_temporada: context.temporada,
    p_competicion: context.competicion,
    p_division: getDreamTeamContextLabel(context),
    p_grupo: context.competicion === "copa_clasificatoria" ? context.grupo : null,
    p_fase:
      context.competicion === "liga"
        ? null
        : context.competicion === "copa_clasificatoria"
          ? "grupos"
          : normalizeDreamTeamPhase(context.fase),
    p_fecha: context.fecha,
  });

  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  const openAt = row?.open_at ? String(row.open_at) : null;
  const closeAt = row?.close_at ? String(row.close_at) : null;
  const now = Date.now();
  const openTime = openAt ? new Date(openAt).getTime() : null;
  const closeTime = closeAt ? new Date(closeAt).getTime() : null;

  return {
    data: row
      ? {
          openAt,
          closeAt,
          isOpen: Boolean(row.is_open),
          isWaiting: openTime !== null && now < openTime,
          isClosed: closeTime !== null && now >= closeTime,
        }
      : {
          openAt: null,
          closeAt: null,
          isOpen: false,
          isWaiting: false,
          isClosed: false,
        },
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

export async function insertDreamTeamVotes(payloads: DreamTeamVotePayload[]) {
  return supabase.from("dream_team_votos").insert(payloads);
}
