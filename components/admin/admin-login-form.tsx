"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
} from "@/lib/auth/admin-session";

type AdminLoginFormProps = {
  authEnabled: boolean;
};

export function AdminLoginForm({ authEnabled }: AdminLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(DEFAULT_ADMIN_USERNAME);
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [message, setMessage] = useState(
    authEnabled
      ? "请输入管理员账号密码，默认管理员为 admin / admin123。"
      : "当前环境未启用后台登录保护。",
  );
  const [isPending, startTransition] = useTransition();

  const rawNextPath = searchParams.get("next");
  const nextPath =
    rawNextPath && rawNextPath.startsWith("/") ? rawNextPath : "/editor";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setMessage(payload.message ?? "登录失败，请稍后重试。");
        return;
      }

      setMessage(payload.message ?? "登录成功，正在进入后台。");
      router.push(nextPath);
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Admin Access</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          后台登录
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">{message}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-medium">默认管理员账号</p>
          <p className="mt-1">账号：admin</p>
          <p>密码：admin123</p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">用户名</span>
          <input
            autoComplete="username"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
            disabled={!authEnabled || isPending}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="请输入管理员用户名"
            value={username}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">密码</span>
          <input
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
            disabled={!authEnabled || isPending}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入管理员密码"
            type="password"
            value={password}
          />
        </label>

        <button
          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!authEnabled || isPending}
          type="submit"
        >
          {isPending ? "登录中..." : "进入管理后台"}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <Link className="transition hover:text-slate-900" href="/">
          返回官网首页
        </Link>
        <span>{authEnabled ? "已启用后台保护" : "当前可直接访问后台"}</span>
      </div>
    </div>
  );
}
