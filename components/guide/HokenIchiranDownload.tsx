'use client';

import { useState } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';

/**
 * 保険の一覧表のダウンロードと、押した直後の「次の一歩」（2026-11-11）。
 * Clarity（11/4〜11/10）：閲覧29・配布物の押下16（55%）・紹介先の押下0。表を取った人がそのまま帰っていたため、
 * 押した直後に、書き出した後にすること（見直しどきの確認 → 無料の相談）を出す。出口は保険見直し本舗のまま（1つ）。
 * 2026-11-22 v4（オーナー了承「OK」）：11/5〜11/21 で閲覧73・配布物の押下36（49%）・紹介先の押下0。
 *   押した直後の箱に「見直しどきか確かめる」（別ページ）と相談の2つが並び、視線が割れていた。相談1つにし、
 *   一言を「月額の合計を見る → 重なり・払いすぎが気になったら」に変えた（表を作った直後の気づきにつなぐ）。判定 12/6：紹介先の押下1以上。
 * 配布物の押下は、これまでどおり LpViewTracker が lp_internal_click（/downloads/…）で数える（ここでは二重に送らない）。
 */
const POINTS = ['相談は無料', '書き出した一覧表を見せれば、話が早い', '重なりと払いすぎを、プロと確かめる'];

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
            <CheckCircle2 size={20} className="text-emerald-600" aria-hidden="true" />書き出したら、月額の合計を見てください
          </p>
          <p className="text-[13px] text-slate-600">同じ保障が2つある、思ったより払っている。そう感じたら、その一覧表がそのまま相談の資料になります。</p>
          <HokenSoudanBox position="after-download" lead="重なりや払いすぎが気になったら、無料で相談" points={POINTS} />
        </div>
      )}
    </div>
  );
}
