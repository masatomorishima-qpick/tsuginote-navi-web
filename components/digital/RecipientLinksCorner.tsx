/* ────────────────────────────────────────────────────────────────
 * 連携先コーナー（自分が recipient 側）
 *   - オーナーが自分を連携先に指定している場合、ここに一覧表示
 *   - 生前共有 ON → 「情報を見る」リンク
 *   - 生前共有 OFF → 「ご本人ご存命中（非表示）」バッジ
 *   - 各カードに「もしものときは」セクション（ご逝去報告 + ヘルプ導線）
 *
 * 2026-06 改訂：
 *   - 「亡くなった事実が確認された後...」の説明テキスト重複（3 ヶ所）を削除
 *   - 「もしものときは」エリアを各カード末尾に独立配置（ボタン視認性 UP）
 *   - ヘルプページの #death-notice セクションへの直リンクを併設
 *   - ステータスをバッジ化（緑：閲覧可能 / グレー：ご存命中）
 * ──────────────────────────────────────────────────────────────── */

import Link from 'next/link';
import {
  KeyRound,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  ShieldOff,
  UserCheck,
} from 'lucide-react';
import { formatJpDate } from '@/lib/digital/utils';
import type { DigitalFamilyLink } from '@/lib/digital/family';
import DeathNoticeCancelButton from '@/components/digital/DeathNoticeCancelButton';

/** 通報者本人が取り消せる時間：24h（lib/digital/deathNotice.ts と同期）*/
const NOTIFIER_SELF_CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

export type RecipientLinkInfoLite = {
  link: DigitalFamilyLink;
  ownerDisplayName: string | null;
  ownerEmail: string | null;
  /**
   * 当該 owner についての最新の死亡通知の状態。
   * 通知が無ければ null。pending / awaiting_objection_period の場合は
   * 「ご逝去をご報告する」ボタンを差し止め、進捗カードを出す。
   * rejected の場合は「取り下げとなりました」、disclosed の場合は閲覧導線。
   */
  latestDeathNotice?: {
    id: string;
    status:
      | 'pending'
      | 'awaiting_objection_period'
      | 'rejected'
      | 'disclosed';
    reportedDeathDate: string;
    objectionDeadline: string | null;
    objectionAt: string | null;
    opsRejectedReason: string | null;
    createdAt: string;
    /** 当該通知の申請者がログインユーザー本人か（取り消しボタン表示判定）*/
    isOwnNotice: boolean;
    /**
     * status='rejected' のとき、その理由が「通報者本人による取り消し」かどうか。
     * UI 文言を「申請を受理されませんでした」(ops 却下) と
     * 「申請をキャンセルしました」(self cancel) で分けるための判定フラグ。
     */
    cancelledByNotifier: boolean;
  } | null;
};

