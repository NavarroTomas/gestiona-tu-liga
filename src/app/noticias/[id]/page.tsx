"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

function fechaLarga(value?: string | null) {
  if (!value) return "Sin fecha";
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function NoticiaDetallePage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarNoticia();
  }, [id]);

  async function cargarNoticia() {
    setLoading(true);
    setMensaje("");

    const { data, error } = await supabase
      .from("noticias")
      .select("id, titulo, descripcion, temporada, categoria, imagen_url, autor, publicada, destacada, created_at, updated_at")
      .eq("id", id)
      .eq("publicada", true)
      .maybeSingle();

    setLoading(false);

    if (error) {
      console.log(error);
      setMensaje("No pude cargar la noticia.");
      return;
    }

    if (!data) {
      setMensaje("La noticia no existe o no está publicada.");
      return;
    }

    setNoticia(data as Noticia);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sky-300 font-black uppercase tracking-[0.25em]">
          Cargando noticia...
        </p>
      </main>
    );
  }

  if (mensaje || !noticia) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <section className="max-w-xl rounded-[34px] border border-red-400/20 bg-red-400/10 p-8 text-center">
          <h1 className="text-3xl font-black uppercase text-red-300">
            Noticia no encontrada
          </h1>
          <p className="mt-4 text-zinc-300">{mensaje || "No existe esta noticia."}</p>
          <Link
            href="/noticias"
            className="mt-6 inline-block rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-3 text-sm font-black uppercase text-black"
          >
            Volver a noticias
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <article className="mx-auto max-w-[1100px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <Link
          href="/noticias"
          className="inline-flex rounded-2xl border border-sky-400/25 bg-sky-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-sky-300 transition hover:bg-sky-400 hover:text-black"
        >
          ← Volver a noticias
        </Link>

        <section className="relative overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020714] p-5 shadow-[0_0_55px_rgba(0,120,255,.18)] sm:rounded-[38px] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/84 to-black/25" />

          <div className="relative z-10">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-xl border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase text-sky-300">
                {noticia.categoria || "General"}
              </span>
              {noticia.destacada && (
                <span className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase text-yellow-300">
                  Destacada
                </span>
              )}
            </div>

            <h1 className="mt-5 break-words text-[clamp(2.2rem,8vw,5rem)] font-black uppercase italic leading-none">
              {noticia.titulo}
            </h1>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              {noticia.temporada || "APA"} · {noticia.autor || "Prensa APA"} · {fechaLarga(noticia.created_at || noticia.updated_at)}
            </p>
          </div>
        </section>

        {noticia.imagen_url && (
          <section className="overflow-hidden rounded-[34px] border border-white/10 bg-black/35">
            <img
              src={noticia.imagen_url}
              alt={noticia.titulo}
              className="max-h-[520px] w-full object-cover"
            />
          </section>
        )}

        <section className="rounded-[34px] border border-sky-500/20 bg-[#020714] p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            <p className="whitespace-pre-line text-lg leading-9 text-zinc-300">
              {noticia.descripcion}
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
