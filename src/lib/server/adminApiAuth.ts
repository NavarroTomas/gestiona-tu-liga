import "server-only";

import { createClient } from "@supabase/supabase-js";

export async function requireAdminPermission(request: Request, permission: string) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Falta configuración de Supabase en el servidor.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data, error } = await supabase.rpc("get_my_permissions");
  if (error) throw error;

  const permissions = Array.isArray(data)
    ? data
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object" && "code" in item) {
            const code = (item as { code?: unknown }).code;
            return typeof code === "string" ? code : null;
          }
          return null;
        })
        .filter((code): code is string => Boolean(code))
    : [];

  if (!permissions.includes("admin.owner") && !permissions.includes(permission)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
