export default function TablaPosicionesHome({ tabla }: { tabla: any[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-blue-500/70 bg-[#020814] shadow-[0_0_25px_rgba(0,120,255,.45)]">
      <div className="bg-gradient-to-r from-[#051a3a] via-[#08245a] to-[#020814] px-4 py-3 border-b border-blue-500/50 flex items-center gap-3">
        <img
          src="/logo-apa.png"
          alt="APA PSO"
          className="w-10 h-10 rounded-lg object-cover"
        />

        <h2 className="text-xl font-black uppercase">
          Tabla de Posiciones
        </h2>
      </div>

      <div className="px-3 py-2 grid grid-cols-[34px_1fr_45px_45px_45px] text-[11px] text-blue-200 font-black uppercase">
        <span>POS</span>
        <span>Equipo</span>
        <span className="text-center">PTS</span>
        <span className="text-center">PJ</span>
        <span className="text-center">DG</span>
      </div>

      <div className="px-2 pb-3 space-y-[3px]">
        {tabla.map((e: any, i: number) => (
          <div
            key={i}
            className="grid grid-cols-[34px_1fr_45px_45px_45px] items-center min-h-[32px] rounded-md overflow-hidden bg-gradient-to-r from-[#06152e] via-[#08388a] to-[#06152e] border border-blue-400/20"
          >
            <div
              className={`h-full flex items-center justify-center text-white font-black text-sm ${
                i < 8
                  ? "bg-green-600"
                  : i < 12
                  ? "bg-yellow-500 text-black"
                  : "bg-red-600"
              }`}
            >
              {i + 1}
            </div>

            <div className="px-2 font-black text-[13px] truncate uppercase">
              {e.nombre}
            </div>

            <div className="text-center font-black text-blue-100 bg-blue-700/50 h-full flex items-center justify-center">
              {e.pts}
            </div>

            <div className="text-center font-black h-full flex items-center justify-center">
              {e.pj}
            </div>

            <div className="text-center font-black h-full flex items-center justify-center">
              {e.gf - e.gc}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 pt-2 space-y-2 text-xs font-black uppercase">
        <p className="flex items-center gap-2">
          <span className="w-10 h-3 rounded bg-green-600" />
          Clasifica a Playoffs
        </p>

        <p className="flex items-center gap-2">
          <span className="w-10 h-3 rounded bg-yellow-500" />
          Play-in
        </p>

        <p className="flex items-center gap-2">
          <span className="w-10 h-3 rounded bg-red-600" />
          Descenso
        </p>
      </div>
    </div>
  );
}