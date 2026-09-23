"use client";

import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/config/social";

function DiscordIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.3 5.34A17.16 17.16 0 0 0 15.11 4l-.51 1.03a15.6 15.6 0 0 0-5.2 0L8.88 4A17.5 17.5 0 0 0 4.7 5.34C2.05 9.23 1.33 13.02 1.69 16.75a17.1 17.1 0 0 0 5.13 2.58l1.24-1.69a10.9 10.9 0 0 1-1.95-.93l.48-.37c3.76 1.72 7.84 1.72 11.55 0l.49.37c-.63.37-1.29.68-1.96.93l1.24 1.69a17.08 17.08 0 0 0 5.12-2.58c.42-4.32-.72-8.08-3.73-11.41ZM8.7 14.48c-1.13 0-2.06-1.03-2.06-2.29 0-1.27.91-2.3 2.06-2.3s2.08 1.04 2.06 2.3c0 1.26-.91 2.29-2.06 2.29Zm6.6 0c-1.13 0-2.06-1.03-2.06-2.29 0-1.27.91-2.3 2.06-2.3 1.16 0 2.08 1.04 2.06 2.3 0 1.26-.9 2.29-2.06 2.29Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 4.5 18.7 19.5M19 4.5 5.3 19.5" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.2 7.25a2.7 2.7 0 0 0-1.9-1.91C17.62 4.88 12 4.88 12 4.88s-5.62 0-7.3.46a2.7 2.7 0 0 0-1.9 1.91C2.35 8.94 2.35 12 2.35 12s0 3.06.45 4.75a2.7 2.7 0 0 0 1.9 1.91c1.68.46 7.3.46 7.3.46s5.62 0 7.3-.46a2.7 2.7 0 0 0 1.9-1.91c.45-1.69.45-4.75.45-4.75s0-3.06-.45-4.75a2.7 2.7 0 0 0-1.9-1.91ZM10.1 15.15v-6.3L15.55 12l-5.45 3.15Z" />
    </svg>
  );
}

const socials = [
  {
    label: "Instagram",
    description: "Resultados, anuncios y contenido visual de la liga.",
    href: SOCIAL_LINKS.instagram,
    icon: <InstagramIcon />,
  },
  {
    label: "X / Twitter",
    description: "Novedades rápidas, comunicados y actualidad de APA.",
    href: SOCIAL_LINKS.x,
    icon: <XIcon />,
  },
  {
    label: "YouTube",
    description: "Partidos, highlights, premiaciones y contenido audiovisual.",
    href: SOCIAL_LINKS.youtube,
    icon: <YoutubeIcon />,
  },
];

export default function HomeCommunity() {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-[#c8e0ed] bg-[#f4f9fc] p-6 sm:p-9 lg:p-11">
      <div className="pointer-events-none absolute -left-28 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#65c3ed]/12 blur-3xl" />

      <div className="relative z-10 grid gap-9 lg:grid-cols-[minmax(300px,.8fr)_minmax(0,1.35fr)] lg:items-stretch">
        <motion.div
          initial={{ opacity: 0, x: -70 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center py-4"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#168fd4]">
            REDES SOCIALES
          </p>

          <h2 className="mt-3 text-[46px] font-black leading-[.94] tracking-[-0.055em] text-[#102f55] sm:text-[60px]">
            REDES SOCIALES
          </h2>

          <p className="mt-5 max-w-[48ch] text-[13px] font-semibold leading-6 text-[#58788f]">
            Resultados, anuncios, clips, novedades y toda la actividad oficial de PSO Argentina en un solo lugar.
          </p>

          <div className="mt-7">
            <a
              href={SOCIAL_LINKS.discord}
              target="_blank"
              rel="noreferrer"
              className="apa-home-cta inline-flex min-h-12 items-center rounded-xl bg-[#102f55] px-6 text-[10px] font-black uppercase tracking-[0.05em] transition hover:-translate-y-0.5 hover:bg-[#173e68]"
            >
              Unirme al Discord <span className="ml-3">→</span>
            </a>
          </div>
        </motion.div>

        <div className="grid gap-4">
          <motion.a
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            href={SOCIAL_LINKS.discord}
            target="_blank"
            rel="noreferrer"
            className="group relative grid min-h-[240px] overflow-hidden rounded-[24px] border border-[#1c5e8b]/25 bg-[linear-gradient(135deg,#0d3158,#075a90_66%,#0b7fb5)] p-7 text-white shadow-[0_20px_48px_rgba(16,47,85,.15)] sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-end sm:gap-6"
          >
            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[46px] border-white/[0.05]" />

            <div className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-white/10 p-4 text-white backdrop-blur">
              <DiscordIcon />
            </div>

            <div className="relative z-10 mt-6 sm:mt-0">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8cdbfb]">
                Comunidad principal
              </p>
              <h3 className="mt-2 text-[32px] font-black tracking-[-0.045em] text-white">
                Discord oficial de APA
              </h3>
              <p className="mt-3 max-w-[54ch] text-[12px] font-semibold leading-5 text-white/70">
                Buscá equipo, hablá con la comunidad, seguí los torneos y recibí anuncios en tiempo real.
              </p>
            </div>

            <span className="relative z-10 mt-6 text-[24px] font-black text-white transition group-hover:translate-x-1 sm:mt-0">
              →
            </span>
          </motion.a>

          <div className="grid gap-4 md:grid-cols-3">
            {socials.map((social, index) => (
              <motion.a
                key={social.label}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: 0.72,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="group min-h-[176px] rounded-[22px] border border-[#d2e4ed] bg-white p-5 transition hover:-translate-y-1 hover:border-[#9dcfe6] hover:shadow-[0_14px_34px_rgba(16,47,85,.07)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf7fc] p-2.5 text-[#102f55]">
                  {social.icon}
                </div>

                <h3 className="mt-5 text-[17px] font-black text-[#102f55] transition group-hover:text-[#168fd4]">
                  {social.label}
                </h3>

                <p className="mt-2 text-[11px] font-semibold leading-5 text-[#6b8799]">
                  {social.description}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
