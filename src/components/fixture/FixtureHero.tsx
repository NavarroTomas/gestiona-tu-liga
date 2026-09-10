import { FIXTURE_CONFIG } from "@/config/fixture";

/** Encabezado visual del Fixture. Los textos variables llegan desde la página. */
export default function FixtureHero({ subtitle }: { subtitle: string }) {
  return (
    <section className="relative overflow-hidden border-b border-[#c9e3f1] bg-[#edf8fe]">
      <img
        src={FIXTURE_CONFIG.hero.image}
        alt={FIXTURE_CONFIG.hero.alt}
        className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,249,253,.98)_0%,rgba(238,248,254,.94)_34%,rgba(225,242,252,.78)_62%,rgba(205,234,249,.58)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.02))]" />

      <div className="relative z-10 mx-auto flex min-h-[154px] w-full max-w-[1480px] items-center px-5 py-6 sm:min-h-[172px] sm:px-8 lg:px-12">
        <div>
          <h1 className="m-0 text-[clamp(42px,6vw,78px)] font-black uppercase leading-[.88] tracking-[-.06em] text-[#102f55]">
            {FIXTURE_CONFIG.hero.title}
          </h1>
          <p className="mt-3 text-[11px] font-black uppercase tracking-[.34em] text-[#3f73a1] sm:text-[13px]">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
