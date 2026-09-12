"use client";

import Link from "next/link";

const opciones = [
  {
    href: "/entretenimiento/predicciones",
    eyebrow: "Pronósticos",
    title: "Predicciones",
    description:
      "Pronosticá partidos oficiales, acertá ganadores o marcadores exactos y sumá puntos en el ranking de la comunidad.",
    statLabel: "Puntaje",
    stats: [
      ["Ganador", "+1"],
      ["Exacto", "+3"],
    ],
    tone: "light" as const,
  },
  {
    href: "/entretenimiento/dream-team",
    eyebrow: "Equipo ideal",
    title: "Dream Team",
    description:
      "Armá tu ocho ideal de cada fecha con los jugadores habilitados para ese contexto competitivo.",
    statLabel: "Formación",
    stats: [
      ["Jugadores", "8"],
      ["Sistema", "8v8"],
    ],
    tone: "blue" as const,
  },
  {
    href: "/entretenimiento/premios",
    eyebrow: "Reconocimientos",
    title: "Premios APA",
    description:
      "Consultá los premios de fecha y de temporada construidos a partir de las estadísticas oficiales de APA.",
    statLabel: "Categorías",
    stats: [
      ["Fecha", "MVP"],
      ["Temporada", "APA"],
    ],
    tone: "light" as const,
  },
];

export default function EntretenimientoPage() {
  return (
    <main className="min-h-screen bg-[#f3fafe] text-[#102f55]">
      <section className="border-b border-[#1f547d] bg-[#0f355a] text-white">
        <div className="mx-auto grid min-h-[290px] max-w-[1680px] items-end gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-10 lg:py-14">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.16em] text-[#79c8ef]">
              Comunidad APA
            </p>
            <h1 className="mt-3 max-w-[900px] text-[clamp(3rem,7vw,6.2rem)] font-black uppercase leading-[.88] tracking-[-.055em]">
              Entretenimiento
            </h1>
            <p className="mt-5 max-w-3xl text-[15px] font-semibold leading-7 text-[#d5e8f4] sm:text-[17px]">
              Tres formas de participar más allá de los resultados: pronosticá,
              armá tu equipo ideal y seguí los reconocimientos oficiales.
            </p>
          </div>

          <div className="border-t border-[#2a5c82] pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#79c8ef]">
              Elegí una experiencia
            </p>
            <p className="mt-3 text-[18px] font-black uppercase leading-7">
              Predicciones · Dream Team · Premios APA
            </p>
            <p className="mt-3 text-[12px] font-semibold leading-6 text-[#bfd9e8]">
              Cada módulo conserva sus reglas y datos, pero ahora comparte una
              entrada visual más simple y consistente con el resto del sitio.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1680px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="grid gap-5 lg:grid-cols-3">
            {opciones.map((opcion, index) => {
              const blue = opcion.tone === "blue";

              return (
                <Link
                  key={opcion.href}
                  href={opcion.href}
                  className={`group flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[10px] border p-6 transition sm:p-7 lg:p-8 ${
                    blue
                      ? "border-[#174b77] bg-[#0f355a] text-white hover:bg-[#123f68]"
                      : "border-[#cfe4f0] bg-[#f7fbfe] text-[#102f55] hover:border-[#8fc8e8] hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p
                          className={`text-[10px] font-black uppercase tracking-[.15em] ${
                            blue ? "text-[#79c8ef]" : "text-[#2d98d4]"
                          }`}
                        >
                          {opcion.eyebrow}
                        </p>
                        <h2 className="mt-3 text-[clamp(2rem,3.6vw,3.4rem)] font-black uppercase leading-[.92] tracking-[-.04em]">
                          {opcion.title}
                        </h2>
                      </div>

                      <span
                        className={`text-[52px] font-black leading-none tracking-[-.08em] ${
                          blue ? "text-[#2f648d]" : "text-[#d4eaf6]"
                        }`}
                        aria-hidden="true"
                      >
                        0{index + 1}
                      </span>
                    </div>

                    <p
                      className={`mt-6 max-w-xl text-[14px] font-semibold leading-7 ${
                        blue ? "text-[#c9deeb]" : "text-[#5d788e]"
                      }`}
                    >
                      {opcion.description}
                    </p>
                  </div>

                  <div className="mt-10">
                    <div
                      className={`border-y py-4 ${
                        blue ? "border-[#2b5a7f]" : "border-[#d5e7f1]"
                      }`}
                    >
                      <p
                        className={`text-[9px] font-black uppercase tracking-[.14em] ${
                          blue ? "text-[#79c8ef]" : "text-[#2d98d4]"
                        }`}
                      >
                        {opcion.statLabel}
                      </p>
                      <div className="mt-3 grid grid-cols-2 divide-x divide-[#c8dfec]/70">
                        {opcion.stats.map(([label, value]) => (
                          <div key={label} className="pr-4 second:pl-4">
                            <p className="text-[11px] font-bold uppercase tracking-[.05em] opacity-70">
                              {label}
                            </p>
                            <p className="mt-1 text-[24px] font-black uppercase leading-none">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-[12px] font-black uppercase tracking-[.08em]">
                        Abrir sección
                      </span>
                      <span
                        className={`h-[2px] w-16 transition-all group-hover:w-24 ${
                          blue ? "bg-[#79c8ef]" : "bg-[#56afe2]"
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[#cfe4f0] bg-[#eaf6fd]">
        <div className="mx-auto grid max-w-[1680px] gap-6 px-5 py-8 sm:px-8 md:grid-cols-3 lg:px-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2d98d4]">
              Predicciones
            </p>
            <p className="mt-2 text-[14px] font-semibold leading-6 text-[#58748b]">
              Tus puntos se calculan cuando el resultado oficial queda cargado.
            </p>
          </div>
          <div className="border-[#c9e3f1] md:border-l md:pl-7">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2d98d4]">
              Dream Team
            </p>
            <p className="mt-2 text-[14px] font-semibold leading-6 text-[#58748b]">
              Los candidatos dependen de la fecha y del contexto competitivo.
            </p>
          </div>
          <div className="border-[#c9e3f1] md:border-l md:pl-7">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2d98d4]">
              Premios APA
            </p>
            <p className="mt-2 text-[14px] font-semibold leading-6 text-[#58748b]">
              Los reconocimientos parten de estadísticas oficiales de partidos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
