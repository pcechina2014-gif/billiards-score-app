"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [roundFrom, setRoundFrom] = useState("");
  const [roundTo, setRoundTo] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("matches").select("*").order("round_no", { ascending: true });
      setRecords((data ?? []) as MatchRecord[]);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const sortedRecords = useMemo(() => [...records].sort((a, b) => a.round_no - b.round_no), [records]);
  const roundMin = sortedRecords[0]?.round_no ?? 1;
  const roundMax = sortedRecords[sortedRecords.length - 1]?.round_no ?? 1;
  const filteredRecords = useMemo(() => {
    const from = roundFrom ? Number(roundFrom) : -Infinity;
    const to = roundTo ? Number(roundTo) : Infinity;
    const start = Math.min(from, to);
    const end = Math.max(from, to);

    return sortedRecords.filter((item) => item.round_no >= start && item.round_no <= end);
  }, [roundFrom, roundTo, sortedRecords]);

  const stats = computeStats(filteredRecords);
  const groups = groupByTenRounds(filteredRecords);
  const last10 = recentLeader(filteredRecords, 10);
  const last30 = recentLeader(filteredRecords, 30);
  const streak = longestStreak(filteredRecords);
  const maxDiff = maxScoreDiff(filteredRecords);
  const rangeLabel = roundFrom || roundTo ? `第 ${roundFrom || roundMin}-${roundTo || roundMax} 轮` : "全部轮次";

  function applyRecent(count: number) {
    const recent = sortedRecords.slice(-count);
    setRoundFrom(String(recent[0]?.round_no ?? ""));
    setRoundTo(String(recent[recent.length - 1]?.round_no ?? ""));
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-ink/55">自动汇总</p>
        <h2 className="text-2xl font-black">统计分析</h2>
      </div>

      <section className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black">轮次筛选</h3>
            <p className="mt-1 text-sm text-ink/55">{rangeLabel}，共 {filteredRecords.length} 轮</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRoundFrom("");
              setRoundTo("");
            }}
            className="rounded-lg bg-ink/10 px-3 py-2 text-sm font-bold"
          >
            全部
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => applyRecent(10)} className="rounded-lg bg-felt px-3 py-2 text-sm font-bold text-white">
            最近 10 轮
          </button>
          <button type="button" onClick={() => applyRecent(30)} className="rounded-lg bg-felt px-3 py-2 text-sm font-bold text-white">
            最近 30 轮
          </button>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <input
            aria-label="起始轮次"
            className="input"
            inputMode="numeric"
            min={roundMin}
            max={roundMax}
            placeholder="起始轮次"
            type="number"
            value={roundFrom}
            onChange={(event) => setRoundFrom(event.target.value)}
          />
          <span className="text-sm font-bold text-ink/50">至</span>
          <input
            aria-label="结束轮次"
            className="input"
            inputMode="numeric"
            min={roundMin}
            max={roundMax}
            placeholder="结束轮次"
            type="number"
            value={roundTo}
            onChange={(event) => setRoundTo(event.target.value)}
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label={`${PLAYER_A} 总胜局`} value={stats.aWins} sub={`胜率 ${stats.aWinRate}%`} />
        <StatCard label={`${PLAYER_B} 总胜局`} value={stats.bWins} sub={`胜率 ${stats.bWinRate}%`} />
        <StatCard label="总轮数" value={stats.totalRounds} />
        <StatCard label="总台费" value={money(stats.totalFee)} />
        <StatCard label={`${PLAYER_A} 支付`} value={money(stats.aPaid)} />
        <StatCard label={`${PLAYER_B} 支付`} value={money(stats.bPaid)} />
      </section>

      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="text-lg font-black">分析图</h3>
        <div className="mt-4 grid gap-4">
          <WinDiffChart records={filteredRecords} />
          <TenRoundBarChart groups={groups} />
        </div>
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

function WinDiffChart({ records }: { records: MatchRecord[] }) {
  if (records.length === 0) return <EmptyChart title="累计胜局差" />;

  let diff = 0;
  const points = records.map((record) => {
    if (record.winner === PLAYER_A) diff += 1;
    if (record.winner === PLAYER_B) diff -= 1;
    return { round: record.round_no, diff };
  });
  const minDiff = Math.min(0, ...points.map((point) => point.diff));
  const maxDiff = Math.max(0, ...points.map((point) => point.diff));
  const width = 320;
  const height = 160;
  const pad = 24;
  const rangeX = Math.max(points.length - 1, 1);
  const rangeY = Math.max(maxDiff - minDiff, 1);
  const zeroY = height - pad - ((0 - minDiff) / rangeY) * (height - pad * 2);
  const line = points
    .map((point, index) => {
      const x = pad + (index / rangeX) * (width - pad * 2);
      const y = height - pad - ((point.diff - minDiff) / rangeY) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const current = points[points.length - 1]?.diff ?? 0;
  const leader = current === 0 ? "平局" : current > 0 ? PLAYER_A : PLAYER_B;

  return (
    <div>
      <ChartHeader title="累计胜局差" value={`${leader} ${Math.abs(current)} 局`} />
      <svg className="mt-2 h-40 w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="累计胜局差趋势图">
        <line x1={pad} x2={width - pad} y1={zeroY} y2={zeroY} stroke="#d8d0c0" strokeWidth="1" />
        <polyline fill="none" points={line} stroke="#28725d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        {points.map((point, index) => {
          const x = pad + (index / rangeX) * (width - pad * 2);
          const y = height - pad - ((point.diff - minDiff) / rangeY) * (height - pad * 2);
          return <circle key={point.round} cx={x} cy={y} fill="#18201d" r={index === points.length - 1 ? 4 : 2.5} />;
        })}
        <text fill="#6e766f" fontSize="11" x={pad} y={height - 6}>第 {points[0]?.round} 轮</text>
        <text fill="#6e766f" fontSize="11" textAnchor="end" x={width - pad} y={height - 6}>第 {points[points.length - 1]?.round} 轮</text>
      </svg>
    </div>
  );
}

function TenRoundBarChart({ groups }: { groups: ReturnType<typeof groupByTenRounds> }) {
  if (groups.length === 0) return <EmptyChart title="每 10 轮胜负" />;

  const maxWins = Math.max(1, ...groups.flatMap((group) => [group.stats.aWins, group.stats.bWins]));

  return (
    <div>
      <ChartHeader title="每 10 轮胜负" value={`${PLAYER_A} / ${PLAYER_B}`} />
      <div className="mt-3 grid gap-3">
        {groups.map((group) => (
          <div key={group.label} className="grid gap-1">
            <div className="flex items-center justify-between text-xs text-ink/55">
              <span>{group.label}</span>
              <b className="text-ink">{group.stats.aWins}:{group.stats.bWins}</b>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="h-3 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-felt" style={{ width: `${(group.stats.aWins / maxWins) * 100}%` }} />
              </div>
              <span className="w-8 text-center text-xs font-bold text-ink/60">vs</span>
              <div className="h-3 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${(group.stats.bWins / maxWins) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartHeader({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h4 className="font-black">{title}</h4>
      <span className="text-sm font-bold text-ink/70">{value}</span>
    </div>
  );
}

function EmptyChart({ title }: { title: string }) {
  return (
    <div>
      <ChartHeader title={title} value="暂无" />
      <div className="mt-2 grid h-32 place-items-center rounded-lg bg-ink/5 text-sm text-ink/50">暂无记录</div>
    </div>
  );
}
