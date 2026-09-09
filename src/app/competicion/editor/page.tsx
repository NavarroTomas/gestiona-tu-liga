"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  COMPETITION_EDITOR_STORAGE_KEY,
  DEFAULT_COMPETITION_LAYOUT,
  normalizeCompetitionLayout,
  type CompetitionLayoutConfig,
} from "../competition-editor-config";

const competiciones = [
  ["Torneo de Liga", "Primera y Segunda"],
  ["Clasificación a Copas", "Fase de grupos"],
  ["Copa Argentina", "Cuartos de final"],
  ["Copa APA", "En juego"],
  ["Playoffs de Ascenso", "Próximamente"],
  ["Copa de Campeones", "Próximamente"],
] as const;

type Selected = "season" | "title" | "line" | "menu" | "background";

type DragState = {
  element: Exclude<Selected, "background">;
} | null;

function Field({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#4f7196]">
        <span>{label}</span>
        <input
          type="number"
          value={Number(value.toFixed(2))}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-[92px] rounded-lg border border-[#c9e3f1] bg-white px-2 py-1 text-right text-[12px] font-black text-[#102f55] outline-none focus:border-[#56afe2]"
        />
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#56afe2]"
      />
    </label>
  );
}

export default function CompetitionEditorPage() {
  const [config, setConfig] = useState<CompetitionLayoutConfig>(
    DEFAULT_COMPETITION_LAYOUT,
  );
  const [selected, setSelected] = useState<Selected>("title");
  const [drag, setDrag] = useState<DragState>(null);
  const [saved, setSaved] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(COMPETITION_EDITOR_STORAGE_KEY);
    if (!raw) return;

    try {
      setConfig(normalizeCompetitionLayout(JSON.parse(raw)));
    } catch {
      // Si el JSON local quedó corrupto, usamos los valores por defecto.
    }
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (selected === "background") return;
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        return;
      }

      event.preventDefault();
      const delta = event.shiftKey ? 1 : 0.2;
      const dx = event.key === "ArrowLeft" ? -delta : event.key === "ArrowRight" ? delta : 0;
      const dy = event.key === "ArrowUp" ? -delta : event.key === "ArrowDown" ? delta : 0;

      setConfig((prev) => ({
        ...prev,
        [selected]: {
          ...prev[selected],
          x: "x" in prev[selected] ? prev[selected].x + dx : undefined,
          y: "y" in prev[selected] ? prev[selected].y + dy : undefined,
        },
      }) as CompetitionLayoutConfig);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  const selectedLabel = useMemo(() => {
    if (selected === "season") return "Temporada 4";
    if (selected === "title") return "Competición Oficial";
    if (selected === "line") return "Línea celeste";
    if (selected === "menu") return "Menú inferior";
    return "Fondo";
  }, [selected]);

  function update<K extends keyof CompetitionLayoutConfig>(
    key: K,
    patch: Partial<CompetitionLayoutConfig[K]>,
  ) {
    setSaved(false);
    setConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  }

  function pointerPosition(event: React.PointerEvent) {
    const stage = stageRef.current;
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  }

  function startDrag(
    event: React.PointerEvent,
    element: Exclude<Selected, "background">,
  ) {
    event.preventDefault();
    event.stopPropagation();
    setSelected(element);
    setDrag({ element });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: React.PointerEvent) {
    if (!drag) return;
    const pos = pointerPosition(event);
    if (!pos) return;
    update(drag.element, { x: pos.x, y: pos.y } as never);
  }

  function stopDrag() {
    setDrag(null);
  }

  function save() {
    window.localStorage.setItem(
      COMPETITION_EDITOR_STORAGE_KEY,
      JSON.stringify(config),
    );
    setSaved(true);
  }

  async function copyConfig() {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setSaved(true);
  }

  function reset() {
    setConfig(DEFAULT_COMPETITION_LAYOUT);
    window.localStorage.removeItem(COMPETITION_EDITOR_STORAGE_KEY);
    setSaved(false);
  }

  return (
    <>
      <style>{`
        body:has(main.apa-competition-editor) > nav { display: none !important; }
        body:has(main.apa-competition-editor) { background: #eef8fe; color: #102f55; }
      `}</style>

      <main className="apa-competition-editor min-h-screen bg-[#eef8fe] text-[#102f55]">
        <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[1fr_360px]">
          <section className="min-w-0 overflow-hidden bg-[#dff1fb] p-3 md:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c9e3f1] bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#56afe2]">
                  Editor visual
                </p>
                <p className="mt-1 text-sm font-black text-[#102f55]">
                  Arrastrá los elementos directamente con el mouse
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/competicion"
                  className="rounded-xl border border-[#c9e3f1] bg-white px-4 py-2 text-xs font-black text-[#102f55] hover:border-[#56afe2]"
                >
                  Ver página
                </Link>
                <button
                  type="button"
                  onClick={save}
                  className="rounded-xl bg-[#56afe2] px-4 py-2 text-xs font-black text-white hover:bg-[#3c9ed7]"
                >
                  Guardar diseño
                </button>
              </div>
            </div>

            <div
              ref={stageRef}
              className="relative mx-auto aspect-[16/9] w-full max-w-[1600px] touch-none overflow-hidden rounded-[22px] border border-[#9ecde7] bg-[#102f55] shadow-[0_18px_50px_rgba(16,47,85,.18)]"
              onPointerMove={moveDrag}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              onPointerLeave={() => drag && stopDrag()}
            >
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src="/images/competicion-hero.png"
                  alt="Estadio de Pro Soccer Online"
                  fill
                  priority
                  sizes="100vw"
                  className="select-none object-cover"
                  draggable={false}
                  style={{
                    objectPosition: `${config.background.x}% ${config.background.y}%`,
                    transform: `scale(${config.background.scale})`,
                    filter: `brightness(${config.background.brightness})`,
                  }}
                />
                <div
                  className="absolute inset-0 bg-[#07172a]"
                  style={{ opacity: config.background.overlay }}
                />
              </div>

              <div className="absolute inset-x-0 top-0 z-20 h-[12%] bg-[linear-gradient(100deg,#f3fafe_0%,#edf8fe_44%,#f8fcff_100%)] shadow-[0_4px_18px_rgba(16,47,85,.08)]">
                <div className="flex h-full items-center px-[4%] text-[#102f55]">
                  <div className="flex items-center gap-[1.2vw]">
                    <div className="relative h-[5.2vw] max-h-[72px] min-h-[36px] w-[5.2vw] max-w-[72px] min-w-[36px] overflow-hidden rounded border border-[#102f55]/15 bg-white">
                      <Image src="/logo-apa.png" alt="APA" fill sizes="72px" className="object-cover" />
                    </div>
                    <div className="leading-none">
                      <div className="text-[clamp(18px,2.2vw,40px)] font-black tracking-[-0.05em]">PSO</div>
                      <div className="mt-[.5vw] text-[clamp(6px,.72vw,12px)] font-black uppercase tracking-[.45em]">Argentina</div>
                    </div>
                  </div>
                  <div className="ml-auto hidden items-center gap-[2.6vw] text-[clamp(9px,1vw,16px)] font-black md:flex">
                    <span className="rounded border-2 border-[#56afe2] bg-[#ddf1fc] px-[1.1vw] py-[.8vw]">Competición</span>
                    <span>Clubes</span><span>Noticias</span><span>Guía</span>
                  </div>
                  <div className="ml-[3vw] rounded-full bg-[#56afe2] px-[2vw] py-[.9vw] text-[clamp(8px,1vw,16px)] font-black text-white">
                    Unite a APA →
                  </div>
                </div>
              </div>

              <button
                type="button"
                onPointerDown={(event) => startDrag(event, "season")}
                className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-move select-none whitespace-nowrap border border-dashed px-2 py-1 font-black uppercase tracking-[0.62em] text-[#56afe2] drop-shadow-[0_3px_12px_rgba(0,0,0,.55)] ${selected === "season" ? "border-[#56afe2] bg-[#56afe2]/10" : "border-transparent"}`}
                style={{
                  left: `${config.season.x}%`,
                  top: `${config.season.y}%`,
                  fontSize: `${config.season.fontSize}px`,
                  opacity: config.season.opacity,
                }}
              >
                Temporada 4
              </button>

              <button
                type="button"
                onPointerDown={(event) => startDrag(event, "title")}
                className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-move select-none whitespace-nowrap border border-dashed px-3 py-2 font-black uppercase leading-none tracking-[-0.045em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,.55)] ${selected === "title" ? "border-[#56afe2] bg-[#56afe2]/10" : "border-transparent"}`}
                style={{
                  left: `${config.title.x}%`,
                  top: `${config.title.y}%`,
                  fontSize: `${config.title.fontSize}px`,
                  opacity: config.title.opacity,
                }}
              >
                Competición Oficial
              </button>

              <button
                type="button"
                aria-label="Mover línea celeste"
                onPointerDown={(event) => startDrag(event, "line")}
                className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-move border border-dashed p-2 ${selected === "line" ? "border-[#56afe2] bg-[#56afe2]/10" : "border-transparent"}`}
                style={{ left: `${config.line.x}%`, top: `${config.line.y}%`, opacity: config.line.opacity }}
              >
                <span
                  className="block rounded-full bg-[#56afe2]"
                  style={{ width: `${config.line.width}px`, height: `${config.line.height}px` }}
                />
              </button>

              <div
                onPointerDown={(event) => startDrag(event, "menu")}
                className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-move select-none border border-dashed ${selected === "menu" ? "border-[#56afe2]" : "border-transparent"}`}
                style={{
                  left: `${config.menu.x}%`,
                  top: `${config.menu.y}%`,
                  width: `${config.menu.width}%`,
                  minHeight: `${config.menu.minHeight}px`,
                  opacity: config.menu.opacity,
                }}
              >
                <div
                  className="grid h-full grid-cols-6 overflow-hidden border border-white/75 bg-[#f6fbfe]/95 p-[8px] text-[#102f55] shadow-[0_10px_35px_rgba(2,20,40,.22)] backdrop-blur-md"
                  style={{ borderRadius: `${config.menu.radius}px` }}
                >
                  {competiciones.map(([titulo, subtitulo], index) => (
                    <div
                      key={titulo}
                      className={`relative flex min-h-[80px] flex-col items-center justify-center px-2 text-center ${index === 0 ? "rounded-[12px] bg-[#d8effc]" : ""}`}
                    >
                      {index > 0 && <span className="absolute left-0 top-1/2 h-[44px] w-px -translate-y-1/2 bg-[#bfd9e8]" />}
                      <span className="text-[clamp(9px,1vw,16px)] font-black leading-tight">{titulo}</span>
                      <span className="mt-1.5 text-[clamp(7px,.8vw,13px)] font-medium text-[#4f7196]">{subtitulo}</span>
                      {index === 0 && <span className="absolute bottom-2 h-[3px] w-[40%] rounded-full bg-[#56afe2]" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-xs font-bold text-[#5d7895]">
              Click para seleccionar · Arrastrá para mover · Flechas para ajuste fino · Shift + flecha para mover más rápido
            </p>
          </section>

          <aside className="border-l border-[#c9e3f1] bg-white p-5 xl:min-h-screen">
            <div className="sticky top-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#56afe2]">Elemento seleccionado</p>
              <h1 className="mt-2 text-2xl font-black text-[#102f55]">{selectedLabel}</h1>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {(["season", "title", "line", "menu", "background"] as Selected[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSelected(item)}
                    className={`rounded-xl border px-3 py-2 text-xs font-black ${selected === item ? "border-[#56afe2] bg-[#ddf1fc] text-[#102f55]" : "border-[#c9e3f1] bg-white text-[#5d7895]"}`}
                  >
                    {item === "season" ? "Temporada" : item === "title" ? "Título" : item === "line" ? "Línea" : item === "menu" ? "Menú" : "Fondo"}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-5 rounded-2xl border border-[#d5e8f3] bg-[#f7fcff] p-4">
                {selected === "season" && (
                  <>
                    <Field label="X (%)" value={config.season.x} min={0} max={100} step={0.1} onChange={(v) => update("season", { x: v })} />
                    <Field label="Y (%)" value={config.season.y} min={0} max={100} step={0.1} onChange={(v) => update("season", { y: v })} />
                    <Field label="Tamaño" value={config.season.fontSize} min={8} max={48} onChange={(v) => update("season", { fontSize: v })} />
                    <Field label="Opacidad" value={config.season.opacity} min={0} max={1} step={0.01} onChange={(v) => update("season", { opacity: v })} />
                  </>
                )}
                {selected === "title" && (
                  <>
                    <Field label="X (%)" value={config.title.x} min={0} max={100} step={0.1} onChange={(v) => update("title", { x: v })} />
                    <Field label="Y (%)" value={config.title.y} min={0} max={100} step={0.1} onChange={(v) => update("title", { y: v })} />
                    <Field label="Tamaño" value={config.title.fontSize} min={18} max={110} onChange={(v) => update("title", { fontSize: v })} />
                    <Field label="Opacidad" value={config.title.opacity} min={0} max={1} step={0.01} onChange={(v) => update("title", { opacity: v })} />
                  </>
                )}
                {selected === "line" && (
                  <>
                    <Field label="X (%)" value={config.line.x} min={0} max={100} step={0.1} onChange={(v) => update("line", { x: v })} />
                    <Field label="Y (%)" value={config.line.y} min={0} max={100} step={0.1} onChange={(v) => update("line", { y: v })} />
                    <Field label="Ancho" value={config.line.width} min={20} max={300} onChange={(v) => update("line", { width: v })} />
                    <Field label="Alto" value={config.line.height} min={1} max={16} onChange={(v) => update("line", { height: v })} />
                  </>
                )}
                {selected === "menu" && (
                  <>
                    <Field label="X (%)" value={config.menu.x} min={0} max={100} step={0.1} onChange={(v) => update("menu", { x: v })} />
                    <Field label="Y (%)" value={config.menu.y} min={0} max={100} step={0.1} onChange={(v) => update("menu", { y: v })} />
                    <Field label="Ancho (%)" value={config.menu.width} min={30} max={100} step={0.1} onChange={(v) => update("menu", { width: v })} />
                    <Field label="Alto mínimo" value={config.menu.minHeight} min={60} max={240} onChange={(v) => update("menu", { minHeight: v })} />
                    <Field label="Redondeo" value={config.menu.radius} min={0} max={50} onChange={(v) => update("menu", { radius: v })} />
                  </>
                )}
                {selected === "background" && (
                  <>
                    <Field label="Horizontal (%)" value={config.background.x} min={0} max={100} step={0.1} onChange={(v) => update("background", { x: v })} />
                    <Field label="Vertical (%)" value={config.background.y} min={0} max={100} step={0.1} onChange={(v) => update("background", { y: v })} />
                    <Field label="Zoom" value={config.background.scale} min={1} max={2} step={0.01} onChange={(v) => update("background", { scale: v })} />
                    <Field label="Brillo" value={config.background.brightness} min={0.3} max={1.5} step={0.01} onChange={(v) => update("background", { brightness: v })} />
                    <Field label="Oscurecer" value={config.background.overlay} min={0} max={0.8} step={0.01} onChange={(v) => update("background", { overlay: v })} />
                  </>
                )}
              </div>

              <div className="mt-5 grid gap-2">
                <button type="button" onClick={save} className="rounded-xl bg-[#56afe2] px-4 py-3 text-sm font-black text-white hover:bg-[#3c9ed7]">
                  {saved ? "✓ Guardado en este navegador" : "Guardar diseño"}
                </button>
                <button type="button" onClick={copyConfig} className="rounded-xl border border-[#56afe2] bg-[#ddf1fc] px-4 py-3 text-sm font-black text-[#102f55]">
                  Copiar configuración
                </button>
                <button type="button" onClick={reset} className="rounded-xl border border-[#d9e4eb] bg-white px-4 py-3 text-sm font-black text-[#7d8fa0] hover:border-red-300 hover:text-red-500">
                  Restablecer diseño
                </button>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-[#6f879e]">
                Guardar mantiene tu diseño en este navegador. Cuando lo dejes perfecto, usá <b>Copiar configuración</b> y pegámela en el chat para dejarla definitiva en el código de la rama.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
