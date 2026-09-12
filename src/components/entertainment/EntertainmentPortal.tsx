"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useMemo, useState } from "react";
import {
  ENTERTAINMENT_EXPERIENCES,
  type EntertainmentExperienceId,
} from "@/config/entertainment";

function PredictionsVisual() {
  return (
    <div className="relative flex h-full min-h-[360px] flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-[#0b2f50] p-5 text-white sm:p-7">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:42px_42px]" />
      <motion.div
        className="absolute -right-16 -top-16 h-52 w-52 rounded-full border border-[#68bce9]/30"
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex items-center justify-between text-[10px] font-black uppercase tracking-[.18em] text-[#8fd0f2]">
        <span>Partido oficial</span>
        <span>Pronóstico abierto</span>
      </div>

      <div className="relative z-10 my-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="text-left">
          <motion.div
            className="mb-4 h-16 w-16 rounded-full border border-white/20 bg-white/10"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="text-[11px] font-black uppercase tracking-[.15em] text-[#8fd0f2]">Local</p>
          <p className="mt-1 text-xl font-black uppercase sm:text-2xl">Equipo local</p>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#8fd0f2]">Elegí</p>
          <div className="mt-4 flex gap-2">
            {['1', 'X', '2'].map((value, index) => (
              <motion.span
                key={value}
                className={`grid h-12 w-12 place-items-center rounded-xl border text-base font-black ${index === 0 ? 'border-[#79c8ef] bg-[#79c8ef] text-[#0f355a]' : 'border-white/20 bg-white/5 text-white'}`}
                animate={index === 0 ? { y: [0, -4, 0] } : undefined}
                transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.15 }}
              >
                {value}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <motion.div
            className="mb-4 h-16 w-16 rounded-full border border-white/20 bg-white/10"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="text-[11px] font-black uppercase tracking-[.15em] text-[#8fd0f2]">Visitante</p>
          <p className="mt-1 text-xl font-black uppercase sm:text-2xl">Equipo visitante</p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-[10px] font-black uppercase tracking-[.13em] text-[#bcd9e9]">
        <span>Ganador +1</span>
        <span>Exacto +3</span>
      </div>
    </div>
  );
}

function DreamTeamVisual() {
  const positions = [
    ["LST", "24%", "16%"],
    ["RST", "64%", "16%"],
    ["LCM", "25%", "39%"],
    ["RCM", "63%", "39%"],
    ["LB", "12%", "64%"],
    ["CB", "42%", "66%"],
    ["RB", "74%", "64%"],
    ["GK", "42%", "84%"],
  ];

  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-[28px] border border-[#b9dbea] bg-[#dff1fa] p-5 sm:p-7">
      <div className="absolute inset-5 rounded-[22px] border-2 border-[#6db4da]/50 sm:inset-7" />
      <div className="absolute left-1/2 top-[8%] h-[84%] w-px -translate-x-1/2 bg-[#6db4da]/45" />
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6db4da]/45" />
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4ba7d8]" />

      {positions.map(([label, left, top], index) => (
        <motion.div
          key={label}
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left, top }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, y: [0, index % 2 ? 3 : -3, 0] }}
          transition={{ opacity: { delay: index * 0.06 }, scale: { delay: index * 0.06 }, y: { duration: 4 + index * 0.15, repeat: Infinity, ease: "easeInOut" } }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-[#0f355a] text-[10px] font-black text-white shadow-[0_10px_24px_rgba(16,47,85,.14)] sm:h-14 sm:w-14">
            {label}
          </div>
        </motion.div>
      ))}

      <div className="absolute bottom-8 left-8 z-10 sm:bottom-10 sm:left-10">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#2d98d4]">Tu formación</p>
        <p className="mt-2 text-2xl font-black uppercase text-[#102f55] sm:text-3xl">8 jugadores</p>
      </div>
    </div>
  );
}

