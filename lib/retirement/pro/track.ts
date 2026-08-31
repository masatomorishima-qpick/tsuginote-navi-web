/**
 * lib/retirement/pro/track.ts
 *
 * `/retirement/pro`（退職金とiDeCoの受け取り方シミュレーション）のGA4計測。
 * 実装指示書 v4 §8 のイベント**35本**（無料17本＋有料18本）を、
 * **名前とパラメータを型で固定**して定義する。
 *
 * 【本数の履歴】**数え直しやすいよう、ここに残します**
 *   指示書の初出　31本（このコメントは長らく「31本」のままでした。こちらの直し漏れです）
 *   §8-3 を足して　36本
 *   2026-08-19　`pro_paid_abandon` を落として　**35本**（下の PaidEvent のコメント）
 *   **本数は `kensa/event_kazu.mjs` が数えます。**コメントの数字は当てにしないでください。
 *
 * 【なぜ専用のファイルを作るか】
 *   §2の1で `lib/shisan/*` は変更できない。イベント名を文字列で直接呼ぶと、
 *   §8の表とコードが静かにずれる（打ち間違いはGA4側では検出できない）。
 *   ここで名前とパラメータを型にしておけば、**ずれた瞬間にビルドが落ちる。**
 *
 * 【debug パラメータ】
 *   `lib/shisan/track.ts` と**同じ定義**にする（`?ga_debug=1` / `?debug=1` /
 *   `?op=1` で立てた運営者フラグの OR）。判定を書き写すとテストAと食い違うため、
 *   `lib/shisan/op.ts` の `isOperatorClient()` を**読むだけ**で使う（変更しない）。
 *
 * 【PII】
 *   §8の原則どおり、金額と分岐以外は載せない。メールアドレス・入力の生値は載せない。
 */

'use client';

import { isOperatorClient } from '@/lib/shisan/op';

/**
 * **`window.gtag` の型は、ここでは宣言しません。**
 *
 * 【2026-08-19・本物のプロジェクトに置いて分かったこと】
 *   サイト共通の宣言が **`lib/analytics/ga4.ts`** にあります。
 *     gtag?: (command: 'event'|'config'|'set'|'js', targetIdOrEventName: string|Date,
 *             config?: Record<string, unknown>) => void
 *   ここで別の形（`(...args: unknown[]) => void`）を宣言すると、
 *   **TS2717「同じ名前の宣言は同じ型でなければならない」で、プロジェクト全体のビルドが落ちます。**
 *   こちらだけで `tsc` を回していたときは、この宣言が無かったので通っていました。
 *
 *   **共通の宣言は変えません。**`'get'` と4引数だけ、下で局所的に受け直します。
 *   （共通の宣言を広げる案もありますが、サイト全体に効くので、こちらの判断では変えません）
 */

/** `gtag('get', …)` の形。**共通の宣言（3引数・`get` なし）では受けられません** */
type GtagGet = (command: 'get', measurementId: string, field: string,
                cb: (v: string) => void) => void;

/** `gtag` が読み込まれていれば、`get` の形で受け直して返す */
function gtagGet(): GtagGet | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { gtag?: unknown };
  return typeof w.gtag === 'function' ? (w.gtag as GtagGet) : null;
}

/**
 * GA4の**予約済みパラメータ名**（Google「イベントの命名規則」の逐語）。
 * **ここに載っている名前を送ってはいけません。**カスタムディメンションに登録できず、
 * GA4側で受け取られない可能性があります（＝`pro_purchases` との突合が**静かに**成立しません）。
 *
 * 【2026-08-18】`session_id` を送る設計になっていました（指示書 §8-4）。
 *   オーナーがGA4に登録しようとして「このスコープではパラメータ名を使用できません。」で判明。
 *   **`pro_session_id` に変えました。**同じ事故を二度起こさないよう、**型で弾きます**（下の ReservedCheck）。
 */
