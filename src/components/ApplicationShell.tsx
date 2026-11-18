"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
const LegacyLeagueShell = dynamic(() => import("./LegacyLeagueShell"), { ssr: false });
export default function ApplicationShell({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/login" || pathname === "/registro" || pathname === "/crear-liga" || pathname === "/recuperar" || pathname === "/demo" || pathname.startsWith("/mis-ligas") || pathname.startsWith("/panel/") || pathname.startsWith("/l/")) return <div data-platform-shell>{children}</div>;
  return <LegacyLeagueShell>{children}</LegacyLeagueShell>;
}
