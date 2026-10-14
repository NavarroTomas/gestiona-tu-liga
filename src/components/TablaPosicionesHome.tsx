type EquipoTabla = {
  nombre: string;
  pts?: number;
  pj?: number;
  gf?: number;
  gc?: number;
};

function getZona(index: number) {
  if (index < 8) {
    return {
      label: "Playoffs",
      dot: "bg-emerald-400",
      bar: "from-emerald-500 to-emerald-600",
      text: "text-emerald-300",
      row: "border-emerald-400/25",
    };
  }

  if (index < 12) {
    return {
      label: "Play-in",
      dot: "bg-yellow-400",
      bar: "from-yellow-400 to-amber-500",
      text: "text-yellow-300",
      row: "border-yellow-400/25",
    };
  }

  return {
    label: "Descenso",
    dot: "bg-red-500",
    bar: "from-red-500 to-rose-600",
    text: "text-red-300",
    row: "border-red-400/25",
  };
}

function getMedalla(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return null;
}

export default function TablaPosicionesHome({ tabla }: { tabla: any[] }) {
  const lider = tabla?.[0];

  return (
    <div className="card-premium overflow-hidden rounded-[28px] border border-sky-500/30 bg-[#020814]/95 shadow-[0_0_35px_rgba(0,120,255,.28)]">
      <div className="relative overflow-hidden border-b border-sky-500/25 bg-gradient-to-r from-[#04152e] via-[#08245a] to-[#020814] px-5 py-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.22),transparent_34%)]" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-sky-400/35 bg-black/40 shadow-[0_0_22px_rgba(56,189,248,.22)]">
              <img
                src="/logo-apa.png"
                alt="Liga PSO"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-300">
                Competición
              </p>

              <h2 className="text-xl font-black uppercase text-white">
                Tabla de Posiciones
              </h2>
            </div>
          </div>

          {lider && (
            <div className="hidden rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-right sm:block">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-yellow-300">
                Líder
              </p>

              <p className="max-w-[120px] truncate text-sm font-black uppercase text-white">
                {lider.nombre}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[42px_1fr_52px_44px_48px] px-3 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-sky-200/80">
        <span className="text-center">#</span>
        <span>Equipo</span>
        <span className="text-center">PTS</span>
        <span className="text-center">PJ</span>
        <span className="text-center">DG</span>
      </div>

      <div className="space-y-2 px-3 pb-4">
        {tabla.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm font-bold text-zinc-500">
            Todavía no hay equipos cargados.
          </div>
        )}

        {tabla.map((e, i) => {
          const zona = getZona(i);
          const medalla = getMedalla(i);
          const diferencia = Number(e.gf || 0) - Number(e.gc || 0);

          return (
            <div
              key={`${e.nombre}-${i}`}
              className={`group relative grid min-h-[46px] grid-cols-[42px_1fr_52px_44px_48px] items-center overflow-hidden rounded-2xl border bg-gradient-to-r from-[#06152e]/95 via-[#082a63]/80 to-[#06152e]/95 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/45 hover:shadow-[0_12px_30px_rgba(56,189,248,.12)] ${zona.row} ${
                i === 0
                  ? "ring-1 ring-yellow-400/25 shadow-[0_0_24px_rgba(250,204,21,.10)]"
                  : ""
              }`}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_left,rgba(56,189,248,.13),transparent_34%)]" />

              <div
                className={`relative z-10 flex h-full items-center justify-center bg-gradient-to-b ${zona.bar} text-sm font-black text-white`}
              >
                {medalla ? (
                  <span className="drop-shadow">{medalla}</span>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>

              <div className="relative z-10 min-w-0 px-3">
                <p className="truncate text-[13px] font-black uppercase text-white">
                  {e.nombre}
                </p>

                <p className={`mt-0.5 text-[9px] font-black uppercase tracking-[0.18em] ${zona.text}`}>
                  {zona.label}
                </p>
              </div>

              <div className="relative z-10 flex h-full items-center justify-center border-l border-white/10 bg-sky-500/12 text-base font-black text-sky-100">
                {e.pts || 0}
              </div>

              <div className="relative z-10 flex h-full items-center justify-center border-l border-white/10 text-sm font-black text-zinc-200">
                {e.pj || 0}
              </div>

              <div
                className={`relative z-10 flex h-full items-center justify-center border-l border-white/10 text-sm font-black ${
                  diferencia > 0
                    ? "text-emerald-300"
                    : diferencia < 0
                    ? "text-red-300"
                    : "text-zinc-300"
                }`}
              >
                {diferencia > 0 ? `+${diferencia}` : diferencia}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-sky-500/20 bg-black/30 px-4 py-4">
        <div className="grid grid-cols-1 gap-2 text-[11px] font-black uppercase sm:grid-cols-3">
          <p className="flex items-center gap-2 text-zinc-300">
            <span className="h-3 w-8 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,.45)]" />
            Playoffs
          </p>

          <p className="flex items-center gap-2 text-zinc-300">
            <span className="h-3 w-8 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,.45)]" />
            Play-in
          </p>

          <p className="flex items-center gap-2 text-zinc-300">
            <span className="h-3 w-8 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.45)]" />
            Descenso
          </p>
        </div>
      </div>
    </div>
  );
}
