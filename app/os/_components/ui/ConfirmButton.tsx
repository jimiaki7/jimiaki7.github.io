"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

// ブラウザ標準の確認ダイアログの置換。1クリック目でインライン確認、2クリック目で実行。
export function ConfirmButton({
  onConfirm,
  label = "削除",
  confirmLabel,
  ariaLabel,
  busy,
  disabled,
}: {
  onConfirm: () => void | Promise<void>;
  label?: string;
  confirmLabel?: string;
  ariaLabel: string;
  busy?: boolean;
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-xs">
        <span style={{ color: "var(--text-secondary)" }}>
          {confirmLabel ?? `${label}しますか？`}
        </span>
        <button
          type="button"
          className="btn-secondary text-xs py-1 px-2"
          style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
          onClick={async () => {
            setConfirming(false);
            await onConfirm();
          }}
          disabled={busy}
        >
          {label}
        </button>
        <button
          type="button"
          className="btn-secondary text-xs py-1 px-2"
          onClick={() => setConfirming(false)}
          disabled={busy}
        >
          やめる
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="btn-secondary text-xs py-1.5 px-2.5"
      onClick={() => setConfirming(true)}
      disabled={disabled || busy}
    >
      {busy ? (
        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 size={14} aria-hidden="true" />
      )}
    </button>
  );
}
