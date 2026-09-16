import { supabase } from "@/lib/supabase";

export type CompetitionValue =
  | "liga"
  | "copa_clasificatoria"
  | "copa_argentina"
  | "copa_apa"
  | "copa_campeones"
  | "playoffs";

export type AdminTitle = {
  id: string;
  equipo: string;
  competicion: string;
  temporada: string;
  division: string | null;
  descripcion: string | null;
};

export const TITLE_COMPETITIONS: Array<{ value: CompetitionValue; label: string }> = [
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa APA" },
  { value: "copa_campeones", label: "Copa de Campeones" },
  { value: "playoffs", label: "Playoffs de Ascenso" },
];

export function competitionLabel(value: string) {
  return TITLE_COMPETITIONS.find((item) => item.value === value)?.label || value;
}

export async function fetchAdminTitles() {
  const { data, error } = await supabase
    .from("titulos")
    .select("id,equipo,competicion,temporada,division,descripcion")
    .order("temporada", { ascending: false });
  if (error) throw error;
  return (data || []) as AdminTitle[];
}

export async function fetchSeasonClubs(season: string) {
  const { data, error } = await supabase
    .from("v_clubes_temporada_public")
    .select("nombre,division")
    .eq("temporada", season)
    .eq("activo", true)
    .order("nombre", { ascending: true });
  if (error) throw error;
  return (data || []) as Array<{ nombre: string; division: string | null }>;
}

export async function createAdminTitle(input: {
  equipo: string;
  competicion: CompetitionValue;
  temporada: string;
  division: string | null;
  descripcion: string | null;
}) {
  const { error } = await supabase.from("titulos").insert(input);
  if (error) throw error;
}

export async function deleteAdminTitle(id: string) {
  const { error } = await supabase.from("titulos").delete().eq("id", id);
  if (error) throw error;
}
