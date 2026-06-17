type Props = { stats: any[] };

export default function StatsGrid({ stats }: Props) {
  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="group relative overflow-hidden rounded-[28px] border border-white/15 bg-[#07365c]/65 p-5 shadow-[0_16px_45px_rgba(0,0,0,.24)] transition hover:-translate-y-1">
          <img src={stat.img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 transition group-hover:scale-110 group-hover:opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#061b35]/85 to-[#061b35]/60" />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300">{stat.label}</p>
              <h2 className={`mt-2 text-4xl font-black leading-none md:text-5xl ${stat.color}`}>{stat.value}</h2>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-yellow-200/90">{stat.detail}</p>
            </div>
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-yellow-300/30 bg-black/25 transition group-hover:scale-110">
              <img src={stat.img} alt={stat.label} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
