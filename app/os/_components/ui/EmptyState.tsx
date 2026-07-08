import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
}) {
  return (
    <div className="os-card p-8 text-center">
      {Icon && (
        <Icon
          size={24}
          className="mx-auto mb-3"
          style={{ color: "var(--text-muted)" }}
          aria-hidden="true"
        />
      )}
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </p>
      {body && (
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          {body}
        </p>
      )}
    </div>
  );
}
