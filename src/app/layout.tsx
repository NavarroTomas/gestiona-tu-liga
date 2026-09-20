import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import "./typography-fixed.css";
import "./theme-worldcup-mural.css";
import "./admin-awards-fixes.css";
import APAHeader from "../components/APAHeader";
import APAFooter from "../components/APAFooter";
import BienvenidaAPA from "../components/BienvenidaAPA";
import IntroAPA from "../components/IntroAPA";
import CookieConsent from "../components/CookieConsent";
import SiteEditorRuntime from "../components/site-editor/SiteEditorRuntime";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fontVariables = inter.variable;

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
    <html
      lang="es-AR"
      className={fontVariables}
      data-font-theme="data-first"
      suppressHydrationWarning
    >
      <body className="text-white overflow-x-hidden">
        <IntroAPA />
        <BienvenidaAPA />
        <APAHeader />
        {children}
        <APAFooter />
        <CookieConsent />
        <Suspense fallback={null}>
          <SiteEditorRuntime />
        </Suspense>
      </body>
    </html>
  );
}
