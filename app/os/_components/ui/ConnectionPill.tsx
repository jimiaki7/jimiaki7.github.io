export function ConnectionPill({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs flex items-center justify-between"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      {/* detailに状態を表すテキスト（online/offline等）が入る前提で色のみに依存しない */}
      <span style={{ color: ok ? "var(--success)" : "var(--warning)" }}>{detail}</span>
    </div>
  );
}
