"use client";

import { useEffect } from "react";
import {
  COMPETICION_LAYOUT_STORAGE_KEY,
  DEFAULT_COMPETICION_LAYOUT,
  normalizarLayout,
  type CompeticionLayout,
} from "./layoutConfig";

function aplicarLayout(layout: CompeticionLayout) {
  const temporada = document.querySelector<HTMLElement>('[data-layout="temporada"]');
  const titulo = document.querySelector<HTMLElement>('[data-layout="titulo"]');
  const linea = document.querySelector<HTMLElement>('[data-layout="linea"]');
  const menu = document.querySelector<HTMLElement>('[data-layout="menu"]');
  const fondo = document.querySelector<HTMLElement>('[data-layout="fondo"]');

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
    const cargar = () => {
      try {
        const guardado = localStorage.getItem(COMPETICION_LAYOUT_STORAGE_KEY);
        aplicarLayout(
          guardado ? normalizarLayout(JSON.parse(guardado)) : DEFAULT_COMPETICION_LAYOUT,
        );
      } catch {
        aplicarLayout(DEFAULT_COMPETICION_LAYOUT);
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
