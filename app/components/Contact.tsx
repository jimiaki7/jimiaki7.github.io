"use client";

import { useState } from "react";
import { ExternalLinkIcon, GitBranchIcon, MailIcon, SendIcon } from "./Icons";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1000));
    const mailto = `mailto:asterworks3322@gmail.com?subject=${encodeURIComponent(
      `[Aster Works] ${form.name}からのお問い合わせ`
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
          Aster Works へのお問い合わせ
        </p>
        <div className="accent-line" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p
              className="text-base leading-relaxed mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Aster Worksのプロダクト、Webアプリ制作、URL診断・AI活用、
              小さなMVPの相談など、お気軽にご連絡ください。
              <br />
              <span className="text-sm opacity-75">
                Product work, web apps, AI-assisted workflows, and practical tools.
              </span>
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <MailIcon color="var(--accent)" size={16} />
                </div>
                <a
                  href="mailto:asterworks3322@gmail.com"
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  asterworks3322@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <GitBranchIcon color="var(--accent)" size={16} />
                </div>
                <a
                  href="https://github.com/Aster-Works"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  github.com/Aster-Works
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  <ExternalLinkIcon color="var(--accent)" size={16} />
                </div>
                <a
                  href="https://www.asterworks.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  www.asterworks.org
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
                placeholder="相談したい内容、作りたいツール、見てほしいサイトURLなどをお書きください。"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary w-full justify-center"
            >
              {status === "sending" ? (
                "送信中..."
              ) : status === "sent" ? (
                "送信しました / Sent!"
              ) : (
                <>
                  送信する / Send
                  <SendIcon size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
