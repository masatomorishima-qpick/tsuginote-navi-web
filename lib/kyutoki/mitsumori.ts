/**
 * 給湯器 B（自社の取り次ぎ）の「見積もりの条件チェック」（/kyutoki/mitsumori）の設問・判定・総額の目安。
 *
 * 2026-11-02 新設。B の段ごとの合格線から逆算して作った（docs/kyutoki-b/page-design.md）。
 *   - クリック→結果 25%：交換を決めた人が答えやすい順（種類→住まい→地域→年数→機能→号数→時期）。
 *     答えるたびに液晶の表示に「総額の目安」が出る（本体込みの総額＝一覧サイトにない情報を、答える理由にする）。
 *   - 結果→メール入力 40%：結果は「総額の目安」と「2社から見積もり（メールだけ）」の2つだけ。
 *   - 入力→要件がそろう 60%：業者が欲しい条件（住まい・機能・号数・時期）はページで聞いておき、
 *     メールで聞くのは市区町村と写真だけにする（メールの往復で人が抜ける段を、測れる場所に移す）。
 *
 * ★PDCAで触る場所（ほぼここだけ）
 *   1. TORITSUGI_AREAS …… 協力業者2社の対応地域に合わせる。外の地域は入力欄を出さない。
 *   2. PRICE …… 総額の目安。業者2社が決まったら、両社の実際の価格に差し替える（出典の行も直す）。
 *   3. 文言を変えたら VERSION を上げる（lp_event_logs の metadata.version で版ごとに比べるため）。
 */

export const LP_ID = 'kyutoki-mitsumori';
export const VERSION = 'b1-2026-11-02';

export type MType = 'gas' | 'eco' | 'elec';
export type MHome = 'house' | 'mansion' | 'rent';
export type MArea = 'tokyo' | 'kanagawa' | 'chiba' | 'saitama' | 'other';
export type MAge = 'lt7' | '7to10' | 'gt10' | 'unknown';
export type MKino = 'kyuto' | 'furo' | 'danbo' | 'unknown';
export type MGo = '16' | '20' | '24' | 'unknown';
export type MJiki = 'now' | 'month' | 'quarter' | 'undecided';

export type MAnswers = {
  type?: MType;
  home?: MHome;
  area?: MArea;
  age?: MAge;
  kino?: MKino;
  go?: MGo;
  jiki?: MJiki;
};
export type MStepId = keyof MAnswers;

export type MOption = { v: string; t: string; s?: string };
export type MStep = { id: MStepId; lcd: string; q: string; hint?: string; cols: 2 | 3; opts: MOption[] };

export const M_STEPS: MStep[] = [
  {
    id: 'type', lcd: '機種', q: '給湯器の種類は？', cols: 3,
    opts: [
      { v: 'gas', t: 'ガス給湯器', s: '壁に付いた箱形' },
      { v: 'eco', t: 'エコキュート', s: 'タンク＋室外機' },
      { v: 'elec', t: '電気温水器', s: 'タンクだけ' },
    ],
  },
  {
    id: 'home', lcd: '住まい', q: 'お住まいは？', cols: 3,
    opts: [
      { v: 'house', t: '戸建て' },
      { v: 'mansion', t: 'マンション', s: '分譲' },
      { v: 'rent', t: '賃貸' },
    ],
  },
  {
    id: 'area', lcd: '地域', q: 'お住まいの地域は？', cols: 2,
    opts: [
      { v: 'tokyo', t: '東京都' }, { v: 'kanagawa', t: '神奈川県' },
      { v: 'chiba', t: '千葉県' }, { v: 'saitama', t: '埼玉県' },
      { v: 'other', t: 'それ以外' },
    ],
  },
  {
    id: 'age', lcd: '使用年数', q: '使い始めて何年ですか？', hint: 'だいたいで大丈夫です', cols: 2,
    opts: [
      { v: 'lt7', t: '7年未満' }, { v: '7to10', t: '7〜9年' },
      { v: 'gt10', t: '10年以上' }, { v: 'unknown', t: 'わからない' },
    ],
  },
  {
    id: 'kino', lcd: '機能', q: '今の給湯器でできることは？', cols: 2,
    opts: [
      { v: 'kyuto', t: 'お湯を出すだけ', s: '給湯専用' },
      { v: 'furo', t: 'お湯はり・追いだき', s: 'ふろ給湯器' },
      { v: 'danbo', t: '床暖房にも使う', s: '暖房付き' },
      { v: 'unknown', t: 'わからない' },
    ],
  },
  {
    id: 'go', lcd: '号数', q: '号数は？', hint: '本体のラベルに「16」「20」「24」などとあります', cols: 2,
    opts: [
      { v: '16', t: '16号' }, { v: '20', t: '20号' },
      { v: '24', t: '24号' }, { v: 'unknown', t: 'わからない' },
    ],
  },
  {
    id: 'jiki', lcd: '時期', q: '交換したい時期は？', cols: 2,
    opts: [
      { v: 'now', t: 'すぐ', s: '壊れている' }, { v: 'month', t: '1か月以内' },
      { v: 'quarter', t: '3か月以内' }, { v: 'undecided', t: '決めていない' },
    ],
  },
];

