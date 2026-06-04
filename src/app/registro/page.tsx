"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegistroPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [steamId, setSteamId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"ok" | "error" | "info">("info");

  function limpiarUsername(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_.-]/g, "");
  }

  async function registrarse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje("");
    setTipoMensaje("info");

    const nombreLimpio = displayName.trim();
    const usernameLimpio = limpiarUsername(username);
    const playerIdLimpio = playerId.trim();
    const steamIdLimpio = steamId.trim();
    const emailLimpio = email.trim().toLowerCase();

    if (!nombreLimpio) {
      setTipoMensaje("error");
      setMensaje("Escribí tu nombre visible.");
      return;
    }

    if (!usernameLimpio) {
      setTipoMensaje("error");
      setMensaje("Escribí un nombre de usuario válido.");
      return;
    }

    if (!playerIdLimpio) {
      setTipoMensaje("error");
      setMensaje("Escribí tu PSO ID / Player ID.");
      return;
    }

    if (!steamIdLimpio) {
      setTipoMensaje("error");
      setMensaje("Escribí tu Steam ID.");
      return;
    }

    if (!emailLimpio) {
      setTipoMensaje("error");
      setMensaje("Escribí tu email.");
      return;
    }

    if (password.length < 6) {
      setTipoMensaje("error");
      setMensaje("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setTipoMensaje("error");
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    const { data, error } = await supabase.auth.signUp({
      email: emailLimpio,
      password,
      options: {
        data: {
          display_name: nombreLimpio,
          username: usernameLimpio,
          requested_playerid: playerIdLimpio,
          steam_id: steamIdLimpio,
        },
      },
    });

    if (error) {
      console.log(error);
      setTipoMensaje("error");

      if (error.message.toLowerCase().includes("already registered")) {
        setMensaje("Ese email ya está registrado. Probá iniciar sesión.");
      } else {
        setMensaje("Error creando cuenta: " + error.message);
      }

      setCargando(false);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      await supabase
        .from("profiles")
        .update({
          display_name: nombreLimpio,
          username: usernameLimpio,
          requested_playerid: playerIdLimpio,
          steam_id: steamIdLimpio,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    setTipoMensaje("ok");
    setMensaje(
      "Cuenta creada. Tu perfil y PlayerId quedan pendientes de verificación por un administrador APA.",
    );

    setDisplayName("");
    setUsername("");
    setPlayerId("");
    setSteamId("");
    setEmail("");
    setPassword("");
    setConfirmarPassword("");

    setCargando(false);

    setTimeout(() => {
      router.push("/login");
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_28%,#020714_58%,#000_100%)] px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_460px]">
        <section className="relative overflow-hidden rounded-[38px] border border-sky-500/25 bg-[#020714] p-8 shadow-[0_0_55px_rgba(0,120,255,.18)] md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />

          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
              APA PSO ARGENTINA
            </p>

            <h1 className="mt-5 text-5xl font-black uppercase italic leading-none md:text-7xl">
              <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                Crear
              </span>
              <span className="block text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,.55)]">
                Cuenta
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-zinc-400">
              Registrate para participar en funciones de comunidad como Dream
              Team, predicciones, perfiles públicos y futuras votaciones APA.
              Tu PlayerId queda como solicitud hasta que un administrador verifique que realmente te pertenece.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-sky-400/20 bg-black/35 p-5">
                <p className="text-3xl">👤</p>
                <h3 className="mt-3 font-black uppercase">Perfil</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Tu nombre visible y usuario público.
                </p>
              </div>

              <div className="rounded-3xl border border-yellow-400/20 bg-black/35 p-5">
                <p className="text-3xl">🕒</p>
                <h3 className="mt-3 font-black uppercase">Pendiente</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Un admin debe aprobar tu perfil y verificar tu PlayerId.
                </p>
              </div>

              <div className="rounded-3xl border border-green-400/20 bg-black/35 p-5">
                <p className="text-3xl">✅</p>
                <h3 className="mt-3 font-black uppercase">Comunidad</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Después vas a poder participar con tu cuenta.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-white/10 bg-[#020714] p-6 shadow-[0_0_45px_rgba(0,0,0,.35)] md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
              Registro
            </p>
            <h2 className="mt-3 text-3xl font-black uppercase">
              Crear cuenta APA
            </h2>
            <p className="mt-3 text-sm text-zinc-500">
              Creá tu cuenta APA con usuario, PlayerId solicitado, Steam ID y contraseña. El PlayerId no queda verificado automáticamente.
            </p>
          </div>

          <form onSubmit={registrarse} className="mt-7 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Nombre visible
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej: Monzon"
                className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-sky-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Usuario
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(limpiarUsername(e.target.value))}
                placeholder="Ej: monzon07"
                className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-sky-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                PSO ID / Player ID solicitado
              </label>
              <input
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="Obligatorio"
                className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-sky-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Steam ID
              </label>
              <input
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                placeholder="Obligatorio"
                className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-sky-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-sky-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-sky-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Repetir contraseña
              </label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repetí la contraseña"
                className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-sky-400/60"
              />
            </div>

            {mensaje && (
              <div
                className={`rounded-2xl border px-5 py-4 text-sm font-black ${
                  tipoMensaje === "ok"
                    ? "border-green-400/25 bg-green-400/10 text-green-300"
                    : tipoMensaje === "error"
                      ? "border-red-400/25 bg-red-400/10 text-red-300"
                      : "border-sky-400/25 bg-sky-400/10 text-sky-300"
                }`}
              >
                {mensaje}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-blue-700 px-6 py-4 font-black uppercase text-white shadow-[0_0_28px_rgba(56,189,248,.24)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <p className="text-center text-sm text-zinc-500">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="font-black text-sky-300 hover:text-white">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
