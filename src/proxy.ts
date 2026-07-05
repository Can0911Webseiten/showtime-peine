import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

const protectedRoutes = ["/konto", "/owner", "/mitarbeiter"];
const authRoutes = ["/login", "/registrieren"];

function homeForRole(role: string | undefined) {
  if (role === "OWNER") return "/owner";
  if (role === "STAFF") return "/mitarbeiter";
  return "/konto";
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAuthRoute = authRoutes.includes(path);

  const cookie = req.cookies.get("showtime_session")?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.userId) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("next", path + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (path.startsWith("/owner") && session?.role !== "OWNER") {
    return NextResponse.redirect(new URL(homeForRole(session?.role), req.nextUrl));
  }

  if (path.startsWith("/mitarbeiter") && session?.role !== "STAFF") {
    return NextResponse.redirect(new URL(homeForRole(session?.role), req.nextUrl));
  }

  if (path === "/konto" && session?.role && session.role !== "CUSTOMER") {
    return NextResponse.redirect(new URL(homeForRole(session.role), req.nextUrl));
  }

  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL(homeForRole(session.role), req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
