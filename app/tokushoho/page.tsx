import type { Metadata } from "next";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | Jimi Takaishi",
  description: "特定商取引法に基づく表記",
};

const rows: { label: string; value: string | React.ReactNode }[] = [
  { label: "販売業者", value: "Jimi Takaishi" },
  { label: "所在地", value: "請求があれば遅滞なく開示します" },
  { label: "電話番号", value: "請求があれば遅滞なく開示します" },
  { label: "メールアドレス", value: "jimiaki7@gmail.com" },
  { label: "サービス名", value: "Keryx Pro" },
  { label: "販売価格", value: "Pro プラン：¥300 / 月（税込）" },
  { label: "支払方法", value: "クレジットカード（Stripe 経由）" },
  { label: "支払時期", value: "申込み完了時にお支払いが確定します" },
  { label: "サービス提供時期", value: "決済完了後、直ちにご利用いただけます" },
  {
    label: "返品・キャンセルについて",
    value:
      "デジタルコンテンツの性質上、原則としてご返金はお受けできません。ただし、サービスに重大な瑕疵がある場合はご相談ください。サブスクリプションはいつでもキャンセル可能で、キャンセル後は当該期間末日まで引き続きご利用いただけます。",
  },
  {
    label: "動作環境",
    value: "最新バージョンの Chrome / Safari / Edge / Firefox を推奨します",
  },
];

export default function TokushohoPage() {
  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          特定商取引法に基づく表記
        </h1>
        <div className="w-12 h-0.5 mb-10 rounded" style={{ background: "var(--accent)" }} />

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0 px-6 py-4 ${
                i < rows.length - 1 ? "border-b" : ""
              }`}
              style={{
                borderColor: "var(--border)",
                background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-secondary)",
              }}
            >
              <dt
                className="text-sm font-semibold shrink-0 sm:w-44"
                style={{ color: "var(--text-secondary)" }}
              >
                {row.label}
              </dt>
              <dd className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                {row.value}
              </dd>
            </div>
          ))}
        </div>

        <p className="text-xs mt-8" style={{ color: "var(--text-secondary)" }}>
          ※ 所在地・電話番号の開示請求は{" "}
          <a
            href="mailto:jimiaki7@gmail.com"
            className="underline"
            style={{ color: "var(--accent)" }}
          >
            jimiaki7@gmail.com
          </a>{" "}
          までメールにてお送りください。遅滞なく開示いたします。
        </p>
      </main>
      <Footer />
    </>
  );
}
