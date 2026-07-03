const capabilities = [
  {
    category: "Product Design",
    label: "プロダクト設計",
    description: "生活・仕事の面倒な手順を、迷わず使える小さな道具に落とし込みます。",
    items: [
      "URLを入れるだけで始まる低摩擦UX",
      "MVPの範囲決めとロードマップ設計",
      "収益化・送客・Pro導線の仮説づくり",
      "信頼性とコンプライアンスの境界設計",
    ],
  },
  {
    category: "Engineering",
    label: "実装",
    description: "Next.js・Supabase・TypeScriptを中心に、公開後に育てられるWebアプリを作ります。",
    items: [
      "Next.js App Router / React / TypeScript",
      "Supabase Auth・Postgres・管理画面",
      "AI structured outputs / レポート生成",
      "Vercel deployment / analytics / SEO基礎",
    ],
  },
  {
    category: "Operations",
    label: "検証と運用",
    description: "作って終わりではなく、使われ方・問い合わせ・収益の兆しを見ながら改善します。",
    items: [
      "SEO-firstの公開ページと計測設計",
      "小さな有料実験と人力レビュー導線",
      "支援制度・中小企業・教会領域の文脈理解",
      "Codex / Claude Code を使った高速な反復開発",
    ],
  },
];

export default function Skills() {
  return (
    <section
      id="skills"
      className="py-24"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="section-title">Capabilities</h2>
        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
          Aster Works の作り方
        </p>
        <div className="accent-line" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((group) => (
            <div key={group.category} className="card p-6">
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: "var(--accent)" }}
              >
                {group.category}
              </h3>
              <p
                className="text-lg font-semibold mt-2 mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                {group.label}
              </p>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "var(--text-secondary)" }}
              >
                {group.description}
              </p>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span style={{ color: "var(--accent)" }}>•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
