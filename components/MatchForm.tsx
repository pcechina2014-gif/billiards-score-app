"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { PLAYER_A, PLAYER_B, PLAYERS } from "@/lib/constants";
import type { MatchInput } from "@/lib/types";

type Props = {
  initialValue: MatchInput;
  submitText?: string;
  onSubmit: (value: MatchInput) => Promise<void>;
};

export function MatchForm({ initialValue, submitText = "保存记录", onSubmit }: Props) {
  const [form, setForm] = useState<MatchInput>(initialValue);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof MatchInput>(key: K, value: MatchInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="日期">
          <input
            type="date"
            value={form.date}
            onChange={(event) => update("date", event.target.value)}
            required
            className="input"
          />
        </Field>
        <Field label="轮次">
          <input
            type="number"
            min="1"
            value={form.round_no}
            onChange={(event) => update("round_no", Number(event.target.value))}
            required
            className="input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={`${PLAYER_A} 得分`}>
          <input
            type="number"
            min="0"
            value={form.player_a_score}
            onChange={(event) => update("player_a_score", Number(event.target.value))}
            required
            className="input text-center text-2xl font-bold"
          />
        </Field>
        <Field label={`${PLAYER_B} 得分`}>
          <input
            type="number"
            min="0"
            value={form.player_b_score}
            onChange={(event) => update("player_b_score", Number(event.target.value))}
            required
            className="input text-center text-2xl font-bold"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="台费">
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.table_fee}
            onChange={(event) => update("table_fee", Number(event.target.value))}
            className="input"
          />
        </Field>
        <Field label="支付人">
          <select
            value={form.payer}
            onChange={(event) => update("payer", event.target.value)}
            className="input"
          >
            {PLAYERS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="备注">
        <textarea
          value={form.note}
          onChange={(event) => update("note", event.target.value)}
          rows={3}
          className="input resize-none"
          placeholder="例如：晚饭后，9球，状态不错"
        />
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-felt text-lg font-bold text-white shadow-soft disabled:opacity-60"
      >
        <Save size={21} />
        {saving ? "保存中..." : submitText}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/70">{label}</span>
      {children}
    </label>
  );
}
