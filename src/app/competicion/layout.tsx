import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Competición",
  description: "Torneos, divisiones, copas, tablas, fixture y estadísticas oficiales de APA PSO Argentina.",
  path: "/competicion",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
