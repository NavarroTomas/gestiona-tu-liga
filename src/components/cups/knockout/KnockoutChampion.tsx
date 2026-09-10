export default function KnockoutChampion({
  champion,
  getLogo,
}: {
  champion: string | null;
  getLogo: (name?: string | null) => string | null;
}) {
  if (!champion) return null;

  const logo = getLogo(champion);

  return (
    <section className="mb-4 overflow-hidden rounded-[12px] border border-[#b9dced] bg-[linear-gradient(90deg,#f8fcff,#e9f6fd,#f8fcff)] px-5 py-4 text-[#102f55]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#56afe2]">Campeón · Copa Argentina</p>
          <h2 className="mt-1 text-[clamp(22px,2.2vw,34px)] font-black uppercase tracking-[-.035em]">{champion}</h2>
        </div>

        {logo ? (
          <img src={logo} alt={champion} className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#dff1fc] text-sm font-black text-[#355d83] sm:h-16 sm:w-16">
            {champion.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
    </section>
  );
}
