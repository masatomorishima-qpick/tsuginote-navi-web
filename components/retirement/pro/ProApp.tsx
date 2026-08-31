/**
 * components/retirement/pro/ProApp.tsx
 *
 * 無料版の入れ物。**1つのページの中で入力と結果を切り替えます**（実装指示書 v4 §6-14・案A）。
 *
 * 【なぜ案Aか】
 *  案B（`?t=2000&y=38…`）は、ブラウザの履歴・リファラ・共有したリンクに**金額が残ります。**
 *  案C（サーバーで計算）は、無料版に認証も保存もないので過剰です。
 *
 * 【§6-14 で決めた4つ】
 *  1. `/retirement/pro/result` に直接来たら、**入力画面を出す**（404やエラーにしない）。
 *     URLも `/retirement/pro` に直して、画面とURLを食い違わせない。
 *  2. **入力を保存しない。**`sessionStorage` も `localStorage` も使わない。
 *     画面1の「入力された内容は保存されません」を守る。
 *     **リロードすると入力し直しになります。**5項目なので、約束を守るほうを取ります。
 *  3. **ブラウザの「戻る」で入力画面に戻る。**`pushState` したので `popstate` を拾う。
 *  4. **GA4の `page_view` を明示的に送る。**`@next/third-parties` の `<GoogleAnalytics>` は
 *     Nextのルーター遷移で送るので、`history.pushState` を直に呼ぶこの形では飛びません。
 *     実装後に `?ga_debug=1` で確かめること。
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Screen1 from './Screen1';
import Screen2 from './Screen2';
import Screen3 from './Screen3';
import Screen4 from './Screen4';
import Screen56 from './Screen56';
import { manToYen, type FreeInput } from './types';
import { freeResult, type FreeResult } from '@/lib/retirement/pro/free';
import { track, getProSessionId, getGaIds, captureGclid } from '@/lib/retirement/pro/track';
import { taishokuBandFromYen, idecoBandFromYen, diffBandFromYen } from '@/lib/retirement/pro/band';

const PATH_INPUT = '/retirement/pro';
const PATH_RESULT = '/retirement/pro/result';

type Props = {
  /** サーバーで求めた `Asia/Tokyo` の年。**既定値を作らない**（§4-4-2） */
  genzaiNen: number;
  /** `/retirement/pro/result` に直接来た場合 true（§6-14 の1） */
  enteredAtResult?: boolean;
};

type Step = 'input' | 'result';

/** GA4の page_view を手で送る（§6-14 の4） */
function sendPageView(path: string, title: string) {
  if (typeof window === 'undefined') return;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return;
  try {
    window.gtag?.('event', 'page_view', {
      page_path: path,
      page_location: `${window.location.origin}${path}`,
      page_title: title,
      send_to: gaId,
      // 【2026-08-18】ここは track() を通らない経路（window.gtag の直呼び）。
      //   `session_id` はGA4の予約名なので、**ここも `pro_session_id`**。
      //   型ガードは Params の中しか見ないので、**ここは kensa/yoyakumei.mjs が見ます。**
      pro_session_id: getProSessionId(),
    });
  } catch { /* 計測が落ちても本体は続ける */ }
}

