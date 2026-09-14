"use client";

import Link from "next/link";
import type { PlayerMatchStats } from "@/lib/adminMatches/types";
import type { MatchValidationIssue } from "@/lib/adminMatches/domain";

export function AdminMatchBackLink({
  href = "/admin/partidos",
  label = "Volver a Partidos y resultados",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.13em] text-[#245f8e] transition hover:text-[#102f55]"
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}

export function MatchValidationPanel({ issues }: { issues: MatchValidationIssue[] }) {
  if (issues.length === 0) {
    return (
      <div className="rounded-2xl border border-[#b8d8c4] bg-[#f2faf5] p-4 text-sm font-bold text-[#24553a]">
        Validación correcta. No se detectaron inconsistencias.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((issue, index) => (
        <div
          key={`${issue.code}-${index}`}
          className={`rounded-2xl border p-4 text-sm font-semibold ${
            issue.level === "error"
              ? "border-[#ecc4c4] bg-[#fff7f7] text-[#8d3030]"
              : "border-[#ead9b2] bg-[#fffaf0] text-[#7c5b19]"
          }`}
        >
          {issue.message}
        </div>
      ))}
    </div>
  );
}

type NumericPlayerField =
  | "goals"
  | "assists"
  | "shots"
  | "shotsOnTarget"
  | "passes"
  | "keyPasses"
  | "tackles"
  | "keyTackles"
  | "interceptions"
  | "keyInterceptions"
  | "possessionsLost"
  | "gKSaves"
  | "gKCatches"
  | "overallRating"
  | "score";

const STAT_FIELDS: { key: NumericPlayerField; label: string }[] = [
  { key: "goals", label: "Goles" },
  { key: "assists", label: "Asist." },
  { key: "shots", label: "Tiros" },
  { key: "shotsOnTarget", label: "Al arco" },
  { key: "passes", label: "Pases" },
  { key: "keyPasses", label: "Pases clave" },
  { key: "tackles", label: "Tackles" },
  { key: "keyTackles", label: "T. clave" },
  { key: "interceptions", label: "Intercep." },
  { key: "keyInterceptions", label: "I. clave" },
  { key: "possessionsLost", label: "Pérdidas" },
  { key: "gKSaves", label: "Atajadas" },
  { key: "gKCatches", label: "Atrapadas" },
  { key: "overallRating", label: "Overall" },
  { key: "score", label: "Score" },
];

export function MatchPlayerEditor({
  player,
  index,
  onChange,
  onRemove,
  compact = false,
}: {
  player: PlayerMatchStats;
  index: number;
  onChange: (next: PlayerMatchStats) => void;
  onRemove?: () => void;
  compact?: boolean;
}) {
  function update<K extends keyof PlayerMatchStats>(key: K, value: PlayerMatchStats[K]) {
    onChange({ ...player, [key]: value });
  }

  return (
    <article className="rounded-[22px] border border-[#d9e2e9] bg-white p-5 shadow-[0_6px_18px_rgba(16,47,85,.05)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-[#72879a]">Jugador #{index + 1}</span>
            <input
              className="input"
              value={player.nombre || ""}
              onChange={(e) => update("nombre", e.target.value)}
              placeholder="Nombre"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-[#72879a]">Player ID</span>
            <input
              className="input"
              value={player.playerId || ""}
              onChange={(e) => update("playerId", e.target.value)}
              placeholder="Player ID"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-[#72879a]">Equipo</span>
            <input
              className="input"
              value={player.equipo || ""}
              onChange={(e) => update("equipo", e.target.value)}
              placeholder="Equipo"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-[#72879a]">Posición</span>
            <input
              className="input"
              value={player.posicion || ""}
              onChange={(e) => update("posicion", e.target.value)}
              placeholder="Posición"
            />
          </label>
        </div>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-[#edc7c7] bg-[#fff8f8] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#9e3d3d]"
          >
            Quitar
          </button>
        )}
      </div>

      {!compact && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {STAT_FIELDS.map((field) => (
            <label key={field.key}>
              <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.08em] text-[#8294a3]">{field.label}</span>
              <input
                type="number"
                step={field.key === "overallRating" ? "0.01" : "1"}
                className="input"
                value={String(player[field.key] ?? 0)}
                onChange={(e) => update(field.key, Number(e.target.value || 0) as never)}
              />
            </label>
          ))}
        </div>
      )}

      <label className="mt-4 inline-flex items-center gap-3 text-sm font-bold text-[#102f55]">
        <input
          type="checkbox"
          checked={Number(player.mvp || 0) > 0}
          onChange={(e) => update("mvp", e.target.checked ? 1 : 0)}
        />
        MVP del partido
      </label>
    </article>
  );
}
