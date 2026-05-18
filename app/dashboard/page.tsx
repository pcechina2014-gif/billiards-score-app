"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, ListPlus, PlusCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Loading } from "@/components/Loading";
import { computeStats, money, recentLeader } from "@/lib/matches";
import { createClient } from "@/lib/supabase-browser";
import type { MatchRecord } from "@/lib/types";

export default function DashboardPage() {
  const supabase = createClient();
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: false })
        .order("round_no", { ascending: false });
      setRecords((data ?? []) as MatchRecord[]);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) return <Loading />;

  const stats = computeStats(records);
  const last10 = recentLeader(records, 10);
  const latest = records[0];

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-felt p-5 text-white shadow-soft">
        <p className="text-sm text-white/75">当前总战绩</p>
        <h2 className="mt-1 text-3xl font-black">
          {stats.aWins} : {stats.bWins}
        </h2>
        <p className="mt-2 text-sm text-white/80">
          共 {stats.totalRounds} 轮，最近 10 轮 {last10.leader} 领先
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="总台费" value={money(stats.totalFee)} />
        <StatCard label="总轮数" value={stats.totalRounds} />
        <StatCard label="陈振明支付" value={money(stats.aPaid)} />
        <StatCard label="何烈支付" value={money(stats.bPaid)} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <QuickLink href="/records/new" label="新增" icon={<PlusCircle size={22} />} />
        <QuickLink href="/records" label="列表" icon={<ListPlus size={22} />} />
        <QuickLink href="/stats" label="统计" icon={<BarChart3 size={22} />} />
      </div>

      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="text-base font-bold">最近一轮</h3>
        {latest ? (
          <div className="mt-3 text-sm text-ink/70">
            <p>
              {latest.date} {latest.weekday}，第 {latest.round_no} 轮
            </p>
            <p className="mt-1 text-2xl font-black text-ink">
              {latest.player_a_score} : {latest.player_b_score}
            </p>
            <p className="mt-1">胜者：{latest.winner}，台费：{money(latest.table_fee)}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink/55">还没有记录，先新增一轮。</p>
        )}
      </section>
    </div>
  );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-20 flex-col items-center justify-center gap-1 rounded-lg bg-white font-bold shadow-sm"
    >
      {icon}
      {label}
    </Link>
  );
}
