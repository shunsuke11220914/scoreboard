"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* =========================
   Supabase client
========================= */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* =========================
   Types
========================= */
type Participant = {
  id: string;
  name: string;
};

type ScoreLog = {
  id: string;
  delta: number;
  reason: string | null;
  created_at: string;
  user: { name: string };
};

/* =========================
   Component
========================= */
export default function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // 符号（+1 or -1）
  const [sign, setSign] = useState<1 | -1>(1);

  // 数値（空を許可）
  const [amount, setAmount] = useState<number | "">("");

  const [reason, setReason] = useState<string>("");

  const [recentLogs, setRecentLogs] = useState<ScoreLog[]>([]);

  /* =========================
     participants 読み込み
  ========================= */
  useEffect(() => {
    const loadParticipants = async () => {
      const { data, error } = await supabase
        .from("participants")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("participants fetch error:", error);
        return;
      }

      setParticipants(data ?? []);
    };

    loadParticipants();
    loadRecentLogs();
  }, []);

  /* =========================
     直前履歴 読み込み
  ========================= */
  const loadRecentLogs = async () => {
    const { data, error } = await supabase
      .from("score_logs")
      .select(
        `
        id,
        delta,
        reason,
        created_at,
        participants ( name )
      `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("recent logs error:", error);
      return;
    }

    setRecentLogs(
      (data ?? []).map((d: any) => ({
        ...d,
        user: d.participants,
      }))
    );
  };

  /* =========================
     得点追加
  ========================= */
  const addScore = async () => {
    if (!selectedUserId) {
      alert("ユーザーを選択してください");
      return;
    }

    if (amount === "" || amount <= 0) {
      alert("点数を入力してください");
      return;
    }

    const delta = sign * amount;

    const { error } = await supabase.from("score_logs").insert({
      user_id: selectedUserId,
      delta,
      reason: reason || null,
    });

    if (error) {
      console.error("score insert error:", error);
      alert("得点追加失敗");
      return;
    }

    // リセット
    setAmount("");
    setReason("");

    await loadRecentLogs();

    alert("得点追加成功！");
  };

  /* =========================
     UI
  ========================= */
  return (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <h2>🛠 管理者：ユーザー選択</h2>

      {/* ユーザー選択 */}
      <select
        style={{ width: "100%", marginBottom: 10 }}
        value={selectedUserId}
        onChange={(e) => setSelectedUserId(e.target.value)}
      >
        <option value="">ユーザーを選択</option>
        {participants.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <hr />

      <h3>＋ / − 得点追加</h3>

      {/* + / - ボタン */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button
          style={{
            flex: 1,
            background: sign === 1 ? "#22c55e" : "#333",
            color: "#fff",
            fontSize: 18,
          }}
          onClick={() => setSign(1)}
        >
          ＋
        </button>
        <button
          style={{
            flex: 1,
            background: sign === -1 ? "#ef4444" : "#333",
            color: "#fff",
            fontSize: 18,
          }}
          onClick={() => setSign(-1)}
        >
          −
        </button>
      </div>

      {/* 数値入力 */}
      <input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="例：100 / 1000 / 10000"
        style={{ width: "100%", fontSize: 16, marginBottom: 6 }}
        value={amount}
        onChange={(e) => {
          const v = e.target.value;
          setAmount(v === "" ? "" : Number(v));
        }}
      />

      {/* 反映値表示 */}
      <div style={{ fontSize: 14, color: "#aaa", marginBottom: 10 }}>
        反映値：
        <strong style={{ marginLeft: 4 }}>
          {amount === ""
            ? "-"
            : `${sign === 1 ? "+" : "-"}${amount} 両`}
        </strong>
      </div>

      {/* 理由 */}
      <input
        type="text"
        placeholder="理由（任意）"
        style={{ width: "100%", marginBottom: 10 }}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <button
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          background: "#444",
          color: "#fff",
        }}
        onClick={addScore}
      >
        得点を反映
      </button>

      <hr style={{ margin: "20px 0" }} />

      {/* 直前履歴 */}
      <h4>🧾 直前の得点履歴</h4>
      <ul style={{ fontSize: 14, color: "#ccc", paddingLeft: 16 }}>
        {recentLogs.map((log) => (
          <li key={log.id}>
            {log.user.name}　
            <strong>
              {log.delta > 0 ? "+" : ""}
              {log.delta} 両
            </strong>
            {log.reason && `（${log.reason}）`}
          </li>
        ))}
      </ul>
    </div>
  );
}

