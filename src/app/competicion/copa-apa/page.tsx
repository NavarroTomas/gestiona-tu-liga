"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PartidoCopa = {
  id: string;
  partido_id?: string | null;
  local: string;
  visitante: string;
  resultado?: string | null;
  fecha?: string | number | null;
  temporada: string;
  division: string;
  dia?: string | null;
  hora?: string | null;
  competicion?: string | null;
  grupo?: string | null;
  fase?: string | null;
  ronda?: string | null;
};

const TEMPORADAS = [
  "Temporada 1",
  "Temporada 2",
  "Temporada 3",
  "Temporada 4",
  "Temporada 5",
  "Temporada 6",
];

export default function CopaApaPage() {
  const [temporada, setTemporada] = useState("Temporada 4");
  const [activa, setActiva] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [partidos, setPartidos] = useState<PartidoCopa[]>([]);

  useEffect(() => {
    async function cargarCopa() {
      setLoading(true);

      // 1. Verificamos si la Copa APA está activa
      const { data: configData, error: configError } = await supabase
        .from("configuracion_copas")
        .select("copa_apa_activa")
        .eq("temporada", temporada)
        .maybeSingle();

      if (configError) {
        console.error("Error al consultar el estado de la copa:", configError);
      }

      const estaActiva = configData?.copa_apa_activa ?? false;
      setActiva(estaActiva);

      if (estaActiva) {
        // 2. Traemos todos los partidos pertenecientes a la Copa APA
        const { data: partidosData, error: partidosError } = await supabase
          .from("partidos")
          .select("*")
          .eq("temporada", temporada)
          .eq("competicion", "copa_apa")
          .order("id", { ascending: true });

        if (partidosError) {
          console.error("Error cargando partidos de Copa APA:", partidosError);
        } else {
          setPartidos((partidosData || []) as PartidoCopa[]);
        }
      }

      setLoading(false);
    }

    cargarCopa();
  }, [temporada]);

  // Separar los partidos por fase
  const cuartos = partidos.filter(
    (p) =>
      p.fase?.toLowerCase() === "cuartos" ||
      p.ronda?.toLowerCase().includes("cuartos")
  );
  const semifinales = partidos.filter(
    (p) =>
      p.fase?.toLowerCase() === "semifinal" ||
      p.ronda?.toLowerCase().includes("semifinal")
  );
  const final = partidos.filter(
    (p) =>
      p.fase?.toLowerCase() === "final" ||
      p.ronda?.toLowerCase().includes("final")
  );

  // 1. Cargando
  if (loading) {
    return (
      <main className="min-h-screen bg-[#020714] flex items-center justify-center text-white">
        <p className="text-sm font-black uppercase tracking-widest text-sky-400 animate-pulse">
          Cargando Copa APA...
        </p>
      </main>
    );
  }

  // 2. En mantenimiento
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
            Esta competición se encuentra actualmente en{" "}
            <strong className="text-yellow-300">mantenimiento</strong> o aún no
            ha comenzado para la temporada seleccionada.
          </p>

          <div className="mt-8 flex justify-center gap-2 flex-wrap">
            {TEMPORADAS.map((t) => (
              <button
                key={t}
                onClick={() => setTemporada(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase border ${
                  temporada === t
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-white/10 bg-white/5 text-zinc-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // 3. Render de Tarjeta de Partido
  const renderTarjetaPartido = (p: PartidoCopa) => {
    let gl: number | null = null;
    let gv: number | null = null;

    if (p.resultado && p.resultado.includes("-")) {
      const [l, v] = p.resultado.split("-");
      gl = Number(l?.trim());
      gv = Number(v?.trim());
    }

    return (
      <article
        key={p.id}
        className="rounded-2xl border border-sky-500/20 bg-[#020714]/90 p-4 space-y-3 shadow-lg"
      >
        <div className="flex items-center justify-between text-[10px] font-black uppercase text-sky-400">
          <span>{p.ronda || "Copa APA"}</span>
          <span>
            {p.dia || ""} {p.hora ? `· ${p.hora}` : ""}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-black uppercase text-white truncate">
              {p.local}
            </p>
          </div>

          <div className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 min-w-[70px] text-center">
            <span className="text-sm font-black text-sky-300">
              {p.resultado || "VS"}
            </span>
          </div>

          <div className="text-left">
            <p className="text-xs font-black uppercase text-white truncate">
              {p.visitante}
            </p>
          </div>
        </div>
      </article>
    );
  };

  // 4. Vista pública activa
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-[1400px] space-y-8">
        {/* ENCABEZADO DE LA COPA */}
        <div className="rounded-[40px] border border-sky-500/25 bg-[#020714] p-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Competición Oficial
              </p>
              <h1 className="mt-2 text-5xl font-black uppercase italic text-white md:text-6xl">
                Copa APA
              </h1>
              <p className="mt-2 text-zinc-400 text-sm">
                Fase de eliminación directa entre los clasificados de la fase de grupos.
              </p>
            </div>

            {/* Selector de Temporadas */}
            <div className="flex flex-wrap gap-2">
              {TEMPORADAS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTemporada(t)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black uppercase border transition ${
                    temporada === t
                      ? "border-sky-400 bg-sky-400 text-black shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                      : "border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENIDO DE LOS PARTIDOS Y CUARTOS */}
        {partidos.length === 0 ? (
          <div className="rounded-[34px] border border-white/10 bg-[#020714]/80 p-12 text-center">
            <p className="text-zinc-400 text-sm font-black uppercase tracking-wider">
              Aún no se han publicado partidos para la Copa APA en esta temporada.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* CUARTOS DE FINAL */}
            {cuartos.length > 0 && (
              <section className="space-y-4">
                <div className="border-b border-sky-500/20 pb-3">
                  <h2 className="text-xl font-black uppercase tracking-wider text-sky-300">
                    Cuartos de Final
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cuartos.map(renderTarjetaPartido)}
                </div>
              </section>
            )}

            {/* SEMIFINALES */}
            {semifinales.length > 0 && (
              <section className="space-y-4">
                <div className="border-b border-sky-500/20 pb-3">
                  <h2 className="text-xl font-black uppercase tracking-wider text-sky-300">
                    Semifinales
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {semifinales.map(renderTarjetaPartido)}
                </div>
              </section>
            )}

            {/* FINAL */}
            {final.length > 0 && (
              <section className="space-y-4">
                <div className="border-b border-yellow-500/30 pb-3">
                  <h2 className="text-xl font-black uppercase tracking-wider text-yellow-300">
                    Grand Final
                  </h2>
                </div>
                <div className="max-w-xl mx-auto">
                  {final.map(renderTarjetaPartido)}
                </div>
              </section>
            )}
          </div>
        )}
      </section>
    </main>
  );
}