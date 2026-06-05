"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import HelperTooltip from "@/components/HelperTooltip";

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

  function limpiarSteamId(value: string) {
    return value.trim();
  }

  function esSteamId64Valido(value: string) {
    return /^\d{15,20}$/.test(value.trim());
  }

  async function registrarse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje("");
    setTipoMensaje("info");

    const nombreLimpio = displayName.trim();
    const usernameLimpio = limpiarUsername(username);
    const playerIdLimpio = playerId.trim();
    const steamIdLimpio = limpiarSteamId(steamId);
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
      setMensaje("Escribí tu SteamID64.");
      return;
    }

    if (!esSteamId64Valido(steamIdLimpio)) {
      setTipoMensaje("error");
      setMensaje("Steam ID inválido. Ingresá solo tu SteamID64 numérico. Ejemplo: 76561199109076112. No uses links de Steam.");
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
              Team, predicciones, perfiles públicos, premios APA y verificaciones.
              Tu PlayerId y SteamID64 quedan sujetos a revisión para evitar errores o suplantaciones.
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
                <p className="text-3xl">🎮</p>
                <h3 className="mt-3 font-black uppercase">SteamID64</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Usá solo el número de Steam. No pegues links ni nombres.
                </p>
              </div>

              <div className="rounded-3xl border border-green-400/20 bg-black/35 p-5">
                <p className="text-3xl">✅</p>
                <h3 className="mt-3 font-black uppercase">Verificación</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Si los datos son correctos, un admin puede aprobar tu identidad.
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
              Creá tu cuenta APA con usuario, PlayerId solicitado, SteamID64 y contraseña. El PlayerId no queda verificado automáticamente.
            </p>

            <div className="mt-5 rounded-3xl border border-red-400/30 bg-red-400/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-300">
                🚨 Importante
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-200">
                Antes de registrarte necesitás tu <span className="font-black text-yellow-300">SteamID64</span> y tu <span className="font-black text-sky-300">PlayerId</span>. Si cargás mal estos datos, tu perfil puede quedar en <span className="font-black text-red-300">Disputa</span>.
              </p>
              <Link
                href="/guia#registro"
                className="mt-4 inline-flex rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
              >
                📖 Ver guía para obtener SteamID64
              </Link>
            </div>
          </div>

          <form onSubmit={registrarse} className="mt-7 space-y-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Nombre visible
                <HelperTooltip
                  title="Nombre visible"
                  description="Es el nombre que verá la comunidad en tu perfil, predicciones y participación pública."
                  example="Ej: Jugador APA"
                />
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej: Jugador APA"
                className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-sky-400/60"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Usuario
                <HelperTooltip
                  title="Usuario"
                  description="Debe ser único. Se usa para tu perfil público y enlaces dentro de APA."
                  example="Ej: jugador_apa"
                />
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(limpiarUsername(e.target.value))}
                placeholder="Ej: jugador_apa"
                className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-sky-400/60"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                PSO ID / Player ID solicitado
                <HelperTooltip
                  title="PlayerId"
                  description="Es el identificador oficial que APA usa para vincular tus estadísticas, historial, rankings y premios."
                  example="Copialo exactamente como aparece en PSO"
                  guideHref="/guia#registro"
                />
              </label>
              <input
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="Ej: tu PlayerId oficial"
                className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-sky-400/60"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                SteamID64
                <HelperTooltip
                  title="SteamID64"
                  description="Ingresá solo el número de Steam que aparece en Detalles de la cuenta. APA lo usa para verificar identidad y consultar horas de Pro Soccer Online."
                  example="76561199109076112"
                  wrongExamples={[
                    "https://steamcommunity.com/id/usuario/",
                    "https://steamcommunity.com/profiles/7656119.../",
                    "Nombre de usuario de Steam"
                  ]}
                  guideHref="/guia#registro"
                  guideLabel="Cómo obtenerlo"
                />
              </label>
              <input
                value={steamId}
                onChange={(e) => setSteamId(limpiarSteamId(e.target.value))}
                placeholder="Ej: 76561199109076112"
                className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-sky-400/60"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Email
                <HelperTooltip
                  title="Email"
                  description="Usá un correo real. Te va a servir para iniciar sesión y recuperar tu cuenta."
                  example="tu@email.com"
                />
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
              <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Contraseña
                <HelperTooltip
                  title="Contraseña"
                  description="Debe tener al menos 6 caracteres. No uses una contraseña que compartas con otras cuentas importantes."
                />
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
