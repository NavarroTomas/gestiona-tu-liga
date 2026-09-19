import TeamLink from "@/components/team/TeamLink";

export default function ClubIdentity({
  name,
  slug,
  logo,
  temporada,
  className = "",
  compact = false,
  inverse = false,
}: {
  name: string;
  slug?: string | null;
  logo?: string | null;
  temporada?: string | null;
  className?: string;
  compact?: boolean;
  inverse?: boolean;
}) {
  const initials = String(name || "CL")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const crestSize = compact ? "h-8 w-8" : "h-11 w-11";

  return (
    <TeamLink
      name={name}
      slug={slug}
      temporada={temporada}
      className={`group inline-flex min-w-0 items-center gap-3 ${inverse ? "text-white" : "text-[#102f55]"} ${className}`}
    >
      <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#e9f4fa] ${crestSize}`}>
        {logo ? (
          <img src={logo} alt="" loading="lazy" className="h-full w-full object-contain p-0.5 transition-transform duration-200 group-hover:scale-[1.04]" />
        ) : (
          <span className="text-[9px] font-black text-[#6b8aa2]">{initials}</span>
        )}
      </span>
      <span className={`${compact ? "text-[13px]" : "text-[15px] sm:text-base"} truncate font-black`}>
        {name}
      </span>
    </TeamLink>
  );
}
