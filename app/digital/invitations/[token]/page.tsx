/**
 * /digital/invitations/[token] — 招待承認ページ
 *
 * 連携者が招待メール内のリンクをクリックして到達するページ。
 *
 * 動作：
 *   1. トークンで招待を取得（service_role 経由、招待先メール・呼称・有効期限を表示）
 *   2. 未ログインなら /login?next=/digital/invitations/[token] にリダイレクト
 *      （ログイン後に戻ってこられる）
 *   3. ログイン中のユーザーのメールが招待先と一致しなければ警告画面
 *   4. すでに承認・取消・期限切れなら状態に応じた画面
 *   5. 通常時は承認フォーム（パスフレーズ設定）を表示
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  getInvitationStatus,
  type DigitalFamilyInvitation,
} from '@/lib/digital/family';
import { getDisplayNameById } from '@/lib/digital/profile';
import InvitationAcceptForm from '@/components/digital/InvitationAcceptForm';

export const metadata: Metadata = {
  title: '大切な方からの連携のご案内 | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ token: string }> };

export default async function InvitationAcceptPage({ params }: Props) {
  const { token } = await params;

  // ① 認証チェック（未ログインなら login に飛ばす）
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const next = encodeURIComponent(`/digital/invitations/${token}`);
    redirect(`/login?next=${next}`);
  }

  // ② 招待を取得（service_role 経由：本人ではないので RLS を回避）
  const admin = createAdminSupabaseClient();
  const { data: invRow } = await admin
    .from('digital_family_invitations')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  const invitation = invRow as DigitalFamilyInvitation | null;

  // ③ トークンが見つからない
  if (!invitation) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ErrorCard
          icon="not-found"
          title="招待が見つかりません"
          message="このリンクは無効か、すでに削除されています。招待元の方に再度お送りいただくようご連絡ください。"
        />
      </div>
    );
  }

  // ④ 状態判定
  const status = getInvitationStatus(invitation);

  // 期限切れ
  if (status === 'expired') {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ErrorCard
          icon="clock"
          title="招待の有効期限が切れています"
          message="このリンクの有効期限を過ぎています。招待元の方に再送をお願いしてください（招待元の画面から「再送」ボタンで再度お送りいただけます）。"
        />
      </div>
    );
  }

  // 取消済み
  if (status === 'revoked') {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ErrorCard
          icon="x"
          title="この招待は取り消されています"
          message="招待元の方が、この招待を取り消されました。詳細は招待元の方へ直接ご確認ください。"
        />
      </div>
    );
  }

  // すでに承認済み
  //   フォーム送信直後と、後日メールリンクを再アクセスしたケースを区別できないため、
  //   ミスリードを避けるため /digital にそのままリダイレクトする。
  //   フォーム送信直後の成功表示は InvitationAcceptForm 側で行う。
  if (status === 'accepted') {
    redirect('/digital');
  }

  // ⑤ ログイン中ユーザーのメールが招待先と一致するか
  if (!user.email) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ErrorCard
          icon="alert"
          title="メールアドレス情報が取得できません"
          message="ご自身のアカウント設定をご確認のうえ、再度お試しください。"
        />
      </div>
    );
  }
  if (
    user.email.toLowerCase() !== invitation.recipient_email.toLowerCase()
  ) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ErrorCard
          icon="alert"
          title="メールアドレスが招待先と一致しません"
          message={`この招待は ${invitation.recipient_email} 宛にお送りされたものです。一度ログアウトのうえ、招待されたメールアドレス（${invitation.recipient_email}）でログインし直してから再度このページにお越しください。`}
          actionHref="/login?next=/digital/invitations/{token}"
          actionLabel="ログアウトしてやり直す"
        />
      </div>
    );
  }

  // ⑥ 自己招待を防止
  if (invitation.owner_user_id === user.id) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ErrorCard
          icon="alert"
          title="ご自身の招待は承認できません"
          message="この招待はご自身が発行されたものです。大切な方や信頼できる方へお渡しいただいたうえで、別のアカウントで承認していただく必要があります。"
        />
      </div>
    );
  }

  // ⑦ オーナーの display_name を取得
  const ownerProfile = await getDisplayNameById(admin, invitation.owner_user_id);
  const ownerDisplayName =
    ownerProfile?.display_name ?? ownerProfile?.preferred_name ?? null;

  // ⑧ 正常系：承認フォームを表示（新スタイル：bg-[#F5F5F0] + 白丸角カード）
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* 大見出し（中央寄せ、十分な余白） */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            連携のご案内
          </h1>
        </header>

        <div className="space-y-4">
        {/* 見出し */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-base font-semibold text-gray-900">
            {ownerDisplayName ?? '招待元の方'} さまから連携のご案内が届いています
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            もしものときに、必要な情報の連携先として指定されました。
            下のフォームで「連携の合言葉」をご設定のうえ、承認してください。
          </p>
        </section>

        {/* 安心の案内（簡潔に） */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="flex items-start gap-2 text-sm font-medium text-gray-900">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            今すぐ情報が見られるわけではありません
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            ご本人がご存命の間は、情報があなたに共有されることはありません。
            ご本人が亡くなった事実が確認された後、はじめて開示されます。
          </p>
        </section>

        {/* 承認フォーム */}
        <InvitationAcceptForm
          token={token}
          recipientEmail={invitation.recipient_email}
          recipientName={invitation.recipient_name}
          ownerDisplayName={ownerDisplayName}
          expiresAt={invitation.expires_at}
        />

        {/* 戻るリンク（下部） */}
        <div className="pt-4 text-center">
          <Link
            href="/digital"
            className="inline-flex items-center gap-1 text-sm text-emerald-600 active:opacity-70"
          >
            ← ダッシュボードに戻る
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function ErrorCard({
  icon,
  title,
  message,
  actionHref,
  actionLabel,
}: {
  icon: 'not-found' | 'clock' | 'x' | 'check' | 'alert';
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  const iconNode = {
    'not-found': (
      <XCircle className="h-7 w-7 text-slate-500" aria-hidden="true" />
    ),
    clock: <Clock className="h-7 w-7 text-amber-600" aria-hidden="true" />,
    x: <XCircle className="h-7 w-7 text-rose-600" aria-hidden="true" />,
    check: (
      <CheckCircle2 className="h-7 w-7 text-emerald-600" aria-hidden="true" />
    ),
    alert: (
      <AlertTriangle className="h-7 w-7 text-amber-600" aria-hidden="true" />
    ),
  }[icon];

  const bg = {
    'not-found': 'border-slate-200 bg-slate-50',
    clock: 'border-amber-200 bg-amber-50',
    x: 'border-rose-200 bg-rose-50',
    check: 'border-emerald-200 bg-emerald-50',
    alert: 'border-amber-200 bg-amber-50',
  }[icon];

  return (
    <div className={`rounded-2xl border p-6 sm:p-8 ${bg}`}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white">
          {iconNode}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{message}</p>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
