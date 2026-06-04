export default function Footer() {
  return (
    <footer
      className="py-8 text-center"
      style={{
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        © {new Date().getFullYear()} Jimi Takaishi. Built with Next.js &
        Tailwind CSS.
      </p>
    </footer>
  );
}
