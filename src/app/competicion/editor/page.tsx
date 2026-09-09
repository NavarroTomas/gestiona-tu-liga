"use client";

import { useEffect, useRef, useState } from "react";
import {
  COMPETICION_LAYOUT_STORAGE_KEY,
  type CompeticionLayout,
  type ElementoMovible,
} from "../layoutConfig";

type Seleccion = ElementoMovible | "fondo";

type Arrastre = {
  elemento: Seleccion;
  inicioX: number;
  inicioY: number;
  baseX: number;
  baseY: number;
  ancho: number;
  alto: number;
};

function numero(valor: string | null | undefined, fallback: number) {
  const parsed = Number.parseFloat(valor ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

function porcentaje(valor: string | undefined, fallback: number) {
  if (!valor) return fallback;
  const match = valor.match(/(-?\d+(?:\.\d+)?)%/);
  return match ? numero(match[1], fallback) : fallback;
}

function leerLayoutDesdePagina(doc: Document): CompeticionLayout {
  const temporada = doc.querySelector<HTMLElement>('[data-layout="temporada"]');
  const titulo = doc.querySelector<HTMLElement>('[data-layout="titulo"]');
  const linea = doc.querySelector<HTMLElement>('[data-layout="linea"]');
  const menu = doc.querySelector<HTMLElement>('[data-layout="menu"]');
  const fondo = doc.querySelector<HTMLElement>('[data-layout="fondo"]');

  const estiloTemporada = temporada ? doc.defaultView?.getComputedStyle(temporada) : null;
  const estiloTitulo = titulo ? doc.defaultView?.getComputedStyle(titulo) : null;
  const estiloFondo = fondo ? doc.defaultView?.getComputedStyle(fondo) : null;

  const posicionFondo = (estiloFondo?.objectPosition || "50% 50%")
    .trim()
    .split(/\s+/);

  return {
    temporada: {
      x: 0,
      y: 0,
      size: Math.round(numero(estiloTemporada?.fontSize, 20)),
    },
    titulo: {
      x: 0,
      y: 0,
      size: Math.round(numero(estiloTitulo?.fontSize, 64)),
    },
    linea: {
      x: 0,
      y: 0,
      width: Math.round(linea?.getBoundingClientRect().width || 94),
    },
    menu: {
      x: 0,
      y: 0,
      height: Math.round(
        menu?.querySelector<HTMLElement>("ul")?.getBoundingClientRect().height || 124,
      ),
    },
    fondo: {
      x: porcentaje(posicionFondo[0], 50),
      y: porcentaje(posicionFondo[1], 50),
      zoom: 1,
    },
  };
}

export default function EditorCompeticion() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const layoutRef = useRef<CompeticionLayout | null>(null);
  const arrastreRef = useRef<Arrastre | null>(null);

  const [layout, setLayout] = useState<CompeticionLayout | null>(null);
  const [seleccion, setSeleccion] = useState<Seleccion>("titulo");
  const [version, setVersion] = useState(1);
  const [estado, setEstado] = useState(
    "Cargando la versión actual de /competicion…",
  );

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  function documento() {
    return iframeRef.current?.contentDocument ?? null;
  }

  function aplicar(actual: CompeticionLayout) {
    const doc = documento();
    if (!doc) return;

    const temporada = doc.querySelector<HTMLElement>('[data-layout="temporada"]');
    const titulo = doc.querySelector<HTMLElement>('[data-layout="titulo"]');
    const linea = doc.querySelector<HTMLElement>('[data-layout="linea"]');
    const menu = doc.querySelector<HTMLElement>('[data-layout="menu"]');
    const fondo = doc.querySelector<HTMLElement>('[data-layout="fondo"]');

    if (temporada) {
      temporada.style.transform = `translate(${actual.temporada.x}px, ${actual.temporada.y}px)`;
      temporada.style.fontSize = `${actual.temporada.size}px`;
    }

    if (titulo) {
      titulo.style.transform = `translate(${actual.titulo.x}px, ${actual.titulo.y}px)`;
      titulo.style.fontSize = `${actual.titulo.size}px`;
    }

    if (linea) {
      linea.style.transform = `translate(${actual.linea.x}px, ${actual.linea.y}px)`;
      linea.style.width = `${actual.linea.width}px`;
    }

    if (menu) {
      menu.style.transform = `translate(${actual.menu.x}px, ${actual.menu.y}px)`;
      const lista = menu.querySelector<HTMLElement>("ul");
      if (lista) lista.style.minHeight = `${actual.menu.height}px`;
    }

    if (fondo) {
      fondo.style.objectPosition = `${actual.fondo.x}% ${actual.fondo.y}%`;
      fondo.style.transform = `scale(${actual.fondo.zoom})`;
      fondo.style.transformOrigin = "center";
    }
  }

  function resaltar(elemento: Seleccion) {
    const doc = documento();
    if (!doc) return;

    doc.querySelectorAll<HTMLElement>("[data-layout]").forEach((nodo) => {
      nodo.style.outline = "";
      nodo.style.outlineOffset = "";
    });

    const nodo = doc.querySelector<HTMLElement>(`[data-layout="${elemento}"]`);
    if (nodo) {
      nodo.style.outline = "2px dashed #56afe2";
      nodo.style.outlineOffset = "4px";
    }
  }

  useEffect(() => {
    if (!layout) return;
    aplicar(layout);
  }, [layout]);

  useEffect(() => {
    resaltar(seleccion);
  }, [seleccion, version]);

  function prepararPagina() {
    const doc = documento();
    if (!doc) return;

    const base = leerLayoutDesdePagina(doc);
    setLayout(base);
    layoutRef.current = base;
    setSeleccion("titulo");
    setEstado(
      "Sincronizado con el código actual. Si cambiás TSX/CSS/imagen y recargás, el editor vuelve a leer la página real.",
    );

    const elementos: Seleccion[] = ["temporada", "titulo", "linea", "menu", "fondo"];

    elementos.forEach((nombre) => {
      const nodo = doc.querySelector<HTMLElement>(`[data-layout="${nombre}"]`);
      if (!nodo) return;

      nodo.style.cursor = "move";
      nodo.style.userSelect = "none";

      nodo.addEventListener(
        "pointerdown",
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          const actual = layoutRef.current;
          if (!actual) return;

          setSeleccion(nombre);
          resaltar(nombre);

          const hero = doc.querySelector<HTMLElement>("section");
          const rect = hero?.getBoundingClientRect();

          const baseXY =
            nombre === "fondo"
              ? actual.fondo
              : actual[nombre as ElementoMovible];

          arrastreRef.current = {
            elemento: nombre,
            inicioX: event.clientX,
            inicioY: event.clientY,
            baseX: baseXY.x,
            baseY: baseXY.y,
            ancho: Math.max(rect?.width || 1, 1),
            alto: Math.max(rect?.height || 1, 1),
          };

          nodo.setPointerCapture?.(event.pointerId);
        },
        true,
      );

      if (nombre === "menu") {
        nodo.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopPropagation();
          },
          true,
        );
      }
    });

    doc.addEventListener("pointermove", (event) => {
      const drag = arrastreRef.current;
      const actual = layoutRef.current;
      if (!drag || !actual) return;

      const dx = event.clientX - drag.inicioX;
      const dy = event.clientY - drag.inicioY;

      if (drag.elemento === "fondo") {
        setLayout((previo) => {
          if (!previo) return previo;
          return {
            ...previo,
            fondo: {
              ...previo.fondo,
              x: Math.max(0, Math.min(100, drag.baseX + (dx / drag.ancho) * 100)),
              y: Math.max(0, Math.min(100, drag.baseY + (dy / drag.alto) * 100)),
            },
          };
        });
        return;
      }

      const elemento = drag.elemento as ElementoMovible;
      setLayout((previo) => {
        if (!previo) return previo;
        return {
          ...previo,
          [elemento]: {
            ...previo[elemento],
            x: Math.round(drag.baseX + dx),
            y: Math.round(drag.baseY + dy),
          },
        };
      });
    });

    doc.addEventListener("pointerup", () => {
      arrastreRef.current = null;
    });

    doc.addEventListener("pointercancel", () => {
      arrastreRef.current = null;
    });

    setTimeout(() => resaltar("titulo"), 0);
  }

  useEffect(() => {
    function moverConTeclado(event: KeyboardEvent) {
      if (!layoutRef.current) return;
      if ((event.target as HTMLElement | null)?.matches("input, textarea, select")) return;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;

      event.preventDefault();
      const paso = event.shiftKey ? 10 : 1;

      if (seleccion === "fondo") {
        setLayout((actual) => {
          if (!actual) return actual;
          return {
            ...actual,
            fondo: {
              ...actual.fondo,
              x: Math.max(0, Math.min(100, actual.fondo.x + (event.key === "ArrowLeft" ? -paso : event.key === "ArrowRight" ? paso : 0))),
              y: Math.max(0, Math.min(100, actual.fondo.y + (event.key === "ArrowUp" ? -paso : event.key === "ArrowDown" ? paso : 0))),
            },
          };
        });
        return;
      }

      const elemento = seleccion as ElementoMovible;
      setLayout((actual) => {
        if (!actual) return actual;
        return {
          ...actual,
          [elemento]: {
            ...actual[elemento],
            x: actual[elemento].x + (event.key === "ArrowLeft" ? -paso : event.key === "ArrowRight" ? paso : 0),
            y: actual[elemento].y + (event.key === "ArrowUp" ? -paso : event.key === "ArrowDown" ? paso : 0),
          },
        };
      });
    }

    window.addEventListener("keydown", moverConTeclado);
    return () => window.removeEventListener("keydown", moverConTeclado);
  }, [seleccion]);

  function actualizarMovible(eje: "x" | "y", valor: number) {
    if (seleccion === "fondo") return;
    const elemento = seleccion as ElementoMovible;
    setLayout((actual) => {
      if (!actual) return actual;
      return {
        ...actual,
        [elemento]: { ...actual[elemento], [eje]: valor },
      };
    });
  }

  function guardar() {
    if (!layout) return;
    localStorage.setItem(COMPETICION_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    setEstado("Guardado. Al abrir /competicion normal se aplican estos ajustes.");
  }

  function recargarDesdeCodigo() {
    setLayout(null);
    setEstado("Recargando directamente desde /competicion…");
    setVersion((actual) => actual + 1);
  }

  function limpiarGuardado() {
    localStorage.removeItem(COMPETICION_LAYOUT_STORAGE_KEY);
    setEstado("Ajustes guardados eliminados. La página vuelve a depender solo del código.");
    setVersion((actual) => actual + 1);
  }

  const movible = layout && seleccion !== "fondo" ? layout[seleccion] : null;

  return (
    <main className="min-h-screen bg-[#eaf6fd] text-[#102f55]">
      <style>{`
        body > nav { display: none !important; }
        body { margin: 0; background: #eaf6fd; }
      `}</style>

      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 p-3 md:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c9e3f1] bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#56afe2]">
                Editor visual en vivo
              </p>
              <p className="mt-1 text-sm font-black">
                Esta vista carga la /competicion real. No hay una copia visual separada.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={recargarDesdeCodigo}
                className="rounded-xl border border-[#b9d8e9] bg-white px-4 py-2 text-xs font-black hover:border-[#56afe2]"
              >
                ↻ Recargar desde código
              </button>
              <a
                href="/competicion"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-[#102f55] px-4 py-2 text-xs font-black text-white"
              >
                Ver página ↗
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#9ecde7] bg-[#102f55] shadow-[0_18px_45px_rgba(16,47,85,.16)]">
            <iframe
              key={version}
              ref={iframeRef}
              src={`/competicion?editorBase=1&editorVersion=${version}`}
              title="Vista real de Competición"
              onLoad={prepararPagina}
              className="h-[calc(100vh-105px)] min-h-[680px] w-full bg-[#102f55]"
            />
          </div>
        </section>

        <aside className="border-l border-[#c9e3f1] bg-white p-5 xl:min-h-screen">
          <div className="sticky top-5 space-y-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#56afe2]">
                APA · Remodelación
              </p>
              <h1 className="mt-1 text-2xl font-black">Editor de Competición</h1>
              <p className="mt-2 text-xs font-semibold leading-5 text-[#5b7898]">
                Cada vez que recargás, toma el TSX, CSS y las imágenes que tenga la página en ese momento.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(["titulo", "temporada", "linea", "menu", "fondo"] as Seleccion[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSeleccion(item);
                    resaltar(item);
                  }}
                  className={`rounded-xl border px-3 py-2 text-xs font-black capitalize transition ${
                    seleccion === item
                      ? "border-[#56afe2] bg-[#dff1fb] text-[#102f55]"
                      : "border-[#d5e7f1] bg-white text-[#597695] hover:border-[#56afe2]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {!layout ? (
              <div className="rounded-xl border border-[#c9e3f1] bg-[#f3fafe] p-4 text-xs font-bold text-[#5b7898]">
                Esperando que cargue /competicion…
              </div>
            ) : (
              <>
                {movible && (
                  <div className="space-y-3 rounded-2xl border border-[#d5e7f1] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#56afe2]">Posición</p>
                    {(["x", "y"] as const).map((eje) => (
                      <label key={eje} className="block">
                        <div className="mb-1 flex items-center justify-between text-xs font-black uppercase">
                          <span>{eje}</span>
                          <input
                            type="number"
                            value={movible[eje]}
                            onChange={(event) => actualizarMovible(eje, Number(event.target.value))}
                            className="w-20 rounded-lg border border-[#c9e3f1] px-2 py-1 text-right"
                          />
                        </div>
                        <input
                          type="range"
                          min={eje === "x" ? -600 : -350}
                          max={eje === "x" ? 600 : 350}
                          value={movible[eje]}
                          onChange={(event) => actualizarMovible(eje, Number(event.target.value))}
                          className="w-full accent-[#56afe2]"
                        />
                      </label>
                    ))}
                  </div>
                )}

                {seleccion === "titulo" && (
                  <Control
                    etiqueta="Tamaño del título"
                    min={32}
                    max={100}
                    step={1}
                    value={layout.titulo.size}
                    onChange={(value) => setLayout({ ...layout, titulo: { ...layout.titulo, size: value } })}
                  />
                )}

                {seleccion === "temporada" && (
                  <Control
                    etiqueta="Tamaño de temporada"
                    min={8}
                    max={40}
                    step={1}
                    value={layout.temporada.size}
                    onChange={(value) => setLayout({ ...layout, temporada: { ...layout.temporada, size: value } })}
                  />
                )}

                {seleccion === "linea" && (
                  <Control
                    etiqueta="Ancho de línea"
                    min={20}
                    max={260}
                    step={1}
                    value={layout.linea.width}
                    onChange={(value) => setLayout({ ...layout, linea: { ...layout.linea, width: value } })}
                  />
                )}

                {seleccion === "menu" && (
                  <Control
                    etiqueta="Altura del menú"
                    min={80}
                    max={220}
                    step={1}
                    value={layout.menu.height}
                    onChange={(value) => setLayout({ ...layout, menu: { ...layout.menu, height: value } })}
                  />
                )}

                {seleccion === "fondo" && (
                  <div className="space-y-4 rounded-2xl border border-[#d5e7f1] p-4">
                    <ControlSimple
                      etiqueta="Horizontal"
                      min={0}
                      max={100}
                      step={1}
                      value={layout.fondo.x}
                      onChange={(value) => setLayout({ ...layout, fondo: { ...layout.fondo, x: value } })}
                    />
                    <ControlSimple
                      etiqueta="Vertical"
                      min={0}
                      max={100}
                      step={1}
                      value={layout.fondo.y}
                      onChange={(value) => setLayout({ ...layout, fondo: { ...layout.fondo, y: value } })}
                    />
                    <ControlSimple
                      etiqueta="Zoom"
                      min={1}
                      max={1.8}
                      step={0.01}
                      value={layout.fondo.zoom}
                      onChange={(value) => setLayout({ ...layout, fondo: { ...layout.fondo, zoom: value } })}
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={guardar}
                disabled={!layout}
                className="w-full rounded-xl bg-[#56afe2] px-4 py-3 text-sm font-black text-white disabled:opacity-40"
              >
                Guardar para /competicion
              </button>
              <button
                type="button"
                onClick={limpiarGuardado}
                className="w-full rounded-xl border border-[#c9e3f1] bg-white px-4 py-3 text-xs font-black text-[#102f55]"
              >
                Borrar ajustes y volver al código
              </button>
            </div>

            <p className="rounded-xl bg-[#f3fafe] p-3 text-[11px] font-bold leading-5 text-[#5b7898]">
              {estado}
            </p>

            <p className="text-[10px] font-bold leading-4 text-[#7891aa]">
              Tip: también podés arrastrar título, temporada, línea, menú y fondo directamente dentro de la página. Flechas = 1 px · Shift + flechas = 10 px.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Control({
  etiqueta,
  min,
  max,
  step,
  value,
  onChange,
}: {
  etiqueta: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-[#d5e7f1] p-4">
      <ControlSimple etiqueta={etiqueta} min={min} max={max} step={step} value={value} onChange={onChange} />
    </div>
  );
}

function ControlSimple({
  etiqueta,
  min,
  max,
  step,
  value,
  onChange,
}: {
  etiqueta: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black">
        <span>{etiqueta}</span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number(value.toFixed(2))}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-20 rounded-lg border border-[#c9e3f1] px-2 py-1 text-right"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#56afe2]"
      />
    </label>
  );
}
