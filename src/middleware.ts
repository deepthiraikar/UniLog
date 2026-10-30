import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET || "unilog-college-attendance-management-super-secret-key-32chars";

  // Check if secure cookie exists or if request is HTTPS
  const hasSecureAuthjs = req.cookies.has("__Secure-authjs.session-token");
  const hasSecureNextAuth = req.cookies.has("__Secure-next-auth.session-token");
  const isHttps = req.nextUrl.protocol === "https:" || req.headers.get("x-forwarded-proto") === "https" || req.url.startsWith("https:");

  let token = null;

  if (hasSecureAuthjs) {
    token = await getToken({ req, secret, secureCookie: true, cookieName: "__Secure-authjs.session-token" });
  } else if (hasSecureNextAuth) {
    token = await getToken({ req, secret, secureCookie: true, cookieName: "__Secure-next-auth.session-token" });
  } else if (req.cookies.has("authjs.session-token")) {
    token = await getToken({ req, secret, secureCookie: false, cookieName: "authjs.session-token" });
  } else if (req.cookies.has("next-auth.session-token")) {
    token = await getToken({ req, secret, secureCookie: false, cookieName: "next-auth.session-token" });
  } else {
    token = await getToken({ req, secret, secureCookie: isHttps });
    if (!token && isHttps) {
      token = await getToken({ req, secret, secureCookie: false });
    }
  }

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
