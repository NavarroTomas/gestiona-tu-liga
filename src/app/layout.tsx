import type { Metadata } from "next";
import "./globals.css";
import "./theme-worldcup-mural.css";
import APAHeader from "../components/APAHeader";
import BienvenidaAPA from "../components/BienvenidaAPA";
import IntroAPA from "../components/IntroAPA";
import CookieConsent from "../components/CookieConsent";
import {
  Archivo,
  Inter,
  Lora,
  Manrope,
  Montserrat,
  Orbitron,
  Rajdhani,
  Space_Grotesk,
} from "next/font/google";
import {
  DEFAULT_TYPOGRAPHY_THEME,
  TYPOGRAPHY_STORAGE_KEY,
  TYPOGRAPHY_THEMES,
  buildTypographyThemeCss,
} from "@/config/typography";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: false,
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
  preload: false,
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  preload: false,
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-orbitron",
  display: "swap",
  preload: false,
});

const fontVariables = [
  inter.variable,
  manrope.variable,
  spaceGrotesk.variable,
  archivo.variable,
  montserrat.variable,
  rajdhani.variable,
  lora.variable,
  orbitron.variable,
].join(" ");

const allowedTypographyThemes = TYPOGRAPHY_THEMES.map((theme) => theme.id);
const typographyBootstrap = `(() => {
  try {
    const stored = localStorage.getItem(${JSON.stringify(TYPOGRAPHY_STORAGE_KEY)});
    const allowed = ${JSON.stringify(allowedTypographyThemes)};
    document.documentElement.dataset.fontTheme = allowed.includes(stored)
      ? stored
      : ${JSON.stringify(DEFAULT_TYPOGRAPHY_THEME)};
  } catch {
    document.documentElement.dataset.fontTheme = ${JSON.stringify(DEFAULT_TYPOGRAPHY_THEME)};
  }
})();`;

const typographyRuntimeCss = `
:where(html[data-font-theme]) body {
  font-family: var(--apa-font-body);
}

:where(html[data-font-theme]) :where(h1, h2, h3) {
  font-family: var(--apa-font-heading);
  font-weight: var(--apa-heading-weight);
  line-height: var(--apa-heading-line-height);
  letter-spacing: var(--apa-heading-letter-spacing);
  transition: line-height 160ms ease, letter-spacing 160ms ease, opacity 160ms ease;
}

:where(html[data-font-theme]) :where(p, li) {
  font-family: var(--apa-font-body);
  font-weight: var(--apa-body-weight);
  line-height: var(--apa-body-line-height);
  letter-spacing: var(--apa-body-letter-spacing);
  transition: line-height 160ms ease, letter-spacing 160ms ease, opacity 160ms ease;
}

html.apa-font-theme-changing :where(h1, h2, h3, p, li) {
  opacity: 0.985;
}

@media (prefers-reduced-motion: reduce) {
  :where(html[data-font-theme]) :where(h1, h2, h3, p, li) {
    transition: none;
  }
}
`;

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
      data-font-theme={DEFAULT_TYPOGRAPHY_THEME}
      suppressHydrationWarning
    >
      <head>
        <style id="apa-font-themes" dangerouslySetInnerHTML={{ __html: buildTypographyThemeCss() }} />
        <style id="apa-font-runtime" dangerouslySetInnerHTML={{ __html: typographyRuntimeCss }} />
        <script dangerouslySetInnerHTML={{ __html: typographyBootstrap }} />
      </head>
      <body className="text-white overflow-x-hidden">
        <IntroAPA />
        <BienvenidaAPA />
        <APAHeader />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
