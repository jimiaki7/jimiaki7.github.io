"use client";

import Link from "next/link";
import {
  BrainCircuit,
  Clapperboard,
  Command,
  Database,
  Gauge,
  GitBranch,
  Layers3,
  Loader2,
  LogOut,
  Network,
  RefreshCw,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useState, type CSSProperties } from "react";
import { useBridge } from "../_hooks/useBridge";
import { useOsData } from "../_hooks/useOsData";
import { useOsSession } from "../_hooks/useOsSession";
import { CenteredState } from "./auth/AuthFrame";
import { LoginState } from "./auth/LoginState";
import { SetupState } from "./auth/SetupState";
import { UnauthorizedState } from "./auth/UnauthorizedState";
import { ConnectionPill } from "./ui/ConnectionPill";
import { Notice } from "./ui/Notice";
import { ThemeToggle } from "./ui/ThemeToggle";
import { AgentRuns } from "./views/AgentRuns";
import { DreamInbox } from "./views/DreamInbox";
import { MemoryGalaxy } from "./views/MemoryGalaxy";
import { MissionControl } from "./views/MissionControl";
import { ProjectHub } from "./views/ProjectHub";
import { Studio } from "./views/Studio";
import { ToolRegistry } from "./views/ToolRegistry";
import { VaultDb } from "./views/VaultDb";

const navItems = [
  { id: "mission", label: "Mission Control", icon: Gauge },
  { id: "memory", label: "Memory Galaxy", icon: BrainCircuit },
  { id: "projects", label: "Project Hub", icon: Layers3 },
  { id: "tools", label: "Tool Registry", icon: Command },
  { id: "vault-db", label: "Vault DB", icon: Database },
  { id: "studio", label: "Studio", icon: Clapperboard },
  { id: "dream", label: "Dream Inbox", icon: Sparkles },
  { id: "agents", label: "Agent Runs", icon: GitBranch },
] as const satisfies ReadonlyArray<{ id: string; label: string; icon: LucideIcon }>;

type ViewId = (typeof navItems)[number]["id"];

// 共有ThemeToggleは .nav-link（color: var(--text-secondary)）で描かれる。ヘッダーは
// --bg-elevated なので、そのままだとライト時に約2.6:1しか出ずコントラスト比3:1を割る。
// 変数をこのsubtreeだけ差し替えて、共有コンポーネントを変えずに --text-on-elevated へ寄せる。
const onElevated = {
  "--text-secondary": "var(--text-on-elevated)",
  "--text-primary": "var(--text-on-elevated)",
} as CSSProperties;

