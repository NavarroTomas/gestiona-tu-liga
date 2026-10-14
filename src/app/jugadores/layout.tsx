import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Jugadores y estadísticas",
  description: "Rankings y estadísticas de jugadores de Gestioná tu Liga: goles, asistencias, MVP y rendimiento.",
  path: "/jugadores",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
