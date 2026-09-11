"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { seasonSummary, type HistoryMatch } from "@/lib/history";

export default function HistoriaPage() {
  const [matches, setMatches] = useState<HistoryMatch[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("partidos")
        .select("id, partido_id, local, visitante, resultado, fecha, temporada, division, dia, hora, competicion, grupo, fase, ronda, orden, llave, estado")
        .eq("temporada", "Temporada 4");

      if (!cancelled) setMatches((data || []) as HistoryMatch[]);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = seasonSummary(matches, []);
  return <main className="min-h-screen bg-[#f5fbfe]">{summary.matches}</main>;
}