type Reserved =
  | 'cid' | 'currency' | 'customer_id' | 'customerid' | 'dclid' | 'gclid'
  | 'session_id' | 'sessionid' | 'sfmc_id' | 'sid' | 'srsltid'
  | 'uid' | 'user_id' | 'userid';
/** 予約された接頭辞：`_` `firebase_` `ga_` `google_` `gtag.` */
type ReservedPrefix = `_${string}` | `firebase_${string}` | `ga_${string}`
  | `google_${string}` | `gtag.${string}`;

/** §8-2 無料版（#1〜#17） */
export type FreeEvent =
  | 'pro_lp_view'
  | 'pro_input_start'
  | 'pro_input_field'
  | 'pro_calc_click'
  | 'pro_result_view'
  | 'pro_result_scroll'
  | 'pro_screen3_view'
  | 'pro_screen4_view'
  | 'pro_pricing_view'
  | 'pro_pricing_block_view'
  | 'pro_pricing_scroll'
  | 'pro_buy_click'
  | 'pro_consent_check'
  | 'pro_checkout_start'
  | 'pro_checkout_cancel'
  | 'pro_purchase_client'
  | 'pro_purchase';

/**
 * §8-3 有料版。
 * 【2026-08-19】`pro_paid_abandon`（30分無操作）を**落としました**（36本→35本）。
 *   **タブを閉じた時点でタイマーが消える**ので、離脱のいちばん多い形では飛びません。
 *   **少数しか数えない数字は、無いより誤ります。**
 *   離脱地点は `pro_paid_input_field` の `field_no` 別のイベント数（生存曲線）で出します。
 */
export type PaidEvent =
  | 'pro_paid_input_start'
  | 'pro_paid_input_field'
  | 'pro_paid_input_unknown'
  | 'pro_paid_detail_open'
  | 'pro_paid_detail_field'
  | 'pro_paid_submit'
  | 'pro_result8_view'
  | 'pro_screen9_view'
  | 'pro_screen9detail_view'
  | 'pro_screen10_view'
  | 'pro_screen11_view'
  | 'pro_screen12_view'
  | 'pro_screen13_view'
  | 'pro_pattern_filter'
  | 'pro_pattern_select'
  | 'pro_excel_download'
  | 'pro_recalc'
  | 'pro_return_visit';

export type ProEvent = FreeEvent | PaidEvent;

/** 画面2の判定（`hantei.ts` の4分岐。§8-2 #5） */
export type Branch = '対象外' | '空ければ解決' | '金額が小さい' | '空けられない';

/** 画面5-6のブロック（§8-5。`photo` は測らない） */
export type PricingBlock =
  | '4views' | 'different' | 'ai' | 'included'
  | 'cannot' | 'notincluded' | 'notfor' | 'inputs' | 'prepare' | 'price';

