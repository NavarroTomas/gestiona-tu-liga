"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ENTERTAINMENT_EXPERIENCES,
  type EntertainmentExperienceId,
} from "@/config/entertainment";

function ChartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path d="M5 19V11M12 19V5M19 19V8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function TeamIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.8 19c.5-4 2.3-6 5.2-6s4.7 2 5.2 6M14.2 14.5c2.9-.7 5 .9 5.7 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrophyIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path d="M8 4h8v4.5c0 3.2-1.5 5.4-4 6.5-2.5-1.1-4-3.3-4-6.5V4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 6H5.5v1.5c0 2 1 3.3 3 3.8M16 6h2.5v1.5c0 2-1 3.3-3 3.8M12 15v3M8.5 20h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ExperienceIcon({ id, className = "" }: { id: EntertainmentExperienceId; className?: string }) {
  if (id === "predicciones") return <ChartIcon className={className} />;
  if (id === "dream-team") return <TeamIcon className={className} />;
  return <TrophyIcon className={className} />;
}

const descriptions: Record<EntertainmentExperienceId, string> = {
  predicciones: "Adiviná los resultados y sumá puntos",
  "dream-team": "Armá tu equipo ideal",
  premios: "Seguí los reconocimientos APA",
};

function PredictionsPreview() {
  const rows = ["Partido oficial 1", "Partido oficial 2", "Partido oficial 3", "Partido oficial 4"];

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#c9e3f1] bg-white">
      <div className="grid grid-cols-[1.1fr_.8fr_.8fr] border-b border-[#c9e3f1] bg-[#eaf6fd] px-4 py-3 text-[10px] font-black uppercase tracking-[.08em] text-[#4c6e88] sm:px-5">
        <span>Partido</span>
        <span className="text-center">Pronóstico</span>
        <span className="text-right">Estado</span>
      </div>
      {rows.map((row, index) => (
        <div key={row} className="grid grid-cols-[1.1fr_.8fr_.8fr] items-center gap-3 border-b border-[#dceaf2] px-4 py-4 last:border-b-0 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-black text-[#102f55]">{row}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[.06em] text-[#7a94a8]">Próxima fecha</p>
          </div>
          <div className="flex justify-center gap-1.5">
            {["1", "X", "2"].map((value) => (
              <span key={value} className="grid h-8 w-8 place-items-center rounded-[6px] border border-[#a9d4e9] bg-[#f7fbfe] text-[11px] font-black text-[#102f55]">
                {value}
              </span>
            ))}
          </div>
          <p className="text-right text-[10px] font-black uppercase tracking-[.06em] text-[#2d98d4]">
            {index < 2 ? "Abierto" : "Próximo"}
          </p>
        </div>
      ))}
    </div>
  );
}

const dreamTeamPositions = [
  { code: "GK", name: "Arquero", x: "9%", y: "50%", tone: "bg-[#a98724]" },
  { code: "LB", name: "Lateral izquierdo", x: "30%", y: "24%", tone: "bg-[#2d83c4]" },
  { code: "CB", name: "Defensor central", x: "30%", y: "50%", tone: "bg-[#657d91]" },
  { code: "RB", name: "Lateral derecho", x: "30%", y: "76%", tone: "bg-[#2d83c4]" },
  { code: "LCM", name: "Mediocampista izquierdo", x: "55%", y: "35%", tone: "bg-[#318d43]" },
  { code: "RCM", name: "Mediocampista derecho", x: "55%", y: "65%", tone: "bg-[#318d43]" },
  { code: "LST", name: "Delantero izquierdo", x: "82%", y: "35%", tone: "bg-[#102f55]" },
  { code: "RST", name: "Delantero derecho", x: "82%", y: "65%", tone: "bg-[#102f55]" },
] as const;

