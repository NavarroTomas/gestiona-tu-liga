import HomeLeaguePortal from "@/components/home/HomeLeaguePortal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "APA PSO Argentina",
  description:
    "Sitio oficial de APA PSO Argentina: fixture, resultados, estadísticas, clubes, jugadores, competiciones y comunidad de Pro Soccer Online.",
  path: "/",
});

export default function HomePage() {
  return <HomeLeaguePortal />;
}
