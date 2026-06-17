import type { ReactNode } from "react";

export default function WorldCupPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[36px] border border-white/15 bg-white/[0.075] p-6 shadow-[0_22px_70px_rgba(0,0,0,.28)] backdrop-blur-2xl ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,.12),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
