"use client";

import Link from "next/link";
import type { DreamTeamLogosMap, DreamTeamProfilesMap } from "@/lib/dream-team/types";

export function DreamTeamAvatar({
  playerId,
  nombre,
  perfiles,
  size = "md",
}: {
  playerId?: string | null;
  nombre?: string | null;
  perfiles: DreamTeamProfilesMap;
  size?: "sm" | "md";
}) {
  const perfil = playerId ? perfiles[playerId] : null;
  const inicial = String(nombre || "J").slice(0, 1).toUpperCase();
  const sizeClass =
    size === "sm"
      ? "h-9 w-9 sm:h-10 sm:w-10 text-sm"
      : "h-11 w-11 sm:h-14 sm:w-14 text-base sm:text-lg";

  const avatar = (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-yellow-400/25 bg-yellow-400/10 font-black text-yellow-300 ${sizeClass}`}
    >
      {perfil?.avatar_url ? (
        <img
          src={perfil.avatar_url}
          alt={nombre || "Jugador"}
          className="h-full w-full object-cover"
        />
      ) : (
        inicial
      )}
    </div>
  );

  if (perfil?.username) {
    return (
      <Link href={`/u/${perfil.username}`} className="transition hover:scale-105">
        {avatar}
      </Link>
    );
  }

  return avatar;
}

export function DreamTeamPlayerName({
  playerId,
  nombre,
  perfiles,
  className = "",
}: {
  playerId?: string | null;
  nombre?: string | null;
  perfiles: DreamTeamProfilesMap;
  className?: string;
}) {
  const perfil = playerId ? perfiles[playerId] : null;
  const texto = nombre || "Sin nombre";

  if (perfil?.username) {
    return (
      <Link
        href={`/u/${perfil.username}`}
        className={`transition hover:text-yellow-300 ${className}`}
      >
        {texto}
      </Link>
    );
  }

  return <span className={className}>{texto}</span>;
}

export function DreamTeamClubLogo({
  equipo,
  logos,
}: {
  equipo?: string;
  logos: DreamTeamLogosMap;
}) {
  const logo = equipo ? logos[equipo] : "";

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/30 bg-black sm:h-10 sm:w-10">
      {logo ? (
        <img src={logo} alt={equipo} className="h-full w-full object-contain p-1" />
      ) : (
        <span className="text-[10px] font-black text-white">
          {(equipo || "?").slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}
