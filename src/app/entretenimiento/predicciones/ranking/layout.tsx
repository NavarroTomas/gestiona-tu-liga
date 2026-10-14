import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Ranking de predicciones",
  description: "Ranking de usuarios y resultados del sistema de predicciones de Gestioná tu Liga.",
  path: "/entretenimiento/predicciones/ranking",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
