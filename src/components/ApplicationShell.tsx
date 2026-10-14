"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
const LegacyLeagueShell = dynamic(() => import("./LegacyLeagueShell"), { ssr: false });
export default function ApplicationShell({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/login" || pathname === "/registro" || pathname.startsWith("/mis-ligas")) return <>{children}</>;
  return <LegacyLeagueShell>{children}</LegacyLeagueShell>;
}
