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

type SocialBlockProps = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  background: string;
  icon: React.ReactNode;
  large?: boolean;
};

function SocialBlock({
  href,
  eyebrow,
  title,
  description,
  background,
  icon,
  large = false,
}: SocialBlockProps) {
  return (
    <motion.a
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        "group relative flex overflow-hidden rounded-[28px] p-6 text-white transition hover:-translate-y-1 sm:p-8 " +
        (large ? "min-h-[250px] items-end" : "min-h-[190px] flex-col justify-between")
      }
      style={{ backgroundColor: background }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/14 text-white sm:h-14 sm:w-14">
        {icon}
      </div>

      <div className={large ? "mt-10 max-w-[820px]" : "mt-8"}>
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/70">
          {eyebrow}
        </p>
        <h3
          className={
            "mt-2 font-black leading-[0.95] tracking-[-0.045em] text-white " +
            (large ? "text-[clamp(2.2rem,4vw,4.5rem)]" : "text-[28px]")
          }
        >
          {title}
        </h3>
        <p className="mt-3 max-w-[58ch] text-[12px] font-semibold leading-5 text-white/78">
          {description}
        </p>
      </div>

      <span className="absolute right-6 top-6 text-[20px] font-black text-white transition group-hover:translate-x-1 sm:right-8 sm:top-8">
        →
      </span>
    </motion.a>
  );
}

export default function HomeCommunity() {
  return (
    <section className="border-t border-[#c9e1ed] pb-4 pt-14 sm:pt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.22 }}
        transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#168fd4]">
          Comunidad
        </p>
        <h2 className="mt-2 text-[clamp(2.8rem,6vw,6.4rem)] font-black uppercase leading-[0.88] tracking-[-0.06em] text-[#102f55]">
          REDES SOCIALES
        </h2>
        <p className="mt-5 max-w-[700px] text-[14px] font-semibold leading-7 text-[#58788f]">
          Seguí toda la actividad de APA, sumate a la comunidad y acompañá cada fecha también fuera de la web.
        </p>
      </motion.div>

      <div className="grid gap-4">
        <SocialBlock
          href={SOCIAL_LINKS.discord}
          eyebrow="Comunidad principal"
          title="Discord oficial de APA"
          description="Buscá equipo, seguí los torneos, participá de la comunidad y recibí los anuncios oficiales en tiempo real."
          background="#5865F2"
          icon={<DiscordIcon />}
          large
        />

        <div className="grid gap-4 md:grid-cols-3">
          <SocialBlock
            href={SOCIAL_LINKS.instagram}
            eyebrow="Contenido"
            title="Instagram"
            description="Resultados, anuncios, placas y contenido visual de la liga."
            background="#E4405F"
            icon={<InstagramIcon />}
          />

          <SocialBlock
            href={TWITCH_URL}
            eyebrow="En vivo"
            title="Twitch"
            description="Transmisiones oficiales, partidos y contenido en directo de APA."
            background="#9146FF"
            icon={<TwitchIcon />}
          />

          <SocialBlock
            href={SOCIAL_LINKS.youtube}
            eyebrow="Videos"
            title="YouTube"
            description="Partidos, highlights, premiaciones y contenido audiovisual."
            background="#FF0033"
            icon={<YoutubeIcon />}
          />
        </div>
      </div>
    </section>
  );
}
