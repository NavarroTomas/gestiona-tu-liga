import type { Metadata } from "next";
import "./globals.css";
import "./theme-worldcup-mural.css";
import APAHeader from "../components/APAHeader";
import BienvenidaAPA from "../components/BienvenidaAPA";
import IntroAPA from "../components/IntroAPA";
import CookieConsent from "../components/CookieConsent";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.psoargentina.com"),
  title: {
    default: "APA PSO Argentina",
    template: "%s | APA PSO Argentina",
  },
  description:
    "Sitio oficial de APA PSO Argentina: fixture, resultados, estadísticas, clubes, jugadores, competiciones y comunidad de Pro Soccer Online.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "APA PSO Argentina",
    title: "APA PSO Argentina",
    description:
      "Fixture, resultados, estadísticas, clubes, jugadores y competiciones de APA PSO Argentina.",
  },
  twitter: {
    card: "summary_large_image",
    title: "APA PSO Argentina",
    description:
      "Fixture, resultados, estadísticas, clubes, jugadores y competiciones de APA PSO Argentina.",
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=5", type: "image/png" },
      { url: "/icon.png?v=5", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.png?v=5",
    apple: "/apple-icon.png?v=5",
  },
  other: {
    "google-adsense-account": "ca-pub-9012377872796123",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR">
      <body className={`${orbitron.className} text-white overflow-x-hidden`}>
        <IntroAPA />
        <BienvenidaAPA />
        <APAHeader />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
