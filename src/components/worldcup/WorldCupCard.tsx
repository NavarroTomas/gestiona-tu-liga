import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function WorldCupCard({ children, className = "" }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.065] shadow-[0_24px_70px_rgba(0,0,0,.28)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-amber-200/30 hover:bg-white/[0.085] ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/55 to-transparent" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-amber-200/10 blur-3xl" />
      {children}
    </div>
  );
}
