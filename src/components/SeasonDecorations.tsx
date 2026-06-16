"use client";

import { getSeasonTheme } from "@/lib/seasonTheme";

export default function SeasonDecorations() {
  const theme = getSeasonTheme();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute left-[-10%] top-[8%] h-72 w-72 rounded-full border border-white/40" />
        <div className="absolute right-[-8%] top-[18%] h-96 w-96 rounded-full border border-white/30" />
        <div className="absolute bottom-[-10%] left-[20%] h-80 w-80 rounded-full border border-white/25" />
      </div>

      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/[0.035] to-transparent" />

      <div className="absolute left-4 top-28 hidden rotate-[-12deg] gap-3 opacity-20 md:flex">
        {theme.flags.slice(0, 5).map((flag) => (
          <span key={flag} className="text-4xl drop-shadow-[0_0_18px_rgba(255,255,255,.35)]">
            {flag}
          </span>
        ))}
      </div>

      <div className="absolute bottom-20 right-6 hidden rotate-[10deg] gap-3 opacity-20 lg:flex">
        {theme.flags.slice(5, 10).map((flag) => (
          <span key={flag} className="text-4xl drop-shadow-[0_0_18px_rgba(255,255,255,.35)]">
            {flag}
          </span>
        ))}
      </div>

      {theme.floatingIcons.map((icon, index) => (
        <span
          key={`${icon}-${index}`}
          className="absolute text-5xl opacity-[0.07] blur-[0.2px]"
          style={{
            left: `${12 + index * 18}%`,
            top: `${18 + (index % 3) * 24}%`,
            transform: `rotate(${index % 2 === 0 ? -16 : 14}deg)`,
          }}
        >
          {icon}
        </span>
      ))}
    </div>
  );
}
