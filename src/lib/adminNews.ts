import { supabase } from "@/lib/supabase";

export type AdminNewsItem = {
  id: string;
  titulo: string;
  descripcion: string;
  temporada: string | null;
  categoria: string | null;
  imagen_url: string | null;
  autor: string | null;
  publicada: boolean;
  destacada: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AdminNewsDraft = Omit<AdminNewsItem, "id" | "created_at" | "updated_at">;

export const NEWS_CATEGORIES = [
  "General",
  "Competición",
  "Mercado",
  "Clubes",
  "Jugadores",
  "Comunidad",
  "Comunicado",
];

export const DEFAULT_NEWS_DRAFT: AdminNewsDraft = {
  titulo: "",
  descripcion: "",
  temporada: "Temporada 4",
  categoria: "General",
  imagen_url: null,
  autor: "",
  publicada: true,
  destacada: false,
};

export async function fetchAdminNews() {
  const { data, error } = await supabase
    .from("noticias")
    .select("id,titulo,descripcion,temporada,categoria,imagen_url,autor,publicada,destacada,created_at,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as AdminNewsItem[];
}

export async function saveAdminNews(draft: AdminNewsDraft, id?: string | null) {
  const payload = {
    titulo: draft.titulo.trim(),
    descripcion: draft.descripcion.trim(),
    temporada: draft.temporada || null,
    categoria: draft.categoria || "General",
    imagen_url: draft.imagen_url || null,
    autor: draft.autor?.trim() || null,
    publicada: draft.publicada,
    destacada: draft.destacada,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase.from("noticias").update(payload).eq("id", id);
    if (error) throw error;
    return id;
  }

  const { data, error } = await supabase.from("noticias").insert(payload).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteAdminNews(id: string) {
  const { error } = await supabase.from("noticias").delete().eq("id", id);
  if (error) throw error;
}

export async function setNewsPublished(id: string, published: boolean) {
  const { error } = await supabase.from("noticias").update({ publicada: published, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function setNewsFeatured(id: string, featured: boolean) {
  const { error } = await supabase.from("noticias").update({ destacada: featured, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function uploadNewsImage(file: File) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Formato inválido. Usá JPG, PNG o WEBP.");
  if (file.size > 5 * 1024 * 1024) throw new Error("La imagen no puede superar 5 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase();
  const safeExtension = extension === "png" || extension === "webp" || extension === "jpeg" || extension === "jpg" ? extension : "jpg";
  const filename = `${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;
  const { error } = await supabase.storage.from("noticias").upload(filename, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  return supabase.storage.from("noticias").getPublicUrl(filename).data.publicUrl;
}

export async function notifyNewsCommunity(title: string) {
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from("notificaciones")
    .select("id")
    .eq("tipo", "news")
    .eq("titulo", "Nueva noticia APA")
    .eq("mensaje", title)
    .eq("href", "/")
    .gte("created_at", since)
    .limit(1);

  if (existing?.length) return { duplicated: true };

  const { data: users, error: usersError } = await supabase.from("profiles").select("id");
  if (usersError) throw usersError;
  if (!users?.length) return { duplicated: false };

  const { error } = await supabase.from("notificaciones").insert(
    users.map((user) => ({
      user_id: user.id,
      tipo: "news",
      titulo: "Nueva noticia APA",
      mensaje: title,
      href: "/",
      leida: false,
    })),
  );
  if (error) throw error;
  return { duplicated: false };
}
