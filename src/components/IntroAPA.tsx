"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  motion,
  type MotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

const INTRO_CLOSED_EVENT = "apa:intro-closed";

function IntroCopy({
  eyebrow,
  title,
  description,
  opacity,
  y,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  opacity: MotionValue<number>;
  y: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-x-0 top-[12vh] z-30 mx-auto flex max-w-5xl flex-col items-center px-5 text-center md:top-[14vh]"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.42em] text-sky-300 md:text-xs">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-3xl font-black uppercase italic leading-[0.94] text-white drop-shadow-[0_0_24px_rgba(56,189,248,.34)] md:text-6xl lg:text-7xl">
        {title}
      </h2>

      {description && (
        <p className="mt-5 max-w-2xl text-sm font-medium leading-relaxed text-zinc-300/80 md:text-base">
          {description}
        </p>
      )}
    </motion.div>
  );
}

function LatamMap({
  scale,
  x,
  y,
  opacity,
  argentinaOpacity,
  glowOpacity,
}: {
  scale: MotionValue<number>;
  x: MotionValue<string>;
  y: MotionValue<string>;
  opacity: MotionValue<number>;
  argentinaOpacity: MotionValue<number>;
  glowOpacity: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ scale, x, y, opacity }}
      className="absolute inset-0 z-10 flex items-center justify-center"
    >
      <svg
        viewBox="0 0 620 960"
        role="img"
        aria-label="Mapa estilizado de Latinoamérica"
        className="h-[91vh] w-auto max-w-[94vw] overflow-visible"
      >
        <defs>
          <linearGradient id="latamFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#0f2f50" />
            <stop offset="50%" stopColor="#0b1e36" />
            <stop offset="100%" stopColor="#071421" />
          </linearGradient>

          <linearGradient id="argentinaFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="38%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <filter id="latamGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="argentinaGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="22" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.ellipse
          style={{ opacity: glowOpacity }}
          cx="314"
          cy="535"
          rx="272"
          ry="342"
          fill="rgba(56,189,248,.10)"
          filter="url(#latamGlow)"
        />

        {/* México y América Central */}
        <path
          d="M124 108 178 80l63 18 28 42-12 48 29 32 28 6 16 37-29 28-18-12-20 24-21-25-30 2-14-28-24-4-8-30-25-8-7-38-31-17 11-27-20-31Z"
          fill="url(#latamFill)"
          stroke="rgba(125,211,252,.62)"
          strokeWidth="3"
        />

        {/* Caribe visual */}
        <path
          d="m341 251 44-13 26 11-31 15Zm67 23 44-6 19 12-46 8Zm-21 35 26-3 14 10-30 7Z"
          fill="rgba(56,189,248,.58)"
        />

        {/* Sudamérica */}
        <path
          d="M303 296 345 268l63 13 58 42 31 72-12 61-39 64-22 68-29 75-17 78-31 77-27 68-23-15-18-58-17-59-33-55-21-56-31-46-7-60-22-54 13-46 1-54 37-32 42-10Z"
          fill="url(#latamFill)"
          stroke="rgba(125,211,252,.68)"
          strokeWidth="4"
          filter="url(#latamGlow)"
        />

        {/* Argentina: capa independiente para protagonismo inicial */}
        <motion.path
          style={{ opacity: argentinaOpacity }}
          d="m305 590 26 22 16 51 15 52-4 60-16 57-20 54-20-15-18-58-17-59-21-49 11-37 6-54Z"
          fill="url(#argentinaFill)"
          stroke="rgba(224,242,254,.94)"
          strokeWidth="4"
          filter="url(#argentinaGlow)"
        />

        {/* Puntos de expansión regional */}
        {[
          [305, 714],
          [330, 601],
          [290, 524],
          [355, 477],
          [400, 410],
          [374, 337],
          [286, 254],
          [211, 187],
          [161, 127],
        ].map(([cx, cy], index) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="8" fill="rgba(56,189,248,.10)" />
            <circle cx={cx} cy={cy} r="3" fill="#7dd3fc">
              <animate
                attributeName="opacity"
                values=".3;1;.3"
                dur={`${2.3 + index * 0.18}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        <path
          d="M305 714C322 645 310 592 290 524c50-21 75-57 110-114M305 714c-14-170-10-345-94-527m94 527c51-179 28-305 69-377"
          fill="none"
          stroke="rgba(56,189,248,.30)"
          strokeDasharray="7 11"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    </motion.div>
  );
}

export default function IntroAPA() {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousPathnameRef = useRef(pathname);
  const [visible, setVisible] = useState(pathname === "/");
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setProgress(latest);
  });

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    if (pathname === "/" && previousPathname !== "/") {
      const frame = window.requestAnimationFrame(() => {
        setVisible(true);
        setClosing(false);
        setProgress(0);
        scrollContainerRef.current?.scrollTo({ top: 0 });
      });

      return () => window.cancelAnimationFrame(frame);
    }

    if (pathname !== "/") {
      const frame = window.requestAnimationFrame(() => {
        setVisible(false);
        setClosing(false);
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [visible]);

  const mapScale = useTransform(scrollYProgress, [0, 0.43, 0.66], [4.9, 1.18, 1]);
  const mapX = useTransform(scrollYProgress, [0, 0.43], ["-3%", "0%"]);
  const mapY = useTransform(scrollYProgress, [0, 0.43], ["-12%", "0%"]);
  const mapOpacity = useTransform(scrollYProgress, [0, 0.69, 0.82], [1, 1, 0.12]);
  const argentinaOpacity = useTransform(scrollYProgress, [0, 0.22, 0.48], [1, 1, 0.4]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.48, 0.72], [0.25, 1, 0.34]);

  const copyOriginOpacity = useTransform(scrollYProgress, [0.015, 0.07, 0.17, 0.24], [0, 1, 1, 0]);
  const copyOriginY = useTransform(scrollYProgress, [0.015, 0.09, 0.24], [28, 0, -24]);

  const copyGrowthOpacity = useTransform(scrollYProgress, [0.23, 0.30, 0.40, 0.48], [0, 1, 1, 0]);
  const copyGrowthY = useTransform(scrollYProgress, [0.23, 0.32, 0.48], [28, 0, -24]);

  const copyLatamOpacity = useTransform(scrollYProgress, [0.46, 0.53, 0.62, 0.70], [0, 1, 1, 0]);
  const copyLatamY = useTransform(scrollYProgress, [0.46, 0.55, 0.70], [28, 0, -24]);

  const psoX = useTransform(scrollYProgress, [0.67, 0.83], ["-52vw", "-1.5vw"]);
  const apaX = useTransform(scrollYProgress, [0.67, 0.83], ["52vw", "1.5vw"]);
  const logosOpacity = useTransform(scrollYProgress, [0.65, 0.73, 0.92], [0, 1, 1]);
  const logoScale = useTransform(scrollYProgress, [0.68, 0.84], [0.76, 1]);
  const connectorScale = useTransform(scrollYProgress, [0.76, 0.86], [0, 1]);

  const finalOpacity = useTransform(scrollYProgress, [0.84, 0.93], [0, 1]);
  const finalY = useTransform(scrollYProgress, [0.84, 0.93], [24, 0]);

  function closeIntro() {
    if (closing) return;

    setClosing(true);

    window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
      window.dispatchEvent(new Event(INTRO_CLOSED_EVENT));
    }, 520);
  }

  if (!visible || pathname !== "/") return null;

  const reachedEnd = progress >= 0.9;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[1000000] bg-[#01050b] text-white"
      aria-label="Presentación inicial de APA PSO Argentina"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(14,116,144,.22),transparent_34rem),radial-gradient(circle_at_50%_100%,rgba(37,99,235,.17),transparent_38rem),linear-gradient(180deg,#01050b_0%,#020a14_55%,#010409_100%)]" />
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(125,211,252,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,.04)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="absolute left-1/2 top-1/2 h-[78vh] w-[78vh] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/10 shadow-[0_0_120px_rgba(56,189,248,.12)]" />
        <div className="absolute left-1/2 top-1/2 h-[52vh] w-[52vh] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/10" />
      </div>

      <button
        type="button"
        onClick={closeIntro}
        className="fixed right-4 top-4 z-50 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-200 backdrop-blur-xl transition hover:border-sky-300/60 hover:bg-sky-400/10 hover:text-white md:right-7 md:top-6"
      >
        Omitir intro
      </button>

      <div className="fixed left-4 top-4 z-50 flex items-center gap-3 md:left-7 md:top-6">
        <Image
          src="/intro-apa/logo-apa.png"
          alt="Logo APA"
          width={44}
          height={44}
          priority
          className="h-11 w-11 rounded-xl border border-sky-300/20 bg-black/35 object-cover p-1 shadow-[0_0_20px_rgba(56,189,248,.14)] backdrop-blur-xl"
        />

        <div className="hidden sm:block">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white">APA PSO</p>
          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.34em] text-sky-300">Argentina</p>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto overscroll-contain"
      >
        <div className="relative h-[560vh]">
          <section className="sticky top-0 h-screen overflow-hidden">
            <LatamMap
              scale={mapScale}
              x={mapX}
              y={mapY}
              opacity={mapOpacity}
              argentinaOpacity={argentinaOpacity}
              glowOpacity={glowOpacity}
            />

            <IntroCopy
              eyebrow="El punto de partida"
              title={<>Desde Argentina</>}
              description="Una comunidad construida fecha tras fecha. Competencia organizada, identidad propia y una historia que continúa creciendo."
              opacity={copyOriginOpacity}
              y={copyOriginY}
            />

            <IntroCopy
              eyebrow="Una liga en expansión"
              title={<>12+ temporadas. 3500+ miembros.</>}
              description="Lo que comenzó como una liga nacional se transformó en un punto de encuentro para jugadores, clubes y comunidades de toda la región."
              opacity={copyGrowthOpacity}
              y={copyGrowthY}
            />

            <IntroCopy
              eyebrow="Pro Soccer Online en Latinoamérica"
              title={
                <>
                  Una de las comunidades competitivas
                  <span className="block text-sky-300">más grandes de Latinoamérica</span>
                </>
              }
              opacity={copyLatamOpacity}
              y={copyLatamY}
            />

            <motion.div
              style={{ opacity: logosOpacity, scale: logoScale }}
              className="absolute inset-0 z-40 flex items-center justify-center gap-3 px-4 md:gap-9"
            >
              <motion.div style={{ x: psoX }} className="flex w-[42vw] max-w-[340px] items-center justify-center">
                <Image
                  src="/intro-apa/logo-pro-soccer-online.png"
                  alt="Logo de Pro Soccer Online"
                  width={640}
                  height={360}
                  priority
                  className="h-auto w-full object-contain drop-shadow-[0_0_28px_rgba(255,255,255,.24)]"
                />
              </motion.div>

              <motion.div
                style={{ scaleX: connectorScale }}
                className="h-px w-12 origin-center bg-gradient-to-r from-transparent via-sky-300 to-transparent shadow-[0_0_22px_rgba(56,189,248,.95)] md:w-24"
              />

              <motion.div style={{ x: apaX }} className="flex w-[30vw] max-w-[250px] items-center justify-center">
                <Image
                  src="/intro-apa/logo-apa.png"
                  alt="Logo de APA PSO Argentina"
                  width={1254}
                  height={1254}
                  priority
                  className="h-auto w-full rounded-[24%] object-contain drop-shadow-[0_0_34px_rgba(56,189,248,.45)]"
                />
              </motion.div>
            </motion.div>

            <motion.div
              style={{ opacity: finalOpacity, y: finalY }}
              className="absolute inset-x-0 bottom-[8vh] z-50 flex flex-col items-center px-5 text-center"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-300 md:text-xs">
                APA PSO Argentina
              </p>

              <h2 className="mt-3 text-2xl font-black uppercase italic text-white md:text-5xl">
                Competí. Representá. Dejá tu legado.
              </h2>

              <button
                type="button"
                onClick={closeIntro}
                className={`mt-6 rounded-full border px-7 py-3 text-xs font-black uppercase tracking-[0.24em] transition-all duration-300 md:px-9 md:py-4 ${
                  reachedEnd
                    ? "border-sky-300/80 bg-sky-400 text-black shadow-[0_0_34px_rgba(56,189,248,.44)] hover:scale-[1.03] hover:bg-sky-300"
                    : "pointer-events-none border-white/10 bg-white/5 text-white/25"
                }`}
              >
                Ingresar al portal
              </button>
            </motion.div>

            <div className="pointer-events-none absolute inset-x-0 bottom-5 z-50 flex flex-col items-center gap-3 px-4">
              <p className={`text-[9px] font-black uppercase tracking-[0.34em] transition-opacity ${reachedEnd ? "opacity-0" : "text-zinc-400 opacity-100"}`}>
                Deslizá para continuar
              </p>

              <div className="h-1 w-full max-w-[360px] overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-sky-300 to-blue-600 shadow-[0_0_16px_rgba(56,189,248,.75)]"
                  style={{ scaleX: scrollYProgress }}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
