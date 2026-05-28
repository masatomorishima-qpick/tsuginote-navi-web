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
  ChevronRight,
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
  if (status === 'accepted') {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <ErrorCard
          icon="check"
          title="この招待はすでに承認されています"
          message="連携はすでに完了しています。ダッシュボードから現状をご確認いただけます。"
          actionHref="/digital"
          actionLabel="ダッシュボードへ"
        />
      </div>
    );
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

  // ⑧ 正常系：承認フォームを表示
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      {/* パンくず（簡易） */}
      <nav
        aria-label="パンくず"
        className="flex items-center gap-1 text-xs text-slate-500"
      >
        <Link href="/digital" className="hover:text-emerald-700 hover:underline">
          ダッシュボード
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-slate-700">連携承認</span>
      </nav>

      {/* 見出し */}
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          大切な方からの連携のご案内
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {ownerDisplayName ?? '招待元の方'} さまから、もしものときに必要な情報の連携先としてあなたが指定されました。
          連携の合言葉をご設定のうえ、連携の承認手続きを完了してください。
        </p>
      </header>

      {/* 内容の説明 */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-sm text-emerald-900">
        <p className="flex items-start gap-2 font-semibold">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          今すぐ何かが見られるわけではありません
        </p>
        <p className="mt-2 leading-relaxed text-emerald-800/90">
          ご本人がご存命の間は、{ownerDisplayName ?? '招待元の方'} さまの情報があなたに共有されることはありません。
          ご本人が亡くなった事実が確認された後、はじめて開示されます。
          （ご本人が「生前から共有」を ON にした場合のみ、生前から閲覧可能になります）
        </p>
      </div>

      {/* 承認フォーム */}
      <InvitationAcceptForm
        token={token}
        recipientEmail={invitation.recipient_email}
        recipientName={invitation.recipient_name}
        ownerDisplayName={ownerDisplayName}
        expiresAt={invitation.expires_at}
      />
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
