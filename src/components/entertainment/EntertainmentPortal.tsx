"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ENTERTAINMENT_EXPERIENCES,
  type EntertainmentExperienceId,
} from "@/config/entertainment";

function PredictionsPreview() {
  return (
    <div className="border border-[#c7dfeb] bg-white">
      <div className="flex items-center justify-between border-b border-[#d8e9f2] px-5 py-4 sm:px-7">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#2d98d4]">Próximo partido</p>
          <p className="mt-1 text-[12px] font-bold text-[#688095]">Pronóstico abierto</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#86a0b3]">Puntaje</p>
          <p className="mt-1 text-[12px] font-black text-[#102f55]">+1 ganador · +3 exacto</p>
        </div>
      </div>

      <div className="grid items-center gap-5 px-5 py-8 sm:grid-cols-[1fr_auto_1fr] sm:px-7 sm:py-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#86a0b3]">Local</p>
          <p className="mt-2 text-[22px] font-black uppercase leading-none text-[#102f55]">Equipo local</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {['1', 'X', '2'].map((value) => (
            <button
              key={value}
              type="button"
              className="grid h-12 w-12 place-items-center border border-[#8fc9e8] bg-[#f6fbfe] text-sm font-black text-[#102f55] transition hover:bg-[#dff2fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56afe2]"
            >
              {value}
            </button>
          ))}
        </div>

        <div className="sm:text-right">
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#86a0b3]">Visitante</p>
          <p className="mt-2 text-[22px] font-black uppercase leading-none text-[#102f55]">Equipo visitante</p>
        </div>
      </div>
    </div>
  );
}

