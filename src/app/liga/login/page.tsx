"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginConPassword() {
    setMensaje("");

    if (!email.trim()) {
      setMensaje("Escribí tu email.");
      return;
    }

    if (!password.trim()) {
      setMensaje("Escribí tu contraseña.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      console.log("ERROR LOGIN:", error);
      setMensaje("Email o contraseña incorrectos.");
      return;
    }

    router.push("/perfil");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-10 text-white">
      <section className="mx-auto max-w-[620px]">
        <div className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.22)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/30" />

          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
              Gestioná tu Liga
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-6xl">
              Iniciar sesión
            </h1>

            <p className="mt-5 text-zinc-400">
              Entrá con tu cuenta Liga para votar, hacer predicciones y administrar si tenés permisos.
            </p>

            <div className="mt-8 space-y-4">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="tuemail@gmail.com"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-sky-400/50"
              />

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Contraseña"
                onKeyDown={(e) => {
                  if (e.key === "Enter") loginConPassword();
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-sky-400/50"
              />

              <button
                onClick={loginConPassword}
                disabled={loading}
                className="w-full rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>

              {mensaje && (
                <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-black text-red-300">
                  {mensaje}
                </p>
              )}

              <p className="text-center text-sm text-zinc-500">
                ¿No tenés cuenta?{" "}
                <Link href="/registro" className="font-black text-sky-300 hover:text-white">
                  Registrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
