"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Perfil = {
  id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  playerid: string | null;
  requested_playerid: string | null;
  playerid_verified: boolean | null;
  verification_status: string | null;
  verification_note: string | null;
  steam_id: string | null;
  bio: string | null;
  avatar_url: string | null;
  status: string | null;
  visible_role: string | null;
};

export default function PerfilPage() {
  const router = useRouter();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [requestedPlayerid, setRequestedPlayerid] = useState("");
  const [steamId, setSteamId] = useState("");
  const [bio, setBio] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  function limpiarUsername(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_.-]/g, "");
  }

  async function cargarPerfil() {
    setLoading(true);
    setMensaje("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,display_name,username,playerid,requested_playerid,playerid_verified,verification_status,verification_note,steam_id,bio,avatar_url,status,visible_role")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      console.log(error);
      setMensaje("No pude cargar tu perfil.");
      setLoading(false);
      return;
    }

    setPerfil(data as Perfil);
    setDisplayName(data.display_name || "");
    setUsername(data.username || "");
    setRequestedPlayerid(data.requested_playerid || data.playerid || "");
    setSteamId(data.steam_id || "");
    setBio(data.bio || "");
    setLoading(false);
  }

  async function subirAvatar(file: File) {
    setMensaje("");

    if (!perfil) return;

    if (!file.type.startsWith("image/")) {
      setMensaje("El archivo debe ser una imagen.");
      return;
    }

    const maxSizeMb = 3;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setMensaje(`La imagen no puede pesar más de ${maxSizeMb}MB.`);
      return;
    }

    setSubiendoAvatar(true);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${perfil.id}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.log(uploadError);
      setMensaje("No pude subir la foto: " + uploadError.message);
      setSubiendoAvatar(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", perfil.id);

    setSubiendoAvatar(false);

    if (updateError) {
      console.log(updateError);
      setMensaje("La foto subió, pero no pude guardarla en tu perfil.");
      return;
    }

    setMensaje("Foto de perfil actualizada.");
    await cargarPerfil();
  }

  async function guardarPerfil() {
    setMensaje("");

    const nombreLimpio = displayName.trim();
    const usernameLimpio = limpiarUsername(username);
    const requestedPlayeridLimpio = requestedPlayerid.trim();
    const steamIdLimpio = steamId.trim();

    if (!perfil) return;

    if (!nombreLimpio) {
      setMensaje("El nombre visible es obligatorio.");
      return;
    }

    if (!usernameLimpio) {
      setMensaje("El usuario es obligatorio.");
      return;
    }

    if (!requestedPlayeridLimpio) {
      setMensaje("El PSO ID / Player ID solicitado es obligatorio.");
      return;
    }

    if (!steamIdLimpio) {
      setMensaje("El Steam ID es obligatorio.");
      return;
    }

    setGuardando(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: nombreLimpio,
        username: usernameLimpio,
        requested_playerid: requestedPlayeridLimpio,
        playerid_verified: false,
        verification_status: "pending",
        verification_note:
          requestedPlayeridLimpio !== (perfil.requested_playerid || perfil.playerid || "")
            ? "El usuario modificó su PlayerId solicitado. Requiere nueva verificación."
            : perfil.verification_note,
        steam_id: steamIdLimpio,
        bio: bio.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", perfil.id);

    setGuardando(false);

    if (error) {
      console.log(error);
      setMensaje("Error guardando perfil: " + error.message);
      return;
    }

    setMensaje("Perfil actualizado. Tu PlayerId solicitado queda pendiente de verificación por un administrador APA.");
    await cargarPerfil();
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-2xl font-black uppercase tracking-[0.18em] text-sky-300">
          Cargando perfil...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-10 text-white">
      <section className="mx-auto max-w-5xl space-y-8">
        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.18)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/25" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
                Cuenta APA
              </p>

              <h1 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-6xl">
                Mi perfil
              </h1>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Administrá tus datos públicos. Tu PlayerId queda como solicitud y debe ser verificado por un administrador APA antes de vincularse oficialmente a tus estadísticas.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/35 p-5 text-center">
              <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-sky-400/30 bg-sky-400/10 text-4xl font-black text-sky-300">
                {perfil?.avatar_url ? (
                  <img
                    src={perfil.avatar_url}
                    alt={perfil.display_name || perfil.username || "Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (perfil?.display_name || perfil?.username || "A").slice(0, 1).toUpperCase()
                )}
              </div>

              <p className="mt-4 text-xl font-black">
                {perfil?.display_name || perfil?.username}
              </p>

              <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
                {perfil?.visible_role || "usuario"}
              </p>

              <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                {perfil?.status || "pending"}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 md:p-8">
            <h2 className="text-3xl font-black uppercase">Datos públicos</h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                  Nombre visible
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-sky-400/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                  Usuario
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(limpiarUsername(e.target.value))}
                  className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-sky-400/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                  PSO ID / Player ID solicitado
                </label>
                <input
                  value={requestedPlayerid}
                  onChange={(e) => setRequestedPlayerid(e.target.value)}
                  placeholder="Este dato será revisado por un admin"
                  className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-sky-400/60"
                />

                <div className="mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300">
                    Verificación de PlayerId
                  </p>

                  <div className="mt-3 grid gap-2 text-sm text-zinc-300">
                    <p>
                      Solicitado:{" "}
                      <span className="font-black text-white">
                        {perfil?.requested_playerid || "Sin solicitud"}
                      </span>
                    </p>

                    <p>
                      Verificado:{" "}
                      <span className={perfil?.playerid_verified ? "font-black text-green-300" : "font-black text-zinc-500"}>
                        {perfil?.playerid_verified ? perfil?.playerid || "Verificado" : "Pendiente"}
                      </span>
                    </p>

                    <p>
                      Estado:{" "}
                      <span className={`font-black ${
                        perfil?.verification_status === "approved"
                          ? "text-green-300"
                          : perfil?.verification_status === "rejected"
                            ? "text-red-300"
                            : perfil?.verification_status === "disputed"
                              ? "text-orange-300"
                              : "text-yellow-300"
                      }`}>
                        {perfil?.verification_status || "pending"}
                      </span>
                    </p>

                    {perfil?.verification_note && (
                      <p className="text-xs leading-5 text-zinc-500">
                        Nota: {perfil.verification_note}
                      </p>
                    )}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-zinc-500">
                    Tu PlayerId no se vincula automáticamente. Un administrador debe verificar que realmente te pertenece.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                  Steam ID
                </label>
                <input
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-sky-400/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Contá algo corto sobre vos..."
                  className="min-h-[130px] w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-sky-400/60"
                />
              </div>

              {mensaje && (
                <p className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm font-black text-sky-300">
                  {mensaje}
                </p>
              )}

              <button
                onClick={guardarPerfil}
                disabled={guardando}
                className="w-full rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar perfil"}
              </button>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                Foto de perfil
              </p>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/30 bg-sky-400/10 text-3xl font-black text-sky-300">
                  {perfil?.avatar_url ? (
                    <img
                      src={perfil.avatar_url}
                      alt={perfil.display_name || perfil.username || "Avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (perfil?.display_name || perfil?.username || "A").slice(0, 1).toUpperCase()
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-zinc-400">
                    Subí una imagen JPG, PNG o WEBP.
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Máximo 3MB.
                  </p>
                </div>
              </div>

              <label className="mt-5 block cursor-pointer rounded-2xl border border-sky-400/25 bg-sky-400/10 px-5 py-4 text-center text-sm font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black">
                {subiendoAvatar ? "Subiendo..." : "Cambiar foto"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={subiendoAvatar}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) subirAvatar(file);
                    e.currentTarget.value = "";
                  }}
                  className="hidden"
                />
              </label>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-[#020714] p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                Cuenta
              </p>

              <p className="mt-4 text-sm text-zinc-400">
                Email: <span className="font-black text-zinc-300">privado</span>
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                Estado: <span className="font-black text-yellow-300">{perfil?.status}</span>
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                PlayerId:{" "}
                <span className={perfil?.playerid_verified ? "font-black text-green-300" : "font-black text-yellow-300"}>
                  {perfil?.playerid_verified ? "Verificado" : "Pendiente"}
                </span>
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                Rango: <span className="font-black text-sky-300">{perfil?.visible_role || "usuario"}</span>
              </p>

              <p className="mt-5 text-xs leading-6 text-zinc-500">
                No podés modificar tu rango, permisos ni estado desde acá.
              </p>
            </section>

            {perfil?.username && (
              <Link
                href={`/u/${perfil.username}`}
                className="block w-full rounded-2xl border border-sky-400/25 bg-sky-400 px-5 py-4 text-center text-sm font-black uppercase text-black transition hover:bg-white"
              >
                Ver perfil público
              </Link>
            )}

            <button
              onClick={cerrarSesion}
              className="w-full rounded-2xl border border-red-400/25 bg-red-400/10 px-5 py-4 text-sm font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
            >
              Cerrar sesión
            </button>
          </aside>
        </section>
      </section>
    </main>
  );
}