/** 業者に渡す・オーナーへの通知に使う日本語の表示 */
export function labelOf(id: MStepId, v: string | undefined): string {
  if (!v) return '';
  const step = M_STEPS.find((s) => s.id === id);
  const o = step?.opts.find((x) => x.v === v);
  return o ? (o.s && id !== 'type' ? `${o.t}（${o.s}）` : o.t) : v;
}

/** 入力欄を出す地域（協力業者2社の対応地域に合わせる） */
export const TORITSUGI_AREAS: MArea[] = ['tokyo', 'kanagawa', 'chiba', 'saitama'];

/* ===== 途中で止める案内（入力欄を出さない） ===== */
export type MStopKey = 'eco' | 'rent' | 'area';
export function mStopFor(id: MStepId, v: string): MStopKey | null {
  if (id === 'type' && v !== 'gas') return 'eco';
  if (id === 'home' && v === 'rent') return 'rent';
  if (id === 'area' && !TORITSUGI_AREAS.includes(v as MArea)) return 'area';
  return null;
}

/* ===== 総額の目安（工事費込み・税込、万円） =====
 * 出典：東京ガス「給湯器の選び方」の相場と、同社の販売価格（2026年10月確認。/kyutoki/kokan-hiyou と同じ数字）。
 * 号数ごとの公表の相場はないため、機能で幅を出し、号数は見積もりで確かめる前提にする。
 * 例の金額は、幅の中に入るものを選ぶ（暖房付きは相場30〜35万円だが販売価格に29.0万円があるため下限を29にした）。 */
export const PRICE: Record<MKino, { min: number; max: number; ex: string }> = {
  kyuto: { min: 10, max: 15, ex: '16号で約10.2万〜12.2万円' },
  furo: { min: 15, max: 20, ex: '16号オートで約16.4万〜19.2万円' },
  danbo: { min: 29, max: 35, ex: '24号の高効率・壁掛けで約29.0万〜29.5万円' },
  unknown: { min: 10, max: 35, ex: '機能で大きく変わります' },
};
export const PRICE_SRC_URL = 'https://home.tokyo-gas.co.jp/housing/exchange/waterheater/how-to-choose.html';

export function priceOf(a: MAnswers): { min: number; max: number; ex: string } | null {
  return a.kino ? PRICE[a.kino] : null;
}

/** 液晶の表示：機能が決まったら総額の目安、それまでは設問の名前 */
export function lcdOf(a: MAnswers, fallback: string): string {
  const p = priceOf(a);
  return p ? `${p.min}-${p.max}万` : fallback;
}

/** 入力欄を出してよいか（止める案内に当たらず、最後まで答えた） */
export function canRequest(a: MAnswers): boolean {
  return a.type === 'gas' && !!a.home && a.home !== 'rent' && !!a.area && TORITSUGI_AREAS.includes(a.area) && !!a.jiki;
}
