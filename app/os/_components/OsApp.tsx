"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  Clapperboard,
  Clock3,
  Command,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  GitBranch,
  KeyRound,
  Layers3,
  Loader2,
  Lock,
  LogOut,
  Network,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import {
  getAuthRedirectUrl,
  hasSupabaseConfig,
  isLocalPreviewHost,
  OWNER_EMAIL,
} from "../_lib/config";
import {
  checkBridgeHealth,
  checkMulmoHealth,
  getBridgeSettings,
  queryVaultDb,
  searchVault,
  type BridgeHealth,
  type BridgeSettings,
  type MulmoHealth,
  type VaultDbRow,
  type VaultSearchResult,
} from "../_lib/bridge";
import { formatDate, formatUsd } from "../_lib/format";
import { createProject, loadOsData } from "../_lib/os-data";
import {
  type OsData,
  type OsProject,
  type OsTool,
} from "../_lib/schemas";
import { createSeedData } from "../_lib/seed";
import { getSupabaseBrowserClient } from "../_lib/supabase";

type AuthState =
  | "checking"
  | "setup"
  | "localPreview"
  | "signedOut"
  | "unauthorized"
  | "ready";
type ViewId =
  | "mission"
  | "memory"
  | "projects"
  | "tools"
  | "dream"
  | "agents"
  | "vault-db"
  | "studio";

const navItems: Array<{ id: ViewId; label: string; icon: LucideIcon }> = [
  { id: "mission", label: "Mission Control", icon: Gauge },
  { id: "memory", label: "Memory Galaxy", icon: BrainCircuit },
  { id: "projects", label: "Project Hub", icon: Layers3 },
  { id: "tools", label: "Tool Registry", icon: Command },
  { id: "vault-db", label: "Vault DB", icon: Database },
  { id: "studio", label: "Studio", icon: Clapperboard },
  { id: "dream", label: "Dream Inbox", icon: Sparkles },
  { id: "agents", label: "Agent Runs", icon: GitBranch },
];

const ownerEmail = OWNER_EMAIL.toLowerCase();

