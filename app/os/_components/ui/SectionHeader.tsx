import type { LucideIcon } from "lucide-react";

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <Icon size={18} style={{ color: "var(--accent)" }} aria-hidden="true" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
        {subtitle}
      </p>
    </div>
  );
}
