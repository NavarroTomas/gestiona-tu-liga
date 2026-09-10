import Image from "next/image";
import { COMPETITION_LANDING_CONFIG } from "@/config/competitions";
import AplicarLayoutGuardado from "./AplicarLayoutGuardado";
import SelectorCompeticiones from "./SelectorCompeticiones";
import estilos from "./competicion.module.css";

export default function PaginaCompeticion() {
  const config = COMPETITION_LANDING_CONFIG;

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
            src={config.heroImage}
            alt={config.heroAlt}
            fill
            priority
            sizes="100vw"
            className={estilos.fondo}
            data-layout="fondo"
          />

          <div className={estilos.velo} aria-hidden="true" />

          <div className={estilos.cabeceraHero}>
            <p className={estilos.temporada} data-layout="temporada">{config.temporada}</p>
            <h1 className={estilos.titulo} id="titulo-competicion" data-layout="titulo">{config.titulo}</h1>
            <div className={estilos.lineaTitulo} data-layout="linea" aria-hidden="true" />
          </div>

          <nav className={estilos.menuContenedor} data-layout="menu" aria-label="Competiciones de la temporada">
            <SelectorCompeticiones />
          </nav>
        </section>

        <footer className={estilos.footer}>
          <div className={estilos.footerInterior}>
            <div className={estilos.footerMarca}>
              <strong>{config.footer.marca}</strong>
              <span>{config.footer.descripcion}</span>
            </div>

            <nav className={estilos.footerNav} aria-label="Enlaces del pie de página">
              {config.footer.enlaces.map((enlace) => (
                <a key={enlace.label} href={enlace.href}>{enlace.label}</a>
              ))}
            </nav>

            <span className={estilos.copyright}>{config.footer.copyright}</span>
          </div>
        </footer>
      </main>
    </>
  );
}
