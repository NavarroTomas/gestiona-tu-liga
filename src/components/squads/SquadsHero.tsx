import { SQUADS_CONFIG } from "@/config/squads";

export default function SquadsHero() {
  return (
    <section className="border-b border-[#164a74] bg-[#07345b] text-white">
      <div className="mx-auto max-w-[1680px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <p className="text-xs font-black uppercase tracking-[.28em] text-[#77c9f3]">
          {SQUADS_CONFIG.hero.eyebrow}
        </p>
        <h1 className="mt-2 text-[42px] font-black uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl">
          {SQUADS_CONFIG.hero.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-white/82 sm:text-[17px]">
          {SQUADS_CONFIG.hero.description}
        </p>
      </div>
    </section>
  );
}
