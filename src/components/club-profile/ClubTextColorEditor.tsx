"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearAdminPermissionsCache,
  getMyAdminPermissions,
  hasAnyAdminPermission,
} from "@/lib/adminPermissions";
import { supabase } from "@/lib/supabase";

type SavedStyle = {
  element_key: string;
  color: string;
  label: string | null;
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
  ["Blanco", "#ffffff"],
  ["Negro", "#111827"],
  ["Navy APA", "#102f55"],
  ["Azul medio", "#1d4d79"],
  ["Azul fuerte", "#245f8e"],
  ["Gris", "#4b5563"],
] as const;

function normalizeHex(value: string) {
  const clean = value.trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(clean) ? clean : "#102f55";
}

function rgbToHex(value: string) {
  const parts = value.match(/\d+/g)?.slice(0, 3).map(Number);
  if (!parts || parts.length !== 3) return "#102f55";
  return `#${parts.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function buildElementKey(element: HTMLElement, root: HTMLElement) {
  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== root) {
    const node = current;
    const parent = node.parentElement;
    if (!parent) break;

    const sameTag = Array.from(parent.children).filter(
      (child) => child.tagName === node.tagName,
    );
    const index = sameTag.indexOf(node) + 1;
    segments.unshift(`${node.tagName.toLowerCase()}:nth-of-type(${index})`);
    current = parent;
  }

  return segments.join(" > ");
}

function getTextLabel(element: HTMLElement) {
  return (element.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}

function getPageRoot() {
  if (typeof document === "undefined") return null;
  return document.querySelector(".club-profile-redesign") as HTMLElement | null;
}

export default function ClubTextColorEditor() {
  const [canEdit, setCanEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<SelectedText | null>(null);
  const [styles, setStyles] = useState<SavedStyle[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const outlinedRef = useRef<HTMLElement | null>(null);

  const clearOutline = useCallback(() => {
    const element = outlinedRef.current;
    if (!element) return;
    element.style.removeProperty("outline");
    element.style.removeProperty("outline-offset");
    outlinedRef.current = null;
  }, []);

  const applyStyles = useCallback((items: SavedStyle[]) => {
    const root = getPageRoot();
    if (!root) return;

    for (const item of items) {
      if (!item.element_key) continue;
      try {
        const target = root.querySelector(item.element_key) as HTMLElement | null;
        if (!target) continue;
        target.style.setProperty("color", normalizeHex(item.color), "important");
      } catch {
        // Un selector antiguo puede dejar de existir si cambia el layout.
      }
    }
  }, []);

  const reloadStyles = useCallback(async () => {
    const { data, error } = await supabase
      .from("club_profile_text_styles")
      .select("element_key,color,label,updated_at")
      .order("updated_at", { ascending: true });

    if (error) {
      console.error("Error cargando colores guardados:", error);
      return;
    }

    const next: SavedStyle[] = (data || []).map((row) => ({
      element_key: String(row.element_key || ""),
      color: String(row.color || "#102f55"),
      label: row.label ? String(row.label) : null,
    }));

    setStyles(next);
    applyStyles(next);
  }, [applyStyles]);

  useEffect(() => {
    void reloadStyles();
  }, [reloadStyles]);

  useEffect(() => {
    const root = getPageRoot();
    if (!root) return;

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(() => applyStyles(styles));
    });

    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [styles, applyStyles]);

  useEffect(() => {
    let active = true;

    async function refreshPermission() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        clearAdminPermissionsCache();
        setCanEdit(false);
        return;
      }

      try {
        const permissions = await getMyAdminPermissions(user.id);
        if (active) setCanEdit(hasAnyAdminPermission(permissions));
      } catch (error) {
        console.error("Error verificando permiso del editor:", error);
        clearAdminPermissionsCache();
        if (active) setCanEdit(false);
      }
    }

    void refreshPermission();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      clearAdminPermissionsCache();
      void refreshPermission();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const root = getPageRoot();
    if (!root || !selecting || !canEdit) {
      clearOutline();
      return;
    }

    const pageRoot = root;

    const handleClick = (event: MouseEvent) => {
      const raw = event.target;
      if (!(raw instanceof HTMLElement)) return;
      if (raw.closest("[data-club-color-editor]")) return;

      const target = raw.closest(TEXT_SELECTOR) as HTMLElement | null;
      if (!target || !pageRoot.contains(target)) return;
      if (!getTextLabel(target)) return;

      event.preventDefault();
      event.stopPropagation();

      clearOutline();
      target.style.setProperty("outline", "3px solid #2d98d4", "important");
      target.style.setProperty("outline-offset", "3px", "important");
      outlinedRef.current = target;

      const key = buildElementKey(target, pageRoot);
      const saved = styles.find((item) => item.element_key === key);

      setSelected({
        element: target,
        key,
        label: getTextLabel(target),
        color: saved?.color || rgbToHex(getComputedStyle(target).color),
      });
      setOpen(true);
      setMessage("");
    };

    pageRoot.addEventListener("click", handleClick, true);
    pageRoot.style.cursor = "crosshair";

    return () => {
      pageRoot.removeEventListener("click", handleClick, true);
      pageRoot.style.removeProperty("cursor");
      clearOutline();
    };
  }, [selecting, styles, canEdit, clearOutline]);

  function previewColor(value: string) {
    if (!selected) return;
    const color = normalizeHex(value);
    selected.element.style.setProperty("color", color, "important");
    setSelected((current) => (current ? { ...current, color } : current));
  }

  async function saveSelected() {
    if (!selected || !canEdit) return;
    setSaving(true);
    setMessage("");

    const authResult = await supabase.auth.getUser();
    const user = authResult.data.user;

    if (!user) {
      setMessage("Necesitás una sesión de administrador para guardar.");
      setSaving(false);
      return;
    }

    const color = normalizeHex(selected.color);
    const payload = {
      element_key: selected.key,
      color,
      label: selected.label,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("club_profile_text_styles")
      .upsert(payload, { onConflict: "element_key" });

    if (error) {
      console.error("Error guardando color:", error);
      setMessage("No se pudo guardar. Supabase rechazó el cambio.");
      setSaving(false);
      return;
    }

    const next: SavedStyle[] = [
      ...styles.filter((item) => item.element_key !== selected.key),
      { element_key: selected.key, color, label: selected.label },
    ];

    setStyles(next);
    applyStyles(next);
    setMessage("Guardado y aplicado.");
    setSaving(false);
  }

  async function restoreSelected() {
    if (!selected || !canEdit) return;
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("club_profile_text_styles")
      .delete()
      .eq("element_key", selected.key);

    if (error) {
      console.error("Error restaurando color:", error);
      setMessage("No se pudo restaurar.");
      setSaving(false);
      return;
    }

    selected.element.style.removeProperty("color");
    setStyles((current) =>
      current.filter((item) => item.element_key !== selected.key),
    );
    setSelected(null);
    clearOutline();
    setMessage("Restaurado al diseño original.");
    setSaving(false);
  }

  if (!canEdit) return null;

  return (
    <div
      data-club-color-editor
      className="fixed bottom-5 right-5 z-[9999] font-sans"
    >
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-2xl border border-white/20 bg-[#0b2747] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-2xl hover:bg-[#173f73]"
        >
          Editar colores
        </button>
      ) : (
        <div className="w-[360px] max-w-[calc(100vw-24px)] rounded-3xl border border-slate-200 bg-white p-4 text-[#102f55] shadow-2xl">
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
                setOpen(false);
                setSelecting(false);
                clearOutline();
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-[#102f55] hover:bg-slate-100"
            >
              Cerrar
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelecting((value) => !value);
              setMessage("");
            }}
            className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white ${
              selecting ? "bg-[#245f8e]" : "bg-[#102f55] hover:bg-[#173f73]"
            }`}
          >
            {selecting ? "Selección activa" : "Seleccionar texto"}
          </button>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            {selecting
              ? "Hacé clic sobre cualquier texto de la ficha."
              : "Activá la selección y elegí directamente el texto que querés cambiar."}
          </p>

          {selected ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                Seleccionado
              </p>
              <p className="mt-1 text-sm font-bold text-[#102f55]">
                {selected.label}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <input
                  type="color"
                  aria-label="Color del texto"
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
                {QUICK_COLORS.map(([name, value]) => (
                  <button
                    key={value}
                    type="button"
                    title={name}
                    aria-label={name}
                    onClick={() => previewColor(value)}
                    className="h-9 rounded-xl border border-slate-300 shadow-sm"
                    style={{ backgroundColor: value }}
                  />
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveSelected()}
                  className="rounded-xl bg-[#102f55] px-3 py-3 text-xs font-black uppercase text-white disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void restoreSelected()}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-xs font-black uppercase text-[#102f55] hover:bg-slate-100 disabled:opacity-50"
                >
                  Restaurar
                </button>
              </div>
            </div>
          ) : null}

          {message ? (
            <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-[#102f55]">
              {message}
            </p>
          ) : null}

          <p className="mt-4 text-[11px] leading-5 text-slate-500">
            Solo visible para usuarios con permisos administrativos.
          </p>
        </div>
      )}
    </div>
  );
}
