"use client";

import { seasonSummary } from "@/lib/history";

export default function HistoriaPage() {
  const summary = seasonSummary([], []);
  return <main className="min-h-screen bg-[#f5fbfe]">{summary.matches}</main>;
}
