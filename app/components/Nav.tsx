"use client";

import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  const links = [
    { href: "#about", label: "About" },
    { href: "#skills", label: "Capabilities" },
    { href: "#works", label: "Products" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <nav
      style={{
        background: "color-mix(in srgb, var(--bg-primary) 90%, transparent)",
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
          Aster Works
        </span>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="nav-link">
                {l.label}
              </a>
            ))}
          </div>
          <ThemeToggle />
          <a href="#contact" className="btn-primary text-sm py-1.5 px-4">
            相談する
          </a>
        </div>
      </div>
    </nav>
  );
}
