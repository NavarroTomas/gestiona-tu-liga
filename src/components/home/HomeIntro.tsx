import Link from "next/link";

type Props = {
  theme: any;
  temporada: string;
  divisionActual: any;
};

export default function HomeIntro({ theme, temporada, divisionActual }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[42px] border border-yellow-400/25 bg-[#061b35]/80 p-7 shadow-[0_25px_70px_rgba(0,0,0,.35)] md:p-10">
      <img
        src="/themes/worldcup/background-worldcup.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#04152b]/95 via-[#07365c]/78 to-[#04152b]/86" />
      <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_330px] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.5em] text-yellow-300">
            {theme.badge}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {theme.flags.map((flag: string) => (
              <span key={flag} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xl backdrop-blur">
                {flag}
              </span>
            ))}
          </div>

          <h1 className="mt-5 text-5xl font-black uppercase italic leading-none md:text-7xl">
            <span className="block text-white">Portal</span>
            <span className="mt-2 block text-yellow-300">Oficial APA</span>
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-200">
            Toda la información de la liga en un solo lugar. Temporada 4 llega con identidad mundialista: color, fútbol y camino al campeón.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-2xl border border-sky-300/30 bg-sky-300/10 px-4 py-2 text-sm font-black uppercase text-sky-200">{temporada}</span>
            <span className="rounded-2xl border border-yellow-300/35 bg-yellow-300/10 px-4 py-2 text-sm font-black uppercase text-yellow-200">{divisionActual.icon} {divisionActual.label} División</span>
            <span className="rounded-2xl border border-green-300/30 bg-green-300/10 px-4 py-2 text-sm font-black uppercase text-green-200">● Liga activa</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/competicion" className="rounded-2xl bg-yellow-300 px-6 py-3 text-sm font-black uppercase text-[#06111f] transition hover:bg-white">
              Ver competición
            </Link>
            <Link href="/guia" className="rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-black uppercase text-zinc-100 backdrop-blur transition hover:bg-white/15">
              Cómo funciona APA
            </Link>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="relative rounded-[36px] border border-yellow-400/25 bg-white/10 p-6 backdrop-blur-md">
            <div className="relative z-10 text-center">
              <div className="mx-auto h-32 w-32 overflow-hidden rounded-[34px] border border-sky-400/30 bg-black/35">
                <img src="/logo-apa.png" alt="APA PSO" className="h-full w-full object-cover" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-yellow-300">{theme.shortLabel}</p>
              <h2 className="mt-2 text-3xl font-black uppercase">World Cup Hub</h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
