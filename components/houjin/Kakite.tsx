import Link from 'next/link';
import { UserRound } from 'lucide-react';

/**
 * 法人成りのページの「書いた人」（2026-11-20。オーナー了承）。
 * 法人口座・設立の登記のページは、運営会社の代表が自分で申し込んだ記録をもとにしている。
 * 税・銀行は信用を厳しく見られる分野なので、誰の経験かをページの上と下で示す。
 * ほかの分野（相続・保険）は今までどおり HenshuNote（編集部）のまま。
 */
export const KAKITE = {
  name: '森嶋 聖人',
  role: 'BlueAdventures合同会社 代表社員',
  x: 'https://x.com/mm_simori',
  company: 'https://blueadventures.jp/',
} as const;

/** 構造化データの author（Article に入れる） */
export const KAKITE_LD = {
  '@type': 'Person',
  name: KAKITE.name,
  jobTitle: '代表社員',
  worksFor: { '@type': 'Organization', name: 'BlueAdventures合同会社', url: KAKITE.company },
  sameAs: [KAKITE.x],
} as const;

/** 見出しのすぐ下の1行 */
export function KakiteLine() {
  return (
    <p className="flex items-center gap-1.5 text-[12px] text-slate-500">
      <UserRound size={14} aria-hidden="true" />
      <span>書いた人：{KAKITE.name}（{KAKITE.role}）</span>
    </p>
  );
}

/** ページの下の囲み */
export function KakiteNote() {
  return (
    <aside className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200" aria-label="このページを書いた人">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><UserRound size={18} aria-hidden="true" /></span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[11px] text-slate-500">このページを書いた人</span>
        <span className="text-[14px] font-black text-slate-900">{KAKITE.name}</span>
        <span className="text-[12px] text-slate-600">{KAKITE.role}</span>
        <span className="mt-1 text-[12px] leading-relaxed text-slate-600">2026年10月に合同会社を設立し、設立の登記と法人口座の申し込みを自分で行いました。法人口座は3つの銀行に申し込み、PayPay銀行で開設しています。このページは、そのときの記録と、銀行・法務局の公式の案内をもとに書いています。</span>
        <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px]">
          <a href={KAKITE.x} rel="me noopener" target="_blank" className="text-sky-800 underline underline-offset-2">X（@mm_simori）</a>
          <a href={KAKITE.company} rel="noopener" target="_blank" className="text-sky-800 underline underline-offset-2">運営会社</a>
          <Link href="/policy#ayamari" className="text-sky-800 underline underline-offset-2">作り方と誤りの連絡先</Link>
        </span>
      </span>
    </aside>
  );
}
