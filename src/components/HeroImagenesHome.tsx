"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    imagen:
      "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=2070&auto=format&fit=crop",
    titulo1: "TU PASIÓN.",
    titulo2: "TU LIGA.",
    titulo3: "TU LEGADO.",
    bajada: "Competí, mejorá, representá.",
    descripcion: "Sé parte de algo grande en APA PSO Argentina.",
    boton: "¡UNITE AHORA!",
    href: "https://discord.gg/WCyqeJMmCU",
  },
  {
    imagen:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2070&auto=format&fit=crop",
    titulo1: "CADA FECHA.",
    titulo2: "CADA PARTIDO.",
    titulo3: "CADA FINAL.",
    bajada: "Fixture, resultados y tabla oficial.",
    descripcion: "Seguí la temporada con estadísticas actualizadas.",
    boton: "VER FIXTURE",
    href: "/fixture",
  },
  {
    imagen:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=2070&auto=format&fit=crop",
    titulo1: "FICHÁ.",
    titulo2: "COMPETÍ.",
    titulo3: "ASCENDÉ.",
    bajada: "Mercado, clubes y divisiones.",
    descripcion: "Armá tu historia dentro de APA PSO.",
    boton: "VER MERCADO",
    href: "/mercado",
  },
];

const features = [
  {
    icon: "👥",
    title: "COMUNIDAD ACTIVA",
    text: "Competí con jugadores reales.",
  },
  {
    icon: "📈",
    title: "COMPETENCIA JUSTA",
    text: "Divisiones y estadísticas.",
  },
  {
    icon: "🏆",
    title: "PREMIOS",
    text: "Torneos y rankings.",
  },
  {
    icon: "⭐",
    title: "MEJORÁ",
    text: "Subí tu nivel.",
  },
  {
    icon: "🎮",
    title: "EN PSO",
    text: "Liga oficial.",
  },
];

