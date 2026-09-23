"use client";

import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/config/social";

const AUSPICIANTES = [
  {
    name: "PSO COMMUNITY HUB",
    short: "PSO MIX",
    description: "Comunidad compañera de Pro Soccer Online.",
    href: "https://discord.gg/q9nWQxBuMX",
    type: "Discord",
    banner: "/images/auspiciantes/pso-mix-banner.png",
  },
  {
    name: "PSO Brasil",
    short: "PSO BRASIL",
    description: "Comunidad brasileña compañera de Pro Soccer Online.",
    href: "https://discord.gg/j5hcsPp3bS",
    type: "Discord",
    banner: null,
  },
  {
    name: "COPERO PSO SA",
    short: "COPERO",
    description: "Proyecto y web compañera de la comunidad sudamericana.",
    href: "https://copero-bp1.pages.dev/",
    type: "Web",
    banner: null,
  },
] as const;

type ActionSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  direction?: "left" | "right";
  dark?: boolean;
  visual: "auspiciantes" | "streamer" | "create" | "search";
};

function WhiteButton({
  href,
  label,
  dark = false,
}: {
  href: string;
  label: string;
  dark?: boolean;
}) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={
        "apa-home-cta inline-flex min-h-12 items-center rounded-xl px-6 text-[10px] font-black uppercase tracking-[0.06em] !text-white [&_*]:!text-white transition hover:-translate-y-0.5 " +
        (dark
          ? "bg-[#168fd4] hover:bg-[#0f7ebd]"
          : "bg-[#102f55] hover:bg-[#173e68]")
      }
    >
      <span>{label}</span>
      <span className="ml-3">→</span>
    </a>
  );
}

function AuspiciantesVisual() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {AUSPICIANTES.map((community) => (
        <a
          key={community.name}
          href={community.href}
          target="_blank"
          rel="noreferrer"
          className="group relative min-h-[150px] overflow-hidden rounded-[20px] border border-[#cfe2ed] bg-[#102f55] transition hover:-translate-y-1 hover:border-[#82c5e4] hover:shadow-[0_16px_34px_rgba(16,47,85,.11)]"
        >
          {community.banner ? (
            <img
              src={community.banner}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#102f55,#176a9e)]" />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,18,32,.06),rgba(4,18,32,.88))]" />

          <div className="relative z-10 flex min-h-[150px] flex-col justify-end p-4">
            <div className="mb-auto flex items-center justify-between gap-2">
              <span className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white backdrop-blur">
                {community.type}
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.08em] text-white/75">
                ↗
              </span>
            </div>

            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#8bd9fa]">
              {community.short}
            </p>
            <h3 className="mt-1 text-[18px] font-black leading-tight tracking-[-0.025em] text-white">
              {community.name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-[10px] font-semibold leading-4 text-white/65">
              {community.description}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}

function StreamerVisual() {
  return (
    <div className="relative min-h-[330px] overflow-hidden rounded-[28px] bg-[#071d34]">
      <img
        src="/images/home/streamer-twitch.png"
        alt="Transmisión y presentación oficial de APA"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,18,32,.72),rgba(4,18,32,.08))]" />
      <div className="absolute left-5 top-5 rounded-full bg-[#9146ff] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-white">
        Twitch
      </div>
    </div>
  );
}

function CreateVisual() {
  return (
    <div className="overflow-hidden rounded-[28px]">
      <img
        src="/images/home/crea-equipo-chelsea.png"
        alt="Chelsea campeón de Copa APA"
        className="block min-h-[330px] w-full object-cover"
      />
    </div>
  );
}

function SearchVisual() {
  return (
    <div className="flex min-h-[330px] items-center justify-center">
      <img
        src="/images/home/busca-equipo.png"
        alt="Escudos de clubes de la comunidad"
        className="block max-h-[360px] w-full object-contain"
      />
    </div>
  );
}

function ActionVisual({ type }: { type: ActionSectionProps["visual"] }) {
  if (type === "auspiciantes") return <AuspiciantesVisual />;
  if (type === "streamer") return <StreamerVisual />;
  if (type === "create") return <CreateVisual />;
  return <SearchVisual />;
}

function ActionSection({
  eyebrow,
  title,
  description,
  cta,
  href,
  direction = "left",
  dark = false,
  visual,
}: ActionSectionProps) {
  const reverse = direction === "right";

  return (
    <motion.section
      initial={{ opacity: 0, x: reverse ? 72 : -72 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.98, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-[#c9e1ed] py-11 sm:py-14"
    >
      <div
        className={
          "grid items-center gap-9 lg:grid-cols-2 lg:gap-14 " +
          (reverse ? "lg:[&>*:first-child]:order-2" : "")
        }
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#168fd4]">
            {eyebrow}
          </p>

          <h2 className="mt-3 max-w-[780px] text-[clamp(2.5rem,4.8vw,5rem)] font-black leading-[0.94] tracking-[-0.055em] text-[#102f55]">
            {title}
          </h2>

          <p className="mt-5 max-w-[62ch] text-[14px] font-semibold leading-7 text-[#58788f]">
            {description}
          </p>

          <div className="mt-7">
            <WhiteButton href={href} label={cta} dark={dark} />
          </div>
        </div>

        <ActionVisual type={visual} />
      </div>
    </motion.section>
  );
}

export function HomeSponsors() {
  return (
    <ActionSection
      eyebrow="Auspiciantes"
      title="Comunidades y proyectos que acompañan a APA."
      description="Espacio para comunidades, servidores y proyectos compañeros de Pro Soccer Online que forman parte del ecosistema sudamericano junto a APA."
      cta="Quiero ser auspiciante"
      href={SOCIAL_LINKS.discord}
      visual="auspiciantes"
      direction="right"
    />
  );
}

export function HomeStreamerCTA() {
  return (
    <ActionSection
      eyebrow="Creadores de contenido"
      title="Convertite en streamer de la liga."
      description="Sumate a las transmisiones oficiales, cubrí partidos, generá contenido y ayudanos a hacer que cada fecha tenga más alcance dentro y fuera de PSO."
      cta="Quiero ser streamer"
      href={SOCIAL_LINKS.discord}
      visual="streamer"
    />
  );
}

export function HomeCreateTeamCTA() {
  return (
    <ActionSection
      eyebrow="Clubes"
      title="Creá tu equipo y entrá a competir."
      description="Armá tu identidad, reuní tu plantel y empezá el proceso para formar parte de las competiciones oficiales de APA."
      cta="Quiero crear mi equipo"
      href={SOCIAL_LINKS.discord}
      visual="create"
      direction="right"
    />
  );
}

export function HomeFindTeamCTA() {
  return (
    <ActionSection
      eyebrow="Jugadores"
      title="¿Buscás equipo? Encontrá tu próximo club."
      description="Entrá a la comunidad, presentate como agente libre y conectá con capitanes y clubes que estén buscando jugadores para completar sus planteles."
      cta="Buscar equipo"
      href={SOCIAL_LINKS.discord}
      visual="search"
    />
  );
}
