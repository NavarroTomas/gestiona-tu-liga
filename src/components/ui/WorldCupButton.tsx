import Link from "next/link";
import type { ReactNode } from "react";

type WorldCupButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "green";
  className?: string;
};

const variants = {
  primary: "border-yellow-200/50 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-500 text-black shadow-[0_0_28px_rgba(250,204,21,.32)] hover:from-white hover:to-yellow-200",
  secondary: "border-sky-200/35 bg-sky-400/15 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,.18)] hover:bg-sky-300 hover:text-black",
  green: "border-emerald-200/35 bg-emerald-400/15 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,.18)] hover:bg-emerald-300 hover:text-black",
};

export default function WorldCupButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
}: WorldCupButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-xs font-black uppercase tracking-[0.12em] transition hover:-translate-y-0.5 ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
