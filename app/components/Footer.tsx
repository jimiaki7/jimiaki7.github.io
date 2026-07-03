import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="py-8 text-center space-y-2"
      style={{
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        © {new Date().getFullYear()} Aster Works / Jimi Takaishi. Built with
        Next.js & Tailwind CSS.
      </p>
      <p className="text-xs flex flex-wrap justify-center gap-4">
        <a
          href="https://www.asterworks.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-secondary)" }}
        >
          Aster Works
        </a>
        <Link
          href="/tokushoho"
          className="underline hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-secondary)" }}
        >
          特定商取引法に基づく表記
        </Link>
      </p>
    </footer>
  );
}
