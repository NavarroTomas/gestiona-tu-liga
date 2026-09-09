export const COMPETICION_LAYOUT_STORAGE_KEY = "apa-competicion-layout-v3";

export type ElementoMovible = "temporada" | "titulo" | "linea" | "menu";

export type CompeticionLayout = {
  temporada: { x: number; y: number; size: number };
  titulo: { x: number; y: number; size: number };
  linea: { x: number; y: number; width: number };
  menu: { x: number; y: number; height: number };
  fondo: { x: number; y: number; zoom: number };
};

export const DEFAULT_COMPETICION_LAYOUT: CompeticionLayout = {
  temporada: { x: 0, y: 0, size: 20 },
  titulo: { x: 0, y: 0, size: 64 },
  linea: { x: 0, y: 0, width: 94 },
  menu: { x: 0, y: 0, height: 124 },
  fondo: { x: 70, y: 50, zoom: 1 },
};

export function normalizarLayout(valor: unknown): CompeticionLayout {
  const base = DEFAULT_COMPETICION_LAYOUT;
  if (!valor || typeof valor !== "object") return base;

  const entrada = valor as Partial<CompeticionLayout>;

  return {
    temporada: { ...base.temporada, ...(entrada.temporada ?? {}) },
    titulo: { ...base.titulo, ...(entrada.titulo ?? {}) },
    linea: { ...base.linea, ...(entrada.linea ?? {}) },
    menu: { ...base.menu, ...(entrada.menu ?? {}) },
    fondo: { ...base.fondo, ...(entrada.fondo ?? {}) },
  };
}
