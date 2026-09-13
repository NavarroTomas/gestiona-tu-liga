import type { PremiosController } from "@/hooks/usePremios";

export default function PremiosHero({ controller }: { controller: PremiosController }) {
  return (
    <section className="rounded-2xl border border-[#c9e3f1] bg-white p-6 md:p-8">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#2d98d4]">APA PSO ARGENTINA</p>
      <h1 className="mt-3 text-[clamp(2.6rem,7vw,5rem)] font-black uppercase leading-[.9] tracking-[-.045em] text-[#102f55]">
        Premios <span className="text-[#2d98d4]">de la fecha</span>
      </h1>
      <p className="mt-5 max-w-3xl text-sm leading-6 text-[#607b90]">
        Reconocimientos automáticos según las estadísticas oficiales de cada jornada.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Jugadores" value={String(controller.jugadores.length)} />
        <Stat label="Competición" value={controller.contexto.label.split(" · ")[0]} />
        <Stat label="Contexto" value={controller.contexto.badge} />
        <Stat label="Fecha" value={`Fecha ${controller.fecha}`} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#d8e8f0] bg-[#f8fcfe] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7d98aa]">{label}</p>
      <p className="mt-1 truncate text-base font-black uppercase text-[#102f55]">{value}</p>
    </div>
  );
}
