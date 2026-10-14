"use client";
import { displayLabel } from "@/lib/displayLabels";


import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import estilos from "./APAFooter.module.css";
import {getActiveLocalLeague,getLocalLeagueSummary} from "@/lib/localLeagueClient";

const columnas = [
  {
    titulo: "Competición",
    enlaces: [
      ["Torneos", "/competicion"],
      ["Fixture", "/fixture"],
      ["Historia", "/historia"],
      ["Premios Liga", "/entretenimiento/premios"],
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
    titulo: "Liga",
    enlaces: [
      ["Guía", "/guia"],
      ["Entretenimiento", "/entretenimiento"],
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

  function volverArriba() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const localLeague=getActiveLocalLeague();
  if(localLeague){
    let season="";try{season=getLocalLeagueSummary(localLeague.id).season;}catch{}
    return <footer className={estilos.leagueFooter}><div className={estilos.leagueFooterGrid}><div className={estilos.footerIdentity}><Link href="/liga">{localLeague.name}</Link><p>{displayLabel(season)}{displayLabel(season?" · ":"")}{localLeague.mode==="teams"?"Liga por equipos":"Liga por jugadores"}</p><p>Resultados, calendario y novedades de tu competencia.</p></div><nav aria-label="La liga"><h2>La liga</h2><Link href="/liga">Inicio</Link><Link href="/fixture">Partidos</Link><Link href="/divisiones">Posiciones</Link><Link href="/clubes">Equipos</Link><Link href="/jugadores">Jugadores</Link></nav><nav aria-label="Gestión de la liga"><h2>Gestión</h2><Link href="/admin">Panel de administración</Link><Link href="/admin/torneos">Torneos</Link><Link href="/admin/plantillas">Planteles</Link><Link href="/admin/noticias">Publicar noticias</Link></nav><nav aria-label="La plataforma"><h2>La plataforma</h2><Link href="/mis-ligas">Mis ligas</Link><Link href="/">Gestioná tu Liga</Link><Link href="/#planes">Planes</Link><button type="button" onClick={volverArriba}>Volver arriba</button></nav></div><div className={estilos.footerBase}><span>Gestioná tu Liga · {new Date().getFullYear()}</span><p>Versión de prueba. Los cambios se guardan en este navegador.</p></div></footer>;
  }
  return (
    <footer className={estilos.footer}>
      <div className={estilos.decoracion} aria-hidden="true" />

      <div className={estilos.superior}>
        <div className={estilos.marcaBloque}>
          <button
            type="button"
            className={estilos.marca}
            aria-label="Volver arriba"
            onClick={volverArriba}
          >
            <span className={estilos.logoCaja}>
              <Image
                src="/logo-apa-oficial.webp"
                alt="Logo Gestioná tu Liga"
                fill
                sizes="84px"
                className={estilos.logo}
              />
            </span>

            <span className={estilos.marcaTexto}>
              <strong>PSO</strong>
              <small>Argentina</small>
            </span>
          </button>

          <div className={estilos.identidad}>
            <span>Gestioná tu Liga</span>
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
          <span>© {new Date().getFullYear()} Gestioná tu Liga</span>
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
