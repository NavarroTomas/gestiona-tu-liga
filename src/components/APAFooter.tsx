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
      ["Premios APA", "/entretenimiento/premios"],
    ],
  },
  {
    titulo: "Clubes",
    enlaces: [
      ["Clubes", "/clubes"],
      ["Plantillas", "/plantillas"],
      ["Jugadores", "/jugadores"],
      ["Mercado", "/mercado"],
    ],
  },
  {
    titulo: "APA",
    enlaces: [
      ["Guía", "/guia"],
      ["Noticias", "/noticias"],
      ["Entretenimiento", "/entretenimiento"],
      ["Inicio", "/"],
    ],
  },
  {
    titulo: "Legal",
    enlaces: [
      ["Política de privacidad", "/legal/privacidad"],
      ["Términos de uso", "/legal/terminos"],
      ["Política de cookies", "/legal/cookies"],
      ["Aviso legal", "/legal/aviso-legal"],
      ["Reglas de conducta", "/legal/conducta"],
      ["Contacto", "/legal/contacto"],
    ],
  },
] as const;

export default function APAFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className={estilos.footer}>
      <div className={estilos.decoracion} aria-hidden="true" />

      <div className={estilos.superior}>
        <div className={estilos.marcaBloque}>
          <Link href="/" className={estilos.marca} aria-label="PSO Argentina - Inicio">
            <span className={estilos.logoCaja}>
              <Image
                src="/logo-apa-oficial.webp"
                alt="Logo PSO Argentina"
                fill
                sizes="84px"
                className={estilos.logo}
              />
            </span>

            <span className={estilos.marcaTexto}>
              <strong>PSO</strong>
              <small>Argentina</small>
            </span>
          </Link>

          <div className={estilos.identidad}>
            <span>APA PSO Argentina</span>
            <strong>Competición oficial de Pro Soccer Online.</strong>
          </div>
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
          <div className={estilos.legalesBase}>
            <Link href="/legal/privacidad">Privacidad</Link>
            <Link href="/legal/terminos">Términos</Link>
            <Link href="/legal/cookies">Cookies</Link>
            <Link href="/legal/aviso-legal">Aviso legal</Link>
            <Link href="/legal/conducta">Conducta</Link>
            <Link href="/legal/contacto">Contacto</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
