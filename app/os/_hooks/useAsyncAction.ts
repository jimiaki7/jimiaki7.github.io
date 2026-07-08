"use client";

import { useCallback, useState } from "react";
import { toErrorMessage } from "../_lib/format";

export type AsyncAction = {
  run: (fn: () => Promise<void>) => Promise<void>;
  busy: boolean;
  error: string | null;
  clearError: () => void;
};

// 8箇所の busy/error/try-catch 重複の置換先。呼び出しはイベントハンドラ経由
// (onClick等)を前提にしており、useEffect内から直接runを呼ぶ用途ではない。
export function useAsyncAction(
  onSuccess?: () => void | Promise<void>,
): AsyncAction {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (fn: () => Promise<void>) => {
      setBusy(true);
      try {
        await fn();
        setError(null);
        await onSuccess?.();
      } catch (err) {
        setError(toErrorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [onSuccess],
  );

  const clearError = useCallback(() => setError(null), []);

  return { run, busy, error, clearError };
}
