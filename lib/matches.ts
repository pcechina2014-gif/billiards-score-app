import { PLAYER_A, PLAYER_B, getWeekday } from "@/lib/constants";
import type { MatchInput, MatchRecord } from "@/lib/types";

export function enrichMatch(input: MatchInput) {
  const aScore = Number(input.player_a_score);
  const bScore = Number(input.player_b_score);
  const diff = Math.abs(aScore - bScore);
  const winner = aScore === bScore ? "平局" : aScore > bScore ? PLAYER_A : PLAYER_B;

  return {
    date: input.date,
    weekday: getWeekday(input.date),
    round_no: Number(input.round_no),
    player_a_name: PLAYER_A,
    player_b_name: PLAYER_B,
    player_a_score: aScore,
    player_b_score: bScore,
    winner,
    score_diff: diff,
    table_fee: Number(input.table_fee || 0),
    payer: input.payer,
    note: input.note?.trim() || null
  };
}

export function createEmptyInput(date: string, roundNo: number): MatchInput {
  return {
    date,
    round_no: roundNo,
    player_a_score: 0,
    player_b_score: 0,
    table_fee: 0,
    payer: PLAYER_A,
    note: ""
  };
}

export function computeStats(records: MatchRecord[]) {
  const totalRounds = records.length;
  const aWins = records.filter((item) => item.winner === PLAYER_A).length;
  const bWins = records.filter((item) => item.winner === PLAYER_B).length;
  const totalFee = records.reduce((sum, item) => sum + Number(item.table_fee || 0), 0);
  const aPaid = records
    .filter((item) => item.payer === PLAYER_A)
    .reduce((sum, item) => sum + Number(item.table_fee || 0), 0);
  const bPaid = records
    .filter((item) => item.payer === PLAYER_B)
    .reduce((sum, item) => sum + Number(item.table_fee || 0), 0);
  const aScore = records.reduce((sum, item) => sum + Number(item.player_a_score || 0), 0);
  const bScore = records.reduce((sum, item) => sum + Number(item.player_b_score || 0), 0);

  return {
    totalRounds,
    aWins,
    bWins,
    totalFee,
    aPaid,
    bPaid,
    aScore,
    bScore,
    aWinRate: totalRounds ? Math.round((aWins / totalRounds) * 100) : 0,
    bWinRate: totalRounds ? Math.round((bWins / totalRounds) * 100) : 0
  };
}

export function groupByTenRounds(records: MatchRecord[]) {
  const sorted = [...records].sort((a, b) => a.round_no - b.round_no);
  const map = new Map<number, MatchRecord[]>();

  sorted.forEach((record) => {
    const groupStart = Math.floor((record.round_no - 1) / 10) * 10 + 1;
    map.set(groupStart, [...(map.get(groupStart) ?? []), record]);
  });

  return Array.from(map.entries()).map(([start, items]) => {
    const stats = computeStats(items);
    const scoreDiff = Math.abs(stats.aScore - stats.bScore);
    const leader = stats.aScore === stats.bScore ? "平局" : stats.aScore > stats.bScore ? PLAYER_A : PLAYER_B;
    const roundScore = `${PLAYER_A} ${stats.aWins}:${stats.bWins} ${PLAYER_B}`;
    return {
      label: `第 ${start}-${start + 9} 轮`,
      items,
      stats,
      leader,
      roundScore,
      scoreDiff
    };
  });
}

export function recentLeader(records: MatchRecord[], count: number) {
  const recent = [...records].sort((a, b) => b.round_no - a.round_no).slice(0, count);
  const stats = computeStats(recent);
  const leader = stats.aScore === stats.bScore ? "平局" : stats.aScore > stats.bScore ? PLAYER_A : PLAYER_B;
  return { leader, stats };
}

export function longestStreak(records: MatchRecord[]) {
  const sorted = [...records].sort((a, b) => a.round_no - b.round_no);
  let best = { player: "暂无", count: 0 };
  let current = { player: "", count: 0 };

  sorted.forEach((record) => {
    if (record.winner === "平局") {
      current = { player: "", count: 0 };
      return;
    }
    if (record.winner === current.player) {
      current.count += 1;
    } else {
      current = { player: record.winner, count: 1 };
    }
    if (current.count > best.count) best = { ...current };
  });

  return best;
}

export function maxScoreDiff(records: MatchRecord[]) {
  return records.reduce<MatchRecord | null>((best, item) => {
    if (!best || item.score_diff > best.score_diff) return item;
    return best;
  }, null);
}

export function money(value: number) {
  return `¥${Number(value || 0).toFixed(2)}`;
}
