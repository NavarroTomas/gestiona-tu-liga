"use client";

import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/config/social";

export default function HomeDonation() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 52 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[30px] border border-[#c9dfeb] bg-white p-7 sm:p-10 lg:p-12"
    >
      <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-[#69c6ee]/14 blur-3xl" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_auto] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#168fd4]">
            Apoyá a APA
          </p>

          <h2 className="mt-3 max-w-[900px] text-[42px] font-black leading-[0.96] tracking-[-0.05em] text-[#102f55] sm:text-[58px]">
            Ayudanos a seguir haciendo crecer la liga.
          </h2>

          <p className="mt-5 max-w-[72ch] text-[13px] font-semibold leading-6 text-[#58788f]">
            Los aportes ayudan a sostener la web, los servidores, las herramientas de la comunidad y nuevos proyectos. Para aportar, abrí un ticket en nuestro Discord y el staff te indica cómo continuar.
          </p>
        </div>

        <a
          href={SOCIAL_LINKS.discord}
          target="_blank"
          rel="noreferrer"
          className="apa-home-cta !text-white [&_*]:!text-white inline-flex min-h-14 shrink-0 items-center justify-center rounded-xl bg-[#102f55] px-7 text-[11px] font-black uppercase tracking-[0.06em] transition hover:-translate-y-0.5 hover:bg-[#173e68]"
        >
          Abrir ticket <span className="ml-3">→</span>
        </a>
      </div>
    </motion.section>
  );
}
