"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GUIDE_FAQ, GUIDE_SECTIONS, type GuideSection } from "@/config/guide";

function GuideTopic({
  section,
  active,
  onSelect,
}: {
  section: GuideSection;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-h-[92px] rounded-[8px] border px-5 py-4 text-left transition ${
        active
          ? "border-[#56afe2] bg-[#102f55] text-white"
          : "border-[#cfe4f0] bg-white text-[#102f55] hover:border-[#8fc8e8] hover:bg-[#f8fcff]"
      }`}
    >
      <span
        className={`block text-[10px] font-black uppercase tracking-[.14em] ${
          active ? "text-[#7ccaf0]" : "text-[#2d98d4]"
        }`}
      >
        {section.eyebrow}
      </span>
      <span className="mt-2 block text-[16px] font-black uppercase leading-5 sm:text-[18px]">
        {section.title}
      </span>
    </button>
  );
}

function GuideItemCard({
  item,
  dark,
}: {
  item: GuideSection["items"][number];
  dark: boolean;
}) {
  return (
    <article
      className={`flex min-h-[210px] flex-col rounded-[9px] border p-5 sm:p-6 ${
        dark
          ? "border-[#28587f] bg-[#123b63] text-white"
          : "border-[#d7e9f3] bg-white text-[#102f55]"
      }`}
    >
      <h3 className="text-[20px] font-black uppercase tracking-[-.02em] sm:text-[23px]">
        {item.title}
      </h3>

      <p
        className={`mt-3 text-[13px] font-semibold leading-6 sm:text-[14px] ${
          dark ? "text-[#cfe4f0]" : "text-[#5b788f]"
        }`}
      >
        {item.description}
      </p>

      {item.points?.length ? (
        <div className="mt-5 space-y-2">
          {item.points.slice(0, 2).map((point) => (
            <p
              key={point}
              className={`border-l-2 pl-3 text-[12px] font-bold leading-5 sm:text-[13px] ${
                dark
                  ? "border-[#56afe2] text-[#e4f1f8]"
                  : "border-[#80c7ed] text-[#315f89]"
              }`}
            >
              {point}
            </p>
          ))}
        </div>
      ) : null}

      {item.href ? (
        <Link
          href={item.href}
          className={`mt-auto inline-flex min-h-11 items-center justify-center rounded-[7px] border px-4 pt-[1px] text-center text-[12px] font-black uppercase tracking-[.04em] transition ${
            dark
              ? "border-[#64b9e6] text-white hover:bg-[#184b75]"
              : "border-[#8bc9eb] bg-[#f5fbff] text-[#176fa8] hover:bg-[#e8f6fd]"
          }`}
        >
          Abrir sección
        </Link>
      ) : null}
    </article>
  );
}

export default function GuiaPage() {
  const [activeSectionId, setActiveSectionId] = useState(
    GUIDE_SECTIONS[0]?.id || "primeros-pasos",
  );
  const [activeFaq, setActiveFaq] = useState(0);

  const activeSection = useMemo(
    () =>
      GUIDE_SECTIONS.find((section) => section.id === activeSectionId) ||
      GUIDE_SECTIONS[0],
    [activeSectionId],
  );

  const dark = activeSection?.tone === "blue";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3fafe] text-[#102f55]">
      <section className="border-b border-[#1f547d] bg-[#0f355a] text-white">
        <div className="mx-auto grid min-h-[300px] max-w-[1680px] items-end gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10 lg:py-14">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#7ccaf0]">
              Guía oficial APA
            </p>
            <h1 className="mt-3 max-w-[900px] text-[clamp(3rem,7vw,6.2rem)] font-black uppercase leading-[.87] tracking-[-.055em]">
              Entendé la plataforma
            </h1>
            <p className="mt-5 max-w-3xl text-[15px] font-semibold leading-7 text-[#d8ebf6] sm:text-[17px]">
              Elegí qué querés entender y mirá únicamente esa parte de la guía.
              La información completa sigue estando disponible sin convertir la
              página en una pared de texto.
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
              Para consultas puntuales, elegí directamente una categoría debajo.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d5e8f2] bg-white">
        <div className="mx-auto max-w-[1680px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-5 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2d98d4]">
                Elegí un tema
              </p>
              <h2 className="mt-2 text-[26px] font-black uppercase tracking-[-.03em] sm:text-[34px]">
                ¿Qué necesitás consultar?
              </h2>
            </div>
            <p className="hidden max-w-md text-right text-[13px] font-semibold leading-6 text-[#6d8799] lg:block">
              Mostramos un tema a la vez para que la guía sea rápida de leer y no
              tengas que recorrer información que no necesitás.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {GUIDE_SECTIONS.map((section) => (
              <GuideTopic
                key={section.id}
                section={section}
                active={section.id === activeSection.id}
                onSelect={() => setActiveSectionId(section.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        className={`border-b ${
          dark
            ? "border-[#174b77] bg-[#0f355a] text-white"
            : "border-[#d7e9f3] bg-[#f3fafe] text-[#102f55]"
        }`}
      >
        <div className="mx-auto max-w-[1680px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="grid gap-9 xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-14">
            <div className="xl:sticky xl:top-28 xl:self-start">
              <p
                className={`text-[11px] font-black uppercase tracking-[.16em] ${
                  dark ? "text-[#78c8f1]" : "text-[#2d98d4]"
                }`}
              >
                {activeSection.eyebrow}
              </p>
              <h2 className="mt-3 text-[clamp(2.2rem,4.5vw,4rem)] font-black uppercase leading-[.94] tracking-[-.04em]">
                {activeSection.title}
              </h2>
              <p
                className={`mt-5 text-[14px] font-semibold leading-7 sm:text-[15px] ${
                  dark ? "text-[#d4e8f5]" : "text-[#58748b]"
                }`}
              >
                {activeSection.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {activeSection.items.map((item) => (
                <GuideItemCard key={item.title} item={item} dark={dark} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1680px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="grid gap-9 xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-14">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.16em] text-[#2d98d4]">
                Ayuda rápida
              </p>
              <h2 className="mt-3 text-[clamp(2.1rem,4.2vw,3.6rem)] font-black uppercase leading-[.94] tracking-[-.035em]">
                Preguntas frecuentes
              </h2>
              <p className="mt-5 text-[14px] font-semibold leading-7 text-[#58748b] sm:text-[15px]">
                Elegí una pregunta. Solo mostramos la respuesta que estás buscando.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[310px_minmax(0,1fr)]">
              <div className="space-y-2">
                {GUIDE_FAQ.map((item, index) => (
                  <button
                    key={item.question}
                    type="button"
                    onClick={() => setActiveFaq(index)}
                    className={`w-full rounded-[7px] border px-4 py-3.5 text-left text-[13px] font-black leading-5 transition ${
                      activeFaq === index
                        ? "border-[#56afe2] bg-[#102f55] text-white"
                        : "border-[#d6e7f1] bg-[#f8fcff] text-[#315f89] hover:border-[#9dcfe9]"
                    }`}
                  >
                    {item.question}
                  </button>
                ))}
              </div>

              <div className="min-h-[250px] rounded-[9px] border border-[#d6e7f1] bg-[#f3fafe] p-6 sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#2d98d4]">
                  Respuesta
                </p>
                <h3 className="mt-3 max-w-3xl text-[24px] font-black leading-tight text-[#102f55] sm:text-[30px]">
                  {GUIDE_FAQ[activeFaq]?.question}
                </h3>
                <p className="mt-5 max-w-3xl text-[15px] font-semibold leading-7 text-[#5d788e]">
                  {GUIDE_FAQ[activeFaq]?.answer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
