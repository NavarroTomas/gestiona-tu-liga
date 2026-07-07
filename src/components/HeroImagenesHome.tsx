"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    imagen: "/themes/worldcup/backgrounds/copita.png",
    titulo1: "CADA FECHA.",
    titulo2: "CADA PARTIDO.",
    titulo3: "CADA FINAL.",
    bajada: "Fixture, resultados y tabla oficial.",
    descripcion: "Seguí la temporada con estética mundialista.",
    boton: "VER FIXTURE",
    href: "/fixture",
  },
  {
    imagen: "/themes/worldcup/backgrounds/Mugiwaras.png",
    titulo1: "TU PASIÓN.",
    titulo2: "TU LIGA.",
    titulo3: "TU LEGADO.",
    bajada: "Clubes, planteles e historia.",
    descripcion: "Representá tu escudo dentro de APA.",
    boton: "VER CLUBES",
    href: "/clubes",
  },
  {
    imagen: "/themes/worldcup/backgrounds/Banderin.png",
    titulo1: "FICHÁ.",
    titulo2: "COMPETÍ.",
    titulo3: "ASCENDÉ.",
    bajada: "Mercado, jugadores y rankings.",
    descripcion: "Armá tu camino en la Temporada 4.",
    boton: "VER MERCADO",
    href: "/mercado",
  },
];

const features = [
  {
    img: "/themes/worldcup/card-clubes.png",
    title: "CLUBES",
    text: "Escudos y planteles.",
  },
  {
    img: "/themes/worldcup/card-jugadores.png",
    title: "JUGADORES",
    text: "Perfiles y estadísticas.",
  },
  {
    img: "/themes/worldcup/card-partidos.png",
    title: "PARTIDOS",
    text: "Fixture oficial.",
  },
  {
    img: "/themes/worldcup/card-rankings.png",
    title: "RANKINGS",
    text: "Goles, asistencias y MVP.",
  },
  {
    href: "/historia",
    title: "Historial",
    text: "Campeones, temporadas, finales y récords históricos.",
    img: "/themes/worldcup/backgrounds/stadium-night-01.png",
    bg: "/themes/worldcup/backgrounds/stadium-night-01.png",
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
    <div className="relative mx-auto w-full max-w-[1240px]">
      <section className="relative z-10 mx-auto w-full max-w-[1020px] overflow-hidden rounded-[22px] border border-sky-500/50 bg-black shadow-[0_0_55px_rgba(0,120,255,.3)] sm:rounded-[30px] xl:max-w-[1240px]">
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
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/22" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_45%,rgba(250,204,21,.16),transparent_28%)]" />
            </div>
          ))}

          <div className="absolute left-4 top-4 z-30 flex max-w-[calc(100%-2rem)] items-center gap-2 sm:left-6">
            <span className="text-[10px] leading-none text-yellow-300">
              ★ ★ ★
            </span>

            <span className="text-[9px] font-black uppercase leading-none tracking-[0.22em] text-sky-300 sm:text-[10px] sm:tracking-[0.26em]">
              APA PSO ARGENTINA
            </span>
          </div>

          <div className="relative z-20 grid min-h-[620px] grid-cols-1 items-center gap-6 px-5 pb-24 pt-16 sm:min-h-[560px] sm:px-8 md:px-12 lg:min-h-[500px] lg:grid-cols-[minmax(0,1fr)_clamp(100px,14vw,170px)] lg:px-16 xl:min-h-[460px] xl:px-20">
            <div className="max-w-[760px]">
              <h1 className="text-[clamp(2.35rem,8.5vw,4.25rem)] font-black uppercase italic leading-[1.02] md:text-[clamp(3.1rem,5.4vw,4.6rem)]">
                <span className="block bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,.2)]">
                  {slide.titulo1}
                </span>

                <span className="mt-2 block text-sky-400 drop-shadow-[0_0_25px_rgba(56,189,248,.72)]">
                  {slide.titulo2}
                </span>

                <span className="mt-2 block text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,.55)]">
                  {slide.titulo3}
                </span>
              </h1>

              <p className="mt-4 text-sm font-black uppercase leading-snug text-white drop-shadow sm:text-base md:text-lg">
                {slide.bajada}
              </p>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
                {slide.descripcion}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={slide.href}
                  target={slide.href.startsWith("http") ? "_blank" : "_self"}
                  className="rounded-2xl bg-sky-400 px-5 py-3 text-xs font-black uppercase text-black shadow-[0_0_25px_rgba(56,189,248,.75)] transition-all hover:scale-105 hover:bg-sky-300 sm:px-6 sm:text-sm"
                >
                  {slide.boton}
                </a>

                <Link
                  href="/jugadores"
                  className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-black uppercase backdrop-blur transition-all hover:border-sky-400/60 hover:bg-sky-400/10 sm:px-6 sm:text-sm"
                >
                  VER RANKINGS
                </Link>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-20 right-7 z-30 hidden lg:block xl:right-10">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-sky-400/35 bg-black/35 shadow-[0_0_22px_rgba(0,120,255,.32)] backdrop-blur-sm xl:h-20 xl:w-20">
              <div className="absolute -inset-3 rounded-full bg-sky-400/10 blur-xl" />

              <img
                src="/logo-apa.png"
                alt="APA PSO"
                className="relative z-10 h-full w-full object-cover opacity-90"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
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
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-sky-400/30 bg-sky-400/10 shadow-[0_0_18px_rgba(56,189,248,.25)] transition group-hover:scale-110">
                  <img
                    src={feature.img}
                    alt={feature.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
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

          <p className="font-black tracking-[0.25em] text-sky-400">
            @APAPSOARGENTINA
          </p>
        </div>
      </section>
    </div>
  );
}
