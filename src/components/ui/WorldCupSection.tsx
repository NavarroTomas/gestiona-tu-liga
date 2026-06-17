import type { ReactNode } from "react";

type WorldCupSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export default function WorldCupSection({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: WorldCupSectionProps) {
  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          {eyebrow && (
            <p className="inline-flex rounded-full border border-yellow-300/35 bg-yellow-300/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.32em] text-yellow-200 shadow-[0_0_25px_rgba(250,204,21,.18)]">
              {eyebrow}
            </p>
          )}

          <h2 className="mt-4 text-[clamp(2rem,6vw,4rem)] font-black uppercase italic leading-none text-white drop-shadow-[0_0_24px_rgba(255,255,255,.16)]">
            <span className="relative inline-block">
              <span className="absolute -bottom-2 left-0 h-4 w-full -rotate-1 rounded-full bg-gradient-to-r from-yellow-300 via-emerald-300 to-sky-300 opacity-75 blur-sm" />
              <span className="relative">{title}</span>
            </span>
          </h2>
        </div>

        {description && (
          <p className="max-w-2xl text-sm leading-7 text-zinc-200/85 md:text-base">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}
