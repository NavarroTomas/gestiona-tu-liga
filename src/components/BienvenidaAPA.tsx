"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BienvenidaAPA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const yaVista = localStorage.getItem("apa_bienvenida_vista");

    if (!yaVista) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, []);

  function cerrar() {
    localStorage.setItem("apa_bienvenida_vista", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-[860px] overflow-hidden rounded-[38px] border border-sky-400/30 bg-[#020714] p-6 md:p-8 text-white shadow-[0_0_70px_rgba(0,140,255,.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
        <div className="absolute -right-10 -bottom-16 text-[180px] opacity-10">
          ⚽
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sky-400 text-xs uppercase tracking-[0.4em] font-black">
                APA PSO ARGENTINA
              </p>

              <h2 className="mt-4 text-4xl md:text-6xl font-black uppercase italic leading-none">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  ¡Bienvenido!
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                  ¿Es tu primera vez?
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-zinc-400 leading-relaxed">
                Te recomendamos empezar por la guía para aprender a usar la web,
                encontrar tu club, ver tu perfil, hacer predicciones y armar tu
                Dream Team.
              </p>
            </div>

            <button
              type="button"
              onClick={cerrar}
              className="self-start rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
              <p className="text-2xl">📊</p>
              <p className="mt-2 text-sm font-black uppercase text-white">
                Divisiones
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Mirá la tabla.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
              <p className="text-2xl">👥</p>
              <p className="mt-2 text-sm font-black uppercase text-white">
                Clubes
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Buscá tu equipo.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
              <p className="text-2xl">🧍</p>
              <p className="mt-2 text-sm font-black uppercase text-white">
                Jugadores
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Entrá a tu perfil.
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-400/10 p-4">
              <p className="text-2xl">🎯</p>
              <p className="mt-2 text-sm font-black uppercase text-white">
                Predicciones
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Sumá puntos.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
              <p className="text-2xl">⭐</p>
              <p className="mt-2 text-sm font-black uppercase text-white">
                Dream Team
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Votá el 8 ideal.
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-3xl border border-yellow-400/25 bg-yellow-400/10 p-5">
            <p className="text-yellow-300 text-xs uppercase tracking-[0.25em] font-black">
              Consejo APA
            </p>

            <p className="mt-3 text-zinc-200 leading-relaxed">
              Tu perfil de jugador se encuentra usando tu PlayerId. Si todavía
              no aparecés, puede ser que aún no se hayan cargado tus estadísticas.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/guia"
              onClick={cerrar}
              className="rounded-3xl bg-gradient-to-r from-sky-400 to-blue-700 px-6 py-5 text-center text-black font-black uppercase tracking-[0.18em] shadow-[0_0_30px_rgba(56,189,248,.35)] transition hover:scale-[1.01]"
            >
              📖 Ver Guía
            </Link>

            <button
              type="button"
              onClick={cerrar}
              className="rounded-3xl border border-white/10 bg-black/35 px-6 py-5 text-center text-white font-black uppercase tracking-[0.18em] transition hover:border-sky-400/50 hover:bg-sky-400/10"
            >
              🚀 Explorar la Web
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("apa_bienvenida_vista");
              setVisible(false);
            }}
            className="mt-5 text-xs text-zinc-600 hover:text-zinc-400"
          >
            Cerrar sin guardar
          </button>
        </div>
      </div>
    </div>
  );
}
