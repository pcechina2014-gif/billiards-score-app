"use client";

import { useEffect, useState } from "react";
import { Loading } from "@/components/Loading";
import { StatCard } from "@/components/StatCard";
import { PLAYER_A, PLAYER_B } from "@/lib/constants";
import {
  computeStats,
  groupByTenRounds,
  longestStreak,
  maxScoreDiff,
  money,
  recentLeader
} from "@/lib/matches";
import { createClient } from "@/lib/supabase-browser";
import type { MatchRecord } from "@/lib/types";

export default function StatsPage() {
  const supabase = createClient();
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("matches").select("*").order("round_no", { ascending: true });
      setRecords((data ?? []) as MatchRecord[]);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) return <Loading />;

  const stats = computeStats(records);
  const groups = groupByTenRounds(records);
  const last10 = recentLeader(records, 10);
  const last30 = recentLeader(records, 30);
  const streak = longestStreak(records);
  const maxDiff = maxScoreDiff(records);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-ink/55">自动汇总</p>
        <h2 className="text-2xl font-black">统计分析</h2>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label={`${PLAYER_A} 总胜局`} value={stats.aWins} sub={`胜率 ${stats.aWinRate}%`} />
        <StatCard label={`${PLAYER_B} 总胜局`} value={stats.bWins} sub={`胜率 ${stats.bWinRate}%`} />
        <StatCard label="总轮数" value={stats.totalRounds} />
        <StatCard label="总台费" value={money(stats.totalFee)} />
        <StatCard label={`${PLAYER_A} 支付`} value={money(stats.aPaid)} />
        <StatCard label={`${PLAYER_B} 支付`} value={money(stats.bPaid)} />
      </section>

      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="text-lg font-black">趋势分析</h3>
        <div className="mt-3 grid gap-3 text-sm">
          <Row label="最近 10 轮领先" value={`${last10.leader}（${last10.stats.aScore}:${last10.stats.bScore}）`} />
          <Row label="最近 30 轮领先" value={`${last30.leader}（${last30.stats.aScore}:${last30.stats.bScore}）`} />
          <Row label="总体胜率" value={`${PLAYER_A} ${stats.aWinRate}% / ${PLAYER_B} ${stats.bWinRate}%`} />
          <Row label="最长连胜" value={`${streak.player} ${streak.count} 连胜`} />
          <Row
            label="单次最大分差"
            value={maxDiff ? `第 ${maxDiff.round_no} 轮，${maxDiff.winner} 净胜 ${maxDiff.score_diff}` : "暂无"}
          />
          <Row label="台费支付" value={`${PLAYER_A} ${money(stats.aPaid)} / ${PLAYER_B} ${money(stats.bPaid)}`} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-black">每 10 轮统计</h3>
        {groups.length === 0 ? (
          <p className="rounded-lg bg-white p-5 text-center text-ink/55 shadow-sm">暂无记录</p>
        ) : (
          groups.map((group) => (
            <article key={group.label} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-black">{group.label}</h4>
                  <p className="mt-1 text-sm font-bold text-ink">{group.roundScore}</p>
                  <p className="mt-1 text-sm text-ink/55">共 {group.items.length} 轮</p>
                </div>
                <span className="rounded-full bg-felt px-3 py-1 text-sm font-bold text-white">
                  {group.leader}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink/70">
                <p>{PLAYER_A} 得分：<b className="text-ink">{group.stats.aScore}</b></p>
                <p>{PLAYER_B} 得分：<b className="text-ink">{group.stats.bScore}</b></p>
                <p>净胜局：{group.scoreDiff}</p>
                <p>台费：{money(group.stats.totalFee)}</p>
                <p>{PLAYER_A} 支付：{money(group.stats.aPaid)}</p>
                <p>{PLAYER_B} 支付：{money(group.stats.bPaid)}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-2 last:border-0 last:pb-0">
      <span className="text-ink/55">{label}</span>
      <b className="text-right text-ink">{value}</b>
    </div>
  );
}
