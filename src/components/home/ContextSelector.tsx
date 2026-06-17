type Props = {
  temporadas: string[];
  temporada: string;
  setTemporada: (value: string) => void;
  divisiones: any[];
  division: string;
  setDivision: (value: string) => void;
};

export default function ContextSelector({ temporadas, temporada, setTemporada, divisiones, division, setDivision }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-yellow-400/25 bg-[#061b35]/75 p-6 md:p-8">
      <img src="/themes/worldcup/card-bg-blue.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-18" />
      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-200">Competición actual</p>
            <h2 className="mt-2 text-3xl font-black uppercase md:text-5xl">Elegí contexto</h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-zinc-300">La portada se actualiza según la temporada y división seleccionada.</p>
        </div>

        <div className="grid gap-6">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-200">Temporada</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {temporadas.map((t) => (
                <button key={t} onClick={() => setTemporada(t)} className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${temporada === t ? "border-yellow-300 bg-yellow-300 text-[#06111f]" : "border-white/15 bg-white/10 text-zinc-300 hover:bg-white/15"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-sky-200">Categoría</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {divisiones.map((d) => (
                <button key={d.nombre} onClick={() => setDivision(d.nombre)} className={`rounded-2xl border px-4 py-4 text-sm font-black uppercase transition-all ${division === d.nombre ? "border-yellow-300 bg-gradient-to-r from-yellow-300 to-amber-500 text-[#06111f]" : "border-white/15 bg-white/10 text-zinc-300 hover:bg-white/15"}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
