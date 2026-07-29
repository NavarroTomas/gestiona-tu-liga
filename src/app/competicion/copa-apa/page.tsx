"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CopaApaPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [activa, setActiva] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verificarEstado() {
      setLoading(true);

      // Leemos si la Copa APA está activa para la temporada elegida
      const { data, error } = await supabase
        .from("configuracion_copas")
        .select("copa_apa_activa")
        .eq("temporada", temporada)
        .maybeSingle();

      if (error) {
        console.error("Error al consultar el estado de la copa:", error);
      }

      // Si existe el registro y esta activa, setea true. Si no, false.
      setActiva(data?.copa_apa_activa ?? false);
      setLoading(false);
    }

    verificarEstado();
  }, [temporada]);

  // 1. Mientras carga la consulta
  if (loading) {
    return (
      <main className="min-h-screen bg-[#020714] flex items-center justify-center text-white">
        <p className="text-sm font-black uppercase tracking-widest text-sky-400">
          Cargando Copa APA...
        </p>
      </main>
    );
  }

  // 2. Si la copa está EN MANTENIMIENTO (Desactivada desde el admin)
  if (!activa) {
    return (
      <main className="min-h-screen bg-[#020714] px-4 py-16 text-white flex flex-col items-center justify-center">
        <div className="max-w-xl w-full rounded-[34px] border border-yellow-500/25 bg-black/40 p-8 text-center shadow-[0_0_50px_rgba(250,204,21,.10)]">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
            {temporada}
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase italic text-yellow-300">
            Copa APA
          </h1>
          <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
          <p className="text-zinc-300 text-sm leading-relaxed">
            Esta competición se encuentra actualmente en <strong className="text-yellow-300">mantenimiento</strong> o aún no ha comenzado para la temporada seleccionada.
          </p>
        </div>
      </main>
    );
  }

  // 3. Si la copa ESTÁ ACTIVA (Aquí va el contenido normal de tu copa)
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-[1400px] space-y-8">
        <div className="rounded-[40px] border border-sky-500/25 bg-[#020714] p-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
            Competición
          </p>
          <h1 className="mt-2 text-5xl font-black uppercase italic text-white">
            Copa APA
          </h1>
          <p className="mt-4 text-zinc-400 text-sm">
            ¡La copa está activa! Aquí podés mostrar los cruces, tablas y fixtures de la Copa APA.
          </p>
        </div>
      </section>
    </main>
  );
}