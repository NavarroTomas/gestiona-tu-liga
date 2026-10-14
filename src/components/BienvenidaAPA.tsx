"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const INTRO_CLOSED_EVENT = "apa:intro-closed";
const INTRO_STORAGE_KEY = "apa_intro_vista";

export default function BienvenidaAPA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const cancelarTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const programarApertura = useCallback(() => {
    cancelarTimer();

    const yaVista = localStorage.getItem("apa_bienvenida_vista");

    if (yaVista) return;

    timerRef.current = window.setTimeout(() => {
      setVisible(true);
      timerRef.current = null;
    }, 700);
  }, [cancelarTimer]);

  useEffect(() => {
    function manejarIntroCerrada() {
      programarApertura();
    }

    window.addEventListener(INTRO_CLOSED_EVENT, manejarIntroCerrada);

    /*
      En el inicio, la bienvenida espera obligatoriamente a que termine la intro.
      Si una persona entra directamente a otra ruta, se conserva el comportamiento normal.
    */
    if (pathname !== "/") {
      programarApertura();
    } else {
      cancelarTimer();

      const introYaVista = localStorage.getItem(INTRO_STORAGE_KEY);
      if (introYaVista) {
        programarApertura();
      }
    }

    return () => {
      window.removeEventListener(INTRO_CLOSED_EVENT, manejarIntroCerrada);
      cancelarTimer();
    };
  }, [pathname, programarApertura, cancelarTimer]);

  function cerrar() {
    localStorage.setItem("apa_bienvenida_vista", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-[860px] overflow-hidden rounded-[38px] border border-sky-400/30 bg-[#020714] p-6 text-white shadow-[0_0_70px_rgba(0,140,255,.35)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
        <div className="absolute -right-10 -bottom-16 text-[180px] opacity-10">
          ⚽
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-sky-400">
                Liga PSO ARGENTINA
              </p>

              <h2 className="mt-4 text-4xl font-black uppercase italic leading-none md:text-6xl">
                <span className="block bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
                  ¡Bienvenido!
                </span>

                <span className="block text-sky-400 drop-shadow-[0_0_18px_rgba(56,189,248,.65)]">
                  ¿Es tu primera vez?
                </span>
              </h2>

              <p className="mt-5 max-w-2xl leading-relaxed text-zinc-400">
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

          <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
              <p className="text-2xl">📊</p>
              <p className="mt-2 text-sm font-black uppercase text-white">Divisiones</p>
              <p className="mt-1 text-xs text-zinc-500">Mirá la tabla.</p>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
              <p className="text-2xl">👥</p>
              <p className="mt-2 text-sm font-black uppercase text-white">Clubes</p>
              <p className="mt-1 text-xs text-zinc-500">Buscá tu equipo.</p>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
              <p className="text-2xl">🧍</p>
              <p className="mt-2 text-sm font-black uppercase text-white">Jugadores</p>
              <p className="mt-1 text-xs text-zinc-500">Entrá a tu perfil.</p>
            </div>

            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-400/10 p-4">
              <p className="text-2xl">🎯</p>
              <p className="mt-2 text-sm font-black uppercase text-white">Predicciones</p>
              <p className="mt-1 text-xs text-zinc-500">Sumá puntos.</p>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-black/35 p-4">
              <p className="text-2xl">⭐</p>
              <p className="mt-2 text-sm font-black uppercase text-white">Dream Team</p>
              <p className="mt-1 text-xs text-zinc-500">Votá el 8 ideal.</p>
            </div>
          </div>

          <div className="mt-7 rounded-3xl border border-yellow-400/25 bg-yellow-400/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
              Consejo Liga
            </p>

            <p className="mt-3 leading-relaxed text-zinc-200">
              Tu perfil de jugador se encuentra usando tu PlayerId. Si todavía
              no aparecés, puede ser que aún no se hayan cargado tus estadísticas.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              href="/guia"
              onClick={cerrar}
              className="rounded-3xl bg-gradient-to-r from-sky-400 to-blue-700 px-6 py-5 text-center font-black uppercase tracking-[0.18em] text-black shadow-[0_0_30px_rgba(56,189,248,.35)] transition hover:scale-[1.01]"
            >
              📖 Ver Guía
            </Link>

            <button
              type="button"
              onClick={cerrar}
              className="rounded-3xl border border-white/10 bg-black/35 px-6 py-5 text-center font-black uppercase tracking-[0.18em] text-white transition hover:border-sky-400/50 hover:bg-sky-400/10"
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
