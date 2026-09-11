"use client";

import { useHistory } from "@/hooks/useHistory";

export default function HistoriaPage() {
  const hookDisponible = Boolean(useHistory);
  return <main className="min-h-screen bg-[#f5fbfe]">{hookDisponible ? "Historia" : ""}</main>;
}
