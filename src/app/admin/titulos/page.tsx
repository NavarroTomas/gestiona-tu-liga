"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";

type CompeticionValue =
  | "liga"
  | "copa_clasificatoria"
  | "copa_argentina"
  | "copa_apa"
  | "copa_campeones"
  | "playoffs";

type Titulo = {
  id: string;
  equipo: string;
  competicion: string;
  temporada: string;
  division?: string | null;
  descripcion?: string | null;
};

const TEMPORADAS = ["Temporada 4"];

const COMPETICIONES: { value: CompeticionValue; label: string }[] = [
  { value: "liga", label: "Liga" },
  { value: "copa_clasificatoria", label: "Clasificación a Copas" },
  { value: "copa_argentina", label: "Copa Argentina" },
  { value: "copa_apa", label: "Copa APA" },
  { value: "copa_campeones", label: "Copa de Campeones" },
  { value: "playoffs", label: "Playoffs de Ascenso" },
];

const DIVISIONES = ["Primera", "Segunda"];
const GRUPOS = ["Grupo A", "Grupo B", "Grupo C", "Grupo D"];

function labelCompeticion(value: string) {
  return COMPETICIONES.find((c) => c.value === value)?.label || value;
}

export default function AdminTitulosPage() {
  const [equipo, setEquipo] = useState("");
  const [competicion, setCompeticion] = useState<CompeticionValue>("liga");
  const [temporada, setTemporada] = useState("Temporada 4");
  const [categoria, setCategoria] = useState("Primera");
  const [descripcion, setDescripcion] = useState("");
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarTitulos();
  }, []);

  const opcionesCategoria = useMemo(() => {
    if (competicion === "liga") return DIVISIONES;
    if (competicion === "copa_clasificatoria") return GRUPOS;
    return [];
  }, [competicion]);

  useEffect(() => {
    if (competicion === "liga") setCategoria("Primera");
    else if (competicion === "copa_clasificatoria") setCategoria("Grupo A");
    else setCategoria("");
  }, [competicion]);

  async function cargarTitulos() {
    const { data, error } = await supabase
      .from("titulos")
      .select("id, equipo, competicion, temporada, division, descripcion, created_at")
      .order("temporada", { ascending: false });

    if (error) {
      console.log(error);
      setMensaje("Error cargando títulos.");
      return;
    }

    setTitulos(data || []);
  }

  async function guardarTitulo() {
    if (!equipo.trim() || !competicion.trim() || !temporada.trim()) {
      alert("Completá club campeón, competición y temporada.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("titulos").insert({
      equipo: equipo.trim(),
      competicion,
      temporada,
      division: opcionesCategoria.length > 0 ? categoria : null,
      descripcion: descripcion.trim() || null,
    });

    setLoading(false);

    if (error) {
      console.log(error);
      alert("Error guardando título.");
      return;
    }

    setEquipo("");
    setDescripcion("");
    await cargarTitulos();
  }

  async function borrarTitulo(id: string) {
    const confirmar = confirm("¿Borrar este título?");
    if (!confirmar) return;

    const { error } = await supabase.from("titulos").delete().eq("id", id);

    if (error) {
      console.log(error);
      alert("Error borrando título.");
      return;
    }

    setTitulos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <PermissionGuard permission="titles.manage">
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#2a2205_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
        <section className="mx-auto max-w-[1500px] space-y-8 px-4 py-10 md:px-8">
          <section className="relative overflow-hidden rounded-[34px] border border-yellow-500/30 bg-[#020714] p-7 shadow-[0_0_50px_rgba(250,204,21,.12)] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_42%)]" />
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                Historia APA
              </p>
              <h1 className="mt-3 text-5xl font-black uppercase italic md:text-7xl">
                Palmarés
              </h1>
              <p className="mt-4 max-w-3xl text-zinc-400">
                Registrá campeones oficiales por competición. La categoría solo aparece cuando corresponde.
              </p>
            </div>
          </section>

          {mensaje && (
            <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-300">
              {mensaje}
            </section>
          )}

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
            <div className="rounded-[30px] border border-yellow-500/25 bg-[#020714] p-5">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">
                Nuevo título
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase">Cargar campeón</h2>

              <div className="mt-5 space-y-3">
                <input
                  className="input"
                  placeholder="Club campeón"
                  value={equipo}
                  onChange={(e) => setEquipo(e.target.value)}
                />

                <select className="input" value={competicion} onChange={(e) => setCompeticion(e.target.value as CompeticionValue)}>
                  {COMPETICIONES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>

                <select className="input" value={temporada} onChange={(e) => setTemporada(e.target.value)}>
                  {TEMPORADAS.map((t) => <option key={t}>{t}</option>)}
                </select>

                {opcionesCategoria.length > 0 && (
                  <select className="input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    {opcionesCategoria.map((opcion) => <option key={opcion}>{opcion}</option>)}
                  </select>
                )}

                <textarea
                  className="input min-h-[120px]"
                  placeholder="Descripción opcional"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />

                <button onClick={guardarTitulo} disabled={loading} className="btn">
                  {loading ? "Guardando..." : "Guardar título"}
                </button>
              </div>
            </div>

            <div className="rounded-[30px] border border-sky-500/25 bg-[#020714] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">
                    Historial
                  </p>
                  <h2 className="mt-2 text-2xl font-black uppercase">Títulos cargados</h2>
                </div>
                <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">
                  {titulos.length} títulos
                </span>
              </div>

              <div className="space-y-3">
                {titulos.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/35 p-4 text-zinc-500">
                    Todavía no hay títulos cargados.
                  </p>
                ) : (
                  titulos.map((titulo) => (
                    <article key={titulo.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-yellow-300">
                            {labelCompeticion(titulo.competicion)} {titulo.division ? `· ${titulo.division}` : ""} · {titulo.temporada}
                          </p>
                          <h3 className="mt-2 text-xl font-black uppercase">{titulo.equipo}</h3>
                          {titulo.descripcion && <p className="mt-1 text-sm text-zinc-500">{titulo.descripcion}</p>}
                        </div>

                        <button
                          onClick={() => borrarTitulo(titulo.id)}
                          className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-black uppercase text-red-300"
                        >
                          Borrar
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </section>
      </main>
    </PermissionGuard>
  );
}
