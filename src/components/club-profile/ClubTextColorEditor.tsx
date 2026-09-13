"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type SavedStyle = {
  element_key: string;
  color: string;
  label?: string | null;
};

type SelectedText = {
  element: HTMLElement;
  key: string;
  label: string;
  color: string;
};

const TEXT_SELECTOR =
  "h1,h2,h3,h4,h5,h6,p,span,a,button,th,td,label,small,strong";

const QUICK_COLORS = [
  { name: "Blanco", value: "#ffffff" },
  { name: "Negro", value: "#111827" },
  { name: "Navy APA", value: "#102f55" },
  { name: "Azul medio", value: "#1d4d79" },
  { name: "Azul fuerte", value: "#245f8e" },
  { name: "Gris", value: "#4b5563" },
];

/**
 * Genera un selector estructural estable dentro de la ficha de club.
 * No depende de los textos (que cambian entre clubes) ni de clases Tailwind.
 */
function buildElementKey(element: HTMLElement, root: HTMLElement) {
  const segments: string[] = [];
  let node: HTMLElement | null = element;

  while (node && node !== root) {
    const parent = node.parentElement;
    if (!parent) break;

    const tag = node.tagName.toLowerCase();
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === node!.tagName,
    );
    const index = Math.max(1, siblings.indexOf(node) + 1);

    segments.unshift(`${tag}:nth-of-type(${index})`);
    node = parent;
  }

  return segments.join(" > ");
}

function normalizeHex(value: string) {
  const clean = value.trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(clean) ? clean : "#102f55";
}

function readableLabel(element: HTMLElement) {
  const text = (element.textContent || "").replace(/\s+/g, " ").trim();
  return text.slice(0, 90) || element.tagName.toLowerCase();
}

