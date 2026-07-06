"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const TEMPORADAS = ["Temporada 4"];

const DIVISIONES = [
  { value: "primera", label: "Primera" },
  { value: "segunda", label: "Segunda" },
];

type Club = {
  id?: string;
  nombre: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  descripcion: string | null;
  color_principal: string | null;
};

type InscripcionClub = {
  temporada: string;
  division: string;
  activo: boolean;
};

const inscripcionDefault: InscripcionClub = {
  temporada: "Temporada 4",
  division: "segunda",
  activo: true,
};

const EXTENSIONES_PERMITIDAS = ["jpg", "jpeg", "png", "webp"];
const MIME_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_MB = 4;

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

  const [inscripcion, setInscripcion] =
    useState<InscripcionClub>(inscripcionDefault);

  const filtrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();

    if (!query) return clubes;

    return clubes.filter((c) =>
      `${c.nombre} ${c.slug}`.toLowerCase().includes(query),
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

  function limpiarTexto(texto: string, max = 120) {
    return texto.replace(/[<>]/g, "").trim().slice(0, max);
  }

  function validarImagen(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    if (!EXTENSIONES_PERMITIDAS.includes(ext)) {
      return "Formato inválido. Usá JPG, PNG o WEBP.";
    }

    if (!MIME_PERMITIDOS.includes(file.type)) {
      return "Tipo de archivo inválido. No se permite SVG ni otros formatos.";
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      return `La imagen no puede superar ${MAX_IMAGE_MB} MB.`;
    }

    return null;
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
      console.error("ERROR CARGANDO CLUBES:", error);
      setMensaje("Error cargando clubes.");
    } else {
      setClubes(data || []);
    }

    setLoading(false);
  }

  async function cargarInscripcionClub(clubId?: string) {
    setInscripcion(inscripcionDefault);

    if (!clubId) return;

    const { data, error } = await supabase
      .from("clubes_temporada")
      .select("temporada, division, activo")
      .eq("club_id", clubId)
      .eq("temporada", inscripcionDefault.temporada)
      .maybeSingle();

    if (error) {
      console.error("ERROR CARGANDO INSCRIPCIÓN DEL CLUB:", error);
      setMensaje(
        "Club cargado, pero no se pudo leer su temporada/división. Verificá la tabla clubes_temporada.",
      );
      return;
    }

    if (data) {
      setInscripcion({
        temporada: data.temporada || inscripcionDefault.temporada,
        division: data.division || inscripcionDefault.division,
        activo: data.activo ?? true,
      });
    }
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
    setInscripcion(inscripcionDefault);
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

    cargarInscripcionClub(club.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function subirImagen(file: File, tipo: "logo" | "banner") {
    const errorValidacion = validarImagen(file);

    if (errorValidacion) {
      setMensaje(errorValidacion);
      return;
    }

    const slug = form.slug || slugify(form.nombre);

    if (!slug) {
      setMensaje("Primero escribí el nombre del club.");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const carpeta = tipo === "logo" ? "Logos" : "Banners";
    const path = `${carpeta}/${slug}.${ext}`;

    const { error } = await supabase.storage.from("clubes").upload(path, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type,
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

  async function guardarInscripcionClub(clubId: string) {
    const payload = {
      club_id: clubId,
      temporada: inscripcion.temporada,
      division: inscripcion.division,
      activo: inscripcion.activo,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("clubes_temporada")
      .upsert(payload, {
        onConflict: "club_id,temporada",
      });

    if (error) {
      console.error("ERROR GUARDANDO TEMPORADA/DIVISIÓN:", error);
      throw new Error(
        "El club se guardó, pero falló la asignación de temporada/división. Revisá la tabla clubes_temporada.",
      );
    }
  }

  async function guardarClub() {
    if (!form.nombre.trim()) {
      setMensaje("El nombre del club es obligatorio.");
      return;
    }

    if (!inscripcion.temporada || !inscripcion.division) {
      setMensaje("Seleccioná temporada y división.");
      return;
    }

    setSaving(true);
    setMensaje("");

    const slug = form.slug.trim() || slugify(form.nombre);

    const payload = {
      nombre: limpiarTexto(form.nombre, 80),
      slug,
      logo_url: form.logo_url || null,
      banner_url: form.banner_url || null,
      descripcion: form.descripcion ? limpiarTexto(form.descripcion, 500) : null,
      color_principal: form.color_principal || "#00e5ff",
      updated_at: new Date().toISOString(),
    };

    try {
      let clubId = form.id;

      if (form.id) {
        const { error } = await supabase
          .from("clubes_info")
          .update(payload)
          .eq("id", form.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("clubes_info")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;

        clubId = data?.id;
      }

      if (!clubId) {
        throw new Error("No se pudo obtener el ID del club guardado.");
      }

      await guardarInscripcionClub(clubId);

      setMensaje(form.id ? "Club actualizado." : "Club creado.");
      nuevoClub();
      await cargarClubes();
    } catch (error) {
      console.error(error);
      setMensaje(
        error instanceof Error ? error.message : "Error guardando club.",
      );
    }

    setSaving(false);
  }

  async function eliminarClub() {
    if (!form.id) return;

    const ok = confirm(
      "¿Seguro que querés eliminar este club? También se eliminará su inscripción por temporada.",
    );

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
            Crear, editar y personalizar clubes con logo, banner, descripción,
            color principal, temporada y división.
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
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-200/80">
                    {inscripcion.temporada} ·{" "}
                    {DIVISIONES.find((d) => d.value === inscripcion.division)
                      ?.label || inscripcion.division}
                  </p>
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
                <label className="text-sm text-white/60">Temporada</label>
                <select
                  className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
                  value={inscripcion.temporada}
                  onChange={(e) =>
                    setInscripcion((prev) => ({
                      ...prev,
                      temporada: e.target.value,
                    }))
                  }
                >
                  {TEMPORADAS.map((temporada) => (
                    <option key={temporada} value={temporada}>
                      {temporada}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/60">División</label>
                <select
                  className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
                  value={inscripcion.division}
                  onChange={(e) =>
                    setInscripcion((prev) => ({
                      ...prev,
                      division: e.target.value,
                    }))
                  }
                >
                  {DIVISIONES.map((division) => (
                    <option key={division.value} value={division.value}>
                      {division.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/60">Estado</label>
                <button
                  type="button"
                  onClick={() =>
                    setInscripcion((prev) => ({
                      ...prev,
                      activo: !prev.activo,
                    }))
                  }
                  className={`mt-2 w-full rounded-xl border px-4 py-3 text-left font-black uppercase ${
                    inscripcion.activo
                      ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-200"
                      : "border-red-300/25 bg-red-400/10 text-red-200"
                  }`}
                >
                  {inscripcion.activo ? "Activo" : "Inactivo"}
                </button>
              </div>
            </div>

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
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="mt-2 block w-full text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) subirImagen(file, "logo");
                    e.currentTarget.value = "";
                  }}
                />
              </div>

              <div>
                <label className="text-sm text-white/60">Subir banner</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="mt-2 block w-full text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) subirImagen(file, "banner");
                    e.currentTarget.value = "";
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