/** イベントごとに載せてよいパラメータ。**ここにない鍵は渡せない。** */
type Params = {
  // 【2026-08-18】`source` → `entry_source`。予約名ではないので動きますが、
  //   GA4には「セッションの参照元」という別のものがあり、レポートで並ぶと紛らわしくなります
  pro_lp_view: { entry_source?: string };
  pro_input_start: Record<never, never>;
  pro_input_field: { field_no: 1 | 2 | 3 | 4 | 5 };
  pro_calc_click: Record<never, never>;
  // 【2026-08-18】`taishokukin` / `ideco` を送るのをやめ、**帯**にしました（§8-2の変更）。
  //   画面1の「入力された内容は保存されません」に、実装を合わせるためです。
  //   `diff_yen` は**丸めません**（利用者の入力ではなく、こちらの計算結果・§8-4）。
  pro_result_view: {
    branch: Branch; diff_yen: number; diff_band: string;
    taishoku_band: string; ideco_band: string;
  };
  pro_result_scroll: { depth: 25 | 50 | 75 | 100 };
  pro_screen3_view: Record<never, never>;
  pro_screen4_view: Record<never, never>;
  pro_pricing_view: Record<never, never>;
  pro_pricing_block_view: { block: PricingBlock };
  pro_pricing_scroll: { depth: 25 | 50 | 75 | 100 };
  pro_buy_click: { entry: 'screen2' | 'screen5-6' };
  pro_consent_check: Record<never, never>;
  pro_checkout_start: Record<never, never>;
  pro_checkout_cancel: Record<never, never>;
  pro_purchase_client: Record<never, never>;
  // Webhook側。**同じ `band.ts` の関数を呼ぶこと**（別々に書くと、同じ方が別の帯になります）
  pro_purchase: { branch: Branch; diff_yen: number; diff_band: string };

  pro_paid_input_start: Record<never, never>;
  pro_paid_input_field: { field_no: number; elapsed_sec: number };
  pro_paid_input_unknown: { field_no: number };
  pro_paid_detail_open: Record<never, never>;
  pro_paid_detail_field: { field_no: number };
  pro_paid_submit: { elapsed_sec_total: number };
  pro_result8_view: { pattern: 1 | 2 | 3 };
  pro_screen9_view: Record<never, never>;
  pro_screen9detail_view: Record<never, never>;
  pro_screen10_view: Record<never, never>;
  pro_screen11_view: Record<never, never>;
  pro_screen12_view: Record<never, never>;
  pro_screen13_view: Record<never, never>;
  pro_pattern_filter: { filter_type: string };
  pro_pattern_select: { pattern_id: string };
  pro_excel_download: Record<never, never>;
  pro_recalc: { days_since_purchase: number };
  pro_return_visit: { days_since_purchase: number };
};

/**
 * §8-4：**すべてのイベントに `pro_session_id` と `user_pseudo_id` を付ける。**
 * GA4は広告ブロッカーで約3割落ちるため、`pro_purchases` テーブルの行と
 * 突合できないと売上の分母が作れない（§8-1の1）。
 * この値はこの端末のこのセッションで一度だけ作り、決済の body にも同じ値を載せる。
 * **`pro_purchases` 側の列名は `session_id` のままで構いません。**名前が違っても値が同じなら繋がります。
 */
const SID_KEY = 'tsuginote_pro_sid';

export function getProSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let v = window.sessionStorage.getItem(SID_KEY);
    if (!v) {
      v = (window.crypto?.randomUUID?.() ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
      window.sessionStorage.setItem(SID_KEY, v);
    }
    return v;
  } catch {
    return '';   // プライベートモード等。計測は続ける（best-effort）
  }
}

/**
 * GA4のIDを2つ取ります。**Measurement Protocol に要ります**（サーバーから `pro_purchase` を送るため）。
 *
 * 【名前を変えた理由・2026-08-19】もとは `captureUserPseudoId()` でした。
 *   **イベントのパラメータとして `user_pseudo_id` を送らない**のと、
 *   **`client_id` の値そのものを取る**のは、別の話です。名前が誤解を生むので変えました。
 *
 * 【`session_id` の二面性】
 *   ・**ブラウザから送るイベントのパラメータ名**としては**使えません**（GA4の予約名）→ `pro_session_id`
 *   ・**サーバーの Measurement Protocol の項目**としては**使います**（GA4自身が定めている項目）
 *   Google公式ヘルプ：「セッションベースの Measurement Protocol イベントが
 *   『(not set) / (not set)』として報告される場合は、**クライアント側のイベントから
 *   有効な値を含む `session_id` パラメータを送信します**」
 *
 * 【気をつけること】`gtag('get', …)` は**コールバック**です。取れる前に購入ボタンを
 *   押された方では、**値が空のまま決済のbodyに載ります。**画面1の表示時に呼んでおき、
 *   **空だったら空のまま送って、取れた分だけ使います**（`gclid` と同じ扱い）。
 *   **黙って欠けると、あとで「なぜ紐づかないのか」が追えません。**
 *   `gaIdsKekka()` で、取れたか／空かが分かります。
 */
