"use client";

import { useEffect, useState } from "react";
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

const temporadas = ["Temporada 4"];

const categorias = [
  "General",
  "Competición",
  "Mercado",
  "Clubes",
  "Jugadores",
  "Comunidad",
  "Comunicado",
];

export default function AdminNoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [temporada, setTemporada] = useState("Temporada 4");
  const [categoria, setCategoria] = useState("General");
  const [imagenUrl, setImagenUrl] = useState("");
  const [autor, setAutor] = useState("");
  const [publicada, setPublicada] = useState(true);
  const [destacada, setDestacada] = useState(false);
  const [notificarComunidad, setNotificarComunidad] = useState(true);

  useEffect(() => {
    cargarNoticias();
  }, []);

  async function cargarNoticias() {
    setLoading(true);
    setMensaje("");

    const { data, error } = await supabase
      .from("noticias")
      .select("id, titulo, descripcion, temporada, categoria, imagen_url, autor, publicada, destacada, created_at, updated_at")
      .order("updated_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.log(error);
      setMensaje("No pude cargar noticias: " + error.message);
      return;
    }

    setNoticias((data || []) as unknown as Noticia[]);
  }

  function limpiarFormulario() {
    setEditandoId(null);
    setTitulo("");
    setDescripcion("");
    setTemporada("Temporada 4");
    setCategoria("General");
    setImagenUrl("");
    setAutor("");
    setPublicada(true);
    setDestacada(false);
    setNotificarComunidad(true);
  }

  function editar(noticia: Noticia) {
    setEditandoId(noticia.id);
    setTitulo(noticia.titulo || "");
    setDescripcion(noticia.descripcion || "");
    setTemporada(noticia.temporada || "Temporada 4");
    setCategoria(noticia.categoria || "General");
    setImagenUrl(noticia.imagen_url || "");
    setAutor(noticia.autor || "");
    setPublicada(!!noticia.publicada);
    setDestacada(!!noticia.destacada);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }


  async function notificarNuevaNoticia(tituloNoticia: string) {
    const haceCincoMinutos = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: notificacionExistente, error: existenteError } = await supabase
      .from("notificaciones")
      .select("id")
      .eq("tipo", "news")
      .eq("titulo", "Nueva noticia APA")
      .eq("mensaje", tituloNoticia)
      .eq("href", "/")
      .gte("created_at", haceCincoMinutos)
      .limit(1);

    if (existenteError) {
      console.log(existenteError);
    }

    if (notificacionExistente && notificacionExistente.length > 0) {
      setMensaje("Noticia publicada. No se enviaron notificaciones duplicadas.");
      return;
    }

    const { data: usuarios, error: usuariosError } = await supabase
      .from("profiles")
      .select("id");

    if (usuariosError) {
      console.log(usuariosError);
      setMensaje("Noticia publicada, pero no pude notificar a la comunidad.");
      return;
    }

    const notificaciones = (usuarios || []).map((usuario: any) => ({
      user_id: usuario.id,
      tipo: "news",
      titulo: "Nueva noticia APA",
      mensaje: tituloNoticia,
      href: "/",
      leida: false,
    }));

    if (notificaciones.length === 0) return;

    const { error: notificacionError } = await supabase
      .from("notificaciones")
      .insert(notificaciones);

    if (notificacionError) {
      console.log(notificacionError);
      setMensaje("Noticia publicada, pero no pude crear las notificaciones.");
    }
  }

  async function guardarNoticia(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensaje("");

    const tituloLimpio = titulo.trim();
    const descripcionLimpia = descripcion.trim();

    if (!tituloLimpio) {
      setMensaje("El título es obligatorio.");
      return;
    }

    if (!descripcionLimpia) {
      setMensaje("La descripción es obligatoria.");
      return;
    }

    setGuardando(true);

    const payload = {
      titulo: tituloLimpio,
      descripcion: descripcionLimpia,
      temporada: temporada || null,
      categoria: categoria || "General",
      imagen_url: imagenUrl.trim() || null,
      autor: autor.trim() || null,
      publicada,
      destacada,
      updated_at: new Date().toISOString(),
    };

    const resultadoGuardado = editandoId
      ? await supabase.from("noticias").update(payload).eq("id", editandoId)
      : await supabase.from("noticias").insert([payload]).select("id").single();

    const { error } = resultadoGuardado;

    setGuardando(false);

    if (error) {
      console.log(error);
      setMensaje("Error guardando noticia: " + error.message);
      return;
    }

    if (!editandoId && publicada && notificarComunidad) {
      await notificarNuevaNoticia(tituloLimpio);
    }

    setMensaje(editandoId ? "Noticia actualizada." : "Noticia publicada.");
    limpiarFormulario();
    await cargarNoticias();
  }

  async function eliminarNoticia(noticia: Noticia) {
    const confirmar = window.confirm(`¿Eliminar la noticia "${noticia.titulo}"?`);
    if (!confirmar) return;

    const { error } = await supabase.from("noticias").delete().eq("id", noticia.id);

    if (error) {
      console.log(error);
      setMensaje("Error eliminando noticia: " + error.message);
      return;
    }

    setMensaje("Noticia eliminada.");
    await cargarNoticias();
  }

  async function togglePublicada(noticia: Noticia) {
    const { error } = await supabase
      .from("noticias")
      .update({
        publicada: !noticia.publicada,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noticia.id);

    if (error) {
      console.log(error);
      setMensaje("Error cambiando estado: " + error.message);
      return;
    }

    await cargarNoticias();
  }

  async function toggleDestacada(noticia: Noticia) {
    const { error } = await supabase
      .from("noticias")
      .update({
        destacada: !noticia.destacada,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noticia.id);

    if (error) {
      console.log(error);
      setMensaje("Error cambiando destacada: " + error.message);
      return;
    }

    await cargarNoticias();
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)] text-white">
      <section className="mx-auto max-w-[1500px] space-y-6 px-3 py-5 sm:px-4 md:space-y-8 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020714] p-5 shadow-[0_0_55px_rgba(0,120,255,.18)] sm:rounded-[38px] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.16),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/25" />

          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-400 sm:text-xs sm:tracking-[0.45em]">
              Panel de prensa
            </p>

            <h1 className="mt-4 text-[clamp(2.3rem,8vw,5rem)] font-black uppercase italic leading-none">
              Noticias APA
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base md:text-lg">
              Publicá comunicados, novedades del mercado, avisos de competencia y noticias oficiales para mostrar en la web.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[480px_1fr]">
          <form
            onSubmit={guardarNoticia}
            className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 shadow-[0_0_35px_rgba(0,120,255,.10)] sm:rounded-[34px] md:p-6"
          >
            <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
              {editandoId ? "Editar noticia" : "Nueva noticia"}
            </p>

            <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
              {editandoId ? "Actualizar publicación" : "Crear publicación"}
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                  Título
                </label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Mercado de pases abierto"
                  className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none placeholder:text-zinc-700 focus:border-sky-400/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Escribí la noticia o comunicado..."
                  className="min-h-[180px] w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none placeholder:text-zinc-700 focus:border-sky-400/60"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                    Temporada
                  </label>
                  <select
                    value={temporada}
                    onChange={(e) => setTemporada(e.target.value)}
                    className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-sky-400/60"
                  >
                    {temporadas.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                    Categoría
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none focus:border-sky-400/60"
                  >
                    {categorias.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                  Imagen URL opcional
                </label>
                <input
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none placeholder:text-zinc-700 focus:border-sky-400/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                  Autor
                </label>
                <input
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  placeholder="Prensa APA"
                  className="w-full rounded-2xl border border-sky-500/20 bg-black/35 px-5 py-4 text-white outline-none placeholder:text-zinc-700 focus:border-sky-400/60"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-black/35 p-4">
                  <span className="text-sm font-black uppercase text-zinc-300">
                    Publicada
                  </span>
                  <input
                    type="checkbox"
                    checked={publicada}
                    onChange={(e) => setPublicada(e.target.checked)}
                    className="h-5 w-5"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-black/35 p-4">
                  <span className="text-sm font-black uppercase text-zinc-300">
                    Destacada
                  </span>
                  <input
                    type="checkbox"
                    checked={destacada}
                    onChange={(e) => setDestacada(e.target.checked)}
                    className="h-5 w-5"
                  />
                </label>
              </div>

              {!editandoId && (
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4">
                  <span className="text-sm font-black uppercase text-yellow-300">
                    🔔 Notificar a la comunidad
                  </span>
                  <input
                    type="checkbox"
                    checked={notificarComunidad}
                    onChange={(e) => setNotificarComunidad(e.target.checked)}
                    className="h-5 w-5"
                  />
                </label>
              )}

              {mensaje && (
                <p className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm font-black text-yellow-300">
                  {mensaje}
                </p>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-2xl border border-sky-400/30 bg-sky-400 px-5 py-4 text-sm font-black uppercase text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : editandoId ? "Actualizar" : "Publicar"}
                </button>

                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-sm font-black uppercase text-zinc-300 transition hover:border-sky-400/40 hover:text-white"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </form>

          <section className="rounded-[28px] border border-sky-500/20 bg-[#020714] p-5 shadow-[0_0_35px_rgba(0,120,255,.10)] sm:rounded-[34px] md:p-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">
                  Publicaciones
                </p>
                <h2 className="mt-3 text-2xl font-black uppercase sm:text-3xl">
                  Noticias cargadas
                </h2>
              </div>

              <button
                type="button"
                onClick={cargarNoticias}
                disabled={loading}
                className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3 text-xs font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black"
              >
                Actualizar
              </button>
            </div>

            {loading ? (
              <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                Cargando noticias...
              </p>
            ) : noticias.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-black/35 p-5 text-zinc-500">
                Todavía no hay noticias.
              </p>
            ) : (
              <div className="space-y-4">
                {noticias.map((noticia) => (
                  <article
                    key={noticia.id}
                    className="rounded-[24px] border border-white/10 bg-black/35 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[10px] font-black uppercase text-sky-300">
                            {noticia.categoria || "General"}
                          </span>
                          <span className={`rounded-xl border px-3 py-1 text-[10px] font-black uppercase ${
                            noticia.publicada
                              ? "border-green-400/20 bg-green-400/10 text-green-300"
                              : "border-zinc-400/20 bg-zinc-400/10 text-zinc-400"
                          }`}>
                            {noticia.publicada ? "Publicada" : "Oculta"}
                          </span>
                          {noticia.destacada && (
                            <span className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase text-yellow-300">
                              Destacada
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 break-words text-xl font-black uppercase text-white">
                          {noticia.titulo}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
                          {noticia.descripcion}
                        </p>

                        <p className="mt-3 text-xs text-zinc-600">
                          {noticia.temporada || "Sin temporada"} · {noticia.autor || "Prensa APA"}
                        </p>
                      </div>

                      {noticia.imagen_url && (
                        <div className="h-24 w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/35 md:w-36">
                          <img
                            src={noticia.imagen_url}
                            alt={noticia.titulo}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                      <button
                        type="button"
                        onClick={() => editar(noticia)}
                        className="rounded-2xl border border-sky-400/25 bg-sky-400/10 px-4 py-3 text-xs font-black uppercase text-sky-300 transition hover:bg-sky-400 hover:text-black"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePublicada(noticia)}
                        className="rounded-2xl border border-green-400/25 bg-green-400/10 px-4 py-3 text-xs font-black uppercase text-green-300 transition hover:bg-green-400 hover:text-black"
                      >
                        {noticia.publicada ? "Ocultar" : "Publicar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleDestacada(noticia)}
                        className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-xs font-black uppercase text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                      >
                        {noticia.destacada ? "Quitar ⭐" : "Destacar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarNoticia(noticia)}
                        className="rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-xs font-black uppercase text-red-300 transition hover:bg-red-400 hover:text-black"
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
