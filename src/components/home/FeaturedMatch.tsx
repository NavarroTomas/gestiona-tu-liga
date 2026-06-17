import Link from "next/link";

type Props = {
  partido: any;
  temporada: string;
  division: string;
  divisionLabel: string;
  logoEquipo: (nombre?: string) => string | null;
  EscudoEquipo: any;
};

export default function FeaturedMatch({
  partido,
  temporada,
  division,
  divisionLabel,
  logoEquipo,
  EscudoEquipo,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[38px] border border-yellow-400/30 bg-[#061b35]/75 p-5 shadow-[0_25px_70px_rgba(0,0,0,.35)] md:p-7">
      <img
        src="/themes/worldcup/card-partidos.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#05192f]/92 via-[#07365c]/72 to-[#061b35]/95" />
      <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-yellow-300/15 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-yellow-300">
              {temporada} · {divisionLabel}
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase text-white md:text-5xl">
              Partido destacado
            </h2>
          </div>

          <Link
            href={`/fixture/${division}?temporada=${encodeURIComponent(temporada)}`}
            className="rounded-2xl bg-yellow-300 px-5 py-3 text-xs font-black uppercase text-[#06111f] transition hover:bg-white"
          >
            Ver fixture
          </Link>
        </div>

        {partido ? (
          <>
            <div className="grid items-center gap-4 lg:grid-cols-[1fr_130px_1fr]">
              <TeamBox side="Local" name={partido.local} logo={logoEquipo(partido.local)} EscudoEquipo={EscudoEquipo} />

              <div className="mx-auto flex h-[110px] w-[130px] items-center justify-center rounded-[30px] border border-yellow-300/35 bg-yellow-300 text-center text-4xl font-black leading-none text-[#06111f] shadow-[0_18px_45px_rgba(0,0,0,.35)]">
                {partido.resultado || "VS"}
              </div>

              <TeamBox side="Visitante" name={partido.visitante} logo={logoEquipo(partido.visitante)} EscudoEquipo={EscudoEquipo} />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-white/80">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">Fecha {partido.fecha}</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">{partido.dia || "Día sin cargar"}</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">{partido.hora || "Hora sin cargar"}</span>
            </div>
          </>
        ) : (
          <p className="rounded-2xl border border-white/15 bg-white/10 p-6 text-zinc-300">No hay partidos cargados.</p>
        )}
      </div>
    </section>
  );
}

function TeamBox({ side, name, logo, EscudoEquipo }: any) {
  return (
    <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 text-center backdrop-blur-md">
      <div className="mb-4 flex justify-center">
        <EscudoEquipo nombre={name} logo={logo} size="lg" />
      </div>
      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-yellow-200/80">{side}</p>
      <h3 className="mx-auto max-w-[360px] break-words text-2xl font-black uppercase leading-tight text-white md:text-3xl">
        {name}
      </h3>
    </div>
  );
}
