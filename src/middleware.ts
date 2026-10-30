import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || "unilog-college-attendance-management-super-secret-key-32chars",
  });

  const { pathname } = req.nextUrl;

  if (pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/dashboard") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const role = (token.role as string)?.toUpperCase();
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    if (role === "FACULTY") return NextResponse.redirect(new URL("/faculty", req.url));
    if (role === "STUDENT") return NextResponse.redirect(new URL("/student", req.url));
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
    }
    if ((token.role as string)?.toUpperCase() !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/faculty")) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
    }
    if ((token.role as string)?.toUpperCase() !== "FACULTY") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/student")) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
    }
    if ((token.role as string)?.toUpperCase() !== "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/faculty/:path*",
    "/student/:path*",
    "/dashboard",
    "/login",
  ],
};
