"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client（フロント用）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Participant = {
  id: string;
  name: string;
};

export default function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState("");

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
  }, []);

  /* =========================
     得点追加（INSERT）
  ========================= */
  const addScore = async () => {
    if (!selectedUserId) {
      alert("ユーザーを選択してください");
      return;
    }

    if (delta === 0) {
      alert("0以外の点数を入力してください");
      return;
    }

    // ログ確認用
    console.log("insert payload", {
      user_id: selectedUserId,
      delta,
      reason: reason || null,
    });

    const { data, error } = await supabase
      .from("score_logs")
      .insert({
        user_id: selectedUserId,
        delta: Number(delta),
        reason: reason || null,
      })
      .select(); // ← これ重要（失敗時の切り分けが楽）

    if (error) {
      console.error("score insert error:", error);
      alert("得点追加失敗");
      return;
    }

    console.log("insert success:", data);

    alert("得点追加成功！");
    setDelta(0);
    setReason("");
  };

  /* =========================
     UI
  ========================= */
  return (
    <div style={{ padding: 20 }}>
      <h2>🛠 管理者：ユーザー選択</h2>

      {/* ユーザー選択 */}
      <select
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

      {selectedUserId && (
        <p style={{ marginTop: 8 }}>
          選択中ID: {selectedUserId}
        </p>
      )}

      <hr style={{ margin: "20px 0" }} />

      {/* 得点入力 */}
      <h3>➕ 得点追加</h3>

      <div style={{ marginBottom: 8 }}>
        <input
          type="number"
          value={delta}
          onChange={(e) => setDelta(Number(e.target.value))}
          placeholder="点数（例: 10 / -5）"
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="理由（任意）"
        />
      </div>

      <button onClick={addScore}>
        得点を反映
      </button>
    </div>
  );
}

