import type { LucideIcon } from "lucide-react";

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="os-card p-5">
      <div className="flex items-start justify-between mb-5">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {label}
        </p>
        <Icon size={18} style={{ color: "var(--accent)" }} aria-hidden="true" />
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
        {detail}
      </p>
    </article>
  );
}
