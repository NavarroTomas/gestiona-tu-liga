import Link from "next/link";
import type { ReactNode } from "react";

type WorldCupCardProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  bg?: string;
  tone?: "blue" | "gold" | "green" | "cyan" | "purple";
};

const tones = {
  blue: "border-sky-300/30 shadow-[0_18px_55px_rgba(56,189,248,.18)]",
  gold: "border-yellow-300/35 shadow-[0_18px_55px_rgba(250,204,21,.18)]",
  green: "border-emerald-300/30 shadow-[0_18px_55px_rgba(52,211,153,.16)]",
  cyan: "border-cyan-300/30 shadow-[0_18px_55px_rgba(34,211,238,.16)]",
  purple: "border-purple-300/30 shadow-[0_18px_55px_rgba(168,85,247,.16)]",
};

export default function WorldCupCard({
  children,
  className = "",
  href,
  bg,
  tone = "gold",
}: WorldCupCardProps) {
  const content = (
    <div
      className={`group relative overflow-hidden rounded-[32px] border bg-slate-950/35 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 ${tones[tone]} ${className}`}
    >
      {bg && (
        <img
          src={bg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-110 group-hover:opacity-55"
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,.16),transparent_32%),linear-gradient(135deg,rgba(14,165,233,.22),rgba(2,6,23,.64))]" />
      <div className="absolute -left-24 top-8 h-32 w-72 rotate-[-14deg] rounded-full bg-yellow-300/18 blur-2xl" />
      <div className="absolute -right-20 bottom-4 h-32 w-72 rotate-[14deg] rounded-full bg-emerald-300/12 blur-2xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="relative z-10">{children}</div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
