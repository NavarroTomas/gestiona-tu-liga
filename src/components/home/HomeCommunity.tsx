"use client";

import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/config/social";

const TWITCH_URL = "https://www.twitch.tv/psoargentina26";

function DiscordIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M19.3 5.34A17.16 17.16 0 0 0 15.11 4l-.51 1.03a15.6 15.6 0 0 0-5.2 0L8.88 4A17.5 17.5 0 0 0 4.7 5.34C2.05 9.23 1.33 13.02 1.69 16.75a17.1 17.1 0 0 0 5.13 2.58l1.24-1.69a10.9 10.9 0 0 1-1.95-.93l.48-.37c3.76 1.72 7.84 1.72 11.55 0l.49.37c-.63.37-1.29.68-1.96.93l1.24 1.69a17.08 17.08 0 0 0 5.12-2.58c.42-4.32-.72-8.08-3.73-11.41ZM8.7 14.48c-1.13 0-2.06-1.03-2.06-2.29 0-1.27.91-2.3 2.06-2.3s2.08 1.04 2.06 2.3c0 1.26-.91 2.29-2.06 2.29Zm6.6 0c-1.13 0-2.06-1.03-2.06-2.29 0-1.27.91-2.3 2.06-2.3 1.16 0 2.08 1.04 2.06 2.3 0 1.26-.9 2.29-2.06 2.29Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function TwitchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M4 3 2 8v11h4v3l3-3h4l7-7V3H4Zm14 8-4 4H9l-2 2v-2H4V5h14v6Zm-3-4h-2v4h2V7Zm-5 0H8v4h2V7Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M21.2 7.25a2.7 2.7 0 0 0-1.9-1.91C17.62 4.88 12 4.88 12 4.88s-5.62 0-7.3.46a2.7 2.7 0 0 0-1.9 1.91C2.35 8.94 2.35 12 2.35 12s0 3.06.45 4.75a2.7 2.7 0 0 0 1.9 1.91c1.68.46 7.3.46 7.3.46s5.62 0 7.3-.46a2.7 2.7 0 0 0 1.9-1.91c.45-1.69.45-4.75.45-4.75s0-3.06-.45-4.75a2.7 2.7 0 0 0-1.9-1.91ZM10.1 15.15v-6.3L15.55 12l-5.45 3.15Z" />
    </svg>
  );
}

const SOCIALS = [
  {
    label: "Discord",
    eyebrow: "Comunidad",
    description: "Buscá equipo, seguí torneos y recibí todos los anuncios oficiales.",
    href: SOCIAL_LINKS.discord,
    icon: <DiscordIcon />,
    accent: "#5865F2",
  },
  {
    label: "Instagram",
    eyebrow: "Contenido",
    description: "Resultados, novedades y contenido visual de la liga.",
    href: SOCIAL_LINKS.instagram,
    icon: <InstagramIcon />,
    accent: "#168fd4",
  },
  {
    label: "Twitch",
    eyebrow: "En vivo",
    description: "Partidos y transmisiones oficiales de APA.",
    href: TWITCH_URL,
    icon: <TwitchIcon />,
    accent: "#6f57b8",
  },
  {
    label: "YouTube",
    eyebrow: "Videos",
    description: "Highlights, premiaciones y contenido audiovisual.",
    href: SOCIAL_LINKS.youtube,
    icon: <YoutubeIcon />,
    accent: "#102f55",
  },
] as const;

export default function HomeCommunity() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#eef8fd]">
      <div className="pointer-events-none absolute -left-28 top-20 h-[360px] w-[360px] rounded-full bg-[#d5effb]" />
      <div className="pointer-events-none absolute -right-24 bottom-[-100px] h-[420px] w-[420px] rounded-full bg-[#dff3ff]" />

      <div className="relative mx-auto grid min-h-[100svh] w-[min(94vw,1760px)] gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,.9fr)_minmax(520px,1.1fr)] lg:items-center lg:px-8 lg:py-20">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#168fd4]">
            Comunidad APA
          </p>

          <h2 className="mt-4 text-[clamp(4rem,8vw,8.5rem)] font-black uppercase leading-[0.84] tracking-[-0.07em] text-[#102f55]">
            REDES
            <br />
            SOCIALES
          </h2>

          <p className="mt-7 max-w-[620px] text-[14px] font-semibold leading-7 text-[#58788f] sm:text-[16px]">
            Todo lo que pasa en APA también vive fuera de la web. Elegí tu plataforma y seguí la liga donde más te guste.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#168fd4]" />
            <span className="h-3 w-10 rounded-full bg-[#8fd1ef]" />
            <span className="h-3 w-3 rounded-full bg-[#102f55]" />
          </div>
        </motion.div>

        <div className="space-y-2">
          {SOCIALS.map((social, index) => (
            <motion.a
              key={social.label}
              initial={{ opacity: 0, x: 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                duration: 0.68,
                delay: index * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-5 rounded-[24px] px-4 py-5 transition hover:bg-white/70 sm:px-6 sm:py-6"
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] text-white shadow-[0_10px_28px_rgba(16,47,85,.08)]"
                style={{ backgroundColor: social.accent }}
              >
                {social.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#168fd4]">
                  {social.eyebrow}
                </p>
                <h3 className="mt-1 text-[26px] font-black tracking-[-0.04em] text-[#102f55] sm:text-[30px]">
                  {social.label}
                </h3>
                <p className="mt-1.5 max-w-[48ch] text-[11px] font-semibold leading-5 text-[#6d8797] sm:text-[12px]">
                  {social.description}
                </p>
              </div>

              <span className="shrink-0 text-[24px] font-black text-[#93b8ca] transition group-hover:translate-x-1 group-hover:text-[#102f55]">
                ↗
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
