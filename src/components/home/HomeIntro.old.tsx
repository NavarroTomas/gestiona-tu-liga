import Link from "next/link";

type Props = {
  theme: {
    badge: string;
    shortLabel: string;
  };
  temporada: string;
  divisionActual: {
    icon: string;
    label: string;
  };
};

const introFlags = [
  "/themes/worldcup-real/flags/ar.png",
  "/themes/worldcup-real/flags/br.png",
  "/themes/worldcup-real/flags/uy.png",
  "/themes/worldcup-real/flags/co.png",
];

export default function HomeIntro({ theme, temporada, divisionActual }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[26px] border border-yellow-300/24 bg-[#031225] p-6 shadow-[0_30px_90px_rgba(0,0,0,.55)] md:p-10">
      <img
        src="/themes/worldcup-real/photos/stadium-night.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020814]/96 via-[#031225]/58 to-[#020814]/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35" />
      <div className="absolute -bottom-16 -left-16 h-44 w-[46%] -rotate-6 bg-sky-300/22 blur-3xl" />
      <div className="absolute -bottom-14 -right-10 h-44 w-[42%] rotate-6 bg-yellow-300/20 blur-3xl" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-center">
        <div>
          <p className="inline-flex rounded-md bg-yellow-300 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#06111f] shadow-[0_10px_22px_rgba(0,0,0,.32)]">
            {theme.badge}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {introFlags.map((src) => (
              <span
                key={src}
                className="relative h-9 w-12 overflow-hidden rounded border border-white/25 bg-black/35 shadow-[0_8px_18px_rgba(0,0,0,.35)]"
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </span>
            ))}
          </div>

          <h1 className="mt-7 text-6xl font-black uppercase italic leading-[0.85] tracking-tight md:text-8xl">
            <span className="block text-white drop-shadow-[0_5px_18px_rgba(0,0,0,.8)]">
              Portal
            </span>
            <span className="mt-3 block text-yellow-300 drop-shadow-[0_5px_18px_rgba(0,0,0,.8)]">
              Oficial APA
            </span>
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-zinc-100">
            Toda la informacion de la liga en un solo lugar. Temporada 4 llega
            con identidad mundialista: barrio, futbol y camino al campeon.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-xl border border-sky-300/35 bg-sky-300/15 px-4 py-2 text-sm font-black uppercase text-sky-100 backdrop-blur">
              {temporada}
            </span>
            <span className="rounded-xl border border-yellow-300/40 bg-yellow-300/15 px-4 py-2 text-sm font-black uppercase text-yellow-100 backdrop-blur">
              {divisionActual.icon} {divisionActual.label} Division
            </span>
            <span className="rounded-xl border border-green-300/35 bg-green-300/15 px-4 py-2 text-sm font-black uppercase text-green-100 backdrop-blur">
              Liga activa
            </span>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/competicion"
              className="rounded-xl bg-yellow-300 px-7 py-3 text-sm font-black uppercase text-[#06111f] shadow-[0_12px_28px_rgba(0,0,0,.35)] transition hover:bg-white"
            >
              Ver competicion -&gt;
            </Link>
            <Link
              href="/guia"
              className="rounded-xl border border-white/20 bg-black/35 px-7 py-3 text-sm font-black uppercase text-zinc-100 backdrop-blur transition hover:bg-white/15"
            >
              Como funciona APA
            </Link>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-[24px] border border-yellow-300/28 bg-black/35 p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)] backdrop-blur-md">
            <img
              src="/themes/worldcup-real/photos/pitch-lights.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-38"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/38 to-transparent" />

            <div className="relative z-10 text-center">
              <div className="mx-auto h-32 w-32 overflow-hidden rounded-[24px] border border-sky-300/35 bg-black/40 shadow-[0_18px_45px_rgba(0,0,0,.45)]">
                <img src="/logo-apa.png" alt="APA PSO" className="h-full w-full object-cover" />
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
                {theme.shortLabel}
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase text-white">
                World Cup Hub
              </h2>

              <div className="mt-5 flex justify-center gap-2">
                {introFlags.slice(0, 3).map((src) => (
                  <img key={src} src={src} alt="" className="h-7 w-10 rounded object-cover" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
