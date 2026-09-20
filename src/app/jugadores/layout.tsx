import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Jugadores y estadísticas",
  description: "Rankings y estadísticas de jugadores de APA PSO Argentina: goles, asistencias, MVP y rendimiento.",
  path: "/jugadores",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
