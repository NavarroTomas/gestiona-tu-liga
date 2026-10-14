
import { displayLabel } from "@/lib/displayLabels";
import { CLUBS_CONFIG } from "@/config/clubs";
import { TrophyIcon, UsersIcon } from "./ClubsIcons";

export default function ClubsHero({ season, division }: { season: string; division: string }) {
  return (
    <section className="relative overflow-hidden border-b border-[#0d4f7b] bg-[#073a63] text-white">
      <div className="absolute inset-0 opacity-30" style={{ background: "linear-gradient(115deg, #062d4d 0%, #073a63 54%, #0a4c7e 100%)" }} />
      <div className="absolute -right-24 top-0 h-full w-[44%] skew-x-[-18deg] border-l border-white/5 bg-white/[0.025]" />
      <div className="relative mx-auto max-w-[1680px] px-5 py-9 sm:px-8 lg:px-10 lg:py-11">
        <p className="text-[12px] font-black uppercase tracking-[.18em] text-[#79cef5]">{CLUBS_CONFIG.hero.eyebrow}</p>
        <h1 className="mt-3 text-[44px] font-black uppercase leading-[.92] tracking-[-.045em] sm:text-6xl lg:text-7xl">
          Clubes <span className="text-[#56afe2]">Liga</span>
        </h1>
        <p className="mt-5 max-w-[760px] text-[15px] font-medium leading-6 text-white/82 sm:text-base sm:leading-7">
          {CLUBS_CONFIG.hero.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#61bcea]/40 bg-[#0b4a78] px-4 py-2 text-[12px] font-black text-white/92">
            <UsersIcon className="h-4 w-4 text-[#79cef5]" /> Clubes oficiales
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#61bcea]/40 bg-[#0b4a78] px-4 py-2 text-[12px] font-black text-white/92">
            <TrophyIcon className="h-4 w-4 text-[#79cef5]" /> {division} División
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#61bcea]/40 bg-[#0b4a78] px-4 py-2 text-[12px] font-black text-white/92">
            <span className="h-2 w-2 rounded-full bg-[#79cef5]" /> {displayLabel(season)}
          </span>
        </div>
      </div>
    </section>
  );
}
