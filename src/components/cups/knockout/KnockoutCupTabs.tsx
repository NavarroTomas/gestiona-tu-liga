import Link from "next/link";

type KnockoutTab = {
  id: string;
  label: string;
  href: string;
};

/**
 * Barra de tabs compartida entre las copas de eliminación directa.
 * Para agregar/quitar tabs o temporadas, modificá el config de la copa:
 * este componente se actualiza automáticamente.
 */
export default function KnockoutCupTabs({
  season,
  onSeasonChange,
  seasons,
  tabs,
  ariaLabel,
}: {
  season: string;
  onSeasonChange: (season: string) => void;
  seasons: readonly string[];
  tabs: readonly KnockoutTab[];
  ariaLabel: string;
}) {
  return (
    <div className="border-b border-[#d7e6f0] bg-white/95">
      <div className="mx-auto flex w-full max-w-[1480px] items-end justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <nav
          className="flex min-w-0 items-end gap-6 overflow-x-auto sm:gap-7"
          aria-label={ariaLabel}
        >
          {tabs.map((tab) => {
            const active = tab.label === "Cuadro";
            return (
              <Link
                key={`${tab.id}-${tab.label}`}
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

        <label className="relative mb-2.5 hidden shrink-0 sm:block">
          <select
            value={season}
            onChange={(event) => onSeasonChange(event.target.value)}
            style={{ backgroundColor: "#eaf6fd", color: "#102f55", borderColor: "#d3e7f2" }}
            className="h-11 min-w-[160px] cursor-pointer appearance-none rounded-[8px] border px-3.5 pr-9 text-[18px] font-bold outline-none transition hover:border-[#56afe2] focus:border-[#56afe2]"
          >
            {seasons.map((item) => (
              <option key={item} value={item} style={{ backgroundColor: "#f3fafe", color: "#102f55" }}>
                {item}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#459bd0]">⌄</span>
        </label>
      </div>
    </div>
  );
}
