"use client";

import { useState } from "react";

export default function ClubBadge({ name, src, className = "h-11 w-11" }: { name: string; src?: string | null; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const usable = Boolean(src && src !== failedSrc && !/^https:\/\/(?:cdn|media)\.discordapp\.(?:com|net)\//i.test(src));
  return <span className={`apa-cup-badge flex shrink-0 items-center justify-center ${className}`}>
    {usable ? <img src={src!} alt={`Escudo de ${name}`} className="h-full w-full object-contain" onError={() => setFailedSrc(src || null)} />
      : <span aria-label={`Escudo pendiente: ${name}`} className="flex h-full w-full items-center justify-center rounded-lg bg-[#e4f0f9] text-sm font-black text-[#355d83]">{name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}</span>}
  </span>;
}
