import Link from "next/link";
import { LEAGUE_CONFIG } from "@/config/league";

export default function LeagueFooter() {
  return (
    <footer className="mt-3 border-t border-[#d7e6f0] bg-white">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1480px] flex-col justify-center gap-3 px-5 py-4 text-[#102f55] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo-apa.png" alt="Gestioná tu Liga" className="h-8 w-8 object-cover" />
            <strong className="text-[12px] font-black uppercase tracking-[.15em]">{LEAGUE_CONFIG.footer.brand}</strong>
          </div>
          <span className="hidden h-5 w-px bg-[#d5e4ed] sm:block" />
          <span className="hidden text-[10px] font-medium text-[#6b849d] sm:block">{LEAGUE_CONFIG.footer.slogan}</span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold text-[#5f7891] sm:gap-x-5" aria-label="Enlaces del pie de página">
          {LEAGUE_CONFIG.footer.links.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-[#2498d8]">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
