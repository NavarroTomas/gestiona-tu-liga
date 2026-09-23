"use client";

import { motion } from "framer-motion";

const SUGGESTIONS_URL = "https://discord.gg/pyFkvdERTp";

export default function HomeSuggestions() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[30px] border border-[#c7dfeb] bg-[linear-gradient(135deg,#edf8fd,#ffffff)] p-7 sm:p-10 lg:p-12"
    >
      <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#65c6ee]/15 blur-3xl" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#168fd4]">
            Tu opinión importa
          </p>
          <h2 className="mt-3 max-w-[900px] text-[42px] font-black leading-[.96] tracking-[-.05em] text-[#102f55] sm:text-[58px]">
            Ayudanos a mejorar APA.
          </h2>
          <p className="mt-5 max-w-[72ch] text-[13px] font-semibold leading-6 text-[#58788f]">
            Si tenés una idea para la liga, la web, los torneos, eventos o cualquier parte de la comunidad, dejala en el canal de sugerencias. El staff la puede revisar y discutir con el resto del equipo.
          </p>
        </div>

        <a
          href={SUGGESTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className="apa-home-cta !text-white [&_*]:!text-white inline-flex min-h-14 shrink-0 items-center justify-center rounded-xl bg-[#168fd4] px-7 text-[11px] font-black uppercase tracking-[.06em] transition hover:-translate-y-0.5 hover:bg-[#0f7ebd]"
        >
          Enviar sugerencia <span className="ml-3">→</span>
        </a>
      </div>
    </motion.section>
  );
}
