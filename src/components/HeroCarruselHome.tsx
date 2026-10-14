"use client";

export default function HeroCarruselHome() {
  return (
    <section className="relative overflow-hidden rounded-[22px] sm:rounded-[32px] border border-sky-500/40 bg-gradient-to-r from-[#020714] via-[#07152f] to-[#020714] p-5 sm:p-6 md:p-8 lg:p-10 shadow-[0_0_50px_rgba(0,120,255,.25)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_35%)]" />

      <div className="relative z-10 flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-10">
        <div className="max-w-2xl">
          <p className="mb-4 text-[10px] sm:text-xs font-black tracking-[0.25em] sm:tracking-[0.45em] uppercase text-sky-400">
            COMUNIDAD Liga PSO
          </p>

          <h2 className="text-[clamp(2.2rem,8vw,4.2rem)] font-black leading-[0.95] uppercase">
            <span className="block bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              SEGUINOS EN
            </span>

            <span className="block text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,.8)]">
              TODAS NUESTRAS
            </span>

            <span className="block text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,.6)]">
              REDES
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-sm sm:text-base lg:text-lg text-zinc-300">
            Entrá al Discord oficial, seguí las novedades de la liga,
            highlights, clips, mercado de pases y toda la comunidad Liga PSO.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
            <a
              href="https://discord.gg/WCyqeJMmCU"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#5865F2] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm font-black uppercase text-center shadow-[0_0_30px_rgba(88,101,242,.7)] hover:scale-105 transition-all"
            >
              🎮 Discord
            </a>

            <a
              href="https://www.tiktok.com/@psoargentina_2026"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 border border-white/15 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm font-black uppercase text-center hover:border-sky-400/60 transition-all"
            >
              🎵 TikTok
            </a>

            <a
              href="https://www.youtube.com/@psoargcommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 border border-white/15 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm font-black uppercase text-center hover:border-red-400/60 transition-all"
            >
              ▶️ YouTube
            </a>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-[420px]">
          <div className="bg-[#0b1220] border border-sky-500/30 rounded-3xl p-4 sm:p-6 shadow-[0_0_25px_rgba(0,120,255,.15)]">
            <p className="mb-3 text-3xl sm:text-4xl">🎮</p>

            <h3 className="text-lg sm:text-xl font-black uppercase">
              Discord Oficial
            </h3>

            <p className="text-zinc-400 text-sm mt-2">
              Comunidad activa y organización de partidos.
            </p>
          </div>

          <div className="bg-[#0b1220] border border-red-500/30 rounded-3xl p-4 sm:p-6 shadow-[0_0_25px_rgba(239,68,68,.12)]">
            <p className="mb-3 text-3xl sm:text-4xl">▶️</p>

            <h3 className="text-lg sm:text-xl font-black uppercase">
              YouTube
            </h3>

            <p className="text-zinc-400 text-sm mt-2">
              Videos, highlights y contenido oficial de la liga.
            </p>
          </div>

          <div className="bg-[#0b1220] border border-white/20 rounded-3xl p-4 sm:p-6 shadow-[0_0_25px_rgba(255,255,255,.08)]">
            <p className="mb-3 text-3xl sm:text-4xl">🎵</p>

            <h3 className="text-lg sm:text-xl font-black uppercase">
              TikTok
            </h3>

            <p className="text-zinc-400 text-sm mt-2">
              Clips, highlights y goles destacados.
            </p>
          </div>

          <div className="bg-[#0b1220] border border-yellow-500/30 rounded-3xl p-4 sm:p-6 shadow-[0_0_25px_rgba(250,204,21,.12)]">
            <p className="mb-3 text-3xl sm:text-4xl">🏆</p>

            <h3 className="text-lg sm:text-xl font-black uppercase">
              Liga Oficial
            </h3>

            <p className="text-zinc-400 text-sm mt-2">
              Torneos competitivas y estadísticas reales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}