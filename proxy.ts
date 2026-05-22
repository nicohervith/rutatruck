import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { isEmpresa, isTransportista } from "@/lib/roles";

const PUBLIC_ROUTES = ["/", "/login", "/registro"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  const isProtected =
    pathname.startsWith("/empresa") ||
    pathname.startsWith("/transportista") ||
    pathname.startsWith("/admin");

  const isAuthRoute = pathname === "/login" || pathname === "/registro";

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (pathname.startsWith("/admin") && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (
    pathname.startsWith("/empresa") &&
    !isEmpresa(session?.role ?? "") &&
    session?.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (
    pathname.startsWith("/transportista") &&
    !isTransportista(session?.role ?? "") &&
    session?.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isAuthRoute && session) {
    const role = session.role;
    const dest =
      role === "EMPRESA" || role === "EMPRESA_TRANSPORTISTA"
        ? "/empresa/dashboard"
        : role === "TRANSPORTISTA" || role === "TRANSPORTISTA_FLOTA"
          ? "/transportista/cargas"
          : "/admin/dashboard";
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)"],
};
