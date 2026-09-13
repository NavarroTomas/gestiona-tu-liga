"use client";

import Link from "next/link";
import type { DreamTeamProfiles } from "@/lib/dream-team/types";

export function DreamTeamPlayerAvatar({
  playerId,
  nombre,
  profiles,
  size = "md",
}: {
  playerId?: string | null;
  nombre?: string | null;
  profiles: DreamTeamProfiles;
  size?: "sm" | "md";
}) {
  const profile = playerId ? profiles[playerId] : null;
  const initial = String(nombre || "J").slice(0, 1).toUpperCase();
  const sizeClass =
    size === "sm"
      ? "h-9 w-9 sm:h-10 sm:w-10 text-sm"
      : "h-11 w-11 sm:h-14 sm:w-14 text-base sm:text-lg";

  const avatar = (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-yellow-400/25 bg-yellow-400/10 font-black text-yellow-300 ${sizeClass}`}
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={nombre || "Jugador"}
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </div>
  );

  if (!profile?.username) return avatar;

  return (
    <Link href={`/u/${profile.username}`} className="transition hover:scale-105">
      {avatar}
    </Link>
  );
}

export function DreamTeamPlayerName({
  playerId,
  nombre,
  profiles,
  className = "",
}: {
  playerId?: string | null;
  nombre?: string | null;
  profiles: DreamTeamProfiles;
  className?: string;
}) {
  const profile = playerId ? profiles[playerId] : null;
  const text = nombre || "Sin nombre";

  if (!profile?.username) return <span className={className}>{text}</span>;

  return (
    <Link
      href={`/u/${profile.username}`}
      className={`transition hover:text-yellow-300 ${className}`}
    >
      {text}
    </Link>
  );
}
