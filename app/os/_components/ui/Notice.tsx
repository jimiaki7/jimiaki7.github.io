import { AlertTriangle, CheckCircle2, Info, Lock, XCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type NoticeVariant = "error" | "success" | "warning" | "info" | "readonly";

const variantConfig: Record<
  NoticeVariant,
  { color: string; bg: string; icon: LucideIcon; role?: "alert" | "status" }
> = {
  error: { color: "var(--danger)", bg: "var(--danger-soft)", icon: XCircle, role: "alert" },
  success: { color: "var(--success)", bg: "var(--success-soft)", icon: CheckCircle2, role: "status" },
  warning: { color: "var(--warning)", bg: "var(--warning-soft)", icon: AlertTriangle, role: "status" },
  info: { color: "var(--info)", bg: "var(--info-soft)", icon: Info, role: "status" },
  readonly: { color: "var(--text-secondary)", bg: "var(--bg-secondary)", icon: Lock },
};

export function Notice({
  variant,
  children,
}: {
  variant: NoticeVariant;
  children: ReactNode;
}) {
  const { color, bg, icon: Icon, role } = variantConfig[variant];

  return (
    <div
      role={role}
      aria-live={role === "alert" ? "assertive" : role === "status" ? "polite" : undefined}
      className="rounded-lg p-4 flex gap-3 text-sm"
      style={{ background: bg, border: `1px solid ${color}`, color: "var(--text-primary)" }}
    >
      <Icon size={18} style={{ color, flexShrink: 0 }} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
