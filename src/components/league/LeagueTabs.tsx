import Link from "next/link";
import { LEAGUE_CONFIG, type LeagueTabId } from "@/config/league";

export default function LeagueTabs({ activeId }: { activeId: LeagueTabId }) {
  return (
    <div className="border-b border-[#d7e6f0] bg-white/95">
      <nav
        className="mx-auto flex w-full max-w-[1480px] items-end gap-6 overflow-x-auto px-5 sm:gap-7 sm:px-8 lg:px-12"
        aria-label="Secciones de Liga"
      >
        {LEAGUE_CONFIG.tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`whitespace-nowrap border-b-[3px] px-1 py-3.5 text-[13px] transition sm:py-4 sm:text-sm ${
                active
                  ? "border-[#56afe2] font-black text-[#102f55]"
                  : "border-transparent font-bold text-[#5c7693] hover:text-[#102f55]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
