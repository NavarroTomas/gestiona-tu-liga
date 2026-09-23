"use client";

import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/config/social";

const AUSPICIANTES = [
  {
    name: "PSO COMMUNITY HUB",
    short: "PSO MIX",
    description:
      "Comunidad compañera de Pro Soccer Online.",
    href: "https://discord.gg/q9nWQxBuMX",
    type: "Discord",
    banner:
      "/images/auspiciantes/pso-mix-banner.webp",
    logo:
      "/images/auspiciantes/pso-mix-logo.webp",
  },

  {
    name: "PSO Brasil",
    short: "PSO BRASIL",
    description:
      "Comunidad brasileña compañera de Pro Soccer Online.",
    href: "https://discord.gg/j5hcsPp3bS",
    type: "Discord",
    banner: null,
    logo: null,
  },

  {
    name: "COPERO PSO SA",
    short: "COPERO",
    description:
      "Proyecto y web compañera de la comunidad sudamericana.",
    href: "https://copero-bp1.pages.dev/",
    type: "Web",
    banner: null,
    logo: null,
  },

  {
    name: "Pro Soccer Online",
    short: "PSO OFICIAL",
    description:
      "Comunidad oficial de Pro Soccer Online.",
    href: "https://discord.gg/WJx6k7KxPd",
    type: "Discord",
    banner: "/images/fixture/liga.png",
    logo: null,
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
  visual:
    | "auspiciantes"
    | "streamer"
    | "create"
    | "search";
  surface?:
    | "transparent"
    | "sky"
    | "white";
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
    <div className="grid gap-5 sm:grid-cols-2">
      {AUSPICIANTES.map((community) => (
        <a
          key={community.name}
          href={community.href}
          target="_blank"
          rel="noreferrer"
          className="group relative min-h-[205px] overflow-hidden rounded-[24px] border border-[#cfe2ed] bg-[#102f55] transition hover:-translate-y-1 hover:border-[#82c5e4] hover:shadow-[0_18px_40px_rgba(16,47,85,.12)]"
        >
          {community.banner ? (
            <img
              src={community.banner}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 bg-[#14527e]" />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,18,32,.05),rgba(4,18,32,.92))]" />

          <div className="relative z-10 flex min-h-[205px] flex-col justify-end p-5">
            <div className="mb-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {community.logo ? (
                  <img
                    src={community.logo}
                    alt=""
                    className="h-10 w-10 rounded-xl object-contain"
                  />
                ) : null}

                <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-white backdrop-blur">
                  {community.type}
                </span>
              </div>

              <span className="text-[12px] font-black uppercase text-white/75">
                ↗
              </span>
            </div>

            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#8bd9fa]">
              {community.short}
            </p>

            <h3 className="mt-1 text-[23px] font-black leading-[0.98] tracking-[-0.035em] text-white">
              {community.name}
            </h3>

            <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-5 text-white/70">
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
        src="/images/home/streamer-twitch.webp"
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
        src="/images/home/crea-equipo-chelsea.webp"
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
        src="/images/home/busca-equipo.webp"
        alt="Escudos de clubes de la comunidad"
        className="block max-h-[360px] w-full object-contain"
      />
    </div>
  );
}

function ActionVisual({
  type,
}: {
  type: ActionSectionProps["visual"];
}) {
  if (type === "auspiciantes")
    return <AuspiciantesVisual />;

  if (type === "streamer")
    return <StreamerVisual />;

  if (type === "create")
    return <CreateVisual />;

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
  surface = "transparent",
}: ActionSectionProps) {
  const reverse = direction === "right";

  const gridClass =
    visual === "auspiciantes"
      ? "lg:grid-cols-[1.18fr_.82fr]"
      : "lg:grid-cols-2";

  return (
    <motion.section
      initial={{
        opacity: 0,
        x: reverse ? 72 : -72,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
        amount: 0.16,
      }}
      transition={{
        duration: 0.98,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={
        "w-full overflow-hidden " +
        (surface === "sky"
          ? "bg-[#dff3ff]"
          : surface === "white"
            ? "bg-white"
            : "bg-transparent")
      }
    >
      <div className="mx-auto w-[min(94vw,1760px)] px-4 py-16 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
        <div
          className={
            `grid items-center gap-12 ${gridClass} lg:gap-16 ` +
            (reverse
              ? "lg:[&>*:first-child]:order-2"
              : "")
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
              <WhiteButton
                href={href}
                label={cta}
                dark={dark}
              />
            </div>
          </div>

          <ActionVisual type={visual} />
        </div>
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
      surface="white"
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
      surface="sky"
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
      surface="white"
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
      surface="white"
    />
  );
}