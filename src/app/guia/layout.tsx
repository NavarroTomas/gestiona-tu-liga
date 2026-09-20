import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Guía APA",
  description: "Guía para conocer el funcionamiento, competiciones y estructura de APA PSO Argentina.",
  path: "/guia",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
