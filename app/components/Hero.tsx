export default function Hero() {
  return (
    <section
      id="about"
      className="min-h-screen flex items-center pt-14"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-24">
        <p
          style={{
            color: "var(--accent)",
            fontFamily: "var(--font-geist-mono)",
          }}
          className="text-sm mb-4"
        >
          Hi, I&apos;m
        </p>
        <h1
          className="text-5xl sm:text-6xl font-bold mb-4 leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Jimi Takaishi
        </h1>
        <h2
          className="text-2xl sm:text-3xl font-semibold mb-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Full-Stack Developer
          <span className="mx-3 opacity-30">/</span>
          <span className="text-xl">フルスタック開発者</span>
        </h2>
        <p
          className="text-lg max-w-2xl mb-10 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Next.js・Supabase・TypeScriptを中心にWebアプリケーションを開発しています。
          教会管理システムや業務自動化ツールの開発実績があります。
          <br />
          <span className="text-sm mt-1 block" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
            Building web apps with Next.js, Supabase & TypeScript. Open to freelance projects.
          </span>
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="#works" className="btn-primary">
            実績を見る
            <span className="text-xs opacity-75">/ View Works</span>
          </a>
          <a
            href="https://github.com/jimiaki7"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
          <a href="#contact" className="btn-secondary">
            お問い合わせ / Contact
          </a>
        </div>

        <div
          className="flex flex-wrap gap-6 mt-16 pt-12"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {[
            { num: "3+", label: "Years Experience", ja: "年の経験" },
            { num: "5+", label: "Projects Delivered", ja: "件の制作物" },
            { num: "2", label: "Tech Stacks", ja: "主要スタック" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                className="text-3xl font-bold"
                style={{ color: "var(--accent)" }}
              >
                {stat.num}
              </div>
              <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {stat.label}
                <span className="mx-1 opacity-40">/</span>
                {stat.ja}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