export default function ClubTextColorEditor() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<SelectedText | null>(null);
  const [savedStyles, setSavedStyles] = useState<SavedStyle[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const selectedRef = useRef<HTMLElement | null>(null);

  const root = useMemo(() => {
    if (typeof document === "undefined") return null;
    return document.querySelector<HTMLElement>(".club-profile-redesign");
  }, []);

  const applySavedStyles = useCallback((styles: SavedStyle[]) => {
    if (typeof document === "undefined") return;
    const pageRoot = document.querySelector<HTMLElement>(".club-profile-redesign");
    if (!pageRoot) return;

    styles.forEach((style) => {
      try {
        const target = pageRoot.querySelector<HTMLElement>(style.element_key);
        if (!target) return;
        target.style.setProperty("color", normalizeHex(style.color), "important");
        target.dataset.clubColorEdited = "true";
      } catch {
        // Si una estructura antigua deja de existir, simplemente se ignora.
      }
    });
  }, []);

  const loadSavedStyles = useCallback(async () => {
    const { data, error } = await supabase
      .from("club_profile_text_styles")
      .select("element_key,color,label")
      .order("updated_at", { ascending: true });

    if (error) {
      console.error("No se pudieron cargar los colores del perfil:", error);
      return;
    }

    const styles = (data || []) as SavedStyle[];
    setSavedStyles(styles);
    applySavedStyles(styles);
  }, [applySavedStyles]);

  useEffect(() => {
    loadSavedStyles();
  }, [loadSavedStyles]);

  // La ficha carga datos de forma asíncrona. Reaplicamos colores cuando aparecen nodos nuevos.
  useEffect(() => {
    if (!root) return;

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(() => applySavedStyles(savedStyles));
    });

    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [root, savedStyles, applySavedStyles]);

  useEffect(() => {
    let alive = true;

    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !alive) return;

      const { data } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (alive) setIsAdmin(Boolean(data?.user_id));
    }

    checkAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => {
      alive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const clearSelectionOutline = useCallback(() => {
    if (!selectedRef.current) return;
    selectedRef.current.style.removeProperty("outline");
    selectedRef.current.style.removeProperty("outline-offset");
    selectedRef.current = null;
  }, []);

  useEffect(() => {
    if (!root || !editMode) {
      clearSelectionOutline();
      return;
    }

    function handleClick(event: MouseEvent) {
      const raw = event.target;
      if (!(raw instanceof HTMLElement)) return;
      if (raw.closest("[data-club-color-editor]")) return;

      const target = raw.closest<HTMLElement>(TEXT_SELECTOR);
      if (!target || !root!.contains(target)) return;
      if (!(target.textContent || "").trim()) return;

      event.preventDefault();
      event.stopPropagation();

      clearSelectionOutline();
      target.style.setProperty("outline", "3px solid #2d98d4", "important");
      target.style.setProperty("outline-offset", "3px", "important");
      selectedRef.current = target;

      const key = buildElementKey(target, root!);
      const current = getComputedStyle(target).color;
      const rgb = current.match(/\d+/g)?.slice(0, 3).map(Number);
      const computedHex = rgb
        ? `#${rgb.map((n) => n.toString(16).padStart(2, "0")).join("")}`
        : "#102f55";
      const saved = savedStyles.find((item) => item.element_key === key);

      setSelected({
        element: target,
        key,
        label: readableLabel(target),
        color: saved?.color || computedHex,
      });
      setEditorOpen(true);
      setMessage(null);
    }

    root.addEventListener("click", handleClick, true);
    root.style.cursor = "crosshair";

    return () => {
      root.removeEventListener("click", handleClick, true);
      root.style.removeProperty("cursor");
      clearSelectionOutline();
    };
  }, [root, editMode, savedStyles, clearSelectionOutline]);

  function previewColor(color: string) {
    if (!selected) return;
    const normalized = normalizeHex(color);
    selected.element.style.setProperty("color", normalized, "important");
    setSelected({ ...selected, color: normalized });
  }

  async function saveColor() {
    if (!selected) return;
    setSaving(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Necesitás una sesión de administrador.");
      setSaving(false);
      return;
    }

    const row = {
      element_key: selected.key,
      color: normalizeHex(selected.color),
      label: selected.label,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("club_profile_text_styles")
      .upsert(row, { onConflict: "element_key" });

    if (error) {
      console.error("Error guardando color:", error);
      setMessage("No se pudo guardar el cambio.");
      setSaving(false);
      return;
    }

    const next = [
      ...savedStyles.filter((item) => item.element_key !== selected.key),
      row,
    ];
    setSavedStyles(next);
    applySavedStyles(next);
    setMessage("Color guardado y aplicado.");
    setSaving(false);
  }

  async function resetSelected() {
    if (!selected) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("club_profile_text_styles")
      .delete()
      .eq("element_key", selected.key);

    if (error) {
      console.error("Error restaurando color:", error);
      setMessage("No se pudo restaurar el color.");
      setSaving(false);
      return;
    }

    selected.element.style.removeProperty("color");
    delete selected.element.dataset.clubColorEdited;
    const next = savedStyles.filter((item) => item.element_key !== selected.key);
    setSavedStyles(next);
    setSelected(null);
    clearSelectionOutline();
    setMessage("Color restaurado al diseño original.");
    setSaving(false);
  }

  if (!isAdmin) return null;

  return (
    <div data-club-color-editor className="fixed bottom-5 right-5 z-[9999] font-sans">
      {!editorOpen ? (
        <button
          type="button"
          onClick={() => setEditorOpen(true)}
          className="rounded-2xl border border-white/20 bg-[#0b2747] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-2xl transition hover:bg-[#173f73]"
        >
          Editar colores
        </button>
      ) : (
        <div className="w-[min(360px,calc(100vw-24px))] rounded-3xl border border-slate-200 bg-white p-4 text-[#102f55] shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#245f8e]">
                Editor visual
              </p>
              <h3 className="mt-1 text-lg font-black uppercase text-[#102f55]">
                Colores de texto
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditorOpen(false);
                setEditMode(false);
                clearSelectionOutline();
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-[#102f55] hover:bg-slate-100"
            >
              Cerrar
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditMode((value) => !value);
              setMessage(null);
            }}
            className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.08em] transition ${
              editMode
                ? "bg-[#245f8e] text-white"
                : "bg-[#102f55] text-white hover:bg-[#173f73]"
            }`}
          >
            {editMode ? "Selección activa" : "Seleccionar texto"}
          </button>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            {editMode
              ? "Hacé clic sobre cualquier texto de la ficha para editarlo."
              : "Activá la selección para elegir un texto directamente en la página."}
          </p>

          {selected && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                Texto seleccionado
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-bold text-[#102f55]">
                {selected.label}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <input
                  aria-label="Color del texto"
                  type="color"
                  value={normalizeHex(selected.color)}
                  onChange={(event) => previewColor(event.target.value)}
                  className="h-11 w-14 cursor-pointer rounded-xl border border-slate-300 bg-white p-1"
                />
                <input
                  value={selected.color}
                  onChange={(event) => previewColor(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 font-mono text-sm font-bold text-[#102f55] outline-none focus:border-[#245f8e]"
                />
              </div>

              <div className="mt-3 grid grid-cols-6 gap-2">
                {QUICK_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    title={color.name}
                    aria-label={color.name}
                    onClick={() => previewColor(color.value)}
                    className="h-9 rounded-xl border border-slate-300 shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveColor}
                  className="rounded-xl bg-[#102f55] px-3 py-3 text-xs font-black uppercase text-white transition hover:bg-[#173f73] disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={resetSelected}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-xs font-black uppercase text-[#102f55] transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Restaurar
                </button>
              </div>
            </div>
          )}

          {message && (
            <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-[#102f55]">
              {message}
            </p>
          )}

          <p className="mt-4 text-[11px] leading-5 text-slate-500">
            Los cambios guardados quedan en Supabase y se aplican a todas las fichas de club.
          </p>
        </div>
      )}
    </div>
  );
}
