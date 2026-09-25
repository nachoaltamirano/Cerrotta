import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verificarTokenSesion } from "@/lib/auth/token";

// Chequeo rápido para redirigir al login. La verificación que importa se repite en el layout
// de /admin y en cada Server Action (requerirAdmin).
export function proxy(request: NextRequest) {
  const sesion = verificarTokenSesion(request.cookies.get(SESSION_COOKIE)?.value);
  if (sesion) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
