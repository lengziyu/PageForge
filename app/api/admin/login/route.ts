import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdminSessionToken,
  getAdminCredentials,
  getAdminSessionCookieName,
} from "@/lib/auth/admin-session";

const adminLoginSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

export async function POST(request: Request) {
  const credentials = getAdminCredentials();

  if (!credentials) {
    return NextResponse.json(
      { message: "当前环境未启用后台登录保护，可直接访问后台。" },
      { status: 400 },
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "登录信息不完整。" },
      { status: 400 },
    );
  }

  if (
    parsed.data.username !== credentials.username ||
    parsed.data.password !== credentials.password
  ) {
    return NextResponse.json(
      { message: "用户名或密码错误。" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ message: "登录成功。" });
  const sessionToken = await createAdminSessionToken(
    credentials.username,
    credentials.password,
  );

  response.cookies.set({
    name: getAdminSessionCookieName(),
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
