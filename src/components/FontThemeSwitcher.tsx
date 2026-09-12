"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_TYPOGRAPHY_THEME,
  TYPOGRAPHY_STORAGE_KEY,
  TYPOGRAPHY_THEMES,
  getTypographyTheme,
} from "@/config/typography";
import estilos from "./FontThemeSwitcher.module.css";

export default function FontThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [themeId, setThemeId] = useState(DEFAULT_TYPOGRAPHY_THEME);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const currentTheme = getTypographyTheme(themeId);

  useEffect(() => {
    const active = document.documentElement.dataset.fontTheme;
    if (active) setThemeId(getTypographyTheme(active).id);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function applyTheme(nextId: string) {
    const theme = getTypographyTheme(nextId);
    document.documentElement.dataset.fontTheme = theme.id;
    setThemeId(theme.id);

    try {
      localStorage.setItem(TYPOGRAPHY_STORAGE_KEY, theme.id);
    } catch {
      // Si el navegador bloquea storage, el tema sigue funcionando en la sesión.
    }
  }

  function resetTheme() {
    applyTheme(DEFAULT_TYPOGRAPHY_THEME);
  }

  return (
    <div ref={wrapperRef} className={estilos.wrapper}>
      <button
        type="button"
        className={estilos.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="apa-font-theme-panel"
        aria-label={`Cambiar tipografía. Tema actual: ${currentTheme.name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">Aa</span>
      </button>

      {open ? (
        <div
          id="apa-font-theme-panel"
          className={estilos.panel}
          role="dialog"
          aria-label="Selector de tipografía"
        >
          <div className={estilos.header}>
            <div>
              <p className={estilos.eyebrow}>Tipografía</p>
              <h2>Elegí un estilo</h2>
            </div>
            <span className={estilos.count}>20 opciones</span>
          </div>

          <label className={estilos.label} htmlFor="apa-font-theme-select">
            Combinación
          </label>
          <select
            id="apa-font-theme-select"
            className={estilos.select}
            value={themeId}
            onChange={(event) => applyTheme(event.target.value)}
          >
            {TYPOGRAPHY_THEMES.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name} · {theme.headingLabel} + {theme.bodyLabel}
              </option>
            ))}
          </select>

          <div className={estilos.preview} aria-live="polite">
            <p className={estilos.previewLabel}>{currentTheme.intent}</p>
            <h3>APA PSO Argentina</h3>
            <p>
              Fixture, clubes, jugadores y estadísticas con una tipografía
              consistente en toda la plataforma.
            </p>
          </div>

          <dl className={estilos.metrics}>
            <div>
              <dt>Títulos</dt>
              <dd>{currentTheme.headingLabel}</dd>
            </div>
            <div>
              <dt>Texto</dt>
              <dd>{currentTheme.bodyLabel}</dd>
            </div>
          </dl>

          <button type="button" className={estilos.reset} onClick={resetTheme}>
            Restaurar APA Moderno
          </button>

          <span className={estilos.srOnly} aria-live="polite">
            Tema tipográfico {currentTheme.name} aplicado.
          </span>
        </div>
      ) : null}
    </div>
  );
}
