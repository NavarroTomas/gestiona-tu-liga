import { CUPS_CONFIG } from "@/config/cups";

export default function CupsHero({ season }: { season: string }) {
  return (
    <section className="apa-cups-hero relative min-h-[170px] overflow-hidden border-b border-[#c9e3f1] sm:min-h-[190px]">
      <img
        src={CUPS_CONFIG.hero.image}
        alt={CUPS_CONFIG.hero.alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,249,253,.72)_0%,rgba(236,247,253,.58)_30%,rgba(205,235,250,.38)_58%,rgba(86,175,226,.18)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02))]" />

      <div className="relative z-10 mx-auto flex min-h-[170px] w-full max-w-[1480px] items-center px-5 py-7 sm:min-h-[190px] sm:px-8 lg:px-12">
        <div className="min-w-0">
          <h1 className="m-0 text-[clamp(31px,4vw,64px)] font-black uppercase leading-[.92] tracking-[-.055em] text-[#102f55]">
            {CUPS_CONFIG.hero.title}
          </h1>
          <p className="mt-3 text-[clamp(14px,1.45vw,22px)] font-semibold text-[#214b77] sm:mt-4">
            {CUPS_CONFIG.hero.subtitle} · {season}
          </p>
        </div>
      </div>
    </section>
  );
}
