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
    <section className="relative overflow-hidden rounded-[30px] border border-sky-500/50 bg-black shadow-[0_0_55px_rgba(0,120,255,.3)]">
      <div className="relative h-[460px] overflow-hidden">
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

            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,140,255,.18),transparent_45%)]" />

            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,.7)_0%,rgba(0,0,0,.45)_45%,rgba(0,153,255,.12)_100%)]" />
          </div>
        ))}

        <div className="absolute top-4 left-6 z-30 flex items-center gap-2">
          <span className="text-yellow-300 text-[10px]">★ ★ ★</span>

          <span className="text-sky-300 text-[10px] font-black tracking-[0.35em] uppercase">
            APA PSO ARGENTINA
          </span>
        </div>

        <div className="relative z-20 h-full grid grid-cols-1 lg:grid-cols-[1fr_340px] items-center gap-4 pl-16 pr-10 md:pl-24 md:pr-14 pt-5 pb-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl xl:text-7xl leading-[0.9] font-black uppercase italic">
              <span className="block bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,.2)]">
                {slide.titulo1}
              </span>

              <span className="block text-sky-400 drop-shadow-[0_0_25px_rgba(56,189,248,.75)]">
                {slide.titulo2}
              </span>

              <span className="block text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,.55)]">
                {slide.titulo3}
              </span>
            </h1>

            <p className="mt-3 text-lg md:text-xl font-black uppercase text-white drop-shadow">
              {slide.bajada}
            </p>

            <p className="mt-1 text-zinc-300 text-sm md:text-base max-w-xl">
              {slide.descripcion}
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href={slide.href}
                target={slide.href.startsWith("http") ? "_blank" : "_self"}
                className="bg-sky-400 text-black px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-[0_0_25px_rgba(56,189,248,.9)] hover:scale-105 transition-all"
              >
                {slide.boton}
              </a>

              <a
                href="/jugadores"
                className="bg-white/10 backdrop-blur border border-white/20 px-6 py-3 rounded-2xl font-black uppercase text-sm hover:border-sky-400/60 transition-all"
              >
                VER RANKINGS
              </a>
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <div className="relative w-[260px] h-[260px] rounded-full border border-sky-400/40 bg-black/40 shadow-[0_0_45px_rgba(0,120,255,.45)] flex items-center justify-center overflow-hidden">
              <img
                src="/logo-apa.png"
                alt="APA PSO"
                className="w-full h-full object-cover opacity-90"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        <button
          onClick={() => cambiarSlide(-1)}
          className="absolute left-4 top-1/2 z-40 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 hover:border-sky-400 hover:bg-sky-400 hover:text-black transition font-black"
        >
          ‹
        </button>

        <button
          onClick={() => cambiarSlide(1)}
          className="absolute right-4 top-1/2 z-40 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 hover:border-sky-400 hover:bg-sky-400 hover:text-black transition font-black"
        >
          ›
        </button>

        <div className="absolute bottom-[92px] right-6 z-40 flex gap-2">
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

      <div className="relative z-30 grid grid-cols-1 md:grid-cols-5 border-t border-sky-500/30 bg-gradient-to-r from-[#020714] via-[#061a33] to-[#020714]">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group p-5 border-b md:border-b-0 md:border-r last:border-r-0 border-sky-500/20 hover:bg-sky-400/10 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-2xl shadow-[0_0_18px_rgba(56,189,248,.25)] group-hover:scale-110 transition">
                {feature.icon}
              </div>

              <div>
                <p className="text-xs text-sky-300 font-black uppercase leading-tight">
                  {feature.title}
                </p>

                <p className="text-[11px] text-zinc-400 mt-1 leading-tight">
                  {feature.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-black border-t border-sky-500/20 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] uppercase">
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