function DreamTeamPreview() {
  return (
    <div className="grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)]">
      <section className="rounded-[10px] border border-[#c9e3f1] bg-white p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#2d98d4]">Seleccioná tus jugadores</p>
        <div className="mt-4 space-y-2">
          {dreamTeamPositions.map((position) => (
            <div key={position.code} className="grid min-h-[48px] grid-cols-[52px_1fr_28px] items-center gap-3 rounded-[8px] bg-[#f3f8fb] px-3">
              <span className={`inline-flex h-8 items-center justify-center rounded-[6px] px-2 text-[11px] font-black text-white ${position.tone}`}>
                {position.code}
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#607b90]">{position.name}</span>
              <span className="text-center text-[20px] font-semibold leading-none text-[#102f55]" aria-hidden="true">+</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[10px] border border-[#c9e3f1] bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-[#dceaf2] pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.09em] text-[#6f8799]">Estructura</p>
            <p className="mt-1 text-[23px] font-black text-[#102f55]">8 vs 8</p>
          </div>
          <div className="text-right">
            <p className="text-[26px] font-black leading-none text-[#102f55]">8</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[.08em] text-[#6f8799]">jugadores</p>
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-[10px] border border-[#c8dce7] bg-[#edf4f8] sm:min-h-[410px]">
          <div className="absolute inset-y-0 left-[18%] w-px bg-[#d0e0e9]" />
          <div className="absolute inset-y-0 left-[43%] w-px bg-[#d0e0e9]" />
          <div className="absolute inset-y-0 left-[69%] w-px bg-[#d0e0e9]" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#d0e0e9]" />
          <div className="absolute left-[9%] top-1/2 h-28 w-14 -translate-x-1/2 -translate-y-1/2 rounded-r-full border border-l-0 border-[#c5d9e4]" />

          {dreamTeamPositions.map((position) => (
            <div key={position.code} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: position.x, top: position.y }}>
              <div className="min-w-[58px] overflow-hidden rounded-[7px] border border-[#bcd2df] bg-white text-center shadow-[0_6px_14px_rgba(16,47,85,.06)]">
                <span className="grid h-34px min-h-[34px] place-items-center bg-[#173e64] text-[20px] font-medium leading-none text-white" aria-hidden="true">+</span>
                <span className="block px-2 py-1.5 text-[10px] font-black text-[#102f55]">{position.code}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AwardsPreview() {
  const awards = [
    ["MVP", "Figura de la fecha"],
    ["Goleador", "Mayor aporte ofensivo"],
    ["Arquero", "Mejor rendimiento"],
    ["Temporada", "Reconocimiento general"],
  ];

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#c9e3f1] bg-white">
      {awards.map(([title, description], index) => (
        <div key={title} className="grid grid-cols-[52px_1fr_auto] items-center gap-4 border-b border-[#dceaf2] px-5 py-5 last:border-b-0">
          <span className="text-[11px] font-black text-[#7ea9c0]">0{index + 1}</span>
          <div>
            <p className="text-[14px] font-black uppercase text-[#102f55]">{title}</p>
            <p className="mt-1 text-[12px] font-semibold text-[#6e879a]">{description}</p>
          </div>
          <span className="h-[2px] w-10 bg-[#56afe2]" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function ExperiencePreview({ id }: { id: EntertainmentExperienceId }) {
  if (id === "predicciones") return <PredictionsPreview />;
  if (id === "dream-team") return <DreamTeamPreview />;
  return <AwardsPreview />;
}

export default function EntertainmentPortal() {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<EntertainmentExperienceId>("predicciones");
  const active = useMemo(
    () => ENTERTAINMENT_EXPERIENCES.find((item) => item.id === activeId) ?? ENTERTAINMENT_EXPERIENCES[0],
    [activeId],
  );

  return (
    <main className="min-h-screen bg-[#f3fafe] text-[#102f55]">
      <section className="relative overflow-hidden border-b border-[#c9e3f1] bg-white">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] bg-cover bg-center opacity-35 lg:block"
          style={{ backgroundImage: "url('/themes/worldcup/backgrounds/FotoCancha.png')" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_42%,rgba(255,255,255,.83)_61%,rgba(255,255,255,.24)_100%)] lg:block" />

        <div className="relative mx-auto max-w-[1680px] px-5 py-9 sm:px-8 lg:px-10 lg:py-12">
          <p className="text-[10px] font-black uppercase tracking-[.13em] text-[#2d98d4]">Comunidad APA</p>
          <h1 className="mt-2 max-w-[980px] text-[clamp(3rem,7vw,6.9rem)] font-black uppercase leading-[.84] tracking-[-.055em]">
            Entretenimiento
            <span className="block text-[#2d98d4]">Comunidad</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] font-semibold leading-7 text-[#4f6e85] sm:text-[17px]">
            Viví APA más allá de la competencia. Participá, jugá y elegí la experiencia que más te guste.
          </p>
        </div>
      </section>

      <section className="border-b border-[#c9e3f1] bg-white">
        <div className="mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-10">
          <div className="grid sm:grid-cols-3" role="tablist" aria-label="Experiencias de entretenimiento">
            {ENTERTAINMENT_EXPERIENCES.map((experience) => {
              const selected = experience.id === activeId;
              return (
                <button
                  key={experience.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveId(experience.id)}
                  className={`relative flex min-h-[88px] items-center gap-4 border-b px-1 py-4 text-left transition sm:border-b-0 sm:border-r sm:px-7 ${selected ? "border-[#56afe2] text-[#102f55]" : "border-[#d4e6ef] text-[#557087] hover:bg-[#f7fbfe]"}`}
                >
                  <span className={`grid h-11 w-11 flex-none place-items-center rounded-full ${selected ? "bg-[#dff1fa] text-[#2d98d4]" : "bg-[#f0f6f9] text-[#58758b]"}`}>
                    <ExperienceIcon id={experience.id} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <strong className={`block text-[15px] font-black ${selected ? "text-[#2d98d4]" : "text-[#102f55]"}`}>
                      {experience.title}
                    </strong>
                    <span className="mt-1 block text-[12px] font-semibold leading-5 text-[#678298]">
                      {descriptions[experience.id]}
                    </span>
                  </span>
                  {selected && <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#56afe2]" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f3fafe] py-7 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"
            >
              <div className="rounded-[12px] border border-[#c9e3f1] bg-white p-5 sm:p-7 lg:p-8">
                <div className="flex flex-col gap-5 border-b border-[#d8e8f0] pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.13em] text-[#2d98d4]">{active.kicker}</p>
                    <h2 className="mt-2 text-[clamp(2rem,4vw,3.6rem)] font-black uppercase leading-[.95] tracking-[-.04em]">
                      {active.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-[14px] font-semibold leading-6 text-[#607b90] sm:text-[15px]">
                      {active.description}
                    </p>
                  </div>
                  <Link href={active.href} className="inline-flex min-h-11 flex-none items-center justify-center rounded-[8px] bg-[#56afe2] px-6 text-[12px] font-black uppercase tracking-[.05em] text-[#102f55] transition hover:bg-[#3fa4df]">
                    {active.cta}
                  </Link>
                </div>

                <div className="mt-6">
                  <ExperiencePreview id={active.id} />
                </div>
              </div>

              <aside className="space-y-5">
                <section className="rounded-[12px] border border-[#c9e3f1] bg-white p-6">
                  <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#2d98d4]">Cómo funciona</p>
                  <div className="mt-5 space-y-5">
                    {active.highlights.map((item, index) => (
                      <div key={item.label} className="grid grid-cols-[34px_1fr] gap-3 border-b border-[#e0ebf1] pb-4 last:border-b-0 last:pb-0">
                        <span className="text-[11px] font-black text-[#9ab2c2]">0{index + 1}</span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[.06em] text-[#6f889b]">{item.label}</p>
                          <p className="mt-1 text-[14px] font-black text-[#102f55]">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[12px] bg-[#102f55] p-6 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#79c8ef]">Acceso directo</p>
                  <h3 className="mt-3 text-[22px] font-black uppercase leading-tight">Entrá a la experiencia completa</h3>
                  <p className="mt-3 text-[13px] font-semibold leading-6 text-[#c4dbe8]">
                    El módulo completo conserva sus reglas, datos y acciones reales.
                  </p>
                  <Link href={active.href} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-[8px] border border-[#79c8ef] px-4 text-[12px] font-black uppercase tracking-[.06em] text-white transition hover:bg-[#17466f]">
                    Abrir {active.title}
                  </Link>
                </section>
              </aside>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
