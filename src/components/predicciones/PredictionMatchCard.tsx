"use client";

import { useEffect, useState } from "react";
import type { PrediccionesController } from "@/hooks/usePredicciones";
import type { PredictionChoice, PredictionMatch } from "@/lib/predicciones/types";
import {
  formatPredictionStart,
  isPredictionVotingOpen,
  predictionMatchKey,
} from "@/lib/predicciones/utils";

export default function PredictionMatchCard({
  match,
  controller,
}: {
  match: PredictionMatch;
  controller: PrediccionesController;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const open = isPredictionVotingOpen(match, new Date(now));
  const vote = controller.votoUsuario(match);
  const key = predictionMatchKey(match);
  const score = controller.marcadores[key] || { local: "", visitante: "" };
  const disabled = !open || !!vote || controller.enviando;

  return (
    <article data-editor-component="prediction-match-card" className="rounded-2xl border border-[#c9e3f1] bg-white p-5 md:p-6">
      <div data-editor-part="header" className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p data-editor-part="context" className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2d98d4]">
            {controller.contexto.short} · Fecha {match.fecha || "-"}
          </p>
          <h3 data-editor-part="teams" className="mt-2 text-2xl font-black uppercase tracking-[-.02em] text-[#102f55] md:text-3xl">
            {match.local} <span className="text-[#2d98d4]">vs</span> {match.visitante}
          </h3>
          <p data-editor-part="start-time" className="mt-2 text-sm text-[#607b90]">{formatPredictionStart(match)}</p>
        </div>
        <div data-editor-part="status" className={`rounded-xl px-4 py-3 ${open ? "bg-[#eaf6fd]" : "bg-[#102f55]"}`}>
          <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${open ? "text-[#2d98d4]" : "text-[#8ed2f3]"}`}>
            {open ? "Votación abierta" : "Votación cerrada"}
          </p>
          <p className={`mt-1 text-sm font-black ${open ? "text-[#102f55]" : "text-white"}`}>
            {open ? "Hasta el inicio del partido" : "El partido ya comenzó"}
          </p>
        </div>
      </div>

      <div data-editor-part="exact-score-box" className="mt-5 rounded-xl border border-[#c9e3f1] bg-[#f3fafe] p-4">
        <p data-editor-part="exact-score-label" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2d98d4]">Marcador exacto</p>
        <div data-editor-part="score-row" className="mt-3 grid grid-cols-[1fr_70px_24px_70px_1fr] items-center gap-2">
          <p data-editor-part="local-name" className="truncate text-right text-sm font-black uppercase text-[#102f55]">{match.local}</p>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={score.local}
            onChange={(event) => controller.actualizarMarcador(match, "local", event.target.value)}
            data-editor-part="local-score-input"
            className="h-11 rounded-lg border border-[#b9ddeb] bg-white text-center text-xl font-black text-[#102f55] outline-none disabled:opacity-50"
          />
          <span data-editor-part="score-separator" className="text-center font-black text-[#2d98d4]">-</span>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={score.visitante}
            onChange={(event) => controller.actualizarMarcador(match, "visitante", event.target.value)}
            data-editor-part="visitor-score-input"
            className="h-11 rounded-lg border border-[#b9ddeb] bg-white text-center text-xl font-black text-[#102f55] outline-none disabled:opacity-50"
          />
          <p data-editor-part="visitor-name" className="truncate text-sm font-black uppercase text-[#102f55]">{match.visitante}</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => controller.enviarPrediccion(match)}
          data-editor-part="save-score-button"
          className="mt-3 w-full rounded-lg bg-[#102f55] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#173f73] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {vote ? "Predicción enviada" : "Guardar marcador exacto"}
        </button>
      </div>

      <div data-editor-part="choice-grid" className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(["local", "empate", "visitante"] as PredictionChoice[]).map((choice) => (
          <button
            key={choice}
            data-editor-part="choice-button"
            type="button"
            disabled={disabled}
            onClick={() => controller.enviarPrediccion(match, choice)}
            className={`rounded-xl border px-4 py-3 text-xs font-black uppercase transition ${
              vote?.prediccion === choice
                ? "border-[#102f55] bg-[#102f55] text-white"
                : "border-[#c9e3f1] bg-[#f8fcfe] text-[#102f55] hover:border-[#56afe2] hover:bg-[#eaf6fd]"
            } disabled:cursor-not-allowed disabled:opacity-55`}
          >
            {choice === "local" ? match.local : choice === "visitante" ? match.visitante : "Empate"}
          </button>
        ))}
      </div>

      {vote && (
        <p data-editor-part="registered-message" className="mt-4 rounded-xl border border-[#b9ddeb] bg-[#eef8fd] p-3 text-sm font-bold text-[#102f55]">
          Tu predicción ya quedó registrada y no puede modificarse.
        </p>
      )}
    </article>
  );
}
