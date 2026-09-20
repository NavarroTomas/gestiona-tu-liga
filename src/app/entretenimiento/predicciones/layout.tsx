import { createPageMetadata } from "@/lib/seo";
import PrediccionesLayoutClient from "./PrediccionesLayoutClient";

export const metadata = createPageMetadata({
  title: "Predicciones",
  description:
    "Predicciones de partidos de APA PSO Argentina y participación de la comunidad.",
  path: "/entretenimiento/predicciones",
});

export default function PrediccionesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PrediccionesLayoutClient>{children}</PrediccionesLayoutClient>;
}
