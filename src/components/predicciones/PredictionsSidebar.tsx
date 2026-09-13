import type { PrediccionesController } from "@/hooks/usePredicciones";

/** Ranking y resumen personal. Funciona también con identidad anónima. */
export default function PredictionsSidebar({ controller }: { controller: PrediccionesController }) {
  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-[#102f55] bg-[#102f55] p-5 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8ed2f3]">Ranking</p>
        <h2 className="mt-2 text-2xl font-black uppercase">Pronosticadores</h2>
        <p className="mt-2 text-sm text-white/60">Exacto = 3 pts · Ganador = 1 pt.</p>
        <div className="mt-4 space-y-2">
          {controller.ranking.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">Todavía no hay puntos.</p>
          ) : (
            controller.ranking.map((row, index) => (
              <div key={row.usuario} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black uppercase">{index + 1}. {controller.nombreUsuario(row.usuario)}</p>
                  <p className="mt-1 text-xs text-white/55">{row.aciertos}/{row.jugadas} aciertos · {row.exactos} exactos</p>
                </div>
                <p className="ml-3 text-2xl font-black text-[#8ed2f3]">{row.puntos}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[#c9e3f1] bg-white p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2d98d4]">Tus predicciones</p>
        <h2 className="mt-2 text-2xl font-black uppercase text-[#102f55]">Modo invitado</h2>
        <div className="mt-4 space-y-2">
          {controller.misPredicciones.length === 0 ? (
            <p className="rounded-xl border border-[#d8e8f0] bg-[#f8fcfe] p-3 text-sm text-[#607b90]">
              Todavía no hiciste predicciones en este contexto.
            </p>
          ) : (
            controller.misPredicciones.slice(0, 8).map((vote) => {
              const state = controller.estadoPrediccion(vote);
              return (
                <div key={vote.id} className="rounded-xl border border-[#d8e8f0] bg-[#f8fcfe] p-3">
                  <p className="text-sm font-black uppercase text-[#102f55]">{vote.local} vs {vote.visitante}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-[#607b90]">{vote.goles_local != null && vote.goles_visitante != null ? `${vote.goles_local}-${vote.goles_visitante}` : vote.prediccion}</span>
                    <span className="font-black uppercase text-[#2d98d4]">{state.label} · {state.points} pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </aside>
  );
}
