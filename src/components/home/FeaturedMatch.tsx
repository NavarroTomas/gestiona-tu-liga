"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const FEATURED_MATCH_BG = "/themes/worldcup/backgrounds/featured-match-bg.png";
const STORAGE_KEY = "apa-featured-match-anchors-v1";

type Props = {
  partido: any;
  temporada: string;
  division: string;
  divisionLabel: string;
  logoEquipo: (nombre?: string) => string | null;
  EscudoEquipo: any;
};

type AnchorKey = "local" | "score" | "visitor";

type Anchor = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
};

type Anchors = Record<AnchorKey, Anchor>;

const DEFAULT_ANCHORS: Anchors = {
  local: { x: 24, y: 66, rotate: -6, scale: 1 },
  score: { x: 50, y: 63, rotate: -1, scale: 1 },
  visitor: { x: 76, y: 66, rotate: 6, scale: 1 },
};

export default function FeaturedMatch({
  partido,
  temporada,
  division,
  divisionLabel,
  logoEquipo,
  EscudoEquipo,
}: Props) {
  const estado = !partido ? "Sin partido" : partido.resultado ? "Finalizado" : "Programado";
  const [anchors, setAnchors] = useState<Anchors>(DEFAULT_ANCHORS);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<AnchorKey>("local");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setAnchors({ ...DEFAULT_ANCHORS, ...JSON.parse(saved) });
      setEditMode(new URLSearchParams(window.location.search).get("editFeatured") === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(anchors));
    } catch {}
  }, [anchors]);

  const fixtureHref = `/fixture/${division}?temporada=${encodeURIComponent(temporada)}`;
  const allFixtureHref = `/fixture?temporada=${encodeURIComponent(temporada)}`;

  return (
    <section className="relative min-h-[680px] overflow-hidden rounded-[30px] border border-sky-300/20 bg-[#020814] shadow-[0_24px_80px_rgba(0,0,0,.42)]">
      <img
        src={FEATURED_MATCH_BG}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#020814]/86 via-[#020814]/22 to-[#020814]/8" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020814]/10 via-transparent to-[#020814]/55" />

      <div className="relative z-10 flex min-h-[680px] flex-col p-5 md:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge>Partido destacado</Badge>
          <Badge>{temporada} · {divisionLabel}</Badge>
          <Badge>{estado}</Badge>
        </div>

        <h2 className="mt-6 max-w-[640px] text-[clamp(2.5rem,5.4vw,5rem)] font-black uppercase italic leading-[0.88] tracking-[-0.07em] text-white drop-shadow-[0_12px_35px_rgba(0,0,0,.75)]">
          La noche del partido
        </h2>

        {partido ? (
          <>
            <FloorTeam
              anchor={anchors.local}
              side="Local"
              name={partido.local}
              logo={logoEquipo(partido.local)}
              EscudoEquipo={EscudoEquipo}
              align="left"
            />

            <FloorScore anchor={anchors.score} score={partido.resultado || "VS"} />

            <FloorTeam
              anchor={anchors.visitor}
              side="Visitante"
              name={partido.visitante}
              logo={logoEquipo(partido.visitante)}
              EscudoEquipo={EscudoEquipo}
              align="right"
            />
          </>
        ) : (
          <div className="mt-10 max-w-xl rounded-[26px] border border-white/12 bg-black/25 p-5 text-sm text-slate-300 backdrop-blur-md">
            No hay partidos cargados para esta temporada y división.
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3">
          <Meta>{partido?.fecha || "Fecha sin cargar"}</Meta>
          <Meta>{partido?.dia || "Día sin cargar"}</Meta>
          <Meta>{partido?.hora || "Hora sin cargar"}</Meta>

          <div className="ml-0 flex flex-wrap gap-3 md:ml-auto">
            <Link
              href={fixtureHref}
              className="rounded-full border border-amber-200/35 bg-amber-200 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111f] transition hover:bg-white"
            >
              Ver partido →
            </Link>

            <Link
              href={allFixtureHref}
              className="rounded-full border border-white/15 bg-white/[0.07] px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-white backdrop-blur-md transition hover:bg-white/[0.12]"
            >
              Ver fixture
            </Link>
          </div>
        </div>
      </div>

      {editMode && (
        <OverlayEditor
          anchors={anchors}
          setAnchors={setAnchors}
          selected={selected}
          setSelected={setSelected}
        />
      )}

      <div className="pointer-events-none absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/10" />
    </section>
  );
}

function FloorTeam({
  anchor,
  side,
  name,
  logo,
  EscudoEquipo,
  align,
}: {
  anchor: Anchor;
  side: string;
  name: string;
  logo: string | null;
  EscudoEquipo: any;
  align: "left" | "right";
}) {
  const isRight = align === "right";

  return (
    <div
      className={[
        "absolute z-20 flex items-center gap-4",
        isRight ? "text-right" : "text-left",
      ].join(" ")}
      style={{
        left: `${anchor.x}%`,
        top: `${anchor.y}%`,
        transform: `translate(-50%, -50%) perspective(1150px) rotateX(55deg) rotateZ(${anchor.rotate}deg) scale(${anchor.scale})`,
        transformOrigin: "center center",
      }}
    >
      {!isRight && <FloorShield name={name} logo={logo} EscudoEquipo={EscudoEquipo} />}

      <div className="max-w-[450px]">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-200/80 drop-shadow-[0_5px_12px_rgba(0,0,0,.9)]">
          {side}
        </p>

        <h3 className="break-words text-[clamp(2rem,4.4vw,4.8rem)] font-black uppercase italic leading-[0.76] tracking-[-0.085em] text-white/95 mix-blend-screen drop-shadow-[0_8px_16px_rgba(0,0,0,.95)]">
          {name}
        </h3>

        <div className={["mt-3 h-1 w-28 rounded-full bg-amber-200/75 mix-blend-screen shadow-[0_0_18px_rgba(250,204,21,.25)]", isRight ? "ml-auto" : ""].join(" ")} />
      </div>

      {isRight && <FloorShield name={name} logo={logo} EscudoEquipo={EscudoEquipo} />}
    </div>
  );
}

function FloorScore({ anchor, score }: { anchor: Anchor; score: string }) {
  return (
    <div
      className="absolute z-20 text-center"
      style={{
        left: `${anchor.x}%`,
        top: `${anchor.y}%`,
        transform: `translate(-50%, -50%) perspective(1100px) rotateX(56deg) rotateZ(${anchor.rotate}deg) scale(${anchor.scale})`,
        transformOrigin: "center center",
      }}
    >
      <div className="text-[clamp(3.1rem,6.5vw,6rem)] font-black italic leading-none tracking-[-0.08em] text-white/95 mix-blend-screen drop-shadow-[0_10px_18px_rgba(0,0,0,.95)]">
        {score}
      </div>
    </div>
  );
}

function FloorShield({ name, logo, EscudoEquipo }: any) {
  return (
    <div className="shrink-0 opacity-95 mix-blend-screen drop-shadow-[0_12px_18px_rgba(0,0,0,.9)] grayscale-[10%] contrast-125">
      <EscudoEquipo nombre={name} logo={logo} size="lg" />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/90 backdrop-blur-md">
      {children}
    </span>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/12 bg-black/45 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/85 backdrop-blur-md">
      {children}
    </span>
  );
}

function OverlayEditor({
  anchors,
  setAnchors,
  selected,
  setSelected,
}: {
  anchors: Anchors;
  setAnchors: React.Dispatch<React.SetStateAction<Anchors>>;
  selected: AnchorKey;
  setSelected: (value: AnchorKey) => void;
}) {
  const current = anchors[selected];

  function updateAnchor(key: AnchorKey, patch: Partial<Anchor>) {
    setAnchors((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...patch,
      },
    }));
  }

  function pointerToPercent(event: React.PointerEvent<HTMLElement>, key: AnchorKey) {
    const section = event.currentTarget.closest("section");
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    updateAnchor(key, {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
    });
  }

  function copyJson() {
    navigator.clipboard.writeText(JSON.stringify(anchors, null, 2));
  }

  return (
    <>
      <div className="absolute inset-0 z-40">
        {(Object.keys(anchors) as AnchorKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setSelected(key);
              pointerToPercent(event, key);
            }}
            onPointerMove={(event) => {
              if (event.buttons !== 1) return;
              pointerToPercent(event, key);
            }}
            className={[
              "absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[10px] font-black uppercase shadow-[0_10px_30px_rgba(0,0,0,.45)] backdrop-blur-md transition",
              selected === key
                ? "border-amber-200 bg-amber-200 text-[#06111f]"
                : "border-white/50 bg-black/55 text-white hover:bg-white/15",
            ].join(" ")}
            style={{ left: `${anchors[key].x}%`, top: `${anchors[key].y}%` }}
          >
            {key === "local" ? "L" : key === "score" ? "VS" : "V"}
          </button>
        ))}
      </div>

      <div className="absolute bottom-5 right-5 z-50 w-[320px] rounded-[24px] border border-white/15 bg-[#020814]/88 p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,.55)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">
            Editor overlay
          </p>

          <button
            type="button"
            onClick={copyJson}
            className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white hover:bg-white/15"
          >
            Copiar JSON
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["local", "score", "visitor"] as AnchorKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={[
                "rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em]",
                selected === key
                  ? "border-amber-200 bg-amber-200 text-[#06111f]"
                  : "border-white/12 bg-white/5 text-white/80",
              ].join(" ")}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <Slider
            label="X"
            value={current.x}
            min={0}
            max={100}
            step={0.1}
            onChange={(value) => updateAnchor(selected, { x: value })}
          />
          <Slider
            label="Y"
            value={current.y}
            min={0}
            max={100}
            step={0.1}
            onChange={(value) => updateAnchor(selected, { y: value })}
          />
          <Slider
            label="Rotación"
            value={current.rotate}
            min={-30}
            max={30}
            step={0.5}
            onChange={(value) => updateAnchor(selected, { rotate: value })}
          />
          <Slider
            label="Escala"
            value={current.scale}
            min={0.5}
            max={1.6}
            step={0.01}
            onChange={(value) => updateAnchor(selected, { scale: value })}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setAnchors(DEFAULT_ANCHORS)}
            className="flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white hover:bg-white/15"
          >
            Reset
          </button>
        </div>

        <p className="mt-3 text-[10px] leading-4 text-slate-400">
          Arrastrá L, VS o V sobre la imagen. Los cambios se guardan en tu navegador.
        </p>
      </div>
    </>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-amber-200"
      />
    </label>
  );
}
