/* ────────────────────────────────────────────────────────────────
 * 連携先コーナー（自分が recipient 側）
 *   - オーナーが自分を連携先に指定している場合、ここに一覧表示
 *   - 生前共有 ON → 「情報を見る」リンク
 *   - 生前共有 OFF → 「ご本人がご存命の間は閲覧できません」
 *   - 連携解除ボタン
 * ──────────────────────────────────────────────────────────────── */

import Link from 'next/link';
import { KeyRound, ArrowRight } from 'lucide-react';
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
      <div className="flex items-start gap-3 border-b border-violet-200/60 pb-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100">
          <KeyRound
            className="h-5 w-5 text-violet-700"
            aria-hidden="true"
          />
        </div>
        <div>
          <h2
            id="section-recipient-links"
            className="text-lg font-semibold text-slate-900"
          >
            あなたが連携先になっている方
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            以下の方からの連携を受けています。
            ご本人がお亡くなりになった事実が確認された後、登録された情報を閲覧いただけます。
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {links.map(({ link, ownerDisplayName, ownerEmail }) => {
          const canView = link.share_during_lifetime;
          // プライバシー配慮：連携者側には ON/OFF の事実を直接見せず、
          // 「いま見られるかどうか」だけを「現在ご確認いただけます／ご本人がお元気な間は表示されません」
          // という中立的な文言で表現する。ON/OFF を知っているのは本人と運営のみ。
          return (
            <li
              key={link.id}
              className="flex flex-col gap-3 rounded-xl border border-violet-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
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
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {canView
                    ? '現在ご確認いただけます。'
                    : 'ご本人がお元気な間は表示されません。お亡くなりになった事実が確認された後にお届けします。'}
                </p>
              </div>

              <div className="flex flex-shrink-0 flex-col gap-2 sm:items-end">
                {canView && (
                  <Link
                    href={`/digital/family/${link.owner_user_id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                  >
                    情報を見る
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
                <Link
                  href={`/digital/family/${link.owner_user_id}/death-notice`}
                  className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  逝去をご報告
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        ご本人がお亡くなりになった際は、各カードの「逝去をご報告」からお手続きください。
        運営での確認とご本人への最終確認を経て、連携先の皆さまに情報が開示されます。
      </p>
    </section>
  );
}
