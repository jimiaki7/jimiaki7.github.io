import type { ReactNode } from "react";

// 6箇所の重複していた「busyなエラー赤文字」の置換先。
export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-xs mt-2" style={{ color: "var(--danger)" }}>
      {children}
    </p>
  );
}
