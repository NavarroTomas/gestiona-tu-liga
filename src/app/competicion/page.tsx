import Image from "next/image";
import estilos from "./competicion.module.css";

const competiciones = [
  { titulo: "Torneo de Liga", subtitulo: "Primera y Segunda" },
  { titulo: "Clasificación a Copas", subtitulo: "Fase de grupos" },
  { titulo: "Copa Argentina", subtitulo: "Cuartos de final" },
  { titulo: "Copa APA", subtitulo: "En juego" },
  { titulo: "Playoffs de Ascenso", subtitulo: "Próximamente" },
  { titulo: "Copa de Campeones", subtitulo: "Próximamente" },
];

function IconoBuscar() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="27" height="27" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="m16 16 4.4 4.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function PaginaCompeticion() {
  return (
    <>
      <style>{`
        body:has(main[data-zona="competicion"]) > nav {
          display: none !important;
        }

        body:has(main[data-zona="competicion"]) {
          margin: 0;
          background: #102f55;
        }
      `}</style>

      <main className={estilos.pagina} data-zona="competicion">
        <header className={estilos.header}>
          <div className={estilos.headerInterior}>
            <a className={estilos.marca} href="/" aria-label="PSO Argentina - Inicio">
              <span className={estilos.logoCaja}>
                <Image
                  src="/logo-apa.png"
                  alt="Logo de PSO Argentina"
                  fill
                  priority
                  sizes="87px"
                  className={estilos.logo}
                />
              </span>

              <span className={estilos.marcaTexto}>
                <span className={estilos.pso}>PSO</span>
                <span className={estilos.argentina}>Argentina</span>
              </span>
            </a>

            <nav className={estilos.navegacion} aria-label="Navegación principal">
              <a className={`${estilos.enlaceNav} ${estilos.enlaceActivo}`} href="/competicion">
                Competición
              </a>
              <a className={estilos.enlaceNav} href="/clubes">Clubes</a>
              <a className={estilos.enlaceNav} href="/noticias">Noticias</a>
              <a className={estilos.enlaceNav} href="/guia">Guía</a>
            </nav>

            <div className={estilos.acciones} aria-label="Acciones del sitio">
              <button className={estilos.buscar} type="button" aria-label="Buscar">
                <IconoBuscar />
              </button>

              <span className={estilos.separadorHeader} aria-hidden="true" />

              <button className={estilos.unite} type="button">
                <span>Unite a APA</span>
                <span className={estilos.flecha} aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </header>

        <section className={estilos.hero} aria-labelledby="titulo-competicion">
          <Image
            src="/themes/worldcup/backgrounds/Banderin.png"
            alt="Estadio vacío de Pro Soccer Online visto desde el córner"
            fill
            priority
            sizes="100vw"
            className={estilos.fondo}
          />

          <div className={estilos.velo} aria-hidden="true" />

          <div className={estilos.cabeceraHero}>
            <p className={estilos.temporada}>Temporada 4</p>
            <h1 className={estilos.titulo} id="titulo-competicion">Competición Oficial</h1>
            <div className={estilos.lineaTitulo} aria-hidden="true" />
          </div>

          <nav className={estilos.menuContenedor} aria-label="Competiciones de la temporada">
            <ul className={estilos.menu}>
              {competiciones.map((competicion, indice) => (
                <li
                  key={competicion.titulo}
                  className={`${estilos.item} ${indice === 0 ? estilos.itemActivo : ""}`}
                >
                  <button className={estilos.botonCompeticion} type="button" tabIndex={-1}>
                    <span className={estilos.nombreCompeticion}>{competicion.titulo}</span>
                    <span className={estilos.estadoCompeticion}>{competicion.subtitulo}</span>
                    {indice === 0 && <span className={estilos.indicadorActivo} aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </section>
      </main>
    </>
  );
}
