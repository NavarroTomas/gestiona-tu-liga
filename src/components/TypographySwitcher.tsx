"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_TYPOGRAPHY_THEME,
  TYPOGRAPHY_STORAGE_KEY,
  TYPOGRAPHY_THEMES,
  getTypographyTheme,
} from "@/config/typography";
import styles from "./TypographySwitcher.module.css";

export default function TypographySwitcher() {
  const [open, setOpen] = useState(false);
  const [themeId, setThemeId] = useState(DEFAULT_TYPOGRAPHY_THEME);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.fontTheme || DEFAULT_TYPOGRAPHY_THEME;
    setThemeId(current);
  }, []);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function applyTheme(nextThemeId: string) {
    const theme = getTypographyTheme(nextThemeId);
    const html = document.documentElement;

    html.classList.add("apa-font-theme-changing");
    html.dataset.fontTheme = theme.id;
    setThemeId(theme.id);

    try {
      localStorage.setItem(TYPOGRAPHY_STORAGE_KEY, theme.id);
    } catch {
      // La selección sigue funcionando aunque el navegador bloquee localStorage.
    }

    window.setTimeout(() => html.classList.remove("apa-font-theme-changing"), 180);
  }

  const selected = getTypographyTheme(themeId);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={`Tipografía: ${selected.name}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">Aa</span>
      </button>

      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Elegir tipografía">
          <div className={styles.header}>
            <div>
              <strong>Tipografía</strong>
              <span>Vista global del sitio</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar selector">
              Cerrar
            </button>
          </div>

          <div className={styles.list} role="listbox" aria-label="Temas tipográficos">
            {TYPOGRAPHY_THEMES.map((theme) => {
              const active = theme.id === themeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`${styles.option} ${active ? styles.active : ""}`}
                  onClick={() => applyTheme(theme.id)}
                  style={{
                    ["--preview-heading" as string]: theme.heading.family,
                    ["--preview-body" as string]: theme.body.family,
                  }}
                >
                  <span className={styles.sample}>Aa</span>
                  <span className={styles.meta}>
                    <strong>{theme.name}</strong>
                    <small>{theme.headingLabel} + {theme.bodyLabel}</small>
                    <em>{theme.intent}</em>
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.footer}>
            <span>Tu elección queda guardada en este navegador.</span>
            <button type="button" onClick={() => applyTheme(DEFAULT_TYPOGRAPHY_THEME)}>
              Restablecer
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
