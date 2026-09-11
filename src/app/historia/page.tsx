"use client";

import { useEffect, useRef, useState } from "react";
import { HISTORY_CONFIG } from "@/config/history";
import { useHistory } from "@/hooks/useHistory";

export default function HistoriaPage() {
  const [season, setSeason] = useState(HISTORY_CONFIG.defaultSeason);
  const initialized = useRef(false);
  const data = useHistory(season);

  useEffect(() => {
    if (initialized.current || data.seasons.length === 0) return;
    initialized.current = true;
    setSeason(data.seasons[data.seasons.length - 1]);
  }, [data.seasons]);

  return <main className="min-h-screen bg-[#f5fbfe]">{season}</main>;
}
