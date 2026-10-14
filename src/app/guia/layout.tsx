import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Guía Liga",
  description: "Guía para conocer el funcionamiento, competiciones y estructura de Gestioná tu Liga.",
  path: "/guia",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