// シェルとルーティングのみ。状態は useOsSession / useOsData / useBridge が持つ。
// 各ビューの中身は views/、認証画面は auth/、共通部品は ui/ にある。
export default function OsApp() {
  const { phase, client, user, email, signOut } = useOsSession();
  const {
    settings: bridgeSettings,
    health: bridgeHealth,
    mulmo: mulmoHealth,
    recheck,
  } = useBridge();
  const { data, loading, refresh } = useOsData(client, phase === "ready");
  const [activeView, setActiveView] = useState<ViewId>("mission");

  if (phase === "checking") {
    return (
      <CenteredState
        icon={Loader2}
        spinning
        title="Jimi OS"
        body="認証状態を確認しています。"
      />
    );
  }
  if (phase === "setup") {
    return <SetupState />;
  }
  if (phase === "signedOut") {
    return <LoginState client={client} />;
  }
  if (phase === "unauthorized") {
    return (
      <UnauthorizedState
        email={email ?? "unknown"}
        onSignOut={() => void signOut()}
      />
    );
  }

  // 書き込み可否の唯一の判定箇所。各ビューへ props で配る。
  const canWrite = Boolean(client && user && data.source === "supabase");
  const refreshAll = () => {
    void refresh();
    void recheck();
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <aside
        className="fixed hidden lg:flex top-0 left-0 h-screen w-64 flex-col px-4 py-5"
        style={{
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <Link href="/" className="flex items-center gap-3 px-3 py-2 mb-6">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            <Network size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold">Jimi OS</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Personal Agentic Layer
            </p>
          </div>
        </Link>

        <nav className="space-y-1" aria-label="OS views">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => setActiveView(id)}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                style={{
                  background: active ? "var(--info-soft)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  border: `1px solid ${active ? "var(--info)" : "transparent"}`,
                }}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <ConnectionPill
            label="Supabase"
            ok={data.source === "supabase"}
            detail={data.source === "supabase" ? "RLS data" : "seed preview"}
          />
          <ConnectionPill
            label="Local Bridge"
            ok={bridgeHealth.ok}
            detail={bridgeHealth.ok ? "online" : "offline"}
          />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header
          className="sticky top-0 z-40 px-5 sm:px-8 py-4"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--text-on-elevated)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p
                className="text-xs uppercase"
                style={{
                  color: "var(--accent)",
                  fontFamily: "var(--font-geist-mono)",
                }}
              >
                Owner Command Center
              </p>
              <h1 className="text-xl sm:text-2xl font-semibold">
                Jimi Personal AI Agentic OS
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="表示するビュー"
                value={activeView}
                onChange={(event) => setActiveView(event.target.value as ViewId)}
                className="lg:hidden h-10 rounded-lg px-3 text-sm"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                {navItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={refreshAll}
                className="btn-secondary text-sm py-2 px-3"
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                  aria-hidden="true"
                />
                Refresh
              </button>
              <Link href="/os/settings" className="btn-secondary text-sm py-2 px-3">
                <Settings size={16} aria-hidden="true" />
                Settings
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="btn-secondary text-sm py-2 px-3"
              >
                <LogOut size={16} aria-hidden="true" />
                Sign out
              </button>
              <span style={onElevated} className="inline-flex">
                <ThemeToggle />
              </span>
            </div>
          </div>
        </header>

        <main className="px-5 sm:px-8 py-8 max-w-7xl mx-auto space-y-8">
          {/* 旧実装と同じく <main> 直下＝全ビュー共通で出す。1テーブルだけ失敗しても
              シードへ落ちなくなったので、失敗を隠さないためにここが唯一の告知場所。 */}
          {!canWrite && (
            <Notice variant="readonly">Supabase未接続のため読み取り専用です。</Notice>
          )}
          {data.diagnostics.length > 0 && (
            <Notice variant="warning">
              一部のデータを読み込めませんでした（{data.diagnostics.length}件）。表示されている件数は実際より少ない可能性があります。
              <ul className="mt-1 list-disc list-inside">
                {data.diagnostics.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </Notice>
          )}

          {activeView === "mission" && (
            <MissionControl
              data={data}
              bridgeHealth={bridgeHealth}
              client={client}
              user={user}
              canWrite={canWrite}
              onRefresh={refresh}
            />
          )}
          {activeView === "memory" && (
            <MemoryGalaxy
              data={data}
              bridgeSettings={bridgeSettings}
              bridgeHealth={bridgeHealth}
              client={client}
              user={user}
              canWrite={canWrite}
              onRefresh={refresh}
            />
          )}
          {activeView === "projects" && (
            <ProjectHub
              data={data}
              client={client}
              user={user}
              canWrite={canWrite}
              onRefresh={refresh}
            />
          )}
          {activeView === "tools" && (
            <ToolRegistry
              tools={data.tools}
              client={client}
              user={user}
              canWrite={canWrite}
              bridgeSettings={bridgeSettings}
              onRefresh={refresh}
            />
          )}
          {activeView === "vault-db" && (
            <VaultDb bridgeSettings={bridgeSettings} bridgeHealth={bridgeHealth} />
          )}
          {activeView === "studio" && (
            <Studio
              bridgeHealth={bridgeHealth}
              mulmoHealth={mulmoHealth}
              onRecheck={recheck}
            />
          )}
          {activeView === "dream" && (
            <DreamInbox
              data={data}
              client={client}
              user={user}
              canWrite={canWrite}
              onRefresh={refresh}
            />
          )}
          {activeView === "agents" && <AgentRuns data={data} />}
        </main>
      </div>
    </div>
  );
}
