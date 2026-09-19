import { supabase } from "@/lib/supabase";

export type AdminClub = {
  id?: string;
  nombre: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  descripcion: string | null;
  color_principal: string | null;
  temporada?: string | null;
  division?: string | null;
  activo?: boolean | null;
};

export type ClubSeasonAssignment = {
  temporada: string;
  division: string;
  activo: boolean;
};

export const DEFAULT_CLUB: AdminClub = {
  nombre: "",
  slug: "",
  logo_url: "",
  banner_url: "",
  descripcion: "",
  color_principal: "#245f8e",
};

export const DEFAULT_ASSIGNMENT: ClubSeasonAssignment = {
  temporada: "Temporada 4",
  division: "segunda",
  activo: true,
};

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_MB = 4;

export function slugifyClub(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function seasonClubSlug(value: string, season: string) {
  const base = slugifyClub(value);
  const seasonNumber = String(season || "").match(/(\d+)/)?.[1];
  return seasonNumber ? `${base}-t${seasonNumber}` : `${base}-${slugifyClub(season)}`;
}

export function sanitizeClubText(value: string, max = 120) {
  return value.replace(/[<>]/g, "").trim().slice(0, max);
}

export function validateClubImage(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!EXTENSIONS.includes(extension)) return "Formato inválido. Usá JPG, PNG o WEBP.";
  if (!MIME_TYPES.includes(file.type)) return "Tipo de archivo inválido. No se permite SVG ni otros formatos.";
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `La imagen no puede superar ${MAX_IMAGE_MB} MB.`;
  return null;
}

export async function fetchAdminClubs(season: string) {
  if (!season) return [] as AdminClub[];

  const { data, error } = await supabase
    .from("v_clubes_temporada_public")
    .select("club_id,nombre,slug,logo_url,banner_url,descripcion,color_principal,temporada,division,activo")
    .eq("temporada", season)
    .order("nombre", { ascending: true });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: String(row.club_id),
    nombre: row.nombre,
    slug: row.slug,
    logo_url: row.logo_url,
    banner_url: row.banner_url,
    descripcion: row.descripcion,
    color_principal: row.color_principal,
    temporada: row.temporada,
    division: row.division,
    activo: row.activo,
  })) as AdminClub[];
}

export async function fetchClubAssignment(clubId: string, season: string) {
  const { data, error } = await supabase
    .from("clubes_temporada")
    .select("temporada,division,activo")
    .eq("club_id", clubId)
    .eq("temporada", season)
    .maybeSingle();
  if (error) throw error;
  return data as ClubSeasonAssignment | null;
}

export async function saveClub(club: AdminClub, season: string) {
  const slug = club.id
    ? (club.slug.trim() || seasonClubSlug(club.nombre, season))
    : seasonClubSlug(club.nombre, season);
  const payload = {
    nombre: sanitizeClubText(club.nombre, 80),
    slug,
    logo_url: club.logo_url || null,
    banner_url: club.banner_url || null,
    descripcion: club.descripcion ? sanitizeClubText(club.descripcion, 500) : null,
    color_principal: club.color_principal || "#245f8e",
    updated_at: new Date().toISOString(),
  };

  if (club.id) {
    const { error } = await supabase.from("clubes_info").update(payload).eq("id", club.id);
    if (error) throw error;
    return { ...club, ...payload, id: club.id } as AdminClub;
  }

  const { data, error } = await supabase
    .from("clubes_info")
    .insert(payload)
    .select("id,nombre,slug,logo_url,banner_url,descripcion,color_principal")
    .single();
  if (error) throw error;
  return data as AdminClub;
}

export async function saveClubAssignment(clubId: string, assignment: ClubSeasonAssignment) {
  const { error } = await supabase.from("clubes_temporada").upsert({
    club_id: clubId,
    temporada: assignment.temporada,
    division: assignment.division,
    activo: assignment.activo,
    updated_at: new Date().toISOString(),
  }, { onConflict: "club_id,temporada" });
  if (error) throw error;
}

export async function deleteClub(clubId: string) {
  const { error } = await supabase.from("clubes_info").delete().eq("id", clubId);
  if (error) throw error;
}

export async function uploadClubImage(file: File, kind: "logo" | "banner", slug: string) {
  const validation = validateClubImage(file);
  if (validation) throw new Error(validation);

  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const folder = kind === "logo" ? "Logos" : "Banners";
  const path = `${folder}/${slug}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from("clubes").upload(path, file, {
    upsert: true,
    cacheControl: "0",
    contentType: file.type,
  });
  if (error) throw error;

  return supabase.storage.from("clubes").getPublicUrl(path).data.publicUrl;
}
