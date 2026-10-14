import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Clubes",
  description: "Clubes participantes de Gestioná tu Liga, planteles, identidad, resultados e historial.",
  path: "/clubes",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
