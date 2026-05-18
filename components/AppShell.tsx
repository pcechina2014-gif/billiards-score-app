"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Home, ListPlus, LogOut, PlusCircle } from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase-browser";

const navItems = [
  { href: "/dashboard", label: "首页", icon: Home },
  { href: "/records/new", label: "新增", icon: PlusCircle },
  { href: "/records", label: "战绩", icon: ListPlus },
  { href: "/stats", label: "统计", icon: BarChart3 }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const isLogin = pathname === "/login";

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-chalk pb-24 text-ink">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-chalk/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="leading-tight">
            <p className="text-xs text-ink/60">台球对战</p>
            <h1 className="text-lg font-bold">记录 + 统计</h1>
          </Link>
          <button
            aria-label="退出登录"
            onClick={signOut}
            className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"
          >
            <LogOut size={19} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                href={item.href}
                key={item.href}
                className={clsx(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium",
                  active ? "bg-felt text-white" : "text-ink/65"
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
