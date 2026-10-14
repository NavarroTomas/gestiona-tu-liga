"use client";
import { useEffect } from "react";
import styles from "@/app/landing.module.css";

export default function LandingPanels() {
  useEffect(() => {
    const main = document.getElementById("contenido");
    const header = document.querySelector<HTMLElement>("." + styles.header);
    if (!main || !header) return;
    const panels = Array.from(main.querySelectorAll<HTMLElement>(":scope > section"));
    let frame = 0;
    const updateHeader = () => {
      const line = header.getBoundingClientRect().height / 2;
      const current = panels.filter(panel => {
        const rect = panel.getBoundingClientRect();
        return rect.top <= line && rect.bottom > line;
      }).at(-1);
      header.dataset.theme = current?.id === "plataforma" || current?.id === "planes" ? "light" : "dark";
    };
    const measure = () => {
      for (const panel of panels) panel.style.setProperty("--panel-top", Math.min(0, window.innerHeight - panel.offsetHeight) + "px");
      updateHeader();
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateHeader);
    };
    const observer = new ResizeObserver(measure);
    panels.forEach(panel => observer.observe(panel));
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}
