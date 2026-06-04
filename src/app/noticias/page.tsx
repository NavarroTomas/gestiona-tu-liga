"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Noticia = {
  id: string;
  titulo: string;
  descripcion: string;
  temporada: string | null;
  categoria: string | null;
  imagen_url: string | null;
  autor: string | null;
  publicada: boolean;
  destacada: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

function fechaCorta(value?: string | null) {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState("Todas");

  useEffect(() => {
    cargarNoticias();
  }, []);

  async function cargarNoticias() {
    setLoading(true);

    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .eq("publicada", true)
      .order("destacada", { ascending: false })
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.log(error);
      return;
    }

    setNoticias((data || []) as Noticia[]);
  }

  const categorias = useMemo(() => {
    return ["Todas", ...Array.from(new Set(noticias.map((n) => n.categoria || "General")))];
  }, [noticias]);

  const filtradas = useMemo(() => {
    if (categoria === "Todas") return noticias;
    return noticias.filter((n) => (n.categoria || "General") === categoria);
  }, [noticias, categoria]);

  const destacada = filtradas.find((n) => n.destacada) || filtradas[0];
  const resto = filtradas.filter((n) => n.id !== destacada?.id);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020714] p-5 shadow-[0_0_55px_rgba(0,120,255,.18)] sm:rounded-[38px] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/25" />

          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-400 sm:text-xs sm:tracking-[0.45em]">
              Prensa APA
            </p>

            <h1 className="mt-4 text-[clamp(2.4rem,9vw,5rem)] font-black uppercase italic leading-none">
              Noticias
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base md:text-lg">
              Comunicados, mercado, competencia, clubes y novedades oficiales de APA PSO Argentina.
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 sm:rounded-[34px] md:p-6">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-sky-300">
            Categorías
          </p>

          <div className="flex flex-wrap gap-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase transition ${
                  categoria === cat
                    ? "border-sky-300 bg-sky-400 text-black"
                    : "border-white/10 bg-black/35 text-zinc-400 hover:border-sky-400/40 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-10 text-center font-black uppercase tracking-[0.25em] text-sky-300">
            Cargando noticias...
          </section>
        ) : filtradas.length === 0 ? (
          <section className="rounded-[34px] border border-white/10 bg-[#020714] p-10 text-center text-zinc-500">
            Todavía no hay noticias publicadas.
          </section>
        ) : (
          <>
            {destacada && (
              <Link
                href={`/noticias/${destacada.id}`}
                className="group relative block overflow-hidden rounded-[34px] border border-yellow-400/25 bg-[#020714] p-5 shadow-[0_0_45px_rgba(250,204,21,.12)] transition hover:border-yellow-300/50 md:p-8"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.14),transparent_42%)]" />

                <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase text-yellow-300">
                        Destacada
                      </span>
                      <span className="rounded-xl border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase text-sky-300">
                        {destacada.categoria || "General"}
                      </span>
                    </div>

                    <h2 className="mt-5 break-words text-[clamp(2rem,7vw,4rem)] font-black uppercase leading-none group-hover:text-yellow-300">
                      {destacada.titulo}
                    </h2>

                    <p className="mt-5 line-clamp-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
                      {destacada.descripcion}
                    </p>

                    <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                      {destacada.temporada || "APA"} · {destacada.autor || "Prensa APA"} · {fechaCorta(destacada.created_at || destacada.updated_at)}
                    </p>
                  </div>

                  <div className="min-h-[220px] overflow-hidden rounded-[28px] border border-white/10 bg-black/35">
                    {destacada.imagen_url ? (
                      <img
                        src={destacada.imagen_url}
                        alt={destacada.titulo}
                        className="h-full min-h-[220px] w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full min-h-[220px] items-center justify-center bg-gradient-to-br from-yellow-400/15 to-sky-500/10 text-6xl">
                        📰
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )}

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {resto.map((noticia) => (
                <Link
                  key={noticia.id}
                  href={`/noticias/${noticia.id}`}
                  className="group overflow-hidden rounded-[30px] border border-sky-500/20 bg-[#020714] shadow-[0_0_30px_rgba(0,120,255,.08)] transition hover:-translate-y-1 hover:border-sky-400/45"
                >
                  <div className="h-44 overflow-hidden border-b border-white/10 bg-black/35">
                    {noticia.imagen_url ? (
                      <img
                        src={noticia.imagen_url}
                        alt={noticia.titulo}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-500/10 to-blue-950/20 text-5xl">
                        📰
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-xl border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase text-sky-300">
                        {noticia.categoria || "General"}
                      </span>
                      <span className="rounded-xl border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-black uppercase text-zinc-500">
                        {noticia.temporada || "APA"}
                      </span>
                    </div>

                    <h3 className="mt-4 break-words text-2xl font-black uppercase text-white group-hover:text-sky-300">
                      {noticia.titulo}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">
                      {noticia.descripcion}
                    </p>

                    <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-600">
                      {noticia.autor || "Prensa APA"} · {fechaCorta(noticia.created_at || noticia.updated_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