export default function ProApp({ genzaiNen, enteredAtResult = false }: Props) {
  const [step, setStep] = useState<Step>('input');
  const [input, setInput] = useState<FreeInput | null>(null);
  const [result, setResult] = useState<FreeResult | null>(null);
  /**
   * 「戻る」で入力画面に戻ったときに打った内容を消さないための、画面上の生の文字列。**打つたびに親を描き直さない**ように ref で持ちます。
   *
   * 【2026-08-19・本物のプロジェクトの ESLint が拾いました】
   *   前は `initial={rawRef.current}` と、**描画の途中で ref を読んで**いました。
   *   `react-hooks/refs`「Cannot access refs during render」に当たります。
   *   いまは動いていました（「戻る」は state の変化で描き直されるため）が、
   *   **ref が変わっても描き直されない**ので、次に触った人が壊します。
   *   **結果画面へ移るときに1回だけ state へ写す**形にしました。
   *   打っている間は ref のまま（描き直しは起きません）。
   */
  const rawRef = useRef<Record<string, string>>({});
  /** 「戻る」で入力画面に戻ったときに戻す値。**移るときに1回だけ写します** */
  const [savedRaw, setSavedRaw] = useState<Record<string, string>>({});
  const lpSentRef = useRef(false);

  // ---- 入口 ----------------------------------------------------------------
  useEffect(() => {
    // §6-14 の1：result に直接来ても入力画面を出し、URLも入力画面に直す。
    // replaceState なので「戻る」で result に戻ってしまうことはない。
    if (enteredAtResult && typeof window !== 'undefined') {
      window.history.replaceState({ proStep: 'input' }, '', PATH_INPUT);
    }
    if (!lpSentRef.current) {
      lpSentRef.current = true;

      // 【2026-08-19】決済のときに使う2つを、**ここで先に頼んでおきます**。
      //   ・`gclid` … このあと pushState でURLから消えるので、いま控える
      //   ・GA4の `client_id` / `session_id` … `gtag('get', …)` はコールバックなので、
      //     購入ボタンを押す時点で取れているように、**画面1の表示時に頼んでおく**
      //   どちらも**空のことがあります。空のまま決済のbodyに載せます**（取れた分だけ使う）。
      captureGclid();
      const gaId0 = process.env.NEXT_PUBLIC_GA_ID;
      if (gaId0) getGaIds(gaId0);

      // §8-2 #1。source は流入元の区別（検索／YouTube）に使う
      // §5：`gclid` があれば検索、`utm_source=youtube` ならYouTube、
      //   どちらも無ければ直接／自然検索
      let entrySource = '';
      try {
        const q = new URLSearchParams(window.location.search);
        if (q.get('gclid')) entrySource = 'search';
        else if (q.get('utm_source')) entrySource = q.get('utm_source') ?? '';
      } catch { /* no-op */ }
      track('pro_lp_view', entrySource ? { entry_source: entrySource } : {});
      sendPageView(PATH_INPUT, '退職金とiDeCoの受け取り方シミュレーション');
    }
  }, [enteredAtResult]);

  // ---- 「戻る」（§6-14 の3）-----------------------------------------------
  useEffect(() => {
    const onPop = (ev: PopStateEvent) => {
      const s = (ev.state as { proStep?: Step } | null)?.proStep;
      // state を持たない履歴（直接来たときなど）は入力画面に倒す
      setStep(s === 'result' ? 'result' : 'input');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ---- 計算して結果へ ------------------------------------------------------
  const onSubmit = useCallback((v: FreeInput) => {
    // 無料版は5項目だけで判定する。**`koteki_nenkin`・収入・すでに受け取った退職手当等・
    // 所得控除は使わない**（§5-3 の「実装で守ること」）。hantei() はそれらを持たない。
    const r = freeResult({
      taishokukin: manToYen(v.taishokukinMan),
      kinzokuNensu: v.kinzokuNensu,
      ideco: manToYen(v.idecoMan),
      kanyuNensu: v.kanyuNensu,
      taishokuAge: v.taishokuAge,
      genzaiNen,                    // 受け取る年。既定値は作らず、必ず渡す（§4-4-2）
    });
    setInput(v);
    setResult(r);
    setSavedRaw({ ...rawRef.current });   // ★ 描画の外で写す（上のコメント）
    setStep('result');
    window.history.pushState({ proStep: 'result' }, '', PATH_RESULT);
    window.scrollTo({ top: 0, behavior: 'auto' });

    // §8-2 #5。branch と diff_yen は購入まで引き回す（§8-4）
    // 【2026-08-18】金額そのものは送りません（§8-2の変更）。**帯は band.ts の1か所から。**
    // 【2026-08-19／20・判断ログ62】**3つとも「円」で渡します。**
    //   前は①③だけ万円で渡していました。**同じ行に単位の違う3つが並ぶ形**は、
    //   いつか必ず取り違えます。**単位をそろえて、取り違えようがなくします。**
    track('pro_result_view', {
      branch: r.hantei.branch,
      diff_yen: r.sa,
      diff_band: diffBandFromYen(r.sa),
      taishoku_band: taishokuBandFromYen(manToYen(v.taishokukinMan)),
      ideco_band: idecoBandFromYen(manToYen(v.idecoMan)),
    });
    sendPageView(PATH_RESULT, '退職金とiDeCoの受け取り方シミュレーション 計算結果');
  }, [genzaiNen]);

  if (step === 'input' || !result || !input) {
    return (
      <Screen1
        onSubmit={onSubmit}
        initial={savedRaw}
        onChangeRaw={(v) => { rawRef.current = v; }}
      />
    );
  }

  return (
    <>
      <Screen2
        r={result}
        onBuy={() => {
          // 有料版の説明へ。画面5-6は次にお送りします
          document.getElementById('pro-pricing')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      <Screen3 r={result} />
      <Screen4 r={result} />
      <Screen56
        r={result}
        onBuy={() => {
          // 購入前のページへ（§6の12）。決済まわりは【3】で作ります
          window.location.href = '/retirement/pro/buy';
        }}
      />
    </>
  );
}
