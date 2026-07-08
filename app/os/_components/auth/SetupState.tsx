import Link from "next/link";
import { Database } from "lucide-react";
import { OWNER_EMAIL } from "../../_lib/config";
import { AuthFrame } from "./AuthFrame";

export function SetupState() {
  return (
    <AuthFrame
      icon={Database}
      title="Supabase setup required"
      subtitle="GitHub Pagesの静的OSシェルは準備済みです。認証とRLSデータを使うには公開用Supabase環境変数を設定してください。"
    >
      <div
        className="text-left rounded-lg p-4"
        style={{ background: "var(--bg-secondary)" }}
      >
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
