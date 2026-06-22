type StatItem = {
  label: string;
  value: number;
  img: string;
  detail: string;
  color: string;
};

type Props = { stats: StatItem[] };

function normalizeLabel(label: string) {
  if (label.toLowerCase() === "selecciones") return "Clubes";
  if (label.toLowerCase() === "jornadas") return "Partidos";
  return label;
}

export default function StatsGrid({ stats }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-sky-300/20 bg-[#020814] px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,.42)] md:px-8">
      <img
        src="/themes/worldcup/backgrounds/stats-keyart-01.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-[#020814]/35" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020814]/85 via-transparent to-[#020814]/75" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020814]/90 to-transparent" />

      <div className="relative z-10">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-200">
              Centro oficial de temporada
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase italic tracking-[-0.05em] text-white md:text-5xl">
              Estadísticas oficiales
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-200/80">
            Datos actualizados según la temporada y división seleccionada.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const label = normalizeLabel(stat.label);

            return (
              <div
                key={stat.label}
                className="relative border-l border-white/15 pl-5"
              >
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-200">
                  {label}
                </p>

                <div className="mt-2 flex items-end gap-3">
                  <span className="text-[clamp(3rem,7vw,5.8rem)] font-black italic leading-none tracking-[-0.09em] text-white drop-shadow-[0_12px_30px_rgba(0,0,0,.7)]">
                    {stat.value}
                  </span>
                </div>

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-sky-100/80">
                  {stat.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/10" />
    </section>
  );
}