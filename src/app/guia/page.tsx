"use client";

import Link from "next/link";
import { GUIDE_FAQ, GUIDE_SECTIONS, type GuideSection } from "@/config/guide";

const SECTION_LINKS = [
  { href: "#primeros-pasos", label: "Primeros pasos" },
  { href: "#competicion", label: "Competición" },
  { href: "#clubes-jugadores", label: "Clubes y jugadores" },
  { href: "#comunidad", label: "Comunidad" },
  { href: "#preguntas", label: "Preguntas" },
];

function GuideSectionBlock({ section }: { section: GuideSection }) {
  const blue = section.tone === "blue";

  return (
    <section
      id={section.id}
      className={`scroll-mt-28 border-y ${
        blue
          ? "border-[#174b77] bg-[#0f355a] text-white"
          : "border-[#d7e9f3] bg-white text-[#102f55]"
      }`}
    >
      <div className="mx-auto max-w-[1680px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-14">
          <div>
            <p
              className={`text-[11px] font-black uppercase tracking-[.16em] ${
                blue ? "text-[#78c8f1]" : "text-[#2d98d4]"
              }`}
            >
              {section.eyebrow}
            </p>
            <h2 className="mt-3 max-w-[520px] text-[clamp(2rem,4.4vw,3.8rem)] font-black uppercase leading-[.94] tracking-[-.035em]">
              {section.title}
            </h2>
            <p
              className={`mt-5 max-w-[560px] text-[14px] font-semibold leading-7 sm:text-[15px] ${
                blue ? "text-[#d4e8f5]" : "text-[#58748b]"
              }`}
            >
              {section.description}
            </p>
          </div>

          <div className={`divide-y ${blue ? "divide-[#28587f]" : "divide-[#dcebf3]"}`}>
            {section.items.map((item) => (
              <article key={item.title} className="py-5 first:pt-0 last:pb-0 sm:py-6">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_190px] md:items-start md:gap-8">
                  <div className="min-w-0">
                    <h3 className="text-[19px] font-black uppercase tracking-[-.015em] sm:text-[22px]">
                      {item.title}
                    </h3>
                    <p
                      className={`mt-2 max-w-3xl text-[13px] font-semibold leading-6 sm:text-[14px] ${
                        blue ? "text-[#c5ddec]" : "text-[#5e798f]"
                      }`}
                    >
                      {item.description}
                    </p>

                    {item.points?.length ? (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {item.points.map((point) => (
                          <p
                            key={point}
                            className={`border-l-2 pl-3 text-[12px] font-bold leading-5 sm:text-[13px] ${
                              blue
                                ? "border-[#56afe2] text-[#e4f1f8]"
                                : "border-[#80c7ed] text-[#315f89]"
                            }`}
                          >
                            {point}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`inline-flex min-h-11 items-center justify-center rounded-[7px] border px-4 text-center text-[12px] font-black uppercase tracking-[.04em] transition ${
                        blue
                          ? "border-[#5fb8e7] bg-transparent text-white hover:bg-[#184b75]"
                          : "border-[#8bc9eb] bg-[#f5fbff] text-[#176fa8] hover:bg-[#e8f6fd]"
                      }`}
                    >
                      Abrir sección
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function GuiaPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3fafe] text-[#102f55]">
      <section id="top" className="border-b border-[#1f547d] bg-[#0f355a] text-white">
        <div className="mx-auto grid min-h-[310px] max-w-[1680px] items-end gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10 lg:py-14">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#7ccaf0]">
              Guía oficial APA
            </p>
            <h1 className="mt-3 max-w-[900px] text-[clamp(3rem,7vw,6.5rem)] font-black uppercase leading-[.86] tracking-[-.055em]">
              Entendé la plataforma
            </h1>
            <p className="mt-5 max-w-3xl text-[15px] font-semibold leading-7 text-[#d8ebf6] sm:text-[17px]">
              Una guía más simple para ubicarte rápido: cuenta, competiciones,
              clubes, plantillas, jugadores y herramientas de comunidad.
            </p>
          </div>

          <div className="border-t border-[#2a5c82] pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#78c8f1]">
              Recorrido recomendado
            </p>
            <p className="mt-3 text-[18px] font-black uppercase leading-7">
              Perfil · Competición · Fixture · Clubes · Jugadores
            </p>
            <p className="mt-3 text-[12px] font-semibold leading-6 text-[#bfd9e8]">
              La información avanzada sigue disponible, pero esta guía prioriza
              lo que realmente necesitás para usar la web.
            </p>
          </div>
        </div>
      </section>

      <nav className="sticky top-0 z-30 border-b border-[#cfe4f0] bg-white/95 backdrop-blur" aria-label="Secciones de la guía">
        <div className="mx-auto flex max-w-[1680px] gap-1 overflow-x-auto px-5 py-2 sm:px-8 lg:px-10">
          {SECTION_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-[6px] px-4 py-2.5 text-[11px] font-black uppercase tracking-[.04em] text-[#315f89] transition hover:bg-[#eaf6fd] hover:text-[#1478b6]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <section className="bg-[#f3fafe]">
        <div className="mx-auto max-w-[1680px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="grid gap-6 border-y border-[#cfe4f0] py-7 md:grid-cols-3">
            <div className="md:pr-8">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2d98d4]">
                Cuenta
              </p>
              <h2 className="mt-2 text-[25px] font-black uppercase tracking-[-.025em] text-[#102f55]">
                Empezá bien
              </h2>
              <p className="mt-3 text-[13px] font-semibold leading-6 text-[#607d92]">
                Completá SteamID64, Discord User ID y PlayerId para que tu perfil
                quede conectado con toda la plataforma.
              </p>
            </div>

            <div className="border-[#cfe4f0] md:border-l md:px-8">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2d98d4]">
                Temporada
              </p>
              <h2 className="mt-2 text-[25px] font-black uppercase tracking-[-.025em] text-[#102f55]">
                Seguí la competencia
              </h2>
              <p className="mt-3 text-[13px] font-semibold leading-6 text-[#607d92]">
                Competición y Fixture concentran torneos, divisiones, grupos,
                fases, partidos y resultados.
              </p>
            </div>

            <div className="border-[#cfe4f0] md:border-l md:pl-8">
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2d98d4]">
                Rendimiento
              </p>
              <h2 className="mt-2 text-[25px] font-black uppercase tracking-[-.025em] text-[#102f55]">
                Encontrá tus datos
              </h2>
              <p className="mt-3 text-[13px] font-semibold leading-6 text-[#607d92]">
                Clubes, Plantillas y Jugadores conectan equipos, perfiles,
                estadísticas, rankings e historial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {GUIDE_SECTIONS.map((section) => (
        <GuideSectionBlock key={section.id} section={section} />
      ))}

      <section id="preguntas" className="scroll-mt-28 bg-[#f3fafe]">
        <div className="mx-auto max-w-[1680px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-14">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.16em] text-[#2d98d4]">
                Ayuda rápida
              </p>
              <h2 className="mt-3 text-[clamp(2rem,4.4vw,3.8rem)] font-black uppercase leading-[.94] tracking-[-.035em] text-[#102f55]">
                Preguntas frecuentes
              </h2>
              <p className="mt-5 text-[14px] font-semibold leading-7 text-[#58748b] sm:text-[15px]">
                Respuestas cortas a los problemas más comunes sin repetir toda
                la documentación de cada sección.
              </p>
            </div>

            <div className="divide-y divide-[#d6e7f1] border-y border-[#d6e7f1]">
              {GUIDE_FAQ.map((item) => (
                <article key={item.question} className="py-5 sm:py-6">
                  <h3 className="text-[16px] font-black text-[#102f55] sm:text-[18px]">
                    {item.question}
                  </h3>
                  <p className="mt-2 max-w-4xl text-[13px] font-semibold leading-6 text-[#607d92] sm:text-[14px]">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#1f547d] bg-[#0f355a] text-white">
        <div className="mx-auto grid max-w-[1680px] gap-6 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-center lg:px-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#78c8f1]">
              ¿No encontraste lo que buscabas?
            </p>
            <h2 className="mt-2 text-[24px] font-black uppercase tracking-[-.025em]">
              Volvé al inicio o entrá a la sección que necesitás
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-[7px] border border-[#5fb8e7] px-5 py-3 text-[11px] font-black uppercase tracking-[.04em] text-white transition hover:bg-[#184b75]"
            >
              Inicio
            </Link>
            <Link
              href="/competicion"
              className="rounded-[7px] bg-[#56afe2] px-5 py-3 text-[11px] font-black uppercase tracking-[.04em] text-white transition hover:bg-[#4aa2d4]"
            >
              Competición
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