function AwardsVisual() {
  const bars = [
    { label: "MVP", value: 94, delay: 0.05 },
    { label: "Goleador", value: 82, delay: 0.14 },
    { label: "Rendimiento", value: 72, delay: 0.23 },
  ];

  return (
    <div className="relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#102f55] p-6 text-white sm:p-8">
      <div className="absolute right-0 top-0 h-full w-[44%] bg-[#123f68]" />
      <div className="absolute -right-10 top-7 h-44 w-44 rounded-full border border-[#77c2e8]/25" />
      <div className="absolute -right-4 top-20 h-28 w-28 rounded-full border border-[#77c2e8]/20" />

      <div className="relative z-10 max-w-[70%]">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#79c8ef]">Reconocimientos APA</p>
        <p className="mt-3 text-3xl font-black uppercase leading-none sm:text-4xl">Rendimiento que se ve</p>
      </div>

      <div className="relative z-10 mt-auto space-y-5">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[.13em] text-[#c9deeb]">
              <span>{bar.label}</span>
              <span>{bar.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-[#79c8ef]"
                initial={{ width: 0 }}
                animate={{ width: `${bar.value}%` }}
                transition={{ duration: 0.8, delay: bar.delay, ease: [0.2, 0.8, 0.2, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperienceVisual({ id }: { id: EntertainmentExperienceId }) {
  if (id === "predicciones") return <PredictionsVisual />;
  if (id === "dream-team") return <DreamTeamVisual />;
  return <AwardsVisual />;
}

export default function EntertainmentPortal() {
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<EntertainmentExperienceId>("predicciones");
  const active = useMemo(
    () => ENTERTAINMENT_EXPERIENCES.find((item) => item.id === activeId) ?? ENTERTAINMENT_EXPERIENCES[0],
    [activeId],
  );

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 80, damping: 18 });
  const springY = useSpring(pointerY, { stiffness: 80, damping: 18 });
  const orbX = useTransform(springX, [-1, 1], [-24, 24]);
  const orbY = useTransform(springY, [-1, 1], [-18, 18]);

  return (
    <main className="min-h-screen bg-[#f3fafe] text-[#102f55]">
      <section className="overflow-hidden border-b border-[#c9e3f1] bg-white">
        <div className="mx-auto grid max-w-[1680px] items-end gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10 lg:py-14">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#2d98d4]">APA / Comunidad</p>
            <h1 className="mt-3 text-[clamp(3.3rem,7vw,7.6rem)] font-black uppercase leading-[.84] tracking-[-.06em]">
              Entretenimiento
            </h1>
          </div>
          <div className="border-l border-[#cfe4f0] pl-6 lg:pb-2">
            <p className="text-[15px] font-semibold leading-7 text-[#607b90] sm:text-[16px]">
              No es otra sección de estadísticas. Es el lugar donde la comunidad juega con lo que pasa dentro de APA.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#eaf6fd] py-8 sm:py-10 lg:py-14">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute right-[7%] top-[8%] h-72 w-72 rounded-full bg-[#b9e2f7]/55 blur-3xl"
          style={prefersReducedMotion ? undefined : { x: orbX, y: orbY }}
        />

        <div
          className="relative mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-10"
          onPointerMove={(event) => {
            if (prefersReducedMotion) return;
            const rect = event.currentTarget.getBoundingClientRect();
            pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
            pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
          }}
          onPointerLeave={() => {
            pointerX.set(0);
            pointerY.set(0);
          }}
        >
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Experiencias de entretenimiento">
            {ENTERTAINMENT_EXPERIENCES.map((experience) => {
              const selected = experience.id === activeId;
              return (
                <button
                  key={experience.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveId(experience.id)}
                  className={`relative min-h-12 flex-none rounded-full px-5 text-[12px] font-black uppercase tracking-[.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56afe2] focus-visible:ring-offset-2 ${selected ? "text-white" : "border border-[#bfdcea] bg-white text-[#58748b] hover:text-[#102f55]"}`}
                >
                  {selected && (
                    <motion.span
                      layoutId="entertainment-active-tab"
                      className="absolute inset-0 rounded-full bg-[#102f55]"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{experience.title}</span>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[30px] border border-[#c5dfed] bg-white shadow-[0_30px_90px_rgba(16,47,85,.10)]">
            <div className="grid min-h-[620px] lg:grid-cols-[0.9fr_1.1fr]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active.id}-copy`}
                  role="tabpanel"
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, x: 28 }}
                  transition={{ duration: 0.36, ease: [0.2, 0.8, 0.2, 1] }}
                  className="flex min-h-0 flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12"
                >
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="h-px w-12 bg-[#56afe2]" />
                      <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#2d98d4]">{active.kicker}</p>
                    </div>

                    <h2 className="mt-6 max-w-[760px] text-[clamp(2.8rem,6vw,6.4rem)] font-black uppercase leading-[.86] tracking-[-.055em]">
                      {active.title}
                    </h2>

                    <p className="mt-6 max-w-[680px] text-[15px] font-semibold leading-7 text-[#607b90] sm:text-[17px]">
                      {active.description}
                    </p>

                    <div className="mt-8 divide-y divide-[#d8e9f2] border-y border-[#d8e9f2]">
                      {active.highlights.map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.06 + 0.08 }}
                          className="grid grid-cols-[1fr_auto] items-center gap-4 py-4"
                        >
                          <span className="text-[10px] font-black uppercase tracking-[.14em] text-[#6f899d]">{item.label}</span>
                          <strong className="text-right text-[16px] font-black uppercase text-[#102f55] sm:text-[18px]">{item.value}</strong>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href={active.href}
                      className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#56afe2] px-6 text-[12px] font-black uppercase tracking-[.08em] text-white transition hover:bg-[#3f9dd5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56afe2] focus-visible:ring-offset-2"
                    >
                      {active.cta}
                    </Link>
                    <span className="text-[10px] font-black uppercase tracking-[.14em] text-[#8aa0b0]">Experiencia APA</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="relative min-h-[420px] border-t border-[#d6e8f1] bg-[#f5fbfe] p-4 sm:p-6 lg:min-h-0 lg:border-l lg:border-t-0 lg:p-7 xl:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${active.id}-visual`}
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97, y: 18 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.985, y: -10 }}
                    transition={{ duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
                    className="h-full"
                  >
                    <ExperienceVisual id={active.id} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {ENTERTAINMENT_EXPERIENCES.map((experience, index) => {
              const selected = experience.id === activeId;
              return (
                <button
                  key={`footer-${experience.id}`}
                  type="button"
                  onClick={() => setActiveId(experience.id)}
                  className={`group flex min-h-20 items-center justify-between rounded-[18px] border px-5 text-left transition ${selected ? "border-[#9ed0ea] bg-[#dff2fb]" : "border-[#cfe4f0] bg-white hover:border-[#a8d3e9]"}`}
                >
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[.15em] text-[#7f99aa]">0{index + 1}</span>
                    <p className="mt-1 text-[14px] font-black uppercase text-[#102f55]">{experience.title}</p>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full transition ${selected ? "bg-[#56afe2]" : "bg-[#d6e8f1] group-hover:bg-[#9ed0ea]"}`} />
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
