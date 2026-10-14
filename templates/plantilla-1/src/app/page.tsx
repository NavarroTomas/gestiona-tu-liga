import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import LandingSectionLink from "@/components/LandingSectionLink";
import LandingPanels from "@/components/LandingPanels";
import LandingCarousel from "@/components/LandingCarousel";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: { absolute: "Gestioná tu Liga" },
  description: "Creá y administrá tu liga por equipos o por jugadores. Partidos, noticias y estadísticas en un mismo lugar.",
};

export default function LandingPage() {
  return <div className={styles.landing}>
    <LandingPanels />
    <LandingSectionLink className={styles.skip} target="contenido">Ir al contenido</LandingSectionLink>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>Gestioná tu Liga</Link>
      <nav aria-label="Navegación principal"><LandingSectionLink target="plataforma">Plataforma</LandingSectionLink><LandingSectionLink target="modalidades">Modalidades</LandingSectionLink><LandingSectionLink target="planes">Planes</LandingSectionLink></nav>
      <Link href="/login" prefetch={false} className={styles.login}>Iniciar sesión</Link>
    </header>
    <main id="contenido" className={styles.stack}>
      <LandingCarousel />
      <section id="plataforma" className={styles.platform}>
        <div className={styles.content}>
          <div className={styles.visualColumn}><h2>Tu liga,<br />organizada.</h2><div className={styles.sectionImage}><Image src="/themes/worldcup-real/photos/street-football.jpg" alt="Un partido de fútbol visto desde las tribunas" fill sizes="(max-width: 620px) 90vw, 42vw" /></div></div>
          <div className={styles.description}><p>Creá tu liga, organizá los partidos y seguí los resultados y las estadísticas desde una misma web.</p><p>Para torneos por equipos o partidos entre amigos.</p><Link href="/liga" prefetch={false} className={styles.buttonDark}>Ver la liga de referencia</Link></div>
        </div>
      </section>
      <section id="modalidades" className={styles.modes}>
        <div className={styles.content}>
          <div className={styles.visualColumn}><h2>Como ustedes<br />juegan.</h2><div className={styles.sectionImage}><Image src="/themes/worldcup-real/photos/pitch-lights.jpg" alt="Un jugador frente a un arco en una cancha iluminada" fill sizes="(max-width: 620px) 90vw, 42vw" /></div></div>
          <div className={styles.modeList}><article><h3>Por equipos</h3><p>Organizá planteles, partidos y posiciones de tu torneo.</p></article><article><h3>Por jugadores</h3><p>Registrá los partidos de tus amigos y sus estadísticas, aunque los equipos cambien.</p></article><Link href="/registro" prefetch={false} className={styles.button}>Crear mi liga</Link></div>
        </div>
      </section>
      <section id="planes" className={styles.plans}>
        <div className={styles.plansContent}><h2>Un plan para tu liga.</h2>
          <div className={styles.planColumns}>
            <article><h3>Gratuita</h3><p>Para tu grupo de amigos o una liga pequeña.</p><ul><li>Partidos y resultados.</li><li>Posiciones y estadísticas básicas.</li><li>Límite de equipos y miembros.</li></ul><Link href="/registro" prefetch={false} className={styles.buttonDark}>Empezar gratis</Link></article>
            <article><h3>Completa</h3><p>Para administrar toda tu competencia.</p><ul><li>Todo lo de la versión gratuita.</li><li>Torneos, copas y planteles.</li><li>Noticias y estadísticas detalladas.</li></ul><LandingSectionLink target="plataforma" className={styles.buttonOutline}>Conocer la plataforma</LandingSectionLink></article>
          </div><p className={styles.note}>Planes en desarrollo. Límites y precio por definir.</p>
        </div>
      </section>
      <section className={styles.close}><div className={styles.content}><h2>Ejemplo</h2><div className={styles.closeActions}><Link href="/registro" prefetch={false} className={styles.button}>Crear mi liga</Link><Link href="/login" prefetch={false} className={styles.link}>Ya tengo una cuenta</Link></div></div><footer className={styles.footer}><span>Gestioná tu Liga</span><LandingSectionLink target="contenido">Volver al inicio</LandingSectionLink></footer></section>
    </main>
  </div>;
}
