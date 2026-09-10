import { FIXTURE_CONFIG } from "@/config/fixture";

/** Encabezado visual del Fixture. Los textos variables llegan desde la página. */
export default function FixtureHero({ subtitle }: { subtitle: string }) {
  return (
    <section className="relative overflow-hidden border-b border-[#c9e3f1] bg-[#edf8fe]">
      <img
        src={FIXTURE_CONFIG.hero.image}
        alt={FIXTURE_CONFIG.hero.alt}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,249,253,.99)_0%,rgba(238,248,254,.95)_42%,rgba(225,242,252,.82)_70%,rgba(205,234,249,.62)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.03))]" />

      <div className="relative z-10 mx-auto flex min-h-[118px] w-full max-w-[1480px] items-center px-4 py-5 sm:min-h-[144px] sm:px-6 sm:py-6 lg:min-h-[172px] lg:px-12">
        <div className="min-w-0">
          <h1 className="m-0 text-[36px] font-black uppercase leading-[.9] tracking-[-.055em] text-[#102f55] sm:text-[48px] lg:text-[clamp(52px,6vw,78px)]">
            {FIXTURE_CONFIG.hero.title}
          </h1>
          <p className="mt-2 max-w-[92vw] truncate text-[9px] font-black uppercase tracking-[.18em] text-[#3f73a1] sm:mt-3 sm:text-[11px] sm:tracking-[.28em] lg:text-[13px] lg:tracking-[.34em]">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
