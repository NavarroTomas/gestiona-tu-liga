"use client";

import { useEffect, useRef, useState } from "react";

export type APASelectOption = {
  value: string;
  label: string;
};

export default function APASelect({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
  compact = false,
}: {
  value: string;
  options: APASelectOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  compact?: boolean;
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
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-2 border border-[#c9e3f1] bg-white text-left font-black text-[#102f55] outline-none transition hover:border-[#56afe2] focus:border-[#56afe2] focus:ring-2 focus:ring-[#56afe2]/20 ${compact ? "h-9 rounded-[8px] px-2.5 text-[11px]" : "h-11 rounded-[9px] px-3 text-[12px] sm:h-12 sm:text-[13px]"}`}
      >
        <span className="min-w-0 truncate">{selected}</span>
        <span className={`shrink-0 text-[10px] text-[#459bd0] transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-[120] mt-1.5 max-h-[220px] overflow-y-auto overscroll-contain rounded-[9px] border border-[#b9d9ea] bg-white p-1.5 shadow-[0_16px_38px_rgba(16,47,85,.18)]"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex min-h-8 w-full items-center rounded-[7px] px-2.5 py-1.5 text-left text-[11px] font-bold leading-tight transition sm:text-[12px] ${active ? "bg-[#dff2fb] text-[#102f55]" : "text-[#315f89] hover:bg-[#f1f9fe]"}`}
              >
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
