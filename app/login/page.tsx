"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { PLAYER_A, PLAYER_B, PLAYER_EMAILS, PLAYERS, type PlayerName } from "@/lib/constants";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [player, setPlayer] = useState<PlayerName>(PLAYER_A);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function pickPlayer(name: typeof PLAYER_A | typeof PLAYER_B) {
    setPlayer(name);
  }

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const email = PLAYER_EMAILS[player];

    if (!email) {
      setLoading(false);
      setError("这个用户名还没有配置登录账号。");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (signInError) {
      setError("登录失败，请检查账号和密码。");
      return;
    }

    const { data: allowed } = await supabase
      .from("allowed_users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (!allowed) {
      await supabase.auth.signOut();
      setError("这个账号没有使用权限。");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-chalk px-4 py-8 text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <p className="text-sm font-medium text-felt">陈振明 vs 何烈</p>
        <h1 className="mt-2 text-4xl font-black leading-tight">台球战绩记录</h1>
        <p className="mt-3 text-base text-ink/65">球局结束后快速记一轮，数据同步保存在 Supabase。</p>

        <form onSubmit={login} className="mt-8 space-y-4 rounded-lg bg-white p-4 shadow-soft">
          <div className="grid grid-cols-2 gap-2">
            {PLAYERS.map((name) => (
              <button
                type="button"
                key={name}
                onClick={() => pickPlayer(name)}
                className={`h-12 rounded-lg border text-base font-bold ${
                  player === name ? "border-felt bg-felt text-white" : "border-black/10 bg-white"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink/70">密码</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="input"
              placeholder="输入密码"
            />
          </label>

          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-ink text-lg font-bold text-white disabled:opacity-60"
          >
            <LogIn size={21} />
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </main>
  );
}
