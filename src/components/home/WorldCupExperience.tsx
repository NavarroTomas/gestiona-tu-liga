"use client";

type Division = {
  nombre: string;
  label: string;
  icon: string;
};

type Props = {
  temporadas: string[];
  temporada: string;
  setTemporada: (value: string) => void;
  divisiones: Division[];
  division: string;
  setDivision: (value: string) => void;
};

export default function WorldCupExperience({
  temporadas,
  temporada,
  setTemporada,
  divisiones,
  division,
  setDivision,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-sky-300/20 bg-[#020814] shadow-[0_24px_80px_rgba(0,0,0,.42)]">
      <img
        src="/themes/worldcup/backgrounds/context-selector-keyart-02.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[62%_center]"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#020814]/96 via-[#020814]/58 to-[#020814]/8" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020814]/55" />

      <div className="relative z-10 min-h-[380px] p-5 sm:p-7 lg:p-8">
        <div className="max-w-[620px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/35 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-amber-100 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Navegador oficial
          </div>

          <h2 className="mt-5 max-w-[580px] text-[clamp(2.1rem,5vw,3.7rem)] font-black uppercase italic leading-[0.92] tracking-[-0.055em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,.55)]">
            Seleccioná tu competición
          </h2>

          <p className="mt-5 max-w-[460px] text-sm leading-6 text-slate-200/90">
            Elegí la temporada y la división para actualizar estadísticas,
            fixture, rankings y partido destacado.
          </p>

          <div className="mt-7 space-y-5">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Temporada
              </p>

              <div className="flex flex-wrap gap-2">
                {temporadas.map((item) => {
                  const active = temporada === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTemporada(item)}
                      className={[
                        "rounded-2xl border px-5 py-3 text-xs font-black uppercase tracking-[0.12em] transition",
                        active
                          ? "border-amber-200/60 bg-amber-200 text-[#06111f] shadow-[0_12px_30px_rgba(250,204,21,.18)]"
                          : "border-white/12 bg-black/35 text-white/80 hover:border-white/25 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                División
              </p>

              <div className="grid max-w-[560px] grid-cols-2 gap-2 sm:grid-cols-4">
                {divisiones.map((item) => {
                  const active = division === item.nombre;

                  return (
                    <button
                      key={item.nombre}
                      type="button"
                      onClick={() => setDivision(item.nombre)}
                      className={[
                        "rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.12em] transition",
                        active
                          ? "border-amber-200/60 bg-amber-200 text-[#06111f] shadow-[0_12px_30px_rgba(250,204,21,.18)]"
                          : "border-white/12 bg-black/35 text-white/80 hover:border-white/25 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/10" />
    </section>
  );
}