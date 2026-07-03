import {
  ArrowRightIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  PackageIcon,
} from "./Icons";

type ProductLink = {
  label: string;
  href: string;
  icon: "external" | "github" | "package" | "contact";
};

type Product = {
  name: string;
  nameJa: string;
  category: string;
  description: string;
  descriptionJa: string;
  tech: string[];
  status: string;
  statusJa: string;
  statusColor: string;
  links: ProductLink[];
};

const products: Product[] = [
  {
    name: "Aster Support Navi",
    nameJa: "生活支援制度ナビ",
    category: "Life",
    description:
      "A support-program navigator that helps people find public assistance programs by address and life situation, then organize the next steps.",
    descriptionJa:
      "住所と生活状況から、確認すべき支援制度と次にやることを整理する生活支援ナビ。東京23区の出産・子育て支援から公開中。",
    tech: ["Next.js", "Supabase", "Vercel", "GA4"],
    status: "Live",
    statusJa: "公開中",
    statusColor: "var(--accent-green)",
    links: [{ label: "Site", href: "https://astersupport.com/", icon: "external" }],
  },
  {
    name: "Aster Tools",
    nameJa: "無料ツール集",
    category: "Life / Work",
    description:
      "A multilingual toolkit for small chores in work and daily life, from calculators and unit conversion to writing helpers.",
    descriptionJa:
      "年齢・ローン・税金の計算から単位変換、文章づくりまで、暮らしと仕事の小さな手間を解く無料ツール集。",
    tech: ["Astro", "TypeScript", "SEO", "i18n"],
    status: "Live",
    statusJa: "公開中",
    statusColor: "var(--accent-green)",
    links: [{ label: "Site", href: "https://astertools.app/", icon: "external" }],
  },
  {
    name: "Aster Guard",
    nameJa: "MCPセキュリティ診断",
    category: "Developer",
    description:
      "A lightweight security scanner that checks MCP servers and .mcp.json before connecting them, built for Claude Code users and indie AI developers.",
    descriptionJa:
      "MCPサーバーや .mcp.json をつなぐ前に点検する、Claude Codeユーザーと個人AI開発者向けの軽量セキュリティ診断ツール。",
    tech: ["Node.js", "MCP", "CLI", "GitHub Actions"],
    status: "Live",
    statusJa: "公開中",
    statusColor: "var(--accent-green)",
    links: [
      {
        label: "npm",
        href: "https://www.npmjs.com/package/@asterworks/aster-guard",
        icon: "package",
      },
      {
        label: "GitHub",
        href: "https://github.com/Aster-Works/aster-guard",
        icon: "github",
      },
    ],
  },
  {
    name: "Aster Business Navi",
    nameJa: "中小企業向けWeb診断ナビ",
    category: "Work",
    description:
      "A URL-based business diagnostic navigator that turns overlooked web, hiring, and trust signals into concrete next checks.",
    descriptionJa:
      "会社サイトのURLから、Web・採用・信頼性の見落としと次に確認すべき改善点を整理する中小企業向け診断ナビ。",
    tech: ["Next.js", "Crawler", "AI Reports", "Supabase"],
    status: "MVP",
    statusJa: "準備中",
    statusColor: "var(--accent)",
    links: [{ label: "相談する", href: "#contact", icon: "contact" }],
  },
  {
    name: "Aster Signal",
    nameJa: "営業タイミング検知",
    category: "B2B",
    description:
      "A sales-signal concept that detects signs of restaurant openings, relocations, and closures from public sources with evidence URLs.",
    descriptionJa:
      "公開情報から店舗の開業・移転・閉業の兆しを検知し、営業すべき相手・タイミング・提案メモを整理するB2Bサービス構想。",
    tech: ["Open Data", "Scoring", "Research", "Human Review"],
    status: "Planning",
    statusJa: "構想中",
    statusColor: "var(--accent)",
    links: [{ label: "相談する", href: "#contact", icon: "contact" }],
  },
  {
    name: "Keryx",
    nameJa: "牧師向けワークスペース",
    category: "Ministry",
    description:
      "A Japanese-first workspace concept for pastors that brings sermon planning, service preparation, and reflection together in one place.",
    descriptionJa:
      "説教の計画から礼拝準備、振り返りまでをひとつにまとめる、日本語ファーストの牧師向けワークスペース。",
    tech: ["Next.js", "Supabase", "AI", "Japanese UX"],
    status: "Prototype",
    statusJa: "検証中",
    statusColor: "var(--accent)",
    links: [{ label: "相談する", href: "#contact", icon: "contact" }],
  },
];

function LinkIcon({ icon }: { icon: ProductLink["icon"] }) {
  if (icon === "github") return <GitBranchIcon size={16} />;
  if (icon === "package") return <PackageIcon size={16} />;
  if (icon === "contact") return <ArrowRightIcon size={16} />;
  return <ExternalLinkIcon size={16} />;
}

export default function Works() {
  return (
    <section
      id="works"
      className="py-24"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="section-title">Products</h2>
        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
          Aster Works の公開中・準備中プロダクト
        </p>
        <div className="accent-line" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <article key={p.name} className="card p-6 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--accent)" }}
                  >
                    {p.category}
                  </p>
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
                  className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0"
                  style={{
                    color: p.statusColor,
                    border: `1px solid ${p.statusColor}`,
                    background: `${p.statusColor}18`,
                  }}
                >
                  {p.status}
                  <span className="hidden sm:inline"> / {p.statusJa}</span>
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
                style={{ color: "var(--text-secondary)", opacity: 0.78 }}
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

              <div className="mt-auto flex flex-wrap gap-3">
                {p.links.map((link) => (
                  <a
                    key={`${p.name}-${link.label}`}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="btn-secondary text-sm py-1.5 px-4"
                  >
                    <LinkIcon icon={link.icon} />
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
