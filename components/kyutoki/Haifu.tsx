import Link from 'next/link';
import { Check, ClipboardCheck, Download, FileSpreadsheet, FileText, Gauge, Receipt } from 'lucide-react';
import PartnerLink from '@/components/kyutoki/PartnerLink';

/**
 * 給湯器の配布物（無料の表）と、記事の出口（紹介先）。2026-11-04 新設。
 * 11/4 夕方：B の受け皿への入口は外した（B は業者が決まるまで売上が立たず、出口が2つあると訪問者が迷うため）。
 *
 * 配布物の中身は lib/kyutoki/haifu-data.json が唯一の元。ファイルは scripts/kyutoki/make_haifu.py で作る。
 * 検索で上がっている型（保険の一覧表のエクセル）に合わせ、ページの上の方にダウンロードを置く（docs/kyutoki-seo/plan.md）。
 * 押されたかは LpViewTracker の lp_internal_click（同じサイトへのリンク）で取れる。
 */

export const HAIFU = {
  hiyou: {
    icon: Receipt,
    h: '費用の目安表',
    s: '種類・号数・置き場所ごとの総額',
    page: '/kyutoki/kokan-hiyou',
    files: [
      { label: 'エクセル', href: '/downloads/kyutoki-hiyou-meyasu.xlsx', icon: FileSpreadsheet },
      { label: 'PDF', href: '/downloads/kyutoki-hiyou-meyasu.pdf', icon: FileText },
    ],
  },
  check: {
    icon: ClipboardCheck,
    h: '見積もりの見方チェック表',
    s: '見積書で確かめる10か所',
    page: '/kyutoki/mitsumori-mikata',
    files: [
      { label: 'エクセル', href: '/downloads/kyutoki-mitsumori-check.xlsx', icon: FileSpreadsheet },
      { label: 'PDF', href: '/downloads/kyutoki-mitsumori-check.pdf', icon: FileText },
    ],
  },
  gosu: {
    icon: Gauge,
    h: '号数の選び方の表',
    s: '人数と、同時に使う場所の数で',
    page: '/kyutoki/gosu-erabikata',
    files: [{ label: 'PDF', href: '/downloads/kyutoki-gosu.pdf', icon: FileText }],
  },
} as const;

export type HaifuKey = keyof typeof HAIFU;

/** ダウンロードの札（このページの表を大きく、ほかの2つは小さく） */
export function HaifuDownload({ main, others = [] }: { main: HaifuKey; others?: HaifuKey[] }) {
  const m = HAIFU[main];
  const MI = m.icon;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 ring-1 ring-sky-200">
            <MI size={24} aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="text-[17px] font-black text-slate-900">{m.h}<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></span>
            <span className="text-[12px] text-slate-600">{m.s}</span>
          </span>
        </div>
        <div className="flex gap-2">
          {m.files.map(({ label, href, icon: FI }) => (
            <a
              key={href}
              href={href}
              download
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800"
            >
              <FI size={18} aria-hidden="true" />
              {label}
              <Download size={16} aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません</p>
      </div>
      {others.length > 0 && (
        <ul className="grid gap-2" style={{ gridTemplateColumns: `repeat(${others.length}, minmax(0, 1fr))` }}>
          {others.map((k) => {
            const o = HAIFU[k];
            const OI = o.icon;
            return (
              <li key={k}>
                <Link href={o.page} className="flex h-full items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200 hover:ring-slate-300">
                  <OI size={18} className="shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="text-[13px] font-bold leading-tight text-slate-800">{o.h}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** 広告であることの表示（ASP の条件：最初の画面に置く。docs/listing-rules.md） */
export function PrNote() {
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
      <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
      <span>当サイトは紹介料を受け取っています<span className="whitespace-nowrap">（工事は行いません）</span></span>
      <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
    </p>
  );
}

/**
 * 記事の出口（1ページに1つ）。2026-11-04 オーナー指示「訪問者が迷う設計はやめる」により、
 * 記事ごとに出口を1つに絞る。交換を考えている人の記事は GAS-Q（面談完了 5,280円）。
 * 書いてある売りは GAS-Q の公式サイト gas-q.jp/ad/kyutou の記載（2026-10-31 確認。lib/kyutoki/diagnosis.ts の注記）。
 */
export function GasqBox({ lpId, position, lead, points }: { lpId: string; position: string; lead: string; points: string[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
      <p className="text-[16px] font-black text-slate-900">{lead}</p>
      <ul className="flex flex-col gap-1.5">
        {points.map((t) => (
          <li key={t} className="flex items-start gap-2 text-[14px] text-slate-800">
            <Check size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />{t}
          </li>
        ))}
      </ul>
      <PartnerLink lpId={lpId} partner="gasq" position={position} label="無料の現地調査を頼む" note="断っても費用はかかりません。GAS-Q（ガスキュー）のサイトに移動します" beacon />
      <p className="text-[11px] text-slate-500">対応地域：東京・神奈川・千葉・埼玉ほか。各社の公式サイトの記載です（2026年10月31日確認）。</p>
    </div>
  );
}

/** スマホの画面下に固定するボタン（出口と同じ紹介先） */
export function GasqSticky({ lpId }: { lpId: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur sm:hidden">
      <PartnerLink lpId={lpId} partner="gasq" position="sticky" label="無料の現地調査を頼む" />
    </div>
  );
}

/**
 * 故障・急ぎの記事の出口（1ページに1つ）。お湯が出ない.com（A8 提携中、新規見積もり2,500円、
 * 成果＝申込後30日以内の現地見積もり完了、対象地域は東京都・神奈川県＝A8 の成果条件。2026-11-04 確認）。
 * 書いてある売りは公式サイト oyu-denai.com の記載（2026-11-04 Chrome で確認）。
 */
export function OyuBox({ lpId, position, lead, points, beacon = true }: { lpId: string; position: string; lead: string; points: string[]; /** 表示計測の画像。1ページに1か所だけ true */ beacon?: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
      <p className="text-[16px] font-black text-slate-900">{lead}</p>
      <ul className="flex flex-col gap-1.5">
        {points.map((t) => (
          <li key={t} className="flex items-start gap-2 text-[14px] text-slate-800">
            <Check size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />{t}
          </li>
        ))}
      </ul>
      <PartnerLink lpId={lpId} partner="oyu" position={position} label="無料で来てもらう" note="見積もりで断っても費用はかかりません。お湯が出ない.com のサイトに移動します" beacon={beacon} />
      <p className="text-[11px] text-slate-500">対象：東京都・神奈川県。電話の受付は9時〜21時・年中無休。公式サイトの記載です（2026年11月4日確認）。</p>
    </div>
  );
}

/** スマホの画面下に固定するボタン（お湯が出ない.com） */
export function OyuSticky({ lpId }: { lpId: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur sm:hidden">
      <PartnerLink lpId={lpId} partner="oyu" position="sticky" label="無料で来てもらう" />
    </div>
  );
}
