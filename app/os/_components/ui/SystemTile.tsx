import { Activity, AlertTriangle, CheckCircle2, type LucideIcon } from "lucide-react";

export type SystemTileStatus = "healthy" | "manual" | "offline";

const statusConfig: Record<SystemTileStatus, { color: string; icon: LucideIcon }> = {
  healthy: { color: "var(--success)", icon: CheckCircle2 },
  manual: { color: "var(--warning)", icon: AlertTriangle },
  offline: { color: "var(--danger)", icon: Activity },
};

export function SystemTile({
  title,
  status,
  body,
}: {
  title: string;
  status: SystemTileStatus;
  body: string;
}) {
  const { color, icon: Icon } = statusConfig[status];

  return (
    <article className="os-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={17} style={{ color }} aria-hidden="true" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {body}
      </p>
    </article>
  );
}
