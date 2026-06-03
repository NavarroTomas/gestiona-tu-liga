"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PermissionGuard from "@/components/PermissionGuard";

type Titulo = {
  id: string;
  equipo: string;
  competicion: string;
  temporada: string;
  division?: string | null;
  descripcion?: string | null;
};

export default function AdminTitulosPage() {
  const temporadas = [
    "Temporada 1",
    "Temporada 2",
    "Temporada 3",
    "Temporada 4",
    "Temporada 5",
    "Temporada 6",
  ];

  const divisiones = ["Primera", "Segunda", "Tercera", "Cuarta"];

  const competiciones = [
    "Primera División",
    "Segunda División",
    "Tercera División",
    "Cuarta División",
    "Copa APA",
    "Supercopa APA",
    "Torneo de Liga APA",
  ];

  const [equipo, setEquipo] = useState("");
  const [competicion, setCompeticion] = useState("Primera División");
  const [temporada, setTemporada] = useState("Temporada 5");
  const [division, setDivision] = useState("Primera");
  const [descripcion, setDescripcion] = useState("");
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarTitulos();
  }, []);

  async function cargarTitulos() {
    const { data, error } = await supabase
      .from("titulos")
      .select("*")
      .order("temporada", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setTitulos(data || []);
  }

  async function guardarTitulo() {
    if (!equipo.trim() || !competicion.trim() || !temporada.trim()) {
      alert("Completá equipo, competición y temporada.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("titulos").insert({
      equipo: equipo.trim(),
      competicion,
      temporada,
      division,
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
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] px-4 py-10 text-white md:px-8">
        <section className="mx-auto max-w-[1400px] space-y-8">
          <section className="relative overflow-hidden rounded-[38px] border border-yellow-500/30 bg-[#020714] p-7 shadow-[0_0_55px_rgba(250,204,21,.14)] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_42%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/25" />

            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.45em] text-yellow-300">
                Admin APA PSO
              </p>

              <h1 className="mt-4 text-5xl font-black uppercase italic leading-none md:text-7xl">
                Palmarés
              </h1>

              <p className="mt-5 max-w-3xl text-zinc-300">
                Registrá campeones, copas y títulos oficiales para que aparezcan
                en los perfiles de club.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8 xl:grid-cols-[430px_1fr]">
            <div className="rounded-[34px] border border-yellow-500/25 bg-[#020714] p-6">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                Nuevo título
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Cargar campeón
              </h2>

              <div className="mt-6 space-y-4">
                <input
                  className="input"
                  value={equipo}
                  onChange={(e) => setEquipo(e.target.value)}
                  placeholder="Equipo campeón"
                />

                <select
                  className="input"
                  value={competicion}
                  onChange={(e) => setCompeticion(e.target.value)}
                >
                  {competiciones.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>

                <select
                  className="input"
                  value={temporada}
                  onChange={(e) => setTemporada(e.target.value)}
                >
                  {temporadas.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>

                <select
                  className="input"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                >
                  {divisiones.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>

                <textarea
                  className="input min-h-[110px]"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción opcional"
                />

                <button
                  onClick={guardarTitulo}
                  disabled={loading}
                  className="btn disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar título"}
                </button>
              </div>
            </div>

            <div className="rounded-[34px] border border-sky-500/25 bg-[#020714] p-6">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                    Historial
                  </p>

                  <h2 className="mt-2 text-3xl font-black uppercase">
                    Títulos cargados
                  </h2>
                </div>

                <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-xs font-black text-yellow-300">
                  {titulos.length} títulos
                </span>
              </div>

              <div className="space-y-3">
                {titulos.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                    Todavía no hay títulos cargados.
                  </p>
                ) : (
                  titulos.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/35 p-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-2xl font-black uppercase">
                          🏆 {t.equipo}
                        </p>

                        <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-zinc-500">
                          {t.competicion} · {t.temporada}
                          {t.division ? ` · ${t.division}` : ""}
                        </p>

                        {t.descripcion && (
                          <p className="mt-2 text-sm text-zinc-400">
                            {t.descripcion}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => borrarTitulo(t.id)}
                        className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                      >
                        Borrar
                      </button>
                    </div>
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
