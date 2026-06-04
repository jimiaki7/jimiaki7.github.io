"use client";

import { useState } from "react";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1000));
    const mailto = `mailto:jimiaki7@gmail.com?subject=${encodeURIComponent(
      `[Portfolio] ${form.name}からのお問い合わせ`
    )}&body=${encodeURIComponent(
      `名前 / Name: ${form.name}\nメール / Email: ${form.email}\n\n${form.message}`
    )}`;
    window.location.href = mailto;
    setStatus("sent");
  };

  return (
    <section
      id="contact"
      className="py-24"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="section-title">Contact</h2>
        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
          お問い合わせ
        </p>
        <div className="accent-line" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p
              className="text-base leading-relaxed mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              フリーランス案件のご依頼・ご相談はお気軽にどうぞ。
              <br />
              <span className="text-sm opacity-75">
                Feel free to reach out for freelance work or collaboration.
              </span>
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <a
                  href="mailto:jimiaki7@gmail.com"
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  jimiaki7@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>
                <a
                  href="https://github.com/jimiaki7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  github.com/jimiaki7
                </a>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name">お名前 / Name</label>
              <input
                id="name"
                type="text"
                required
                placeholder="山田 太郎 / Taro Yamada"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="email">メールアドレス / Email</label>
              <input
                id="email"
                type="email"
                required
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="message">メッセージ / Message</label>
              <textarea
                id="message"
                required
                rows={5}
                placeholder="ご依頼内容やご質問をお書きください。/ Please describe your project or question."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary w-full justify-center"
            >
              {status === "sending"
                ? "送信中..."
                : status === "sent"
                ? "送信しました / Sent!"
                : "送信する / Send"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
