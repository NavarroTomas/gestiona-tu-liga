import { supabase } from "@/lib/supabase";
import type {
  PredictionContext,
  PredictionProfile,
  PredictionVote,
} from "./types";

/**
 * Único archivo del módulo que conoce Supabase.
 * Los componentes nunca deberían consultar la base directamente.
 */
export async function ensurePredictionUser() {
  const current = await supabase.auth.getUser();
  if (current.data.user) return current;
  return supabase.auth.signInAnonymously();
}

export async function fetchPredictionCurrentUser() {
  return supabase.auth.getUser();
}

export async function fetchPredictionMatches(
  season: string,
  context: PredictionContext,
) {
  let query = supabase
    .from("partidos")
    .select(
      "id, partido_id, local, visitante, resultado, fecha, temporada, division, competicion, fase, grupo, dia, hora, scheduled_at",
    )
    .eq("temporada", season)
    .eq("competicion", context.competicion)
    .order("fecha", { ascending: true })
    .order("scheduled_at", { ascending: true, nullsFirst: false });

  if (context.competicion === "liga") {
    query = query.in("division", [context.division, context.divisionDb].filter(Boolean) as string[]);
  } else if (context.competicion === "copa_clasificatoria") {
    query = query.eq("fase", "grupos").eq("grupo", context.grupo || "");
  } else {
    query = query.eq("fase", context.fase || "");
  }

  return query;
}

export async function fetchPredictionVotes(matchIds: string[]) {
  if (matchIds.length === 0) return { data: [], error: null };

  return supabase
    .from("predicciones")
    .select(
      "id, partido_id, temporada, division, local, visitante, prediccion, usuario, goles_local, goles_visitante, created_at",
    )
    .in("partido_id", matchIds);
}

export async function fetchPredictionProfiles(userIds: string[]) {
  if (userIds.length === 0) {
    return { data: [] as PredictionProfile[], error: null };
  }

  return supabase
    .from("public_profiles")
    .select("id, display_name, username")
    .in("id", userIds);
}

export async function insertPredictionVote(payload: Omit<PredictionVote, "id">) {
  return supabase
    .from("predicciones")
    .insert([payload])
    .select(
      "id, partido_id, temporada, division, local, visitante, prediccion, usuario, goles_local, goles_visitante, created_at",
    )
    .single();
}
