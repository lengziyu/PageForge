import { NextResponse } from "next/server";
import { getAdminSessionCookieName } from "@/lib/auth/admin-session";

export async function POST() {
  const response = NextResponse.json({ message: "已退出登录。" });

  response.cookies.set({
    name: getAdminSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
