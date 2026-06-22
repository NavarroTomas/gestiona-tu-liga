import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  variant?: "blueprint" | "stadium" | "gold";
};

const variants = {
  blueprint: {
    background: "/themes/worldcup/backgrounds/world-map-blue-01.png",
    accent: "from-sky-300/16 via-transparent to-amber-300/10",
  },
  stadium: {
    background: "/themes/worldcup/backgrounds/stadium-empty-night-01.png",
    accent: "from-sky-300/18 via-transparent to-white/8",
  },
  gold: {
    background: "/themes/worldcup/backgrounds/gold-abstract-01.png",
    accent: "from-amber-300/18 via-transparent to-sky-300/8",
  },
};

export default function SectionBackground({
  children,
  className = "",
  variant = "blueprint",
}: Props) {
  const current = variants[variant];

  return (
    <section
      className={`relative isolate overflow-hidden rounded-[30px] border border-white/10 bg-[#061426] shadow-[0_34px_110px_rgba(0,0,0,.48)] ${className}`}
    >
      <img
        src={current.background}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-30 h-full w-full object-cover opacity-[0.22]"
      />

      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,.18),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(250,204,21,.12),transparent_30%),linear-gradient(135deg,#041020_0%,#071c34_48%,#020817_100%)]" />
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${current.accent}`} />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.08]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />

      {children}
    </section>
  );
}
