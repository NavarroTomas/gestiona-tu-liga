import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Premios Liga",
  description: "Premios y reconocimientos de la comunidad y las competiciones de Gestioná tu Liga.",
  path: "/entretenimiento/premios",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
