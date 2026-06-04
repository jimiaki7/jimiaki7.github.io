"use client";

export default function Nav() {
  const links = [
    { href: "#about", label: "About", ja: "自己紹介" },
    { href: "#skills", label: "Skills", ja: "スキル" },
    { href: "#works", label: "Works", ja: "実績" },
    { href: "#contact", label: "Contact", ja: "お問い合わせ" },
  ];

  return (
    <nav
      style={{
        background: "rgba(13, 17, 23, 0.85)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span
          style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono)" }}
          className="text-sm font-semibold"
        >
          JT.dev
        </span>
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              <span className="hidden sm:inline">{l.label}</span>
              <span className="sm:hidden text-xs">{l.ja}</span>
            </a>
          ))}
          <a href="#contact" className="btn-primary text-sm py-1.5 px-4">
            Hire Me
          </a>
        </div>
      </div>
    </nav>
  );
}
