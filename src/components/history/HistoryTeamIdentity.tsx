import TeamLink from "@/components/team/TeamLink";
import type { HistoryClub } from "@/lib/history";

function normalizeTeam(name?: string | null) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function historyClubFor(name: string, clubs: HistoryClub[]) {
  return clubs.find((club) => normalizeTeam(club.nombre) === normalizeTeam(name));
}

export function HistoryTeamLogo({
  name,
  clubs,
  size = "md",
}: {
  name: string;
  clubs: HistoryClub[];
  size?: "sm" | "md" | "lg";
}) {
  const club = historyClubFor(name, clubs);
  const initials = String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const sizeClass =
    size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#e8f4fb] text-[10px] font-black text-[#557a95] ${sizeClass}`}
    >
      {club?.logo_url ? (
        <img
          src={club.logo_url}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain p-0.5"
        />
      ) : (
        initials
      )}
    </span>
  );
}

export function HistoryTeamIdentity({
  name,
  clubs,
  inverse = false,
  compact = false,
}: {
  name: string;
  clubs: HistoryClub[];
  inverse?: boolean;
  compact?: boolean;
}) {
  if (!name || name === "Por definir" || name === "Sin datos") {
    return (
      <span className={`font-semibold ${inverse ? "text-white/55" : "text-[#7890a3]"}`}>
        {name || "Sin datos"}
      </span>
    );
  }

  const club = historyClubFor(name, clubs);

  return (
    <TeamLink
      name={name}
      slug={club?.slug}
      className={`group inline-flex min-w-0 items-center gap-2.5 ${
        inverse ? "text-white" : "text-[#102f55]"
      }`}
    >
      <HistoryTeamLogo name={name} clubs={clubs} size={compact ? "sm" : "md"} />
      <span
        className={`truncate font-black ${
          compact ? "text-[13px] sm:text-sm" : "text-base sm:text-[17px]"
        }`}
      >
        {name}
      </span>
    </TeamLink>
  );
}
