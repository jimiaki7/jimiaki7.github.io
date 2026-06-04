const projects = [
  {
    name: "Oikonomia",
    nameJa: "オイコノミア",
    description:
      "Church attendance and lunch management system. Real-time tracking of worship attendance and meal registration for congregations.",
    descriptionJa:
      "教会の礼拝出席・昼食管理システム。リアルタイムで出席者と食事の登録を管理。",
    tech: ["Next.js", "Supabase", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/jimiaki7",
    status: "In Production",
    statusColor: "var(--accent-green)",
  },
  {
    name: "Gegraptai",
    nameJa: "ゲグラプタイ",
    description:
      "Biblical exegesis tool for studying Hebrew and Greek original texts. Tap any word to view parsing info and record personal notes, with cloud sync via Supabase.",
    descriptionJa:
      "ヘブライ語・ギリシャ語の聖書原典を読み、単語タップで語形解析・注解を記録できる聖書研究ツール。Supabaseによるクラウド同期に対応。",
    tech: ["TypeScript", "Supabase", "PWA"],
    github: "https://github.com/jimiaki7/gegraptai",
    demo: "https://gegraptai.netlify.app/",
    status: "In Production",
    statusColor: "var(--accent-green)",
  },
];

export default function Works() {
  return (
    <section
      id="works"
      className="py-24"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="section-title">Works</h2>
        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
          制作物・実績
        </p>
        <div className="accent-line" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div key={p.name} className="card p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {p.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {p.nameJa}
                  </p>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    color: p.statusColor,
                    border: `1px solid ${p.statusColor}`,
                    background: `${p.statusColor}18`,
                  }}
                >
                  {p.status}
                </span>
              </div>

              <p
                className="text-sm leading-relaxed mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {p.description}
              </p>
              <p
                className="text-xs leading-relaxed mb-6"
                style={{ color: "var(--text-secondary)", opacity: 0.7 }}
              >
                {p.descriptionJa}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {p.tech.map((t) => (
                  <span key={t} className="skill-badge text-xs">
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex gap-3">
                {p.github ? (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm py-1.5 px-4"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                ) : (
                  <a href="#contact" className="btn-secondary text-sm py-1.5 px-4">
                    お問い合わせ
                  </a>
                )}
                {"demo" in p && p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm py-1.5 px-4"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
