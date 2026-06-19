'use client';

/**
 * FamilyInvitePanel
 *
 * /digital/share の「大切な方に共有」セクション本体。
 *
 * 機能：
 *   - 現在の連携状況一覧（active な family_links）
 *     - 各行：呼称、メール、生前共有 ON/OFF トグル、解除ボタン
 *   - 未承認の招待一覧（pending）
 *     - 各行：呼称、メール、有効期限、招待取消ボタン
 *   - 「+ 新しく招待する」フォーム
 *     - 相手メール、呼称、（初回のみ）あなたのお名前
 *
 * 承認課金モデル：
 *   - 招待を作成しても課金されない
 *   - 連携者が承認した瞬間に Stripe quantity +1 で課金開始（30 日トライアル中は無料）
 */

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Clock,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react';
import type {
  DigitalFamilyInvitation,
  DigitalFamilyLink,
} from '@/lib/digital/family';
import ConfirmDialog from './ConfirmDialog';
import Toast, { type ToastVariant } from './Toast';
import { sendGA4Event } from '@/lib/analytics/ga4';

/**
 * 確認ダイアログの状態（discriminated union）。
 * 同時に複数のダイアログは開かない前提で 1 つの state に集約。
 */
type DialogState =
  | { type: 'none' }
  | { type: 'revoke_invitation'; invitation: DigitalFamilyInvitation }
  | {
      type: 'revoke_link';
      linkId: string;
      recipientName: string | null;
      isLast: boolean;
    };

type Props = {
  initialLinks: DigitalFamilyLink[];
  initialInvitations: DigitalFamilyInvitation[];
  ownerHasDisplayName: boolean;
  maxLinks: number;
  maxPendingInvitations: number;
};

type InvitationStatus = 'pending' | 'expired' | 'accepted' | 'revoked';

function getInvitationStatus(
  inv: Pick<DigitalFamilyInvitation, 'accepted_at' | 'revoked_at' | 'expires_at'>
): InvitationStatus {
  if (inv.revoked_at) return 'revoked';
  if (inv.accepted_at) return 'accepted';
  if (new Date(inv.expires_at).getTime() <= Date.now()) return 'expired';
  return 'pending';
}

function formatJaDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export default function FamilyInvitePanel({
  initialLinks,
  initialInvitations,
  ownerHasDisplayName,
  maxLinks,
  maxPendingInvitations,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [links, setLinks] = useState<DigitalFamilyLink[]>(initialLinks);
  const [invitations, setInvitations] =
    useState<DigitalFamilyInvitation[]>(initialInvitations);

  const activeLinks = links.filter((l) => l.status === 'active');
  const pendingInvitations = invitations.filter(
    (i) => getInvitationStatus(i) === 'pending'
  );

  // 確認ダイアログの状態（招待取消 / 連携解除）
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });

  // Toast 通知（alert() の代わり）
  const [toast, setToast] = useState<{
    message: string;
    variant: ToastVariant;
  } | null>(null);

  function notify(message: string, variant: ToastVariant = 'info') {
    setToast({ message, variant });
  }

  // フォームの開閉
  const [showForm, setShowForm] = useState(false);

  // 「+ 新しく招待する」フォーム
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formOwnerName, setFormOwnerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mailFallbackUrl, setMailFallbackUrl] = useState<string | null>(null);
  const [needDisplayName, setNeedDisplayName] = useState(!ownerHasDisplayName);

  const canInviteMore =
    activeLinks.length < maxLinks &&
    pendingInvitations.length < maxPendingInvitations;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);

    if (needDisplayName && !formOwnerName.trim()) {
      setSubmitError('「あなたのお名前」のご入力をお願いします。');
      return;
    }
    if (!formEmail.trim() || !formName.trim()) {
      setSubmitError('「メールアドレス」と「呼称」の両方をご入力ください。');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/digital/family/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: formEmail.trim(),
          recipient_name: formName.trim(),
          owner_display_name: needDisplayName ? formOwnerName.trim() : undefined,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        invitation?: DigitalFamilyInvitation;
        is_resend?: boolean;
        mail_status?: string;
        accept_url?: string;
        error?: string;
        detail?: string;
      };

      if (!res.ok || !json.ok || !json.invitation) {
        setSubmitError(
          json.detail ?? '招待の発行に失敗しました。時間をおいて再度お試しください。'
        );
        setSubmitting(false);
        return;
      }

      // GA4：招待送信（キーイベント #33）
      sendGA4Event('digital_invite_sent');

      // 一覧に反映
      setInvitations((prev) => {
        // 同じ id があれば置換、無ければ追加
        const idx = prev.findIndex((p) => p.id === json.invitation!.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = json.invitation!;
          return copy;
        }
        return [json.invitation!, ...prev];
      });
      setFormEmail('');
      setFormName('');
      setNeedDisplayName(false); // 一度入力したらフォームから消す
      setShowForm(false);
      setSubmitting(false);
      setMailFallbackUrl(null);

      // メール送信失敗時のフォールバック：URL を表示してオーナーが手動で渡せるようにする
      if (json.mail_status && json.mail_status !== 'sent') {
        setMailFallbackUrl(json.accept_url ?? null);
      }

      // サーバー側の最新状態を再取得（Stripe Checkout など他の状態反映のため）
      startTransition(() => router.refresh());
    } catch (err) {
      console.error('[FamilyInvitePanel] submit failed', err);
      setSubmitError('ネットワークエラーが発生しました。');
      setSubmitting(false);
    }
  }

  /** 招待取消の確認ダイアログを開く */
  function handleRevokeInvitation(invitation: DigitalFamilyInvitation) {
    setDialog({ type: 'revoke_invitation', invitation });
  }

  /** 招待取消の実行（ダイアログから呼ばれる） */
  async function executeRevokeInvitation(invitation: DigitalFamilyInvitation) {
    const res = await fetch(
      `/api/digital/family/invitations/${encodeURIComponent(invitation.token)}`,
      { method: 'DELETE' }
    );
    const json = (await res.json()) as { ok: boolean; detail?: string };
    if (!res.ok || !json.ok) {
      throw new Error(json.detail ?? '招待の取り消しに失敗しました。');
    }
    setInvitations((prev) =>
      prev.map((i) =>
        i.id === invitation.id
          ? { ...i, revoked_at: new Date().toISOString() }
          : i
      )
    );
    setDialog({ type: 'none' });
  }

  async function handleResendInvitation(invitation: DigitalFamilyInvitation) {
    try {
      const res = await fetch('/api/digital/family/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: invitation.recipient_email,
          recipient_name: invitation.recipient_name,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        invitation?: DigitalFamilyInvitation;
        is_resend?: boolean;
        mail_status?: string;
        detail?: string;
      };
      if (!res.ok || !json.ok || !json.invitation) {
        notify(json.detail ?? '招待メールの再送に失敗しました。', 'danger');
        return;
      }
      setInvitations((prev) =>
        prev.map((i) => (i.id === json.invitation!.id ? json.invitation! : i))
      );
      notify('招待メールを再送しました', 'success');
    } catch (err) {
      console.error('[FamilyInvitePanel] resend failed', err);
      notify('ネットワークエラーが発生しました', 'danger');
    }
  }

  async function handleToggleLifetimeShare(
    linkId: string,
    nextEnabled: boolean
  ) {
    try {
      const res = await fetch(`/api/digital/family/links/${linkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ share_during_lifetime: nextEnabled }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        link?: DigitalFamilyLink;
        detail?: string;
      };
      if (!res.ok || !json.ok || !json.link) {
        notify(json.detail ?? '生前共有の切り替えに失敗しました。', 'danger');
        return;
      }
      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? json.link! : l))
      );
      notify(
        nextEnabled ? '生前共有を ON にしました' : '生前共有を OFF にしました',
        'success'
      );
    } catch (err) {
      console.error('[FamilyInvitePanel] toggle failed', err);
      notify('ネットワークエラーが発生しました', 'danger');
    }
  }

  /** 連携解除の確認ダイアログを開く */
  function handleRevokeLink(linkId: string, recipientName: string | null) {
    const isLast = activeLinks.length === 1;
    setDialog({ type: 'revoke_link', linkId, recipientName, isLast });
  }

  /** 連携解除の実行（ダイアログから呼ばれる） */
  async function executeRevokeLink(linkId: string) {
    const res = await fetch(`/api/digital/family/links/${linkId}`, {
      method: 'DELETE',
    });
    const json = (await res.json()) as { ok: boolean; detail?: string };
    if (!res.ok || !json.ok) {
      throw new Error(json.detail ?? '連携の解除に失敗しました。');
    }
    setLinks((prev) =>
      prev.map((l) =>
        l.id === linkId
          ? { ...l, status: 'revoked', revoked_at: new Date().toISOString() }
          : l
      )
    );
    setDialog({ type: 'none' });
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-5">
      {/* メール送信失敗フォールバック：URL を手動コピーで渡せるように */}
      {mailFallbackUrl && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <AlertCircle
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="font-semibold">
                招待は作成されましたが、メール自動送信ができませんでした
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800/90">
                下の URL をご自身でコピーし、相手に LINE・メール等でお伝えください。
                <br />
                ※ この URL は招待元の方（あなた）以外には表示されません。
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  readOnly
                  value={mailFallbackUrl}
                  className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-slate-700"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(mailFallbackUrl);
                      notify('URL をコピーしました', 'success');
                    } catch {
                      notify(
                        'コピーに失敗しました。URL を手動で選択してください',
                        'danger'
                      );
                    }
                  }}
                  className="inline-flex flex-shrink-0 items-center justify-center gap-1 rounded-full bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  コピー
                </button>
                <button
                  type="button"
                  onClick={() => setMailFallbackUrl(null)}
                  className="inline-flex flex-shrink-0 items-center justify-center rounded-full border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-100"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* サマリー：現在の状況 */}
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p>
          連携中：
          <b className="ml-1 text-slate-900">{activeLinks.length}</b> 名
          <span className="ml-3 text-slate-500">
            （上限 {maxLinks} 名）
          </span>
          {pendingInvitations.length > 0 && (
            <>
              <span className="mx-2 text-slate-300">/</span>
              承認待ち：
              <b className="ml-1 text-amber-700">{pendingInvitations.length}</b> 件
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          月額：連携が成立した時点で 1 名あたり ¥110（税込）/月。最初の招待から 30 日間は無料です。
        </p>
      </div>

      {/* 連携中の一覧 */}
      {activeLinks.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            連携中の方
          </h3>
          <ul className="space-y-2">
            {activeLinks.map((link) => (
              <li
                key={link.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <UserRound
                      className="h-4 w-4 text-emerald-700"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {link.recipient_name ?? '（呼称未設定）'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      連携開始日：{formatJaDate(link.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={link.share_during_lifetime}
                      onChange={(e) =>
                        handleToggleLifetimeShare(link.id, e.target.checked)
                      }
                      className="h-3.5 w-3.5"
                    />
                    生前共有
                    <span
                      className={
                        link.share_during_lifetime
                          ? 'rounded-full bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-700'
                          : 'rounded-full bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500'
                      }
                    >
                      {link.share_during_lifetime ? 'ON' : 'OFF'}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRevokeLink(link.id, link.recipient_name)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                    解除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 承認待ち一覧 */}
      {pendingInvitations.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            承認待ちの招待
          </h3>
          <ul className="space-y-2">
            {pendingInvitations.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Mail
                      className="h-4 w-4 text-amber-700"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {inv.recipient_name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-600">
                      {inv.recipient_email}
                    </p>
                    <p className="mt-0.5 text-xs text-amber-800">
                      <Clock
                        className="mr-1 inline h-3 w-3"
                        aria-hidden="true"
                      />
                      有効期限：{formatJaDate(inv.expires_at)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleResendInvitation(inv)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    再送
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRevokeInvitation(inv)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                  >
                    <XCircle className="h-3 w-3" aria-hidden="true" />
                    取消
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 招待フォーム or ボタン */}
      <div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            disabled={!canInviteMore}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            大切な方を招待する
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
          >
            <h3 className="text-sm font-semibold text-slate-700">
              新しく招待する
            </h3>

            {needDisplayName && (
              <div>
                <label
                  htmlFor="owner_display_name"
                  className="mb-1 block text-xs font-medium text-slate-700"
                >
                  あなたのお名前（招待メールに表示されます）
                </label>
                <input
                  id="owner_display_name"
                  type="text"
                  value={formOwnerName}
                  onChange={(e) => setFormOwnerName(e.target.value)}
                  placeholder="例：山田 太郎"
                  maxLength={60}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                <p className="mt-1 text-xs text-slate-500">
                  招待メールで「{`{あなたのお名前}`} さまから…」のように表示されます。一度ご入力いただくと、次回以降の招待では省略できます。
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="recipient_email"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                招待する方のメールアドレス
              </label>
              <input
                id="recipient_email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="例：hanako@example.com"
                maxLength={254}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="recipient_name"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                呼称（お渡し相手をどう呼ぶか）
              </label>
              <input
                id="recipient_name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="例：妻、長男、信頼している友人"
                maxLength={30}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              <p className="mt-1 text-xs text-slate-500">
                大切な方（ご家族・ご親族・親しいご友人など、信頼できる方）をご指定ください。
              </p>
            </div>

            {submitError && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSubmitError(null);
                }}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Mail className="h-4 w-4" aria-hidden="true" />
                )}
                {submitting ? '招待メール送信中…' : '招待メールを送信'}
              </button>
            </div>
          </form>
        )}

        {!canInviteMore && (
          <p className="mt-2 text-xs text-slate-500">
            {activeLinks.length >= maxLinks
              ? `連携相手は最大 ${maxLinks} 名までです。新しく招待するには既存の連携を解除してください。`
              : `承認待ちの招待が ${maxPendingInvitations} 件に達しています。古い招待を取り消すか、相手の承認をお待ちください。`}
          </p>
        )}
      </div>

      {/* 仕組みの詳細はヘルプへ */}
      <p className="text-xs text-slate-500">
        招待から開示までの仕組みは
        <Link
          href="/digital/settings/help"
          className="mx-1 underline hover:text-slate-700"
        >
          ヘルプページ
        </Link>
        をご覧ください。
      </p>

      {/* Toast 通知（alert() の代わり） */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}

      {/* 招待取消の確認ダイアログ */}
      {dialog.type === 'revoke_invitation' && (
        <ConfirmDialog
          open
          title="招待を取り消しますか？"
          description={[
            `${dialog.invitation.recipient_name} さま宛の招待を取り消します。`,
            '取り消し後、この招待リンクは無効になります。同じ方を再度招待することは可能です。',
          ]}
          confirmLabel="招待を取り消す"
          cancelLabel="キャンセル"
          variant="default"
          onClose={() => setDialog({ type: 'none' })}
          onConfirm={() => executeRevokeInvitation(dialog.invitation)}
        />
      )}

      {/* 連携解除（複数残）の確認ダイアログ */}
      {dialog.type === 'revoke_link' && !dialog.isLast && (
        <ConfirmDialog
          open
          title="連携を解除しますか？"
          description={`${dialog.recipientName ? `「${dialog.recipientName}」` : 'この方'} との連携を解除します。`}
          confirmLabel="連携を解除する"
          cancelLabel="キャンセル"
          variant="default"
          onClose={() => setDialog({ type: 'none' })}
          onConfirm={() => executeRevokeLink(dialog.linkId)}
        />
      )}

      {/* 連携解除（最後の 1 件）の確認ダイアログ：プラン変更を伴うので warning + チェック */}
      {dialog.type === 'revoke_link' && dialog.isLast && (
        <ConfirmDialog
          open
          title="最後の連携相手を解除しますか？"
          description={[
            `${dialog.recipientName ? `「${dialog.recipientName}」` : 'この方'} は最後の連携相手です。`,
            '解除すると、現在のご契約期間の終了時に有料プランが終了し、無料プランに切り替わります。期間中はサービスを引き続きご利用いただけます。',
            'また、期間中に新しい連携先を招待・承認いただくと、自動的に有料プランを継続できます。',
          ]}
          confirmLabel="解除する"
          cancelLabel="キャンセル"
          variant="warning"
          requireAcknowledge="現在の期間終了で有料プランが終了することを理解しました"
          onClose={() => setDialog({ type: 'none' })}
          onConfirm={() => executeRevokeLink(dialog.linkId)}
        />
      )}
    </div>
  );
}
