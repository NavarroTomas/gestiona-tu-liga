"use client";

import { useEffect } from "react";
import {
  COMPETICION_LAYOUT_STORAGE_KEY,
  normalizarLayout,
  type CompeticionLayout,
} from "./layoutConfig";

function obtenerElementos() {
  return {
    temporada: document.querySelector<HTMLElement>('[data-layout="temporada"]'),
    titulo: document.querySelector<HTMLElement>('[data-layout="titulo"]'),
    linea: document.querySelector<HTMLElement>('[data-layout="linea"]'),
    menu: document.querySelector<HTMLElement>('[data-layout="menu"]'),
    fondo: document.querySelector<HTMLElement>('[data-layout="fondo"]'),
  };
}

function limpiarLayoutEnLinea() {
  const { temporada, titulo, linea, menu, fondo } = obtenerElementos();

  if (temporada) {
    temporada.style.transform = "";
    temporada.style.fontSize = "";
  }

  if (titulo) {
    titulo.style.transform = "";
    titulo.style.fontSize = "";
  }

  if (linea) {
    linea.style.transform = "";
    linea.style.width = "";
  }

  if (menu) {
    menu.style.transform = "";
    const lista = menu.querySelector<HTMLElement>("ul");
    if (lista) lista.style.minHeight = "";
  }

  if (fondo) {
    fondo.style.objectPosition = "";
    fondo.style.transform = "";
    fondo.style.transformOrigin = "";
  }
}

function aplicarLayout(layout: CompeticionLayout) {
  const { temporada, titulo, linea, menu, fondo } = obtenerElementos();

  if (temporada) {
    temporada.style.transform = `translate(${layout.temporada.x}px, ${layout.temporada.y}px)`;
    temporada.style.fontSize = `${layout.temporada.size}px`;
  }

  if (titulo) {
    titulo.style.transform = `translate(${layout.titulo.x}px, ${layout.titulo.y}px)`;
    titulo.style.fontSize = `${layout.titulo.size}px`;
  }

  if (linea) {
    linea.style.transform = `translate(${layout.linea.x}px, ${layout.linea.y}px)`;
    linea.style.width = `${layout.linea.width}px`;
  }

  if (menu) {
    menu.style.transform = `translate(${layout.menu.x}px, ${layout.menu.y}px)`;
    const lista = menu.querySelector<HTMLElement>("ul");
    if (lista) lista.style.minHeight = `${layout.menu.height}px`;
  }

  if (fondo) {
    fondo.style.objectPosition = `${layout.fondo.x}% ${layout.fondo.y}%`;
    fondo.style.transform = `scale(${layout.fondo.zoom})`;
    fondo.style.transformOrigin = "center";
  }
}

export default function AplicarLayoutGuardado() {
  useEffect(() => {
    // El editor carga /competicion?editorBase=1 para ver SIEMPRE el código real,
    // sin que una configuración vieja de localStorage pise cambios recientes.
    const parametros = new URLSearchParams(window.location.search);
    if (parametros.get("editorBase") === "1") {
      limpiarLayoutEnLinea();
      return;
    }

    const cargar = () => {
      try {
        const guardado = localStorage.getItem(COMPETICION_LAYOUT_STORAGE_KEY);

        // Si no existe una edición guardada, no aplicamos defaults JS:
        // dejamos que mande exactamente el TSX/CSS actual de la página.
        if (!guardado) {
          limpiarLayoutEnLinea();
          return;
        }

        aplicarLayout(normalizarLayout(JSON.parse(guardado)));
      } catch {
        limpiarLayoutEnLinea();
      }
    };

    cargar();

    const alCambiarStorage = (event: StorageEvent) => {
      if (event.key === COMPETICION_LAYOUT_STORAGE_KEY) cargar();
    };

    window.addEventListener("storage", alCambiarStorage);
    return () => window.removeEventListener("storage", alCambiarStorage);
  }, []);

  return null;
}