function DreamTeamPreview({ reduced }: { reduced: boolean }) {
  const positions = [
    ["LST", "28%", "18%"],
    ["RST", "72%", "18%"],
    ["LCM", "30%", "42%"],
    ["RCM", "70%", "42%"],
    ["LB", "16%", "68%"],
    ["CB", "50%", "68%"],
    ["RB", "84%", "68%"],
    ["GK", "50%", "88%"],
  ];

  return (
    <div className="grid gap-0 border border-[#c7dfeb] bg-white lg:grid-cols-[1fr_220px]">
      <div className="relative min-h-[390px] overflow-hidden bg-[#dff1fa]">
        <div className="absolute inset-5 border-2 border-[#73b8dc]/60 sm:inset-7" />
        <div className="absolute left-1/2 top-5 bottom-5 w-px -translate-x-1/2 bg-[#73b8dc]/50 sm:top-7 sm:bottom-7" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#73b8dc]/50" />

        {positions.map(([label, left, top], index) => (
          <motion.div
            key={label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left, top }}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: reduced ? 0 : index * 0.04 }}
          >
            <div className="grid h-11 min-w-11 place-items-center border border-[#0f355a] bg-[#0f355a] px-2 text-[10px] font-black text-white">
              {label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-[#d8e9f2] p-5 lg:border-l lg:border-t-0 lg:p-6">
        <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#2d98d4]">Formato oficial</p>
        <p className="mt-3 text-[30px] font-black uppercase leading-none text-[#102f55]">8 vs 8</p>
        <div className="mt-6 border-t border-[#d8e9f2] pt-5 text-[12px] font-bold leading-6 text-[#668196]">
          Elegí un jugador por posición y armá tu equipo ideal de la fecha.
        </div>
      </div>
    </div>
  );
}

function AwardsPreview({ reduced }: { reduced: boolean }) {
  const rows = [
    ["01", "MVP", "Jugador destacado"],
    ["02", "Goleador", "Mayor aporte ofensivo"],
    ["03", "Rendimiento", "Mejor valoración"],
  ];

  return (
    <div className="border border-[#c7dfeb] bg-white">
      <div className="flex items-center justify-between border-b border-[#d8e9f2] bg-[#102f55] px-5 py-4 text-white sm:px-7">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#79c8ef]">Reconocimientos APA</p>
          <p className="mt-1 text-[14px] font-black uppercase">Premios de la jornada</p>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#c0d8e6]">Datos oficiales</p>
      </div>

      <div>
        {rows.map(([pos, title, detail], index) => (
          <motion.div
            key={title}
            initial={reduced ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.26, delay: reduced ? 0 : index * 0.05 }}
            className="grid grid-cols-[52px_1fr_auto] items-center gap-4 border-b border-[#e0edf4] px-5 py-5 last:border-b-0 sm:px-7"
          >
            <span className="text-[18px] font-black text-[#9ab3c4]">{pos}</span>
            <div>
              <p className="text-[15px] font-black uppercase text-[#102f55]">{title}</p>
              <p className="mt-1 text-[11px] font-bold text-[#7990a2]">{detail}</p>
            </div>
            <span className="h-2 w-10 bg-[#56afe2]" aria-hidden="true" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ExperiencePreview({ id, reduced }: { id: EntertainmentExperienceId; reduced: boolean }) {
  if (id === "predicciones") return <PredictionsPreview />;
  if (id === "dream-team") return <DreamTeamPreview reduced={reduced} />;
  return <AwardsPreview reduced={reduced} />;
}

export default function EntertainmentPortal() {
  const reducedMotion = Boolean(useReducedMotion());
  const [activeId, setActiveId] = useState<EntertainmentExperienceId>("predicciones");
  const active = useMemo(
    () => ENTERTAINMENT_EXPERIENCES.find((item) => item.id === activeId) ?? ENTERTAINMENT_EXPERIENCES[0],
    [activeId],
  );

  return (
    <main className="min-h-screen bg-[#f3fafe] text-[#102f55]">
      <section className="border-b border-[#c9e3f1] bg-white">
        <div className="mx-auto grid max-w-[1680px] gap-7 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_360px] lg:items-end lg:px-10 lg:py-14">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#2d98d4]">APA / Comunidad</p>
            <h1 className="mt-3 text-[clamp(3.1rem,6.8vw,7rem)] font-black uppercase leading-[.86] tracking-[-.055em]">
              Entretenimiento
            </h1>
          </div>
          <p className="border-l border-[#cfe4f0] pl-6 text-[14px] font-semibold leading-7 text-[#607b90] sm:text-[15px]">
            Elegí una experiencia y participá con lo que pasa dentro de APA.
          </p>
        </div>
      </section>

      <section className="bg-[#f3fafe]">
        <div className="mx-auto max-w-[1680px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="grid border-y border-[#bcd9e8] bg-white lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="border-b border-[#bcd9e8] lg:border-b-0 lg:border-r">
              <div className="px-5 py-4 sm:px-6">
                <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#7c97aa]">Elegí una experiencia</p>
              </div>

              <div role="tablist" aria-label="Entretenimiento APA">
                {ENTERTAINMENT_EXPERIENCES.map((item, index) => {
                  const selected = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveId(item.id)}
                      className={`relative grid w-full grid-cols-[42px_1fr] gap-4 border-t border-[#d8e9f2] px-5 py-5 text-left transition sm:px-6 ${selected ? "bg-[#102f55] text-white" : "bg-white text-[#102f55] hover:bg-[#eef8fd]"}`}
                    >
                      <span className={`text-[12px] font-black ${selected ? "text-[#79c8ef]" : "text-[#9cb4c4]"}`}>
                        0{index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-[10px] font-black uppercase tracking-[.13em] ${selected ? "text-[#79c8ef]" : "text-[#2d98d4]"}`}>
                          {item.kicker}
                        </span>
                        <span className="mt-2 block text-[24px] font-black uppercase leading-none sm:text-[28px]">
                          {item.title}
                        </span>
                      </span>

                      {selected && (
                        <motion.span
                          layoutId="entertainment-active-line"
                          className="absolute bottom-0 left-0 top-0 w-1 bg-[#56afe2]"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  role="tabpanel"
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
                  className="grid gap-0 xl:grid-cols-[minmax(0,.9fr)_minmax(420px,1.1fr)]"
                >
                  <div className="flex flex-col justify-between border-b border-[#d8e9f2] p-6 sm:p-8 xl:border-b-0 xl:border-r xl:p-10">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#2d98d4]">Experiencia seleccionada</p>
                      <h2 className="mt-4 text-[clamp(2.5rem,5vw,5.4rem)] font-black uppercase leading-[.88] tracking-[-.05em] text-[#102f55]">
                        {active.title}
                      </h2>
                      <p className="mt-5 max-w-[650px] text-[14px] font-semibold leading-7 text-[#607b90] sm:text-[16px]">
                        {active.description}
                      </p>

                      <div className="mt-7 grid gap-0 border-y border-[#d8e9f2] sm:grid-cols-3">
                        {active.highlights.map((item) => (
                          <div key={item.label} className="border-b border-[#d8e9f2] py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0">
                            <p className="text-[9px] font-black uppercase tracking-[.14em] text-[#8aa2b3]">{item.label}</p>
                            <p className="mt-1 text-[13px] font-black uppercase text-[#102f55]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8">
                      <Link
                        href={active.href}
                        className="inline-flex min-h-12 items-center border border-[#56afe2] bg-[#56afe2] px-6 text-[12px] font-black uppercase tracking-[.08em] text-white transition hover:bg-[#389dd5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56afe2] focus-visible:ring-offset-2"
                      >
                        {active.cta}
                      </Link>
                    </div>
                  </div>

                  <div className="bg-[#eaf6fd] p-5 sm:p-7 xl:p-8">
                    <ExperiencePreview id={active.id} reduced={reducedMotion} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
