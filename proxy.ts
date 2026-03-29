import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getAdminSessionCookieName,
  isValidAdminSession,
  getAdminCredentials,
} from "@/lib/auth/admin-session";

function buildLoginUrl(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("next", nextPath);
  return loginUrl;
}

export async function proxy(request: NextRequest) {
  const credentials = getAdminCredentials();

  if (!credentials) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(getAdminSessionCookieName())?.value;
  const isLoggedIn = await isValidAdminSession(sessionToken);

  if (isLoggedIn) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { message: "未登录或登录已过期，请重新登录。" },
      { status: 401 },
    );
  }

  return NextResponse.redirect(buildLoginUrl(request));
}

export const config = {
  matcher: [
    "/editor/:path*",
    "/api/pages",
    "/api/pages/:path*",
    "/api/site-templates",
    "/api/site/publish",
    "/api/news",
    "/api/news/:path*",
  ],
};