type GaIds = { clientId: string; sessionId: string };
const gaIds: GaIds = { clientId: '', sessionId: '' };
let gaIdsTanomi = false;

export function getGaIds(measurementId: string): void {
  const g = gtagGet();
  if (g === null) return;
  gaIdsTanomi = true;
  try {
    g('get', measurementId, 'client_id', (v: string) => { gaIds.clientId = v || ''; });
    // Measurement Protocol の項目名を**読み出している**だけです。イベントのパラメータではありません
    g('get', measurementId, 'session_id', (v: string) => { gaIds.sessionId = v || ''; }); // MP
  } catch { /* 取れなくても、空のまま進みます */ }
}

/** いま取れている値。**空でも、そのまま決済のbodyに載せます**（取れた分だけ使う） */
export function readGaIds(): GaIds { return { ...gaIds }; }

/**
 * 取れたか／空か。**空になった件数を数えられるように**、決済のときにこれを見てください。
 *   'ok'    … 2つとも取れた
 *   'kake'  … 頼んだが、片方または両方が空（コールバックが間に合わなかった等）
 *   'nashi' … そもそも頼んでいない（gtag が無い等）
 */
export function gaIdsKekka(): 'ok' | 'kake' | 'nashi' {
  if (!gaIdsTanomi) return 'nashi';
  return (gaIds.clientId && gaIds.sessionId) ? 'ok' : 'kake';
}

/**
 * `gclid` を、**最初に開いた時点で控えます**。置き場所は `sessionStorage` です。
 *
 * 【なぜURLから読み直さないか】
 *   結果画面へ移るときに `history.pushState('/retirement/pro/result')` を呼びます。
 *   このとき、**もとのURLに付いていた `?gclid=…` は消えます**（§6-14・案A）。
 *   決済は結果画面の先にあるので、**そのときURLを読んでも、もう `gclid` はありません。**
 *
 * 【なぜURLに残さないか・2026-08-19 決定】
 *   Google広告の自動タグ設定は、**着地した時点で `gclid` をこのサイトのcookieに保存します**
 *   （Google広告ヘルプ「About auto-tagging」: the GCLID is stored in a new Google Analytics
 *   cookie on your site's domain）。ですので **URLから消えても、Google広告側の
 *   コンバージョン計測は壊れません。**URLに残す必要があるのは、こちらがStripeの
 *   `metadata` に載せるぶんだけで、それはここで持てば足ります。
 *   ※cookieの名前（`_gcl_aw`）と期間は、Googleの公式ヘルプでは**確認できませんでした。**
 *
 *   URLに残すと、**URLをコピーして人に渡された方の購入が、その方が検索していない
 *   キーワードの成果として付きます。この誤りは数えられません。**
 *   一方、ここで持って空になる場合（＝別のタブで開き直された場合）は、
 *   **決済のときに空だった件数を数えられます。**
 *   **数が少ないより、数が違うほうが悪い**ので、残さない側を取りました。
 *
 * 【なぜ `sessionStorage` か】
 *   変数だけだと**リロードで消えます**。`sessionStorage` なら残り、URL・履歴・共有リンクの
 *   どれにも載りません。`pro_session_id` を既にここへ置いているので、置き場所もそろいます。
 *   **`localStorage` は使いません**（タブを閉じたら消える範囲で足ります）。
 *   画面1の「入力された内容は保存されません」には抵触しません。`gclid` は入力内容ではなく、
 *   **広告のリンクに付いてくる、どの広告から来たかの印**です。
 *
 * 【残る弱点】同じタブで広告から入ったあと、別のサイトへ行って自然検索で戻った方の購入も、
 *   広告に付きます。これは Google広告のcookie が既にやっていることと同じ向きなので、
 *   ここだけ厳しくしても揃いません。**そろえない側の誤りのほうが大きい**と判断しました。
 */
const GCLID_KEY = 'tsuginote_pro_gclid';
let gclidValue = '';
let gclidYonda = false;

