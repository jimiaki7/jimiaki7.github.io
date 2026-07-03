import { ArrowRightIcon, ExternalLinkIcon, GitBranchIcon } from "./Icons";

const stats = [
  { num: "3", label: "Live Products", ja: "公開中プロダクト" },
  { num: "5+", label: "Roadmap Ideas", ja: "開発・検証中" },
  { num: "1", label: "Product Studio", ja: "Aster Works" },
];

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
          Aster Works / Product Studio
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
          Aster Works Founder
          <span className="mx-3 opacity-30">/</span>
          <span className="text-xl">小さな道具で、明るい未来を。</span>
        </h2>
        <p
          className="text-lg max-w-2xl mb-10 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Aster Works は、仕事・学び・暮らしの中にある小さな手間や迷いを減らすための
          実用的なデジタルツールをつくる個人プロダクトスタジオです。
          Next.js・Supabase・TypeScript・AIを使い、使いやすさと事業性の両方を大切にしています。
          <br />
          <span className="text-sm mt-1 block" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
            Practical web tools for work, learning, and daily life. Built by Jimi Takaishi.
          </span>
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://www.asterworks.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Aster Worksを見る
            <ExternalLinkIcon size={16} />
          </a>
          <a href="#works" className="btn-secondary">
            プロダクト
            <ArrowRightIcon size={16} />
          </a>
          <a
            href="https://github.com/Aster-Works"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <GitBranchIcon size={18} />
            Aster-Works
          </a>
        </div>

        <div
          className="flex flex-wrap gap-6 mt-16 pt-12"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {stats.map((stat) => (
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
