import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | undefined;
export function isPlatformConfigured() {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}
/** Real client only: never falls back to the legacy browser demo. */
export function platformClient() {
    if (!isPlatformConfigured())
        throw new Error("Falta configurar la conexión con Supabase. Revisá .env.example.");
    return client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "gtl:auth:v1" } });
}
export function messageFor(error: unknown): string {
    const e = error as {
        message?: string;
        code?: string;
    };
    if (e?.message?.includes("Invalid login credentials"))
        return "El correo o la contraseña no son correctos.";
    if (e?.message?.includes("Email not confirmed"))
        return "Confirmá tu correo antes de iniciar sesión.";
    if (e?.message?.includes("rate limit"))
        return "Se alcanzó el límite temporal de intentos. Esperá unos minutos.";
    if (e?.message?.includes("Email address") || e?.message?.includes("email_address_invalid"))
        return "Revisá la dirección de correo ingresada.";
    if (e?.message?.includes("email") && e?.message?.includes("sending"))
        return "No se pudo enviar la confirmación. El administrador debe revisar el servicio de correo.";
    if (e?.code === "23505")
        return "Ya existe un registro con ese nombre. Elegí otro.";
    if (e?.code === "23503")
        return "Ese registro está relacionado con otros datos. Revisá sus partidos o participantes.";
    if (e?.code === "42501")
        return "No tenés permisos para realizar esta acción en la liga.";
    if (e?.code === "PGRST116")
        return "El registro ya no está disponible o no tenés permisos. Actualizá la lista antes de reintentar.";
    if (e?.message?.includes("fetch"))
        return "No pudimos conectar. Revisá tu conexión e intentá nuevamente.";
    return e?.message || "No se pudo completar la operación. Volvé a intentar.";
}