export default function OsApp() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<OsData>(() => createSeedData());
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeView, setActiveView] = useState<ViewId>("mission");
  const [bridgeSettings, setBridgeSettings] = useState<BridgeSettings>(() =>
    getBridgeSettings(),
  );
  const [bridgeHealth, setBridgeHealth] = useState<BridgeHealth>({
    ok: false,
    error: "Bridge has not been checked yet.",
  });

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      void Promise.resolve().then(() => {
        setAuthState(isLocalPreviewHost() ? "localPreview" : "setup");
      });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let active = true;

    const applySession = (session: Session | null) => {
      const nextUser = session?.user ?? null;
      if (!nextUser) {
        setUser(null);
        setAuthState("signedOut");
        return;
      }

      setUser(nextUser);
      setAuthState(
        nextUser.email?.toLowerCase() === ownerEmail ? "ready" : "unauthorized",
      );
    };

    void Promise.resolve().then(async () => {
      if (!active) return;
      setClient(supabase);
      const { data: sessionData } = await supabase.auth.getSession();
      if (active) {
        applySession(sessionData.session);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        applySession(session);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshData = useCallback(async () => {
    if (!client || !user || authState !== "ready") {
      return;
    }

    setIsLoadingData(true);
    try {
      const nextData = await loadOsData(client);
      setData(nextData);
    } finally {
      setIsLoadingData(false);
    }
  }, [authState, client, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshData]);

  const refreshBridge = useCallback(async () => {
    const settings = getBridgeSettings();
    setBridgeSettings(settings);
    setBridgeHealth(await checkBridgeHealth(settings));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshBridge();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshBridge]);

  const signOut = async () => {
    await client?.auth.signOut();
    setUser(null);
    setAuthState("signedOut");
  };

  if (authState === "checking") {
    return <CenteredState icon={Loader2} spinning title="Jimi OS" body="認証状態を確認しています。" />;
  }

  if (authState === "setup") {
    return <SetupState />;
  }

  if (authState === "signedOut") {
    return <LoginState client={client} />;
  }

  if (authState === "unauthorized") {
    return <UnauthorizedState email={user?.email ?? "unknown"} onSignOut={signOut} />;
  }

  const isPreview = authState === "localPreview";
  const displayData = isPreview
    ? {
        ...data,
        diagnostics: [
          "Local Preview: Supabase is not configured. Production/private data still requires Supabase Auth and RLS.",
          ...data.diagnostics,
        ],
      }
    : data;

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
            style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
          >
            <Network size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold">Jimi OS</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Personal Agentic Layer
            </p>
          </div>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                style={{
                  background: active ? "rgba(88, 166, 255, 0.12)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  border: active
                    ? "1px solid rgba(88, 166, 255, 0.35)"
                    : "1px solid transparent",
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <ConnectionPill
            label="Supabase"
            ok={displayData.source === "supabase"}
            detail={
              isPreview
                ? "local preview"
                : displayData.source === "supabase"
                ? "RLS data"
                : "seed fallback"
            }
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
            background: "rgba(13, 17, 23, 0.86)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(14px)",
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
              <MobileViewSelect activeView={activeView} onChange={setActiveView} />
              <button
                type="button"
                onClick={refreshData}
                className="btn-secondary text-sm py-2 px-3"
                disabled={isLoadingData}
              >
                <RefreshCw size={16} className={isLoadingData ? "animate-spin" : ""} />
                Refresh
              </button>
              <Link href="/os/settings" className="btn-secondary text-sm py-2 px-3">
                <Settings size={16} />
                Settings
              </Link>
              {!isPreview && (
                <button
                  type="button"
                  onClick={signOut}
                  className="btn-secondary text-sm py-2 px-3"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="px-5 sm:px-8 py-8 max-w-7xl mx-auto">
          {displayData.diagnostics.length > 0 && (
            <div
              className="mb-6 rounded-lg p-4 flex gap-3"
              style={{
                background: "rgba(248, 81, 73, 0.08)",
                border: "1px solid rgba(248, 81, 73, 0.35)",
              }}
            >
              <AlertTriangle size={18} style={{ color: "#f85149" }} />
              <div>
                <p className="text-sm font-semibold">Supabase data fallback</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  {displayData.diagnostics[0]}
                </p>
              </div>
            </div>
          )}

          {activeView === "mission" && (
            <MissionControl data={displayData} bridgeHealth={bridgeHealth} />
          )}
          {activeView === "memory" && (
            <MemoryGalaxy
              data={displayData}
              bridgeSettings={bridgeSettings}
              bridgeHealth={bridgeHealth}
            />
          )}
          {activeView === "projects" && (
            <ProjectHub
              data={displayData}
              client={client}
              user={user}
              onCreated={refreshData}
            />
          )}
          {activeView === "tools" && <ToolRegistry tools={displayData.tools} />}
          {activeView === "vault-db" && (
            <VaultDb bridgeSettings={bridgeSettings} bridgeHealth={bridgeHealth} />
          )}
          {activeView === "studio" && (
            <Studio bridgeSettings={bridgeSettings} bridgeHealth={bridgeHealth} />
          )}
          {activeView === "dream" && <DreamInbox data={displayData} />}
          {activeView === "agents" && <AgentRuns data={displayData} />}
        </main>
      </div>
    </div>
  );
}

function LoginState({ client }: { client: SupabaseClient | null }) {
  const [email, setEmail] = useState(OWNER_EMAIL);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) {
      return;
    }

    setStatus("loading");
    setMessage("");

    const result = password
      ? await client.auth.signInWithPassword({ email, password })
      : await client.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: getAuthRedirectUrl() },
        });

    if (result.error) {
      setStatus("error");
      setMessage(result.error.message);
      return;
    }

    setStatus(password ? "idle" : "sent");
    setMessage(
      password
        ? "ログインしました。"
        : "Magic linkを送信しました。メールを確認してください。",
    );
  };

  return (
    <AuthFrame
      icon={Lock}
      title="Jimi OS"
      subtitle="ログインしているJimiだけが、AIツール、Vault記憶、生成プロジェクトを操作できます。"
    >
      <form onSubmit={submit} className="space-y-4 text-left">
        <div>
          <label htmlFor="email">Owner email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password / 空ならMagic Link</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Supabase password"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary w-full justify-center"
        >
          {status === "loading" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <KeyRound size={16} />
          )}
          {password ? "Sign in" : "Send magic link"}
        </button>
      </form>
      {message && (
        <p
          className="text-sm mt-4"
          style={{ color: status === "error" ? "#f85149" : "var(--accent-green)" }}
        >
          {message}
        </p>
      )}
    </AuthFrame>
  );
}

