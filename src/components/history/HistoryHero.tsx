import { HISTORY_CONFIG, shortSeasonLabel } from "@/config/history";

export default function HistoryHero({
  season,
  seasons,
  onSeasonChange,
}: {
  season: string;
  seasons: string[];
  onSeasonChange: (season: string) => void;
}) {
  const availableSeasons = seasons.length ? seasons : [season];

  return (
    <section className="relative overflow-hidden border-b border-[#17496c] bg-[#062b4a] text-white">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 78% 24%, rgba(86,175,226,.24), transparent 30%), linear-gradient(90deg, #041f36 0%, #062f50 58%, #073b63 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      <div className="relative mx-auto grid min-h-[270px] w-full max-w-[1680px] items-end gap-7 px-5 py-9 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-10">
        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.34em] text-[#76c8f3] sm:text-sm">
            {HISTORY_CONFIG.hero.eyebrow}
          </p>
          <h1 className="max-w-[760px] text-[42px] font-black uppercase leading-[.94] tracking-tight sm:text-6xl lg:text-7xl">
            {HISTORY_CONFIG.hero.title}
          </h1>
          <p className="mt-4 max-w-[700px] text-base font-medium leading-7 text-white/85 sm:text-[17px]">
            {HISTORY_CONFIG.hero.description}
          </p>
        </div>

        <div className="flex max-w-full justify-start gap-1 overflow-x-auto rounded-lg border border-white/15 bg-[#0a385b] p-1.5 lg:justify-self-end">
          {availableSeasons.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSeasonChange(item)}
              aria-pressed={season === item}
              className={`min-w-[74px] rounded-md px-5 py-3.5 text-[13px] font-black transition sm:text-sm ${
                season === item
                  ? "bg-[#2ea4e8] text-white shadow-[0_4px_16px_rgba(46,164,232,.28)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {shortSeasonLabel(item)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
