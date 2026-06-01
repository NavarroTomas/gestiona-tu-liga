"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginConEmail() {
    setMensaje("");

    if (!email.trim()) {
      setMensaje("Escribí tu email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/debug-user`
            : undefined,
      },
    });

    setLoading(false);

    if (error) {
  console.log("ERROR LOGIN:", error);
  setMensaje(error.message || "Error enviando el link de acceso.");
  return;
}

    setMensaje("Listo. Revisá tu email y abrí el link de acceso.");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-10 text-white">
      <section className="mx-auto max-w-[620px]">
        <div className="relative overflow-hidden rounded-[38px] border border-sky-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(0,120,255,.22)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/30" />

          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.45em] text-sky-400">
              APA PSO Argentina
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-6xl">
              Login Admin
            </h1>

            <p className="mt-5 text-zinc-400">
              Ingresá tu email. Supabase te va a mandar un link mágico para
              iniciar sesión.
            </p>

            <div className="mt-8 space-y-4">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="tuemail@gmail.com"
                className="w-full rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-sky-400/50"
              />

              <button
                onClick={loginConEmail}
                disabled={loading}
                className="w-full rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar link de acceso"}
              </button>

              {mensaje && (
                <p className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm font-black text-sky-300">
                  {mensaje}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
