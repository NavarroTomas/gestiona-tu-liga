"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Club = {
  id?: string;
  nombre: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  descripcion: string | null;
  color_principal: string | null;
};

export default function AdminClubesPage() {
  const [clubes, setClubes] = useState<Club[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState<Club>({
    nombre: "",
    slug: "",
    logo_url: "",
    banner_url: "",
    descripcion: "",
    color_principal: "#00e5ff",
  });

  const filtrados = useMemo(() => {
    return clubes.filter((c) =>
      `${c.nombre} ${c.slug}`.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }, [clubes, busqueda]);

  useEffect(() => {
    cargarClubes();
  }, []);

  function slugify(texto: string) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function cargarClubes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("clubes_info")
      .select(
        "id, nombre, slug, logo_url, banner_url, descripcion, color_principal, created_at, updated_at",
      )
      .order("nombre", { ascending: true });

    if (error) {
      console.error("ERROR CARGANDO CLUBES:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        full: JSON.stringify(error, null, 2),
      });

      setMensaje(
        `Error cargando clubes: ${error.message || error.code || "sin detalle"}`,
      );
    } else {
      setClubes(data || []);
    }

    setLoading(false);
  }

  function nuevoClub() {
    setForm({
      nombre: "",
      slug: "",
      logo_url: "",
      banner_url: "",
      descripcion: "",
      color_principal: "#00e5ff",
    });
    setMensaje("");
  }

  function editarClub(club: Club) {
    setForm({
      id: club.id,
      nombre: club.nombre || "",
      slug: club.slug || "",
      logo_url: club.logo_url || "",
      banner_url: club.banner_url || "",
      descripcion: club.descripcion || "",
      color_principal: club.color_principal || "#00e5ff",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function subirImagen(file: File, tipo: "logo" | "banner") {
    const slug = form.slug || slugify(form.nombre);

    if (!slug) {
      setMensaje("Primero escribí el nombre del club.");
      return;
    }

    const ext = file.name.split(".").pop();
    const carpeta = tipo === "logo" ? "Logos" : "Banners";
    const path = `${carpeta}/${slug}.${ext}`;

    const { error } = await supabase.storage.from("clubes").upload(path, file, {
      upsert: true,
      cacheControl: "3600",
    });

    if (error) {
      console.error(error);
      setMensaje("Error subiendo imagen.");
      return;
    }

    const { data } = supabase.storage.from("clubes").getPublicUrl(path);

    setForm((prev) => ({
      ...prev,
      slug,
      [tipo === "logo" ? "logo_url" : "banner_url"]: data.publicUrl,
    }));

    setMensaje(`${tipo === "logo" ? "Logo" : "Banner"} subido correctamente.`);
  }

  async function guardarClub() {
    if (!form.nombre.trim()) {
      setMensaje("El nombre del club es obligatorio.");
      return;
    }

    setSaving(true);
    setMensaje("");

    const payload = {
      nombre: form.nombre.trim(),
      slug: form.slug.trim() || slugify(form.nombre),
      logo_url: form.logo_url || null,
      banner_url: form.banner_url || null,
      descripcion: form.descripcion || null,
      color_principal: form.color_principal || "#00e5ff",
      updated_at: new Date().toISOString(),
    };

    const { error } = form.id
      ? await supabase.from("clubes_info").update(payload).eq("id", form.id)
      : await supabase.from("clubes_info").insert(payload);

    if (error) {
      console.error(error);
      setMensaje("Error guardando club.");
    } else {
      setMensaje(form.id ? "Club actualizado." : "Club creado.");
      nuevoClub();
      await cargarClubes();
    }

    setSaving(false);
  }

  async function eliminarClub() {
    if (!form.id) return;

    const ok = confirm("¿Seguro que querés eliminar este club de clubes_info?");

    if (!ok) return;

    const { error } = await supabase
      .from("clubes_info")
      .delete()
      .eq("id", form.id);

    if (error) {
      console.error(error);
      setMensaje("Error eliminando club.");
    } else {
      setMensaje("Club eliminado.");
      nuevoClub();
      await cargarClubes();
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white px-4 py-8">
      <section className="mx-auto max-w-[1500px] space-y-8">
        <div>
          <p className="text-cyan-400 text-sm uppercase tracking-[0.3em]">
            Panel Admin
          </p>
          <h1 className="text-3xl md:text-5xl font-black mt-2">
            Administrar Clubes
          </h1>
          <p className="text-white/60 mt-3">
            Crear, editar y personalizar clubes con logo, banner, descripción y
            color principal.
          </p>
        </div>

        {mensaje && (
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-cyan-200">
            {mensaje}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-black">Clubes</h2>
              <button
                onClick={nuevoClub}
                className="rounded-xl bg-cyan-400 text-black px-4 py-2 font-black hover:bg-cyan-300"
              >
                Nuevo
              </button>
            </div>

            <input
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none mb-4"
              placeholder="Buscar club..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            {loading ? (
              <p className="text-white/60">Cargando...</p>
            ) : (
              <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
                {filtrados.map((club) => (
                  <button
                    key={club.id || club.slug}
                    onClick={() => editarClub(club)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                      form.id === club.id
                        ? "border-cyan-400 bg-cyan-400/10"
                        : "border-white/10 bg-black/30 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={club.logo_url || "/placeholder-logo.png"}
                        alt={club.nombre}
                        className="h-10 w-10 rounded-lg object-contain bg-black/60"
                      />
                      <div className="min-w-0">
                        <p className="font-bold truncate">{club.nombre}</p>
                        <p className="text-xs text-white/50 truncate">
                          /{club.slug}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-5">
            <h2 className="text-2xl font-black">
              {form.id ? "Editar club" : "Crear nuevo club"}
            </h2>

            <div
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 min-h-[220px]"
              style={{
                backgroundImage: form.banner_url
                  ? `linear-gradient(to top, rgba(5,8,22,.95), rgba(5,8,22,.25)), url(${form.banner_url})`
                  : "linear-gradient(135deg, rgba(0,229,255,.18), rgba(255,255,255,.04))",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute bottom-5 left-5 flex items-center gap-4">
                <img
                  src={form.logo_url || "/placeholder-logo.png"}
                  alt={form.nombre || "Logo"}
                  className="h-20 w-20 rounded-2xl object-contain bg-black/70 border border-white/10"
                />
                <div>
                  <h3 className="text-2xl font-black">
                    {form.nombre || "Nombre del club"}
                  </h3>
                  <p className="text-white/60">/{form.slug || "slug"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <input
                className="rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => {
                  const nombre = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    nombre,
                    slug: prev.id ? prev.slug : slugify(nombre),
                  }));
                }}
              />

              <input
                className="rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
                placeholder="Slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    slug: slugify(e.target.value),
                  }))
                }
              />
            </div>

            <textarea
              className="w-full min-h-[130px] rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
              placeholder="Descripción del club"
              value={form.descripcion || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, descripcion: e.target.value }))
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-white/60">Color principal</label>
                <div className="flex gap-3 mt-2">
                  <input
                    type="color"
                    value={form.color_principal || "#00e5ff"}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        color_principal: e.target.value,
                      }))
                    }
                    className="h-12 w-16 rounded-lg bg-black"
                  />
                  <input
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
                    value={form.color_principal || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        color_principal: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60">Subir logo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) subirImagen(file, "logo");
                  }}
                />
              </div>

              <div>
                <label className="text-sm text-white/60">Subir banner</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) subirImagen(file, "banner");
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                onClick={guardarClub}
                disabled={saving}
                className="rounded-xl bg-cyan-400 text-black font-black px-6 py-3 hover:bg-cyan-300 disabled:opacity-50"
              >
                {saving
                  ? "Guardando..."
                  : form.id
                    ? "Guardar cambios"
                    : "Crear club"}
              </button>

              <button
                onClick={nuevoClub}
                className="rounded-xl border border-white/10 px-6 py-3 font-bold hover:bg-white/10"
              >
                Cancelar
              </button>

              {form.id && (
                <button
                  onClick={eliminarClub}
                  className="rounded-xl bg-red-500/20 text-red-200 px-6 py-3 font-bold hover:bg-red-500/30"
                >
                  Eliminar club
                </button>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
