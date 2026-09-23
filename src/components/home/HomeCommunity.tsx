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
    description: "Buscá equipo, seguí torneos y recibí anuncios oficiales.",
    href: SOCIAL_LINKS.discord,
    icon: <DiscordIcon />,
  },
  {
    label: "Instagram",
    eyebrow: "Contenido",
    description: "Resultados, anuncios y contenido visual de la liga.",
    href: SOCIAL_LINKS.instagram,
    icon: <InstagramIcon />,
  },
  {
    label: "Twitch",
    eyebrow: "En vivo",
    description: "Partidos y transmisiones oficiales de APA.",
    href: TWITCH_URL,
    icon: <TwitchIcon />,
  },
  {
    label: "YouTube",
    eyebrow: "Videos",
    description: "Highlights, premiaciones y contenido audiovisual.",
    href: SOCIAL_LINKS.youtube,
    icon: <YoutubeIcon />,
  },
] as const;

export default function HomeCommunity() {
  return (
    <section className="relative left-1/2 flex min-h-[100svh] w-[100dvw] -translate-x-1/2 bg-[#102f55] text-white">
      <div className="mx-auto flex min-h-[100svh] w-[min(94vw,1760px)] flex-col justify-between py-10 sm:py-14 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1100px]"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#74c8f0]">
            Comunidad APA
          </p>

          <h2 className="mt-4 text-[clamp(4rem,10vw,10rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] text-white">
            REDES
            <br />
            SOCIALES
          </h2>

          <p className="mt-7 max-w-[660px] text-[14px] font-semibold leading-7 text-white/65 sm:text-[16px]">
            Todo lo que pasa en APA también vive fuera de la web. Elegí tu plataforma y seguí la liga donde más te guste.
          </p>
        </motion.div>

        <div className="mt-16 grid border-t border-white/20 md:grid-cols-2 lg:grid-cols-4">
          {SOCIALS.map((social, index) => (
            <motion.a
              key={social.label}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                duration: 0.65,
                delay: index * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="group flex min-h-[220px] flex-col justify-between border-b border-white/20 py-7 transition hover:bg-white/[0.04] md:px-6 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center text-white">
                  {social.icon}
                </div>

                <span className="text-[18px] font-black text-white/55 transition group-hover:translate-x-1 group-hover:text-white">
                  ↗
                </span>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#74c8f0]">
                  {social.eyebrow}
                </p>
                <h3 className="mt-2 text-[30px] font-black tracking-[-0.045em] text-white">
                  {social.label}
                </h3>
                <p className="mt-3 max-w-[30ch] text-[11px] font-semibold leading-5 text-white/55">
                  {social.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
