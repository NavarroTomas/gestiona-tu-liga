import type { ReactNode } from "react";

export default function HistorySectionTitle({
  children,
  inverse = false,
}: {
  children: ReactNode;
  inverse?: boolean;
}) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <h2
        className={`text-[22px] font-black uppercase leading-tight tracking-tight sm:text-2xl ${
          inverse ? "text-white" : "text-[#102f55]"
        }`}
      >
        {children}
      </h2>
      <span className={`h-px flex-1 ${inverse ? "bg-white/15" : "bg-[#c9e3f1]"}`} />
    </div>
  );
}
