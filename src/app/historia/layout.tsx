import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Historia",
  description: "Historia, campeones, torneos y momentos destacados de Gestioná tu Liga.",
  path: "/historia",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
