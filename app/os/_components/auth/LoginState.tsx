"use client";

import { KeyRound, Loader2, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthRedirectUrl, OWNER_EMAIL } from "../../_lib/config";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import { Field } from "../ui/Field";
import { Notice } from "../ui/Notice";
import { AuthFrame } from "./AuthFrame";

// パスワード欄が空ならMagic Link、入力があればパスワードログイン。この分岐は
// 旧実装(OsApp.tsx L456)の挙動を厳密に維持する。
export function LoginState({ client }: { client: SupabaseClient | null }) {
  const [email, setEmail] = useState(OWNER_EMAIL);
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { run, busy, error } = useAsyncAction();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) {
      return;
    }

    setSuccessMessage("");
    await run(async () => {
      const result = password
        ? await client.auth.signInWithPassword({ email, password })
        : await client.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: getAuthRedirectUrl() },
          });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setSuccessMessage(
        password
          ? "ログインしました。"
          : "Magic linkを送信しました。メールを確認してください。",
      );
    });
  };

  return (
    <AuthFrame
      icon={Lock}
      title="Jimi OS"
      subtitle="ログインしているJimiだけが、AIツール、Vault記憶、生成プロジェクトを操作できます。"
    >
      <form onSubmit={submit} className="space-y-4 text-left">
        <Field label="Owner email">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Password" hint="空欄の場合はMagic Linkを送信します。">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Supabase password"
          />
        </Field>
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full justify-center"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound size={16} aria-hidden="true" />
          )}
          {password ? "Sign in" : "Send magic link"}
        </button>
      </form>
      {error && (
        <div className="mt-4">
          <Notice variant="error">{error}</Notice>
        </div>
      )}
      {!error && successMessage && (
        <div className="mt-4">
          <Notice variant="success">{successMessage}</Notice>
        </div>
      )}
    </AuthFrame>
  );
}
