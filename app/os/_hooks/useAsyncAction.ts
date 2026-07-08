"use client";

import { useCallback, useMemo, useState } from "react";
import { toErrorMessage } from "../_lib/format";

export type AsyncAction = {
  run: (fn: () => Promise<void>) => Promise<void>;
  busy: boolean;
  error: string | null;
};

// 8箇所の busy/error/try-catch 重複の置換先。
//
// ⚠ 戻り値のオブジェクトを useEffect / useCallback の依存配列に入れてはいけない。
// useMemo で包んでも busy と error が変われば identity は変わるため、
// 「run() が setBusy → 再レンダー → 新しい identity → effect 再実行 → run()」
// の無限ループになる（2026-07-08、Studio が /mulmo/health を連射した実バグ）。
// 依存配列に入れる必要があるときは、安定している `action.run` だけを入れること。
// run は onSuccess が安定なら安定する。
//
// useMemo 自体は、この戻り値を props で子へ渡すときの無駄な再レンダーを減らすため。
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

  return useMemo(() => ({ run, busy, error }), [run, busy, error]);
}
