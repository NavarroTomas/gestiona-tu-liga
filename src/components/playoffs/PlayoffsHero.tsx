
import { displayLabel } from "@/lib/displayLabels";
import { PLAYOFFS_CONFIG } from "@/config/playoffs";

/** Hero de Playoffs. Textos e imagen se cambian desde config/playoffs.ts. */
export default function PlayoffsHero({ season }: { season: string }) {
  return (
    <section className="relative min-h-[170px] overflow-hidden border-b border-[#c9e3f1] sm:min-h-[190px]">
      <img
        src={PLAYOFFS_CONFIG.hero.image}
        alt={PLAYOFFS_CONFIG.hero.alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,249,253,.78)_0%,rgba(236,247,253,.62)_32%,rgba(205,235,250,.40)_60%,rgba(86,175,226,.18)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02))]" />

      <div className="relative z-10 mx-auto flex min-h-[170px] w-full max-w-[1480px] items-center px-5 py-7 sm:min-h-[190px] sm:px-8 lg:px-12">
        <div className="min-w-0">
          <h1 className="m-0 max-w-[920px] text-[clamp(31px,4vw,64px)] font-black uppercase leading-[.92] tracking-[-.055em] text-[#102f55]">
            {PLAYOFFS_CONFIG.hero.title}
          </h1>
          <p className="mt-3 text-[clamp(14px,1.45vw,22px)] font-semibold text-[#214b77] sm:mt-4">
            {PLAYOFFS_CONFIG.hero.subtitle} · {displayLabel(season)}
          </p>
        </div>
      </div>
    </section>
  );
}
