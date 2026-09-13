"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dropdown visual propio de APA.
 * Evita el <select> nativo para que Windows/navegador no cambien los colores.
 */
export default function PredictionDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value)?.label || value;

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#607b90]">{label}</p>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-[#1b4f7f] bg-[#102f55] px-4 text-left text-xs font-black uppercase text-white transition hover:bg-[#173f73] focus:outline-none focus:ring-2 focus:ring-[#56afe2]/30"
      >
        <span className="truncate">{selected}</span>
        <span className={`ml-3 text-[#8ed2f3] transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-[#2d98d4]/35 bg-[#102f55] p-1.5 shadow-[0_18px_45px_rgba(16,47,85,.28)]">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-xs font-black uppercase transition ${
                  active
                    ? "bg-[#2d98d4] text-white"
                    : "text-white/85 hover:bg-[#173f73] hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