export function captureGclid(): void {
  if (typeof window === 'undefined' || gclidYonda) return;
  gclidYonda = true;
  try {
    const kara_url = new URLSearchParams(window.location.search).get('gclid') ?? '';
    if (kara_url) {
      gclidValue = kara_url;
      window.sessionStorage.setItem(GCLID_KEY, kara_url);
      return;
    }
    // URLに無いとき＝リロード後や、結果画面から戻ったとき。控えてあるものを使います
    gclidValue = window.sessionStorage.getItem(GCLID_KEY) ?? '';
  } catch {
    // プライベートモード等で sessionStorage が使えないとき。
    // **URLから取れた分だけ、この画面が開いている間は使えます**（計測は続ける）
  }
}

/** いま控えている `gclid`。**空のこともあります**（広告以外からの流入・別のタブで開き直し） */
export function readGclid(): string { return gclidValue; }

function isDebug(): boolean {
  let d = isOperatorClient();
  try {
    const p = new URLSearchParams(location.search);
    d = d || p.get('ga_debug') === '1' || p.get('debug') === '1';
  } catch { /* URL解釈に失敗しても計測は続ける */ }
  return d;
}

/**
 * **予約名を使っていないことを、ビルド時に確かめます。**
 * `Params` のどれかに予約名（または予約された接頭辞）の鍵が入ると、ここで型エラーになります。
 * **検査を回さなくても、`tsc` が止めます。**
 */
type AllParamKeys = { [K in ProEvent]: keyof Params[K] }[ProEvent];
/**
 * **`track()` が必ず足すもの。**
 * 【2026-08-18】はじめは `Params` の中しか見ていませんでした。
 *   ところが `session_id` は `Params` ではなく**ここ**にあり、型ガードをすり抜けていました。
 *   **足す側も、同じ型で確かめます。**
 *   なお `window.gtag()` の直呼び（`ProApp.tsx` の `sendPageView`）は型では追えません。
 *   **そこは `kensa/yoyakumei.mjs` がソースを見ます。**
 */
type Kyotsu = { pro_session_id: string; debug: boolean };
type AllKeys = AllParamKeys | keyof Kyotsu;
type ReservedCheck<T> = T extends Reserved | ReservedPrefix ? never : T;
// 予約名が混ざると `never` になり、この代入が型エラーになります
const _reservedGuard: AllKeys extends ReservedCheck<AllKeys> ? true : never = true;
void _reservedGuard;

/**
 * イベントを1本送る。**名前とパラメータの組み合わせは型で固定されている。**
 *
 *   track('pro_result_view', { branch, diff_yen, diff_band, taishoku_band, ideco_band })
 *   track('pro_input_field', { field_no: 3 })
 */
export function track<K extends ProEvent>(
  name: K,
  ...args: keyof Params[K] extends never ? [] : [Params[K]]
): void {
  if (typeof window === 'undefined') return;
  const payload = {
    ...(args[0] ?? {}),
    // 【2026-08-18】`session_id` はGA4の予約名。`pro_` を付けた名前で送る（§8-4の変更）
    pro_session_id: getProSessionId(),
    debug: isDebug(),
  };
  if (typeof location !== 'undefined' && location.search.includes('ga_debug')) {
    console.log('[pro:track]', name, payload);
  }
  try {
    window.gtag?.('event', name, payload);
    (window as unknown as { clarity?: (...a: unknown[]) => void }).clarity?.('event', name);
  } catch { /* no-op */ }
}

/** 一度だけ送る（画面が再表示されても二重に送らない） */
const sentOnce = new Set<string>();
export function trackOnce<K extends ProEvent>(
  key: string,
  name: K,
  ...args: keyof Params[K] extends never ? [] : [Params[K]]
): void {
  if (sentOnce.has(key)) return;
  sentOnce.add(key);
  (track as (n: K, ...a: unknown[]) => void)(name, ...args);
}
