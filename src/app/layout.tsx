import type { Metadata } from "next";

import "./globals.css";
import "./typography-fixed.css";
import "./theme-worldcup-mural.css";
import "./admin-awards-fixes.css";
import ApplicationShell from "@/components/ApplicationShell";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fontVariables = inter.variable;

export const metadata: Metadata = {
  title: {
    default: "Gestioná tu Liga",
    template: "%s | Gestioná tu Liga",
  },
  description:
    "Creá y administrá tu liga. Organizá partidos, equipos y estadísticas en un solo lugar.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Gestioná tu Liga",
    title: "Gestioná tu Liga",
    description:
      "Fixture, resultados, estadísticas, clubes, jugadores y competiciones de Gestioná tu Liga.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gestioná tu Liga",
    description:
      "Fixture, resultados, estadísticas, clubes, jugadores y competiciones de Gestioná tu Liga.",
  },

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-AR"
      className={fontVariables}
      data-font-theme="data-first"
      suppressHydrationWarning
    >
      <body className="text-white overflow-x-hidden">
        <ApplicationShell>{children}</ApplicationShell>
      </body>
    </html>
  );
}