export default function RecipientLinksCorner({
  links,
}: {
  links: RecipientLinkInfoLite[];
}) {
  return (
    <section
      aria-labelledby="section-recipient-links"
      className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5 sm:p-6"
    >
      {/* ヘッダー：簡潔に。詳細は各カード内とヘルプリンクに集約 */}
      <div className="flex items-start gap-3 border-b border-violet-200/60 pb-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100">
          <KeyRound className="h-5 w-5 text-violet-700" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h2
            id="section-recipient-links"
            className="text-lg font-semibold text-slate-900"
          >
            あなたが連携先になっている方
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            以下の方から情報の連携を受けています。
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {links.map(({ link, ownerDisplayName, ownerEmail, latestDeathNotice }) => {
          // 開示済み（ご逝去確認後）も「閲覧可能」状態に含める。
          // これにより、生前共有 OFF の連携先でも開示後は同じ導線（バッジ＋ボタン）で
          // 情報にアクセスでき、別途「開示されました」カードを重ねる必要がなくなる。
          const isDisclosed = latestDeathNotice?.status === 'disclosed';
          const canView = link.share_during_lifetime || isDisclosed;
          // プライバシー配慮：share_during_lifetime の事実を直接見せず、
          // 「いま見られるかどうか」だけを中立的な文言で表現する。
          return (
            <li
              key={link.id}
              className="rounded-xl border border-violet-200 bg-white p-4"
            >
              {/* オーナー情報 */}
              <div>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {ownerDisplayName ?? '（お名前未登録）'} さま
                </p>
                {ownerEmail && (
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {ownerEmail}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  連携開始日：{formatJpDate(link.created_at)}
                </p>

                {/* ステータスバッジ
                    ・ 生前共有 ON で閲覧可能なときのみ表示
                    ・「ご本人ご存命中（非表示）」のような恒常表示は
                      通常状態を毎日見せる必要が薄く、UI ノイズになるため削除
                    ・ 状況に変化（死亡通知あり）があれば後段の DeathNoticeStatusCard
                      で目立つカードを出す */}
                {canView && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2
                        className="h-3 w-3"
                        aria-hidden="true"
                      />
                      {isDisclosed
                        ? '情報が開示されました'
                        : '現在ご確認いただけます'}
                    </span>
                  </div>
                )}
              </div>

              {/* 閲覧用ボタン（canView 時のみ） */}
              {canView && (
                <div className="mt-3">
                  <Link
                    href={`/digital/family/${link.owner_user_id}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    情報を見る
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              )}

              {/* 死亡通知の進捗・結果カード（通知が存在する場合）*/}
              {latestDeathNotice && (
                <DeathNoticeStatusCard
                  ownerId={link.owner_user_id}
                  notice={latestDeathNotice}
                />
              )}

              {/* もしものとき：通知が無いとき、または却下/disclosed のときに表示
                  pending / awaiting_objection_period のときは「報告する」ボタンを
                  二重に出さないよう非表示にする */}
              {(!latestDeathNotice ||
                latestDeathNotice.status === 'rejected') && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-700">
                      もしものときは
                    </p>
                    <Link
                      href="/digital/settings/help#death-notice"
                      className="inline-flex items-center gap-0.5 text-xs text-violet-600 hover:underline"
                    >
                      手順を見る
                      <ChevronRight
                        className="h-3 w-3"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                  <Link
                    href={`/digital/family/${link.owner_user_id}/death-notice`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    ご逝去をご報告する
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * 死亡通知の進捗・結果を表示する小カード（連携相手向け）。
 *
 * 表示分岐：
 *   - pending                   → 書類確認中（運営対応待ち）
 *   - awaiting_objection_period → ご本人への最終確認中（〜M月D日）
 *   - rejected                  → 取り下げ済み（理由が分かれば併記）
 *   - disclosed                 → 開示済み（情報閲覧へ）
 *
 * 各状態で「詳細を見る」ボタンから /digital/family/[ownerId]/death-notice
 * に遷移できる（ownerId 側の page.tsx で詳細を表示）。
 */
function DeathNoticeStatusCard({
  ownerId,
  notice,
}: {
  ownerId: string;
  notice: NonNullable<RecipientLinkInfoLite['latestDeathNotice']>;
}) {
  const detailHref = `/digital/family/${ownerId}/death-notice`;

  if (notice.status === 'pending') {
    // 通報者本人かつ申請から 24h 以内なら取り消しボタンを出す
    const elapsedMs = Date.now() - new Date(notice.createdAt).getTime();
    const canSelfCancel =
      notice.isOwnNotice && elapsedMs < NOTIFIER_SELF_CANCEL_WINDOW_MS;
    return (
      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <Clock
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-slate-900">
              死亡通知：書類確認中
            </p>

            {/* あなたが申請者であることをバッジで明示
                自分が出した申請であることをひと目で認識できるよう、
                短く「申請者です」と表示。*/}
            {notice.isOwnNotice && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800">
                <UserCheck className="h-3 w-3" aria-hidden="true" />
                申請者です
              </span>
            )}

            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              運営にて 5 営業日以内に書類を確認します。
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href={detailHref}
                className="inline-flex items-center gap-0.5 text-sm font-medium text-violet-700 hover:underline"
              >
                詳細を見る
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              {canSelfCancel && (
                <DeathNoticeCancelButton noticeId={notice.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notice.status === 'awaiting_objection_period') {
    const deadlineLabel = notice.objectionDeadline
      ? new Date(notice.objectionDeadline).toLocaleDateString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;
    return (
      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <Clock
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-slate-900">
              死亡通知：ご本人への最終確認中
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
              {deadlineLabel ? (
                <>
                  <b className="text-slate-900">{deadlineLabel}</b> まで異議申立がなければ、ご情報が開示されます。
                </>
              ) : (
                'ご本人への最終確認期間中です。'
              )}
            </p>
            <Link
              href={detailHref}
              className="mt-3 inline-flex items-center gap-0.5 text-sm font-medium text-violet-700 hover:underline"
            >
              詳細を見る
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (notice.status === 'rejected') {
    // 取り下げの 3 ケース：
    //   ① 通報者本人による取り消し（pending 中に自分でキャンセル）
    //   ② ご本人からの異議申立（awaiting_objection_period 中）
    //   ③ 運営による書類不備等の却下
    // それぞれ理由が違うので文言を分ける（同じ文言だとミスリードになる）
    if (notice.cancelledByNotifier) {
      // 通報者本人による取り消し：簡潔な一行表示
      // （自分でキャンセルした人にとっては自明な内容なので最小限）
      return (
        <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <ShieldOff
              className="h-5 w-5 flex-shrink-0 text-slate-600"
              aria-hidden="true"
            />
            <p className="text-base font-semibold text-slate-900">
              逝去申請をキャンセルしました
            </p>
          </div>
        </div>
      );
    }

    const isOwnerObjection = !!notice.objectionAt;
    return (
      <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldOff
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-600"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-slate-900">
              {isOwnerObjection
                ? '逝去申請は取り下げとなりました'
                : '逝去申請は受理されませんでした'}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
              {isOwnerObjection
                ? 'ご本人からのお返事により取り下げとなりました。'
                : '運営による書類確認の結果、申請を受理できませんでした。'}
            </p>
            {/* 「詳細を見る」リンクは置かない：
                rejected 状態の遷移先は再申請フォーム（/digital/family/[ownerId]/death-notice）であり、
                下段に表示される「ご逝去をご報告する」ボタンと同じ画面に飛ぶため重複する。
                取り下げ後は次の行動（再申請 or 何もしない）が下段ボタンで完結する。 */}
          </div>
        </div>
      </div>
    );
  }

  // disclosed：
  //   開示済みは上段のステータスバッジ「情報が開示されました」＋紫の「情報を見る」
  //   ボタンで導線が完結するため、ここで別カードを重ねない（重複排除）。
  return null;
}
