import Link from "next/link";

type Props = { rankings: any; logoEquipo: (nombre?: string) => string | null; EscudoEquipo: any };

export default function RankingsPanel({ rankings, logoEquipo, EscudoEquipo }: Props) {
  const items = [
    { label: "Goleador", name: rankings.goleador?.nombre || "-", value: rankings.goleador?.goles || 0, equipo: rankings.goleador?.equipo, tone: "text-yellow-300" },
    { label: "Asistidor", name: rankings.asistidor?.nombre || "-", value: rankings.asistidor?.asistencias || 0, equipo: rankings.asistidor?.equipo, tone: "text-sky-200" },
    { label: "MVP", name: rankings.mvp?.nombre || "-", value: rankings.mvp?.mvps || 0, equipo: rankings.mvp?.equipo, tone: "text-emerald-200" },
  ];

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-yellow-400/25 bg-[#082c4f]/78 p-6 shadow-[0_25px_70px_rgba(0,0,0,.30)]">
      <img src="/themes/worldcup/trophy-balon.png" alt="" className="absolute -right-20 -top-14 h-72 w-72 object-cover opacity-18" />
      <div className="relative z-10">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">Líderes rápidos</p>
        <h2 className="mt-2 text-3xl font-black uppercase">Rankings mundialistas</h2>

        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <EscudoEquipo nombre={item.equipo} logo={logoEquipo(item.equipo)} size="sm" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">{item.label}</p>
                    <h3 className="mt-2 truncate text-xl font-black uppercase text-white">{item.name}</h3>
                  </div>
                </div>
                <p className={`text-4xl font-black ${item.tone}`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <Link href="/jugadores" className="mt-5 flex items-center justify-between rounded-2xl border border-yellow-400/25 bg-yellow-300 px-4 py-3 text-sm font-black uppercase text-[#06111f] transition hover:bg-white">
          Ver rankings completos <span>→</span>
        </Link>
      </div>
    </section>
  );
}
