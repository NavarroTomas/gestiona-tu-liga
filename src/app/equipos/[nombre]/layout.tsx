import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import ClubProfileLayoutClient from "./ClubProfileLayoutClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nombre: string }>;
}): Promise<Metadata> {
  const { nombre } = await params;
  const club = decodeURIComponent(nombre);

  return createPageMetadata({
    title: club,
    description: `Plantel, estadísticas, resultados e historial de ${club} en APA PSO Argentina.`,
    path: `/equipos/${encodeURIComponent(club)}`,
  });
}

export default function ClubProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClubProfileLayoutClient>{children}</ClubProfileLayoutClient>;
}
