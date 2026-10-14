import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Mercado de pases",
  description: "Fichajes, salidas, préstamos y jugadores libres del mercado de Gestioná tu Liga.",
  path: "/mercado",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
