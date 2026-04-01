"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminLogoutButtonProps = {
  className?: string;
};

export function AdminLogoutButton({ className }: AdminLogoutButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setMessage(payload.message ?? "退出登录失败，请稍后重试。");
        return;
      }

      setMessage(payload.message ?? "已退出登录。");
      router.push("/admin/login");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        className={
          className ??
          "rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
        }
        disabled={isPending}
        onClick={handleLogout}
        type="button"
      >
        {isPending ? "退出中..." : "退出登录"}
      </button>
      {message ? <p className="text-xs text-[var(--muted-foreground)]">{message}</p> : null}
    </div>
  );
}
