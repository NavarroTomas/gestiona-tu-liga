"use client";

import Link from "next/link";
import { useState } from "react";

type HelperTooltipProps = {
  title: string;
  description: string;
  example?: string;
  wrongExamples?: string[];
  guideHref?: string;
  guideLabel?: string;
};

export default function HelperTooltip({
  title,
  description,
  example,
  wrongExamples = [],
  guideHref,
  guideLabel = "Ver guía",
}: HelperTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Ayuda: ${title}`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-[11px] font-black text-sky-300 transition hover:border-sky-300 hover:bg-sky-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-sky-400/40"
      >
        ?
      </button>

      {open && (
        <span className="absolute left-1/2 top-8 z-50 w-[min(320px,calc(100vw-32px))] -translate-x-1/2 rounded-2xl border border-sky-400/25 bg-[#020714] p-4 text-left shadow-[0_0_35px_rgba(56,189,248,.22)]">
          <span className="block text-xs font-black uppercase tracking-[0.22em] text-sky-300">
            {title}
          </span>

          <span className="mt-2 block text-sm leading-6 text-zinc-300">
            {description}
          </span>

          {example && (
            <span className="mt-3 block rounded-xl border border-green-400/20 bg-green-400/10 p-3 text-xs font-black text-green-300">
              ✅ {example}
            </span>
          )}

          {wrongExamples.length > 0 && (
            <span className="mt-3 block space-y-2">
              {wrongExamples.map((wrong) => (
                <span
                  key={wrong}
                  className="block break-all rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-xs font-black text-red-200"
                >
                  ❌ {wrong}
                </span>
              ))}
            </span>
          )}

          {guideHref && (
            <Link
              href={guideHref}
              className="mt-3 inline-flex rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
            >
              📖 {guideLabel}
            </Link>
          )}
        </span>
      )}
    </span>
  );
}
