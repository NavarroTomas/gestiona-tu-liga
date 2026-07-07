import type { Metadata } from "next";
import "./globals.css";
import "./theme-worldcup-mural.css";
import Navbar from "../components/Navbar";
import BienvenidaAPA from "../components/BienvenidaAPA";
import IntroAPA from "../components/IntroAPA";
import { Orbitron } from "next/font/google";


const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "APA PSO Argentina",
  description: "Liga APA PSO Argentina",
   icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
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
    <html lang="es">
      <body className={`${orbitron.className} text-white overflow-x-hidden`}>
        <IntroAPA />
        <BienvenidaAPA />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
