import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const estaEnAdmin = request.nextUrl.pathname.startsWith("/admin");
  const estaEnLogin = request.nextUrl.pathname === "/admin/login";

  const autorizado = request.cookies.get("apa_admin")?.value === "true";

  if (estaEnAdmin && !estaEnLogin && !autorizado) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};