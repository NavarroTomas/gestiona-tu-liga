"use client";
import { displayLabel } from "@/lib/displayLabels";


import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  theme: {
    badge: string;
    shortLabel: string;
  };
  temporada: string;
  divisionActual: {
    icon: string;
    label: string;
  };
};

const introStats = [
  { value: "T4", label: "Torneo oficial", icon: "🏆" },
  { value: "2", label: "Divisiones activas", icon: "⚽" },
  { value: "Liga", label: "Liga competitiva", icon: "AR" },
  { value: "Stats", label: "Fixture y rankings", icon: "📊" },
];

export default function HomeIntro({ theme, temporada, divisionActual }: Props) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const transformStyle = useMemo(
    () => ({
      "--mx": `${mouse.x}px`,
      "--my": `${mouse.y}px`,
    }) as React.CSSProperties,
    [mouse],
  );

  return (
    <section
      style={transformStyle}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        setMouse({ x: x / 42, y: y / 42 });
      }}
      onMouseLeave={() => setMouse({ x: 0, y: 0 })}
      className="group relative overflow-hidden rounded-[28px] border border-sky-300/20 bg-[#020814] shadow-[0_30px_90px_rgba(0,0,0,.45)] md:rounded-[40px]"
    >
      <div className="absolute inset-0">
        <Image
          src="/themes/worldcup/backgrounds/FotoCancha.png"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1240px"
          className="pointer-events-none select-none object-cover object-center transition duration-700 ease-out group-hover:scale-[1.025]"
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_42%,rgba(56,189,248,.10),transparent_34%),radial-gradient(circle_at_84%_70%,rgba(245,181,49,.10),transparent_36%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020814]/88 via-[#041528]/68 to-[#041528]/8" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020814]/82 via-transparent to-[#020814]/16" />

      <div
        className="pointer-events-none absolute -right-16 top-8 hidden h-56 w-56 rounded-full bg-sky-300/20 blur-3xl transition duration-700 lg:block"
        style={{ transform: "translate(calc(var(--mx) * 1.8), calc(var(--my) * 1.8))" }}
      />
      <div
        className="pointer-events-none absolute bottom-10 right-32 hidden h-40 w-64 rounded-full bg-amber-300/15 blur-3xl transition duration-700 lg:block"
        style={{ transform: "translate(calc(var(--mx) * -1.2), calc(var(--my) * -1.2))" }}
      />

      <div className="relative z-10 flex min-h-[560px] flex-col justify-between p-6 md:min-h-[610px] md:p-10 lg:min-h-[640px] lg:p-12">
        <div className="max-w-[650px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-black/22 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-amber-100 shadow-[0_12px_35px_rgba(0,0,0,.25)] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,.9)]" />
            <span>Liga Oficial Liga</span>
          </div>

          <h2 className="mt-6 max-w-[720px] text-[clamp(2.35rem,6.4vw,5.05rem)] font-black uppercase italic leading-[0.86] tracking-[-0.07em] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,.55)]">
            Liga
            <span className="block bg-gradient-to-r from-sky-200 via-white to-amber-100 bg-clip-text text-transparent">
              Liga Oficial
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-200/92 md:text-base md:leading-8">
            Seguí el torneo oficial de Liga en Pro Soccer Online: divisiones, fixture, clubes, estadísticas, rankings y toda la actividad competitiva.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="rounded-full border border-sky-200/25 bg-sky-200/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-sky-100 backdrop-blur-md md:text-xs">
              {displayLabel(temporada)}
            </span>
            <span className="rounded-full border border-amber-200/30 bg-amber-200/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100 backdrop-blur-md md:text-xs">
              {divisionActual.icon} {divisionActual.label} División
            </span>
            <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100 backdrop-blur-md md:text-xs">
              Liga activa
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/competicion"
              className="group/btn rounded-2xl border border-amber-200/28 bg-amber-300/75 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#06111f] shadow-[0_8px_20px_rgba(245,181,49,.10)] transition hover:-translate-y-0.5 hover:border-amber-100/45 hover:bg-amber-200/90 md:px-7 md:text-sm"
            >
              Ver competición
              <span className="ml-2 inline-block transition group-hover/btn:translate-x-1">→</span>
            </Link>
            <Link
              href="/guia"
              className="rounded-2xl border border-white/16 bg-white/[0.06] px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-100 shadow-[0_16px_35px_rgba(0,0,0,.22)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-sky-200/35 hover:bg-sky-200/10 md:px-7 md:text-sm"
            >
              Cómo funciona Liga
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-sky-100/70">
            <span className="h-px w-12 bg-gradient-to-r from-sky-300 to-transparent" />
            Centro de competición
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {introStats.map((stat) => (
              <div
                key={stat.label}
                className="group/card relative overflow-hidden rounded-2xl border border-white/10 bg-[#061525]/62 p-4 shadow-[0_18px_42px_rgba(0,0,0,.26)] backdrop-blur-md transition hover:-translate-y-1 hover:border-sky-200/30 hover:bg-[#08203a]/70"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/45 to-transparent opacity-0 transition group-hover/card:opacity-100" />
                <div className="flex items-start justify-between gap-3">
                  <span className="text-lg text-amber-200">{stat.icon}</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Liga
                  </span>
                </div>
                <p className="mt-4 text-2xl font-black uppercase leading-none tracking-[-0.05em] text-white md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-300/85">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
