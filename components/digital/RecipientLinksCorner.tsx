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
} from 'lucide-react';
import { formatJpDate } from '@/lib/digital/utils';
import type { DigitalFamilyLink } from '@/lib/digital/family';

export type RecipientLinkInfoLite = {
  link: DigitalFamilyLink;
  ownerDisplayName: string | null;
  ownerEmail: string | null;
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
        {links.map(({ link, ownerDisplayName, ownerEmail }) => {
          const canView = link.share_during_lifetime;
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

                {/* ステータスバッジ */}
                <div className="mt-2">
                  {canView ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2
                        className="h-3 w-3"
                        aria-hidden="true"
                      />
                      現在ご確認いただけます
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      ご本人ご存命中（非表示）
                    </span>
                  )}
                </div>
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

              {/* もしものとき：ご逝去のご報告 + ヘルプ導線 */}
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
            </li>
          );
        })}
      </ul>
    </section>
  );
}
