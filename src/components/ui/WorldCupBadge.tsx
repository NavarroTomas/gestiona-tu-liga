import type { ReactNode } from "react";

type WorldCupBadgeProps = {
  children: ReactNode;
  tone?: "gold" | "blue" | "green" | "white";
  className?: string;
};

const tones = {
  gold: "border-yellow-300/35 bg-yellow-300/15 text-yellow-200",
  blue: "border-sky-300/35 bg-sky-300/15 text-sky-200",
  green: "border-emerald-300/35 bg-emerald-300/15 text-emerald-200",
  white: "border-white/20 bg-white/10 text-white",
};

export default function WorldCupBadge({ children, tone = "gold", className = "" }: WorldCupBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] backdrop-blur-md ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
