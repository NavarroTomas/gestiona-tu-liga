import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import PlayerProfileLayoutClient from "./PlayerProfileLayoutClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ playerId: string }>;
}): Promise<Metadata> {
  const { playerId } = await params;
  const id = decodeURIComponent(playerId);

  return createPageMetadata({
    title: `Jugador ${id}`,
    description: `Perfil y estadísticas del jugador ${id} en Gestioná tu Liga.`,
    path: `/jugadores/${encodeURIComponent(id)}`,
  });
}

export default function PlayerProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PlayerProfileLayoutClient>{children}</PlayerProfileLayoutClient>;
}
