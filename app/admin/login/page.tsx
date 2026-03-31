import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import {
  getAdminSessionCookieName,
  isValidAdminSession,
} from "@/lib/auth/admin-session";

type AdminLoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") ? params.next : "/editor";
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getAdminSessionCookieName())?.value;
  const hasValidSession = await isValidAdminSession(sessionToken);

  if (hasValidSession) {
    redirect(nextPath);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#e8eefb_0%,#f8fafc_45%,#eef2f7_100%)] px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(79,70,229,0.06),transparent_35%,rgba(15,23,42,0.04)_100%)]" />
      <div className="relative flex w-full max-w-5xl items-center justify-between gap-12">
        <div className="hidden max-w-xl lg:block">
          <p className="text-sm font-medium tracking-[0.22em] text-slate-500">
            PAGEFORGE ADMIN
          </p>
          <h2 className="mt-6 text-5xl font-semibold leading-tight tracking-tight text-slate-950">
            简单一点，
            <br />
            再进入后台。
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-600">
            公开访问默认进入已发布官网首页，管理人员通过登录页进入页面编辑、模板替换、新闻中心与整站发布流程。
          </p>
          <div className="mt-6 inline-flex rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 shadow-sm">
            默认管理员账号：admin　密码：admin123
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-2 gap-4">
            {[
              "独立页面管理",
              "模块拖拽编辑",
              "新闻中心维护",
              "站点统一发布",
            ].map((item) => (
              <div
                className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <AdminLoginForm authEnabled />
      </div>
    </main>
  );
}
