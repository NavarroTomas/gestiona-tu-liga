"use client";

import { motion } from "framer-motion";

const SUGGESTIONS_URL = "https://discord.gg/pyFkvdERTp";

export default function HomeSuggestions() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-[#c9e1ed] py-11 sm:py-14"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#168fd4]">
            Tu opinión importa
          </p>
          <h2 className="mt-3 max-w-[900px] text-[clamp(2.5rem,4.8vw,5rem)] font-black leading-[0.95] tracking-[-0.055em] text-[#102f55]">
            Ayudanos a mejorar APA.
          </h2>
          <p className="mt-5 max-w-[72ch] text-[14px] font-semibold leading-7 text-[#58788f]">
            Si tenés una idea para la liga, la web, los torneos, eventos o cualquier parte de la comunidad, dejala en el canal de sugerencias para que el staff la revise.
          </p>
        </div>

        <a
          href={SUGGESTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className="apa-home-cta inline-flex min-h-12 items-center rounded-xl bg-[#168fd4] px-6 text-[10px] font-black uppercase tracking-[0.06em] !text-white [&_*]:!text-white transition hover:-translate-y-0.5 hover:bg-[#0f7ebd]"
        >
          Enviar sugerencia <span className="ml-3">→</span>
        </a>
      </div>
    </motion.section>
  );
}
