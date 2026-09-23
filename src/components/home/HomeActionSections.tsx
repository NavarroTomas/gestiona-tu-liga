"use client";

import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/config/social";

type ActionSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  direction?: "left" | "right";
  dark?: boolean;
  visual: "sponsors" | "streamer" | "create" | "search";
};

function ActionVisual({ type, dark }: { type: ActionSectionProps["visual"]; dark: boolean }) {
  if (type === "sponsors") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {["Partner principal", "Partner oficial", "Tu marca acá", "Media partner", "Tecnología", "Comunidad"].map((label, index) => (
          <div
            key={label}
            className={
              "flex min-h-[92px] items-center justify-center rounded-[18px] border px-4 text-center text-[10px] font-black uppercase tracking-[.08em] " +
              (dark
                ? "border-white/15 bg-white/[.07] text-white/70"
                : "border-[#cfe2ed] bg-white text-[#7891a3]")
            }
          >
            {index === 2 ? "TU MARCA" : label}
          </div>
        ))}
      </div>
    );
  }

  if (type === "streamer") {
    return (
      <div className="relative mx-auto aspect-video w-full max-w-[620px] overflow-hidden rounded-[24px] border border-white/15 bg-[#071d34] shadow-[0_22px_60px_rgba(0,0,0,.18)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(86,175,226,.34),transparent_34%),linear-gradient(135deg,#0b2747,#07182a)]" />
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-[#df3c45] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.1em] text-white">
          <span className="h-2 w-2 rounded-full bg-white" /> EN VIVO
        </div>
        <div className="absolute inset-x-6 bottom-6">
          <p className="text-[28px] font-black tracking-[-.04em] text-white sm:text-[36px]">APA MATCHDAY</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 flex-1 rounded-full bg-white/15"><span className="block h-full w-[68%] rounded-full bg-[#56afe2]" /></span>
            <span className="text-[9px] font-black uppercase text-white/60">STREAM</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "create") {
    return (
      <div className="mx-auto grid w-full max-w-[620px] grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex aspect-square items-center justify-center rounded-[28px] border border-[#c9e1ed] bg-white text-[54px] font-black text-[#102f55] shadow-[0_16px_40px_rgba(16,47,85,.08)]">?</div>
        <span className="text-[26px] font-black text-[#8bbdd5]">+</span>
        <div className="flex aspect-square items-center justify-center rounded-[28px] bg-[#102f55] p-7 text-center text-[18px] font-black uppercase leading-tight text-white shadow-[0_16px_40px_rgba(16,47,85,.15)]">
          Tu club
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[620px] space-y-3">
      {["Arquero · Libre", "Defensor · Busca club", "Volante · Disponible", "Delantero · Busca proyecto"].map((label, index) => (
        <div
          key={label}
          className="flex min-h-[72px] items-center justify-between rounded-[18px] border border-[#d2e4ed] bg-white px-5 shadow-[0_10px_28px_rgba(16,47,85,.05)]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf7fc] text-[11px] font-black text-[#168fd4]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[13px] font-black text-[#102f55]">{label}</span>
          </div>
          <span className="text-[11px] font-black uppercase text-[#168fd4]">Disponible</span>
        </div>
      ))}
    </div>
  );
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
      initial={{ opacity: 0, x: reverse ? 80 : -80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      className={
        "overflow-hidden rounded-[30px] border p-7 sm:p-10 lg:p-12 " +
        (dark
          ? "border-[#194f77] bg-[linear-gradient(135deg,#0b2747,#123f68)] text-white"
          : "border-[#c9e1ed] bg-[#f6fbfe] text-[#102f55]")
      }
    >
      <div className={"grid gap-10 lg:grid-cols-2 lg:items-center " + (reverse ? "lg:[&>*:first-child]:order-2" : "")}>
        <div>
          <p className={"text-[10px] font-black uppercase tracking-[.2em] " + (dark ? "text-[#83d4f6]" : "text-[#168fd4]")}>
            {eyebrow}
          </p>
          <h2 className={"mt-3 max-w-[760px] text-[44px] font-black leading-[.94] tracking-[-.055em] sm:text-[60px] " + (dark ? "text-white" : "text-[#102f55]")}>
            {title}
          </h2>
          <p className={"mt-5 max-w-[62ch] text-[14px] font-semibold leading-7 " + (dark ? "text-white/70" : "text-[#58788f]")}>
            {description}
          </p>

          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className={
              "apa-home-cta mt-7 inline-flex min-h-12 items-center rounded-xl px-6 text-[10px] font-black uppercase tracking-[.06em] transition hover:-translate-y-0.5 " +
              (dark ? "bg-[#168fd4] hover:bg-[#0f7ebd]" : "bg-[#102f55] hover:bg-[#173e68]")
            }
          >
            {cta} <span className="ml-3">→</span>
          </a>
        </div>

        <ActionVisual type={visual} dark={dark} />
      </div>
    </motion.section>
  );
}

export function HomeSponsors() {
  return (
    <ActionSection
      eyebrow="Patrocinadores"
      title="Tu marca puede jugar esta temporada."
      description="Abrimos espacios para marcas que quieran acompañar a APA, integrarse a nuestras transmisiones, eventos y presencia digital, y conectar con una comunidad competitiva en crecimiento."
      cta="Quiero patrocinar APA"
      href={SOCIAL_LINKS.discord}
      visual="sponsors"
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
      dark
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
