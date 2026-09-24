import { NextRequest, NextResponse } from "next/server";

const PUBLIC_BLOCKED = true;

export function proxy(request: NextRequest) {
  if (!PUBLIC_BLOCKED) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  const allowed =
    pathname === "/mantenimiento" ||
    pathname === "/login" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/robots.txt";

  if (allowed) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/mantenimiento";
  url.search = "";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
