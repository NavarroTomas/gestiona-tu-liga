"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import estilos from "./APAFooter.module.css";

const columnas = [
  {
    titulo: "Competición",
    enlaces: [
      ["Torneos", "/competicion"],
      ["Fixture", "/fixture"],
      ["Historia", "/historia"],
    ],
  },
  {
    titulo: "Clubes",
    enlaces: [
      ["Clubes", "/clubes"],
      ["Plantillas", "/plantillas"],
      ["Jugadores", "/jugadores"],
    ],
  },
  {
    titulo: "APA",
    enlaces: [
      ["Guía", "/guia"],
      ["Mercado", "/mercado"],
      ["Entretenimiento", "/entretenimiento"],
    ],
  },
] as const;

export default function APAFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className={estilos.footer}>
      <div className={estilos.decoracion} aria-hidden="true" />

      <div className={estilos.interior}>
        <div className={estilos.principal}>
          <Link href="/" className={estilos.marca} aria-label="PSO Argentina - Inicio">
            <span className={estilos.logoCaja}>
              <Image
                src="/logo-apa-oficial.webp"
                alt="Logo PSO Argentina"
                fill
                sizes="58px"
                className={estilos.logo}
              />
            </span>

            <span className={estilos.marcaTexto}>
              <strong>PSO</strong>
              <small>Argentina</small>
            </span>
          </Link>

          <p className={estilos.lema}>El fútbol nos une.</p>
        </div>

        <nav className={estilos.columnas} aria-label="Navegación del pie de página">
          {columnas.map((columna) => (
            <div key={columna.titulo} className={estilos.columna}>
              <h2>{columna.titulo}</h2>
              <div className={estilos.lista}>
                {columna.enlaces.map(([label, href]) => (
                  <Link key={href} href={href}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className={estilos.base}>
        <div className={estilos.baseInterior}>
          <span>© {new Date().getFullYear()} APA PSO Argentina</span>
          <span className={estilos.punto} aria-hidden="true" />
          <span>Pro Soccer Online Argentina</span>
        </div>
      </div>
    </footer>
  );
}
