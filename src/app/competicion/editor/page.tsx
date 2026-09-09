"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import estilos from "../competicion.module.css";
import editor from "./editor.module.css";
import {
  COMPETICION_LAYOUT_STORAGE_KEY,
  DEFAULT_COMPETICION_LAYOUT,
  normalizarLayout,
  type CompeticionLayout,
  type ElementoMovible,
} from "../layoutConfig";

const competiciones = [
  { titulo: "Torneo de Liga", subtitulo: "Primera y Segunda" },
  { titulo: "Clasificación a Copas", subtitulo: "Fase de grupos" },
  { titulo: "Copa Argentina", subtitulo: "Cuartos de final" },
  { titulo: "Copa APA", subtitulo: "En juego" },
  { titulo: "Playoffs de Ascenso", subtitulo: "Próximamente" },
  { titulo: "Copa de Campeones", subtitulo: "Próximamente" },
];

type Seleccion = ElementoMovible | "fondo";

type Arrastre = {
  elemento: ElementoMovible;
  pointerId: number;
  inicioX: number;
  inicioY: number;
  baseX: number;
  baseY: number;
};

function IconoBuscar() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="27" height="27" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="m16 16 4.4 4.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function EditorCompeticion() {
  const [layout, setLayout] = useState<CompeticionLayout>(DEFAULT_COMPETICION_LAYOUT);
  const [seleccion, setSeleccion] = useState<Seleccion>("titulo");
  const [panelOculto, setPanelOculto] = useState(false);
  const [estado, setEstado] = useState("Arrastrá un elemento o usá los controles.");
  const arrastre = useRef<Arrastre | null>(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(COMPETICION_LAYOUT_STORAGE_KEY);
      if (guardado) setLayout(normalizarLayout(JSON.parse(guardado)));
    } catch {
      setLayout(DEFAULT_COMPETICION_LAYOUT);
    }
  }, []);

  useEffect(() => {
    const moverConTeclado = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement | null)?.matches("input, textarea, select")) return;
      if (seleccion === "fondo") return;

      const elemento = seleccion as ElementoMovible;
      const paso = event.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (event.key === "ArrowLeft") dx = -paso;
      if (event.key === "ArrowRight") dx = paso;
      if (event.key === "ArrowUp") dy = -paso;
      if (event.key === "ArrowDown") dy = paso;
      if (!dx && !dy) return;

      event.preventDefault();
      setLayout((actual) => ({
        ...actual,
        [elemento]: {
          ...actual[elemento],
          x: actual[elemento].x + dx,
          y: actual[elemento].y + dy,
        },
      }));
    };

    window.addEventListener("keydown", moverConTeclado);
    return () => window.removeEventListener("keydown", moverConTeclado);
  }, [seleccion]);

  function iniciarArrastre(elemento: ElementoMovible, event: React.PointerEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setSeleccion(elemento);
    event.currentTarget.setPointerCapture(event.pointerId);

    arrastre.current = {
      elemento,
      pointerId: event.pointerId,
      inicioX: event.clientX,
      inicioY: event.clientY,
      baseX: layout[elemento].x,
      baseY: layout[elemento].y,
    };
  }

  function moverArrastre(event: React.PointerEvent<HTMLElement>) {
    const actual = arrastre.current;
    if (!actual || actual.pointerId !== event.pointerId) return;

    const x = Math.round(actual.baseX + event.clientX - actual.inicioX);
    const y = Math.round(actual.baseY + event.clientY - actual.inicioY);

    setLayout((previo) => ({
      ...previo,
      [actual.elemento]: { ...previo[actual.elemento], x, y },
    }));
  }

  function terminarArrastre(event: React.PointerEvent<HTMLElement>) {
    if (arrastre.current?.pointerId === event.pointerId) arrastre.current = null;
  }

  function actualizarXY(elemento: ElementoMovible, eje: "x" | "y", valor: number) {
    setLayout((actual) => ({
      ...actual,
      [elemento]: { ...actual[elemento], [eje]: valor },
    }));
  }

  function guardar() {
    localStorage.setItem(COMPETICION_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    setEstado("Diseño guardado. /competicion ya usa esta posición en este navegador.");
  }

  async function copiar() {
    await navigator.clipboard.writeText(JSON.stringify(layout, null, 2));
    setEstado("Configuración copiada al portapapeles.");
  }

  function restablecer() {
    setLayout(DEFAULT_COMPETICION_LAYOUT);
    localStorage.removeItem(COMPETICION_LAYOUT_STORAGE_KEY);
    setEstado("Diseño restablecido a la posición base.");
  }

  const movible = seleccion === "fondo" ? null : layout[seleccion];

  return (
    <div className={editor.editorPagina}>
      <style>{`
        body > nav { display: none !important; }
        body { margin: 0; background: #102f55; }
      `}</style>

      <span className={editor.indicadorEditor}>Editor visual · Competición</span>

      <main className={estilos.pagina} data-zona="competicion-editor">
        <header className={estilos.header}>
          <div className={estilos.headerInterior}>
            <div className={estilos.marca}>
              <span className={estilos.logoCaja}>
                <Image src="/logo-apa.png" alt="Logo de PSO Argentina" fill priority sizes="64px" className={estilos.logo} />
              </span>
              <span className={estilos.marcaTexto}>
                <span className={estilos.pso}>PSO</span>
                <span className={estilos.argentina}>Argentina</span>
              </span>
            </div>

            <nav className={estilos.navegacion} aria-label="Vista previa de navegación">
              <span className={`${estilos.enlaceNav} ${estilos.enlaceActivo}`}>Competición</span>
              <span className={estilos.enlaceNav}>Clubes</span>
              <span className={estilos.enlaceNav}>Noticias</span>
              <span className={estilos.enlaceNav}>Guía</span>
            </nav>

            <div className={estilos.acciones}>
              <span className={estilos.buscar}><IconoBuscar /></span>
              <span className={estilos.separadorHeader} />
              <span className={estilos.unite}><span>Unite a APA</span><span className={estilos.flecha}>→</span></span>
            </div>
          </div>
        </header>

        <section className={`${estilos.hero} ${seleccion === "fondo" ? editor.fondoSeleccionado : ""}`}>
          <Image
            src="/themes/worldcup/backgrounds/Banderin.png"
            alt="Estadio vacío de Pro Soccer Online visto desde el córner"
            fill
            priority
            sizes="100vw"
            className={estilos.fondo}
            style={{
              objectPosition: `${layout.fondo.x}% ${layout.fondo.y}%`,
              transform: `scale(${layout.fondo.zoom})`,
              transformOrigin: "center",
            }}
          />

          <div className={estilos.velo} aria-hidden="true" />

          <div className={estilos.cabeceraHero}>
            <p
              className={`${estilos.temporada} ${editor.elementoMovible} ${seleccion === "temporada" ? editor.seleccionado : ""}`}
              style={{ transform: `translate(${layout.temporada.x}px, ${layout.temporada.y}px)`, fontSize: layout.temporada.size }}
              onPointerDown={(event) => iniciarArrastre("temporada", event)}
              onPointerMove={moverArrastre}
              onPointerUp={terminarArrastre}
              onPointerCancel={terminarArrastre}
            >
              Temporada 4
            </p>

            <h1
              className={`${estilos.titulo} ${editor.elementoMovible} ${seleccion === "titulo" ? editor.seleccionado : ""}`}
              style={{ transform: `translate(${layout.titulo.x}px, ${layout.titulo.y}px)`, fontSize: layout.titulo.size }}
              onPointerDown={(event) => iniciarArrastre("titulo", event)}
              onPointerMove={moverArrastre}
              onPointerUp={terminarArrastre}
              onPointerCancel={terminarArrastre}
            >
              Competición Oficial
            </h1>

            <div
              className={`${estilos.lineaTitulo} ${editor.elementoMovible} ${seleccion === "linea" ? editor.seleccionado : ""}`}
              style={{ transform: `translate(${layout.linea.x}px, ${layout.linea.y}px)`, width: layout.linea.width }}
              onPointerDown={(event) => iniciarArrastre("linea", event)}
              onPointerMove={moverArrastre}
              onPointerUp={terminarArrastre}
              onPointerCancel={terminarArrastre}
            />
          </div>

          <nav
            className={`${estilos.menuContenedor} ${editor.menuMovible} ${seleccion === "menu" ? editor.seleccionado : ""}`}
            style={{ transform: `translate(${layout.menu.x}px, ${layout.menu.y}px)` }}
            onPointerDown={(event) => iniciarArrastre("menu", event)}
            onPointerMove={moverArrastre}
            onPointerUp={terminarArrastre}
            onPointerCancel={terminarArrastre}
          >
            <ul className={estilos.menu} style={{ minHeight: layout.menu.height }}>
              {competiciones.map((competicion, indice) => (
                <li key={competicion.titulo} className={`${estilos.item} ${indice === 0 ? estilos.itemActivo : ""}`}>
                  <span className={estilos.botonCompeticion}>
                    <span className={estilos.nombreCompeticion}>{competicion.titulo}</span>
                    <span className={estilos.estadoCompeticion}>{competicion.subtitulo}</span>
                    {indice === 0 && <span className={estilos.indicadorActivo} />}
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <footer className={estilos.footer}>
          <div className={estilos.footerInterior}>
            <div className={estilos.footerMarca}><strong>PSO ARGENTINA</strong><span>Liga oficial de Pro Soccer Online</span></div>
            <nav className={estilos.footerNav}><span>Privacidad</span><span>Términos</span><span>Cookies</span><span>Contacto</span></nav>
            <span className={estilos.copyright}>© 2026 APA PSO ARGENTINA</span>
          </div>
        </footer>
      </main>

      <aside className={`${editor.barraEditor} ${panelOculto ? editor.barraEditorOculta : ""}`}>
        {panelOculto ? (
          <button className={editor.botonIcono} type="button" onClick={() => setPanelOculto(false)} title="Mostrar panel">☰</button>
        ) : (
          <div className={editor.panelInterior}>
            <div className={editor.cabeceraPanel}>
              <div>
                <p className={editor.eyebrow}>APA · Herramienta de diseño</p>
                <h2 className={editor.tituloPanel}>Editor visual</h2>
              </div>
              <button className={editor.botonIcono} type="button" onClick={() => setPanelOculto(true)} title="Ocultar panel">×</button>
            </div>

            <p className={editor.ayuda}>Seleccioná un elemento y arrastralo con el mouse. Las flechas mueven 1 px y Shift + flecha mueve 10 px.</p>

            <div className={editor.selectorElementos}>
              {(["titulo", "temporada", "linea", "menu", "fondo"] as Seleccion[]).map((item) => (
                <button key={item} type="button" className={seleccion === item ? editor.activo : ""} onClick={() => setSeleccion(item)}>
                  {item === "titulo" ? "Título" : item === "temporada" ? "Temporada" : item === "linea" ? "Línea" : item === "menu" ? "Menú" : "Fondo"}
                </button>
              ))}
            </div>

            {movible && (
              <div className={editor.grupoControles}>
                <span className={editor.etiquetaGrupo}>Posición</span>
                <div className={editor.filaControl}>
                  <label>X</label>
                  <input type="range" min={-500} max={500} value={movible.x} onChange={(e) => actualizarXY(seleccion as ElementoMovible, "x", Number(e.target.value))} />
                  <input type="number" value={movible.x} onChange={(e) => actualizarXY(seleccion as ElementoMovible, "x", Number(e.target.value))} />
                </div>
                <div className={editor.filaControl}>
                  <label>Y</label>
                  <input type="range" min={-300} max={300} value={movible.y} onChange={(e) => actualizarXY(seleccion as ElementoMovible, "y", Number(e.target.value))} />
                  <input type="number" value={movible.y} onChange={(e) => actualizarXY(seleccion as ElementoMovible, "y", Number(e.target.value))} />
                </div>
              </div>
            )}

            {seleccion === "titulo" && (
              <div className={editor.grupoControles}>
                <span className={editor.etiquetaGrupo}>Título</span>
                <div className={editor.filaControl}><label>Tamaño</label><input type="range" min={36} max={92} value={layout.titulo.size} onChange={(e) => setLayout((a) => ({ ...a, titulo: { ...a.titulo, size: Number(e.target.value) } }))} /><input type="number" value={layout.titulo.size} onChange={(e) => setLayout((a) => ({ ...a, titulo: { ...a.titulo, size: Number(e.target.value) } }))} /></div>
              </div>
            )}

            {seleccion === "temporada" && (
              <div className={editor.grupoControles}>
                <span className={editor.etiquetaGrupo}>Temporada</span>
                <div className={editor.filaControl}><label>Tamaño</label><input type="range" min={10} max={32} value={layout.temporada.size} onChange={(e) => setLayout((a) => ({ ...a, temporada: { ...a.temporada, size: Number(e.target.value) } }))} /><input type="number" value={layout.temporada.size} onChange={(e) => setLayout((a) => ({ ...a, temporada: { ...a.temporada, size: Number(e.target.value) } }))} /></div>
              </div>
            )}

            {seleccion === "linea" && (
              <div className={editor.grupoControles}>
                <span className={editor.etiquetaGrupo}>Línea celeste</span>
                <div className={editor.filaControl}><label>Ancho</label><input type="range" min={40} max={190} value={layout.linea.width} onChange={(e) => setLayout((a) => ({ ...a, linea: { ...a.linea, width: Number(e.target.value) } }))} /><input type="number" value={layout.linea.width} onChange={(e) => setLayout((a) => ({ ...a, linea: { ...a.linea, width: Number(e.target.value) } }))} /></div>
              </div>
            )}

            {seleccion === "menu" && (
              <div className={editor.grupoControles}>
                <span className={editor.etiquetaGrupo}>Menú inferior</span>
                <div className={editor.filaControl}><label>Alto</label><input type="range" min={84} max={190} value={layout.menu.height} onChange={(e) => setLayout((a) => ({ ...a, menu: { ...a.menu, height: Number(e.target.value) } }))} /><input type="number" value={layout.menu.height} onChange={(e) => setLayout((a) => ({ ...a, menu: { ...a.menu, height: Number(e.target.value) } }))} /></div>
              </div>
            )}

            {seleccion === "fondo" && (
              <div className={editor.grupoControles}>
                <span className={editor.etiquetaGrupo}>Encuadre del estadio</span>
                <div className={editor.filaControl}><label>Horizontal</label><input type="range" min={0} max={100} value={layout.fondo.x} onChange={(e) => setLayout((a) => ({ ...a, fondo: { ...a.fondo, x: Number(e.target.value) } }))} /><input type="number" value={layout.fondo.x} onChange={(e) => setLayout((a) => ({ ...a, fondo: { ...a.fondo, x: Number(e.target.value) } }))} /></div>
                <div className={editor.filaControl}><label>Vertical</label><input type="range" min={0} max={100} value={layout.fondo.y} onChange={(e) => setLayout((a) => ({ ...a, fondo: { ...a.fondo, y: Number(e.target.value) } }))} /><input type="number" value={layout.fondo.y} onChange={(e) => setLayout((a) => ({ ...a, fondo: { ...a.fondo, y: Number(e.target.value) } }))} /></div>
                <div className={editor.filaControl}><label>Zoom</label><input type="range" min={1} max={1.4} step={0.01} value={layout.fondo.zoom} onChange={(e) => setLayout((a) => ({ ...a, fondo: { ...a.fondo, zoom: Number(e.target.value) } }))} /><input type="number" min={1} max={1.4} step={0.01} value={layout.fondo.zoom} onChange={(e) => setLayout((a) => ({ ...a, fondo: { ...a.fondo, zoom: Number(e.target.value) } }))} /></div>
              </div>
            )}

            <div className={editor.accionesPanel}>
              <button className={editor.primario} type="button" onClick={guardar}>Guardar diseño</button>
              <a href="/competicion" target="_blank" rel="noreferrer">Ver resultado</a>
              <button type="button" onClick={copiar}>Copiar config</button>
              <button type="button" onClick={restablecer}>Restablecer</button>
            </div>

            <p className={editor.estadoGuardado}>{estado}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
