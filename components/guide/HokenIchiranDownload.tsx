'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Download } from 'lucide-react';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';

/**
 * 保険の一覧表のダウンロードと、押した直後の「次の一歩」（2026-11-11）。
 * Clarity（11/4〜11/10）：閲覧29・配布物の押下16（55%）・紹介先の押下0。表を取った人がそのまま帰っていたため、
 * 押した直後に、書き出した後にすること（見直しどきの確認 → 無料の相談）を出す。出口は保険見直し本舗のまま（1つ）。
 * 配布物の押下は、これまでどおり LpViewTracker が lp_internal_click（/downloads/…）で数える（ここでは二重に送らない）。
 */
const POINTS = ['相談は無料', '書き出した一覧表を見せれば、話が早い', '減らすか、変えるかを、プロと確かめる'];

export default function HokenIchiranDownload() {
  const [done, setDone] = useState(false);
  const onClick = () => setDone(true);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-center">
        <a
          href="/downloads/hoken-keiyaku-ichiran.xlsx"
          download
          onClick={onClick}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Download size={16} aria-hidden="true" />保険契約一覧表テンプレート（Excel）を無料ダウンロード
        </a>
      </p>
      {done && (
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 text-left leading-normal ring-1 ring-emerald-200" aria-live="polite">
          <p className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
            <CheckCircle2 size={20} className="text-emerald-600" aria-hidden="true" />書き出したら、次はこの2つ
          </p>
          <Link href="/guide/shisan-kanri/hoken-minaoshi-checklist" className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 hover:ring-slate-300">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-bold text-white">1</span>
            <span className="flex flex-1 flex-col"><span className="text-[14px] font-bold text-slate-900">見直しどきか確かめる</span><span className="text-[12px] text-slate-600">節目と、次の更新の時期のチェック（無料）</span></span>
            <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
          </Link>
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-3 text-[14px] font-bold text-slate-900">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] text-white">2</span>一覧表を見せて、無料で相談する
            </p>
            <HokenSoudanBox position="after-download" lead="一覧表ができたら、無料で見直し相談" points={POINTS} />
          </div>
        </div>
      )}
    </div>
  );
}
