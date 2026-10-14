import HomeLeaguePortal from "@/components/home/HomeLeaguePortal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Tu liga",
  description:
    "Partidos, noticias, equipos y estadísticas de tu liga.",
  path: "/liga",
});

export default function HomePage() {
  return <HomeLeaguePortal />;
}
