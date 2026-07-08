"use client";

/**
 * ログイン案内パネル（マジックリンク送信）。チャット・マイページで共用（追加要件A/B）。
 */

import { useState } from "react";
import Link from "next/link";

const inputCls =
  "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-600";

export function LoginPanel({ loginError }: { loginError?: boolean }) {
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const requestLink = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setNotice("メールアドレスの形式をご確認ください。"); return; }
    setNotice(""); setBusy(true);
    try {
      await fetch("/api/shisan/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setLinkSent(true);
    } catch {
      setNotice("送信に失敗しました。時間をおいてお試しください。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pt-8 pb-24 text-slate-800">
      <h1 className="text-[20px] font-extrabold mb-1">会員ログイン</h1>
      <p className="text-[13px] text-slate-500 mb-4">
        ご登録のメールアドレスにログインリンクをお送りします。リンクを開くと、あなたの診断結果を知っているAIに相談できます。
      </p>
      {loginError && !linkSent && (
        <p className="text-[13px] text-red-600 mb-3">リンクが無効か、期限切れです。もう一度お送りします。</p>
      )}
      {linkSent ? (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
          送信しました。メールの「ログインして続きへ」からお戻りください。（届かない場合は迷惑メールもご確認ください）
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <input type="email" inputMode="email" autoComplete="email" className={`${inputCls} flex-1 min-w-[180px]`}
            placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} />
          <button type="button" onClick={requestLink} disabled={busy}
            className="px-3.5 py-2 rounded-lg text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap">
            {busy ? "送信中…" : "ログインリンクを送る"}
          </button>
        </div>
      )}
      {notice && <p className="text-[12px] text-red-600 mt-2">{notice}</p>}
      <p className="text-[12px] text-slate-400 mt-6">
        まだ登録していない方は、<Link href="/shisan" className="underline">診断</Link>のあと「無料ではじめる」から登録できます。
      </p>
    </main>
  );
}
