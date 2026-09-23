"use client";

import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/config/social";

export default function HomeDonation() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#dff3ff] px-6 py-12 sm:px-10 sm:py-16 lg:px-12"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#168fd4]">
            Apoyá la liga
          </p>

          <h2 className="mt-3 max-w-[900px] text-[clamp(2.5rem,4.8vw,5rem)] font-black leading-[0.95] tracking-[-0.055em] text-[#102f55]">
            Doná y ayudá a que APA siga creciendo.
          </h2>

          <p className="mt-5 max-w-[72ch] text-[14px] font-semibold leading-7 text-[#58788f]">
            Si querés colaborar con la comunidad, podés iniciar tu consulta desde Discord y coordinar la donación con el staff mediante tickets.
          </p>
        </div>

        <a
          href={SOCIAL_LINKS.discord}
          target="_blank"
          rel="noreferrer"
          className="apa-home-cta inline-flex min-h-12 items-center rounded-xl bg-[#102f55] px-6 text-[10px] font-black uppercase tracking-[0.06em] !text-white [&_*]:!text-white transition hover:-translate-y-0.5 hover:bg-[#173e68]"
        >
          Quiero donar a la liga <span className="ml-3">→</span>
        </a>
      </div>
    </motion.section>
  );
}
