"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Perfil = {
  id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  playerid: string | null;
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
  const [playerid, setPlayerid] = useState("");
  const [steamId, setSteamId] = useState("");
  const [bio, setBio] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

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
      .select("id,email,display_name,username,playerid,steam_id,bio,avatar_url,status,visible_role")
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
    setPlayerid(data.playerid || "");
    setSteamId(data.steam_id || "");
    setBio(data.bio || "");
    setLoading(false);
  }

  async function guardarPerfil() {
    setMensaje("");

    const nombreLimpio = displayName.trim();
    const usernameLimpio = limpiarUsername(username);
    const playeridLimpio = playerid.trim();
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

    if (!playeridLimpio) {
      setMensaje("El PSO ID / Player ID es obligatorio.");
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
        playerid: playeridLimpio,
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

    setMensaje("Perfil actualizado correctamente.");
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
                Administrá tus datos de jugador para votar, predecir y participar en la comunidad.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/35 p-5 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-4xl font-black text-sky-300">
                {(perfil?.display_name || perfil?.username || "A").slice(0, 1).toUpperCase()}
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
                  PSO ID / Player ID
                </label>
                <input
                  value={playerid}
                  onChange={(e) => setPlayerid(e.target.value)}
                  className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-sky-400/60"
                />
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
            <section className="rounded-[34px] border border-white/10 bg-[#020714] p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                Cuenta
              </p>

              <p className="mt-4 text-sm text-zinc-400">
                Email: <span className="font-black text-white">{perfil?.email}</span>
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                Estado: <span className="font-black text-yellow-300">{perfil?.status}</span>
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                Rango: <span className="font-black text-sky-300">{perfil?.visible_role || "usuario"}</span>
              </p>

              <p className="mt-5 text-xs leading-6 text-zinc-500">
                No podés modificar tu rango, permisos ni estado desde acá.
              </p>
            </section>

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
