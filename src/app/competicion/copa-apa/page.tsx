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

type Club = {
  nombre: string;
  logo_url?: string | null;
};

const TEMPORADA_UNICA = "Temporada 4";

function normalizar(texto?: string | null) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function obtenerGanador(p?: PartidoCopa): string | null {
  if (!p || !p.resultado || !p.resultado.includes("-")) return null;
  const [gl, gv] = p.resultado.split("-").map((g) => Number(g.trim()));
  if (Number.isNaN(gl) || Number.isNaN(gv)) return null;
  if (gl > gv) return p.local;
  if (gv > gl) return p.visitante;
  return null;
}

export default function CopaApaPage() {
  const [activa, setActiva] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [partidos, setPartidos] = useState<PartidoCopa[]>([]);
  const [clubesMap, setClubesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function cargarCopa() {
      setLoading(true);

      const [configRes, partidosRes, clubesRes] = await Promise.all([
        supabase
          .from("configuracion_copas")
          .select("copa_apa_activa")
          .eq("temporada", TEMPORADA_UNICA)
          .maybeSingle(),

        supabase
          .from("partidos")
          .select("*")
          .eq("temporada", TEMPORADA_UNICA)
          .eq("competicion", "copa_apa")
          .order("id", { ascending: true }),

        supabase.from("clubes_info").select("nombre, logo_url"),
      ]);

      const estaActiva = configRes.data?.copa_apa_activa ?? false;
      setActiva(estaActiva);

      if (estaActiva) {
        setPartidos((partidosRes.data || []) as PartidoCopa[]);

        const mapaEscudos: Record<string, string> = {};
        (clubesRes.data || []).forEach((c: Club) => {
          if (c.logo_url) {
            mapaEscudos[normalizar(c.nombre)] = c.logo_url;
          }
        });
        setClubesMap(mapaEscudos);
      } else {
        setPartidos([]);
      }

      setLoading(false);
    }

    cargarCopa();
  }, []);

  // Filtrado de fases
  const cuartos = partidos.filter((p) => {
    const f = (p.fase || p.ronda || "").toLowerCase();
    return f.includes("cuartos");
  });

  const semifinales = partidos.filter((p) => {
    const f = (p.fase || p.ronda || "").toLowerCase();
    return f.includes("semifinal") || f.includes("semi");
  });

  const final = partidos.filter((p) => {
    const f = (p.fase || p.ronda || "").toLowerCase();
    return f.includes("final") && !f.includes("cuartos") && !f.includes("semi") && !f.includes("tercer");
  });

  const tercerPuesto = partidos.find((p) => {
    const f = (p.fase || p.ronda || "").toLowerCase();
    return f.includes("tercer") || f.includes("3") || f.includes("3er");
  });

  const cuartosIzquierda = cuartos.slice(0, 2);
  const cuartosDerecha = cuartos.slice(2, 4);

  const semiIzquierda = semifinales[0];
  const semiDerecha = semifinales[1];
  const partidoFinal = final[0];

  const campeon = obtenerGanador(partidoFinal);
  const logoCampeon = campeon ? clubesMap[normalizar(campeon)] : null;

  const renderPartidoBracket = (p?: PartidoCopa, esFinal = false) => {
    if (!p) {
      return (
        <div
          className={`flex items-center justify-center rounded-2xl border border-dashed border-sky-500/20 bg-black/30 p-4 text-center ${
            esFinal ? "h-32" : "h-24"
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            Por definir
          </span>
        </div>
      );
    }

    const logoLocal = clubesMap[normalizar(p.local)];
    const logoVisitante = clubesMap[normalizar(p.visitante)];

    return (
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-xl ${
          esFinal
            ? "border-sky-400 bg-gradient-to-b from-[#0a274c] via-[#041328] to-[#020714] p-4 ring-2 ring-sky-400/30"
            : "border-sky-500/30 bg-gradient-to-b from-[#06152c] via-[#030c1a] to-[#020714] p-3 hover:border-sky-400/60"
        }`}
      >
        {p.hora && (
          <div className="mb-2 text-center">
            <span className="rounded-full bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 text-[9px] font-black uppercase text-sky-300">
              {p.dia || ""} {p.hora}
            </span>
          </div>
        )}

        {/* Local */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/50 p-1">
              {logoLocal ? (
                <img src={logoLocal} alt={p.local} className="h-full w-full object-contain" />
              ) : (
                <span className="text-[9px] font-black text-sky-400">
                  {p.local.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-[11px] font-black uppercase leading-tight text-white break-words">
              {p.local}
            </span>
          </div>
          <span className="text-xs font-black text-sky-300 shrink-0 ml-1">
            {p.resultado ? p.resultado.split("-")[0] : "-"}
          </span>
        </div>

        {/* Visitante */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/50 p-1">
              {logoVisitante ? (
                <img src={logoVisitante} alt={p.visitante} className="h-full w-full object-contain" />
              ) : (
                <span className="text-[9px] font-black text-sky-400">
                  {p.visitante.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-[11px] font-black uppercase leading-tight text-white break-words">
              {p.visitante}
            </span>
          </div>
          <span className="text-xs font-black text-sky-300 shrink-0 ml-1">
            {p.resultado ? p.resultado.split("-")[1] : "-"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-[1600px] space-y-8">
        
        {/* Banner Fijado en Temporada 4 */}
        <div className="rounded-[40px] border border-sky-500/25 bg-[#020714] p-8 shadow-[0_0_50px_rgba(56,189,248,0.1)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Competición Oficial
              </p>
              <h1 className="mt-1 text-4xl font-black uppercase italic text-white md:text-6xl">
                Copa APA
              </h1>
            </div>
            <div className="inline-flex items-center rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-2.5 text-xs font-black uppercase text-sky-300">
              🏆 Temporada 4
            </div>
          </div>
        </div>

        {/* MÓDULO CAMPEÓN SI YA SE JUGÓ LA FINAL */}
        {campeon && (
          <div className="rounded-[34px] border-2 border-sky-400 bg-gradient-to-r from-sky-500/20 via-sky-400/10 to-sky-500/20 p-6 md:p-8 text-center shadow-[0_0_50px_rgba(56,189,248,0.3)] animate-fade-in">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-sky-300">
              👑 Campeón Copa APA
            </span>
            <div className="mt-4 flex flex-col items-center justify-center gap-3 md:flex-row">
              {logoCampeon && (
                <img src={logoCampeon} alt={campeon} className="h-16 w-16 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
              )}
              <h2 className="text-3xl font-black uppercase italic text-sky-300 md:text-5xl drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">
                {campeon}
              </h2>
            </div>
          </div>
        )}

        {/* Estado Mantenimiento / Carga */}
        {loading ? (
          <div className="rounded-[34px] border border-sky-500/20 bg-[#020714]/80 p-12 text-center">
            <p className="text-sm font-black uppercase tracking-widest text-sky-400 animate-pulse">
              Cargando Cuadro de Copa APA...
            </p>
          </div>
        ) : !activa ? (
          <div className="rounded-[34px] border border-sky-500/25 bg-black/40 p-12 text-center shadow-2xl max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black uppercase italic text-sky-300">
              Copa APA en Mantenimiento
            </h2>
            <p className="text-zinc-300 text-sm">
              Esta competición aún no se encuentra activa en la Temporada 4.
            </p>
          </div>
        ) : (
          /* CUADRO / BRACKET ESTILO TORNEO */
          <div className="rounded-[34px] border border-sky-500/20 bg-[#020714]/90 p-6 md:p-8 shadow-2xl overflow-x-auto">
            <div className="min-w-[1100px] grid grid-cols-5 items-center gap-4 md:gap-6">
              
              {/* LADO IZQUIERDO: CUARTOS */}
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-xs font-black uppercase text-sky-400 tracking-wider">Cuartos</span>
                </div>
                <div className="space-y-6">
                  {cuartosIzquierda[0] ? renderPartidoBracket(cuartosIzquierda[0]) : renderPartidoBracket()}
                  {cuartosIzquierda[1] ? renderPartidoBracket(cuartosIzquierda[1]) : renderPartidoBracket()}
                </div>
              </div>

              {/* LADO IZQUIERDO: SEMIFINAL */}
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-xs font-black uppercase text-sky-400 tracking-wider">Semifinal</span>
                </div>
                <div>{renderPartidoBracket(semiIzquierda)}</div>
              </div>

              {/* CENTRO: GRAN FINAL Y TERCER PUESTO */}
              <div className="space-y-6 px-1">
                <div>
                  <div className="text-center mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-sky-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
                      🏆 Gran Final
                    </span>
                  </div>
                  {renderPartidoBracket(partidoFinal, true)}
                </div>

                {/* TERCER Y CUARTO PUESTO */}
                <div className="pt-2 border-t border-white/10">
                  <div className="text-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      🥉 3.º y 4.º Puesto
                    </span>
                  </div>
                  {renderPartidoBracket(tercerPuesto)}
                </div>
              </div>

              {/* LADO DERECHO: SEMIFINAL */}
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-xs font-black uppercase text-sky-400 tracking-wider">Semifinal</span>
                </div>
                <div>{renderPartidoBracket(semiDerecha)}</div>
              </div>

              {/* LADO DERECHO: CUARTOS */}
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-xs font-black uppercase text-sky-400 tracking-wider">Cuartos</span>
                </div>
                <div className="space-y-6">
                  {cuartosDerecha[0] ? renderPartidoBracket(cuartosDerecha[0]) : renderPartidoBracket()}
                  {cuartosDerecha[1] ? renderPartidoBracket(cuartosDerecha[1]) : renderPartidoBracket()}
                </div>
              </div>

            </div>
          </div>
        )}
      </section>
    </main>
  );
}