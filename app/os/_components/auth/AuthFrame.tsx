import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// 認証まわりの各画面（LoginState/SetupState/UnauthorizedState）が共有する
// 中央寄せカードのシェル。
export function AuthFrame({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <section className="os-card max-w-lg w-full p-8 text-center">
        <CenteredIcon icon={icon} />
        <h1 className="text-2xl font-semibold mb-3">{title}</h1>
        <p
          className="text-sm leading-relaxed mb-7"
          style={{ color: "var(--text-secondary)" }}
        >
          {subtitle}
        </p>
        {children}
      </section>
    </main>
  );
}

// 認証確認中などの単純な「アイコン＋タイトル＋本文」画面。OsApp.tsx の
// "checking" フェーズ（起動直後のセッション確認中）が使う。
export function CenteredState({
  icon: Icon,
  spinning,
  title,
  body,
}: {
  icon: LucideIcon;
  spinning?: boolean;
  title: string;
  body: string;
}) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <section className="os-card max-w-md w-full p-8 text-center">
        <Icon
          size={32}
          aria-hidden="true"
          className={`mx-auto mb-4 ${spinning ? "animate-spin" : ""}`}
          style={{ color: "var(--accent)" }}
        />
        <h1 className="text-xl font-semibold mb-2">{title}</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {body}
        </p>
      </section>
    </main>
  );
}

// 旧実装の異常「{CenteredIcon(icon)}」（コンポーネントを関数として直接呼び出し）を
// 通常のJSXコンポーネント呼び出し「<CenteredIcon icon={icon} />」に修正。
function CenteredIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div
      className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-5"
      style={{ background: "var(--info-soft)", color: "var(--accent)" }}
    >
      <Icon size={24} aria-hidden="true" />
    </div>
  );
}
