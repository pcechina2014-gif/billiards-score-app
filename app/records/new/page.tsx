"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MatchForm } from "@/components/MatchForm";
import { Loading } from "@/components/Loading";
import { createEmptyInput, enrichMatch } from "@/lib/matches";
import { createClient } from "@/lib/supabase-browser";
import { todayText } from "@/lib/constants";
import type { MatchInput } from "@/lib/types";

export default function NewRecordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [initial, setInitial] = useState<MatchInput | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNextRound() {
      const { data } = await supabase
        .from("matches")
        .select("round_no")
        .order("round_no", { ascending: false })
        .limit(1)
        .maybeSingle();
      setInitial(createEmptyInput(todayText(), (data?.round_no ?? 0) + 1));
    }
    loadNextRound();
  }, [supabase]);

  async function save(input: MatchInput) {
    setError("");
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("matches").insert({
      ...enrichMatch(input),
      created_by: user?.id
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/records");
    router.refresh();
  }

  if (!initial) return <Loading />;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-ink/55">快速记录</p>
        <h2 className="text-2xl font-black">新增比赛记录</h2>
      </div>
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <MatchForm initialValue={initial} onSubmit={save} />
    </div>
  );
}
