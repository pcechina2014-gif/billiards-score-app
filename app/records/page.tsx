"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Search, Trash2, X } from "lucide-react";
import { MatchForm } from "@/components/MatchForm";
import { Loading } from "@/components/Loading";
import { PLAYER_A, PLAYER_B, PLAYERS } from "@/lib/constants";
import { enrichMatch, money } from "@/lib/matches";
import { createClient } from "@/lib/supabase-browser";
import type { Filters, MatchInput, MatchRecord } from "@/lib/types";

export default function RecordsPage() {
  const supabase = createClient();
  const [records, setRecords] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MatchRecord | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [error, setError] = useState("");

  async function load(nextFilters = filters) {
    let query = supabase
      .from("matches")
      .select("*")
      .order("date", { ascending: false })
      .order("round_no", { ascending: false });

    if (nextFilters.dateFrom) query = query.gte("date", nextFilters.dateFrom);
    if (nextFilters.dateTo) query = query.lte("date", nextFilters.dateTo);
    if (nextFilters.payer) query = query.eq("payer", nextFilters.payer);
    if (nextFilters.winner) query = query.eq("winner", nextFilters.winner);
    if (nextFilters.roundFrom) query = query.gte("round_no", Number(nextFilters.roundFrom));
    if (nextFilters.roundTo) query = query.lte("round_no", Number(nextFilters.roundTo));

    const { data, error: loadError } = await query;
    if (loadError) setError(loadError.message);
    setRecords((data ?? []) as MatchRecord[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!window.confirm("确定删除这条记录吗？")) return;
    const { error: deleteError } = await supabase.from("matches").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setRecords((current) => current.filter((item) => item.id !== id));
  }

  async function update(input: MatchInput) {
    if (!editing) return;
    const { error: updateError } = await supabase
      .from("matches")
      .update(enrichMatch(input))
      .eq("id", editing.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setEditing(null);
    await load();
  }

  const editInput = useMemo<MatchInput | null>(() => {
    if (!editing) return null;
    return {
      date: editing.date,
      round_no: editing.round_no,
      player_a_score: editing.player_a_score,
      player_b_score: editing.player_b_score,
      table_fee: editing.table_fee,
      payer: editing.payer,
      note: editing.note ?? ""
    };
  }, [editing]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-ink/55">倒序显示</p>
        <h2 className="text-2xl font-black">战绩列表</h2>
      </div>

      <section className="rounded-lg bg-white p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="input" value={filters.dateFrom ?? ""} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
          <input type="date" className="input" value={filters.dateTo ?? ""} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
          <select className="input" value={filters.payer ?? ""} onChange={(e) => setFilters({ ...filters, payer: e.target.value })}>
            <option value="">全部支付人</option>
            {PLAYERS.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select className="input" value={filters.winner ?? ""} onChange={(e) => setFilters({ ...filters, winner: e.target.value })}>
            <option value="">全部胜者</option>
            <option value={PLAYER_A}>{PLAYER_A}</option>
            <option value={PLAYER_B}>{PLAYER_B}</option>
            <option value="平局">平局</option>
          </select>
          <input type="number" placeholder="起始轮次" className="input" value={filters.roundFrom ?? ""} onChange={(e) => setFilters({ ...filters, roundFrom: e.target.value })} />
          <input type="number" placeholder="结束轮次" className="input" value={filters.roundTo ?? ""} onChange={(e) => setFilters({ ...filters, roundTo: e.target.value })} />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button onClick={load} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-felt font-bold text-white">
            <Search size={18} /> 查询
          </button>
          <button onClick={() => { setFilters({}); load({}); }} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-ink/10 font-bold">
            <X size={18} /> 清空
          </button>
        </div>
      </section>

      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {records.length === 0 ? (
        <p className="rounded-lg bg-white p-5 text-center text-ink/55 shadow-sm">暂无记录</p>
      ) : (
        <div className="space-y-3">
          {records.map((item) => (
            <article key={item.id} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-ink/55">
                    {item.date} {item.weekday} · 第 {item.round_no} 轮
                  </p>
                  <p className="mt-1 text-3xl font-black">
                    {item.player_a_score} : {item.player_b_score}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button aria-label="编辑" onClick={() => setEditing(item)} className="grid h-10 w-10 place-items-center rounded-lg bg-ink/10">
                    <Pencil size={18} />
                  </button>
                  <button aria-label="删除" onClick={() => remove(item.id)} className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink/70">
                <p>胜者：<b className="text-ink">{item.winner}</b></p>
                <p>净胜：{item.score_diff}</p>
                <p>台费：{money(item.table_fee)}</p>
                <p>支付：{item.payer}</p>
              </div>
              {item.note ? <p className="mt-3 rounded-lg bg-chalk p-3 text-sm text-ink/65">{item.note}</p> : null}
            </article>
          ))}
        </div>
      )}

      {editing && editInput ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/45 px-4 py-6">
          <div className="mx-auto max-w-md rounded-lg bg-chalk p-4 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black">编辑记录</h3>
              <button aria-label="关闭" onClick={() => setEditing(null)} className="grid h-10 w-10 place-items-center rounded-full bg-white">
                <X size={20} />
              </button>
            </div>
            <MatchForm initialValue={editInput} submitText="保存修改" onSubmit={update} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
