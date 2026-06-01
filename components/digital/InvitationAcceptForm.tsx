'use client';

/**
 * InvitationAcceptForm
 *
 * 連携者が招待を承認する際の入力フォーム。
 *
 * フロー：
 *   1. 連携者が「パスフレーズ」を 2 回入力（ご自身用の暗号鍵）
 *   2. クライアントで RSA-OAEP 4096bit 鍵ペアを生成
 *      （秘密鍵をパスフレーズで AES-GCM 包装）
 *   3. POST /api/digital/family/invitations/[token]/accept に
 *      公開鍵 + 包装済み秘密鍵を送信
 *   4. 成功時：オーナーがすでにサブスク中ならその場で連携成立
 *              未サブスクなら notice 表示（オーナーがカード登録すれば完全有効化）
 *
 * セキュリティ：パスフレーズと秘密鍵は **絶対にサーバーに送らない**。
 *              包装済みの秘密鍵だけが送信される。
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { generateRecipientKeypair } from '@/lib/crypto/envelope';

type Props = {
  token: string;
  recipientEmail: string;
  recipientName: string;
  ownerDisplayName: string | null;
  expiresAt: string;
};

const PASSPHRASE_MIN = 8;

export default function InvitationAcceptForm({
  token,
  recipientEmail,
  recipientName,
  ownerDisplayName,
  expiresAt,
}: Props) {
  const [passphrase, setPassphrase] = useState('');
  const [passphraseConfirm, setPassphraseConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [step, setStep] = useState<
    'idle' | 'generating_keys' | 'submitting' | 'done'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const ownerLabel = ownerDisplayName ?? '招待元の方';
  const expires = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(expiresAt));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 'generating_keys' || step === 'submitting') return;

    setError(null);

    // バリデーション
    if (!passphrase || passphrase.length < PASSPHRASE_MIN) {
      setError(`連携の合言葉は ${PASSPHRASE_MIN} 文字以上でご設定ください。`);
      return;
    }
    if (passphrase !== passphraseConfirm) {
      setError('連携の合言葉が一致しません。同じ文字列を 2 回ご入力ください。');
      return;
    }
    if (!agreed) {
      setError('注意事項にご同意のうえチェックを入れてください。');
      return;
    }

    try {
      // ① 鍵ペア生成（数秒かかる）
      setStep('generating_keys');
      const keypair = await generateRecipientKeypair(passphrase);

      // メモリ上のパスフレーズと keypair の生秘密鍵は二度と参照されないようすぐに変数から外す
      // （TypeScript の GC に依存するが、明示的に上書き）
      setPassphrase('');
      setPassphraseConfirm('');

      // ② API 送信
      setStep('submitting');
      const res = await fetch(
        `/api/digital/family/invitations/${encodeURIComponent(token)}/accept`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keypair }),
        }
      );
      const json = (await res.json()) as {
        ok: boolean;
        billing?: {
          status?: string;
          checkout_url?: string;
        };
        notice?: string;
        error?: string;
        detail?: string;
      };

      if (!res.ok || !json.ok) {
        const message =
          json.detail ??
          (json.error === 'email_mismatch'
            ? 'ログイン中のアカウントのメールアドレスと、招待先のメールアドレスが一致しません。招待されたメールアドレスでログインし直してください。'
            : json.error === 'expired'
              ? '招待の有効期限が切れています。招待元の方に再送をお願いしてください。'
              : json.error === 'revoked'
                ? 'この招待は取り消されています。'
                : json.error === 'already_accepted'
                  ? 'この招待はすでに承認されています。'
                  : '承認に失敗しました。時間をおいて再度お試しください。');
        setError(message);
        setStep('idle');
        return;
      }

      // ③ 成功（オーナー側のカード未登録の場合でも、連携自体は確立しているため
      //         連携者にはその情報を表示しない。オーナーが自身のダッシュボードで対応する）
      setStep('done');
      // 注：router.refresh() は呼ばない。
      //   ページ側でステータス再判定が走ると「accepted」分岐に入り、
      //   このフォームの「連携を承認しました」画面が「すでに承認されています」エラーで
      //   上書きされてしまうため。ユーザーは下部の「ダッシュボードへ」ボタンで遷移する。
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'unexpected_error';
      console.error('[InvitationAcceptForm] failed', detail);
      setError(`エラーが発生しました：${detail}`);
      setStep('idle');
    }
  }

  if (step === 'done') {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600">
            <CheckCircle2 className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-emerald-900">
            連携を承認しました
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900/90">
            {ownerLabel} さまとの連携を承認しました。
            <br />
            ご本人がご存命の間は情報は表示されません。ご本人が亡くなった事実が確認された後、
            大切な方への情報開示が行われます。
          </p>

          <Link
            href="/digital"
            className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            ダッシュボードへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 sm:p-6"
    >
      {/* 招待内容のサマリー */}
      <div className="rounded-xl bg-emerald-50 p-4 text-sm">
        <p className="font-semibold text-gray-900">
          {ownerLabel} さまからの招待
        </p>
        <dl className="mt-2 space-y-1 text-xs text-gray-700">
          <div className="flex gap-2">
            <dt className="text-gray-500">あなたの呼称</dt>
            <dd className="font-medium text-gray-900">{recipientName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-gray-500">あなたのメール</dt>
            <dd className="font-medium text-gray-900">{recipientEmail}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-gray-500">有効期限</dt>
            <dd className="font-medium text-gray-900">{expires}</dd>
          </div>
        </dl>
      </div>

      {/* 説明（簡潔に） */}
      <div className="text-sm leading-relaxed text-gray-700">
        <p className="flex items-start gap-2">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          <span>
            あなた専用の <b>連携の合言葉</b> を設定してください。
            この合言葉は当社のサーバーには送信されず、運営からも復元できません。
            紙にメモするなど、安全な方法で保管してください。
          </span>
        </p>
      </div>

      {/* パスフレーズ入力 */}
      <div>
        <label
          htmlFor="passphrase"
          className="mb-1 block text-xs font-medium text-slate-700"
        >
          連携の合言葉（{PASSPHRASE_MIN} 文字以上）
        </label>
        <input
          id="passphrase"
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          autoComplete="new-password"
          minLength={PASSPHRASE_MIN}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label
          htmlFor="passphrase_confirm"
          className="mb-1 block text-xs font-medium text-slate-700"
        >
          連携の合言葉（確認のためもう一度）
        </label>
        <input
          id="passphrase_confirm"
          type="password"
          value={passphraseConfirm}
          onChange={(e) => setPassphraseConfirm(e.target.value)}
          autoComplete="new-password"
          minLength={PASSPHRASE_MIN}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* 注意事項チェック */}
      <label className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-shrink-0"
        />
        <span className="leading-relaxed">
          連携の合言葉を忘れた場合、当社からも復元できないことを理解しました。
          この連携の合言葉は紙にメモするなど、安全な方法で保管します。
        </span>
      </label>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={step !== 'idle'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {step === 'generating_keys' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              準備中…（数秒お待ちください）
            </>
          )}
          {step === 'submitting' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              送信中…
            </>
          )}
          {step === 'idle' && (
            <>
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              連携の合言葉を設定して承認する
            </>
          )}
        </button>
      </div>
    </form>
  );
}
