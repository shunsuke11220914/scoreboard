"use client";

import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase/client";

type User = {
  id: string;
  name: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name");

      if (error) {
        console.error(error);
        setError(error.message);
        setLoading(false);
        return;
      }

      setUsers(data ?? []);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main style={{ padding: 24 }}>
      <h1>ユーザー一覧</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </main>
  );
}

