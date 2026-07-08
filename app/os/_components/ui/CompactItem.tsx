import { FileText } from "lucide-react";

const toneColor: Record<"high" | "medium" | "low", string> = {
  high: "var(--danger)",
  medium: "var(--warning)",
  low: "var(--success)",
};

export function CompactItem({
  title,
  detail,
  tone,
}: {
  title: string;
  detail: string;
  tone: "high" | "medium" | "low";
}) {
  return (
    <article className="os-card p-4">
      <div className="flex items-start gap-3">
        <FileText size={17} style={{ color: toneColor[tone] }} aria-hidden="true" />
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {detail}
          </p>
        </div>
      </div>
    </article>
  );
}