function SetupState() {
  return (
    <AuthFrame
      icon={Database}
      title="Supabase setup required"
      subtitle="GitHub Pagesの静的OSシェルは準備済みです。認証とRLSデータを使うには公開用Supabase環境変数を設定してください。"
    >
      <div className="text-left rounded-lg p-4" style={{ background: "var(--bg-secondary)" }}>
        <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
          Required environment variables
        </p>
        <pre
          className="text-xs whitespace-pre-wrap"
          style={{ color: "var(--text-primary)" }}
        >{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_OS_OWNER_EMAIL=${OWNER_EMAIL}`}</pre>
      </div>
      <Link href="/" className="btn-secondary mt-5 justify-center">
        Portfolioへ戻る
      </Link>
    </AuthFrame>
  );
}

function UnauthorizedState({
  email,
  onSignOut,
}: {
  email: string;
  onSignOut: () => void;
}) {
  return (
    <AuthFrame
      icon={ShieldCheck}
      title="Owner only"
      subtitle={`このOSは${OWNER_EMAIL}専用です。現在のログイン: ${email}`}
    >
      <button type="button" onClick={onSignOut} className="btn-secondary justify-center">
        <LogOut size={16} />
        Sign out
      </button>
    </AuthFrame>
  );
}

function CenteredState({
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
      <section className="card max-w-md w-full p-8 text-center">
        <Icon
          size={32}
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

function AuthFrame({
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
      <section className="card max-w-lg w-full p-8 text-center">
        {CenteredIcon(icon)}
        <h1 className="text-2xl font-semibold mb-3">{title}</h1>
        <p className="text-sm leading-relaxed mb-7" style={{ color: "var(--text-secondary)" }}>
          {subtitle}
        </p>
        {children}
      </section>
    </main>
  );
}

function CenteredIcon(Icon: LucideIcon) {
  return (
    <div
      className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-5"
      style={{ background: "rgba(88, 166, 255, 0.12)", color: "var(--accent)" }}
    >
      <Icon size={24} />
    </div>
  );
}

function MobileViewSelect({
  activeView,
  onChange,
}: {
  activeView: ViewId;
  onChange: (view: ViewId) => void;
}) {
  return (
    <select
      value={activeView}
      onChange={(event) => onChange(event.target.value as ViewId)}
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
  );
}

function MissionControl({
  data,
  bridgeHealth,
}: {
  data: OsData;
  bridgeHealth: BridgeHealth;
}) {
  const activeProjects = data.projects.filter((project) => project.status === "active");
  const pendingApprovals = data.approvals.filter(
    (approval) => approval.status === "pending",
  );
  const openInsights = data.insights.filter((insight) => insight.status === "open");
  const cost = data.costEvents.reduce(
    (sum, event) => sum + (event.amount_usd ?? 0),
    0,
  );
  const memoryStrength =
    data.memoryItems.length === 0
      ? 0
      : Math.round(
          data.memoryItems.reduce((sum, item) => sum + (item.strength ?? 0), 0) /
            data.memoryItems.length,
        );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon={Layers3}
          label="Active Projects"
          value={activeProjects.length.toString()}
          detail="牧会・開発・副業"
        />
        <MetricCard
          icon={BrainCircuit}
          label="Memory Health"
          value={`${memoryStrength}%`}
          detail={`${data.memoryItems.length} indexed memories`}
        />
        <MetricCard
          icon={ShieldCheck}
          label="Pending Approvals"
          value={pendingApprovals.length.toString()}
          detail="human-in-the-loop"
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Tracked Cost"
          value={formatUsd(cost)}
          detail="MVP estimate"
        />
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
        <div>
          <SectionHeader
            icon={Activity}
            title="Today's Operating Picture"
            subtitle="Jimiの今日の判断に必要なAI・記憶・プロジェクトの要点。"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.slice(0, 4).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        <div>
          <SectionHeader
            icon={Sparkles}
            title="Dream Signals"
            subtitle="OSが次に見るべき改善候補。"
          />
          <div className="space-y-3">
            {openInsights.slice(0, 3).map((insight) => (
              <CompactItem
                key={insight.id}
                title={insight.title}
                detail={insight.recommendation ?? insight.rationale ?? ""}
                tone={insight.priority}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          icon={Terminal}
          title="System Status"
          subtitle="静的サイト、Supabase、Local Bridge、承認制の境界。"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SystemTile
            title="Static Portfolio"
            status="healthy"
            body="GitHub Pages exportを維持。公開サイトは営業用としてそのまま稼働。"
          />
          <SystemTile
            title="Supabase RLS"
            status={data.source === "supabase" ? "healthy" : "manual"}
            body={
              data.source === "supabase"
                ? "owner_idで保護されたライブデータを表示中。"
                : "マイグレーション適用前のためシード表示中。"
            }
          />
          <SystemTile
            title="Local Bridge"
            status={bridgeHealth.ok ? "healthy" : "offline"}
            body={
              bridgeHealth.ok
                ? "JimiVaultへのローカル読み取り接続が利用可能。"
                : bridgeHealth.error ?? "Bridge is offline."
            }
          />
        </div>
      </section>
    </div>
  );
}

function MemoryGalaxy({
  data,
  bridgeSettings,
  bridgeHealth,
}: {
  data: OsData;
  bridgeSettings: BridgeSettings;
  bridgeHealth: BridgeHealth;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VaultSearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim() || !bridgeHealth.ok) {
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      setResults(await searchVault(bridgeSettings, query.trim()));
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Vault search failed.");
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={BrainCircuit}
        title="Memory Galaxy"
        subtitle="JimiVault、AI会話、生成物を一つの共有記憶として扱う場所。"
      />

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="vault-query">Vault search via Local Bridge</label>
          <input
            id="vault-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Keryx, 釈義, Aster Works..."
            disabled={!bridgeHealth.ok}
          />
        </div>
        <button
          type="submit"
          className="btn-primary sm:self-end justify-center"
          disabled={!bridgeHealth.ok || status === "loading"}
        >
          {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Search
        </button>
      </form>

      {!bridgeHealth.ok && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Local Bridge is offline. Configure the token in Settings, then run the bridge locally.
        </p>
      )}

      {message && (
        <p className="text-sm" style={{ color: "#f85149" }}>
          {message}
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result) => (
            <MemoryCard
              key={result.path}
              title={result.title}
              path={result.path}
              summary={result.excerpt}
              tags={["Bridge"]}
              strength={100}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.memoryItems.map((item) => (
          <MemoryCard
            key={item.id}
            title={item.title}
            path={item.source_path ?? item.source_type}
            summary={item.summary ?? ""}
            tags={item.tags ?? []}
            strength={item.strength ?? 0}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectHub({
  data,
  client,
  user,
  onCreated,
}: {
  data: OsData;
  client: SupabaseClient | null;
  user: User | null;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState<OsProject["domain"]>("development");
  const [priority, setPriority] = useState<OsProject["priority"]>("medium");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  const canWrite = Boolean(client && user && data.source === "supabase");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client || !user || !name.trim()) {
      return;
    }

    setStatus("saving");
    setMessage("");
    try {
      await createProject(client, user.id, {
        name,
        domain,
        priority,
        description,
      });
      setName("");
      setDescription("");
      setStatus("idle");
      await onCreated();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Project creation failed.");
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Layers3}
        title="Project Hub"
        subtitle="説教、Keryx、Aster Works、副業案件を同じ操作面で見る。"
      />

      <form
        onSubmit={submit}
        className="rounded-xl p-5 grid grid-cols-1 lg:grid-cols-[1fr_160px_140px_auto] gap-4 items-end"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
      >
        <div>
          <label htmlFor="project-name">New project</label>
          <input
            id="project-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="次の生成プロジェクト"
            disabled={!canWrite}
          />
        </div>
        <div>
          <label htmlFor="project-domain">Domain</label>
          <select
            id="project-domain"
            value={domain}
            onChange={(event) => setDomain(event.target.value as OsProject["domain"])}
            disabled={!canWrite}
            className="h-12 rounded-lg px-3 text-sm w-full"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="pastoral">Pastoral</option>
            <option value="development">Development</option>
            <option value="business">Business</option>
            <option value="personal">Personal</option>
          </select>
        </div>
        <div>
          <label htmlFor="project-priority">Priority</label>
          <select
            id="project-priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as OsProject["priority"])
            }
            disabled={!canWrite}
            className="h-12 rounded-lg px-3 text-sm w-full"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn-primary h-12 justify-center"
          disabled={!canWrite || status === "saving"}
        >
          {status === "saving" ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add
        </button>
        <div className="lg:col-span-4">
          <label htmlFor="project-description">Description</label>
          <textarea
            id="project-description"
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="このプロジェクトが何を前進させるか"
            disabled={!canWrite}
          />
        </div>
      </form>

      {!canWrite && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Supabase migration適用前、またはシード表示中のため新規作成は無効です。
        </p>
      )}
      {message && (
        <p className="text-sm" style={{ color: "#f85149" }}>
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

function ToolRegistry({ tools }: { tools: OsTool[] }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Command}
        title="Tool Registry"
        subtitle="AI、記憶、プロジェクト、インフラをモデル非依存で管理。"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <article key={tool.id} className="card p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold">{tool.name}</h3>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  {tool.provider ?? tool.category}
                </p>
              </div>
              <ToolStatusBadge status={tool.status} />
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
              {tool.notes}
            </p>
            <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
              <span>{tool.category}</span>
              <span>{formatDate(tool.last_checked_at)}</span>
            </div>
            {tool.launch_url && (
              <a
                href={tool.launch_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm py-2 px-3 mt-4"
              >
                <ExternalLink size={15} />
                Open
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

type VaultDbPreset = {
  id: string;
  label: string;
  folder?: string;
  limit: number;
};

const vaultDbPresets: VaultDbPreset[] = [
  { id: "sunday", label: "日曜説教", folder: "01_Project/説教/日曜説教", limit: 50 },
  { id: "prayer", label: "祈祷会奨励", folder: "01_Project/説教/祈祷会奨励", limit: 50 },
  { id: "exegesis", label: "釈義ノート", folder: "03_Resource/釈義ノート", limit: 50 },
  { id: "recent", label: "最近のノート", limit: 30 },
];

function propertyToText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }
  if (value === undefined || value === null || value === "") {
    return "";
  }
  return String(value);
}

function propertyToTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (value === undefined || value === null || value === "") {
    return [];
  }
  return [String(value)];
}

function VaultDb({
  bridgeSettings,
  bridgeHealth,
}: {
  bridgeSettings: BridgeSettings;
  bridgeHealth: BridgeHealth;
}) {
  const [activePresetId, setActivePresetId] = useState(vaultDbPresets[0].id);
  const [rows, setRows] = useState<VaultDbRow[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const runQuery = useCallback(
    async (active: () => boolean) => {
      const preset =
        vaultDbPresets.find((item) => item.id === activePresetId) ?? vaultDbPresets[0];

      if (!bridgeHealth.ok) {
        return;
      }

      setStatus("loading");
      setMessage("");

      try {
        const result = await queryVaultDb(bridgeSettings, {
          folder: preset.folder,
          recursive: true,
          sort: { field: "modifiedAt", order: "desc" },
          limit: preset.limit,
        });
        if (!active()) return;
        setRows(result.rows);
        setTotal(result.total);
        setStatus("idle");
      } catch (error) {
        if (!active()) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Vault DB query failed.");
      }
    },
    [activePresetId, bridgeSettings, bridgeHealth.ok],
  );

  useEffect(() => {
    let isActive = true;
    const timer = window.setTimeout(() => {
      void runQuery(() => isActive);
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [runQuery]);

  const needle = filter.trim().toLowerCase();
  const filteredRows = needle
    ? rows.filter((row) => {
        const haystack = `${row.name} ${propertyToText(row.properties.tags)}`.toLowerCase();
        return haystack.includes(needle);
      })
    : rows;

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Database}
        title="Vault DB"
        subtitle="JimiVaultのfrontmatterをNotion風データベースとして閲覧する。"
      />

      <div className="flex flex-wrap gap-2">
        {vaultDbPresets.map((preset) => {
          const active = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setActivePresetId(preset.id)}
              className="text-sm px-3 py-2 rounded-lg transition-colors"
              style={{
                background: active ? "rgba(88, 166, 255, 0.12)" : "var(--bg-card)",
                border: active
                  ? "1px solid rgba(88, 166, 255, 0.35)"
                  : "1px solid var(--border)",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {!bridgeHealth.ok && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Local Bridge is offline. Configure the token in Settings, then run the bridge locally.
        </p>
      )}

      {bridgeHealth.ok && (
        <>
          <div>
            <label htmlFor="vault-db-filter">Filter</label>
            <input
              id="vault-db-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="名前やtagsで絞り込み"
            />
          </div>

          {message && (
            <p className="text-sm" style={{ color: "#f85149" }}>
              {message}
            </p>
          )}

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="text-left px-4 py-3">名前</th>
                  <th className="text-left px-4 py-3">tags</th>
                  <th className="text-left px-4 py-3">creation date</th>
                  <th className="text-left px-4 py-3">更新日時</th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Loader2 size={16} className="inline animate-spin mr-2" />
                      Loading...
                    </td>
                  </tr>
                )}
                {status !== "loading" && filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      該当するノートがありません。
                    </td>
                  </tr>
                )}
                {status !== "loading" &&
                  filteredRows.map((row) => (
                    <tr key={row.path} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-4 py-3 break-all">{row.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {propertyToTags(row.properties.tags).map((tag) => (
                            <span key={tag} className="skill-badge text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {propertyToText(row.properties["creation date"])}
                      </td>
                      <td className="px-4 py-3">{formatDate(row.modifiedAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {filteredRows.length} / {total} notes
          </p>
        </>
      )}
    </div>
  );
}

function Studio({
  bridgeSettings,
  bridgeHealth,
}: {
  bridgeSettings: BridgeSettings;
  bridgeHealth: BridgeHealth;
}) {
  const [mulmoHealth, setMulmoHealth] = useState<MulmoHealth>({
    ok: false,
    error: "MulmoClaude has not been checked yet.",
  });
  const [checking, setChecking] = useState(false);

  const refreshMulmoHealth = useCallback(async () => {
    if (!bridgeHealth.ok) {
      return;
    }
    setChecking(true);
    try {
      setMulmoHealth(await checkMulmoHealth(bridgeSettings));
    } finally {
      setChecking(false);
    }
  }, [bridgeSettings, bridgeHealth.ok]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshMulmoHealth();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshMulmoHealth]);

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Clapperboard}
        title="Studio"
        subtitle="Vaultノートから動画/スライドを生成するMulmoClaudeへの導線。"
      />

      <div className="card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ConnectionPill
            label="MulmoClaude"
            ok={mulmoHealth.ok}
            detail={
              !bridgeHealth.ok
                ? "bridge offline"
                : mulmoHealth.ok
                ? "online"
                : mulmoHealth.error ?? "offline"
            }
          />
          <button
            type="button"
            onClick={refreshMulmoHealth}
            className="btn-secondary text-sm py-2 px-3"
            disabled={!bridgeHealth.ok || checking}
          >
            <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
            Recheck
          </button>
        </div>

        {!bridgeHealth.ok && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Local Bridge is offline. Configure the token in Settings, then run the bridge locally.
          </p>
        )}

        <div>
          <p className="text-sm font-semibold mb-2">起動方法</p>
          <pre
            className="text-xs whitespace-pre-wrap rounded-lg p-3"
            style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
          >
            npx mulmoclaude@latest
          </pre>
        </div>

        <a
          href="http://127.0.0.1:3001"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm py-2 px-3"
        >
          <ExternalLink size={15} />
          Open localhost:3001
        </a>
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold mb-2">ワークフロー</p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Vaultノート（説教原稿・祈祷会奨励）→ MulmoScript（構成台本）→ MulmoClaudeでの動画/スライド生成、という流れの入口です。生成の実行はJimiがMulmoClaude側で行い、OSはヘルス確認と起動導線のみを提供します（実行機能はここには実装しません）。
        </p>
      </div>
    </div>
  );
}

function DreamInbox({ data }: { data: OsData }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Sparkles}
        title="Insight / Dream Inbox"
        subtitle="OSが毎日見るべき改善、重複、記憶の健康、機会を承認待ちにする。"
      />
      <div className="space-y-4">
        {data.insights.map((insight) => (
          <article key={insight.id} className="card p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <StatusBadge label={insight.priority} tone={insight.priority} />
                  <StatusBadge label={insight.category} tone="neutral" />
                  <StatusBadge label={insight.status} tone="neutral" />
                </div>
                <h3 className="text-lg font-semibold">{insight.title}</h3>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {insight.rationale}
                </p>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {insight.recommendation}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" className="btn-secondary text-sm py-2 px-3">
                  Approve
                </button>
                <button type="button" className="btn-secondary text-sm py-2 px-3">
                  Dismiss
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AgentRuns({ data }: { data: OsData }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        icon={GitBranch}
        title="Agent Runs"
        subtitle="builder / judge / human approval loop の実行履歴と成果物。"
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-6">
        <div className="space-y-4">
          {data.agentRuns.map((run) => (
            <article key={run.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{run.title}</h3>
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                    Builder: {run.builder_model ?? "unset"} / Judge:{" "}
                    {run.judge_model ?? "unset"}
                  </p>
                </div>
                <StatusBadge label={run.status} tone="neutral" />
              </div>
              <div className="mt-5 flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span>Score: {run.score ?? "N/A"}</span>
                <span>{formatDate(run.created_at)}</span>
              </div>
            </article>
          ))}
        </div>
        <div>
          <SectionHeader
            icon={ShieldCheck}
            title="Approval Queue"
            subtitle="外部アクション前の人間承認。"
          />
          <div className="space-y-3">
            {data.approvals.map((approval) => (
              <CompactItem
                key={approval.id}
                title={approval.title}
                detail={`${approval.action_type} / ${approval.requested_by ?? "unknown"}`}
                tone={approval.risk_level}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <Icon size={18} style={{ color: "var(--accent)" }} />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
        {subtitle}
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between mb-5">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {label}
        </p>
        <Icon size={18} style={{ color: "var(--accent)" }} />
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
        {detail}
      </p>
    </article>
  );
}

function ProjectCard({ project }: { project: OsProject }) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold">{project.name}</h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {project.domain} / {formatDate(project.updated_at)}
          </p>
        </div>
        <StatusBadge label={project.priority} tone={project.priority} />
      </div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
        {project.description}
      </p>
      <div
        className="rounded-lg p-3 text-sm"
        style={{
          background: "rgba(88, 166, 255, 0.08)",
          color: "var(--text-primary)",
        }}
      >
        <Clock3 size={14} className="inline mr-2" />
        {project.next_action ?? "次の行動は未設定"}
      </div>
    </article>
  );
}

function MemoryCard({
  title,
  path,
  summary,
  tags,
  strength,
}: {
  title: string;
  path: string;
  summary: string;
  tags: string[];
  strength: number;
}) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs mt-1 break-all" style={{ color: "var(--text-secondary)" }}>
            {path}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-semibold" style={{ color: "var(--accent-green)" }}>
            {strength}
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            strength
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
        {summary}
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="skill-badge text-xs">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function CompactItem({
  title,
  detail,
  tone,
}: {
  title: string;
  detail: string;
  tone: "high" | "medium" | "low";
}) {
  return (
    <article className="card p-4">
      <div className="flex items-start gap-3">
        <FileText size={17} style={{ color: toneColor(tone) }} />
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {detail}
          </p>
        </div>
      </div>
    </article>
  );
}

function SystemTile({
  title,
  status,
  body,
}: {
  title: string;
  status: "healthy" | "manual" | "offline";
  body: string;
}) {
  const icon =
    status === "healthy" ? CheckCircle2 : status === "manual" ? AlertTriangle : Activity;
  const Icon = icon;

  return (
    <article className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={17} style={{ color: statusColor(status) }} />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {body}
      </p>
    </article>
  );
}

function ConnectionPill({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs flex items-center justify-between"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: ok ? "var(--accent-green)" : "#d29922" }}>{detail}</span>
    </div>
  );
}

function ToolStatusBadge({ status }: { status: OsTool["status"] }) {
  const tone =
    status === "connected"
      ? "low"
      : status === "offline"
      ? "high"
      : status === "planned"
      ? "medium"
      : "neutral";
  return <StatusBadge label={status} tone={tone} />;
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "high" | "medium" | "low" | "neutral";
}) {
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{
        color: toneColor(tone),
        border: `1px solid ${toneColor(tone)}`,
        background: `${toneColor(tone)}18`,
      }}
    >
      {label}
    </span>
  );
}

function toneColor(tone: "high" | "medium" | "low" | "neutral") {
  if (tone === "high") return "#f85149";
  if (tone === "medium") return "#d29922";
  if (tone === "low") return "var(--accent-green)";
  return "var(--accent)";
}

function statusColor(status: "healthy" | "manual" | "offline") {
  if (status === "healthy") return "var(--accent-green)";
  if (status === "manual") return "#d29922";
  return "#f85149";
}