export default function HeroImagenesHome() {
  const [activo, setActivo] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setActivo((prev) => (prev + 1) % slides.length);
    }, 11000);

    return () => clearInterval(intervalo);
  }, []);

  const slide = slides[activo];

  function cambiarSlide(direccion: number) {
    setActivo((prev) => {
      const nuevo = prev + direccion;

      if (nuevo < 0) return slides.length - 1;
      if (nuevo >= slides.length) return 0;

      return nuevo;
    });
  }

  return (
    <section className="relative mx-auto w-full max-w-[1600px] overflow-hidden rounded-[22px] border border-sky-500/50 bg-black shadow-[0_0_55px_rgba(0,120,255,.3)] sm:rounded-[30px]">
      <div className="relative min-h-[620px] overflow-hidden sm:min-h-[560px] lg:min-h-[500px] xl:min-h-[460px]">
        {slides.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              activo === index
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <img
              src={item.imagen}
              alt={item.titulo2}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/18" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(56,189,248,.18),transparent_28%)]" />
          </div>
        ))}

        <div className="absolute left-4 top-4 z-30 flex max-w-[calc(100%-2rem)] items-center gap-2 sm:left-6">
          <span className="text-yellow-300 text-[10px] leading-none">★ ★ ★</span>

          <span className="text-[9px] font-black uppercase leading-none tracking-[0.22em] text-sky-300 sm:text-[10px] sm:tracking-[0.26em]">
            APA PSO ARGENTINA
          </span>
        </div>

        <div className="relative z-20 grid min-h-[620px] grid-cols-1 items-center gap-6 px-5 pb-24 pt-16 sm:min-h-[560px] sm:px-8 md:px-12 lg:min-h-[500px] lg:grid-cols-[minmax(0,1fr)_clamp(150px,22vw,260px)] lg:px-16 xl:min-h-[460px] xl:px-20">
          <div className="max-w-[760px]">
            <h1 className="text-[clamp(2.35rem,8.5vw,4.25rem)] font-black uppercase italic leading-[1.02] md:text-[clamp(3.1rem,5.4vw,4.6rem)]">
              <span className="block bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,.2)]">
                {slide.titulo1}
              </span>

              <span className="block mt-2 text-sky-400 drop-shadow-[0_0_25px_rgba(56,189,248,.72)]">
                {slide.titulo2}
              </span>

              <span className="block mt-2 text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,.55)]">
                {slide.titulo3}
              </span>
            </h1>

            <p className="mt-4 text-sm font-black uppercase leading-snug text-white drop-shadow sm:text-base md:text-lg">
              {slide.bajada}
            </p>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
              {slide.descripcion}
            </p>

            <div className="flex flex-wrap gap-3 mt-5">
              <a
                href={slide.href}
                target={slide.href.startsWith("http") ? "_blank" : "_self"}
                className="rounded-2xl bg-sky-400 px-5 py-3 text-xs font-black uppercase text-black shadow-[0_0_25px_rgba(56,189,248,.75)] transition-all hover:scale-105 hover:bg-sky-300 sm:px-6 sm:text-sm"
              >
                {slide.boton}
              </a>

              <a
                href="/jugadores"
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-black uppercase backdrop-blur transition-all hover:border-sky-400/60 hover:bg-sky-400/10 sm:px-6 sm:text-sm"
              >
                VER RANKINGS
              </a>
            </div>
          </div>

          <div className="pointer-events-none hidden justify-end lg:flex">
            <div className="relative flex aspect-square w-[clamp(150px,18vw,230px)] items-center justify-center overflow-hidden rounded-full border border-sky-400/40 bg-black/40 shadow-[0_0_45px_rgba(0,120,255,.42)]">
              <div className="absolute -inset-4 rounded-full bg-sky-400/10 blur-2xl" />

              <img
                src="/logo-apa.png"
                alt="APA PSO"
                className="relative z-10 w-full h-full object-cover opacity-95"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        <button
          onClick={() => cambiarSlide(-1)}
          className="absolute left-2 top-1/2 z-40 h-9 w-9 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 font-black transition hover:border-sky-400 hover:bg-sky-400 hover:text-black sm:left-4 sm:h-10 sm:w-10"
        >
          ‹
        </button>

        <button
          onClick={() => cambiarSlide(1)}
          className="absolute right-2 top-1/2 z-40 h-9 w-9 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 font-black transition hover:border-sky-400 hover:bg-sky-400 hover:text-black sm:right-4 sm:h-10 sm:w-10"
        >
          ›
        </button>

        <div className="absolute bottom-5 right-5 z-40 flex gap-2 sm:bottom-8 sm:right-7">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActivo(index)}
              className={`h-2 rounded-full transition-all ${
                activo === index
                  ? "w-10 bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,.95)]"
                  : "w-2 bg-white/40 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-30 grid grid-cols-1 border-t border-sky-500/30 bg-gradient-to-r from-[#020714] via-[#061a33] to-[#020714] sm:grid-cols-2 lg:grid-cols-5">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group border-b border-sky-500/20 p-4 transition hover:bg-sky-400/10 sm:p-5 lg:border-b-0 lg:border-r last:border-r-0"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-xl shadow-[0_0_18px_rgba(56,189,248,.25)] transition group-hover:scale-110 sm:h-14 sm:w-14 sm:text-2xl">
                {feature.icon}
              </div>

              <div>
                <p className="text-[11px] font-black uppercase leading-tight text-sky-300 sm:text-xs">
                  {feature.title}
                </p>

                <p className="mt-1 text-[10px] leading-tight text-zinc-400 sm:text-[11px]">
                  {feature.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-2 border-t border-sky-500/20 bg-black px-4 py-3 text-center text-[9px] uppercase sm:px-5 sm:text-[10px] md:flex-row md:text-left">
        <p className="text-zinc-400">
          <b className="text-white">APA PSO ARGENTINA</b> · Somos una familia,
          somos una liga.
        </p>

        <p className="text-sky-400 font-black tracking-[0.25em]">
          @APAPSOARGENTINA
        </p>
      </div>
    </section>
  );
}
