"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { hasSupabaseConfig } from "../../_lib/config";
import { getSupabaseBrowserClient } from "../../_lib/supabase";

export default function OsAuthCallbackPage() {
  const configured = hasSupabaseConfig();
  const [state, setState] = useState<"loading" | "ready" | "error">(() =>
    configured ? "loading" : "error",
  );
  const [message, setMessage] = useState(() =>
    configured
      ? "ログイン情報を確認しています。"
      : "Supabase環境変数が未設定です。",
  );

  useEffect(() => {
    if (!configured) {
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      return;
    }

    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          setState("error");
          setMessage(error.message);
          return;
        }

        if (!data.session) {
          setState("error");
          setMessage("セッションを確認できませんでした。もう一度ログインしてください。");
          return;
        }

        setState("ready");
        setMessage("ログインできました。OSへ戻ります。");
        window.setTimeout(() => {
          window.location.replace("/os");
        }, 900);
      })
      .catch((error: unknown) => {
        setState("error");
        setMessage(error instanceof Error ? error.message : "認証処理に失敗しました。");
      });
  }, [configured]);

  const Icon =
    state === "loading" ? Loader2 : state === "ready" ? CheckCircle2 : XCircle;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <section className="card max-w-md w-full p-8 text-center">
        <Icon
          className={`mx-auto mb-4 ${state === "loading" ? "animate-spin" : ""}`}
          size={32}
          style={{
            color:
              state === "ready"
                ? "var(--accent-green)"
                : state === "error"
                ? "var(--danger)"
                : "var(--accent)",
          }}
        />
        <h1 className="text-xl font-semibold mb-2">Jimi OS Auth</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>
        <Link href="/os" className="btn-secondary justify-center">
          OSへ戻る
        </Link>
      </section>
    </main>
  );
}
