import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Premios APA",
  description: "Premios y reconocimientos de la comunidad y las competiciones de APA PSO Argentina.",
  path: "/entretenimiento/premios",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
