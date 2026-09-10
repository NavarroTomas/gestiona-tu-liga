import Image from "next/image";
import AplicarLayoutGuardado from "./AplicarLayoutGuardado";
import SelectorCompeticiones from "./SelectorCompeticiones";
import estilos from "./competicion.module.css";

export default function PaginaCompeticion() {
  return (
    <>
      <style>{`
        body:has(main[data-zona="competicion"]) {
          margin: 0;
          background: #102f55;
        }
      `}</style>

      <AplicarLayoutGuardado />

      <main className={estilos.pagina} data-zona="competicion">
        <section className={estilos.hero} aria-labelledby="titulo-competicion">
          <Image
            src="/images/competicion/fondo_principal.png"
            alt="Estadio vacío de Pro Soccer Online visto desde el córner"
            fill
            priority
            sizes="100vw"
            className={estilos.fondo}
            data-layout="fondo"
          />

          <div className={estilos.velo} aria-hidden="true" />

          <div className={estilos.cabeceraHero}>
            <p className={estilos.temporada} data-layout="temporada">Temporada 4</p>
            <h1 className={estilos.titulo} id="titulo-competicion" data-layout="titulo">Competición Oficial</h1>
            <div className={estilos.lineaTitulo} data-layout="linea" aria-hidden="true" />
          </div>

          <nav className={estilos.menuContenedor} data-layout="menu" aria-label="Competiciones de la temporada">
            <SelectorCompeticiones />
          </nav>
        </section>

        <footer className={estilos.footer}>
          <div className={estilos.footerInterior}>
            <div className={estilos.footerMarca}>
              <strong>PSO ARGENTINA</strong>
              <span>Liga oficial de Pro Soccer Online</span>
            </div>

            <nav className={estilos.footerNav} aria-label="Enlaces del pie de página">
              <a href="/privacidad">Privacidad</a>
              <a href="/terminos">Términos</a>
              <a href="/cookies">Cookies</a>
              <a href="/contacto">Contacto</a>
            </nav>

            <span className={estilos.copyright}>© 2026 APA PSO ARGENTINA</span>
          </div>
        </footer>
      </main>
    </>
  );
}
