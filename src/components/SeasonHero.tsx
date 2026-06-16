import { getSeasonTheme } from "@/lib/seasonTheme";

export default function SeasonHero() {
  const theme = getSeasonTheme();

  return (
    <section className={`${theme.panel} p-6 md:p-10 ${theme.glow}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,.18),transparent_42%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25" />

      <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.35em] ${theme.accentText}`}>
            {theme.badge}
          </p>

          <h1 className="mt-4 text-[clamp(2.4rem,7vw,5.4rem)] font-black uppercase italic leading-none text-white">
            {theme.heroTitle}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 md:text-lg">
            {theme.heroSubtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {theme.flags.map((flag) => (
              <span
                key={flag}
                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-2 text-2xl"
              >
                {flag}
              </span>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-3xl" />
          <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-yellow-400/30 bg-black/35 text-9xl shadow-[0_0_55px_rgba(250,204,21,.18)]">
            {theme.icon}
          </div>
        </div>
      </div>
    </section>
  );
}
