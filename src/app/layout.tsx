import type { Metadata } from "next";
import "./globals.css";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${orbitron.className} bg-black text-white`}>
        <IntroAPA />
        <BienvenidaAPA />
        <Navbar />
        {children}
      </body>
    </html>
  );
}