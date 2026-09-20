"use client";

import { usePathname } from "next/navigation";
import "./predicciones-redesign.css";

export default function PrediccionesLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPrediccionesHome = pathname === "/entretenimiento/predicciones";

  return isPrediccionesHome ? (
    <div className="predicciones-redesign">{children}</div>
  ) : (
    children
  );
}
