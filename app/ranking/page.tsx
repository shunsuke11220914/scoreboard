"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RankingRow = {
  id: string;
  name: string;
  total_score: number;
};

type ScoreLog = {
  id: string;
  user_id: string;
  delta: number;
  reason: string | null;
  created_at: string;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [logs, setLogs] = useState<ScoreLog[]>([]);

  useEffect(() => {
    const load = async () => {
      // ランキング
      const { data: rankingData } = await supabase
        .from("user_scores")
        .select("*");

      setRanking(rankingData ?? []);

      // 得点履歴
      const { data: logData } = await supabase
        .from("score_logs")
        .select("*")
        .order("created_at", { ascending: false });

      setLogs(logData ?? []);
    };

    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🏆 ランキング</h2>

      <ol>
        {ranking.map((u, i) => (
          <li key={u.id}>
            {i + 1}位：{u.name}（{u.total_score} 点）
          </li>
        ))}
      </ol>

      <hr style={{ margin: "20px 0" }} />

      <h3>📜 得点履歴</h3>

      <ul>
        {logs.map((l) => (
          <li key={l.id}>
            [{new Date(l.created_at).toLocaleString()}]  
            {l.delta > 0 ? "＋" : ""}
            {l.delta} 点  
            {l.reason && `（${l.reason}）`}
          </li>
        ))}
      </ul>
    </div>
  );
}

