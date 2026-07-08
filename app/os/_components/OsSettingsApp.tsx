"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  KeyRound,
  Link2,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  Terminal,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  DEFAULT_BRIDGE_URL,
  hasSupabaseConfig,
  OWNER_EMAIL,
  SUPABASE_URL,
} from "../_lib/config";
import {
  checkBridgeHealth,
  getBridgeSettings,
  saveBridgeSettings,
  type BridgeHealth,
  type BridgeSettings,
} from "../_lib/bridge";
import { getSupabaseBrowserClient } from "../_lib/supabase";
import { Field } from "./ui/Field";
import { Notice } from "./ui/Notice";

type AuthState = "checking" | "setup" | "signedOut" | "unauthorized" | "ready";

const ownerEmail = OWNER_EMAIL.toLowerCase();

export default function OsSettingsApp() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [bridge, setBridge] = useState<BridgeSettings>(() => getBridgeSettings());
  const [health, setHealth] = useState<BridgeHealth>({
    ok: false,
    error: "Bridge has not been checked yet.",
  });
  const [saved, setSaved] = useState(false);
  const [checkingBridge, setCheckingBridge] = useState(false);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      void Promise.resolve().then(() => {
        setAuthState("setup");
      });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let active = true;

    void Promise.resolve().then(async () => {
      if (!active) return;
      setClient(supabase);
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      const nextUser = data.user ?? null;
      setUser(nextUser);
      if (!nextUser) {
        setAuthState("signedOut");
        return;
      }
      setAuthState(
        nextUser.email?.toLowerCase() === ownerEmail ? "ready" : "unauthorized",
      );
    });

    return () => {
      active = false;
    };
  }, []);

  const testBridge = async (settings = bridge) => {
    setCheckingBridge(true);
    setHealth(await checkBridgeHealth(settings));
    setCheckingBridge(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveBridgeSettings(bridge);
    setSaved(true);
    await testBridge(bridge);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const signOut = async () => {
    await client?.auth.signOut();
    setUser(null);
    setAuthState("signedOut");
  };

  return (
    <main
      className="min-h-screen px-5 sm:px-8 py-8"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <Link
              href="/os"
              className="inline-flex items-center gap-2 text-sm mb-4"
              style={{ color: "var(--accent)" }}
            >
              <ArrowLeft size={16} />
              Back to OS
            </Link>
            <h1 className="text-3xl font-semibold">Jimi OS Settings</h1>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              Supabase、owner認証、Local Bridge、Vault安全境界を確認します。
            </p>
          </div>
          {authState === "ready" && (
            <button type="button" onClick={signOut} className="btn-secondary">
              Sign out
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatusCard
            icon={Database}
            title="Supabase"
            ok={hasSupabaseConfig()}
            body={hasSupabaseConfig() ? SUPABASE_URL : "環境変数が未設定です。"}
          />
          <StatusCard
            icon={ShieldCheck}
            title="Owner Gate"
            ok={authState === "ready"}
            body={
              authState === "ready"
                ? user?.email ?? OWNER_EMAIL
                : `Owner: ${OWNER_EMAIL}`
            }
          />
          <StatusCard
            icon={Terminal}
            title="Local Bridge"
            ok={health.ok}
            body={health.ok ? health.vaultRoot ?? "online" : health.error ?? "offline"}
          />
        </div>

        {authState === "checking" && (
          <Panel>
            <Loader2 className="animate-spin" size={20} style={{ color: "var(--accent)" }} />
            <p className="text-sm">認証状態を確認しています。</p>
          </Panel>
        )}

        {authState === "setup" && (
          <Panel>
            <XCircle size={20} style={{ color: "var(--danger)" }} aria-hidden="true" />
            <div>
              <h2 className="font-semibold mb-1">Supabase setup required</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定してください。
              </p>
            </div>
          </Panel>
        )}

        {authState === "signedOut" && (
          <Panel>
            <KeyRound size={20} style={{ color: "var(--accent)" }} />
            <div>
              <h2 className="font-semibold mb-1">Not signed in</h2>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                OS設定を扱うにはownerログインが必要です。
              </p>
              <Link href="/os" className="btn-primary">
                Sign in from OS
              </Link>
            </div>
          </Panel>
        )}

        {authState === "unauthorized" && (
          <Panel>
            <XCircle size={20} style={{ color: "var(--danger)" }} aria-hidden="true" />
            <div>
              <h2 className="font-semibold mb-1">Owner only</h2>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                現在のログインでは設定を表示できません。
              </p>
              <button type="button" onClick={signOut} className="btn-secondary">
                Sign out
              </button>
            </div>
          </Panel>
        )}

        {authState === "ready" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-6">
            <section
              className="rounded-xl p-6"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Link2 size={18} style={{ color: "var(--accent)" }} />
                <h2 className="text-lg font-semibold">Local Bridge</h2>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <Field label="Bridge URL" id="bridge-url">
                  <input
                    value={bridge.url}
                    onChange={(event) =>
                      setBridge((current) => ({ ...current, url: event.target.value }))
                    }
                    placeholder={DEFAULT_BRIDGE_URL}
                  />
                </Field>
                <Field label="Bridge token" id="bridge-token">
                  <input
                    type="password"
                    value={bridge.token}
                    onChange={(event) =>
                      setBridge((current) => ({
                        ...current,
                        token: event.target.value,
                      }))
                    }
                    placeholder="local bearer token"
                  />
                </Field>
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="btn-primary" disabled={checkingBridge}>
                    {checkingBridge ? (
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Save size={16} aria-hidden="true" />
                    )}
                    {saved ? "Saved" : "Save & test"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={checkingBridge}
                    onClick={() => testBridge()}
                  >
                    <RefreshCw size={16} aria-hidden="true" />
                    Test
                  </button>
                </div>
              </form>

              {/* 保存はボタン文言だけでは読み上げられないため、role="status" で通知する */}
              {/* ponytail: 失敗時のメッセージは上の Local Bridge StatusCard が
                  health.error を出す。ここで二重に出さない。 */}
              {saved && (
                <div className="mt-4">
                  <Notice variant="success">Bridge設定を保存しました。</Notice>
                </div>
              )}
            </section>

            <section
              className="rounded-xl p-6"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck size={18} style={{ color: "var(--accent)" }} />
                <h2 className="text-lg font-semibold">Security Defaults</h2>
              </div>
              <ul className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                <li>BrowserにはSupabase anon keyのみを置きます。</li>
                <li>service_roleとAI provider keyはEdge FunctionsかBridge側のみ。</li>
                <li>`重要データ.md`、`keys.json`、`.env*` はBridgeの既定除外です。</li>
                <li>Vault書き込みはproposal-firstで、直接書き換えません。</li>
              </ul>
              <div className="mt-6">
                <a
                  href="https://github.com/jimiaki7/jimiaki7.github.io/tree/main/docs/agentic-os/SECURITY_MODEL.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <ShieldCheck size={16} />
                  Security doc
                </a>
              </div>
            </section>
          </div>
        )}

        {authState === "ready" && <AccountCard client={client} />}
      </div>
    </main>
  );
}

function AccountCard({ client }: { client: SupabaseClient | null }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) {
      return;
    }

    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("パスワードは8文字以上にしてください。");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("パスワードが一致しません。");
      return;
    }

    setSubmitting(true);
    setMessage("");
    const { error } = await client.auth.updateUser({ password: newPassword });
    setSubmitting(false);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage(
      "パスワードを設定しました。次回から /os のパスワード欄でログインできます（Magic Linkも引き続き使えます）。",
    );
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <section
      className="rounded-xl p-6 mt-6"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <KeyRound size={18} style={{ color: "var(--accent)" }} />
        <h2 className="text-lg font-semibold">アカウント</h2>
      </div>
      <form onSubmit={submit} className="space-y-4 max-w-sm">
        <Field label="新しいパスワード" id="account-new-password">
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="8文字以上"
            disabled={submitting}
          />
        </Field>
        <Field label="確認" id="account-confirm-password">
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="もう一度入力"
            disabled={submitting}
          />
        </Field>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Save size={16} aria-hidden="true" />
          )}
          パスワードを設定
        </button>
      </form>
      {/* Noticeがvariantに応じてrole="alert"/"status"とaria-liveを付ける */}
      {message && (
        <div className="mt-4">
          <Notice variant={status === "error" ? "error" : "success"}>{message}</Notice>
        </div>
      )}
    </section>
  );
}

function StatusCard({
  icon: Icon,
  title,
  ok,
  body,
}: {
  icon: LucideIcon;
  title: string;
  ok: boolean;
  body: string;
}) {
  return (
    <article className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <Icon size={18} style={{ color: "var(--accent)" }} aria-hidden="true" />
        {/* 色だけに依存しないよう、アイコンにも状態テキストを持たせる */}
        {ok ? (
          <CheckCircle2 size={18} style={{ color: "var(--success)" }} aria-label="ok" />
        ) : (
          <XCircle size={18} style={{ color: "var(--danger)" }} aria-label="not ready" />
        )}
      </div>
      <h2 className="font-semibold">{title}</h2>
      <p className="text-xs mt-2 break-all" style={{ color: "var(--text-secondary)" }}>
        {body}
      </p>
    </article>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <section
      className="rounded-xl p-6 flex items-start gap-3"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
    >
      {children}
    </section>
  );
}
