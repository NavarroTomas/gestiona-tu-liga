import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Fixture oficial",
  description: "Calendario, fechas, horarios y resultados oficiales de las competiciones de APA PSO Argentina.",
  path: "/fixture",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
