"use client";

export default function HeroCarruselHome() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-sky-500/40 bg-gradient-to-r from-[#020714] via-[#07152f] to-[#020714] p-8 md:p-10 shadow-[0_0_50px_rgba(0,120,255,.25)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,.18),transparent_35%)]" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="max-w-2xl">
          <p className="text-sky-400 text-xs font-black tracking-[0.45em] uppercase mb-4">
            COMUNIDAD APA PSO
          </p>

          <h2 className="text-4xl md:text-6xl font-black leading-[0.95] uppercase">
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

          <p className="text-zinc-300 mt-5 text-lg max-w-xl">
            Entrá al Discord oficial, seguí las novedades de la liga,
            highlights, clips, mercado de pases y toda la comunidad APA PSO.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <a
              href="https://discord.gg/WCyqeJMmCU"
              target="_blank"
              className="bg-[#5865F2] text-white px-7 py-4 rounded-2xl font-black uppercase shadow-[0_0_30px_rgba(88,101,242,.7)] hover:scale-105 transition-all"
            >
              🎮 Discord
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              className="bg-white/10 border border-white/15 px-7 py-4 rounded-2xl font-black uppercase hover:border-sky-400/60 transition-all"
            >
              🎵 TikTok
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              className="bg-white/10 border border-white/15 px-7 py-4 rounded-2xl font-black uppercase hover:border-pink-400/60 transition-all"
            >
              📸 Instagram
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-[420px]">
          <div className="bg-[#0b1220] border border-sky-500/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,120,255,.15)]">
            <p className="text-4xl mb-4">🎮</p>

            <h3 className="text-xl font-black uppercase">
              Discord Oficial
            </h3>

            <p className="text-zinc-400 text-sm mt-2">
              Comunidad activa y organización de partidos.
            </p>
          </div>

          <div className="bg-[#0b1220] border border-pink-500/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(255,0,140,.12)]">
            <p className="text-4xl mb-4">📸</p>

            <h3 className="text-xl font-black uppercase">
              Instagram
            </h3>

            <p className="text-zinc-400 text-sm mt-2">
              Noticias, gráficos y anuncios oficiales.
            </p>
          </div>

          <div className="bg-[#0b1220] border border-white/20 rounded-3xl p-6 shadow-[0_0_25px_rgba(255,255,255,.08)]">
            <p className="text-4xl mb-4">🎵</p>

            <h3 className="text-xl font-black uppercase">
              TikTok
            </h3>

            <p className="text-zinc-400 text-sm mt-2">
              Clips, highlights y goles destacados.
            </p>
          </div>

          <div className="bg-[#0b1220] border border-yellow-500/30 rounded-3xl p-6 shadow-[0_0_25px_rgba(250,204,21,.12)]">
            <p className="text-4xl mb-4">🏆</p>

            <h3 className="text-xl font-black uppercase">
              Liga Oficial
            </h3>

            <p className="text-zinc-400 text-sm mt-2">
              Temporadas competitivas y estadísticas reales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}