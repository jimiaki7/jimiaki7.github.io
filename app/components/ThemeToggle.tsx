"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
const ORDER: Theme[] = ["light", "dark", "system"];
const LABEL: Record<Theme, string> = {
  light: "ライト",
  dark: "ダーク",
  system: "システム設定",
};
const ICON: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

// localStorage を外部ストアとして useSyncExternalStore で購読する。
// 同一タブでの書き込みは "storage" イベントが発火しないため、購読者へ手動通知する。
const listeners = new Set<() => void>();

function readTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

function getServerTheme(): Theme {
  // プリレンダ時は window に触れない。初期描画は system 相当の見た目でよい。
  return "system";
}

// 同一タブは writeTheme が listeners を叩く。別タブでの変更は "storage" が拾う。
function onStorage(event: StorageEvent) {
  if (event.key === null || event.key === STORAGE_KEY) {
    listeners.forEach((listener) => listener());
  }
}

function subscribe(callback: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("storage", onStorage);
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function writeTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  listeners.forEach((listener) => listener());
}

function resolve(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerTheme);

  // 外部システム（DOM）へ現在のReact状態を反映。system時はOS設定変更にも追従する。
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolve(theme));
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () =>
      document.documentElement.setAttribute("data-theme", resolve("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const cycle = useCallback(() => {
    writeTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]);
  }, [theme]);

  const Icon = ICON[theme];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`テーマ切り替え（現在: ${LABEL[theme]}）`}
      title={`テーマ: ${LABEL[theme]}`}
      className="nav-link inline-flex items-center justify-center w-9 h-9 rounded-lg border shrink-0"
      style={{ borderColor: "var(--border)" }}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}
