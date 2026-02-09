export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Scoreboard</h1>
      <ul>
        <li>
          <a href="/ranking">📊 ランキングを見る</a>
        </li>
        <li>
          <a href="/admin">🛠 管理者ページ</a>
        </li>
      </ul>
    </main>
  );
}

