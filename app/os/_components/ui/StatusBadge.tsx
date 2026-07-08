import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Info,
  type LucideIcon,
} from "lucide-react";

export type StatusTone =
  | "high"
  | "medium"
  | "low"
  | "neutral"
  | "success"
  | "danger"
  | "warning"
  | "info";

// 色だけに依存しないための tone -> {色, アイコン} の対応表。
// high/low 等の risk_level 語彙と success/danger 等の意味語彙の両方を吸収する。
const toneConfig: Record<StatusTone, { color: string; bg: string; icon: LucideIcon }> = {
  high: { color: "var(--danger)", bg: "var(--danger-soft)", icon: AlertTriangle },
  danger: { color: "var(--danger)", bg: "var(--danger-soft)", icon: AlertTriangle },
  medium: { color: "var(--warning)", bg: "var(--warning-soft)", icon: AlertCircle },
  warning: { color: "var(--warning)", bg: "var(--warning-soft)", icon: AlertCircle },
  low: { color: "var(--success)", bg: "var(--success-soft)", icon: CheckCircle2 },
  success: { color: "var(--success)", bg: "var(--success-soft)", icon: CheckCircle2 },
  info: { color: "var(--info)", bg: "var(--info-soft)", icon: Info },
  neutral: { color: "var(--text-secondary)", bg: "var(--bg-secondary)", icon: Circle },
};

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  const { color, bg, icon: Icon } = toneConfig[tone];

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ color, background: bg, border: `1px solid ${color}` }}
    >
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
}
