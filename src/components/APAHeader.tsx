"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import estilos from "./APAHeader.module.css";

function IconoBuscar() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.4" stroke="currentColor" strokeWidth="2" />
      <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconoDiscord() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.3 5.34A17.16 17.16 0 0 0 15.11 4l-.51 1.03a15.6 15.6 0 0 0-5.2 0L8.88 4A17.5 17.5 0 0 0 4.7 5.34C2.05 9.23 1.33 13.02 1.69 16.75a17.1 17.1 0 0 0 5.13 2.58l1.24-1.69a10.9 10.9 0 0 1-1.95-.93l.48-.37c3.76 1.72 7.84 1.72 11.55 0l.49.37c-.63.37-1.29.68-1.96.93l1.24 1.69a17.08 17.08 0 0 0 5.12-2.58c.42-4.32-.72-8.08-3.73-11.41ZM8.7 14.48c-1.13 0-2.06-1.03-2.06-2.29 0-1.27.91-2.3 2.06-2.3s2.08 1.04 2.06 2.3c0 1.26-.91 2.29-2.06 2.29Zm6.6 0c-1.13 0-2.06-1.03-2.06-2.29 0-1.27.91-2.3 2.06-2.3 1.16 0 2.08 1.04 2.06 2.3 0 1.26-.9 2.29-2.06 2.29Z" />
    </svg>
  );
}

function IconoX() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 4.5 18.7 19.5M19 4.5 5.3 19.5" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" />
    </svg>
  );
}

function IconoInstagram() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function IconoYoutube() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.2 7.25a2.7 2.7 0 0 0-1.9-1.91C17.62 4.88 12 4.88 12 4.88s-5.62 0-7.3.46a2.7 2.7 0 0 0-1.9 1.91C2.35 8.94 2.35 12 2.35 12s0 3.06.45 4.75a2.7 2.7 0 0 0 1.9 1.91c1.68.46 7.3.46 7.3.46s5.62 0 7.3-.46a2.7 2.7 0 0 0 1.9-1.91c.45-1.69.45-4.75.45-4.75s0-3.06-.45-4.75ZM10.1 15.15v-6.3L15.55 12l-5.45 3.15Z" />
    </svg>
  );
}

function seccionActiva(pathname: string, seccion: "competicion" | "clubes" | "noticias" | "guia") {
  if (seccion === "competicion") {
    return ["/competicion", "/divisiones", "/fixture", "/estadisticas", "/historia"].some((ruta) =>
      pathname.startsWith(ruta),
    );
  }

  if (seccion === "clubes") {
    return ["/clubes", "/plantillas", "/mercado", "/jugadores", "/equipos"].some((ruta) =>
      pathname.startsWith(ruta),
    );
  }

  return pathname.startsWith(`/${seccion}`);
}

export default function APAHeader() {
  const pathname = usePathname();

  return (
    <header className={estilos.header}>
      <div className={estilos.interior}>
        <Link className={estilos.marca} href="/" aria-label="PSO Argentina - Inicio">
          <span className={estilos.logoCaja}>
            <Image
              src="/logo-apa.png"
              alt="Logo PSO Argentina"
              fill
              priority
              sizes="64px"
              className={estilos.logo}
            />
          </span>

          <span className={estilos.marcaTexto}>
            <strong>PSO</strong>
            <small>Argentina</small>
          </span>
        </Link>

        <nav className={estilos.navegacion} aria-label="Navegación principal">
          <Link
            className={`${estilos.enlace} ${seccionActiva(pathname, "competicion") ? estilos.activo : ""}`}
            href="/competicion"
          >
            Competición
          </Link>
          <Link
            className={`${estilos.enlace} ${seccionActiva(pathname, "clubes") ? estilos.activo : ""}`}
            href="/clubes"
          >
            Clubes
          </Link>
          <Link
            className={`${estilos.enlace} ${seccionActiva(pathname, "noticias") ? estilos.activo : ""}`}
            href="/noticias"
          >
            Noticias
          </Link>
          <Link
            className={`${estilos.enlace} ${seccionActiva(pathname, "guia") ? estilos.activo : ""}`}
            href="/guia"
          >
            Guía
          </Link>
        </nav>

        <div className={estilos.acciones}>
          <button className={estilos.icono} type="button" aria-label="Buscar">
            <IconoBuscar />
          </button>

          <span className={estilos.separador} aria-hidden="true" />

          <div className={estilos.redes} aria-label="Redes sociales">
            <button className={estilos.iconoRed} type="button" aria-label="Discord"><IconoDiscord /></button>
            <button className={estilos.iconoRed} type="button" aria-label="X"><IconoX /></button>
            <button className={estilos.iconoRed} type="button" aria-label="Instagram"><IconoInstagram /></button>
            <button className={estilos.iconoRed} type="button" aria-label="YouTube"><IconoYoutube /></button>
          </div>

          <span className={`${estilos.separador} ${estilos.separadorFinal}`} aria-hidden="true" />

          <button className={estilos.unite} type="button">
            <span>Unite a APA</span>
            <span className={estilos.flecha} aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </header>
  );
}
