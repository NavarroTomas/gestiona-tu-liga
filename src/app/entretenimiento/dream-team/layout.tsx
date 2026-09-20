import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";
import "./dream-team-redesign.css";

export const metadata = createPageMetadata({
  title: "Dream Team",
  description:
    "Elegí y consultá el Dream Team de APA PSO Argentina por temporada y competición.",
  path: "/entretenimiento/dream-team",
});

export default function DreamTeamLayout({ children }: { children: ReactNode }) {
  return <div className="dream-team-redesign">{children}</div>;
}
