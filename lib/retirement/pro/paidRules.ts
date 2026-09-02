/**
 * lib/retirement/pro/paidRules.ts — 画面7（有料版・28項目）の**決まりを1か所に**（A-2a-5）
 *
 * ★★判断ログ239番の一本化を28項目に広げたものです（senjutsu_20260902ad.md 5番・ae.md 2番・af.md・ag.md）。
 *   `Screen7`（ブラウザ）と口（サーバー・`/retirement/pro/inputs`）が**同じこの1本**を読みます。
 *   ★`server-only` は付けません（画面7も読みます）。★式（税金の計算）は持ちません。
 *
 * ★決めの筋（ae.md 2-1）
 *   1  raw は `Record<string,string>` のまま。複数の欄を持つ項目は鍵を `no/名前`（例 `⑧/owari`）、
 *      複数件は `no/番号/名前`（例 `⑲/1/gaku`）。★入れ物は全部「字」。JSON を字に埋めない
 *   2  欄の種類は `man`（万円の整数）／`en`（円の整数）／`kazu`（整数）／`erabu`（選ぶ）／`hai`（はい・いいえ）。
 *      ★年月日・年月は `kazu` の `select`（年／月／日）の組で表します
 *   3  空欄の意味は項目ごと ── `hissu`（空は誤り）／`nashi`（空＝「なし」＝0・null・いいえ）
 *   4  数字は全角も受け、カンマは取る。小数は誤り。★float を使わない（字 → 整数）
 *   5  範囲 ── ①〜⑤は `types.ts` の `FIELDS` から（import・字を2か所に書かない）。★残りは戦術Coworkの決め（ae.md 2-2・ag.md 1番）
 *
 * ★越えの検査（項目をまたぐ・af.md 4番で確定した5つ）
 *   1  今年 ≤ ⑥の年＋⑤ ≤ 今年＋15
 *   2  ⑳ ≤ kurisageJogenAge(⑥)
 *   3  ⑧/owari ≥ ⑤＋1（⑧の額 > 0 のとき）
 *   4  ⑫⑬・⑲・㉓ の期間：hajime ≤ owari、かつ owari の年 ≤ 退職の年
 *   5  ⑲ の nen ≤ 退職の年 − 1
 *   ★★全部 400（項目の字）。422 は「入力が正しいのに計算が止まった」ときだけ
 *
 * ★★⑨・⑲・㉓の額は `man`（万円）です（ag.md 1番）── `Gen` の番人A（1万円の倍数）を崩さないため。
 * ★★㉑「お子さんの人数」の欄は**作っていません**（森嶋さんの決め待ち・ae.md 5番）。`koNin` は 0 を渡します（★下の注記）。
 *
 * ★利用者に見せる字（誤りの字・欄の見出し・単位）は、このファイルの `JI` と `PAID_KOU` の中だけにあります。
 *   ★誤りの字5つ＋越えの字3つは戦術Coworkの字（ad.md 5番・af.md 1・2・3番）。
 *   ★★欄の見出し25語（`RAN_JI`）は**戦術Coworkの字**です（senjutsu_20260902ah.md 3番で差し替え済み・1文字も変えていません）。
 */

import { FIELDS, type FreeInput } from '@/components/retirement/pro/types';
import { PAID_FIELDS } from '@/components/retirement/pro/paidFields';
import type { PaidInput, Kikan, Sumi, Nengetsu, Kyuchi } from './paidInput';
import { kurisageJogenAge } from './zeisei';

// ---------------------------------------------------------------- 欄の種類
export type RanShurui = 'man' | 'en' | 'kazu' | 'erabu' | 'hai';
export type Kara = 'hissu' | 'nashi';

/** 1つの欄。★`kagi` は raw の鍵（`no`／`no/名前`／`no/{n}/名前`） */
export type Ran = {
  kagi: string;
  shurui: RanShurui;
  kara: Kara;
  /** `man`・`en`・`kazu` の範囲（両端を含む）。★`erabu`・`hai` には無い */
  min?: number;
  max?: number;
  /** `erabu` の選択肢（raw に入るのは `kagi`） */
  sentaku?: ReadonlyArray<{ kagi: string; ji: string }>;
  /** 欄の右に出す単位の字（戦術の字・種類ごと）。無ければ出さない */
  tani?: string;
  /** 欄の見出し（`RAN_JI` から・戦術の字）。無ければ出さない */
  ji?: string;
  /**
   * 期間の組（「いつから」「いつまで」）の**上に小さく置く1行**。★組の先頭の欄にだけ付けます。
   * 【2026-09-02・senjutsu_20260902ai.md 2番の2】⑲は1件の中に「年・額・期間・種類」が並ぶため、
   *   期間の欄だけ見出しが無いと、**何の期間かが分かりません**（㉓も同じ）。★字は `RAN_JI`（戦術の字）。
   */
  kumiJi?: string;
  /** `kazu` を `<select>` で出す（年月日・年月・歳） */
  select?: boolean;
};

/** 項目の形 */
export type Kou =
  | { no: string; katachi: 'tan'; ran: Ran }
  | { no: string; katachi: 'kumi'; ran: readonly Ran[]; nai?: NaiCheck }
  | { no: string; katachi: 'kikan'; ran: readonly Ran[]; wakaranai: true }
  | { no: string; katachi: 'ken'; max: number; ran: readonly Ran[] };

/** 「配偶者はいない」などのチェック1つ。★はい（チェック）なら `kakusu` の欄を出さない */
export type NaiCheck = { kagi: string; ji: string; kakusu: readonly string[] };

// ---------------------------------------------------------------- 字（1か所）
/** 誤りの字（ad.md 5番・af.md 1・2・3番）。`{ラベル}`・`{min}`・`{max}`・`{上限}` を入れます */
export const JI = {
  hissu: '{ラベル}をご入力ください。',
  seisu: '{ラベル}は、整数でご入力ください。',
  hani: '{ラベル}は、{min}から{max}の間でご入力ください。',
  sentaku: '{ラベル}をお選びください。',
  koe: '{ラベル}のご入力に、前後の食い違いがあります。ご確認ください。',
  taishokuMae: '⑤の年齢では、あなたが退職金を受け取る年が今年より前になります。⑤か⑥をご確認ください。',
  taishokuSaki: '⑤の年齢では、あなたが退職金を受け取る年が今から15年より先になります。この計算は、15年先までの方を対象にしています。',
  kurisageJogen: '⑳は、{上限}歳までお選びいただけます。生まれた日で上限が変わります。',
  owari8: '⑧の「何歳まで」は、⑤の翌年以降の年齢をご入力ください。',
  /** 複数件のボタン（ae.md 2-3・戦術の字） */
  tsuika: 'もう1件追加する',
  sakujo: 'この件を削除する',
  /** チェックの字（ae.md 2-3・戦術の字） */
  haigushaNai: 'あなたに配偶者はいない',
  yakuinNai: '役員として受け取る退職金はない',
  /** ⑫⑬の「わからない」（基準HTMLの small の字） */
  wakaranai: 'わからない',
  /** はい・いいえ */
  hai: 'はい',
  iie: 'いいえ',
} as const;

/** 単位の字（ag.md 1番・種類ごと） */
export const TANI = { man: '万円', en: '円', nen: '年', sai: '歳', nin: '人', tsuki: '月', hi: '日', kai: '回' } as const;

/**
 * ★欄の見出し（25語）。
 *
 * 【2026-09-02・senjutsu_20260902ah.md 3番】★**戦術Coworkの字に差し替えました。1文字も変えていません。**
 *   （それまでは、仕様に字が無かったため開発が仮に置いていました）
 *   ★元にしたもの ── ㉖㉗㉕㉓は ⓘ の言葉、⑲は small の言葉。言葉の順を「やさしい言い方（かたい言葉）」にそろえたもの。
 */
export const RAN_JI = {
  nen: '年',
  tsuki: '月',
  hi: '日',
  hajime: 'いつから',
  owari: 'いつまで',
  owari8: '何歳まで',
  ken11age: '年齢',
  ken11gaku: '額',
  ken19nen: '受け取った年',
  ken19gaku: '額',
  ken19kikan: 'その勤め先での勤続期間（またはiDeCo等の加入期間）',
  ken19dc: '種類',
  haigushaShotoku: '合計所得金額',
  haigushaRojin: 'あなたの配偶者が70歳以上',
  tokutei: '19歳以上23歳未満の方（特定扶養親族）',
  rojin: '70歳以上の方（老人扶養親族）',
  dokyoRojin: 'あなたかあなたの配偶者の親で、同居している70歳以上の方（同居老親等）',
  shogaiIppan: '障害者の人数',
  shogaiTokubetsu: '特別障害者の人数',
  shogaiDokyo: '同居特別障害者の人数',
  kafu: '寡婦にあてはまる',
  hitorioya: 'ひとり親にあてはまる',
  yakuinGaku: '額',
  yakuinKikan: 'あなたが役員だった期間',
  haigushaSeinen: 'あなたの配偶者が生まれた年',
} as const;

// ---------------------------------------------------------------- 範囲（戦術の決め・ae.md 2-2・af.md 3・4番・ag.md 1番）
/** 退職の年は「今年〜今年＋15」。★15 は固定の数（af.md 1番）。今年は固定しない */
export const TAISHOKU_SAKI_NEN = 15;
/** 円の上限（2億）。★FIELDS の①（20,000万円）と同じ数にそろえた */
const EN_MAX = 200_000_000;
/** 年金の年額の上限（2,000万） */
const NENKIN_EN_MAX = 20_000_000;
/** 複数件の上限（⑪・⑲）。★戦術の決め・根は基準HTMLに無い（ae.md 2-2） */
export const KEN_MAX = 5;
/**
 * 期間の年の範囲。★上は**今年から作ります**（senjutsu_20260902ah.md 3番）。
 *   ★根 ── 「owari の年 ≤ 退職の年 ≤ 今年＋15」（af.md 1番の越えの検査）。★2099 という固定の年は置きません。
 *   ★下の 1940 は戦術の決め（ae.md 2-2）。
 */
const KIKAN_NEN_MIN = 1940;
export function kikanNenHani(genzaiNen: number): { min: number; max: number } {
  return { min: KIKAN_NEN_MIN, max: genzaiNen + TAISHOKU_SAKI_NEN };
}
/**
 * ㉑ 配偶者の生年の範囲。★**今年から作ります**（senjutsu_20260902ah.md 3番・382番の向き）。
 *   ★（今年−100）〜（今年−18）。★1920〜2010 という固定の年は置きません。
 */
export function haigushaNenHani(genzaiNen: number): { min: number; max: number } {
  return { min: genzaiNen - 100, max: genzaiNen - 18 };
}
/** ⑲「受け取った年」の下（戦術の決め・ae.md 2-2）。★上は `kikanNenHani().max` と同じ */
const KEN19_NEN_MIN = 1960;

const fieldsOf = (key: keyof FreeInput) => {
  const f = FIELDS.find((x) => x.key === key);
  if (!f) throw new Error(`FIELDS に ${key} がありません`);
  return f;
};

/** ⑥の年の選択肢と範囲。★今年から作ります（af.md 3番の4）：今年−75 〜 今年−35 */
export function seinenHani(genzaiNen: number): { min: number; max: number } {
  return { min: genzaiNen - fieldsOf('taishokuAge').max, max: genzaiNen + TAISHOKU_SAKI_NEN - fieldsOf('taishokuAge').min };
}

/** ⑳の選択肢（60〜75）。★⑥が入ったら上限までに絞る（af.md 2番イ）は `kotekiJogen()` で */
export const KOTEKI_AGE = { min: 60, max: 75 } as const;

export function kotekiJogen(seinen: number, umare: [number, number] | null): number {
  return kurisageJogenAge(seinen, umare);
}

const sai = (kagi: string, kara: Kara, min: number, max: number, ji?: string, select = false): Ran =>
  ({ kagi, shurui: 'kazu', kara, min, max, tani: TANI.sai, ji, select });
const nen = (kagi: string, kara: Kara, min: number, max: number, ji?: string): Ran =>
  ({ kagi, shurui: 'kazu', kara, min, max, tani: TANI.nen, ji, select: true });
const tsuki = (kagi: string, kara: Kara, ji?: string): Ran =>
  ({ kagi, shurui: 'kazu', kara, min: 1, max: 12, tani: TANI.tsuki, ji, select: true });
/**
 * ★年の範囲は今年から作るので、`genzaiNen` を受け取ります（既定値を作りません・ah.md 3番）。
 * @param kumiJi 期間の組の上に小さく置く1行（⑲・㉓）。★⑫⑬は項目そのものが期間なので渡しません（ai.md 2番の2）
 */
const nengetsu = (moto: string, kara: Kara, genzaiNen: number, kumiJi?: string): Ran[] => {
  const k = kikanNenHani(genzaiNen);
  return [
    { ...nen(`${moto}/hajime/nen`, kara, k.min, k.max, RAN_JI.hajime), ...(kumiJi ? { kumiJi } : {}) },
    tsuki(`${moto}/hajime/tsuki`, kara),
    nen(`${moto}/owari/nen`, kara, k.min, k.max, RAN_JI.owari),
    tsuki(`${moto}/owari/tsuki`, kara),
  ];
};
const hai = (kagi: string, ji?: string): Ran => ({ kagi, shurui: 'hai', kara: 'nashi', ji });
const nin = (kagi: string, ji?: string): Ran => ({ kagi, shurui: 'kazu', kara: 'nashi', min: 0, max: 10, tani: TANI.nin, ji });

/** ⑱の選択肢（★運営管理機関ごとの回数は未確認・ae.md 2-4） */
export const KAISU_SENTAKU = [1, 2, 3, 4, 6, 12].map((k) => ({ kagi: String(k), ji: `年${k}回` }));
/** ⑲ の種類 */
export const DC_SENTAKU = [
  { kagi: 'dc', ji: 'iDeCo・企業型DC' },
  { kagi: 'sonota', ji: '退職金・企業年金の一時金・小規模企業共済' },
] as const;
/** ⑰ の選択肢 */
export const KYUCHI_SENTAKU = [
  { kagi: '1', ji: '1級地' }, { kagi: '2', ji: '2級地' }, { kagi: '3', ji: '3級地' }, { kagi: 'habuku', ji: '省く' },
] as const;
/** ⑳ の選択肢（60〜75） */
export const KOTEKI_SENTAKU = Array.from({ length: KOTEKI_AGE.max - KOTEKI_AGE.min + 1 },
  (_, i) => ({ kagi: String(KOTEKI_AGE.min + i), ji: `${KOTEKI_AGE.min + i}歳` }));

/**
 * ★28項目の表（ae.md 2-2 を写したもの・ag.md 1番で⑨⑲㉓を万円に・af.md で⑧・㉕/nai・⑥）。
 * ★⑥の年の範囲だけは今年から作るので、`paidKou(genzaiNen)` で組みます。
 */
export function paidKou(genzaiNen: number): readonly Kou[] {
  const f1 = fieldsOf('taishokukinMan'), f2 = fieldsOf('kinzokuNensu'), f3 = fieldsOf('idecoMan'),
    f4 = fieldsOf('kanyuNensu'), f5 = fieldsOf('taishokuAge');
  const sh = seinenHani(genzaiNen);
  const kn = kikanNenHani(genzaiNen);
  const hn = haigushaNenHani(genzaiNen);
  return [
    { no: '①', katachi: 'tan', ran: { kagi: '①', shurui: 'man', kara: 'hissu', min: f1.min, max: f1.max, tani: TANI.man } },
    { no: '②', katachi: 'tan', ran: { kagi: '②', shurui: 'kazu', kara: 'hissu', min: f2.min, max: f2.max, tani: TANI.nen } },
    { no: '③', katachi: 'tan', ran: { kagi: '③', shurui: 'man', kara: 'hissu', min: f3.min, max: f3.max, tani: TANI.man } },
    { no: '④', katachi: 'tan', ran: { kagi: '④', shurui: 'kazu', kara: 'hissu', min: f4.min, max: f4.max, tani: TANI.nen } },
    { no: '⑤', katachi: 'tan', ran: { kagi: '⑤', shurui: 'kazu', kara: 'hissu', min: f5.min, max: f5.max, tani: TANI.sai } },
    { no: '⑥', katachi: 'kumi', ran: [
      nen('⑥/nen', 'hissu', sh.min, sh.max, RAN_JI.nen),
      tsuki('⑥/tsuki', 'nashi', RAN_JI.tsuki),
      { kagi: '⑥/hi', shurui: 'kazu', kara: 'nashi', min: 1, max: 31, tani: TANI.hi, ji: RAN_JI.hi, select: true },
    ] },
    { no: '⑦', katachi: 'tan', ran: { kagi: '⑦', shurui: 'en', kara: 'nashi', min: 0, max: EN_MAX, tani: TANI.en } },
    { no: '⑧', katachi: 'kumi', ran: [
      { kagi: '⑧', shurui: 'en', kara: 'nashi', min: 0, max: EN_MAX, tani: TANI.en },
      sai('⑧/owari', 'nashi', f5.min, 100, RAN_JI.owari8),
    ] },
    { no: '⑨', katachi: 'tan', ran: { kagi: '⑨', shurui: 'man', kara: 'nashi', min: 0, max: f1.max, tani: TANI.man } },
    { no: '⑩-1', katachi: 'tan', ran: { kagi: '⑩-1', shurui: 'en', kara: 'hissu', min: 0, max: NENKIN_EN_MAX, tani: TANI.en } },
    { no: '⑩-2', katachi: 'tan', ran: { kagi: '⑩-2', shurui: 'en', kara: 'hissu', min: 0, max: NENKIN_EN_MAX, tani: TANI.en } },
    { no: '⑪', katachi: 'ken', max: KEN_MAX, ran: [
      sai('⑪/{n}/age', 'hissu', f5.min, 100, RAN_JI.ken11age),
      { kagi: '⑪/{n}/gaku', shurui: 'en', kara: 'hissu', min: 1, max: EN_MAX, tani: TANI.en, ji: RAN_JI.ken11gaku },
    ] },
    { no: '⑫', katachi: 'kikan', wakaranai: true, ran: nengetsu('⑫', 'hissu', genzaiNen) },
    { no: '⑬', katachi: 'kikan', wakaranai: true, ran: nengetsu('⑬', 'hissu', genzaiNen) },
    { no: '⑲', katachi: 'ken', max: KEN_MAX, ran: [
      nen('⑲/{n}/nen', 'hissu', KEN19_NEN_MIN, kn.max, RAN_JI.ken19nen),
      { kagi: '⑲/{n}/gaku', shurui: 'man', kara: 'hissu', min: 1, max: f1.max, tani: TANI.man, ji: RAN_JI.ken19gaku },
      ...nengetsu('⑲/{n}', 'hissu', genzaiNen, RAN_JI.ken19kikan),
      { kagi: '⑲/{n}/dc', shurui: 'erabu', kara: 'hissu', sentaku: DC_SENTAKU, ji: RAN_JI.ken19dc },
    ] },
    { no: '⑭', katachi: 'tan', ran: nin('⑭') },
    { no: '⑮', katachi: 'tan', ran: { kagi: '⑮', shurui: 'en', kara: 'nashi', min: 0, max: EN_MAX, tani: TANI.en } },
    { no: '⑯', katachi: 'tan', ran: { kagi: '⑯', shurui: 'en', kara: 'nashi', min: 0, max: EN_MAX, tani: TANI.en } },
    { no: '⑱', katachi: 'tan', ran: { kagi: '⑱', shurui: 'erabu', kara: 'hissu', sentaku: KAISU_SENTAKU } },
    { no: '⑳', katachi: 'tan', ran: { kagi: '⑳', shurui: 'erabu', kara: 'hissu', sentaku: KOTEKI_SENTAKU } },
    { no: '㉕', katachi: 'kumi', nai: { kagi: '㉕/nai', ji: JI.haigushaNai, kakusu: ['㉕/shotoku', '㉕/rojin', '㉑/nen'] }, ran: [
      { kagi: '㉕/shotoku', shurui: 'en', kara: 'hissu', min: 0, max: EN_MAX, tani: TANI.en, ji: RAN_JI.haigushaShotoku },
      hai('㉕/rojin', RAN_JI.haigushaRojin),
    ] },
    { no: '㉖', katachi: 'kumi', ran: [
      nin('㉖/tokutei', RAN_JI.tokutei), nin('㉖/rojin', RAN_JI.rojin), nin('㉖/dokyo', RAN_JI.dokyoRojin),
    ] },
    { no: '㉗', katachi: 'kumi', ran: [
      nin('㉗/ippan', RAN_JI.shogaiIppan), nin('㉗/tokubetsu', RAN_JI.shogaiTokubetsu), nin('㉗/dokyo', RAN_JI.shogaiDokyo),
      hai('㉗/kafu', RAN_JI.kafu), hai('㉗/hitorioya', RAN_JI.hitorioya),
    ] },
    { no: '㉔', katachi: 'tan', ran: hai('㉔') },
    { no: '㉓', katachi: 'kumi', nai: { kagi: '㉓/nai', ji: JI.yakuinNai, kakusu: ['㉓/gaku', '㉓/hajime/nen', '㉓/hajime/tsuki', '㉓/owari/nen', '㉓/owari/tsuki'] }, ran: [
      { kagi: '㉓/gaku', shurui: 'man', kara: 'hissu', min: 1, max: f1.max, tani: TANI.man, ji: RAN_JI.yakuinGaku },
      ...nengetsu('㉓', 'hissu', genzaiNen, RAN_JI.yakuinKikan),
    ] },
    // ㉑ ── 配偶者の生年だけ。★「お子さんの人数」の欄は決め待ち（作らない）。★㉕/nai＝はい のときは欄ごと出さない（㉕の kakusu）
    { no: '㉑', katachi: 'kumi', ran: [
      nen('㉑/nen', 'hissu', hn.min, hn.max, RAN_JI.haigushaSeinen),
    ] },
    { no: '㉒', katachi: 'tan', ran: hai('㉒') },
    { no: '⑰', katachi: 'tan', ran: { kagi: '⑰', shurui: 'erabu', kara: 'nashi', sentaku: KYUCHI_SENTAKU } },
  ];
}

/** 画面1の5項目（FreeInput・万円）→ 画面7の鍵（1-3 の表・1か所） */
export const HIKITSUGI_TAIOU: ReadonlyArray<{ free: keyof FreeInput; no: string }> = [
  { free: 'taishokukinMan', no: '①' },
  { free: 'kinzokuNensu', no: '②' },
  { free: 'idecoMan', no: '③' },
  { free: 'kanyuNensu', no: '④' },
  { free: 'taishokuAge', no: '⑤' },
];

/**
 * 通行証の `inputs` → 画面7の `hikitsugi`（raw）。
 *   (a) 購入時の形（`metadataKaraModosu` の FreeInput・★万円のまま）→ 5項目だけ
 *   (b) 口が上書きした形 `{ kata:'raw28', raw }` → raw をそのまま
 *   ★形が違えば空（入力から）
 */
export function inputsKaraRaw(inputs: unknown): Record<string, string> {
  if (typeof inputs !== 'object' || inputs === null || Array.isArray(inputs)) return {};
  const o = inputs as Record<string, unknown>;
  if (o.kata === 'raw28' && typeof o.raw === 'object' && o.raw !== null && !Array.isArray(o.raw)) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(o.raw as Record<string, unknown>)) if (typeof v === 'string') out[k] = v;
    return out;
  }
  const out: Record<string, string> = {};
  for (const t of HIKITSUGI_TAIOU) {
    const v = o[t.free];
    if (typeof v === 'number' && Number.isInteger(v)) out[t.no] = String(v);
  }
  return out;
}

// ---------------------------------------------------------------- 字 → 整数
/** 全角の数字・カンマ・空白を整えます。★小数点はそのまま残す（seisu で落とすため） */
export function seisuNiSuru(s: string): { ok: true; n: number } | { ok: false; kara: true } | { ok: false; kara: false } {
  const t = s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[,，、\s　]/g, '')
    .replace(/[－−―]/g, '-');
  if (t === '') return { ok: false, kara: true };
  if (!/^-?\d+$/.test(t)) return { ok: false, kara: false };
  const n = Number(t);
  if (!Number.isSafeInteger(n)) return { ok: false, kara: false };
  return { ok: true, n };
}

export type Kimari = 'hissu' | 'seisu' | 'min' | 'max' | 'sentaku' | 'koe';
export type Ayamari = { no: string; kagi: string; kimari: Kimari; /** 越えの字（あれば） */ ji?: string };

/** 誤りを利用者に見せる字にする。★字は `JI` と `PAID_FIELDS` の label から */
export function ayamariNoJi(a: Ayamari, ran?: Ran): string {
  if (a.ji) return a.ji;
  const label = PAID_FIELDS.find((f) => f.no === a.no)?.label ?? a.no;
  const ire = (s: string) => s.replace('{ラベル}', label)
    .replace('{min}', ran?.min !== undefined ? ran.min.toLocaleString('en-US') : '')
    .replace('{max}', ran?.max !== undefined ? ran.max.toLocaleString('en-US') : '');
  switch (a.kimari) {
    case 'hissu': return ire(JI.hissu);
    case 'seisu': return ire(JI.seisu);
    case 'min': case 'max': return ire(JI.hani);
    case 'sentaku': return ire(JI.sentaku);
    case 'koe': return ire(JI.koe);
  }
}

/** 欄を鍵で引く（`{n}` は番号に置き換えたもの） */
export function ranWoHiku(kou: readonly Kou[], kagi: string): Ran | undefined {
  for (const k of kou) {
    if (k.katachi === 'tan') { if (k.ran.kagi === kagi) return k.ran; continue; }
    for (const r of k.ran) {
      if (k.katachi === 'ken') {
        for (let n = 1; n <= k.max; n++) if (r.kagi.replace('{n}', String(n)) === kagi) return { ...r, kagi };
      } else if (r.kagi === kagi) return r;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------- raw → PaidInput
type Yomi = { ok: true; v: PaidInput } | { ok: false; ayamari: Ayamari[] };

/**
 * 生の字 → `PaidInput`。★誤りは全部集めて返します（1つ目で止めません）。
 * ★`genzaiNen` は呼び出し側から（画面7は親の `genzaiNen`・口は受け取った時刻の `tokyoYear`）。既定値を作りません。
 */
export function rawToPaidInput(raw: Record<string, string>, genzaiNen: number): Yomi {
  const kou = paidKou(genzaiNen);
  const ayamari: Ayamari[] = [];
  const dame = (no: string, kagi: string, kimari: Kimari, ji?: string) => { ayamari.push({ no, kagi, kimari, ji }); };
  const moji = (kagi: string): string => (typeof raw[kagi] === 'string' ? raw[kagi] : '');

  /** 数の欄。★空は `kara` で決める。戻り null＝空（nashi） */
  const kazu = (no: string, r: Ran): number | null => {
    const s = moji(r.kagi);
    const y = seisuNiSuru(s);
    if (!y.ok) {
      if (y.kara) { if (r.kara === 'hissu') dame(no, r.kagi, 'hissu'); return null; }
      dame(no, r.kagi, 'seisu'); return null;
    }
    let n = y.n;
    if (r.min !== undefined && n < r.min) { dame(no, r.kagi, 'min'); return null; }
    if (r.max !== undefined && n > r.max) { dame(no, r.kagi, 'max'); return null; }
    if (r.shurui === 'man') n = n * 10_000;   // ★整数のまま（float なし）
    return n;
  };
  const erabu = (no: string, r: Ran): string | null => {
    const s = moji(r.kagi);
    if (s === '') { if (r.kara === 'hissu') dame(no, r.kagi, 'sentaku'); return null; }
    if (!r.sentaku?.some((x) => x.kagi === s)) { dame(no, r.kagi, 'sentaku'); return null; }
    return s;
  };
  const hai = (kagi: string): boolean => moji(kagi) === 'hai';
  const byNo = new Map(kou.map((k) => [k.no, k]));
  const ranOf = (no: string, kagi: string): Ran => {
    const k = byNo.get(no)!;
    if (k.katachi === 'tan') return k.ran;
    const r = k.ran.find((x) => x.kagi === kagi);
    if (!r) throw new Error(`paidRules: ${no} に ${kagi} がありません`);
    return r;
  };
  const tan = (no: string) => { const k = byNo.get(no)!; if (k.katachi !== 'tan') throw new Error(no); return k.ran; };

  // ---- ①〜⑤（FIELDS の範囲・万円は ×10000）
  const taishokukin = kazu('①', tan('①'));
  const kinzokuNensu = kazu('②', tan('②'));
  const ideco = kazu('③', tan('③'));
  const kanyuNensu = kazu('④', tan('④'));
  const taishokuAge = kazu('⑤', tan('⑤'));

  // ---- ⑥ 生年月日（月日はどちらか空なら null・暦に無い組は誤り）
  const seinen = kazu('⑥', ranOf('⑥', '⑥/nen'));
  const tsuki6 = kazu('⑥', ranOf('⑥', '⑥/tsuki'));
  const hi6 = kazu('⑥', ranOf('⑥', '⑥/hi'));
  let umare: [number, number] | null = null;
  if (tsuki6 !== null && hi6 !== null) {
    // ★暦に無い月日（2月30日など）は誤り。年が要るので、seinen が取れたときだけ見る（うるう年）
    const y = seinen ?? 2001;
    const d = new Date(Date.UTC(y, tsuki6 - 1, hi6));
    if (d.getUTCMonth() !== tsuki6 - 1 || d.getUTCDate() !== hi6) dame('⑥', '⑥/hi', 'koe');
    else umare = [tsuki6, hi6];
  }

  // ---- 退職の年（越え1）
  const taishokuNen = seinen !== null && taishokuAge !== null ? seinen + taishokuAge : null;
  if (taishokuNen !== null) {
    if (taishokuNen < genzaiNen) dame('⑤', '⑤', 'koe', JI.taishokuMae);
    else if (taishokuNen > genzaiNen + TAISHOKU_SAKI_NEN) dame('⑤', '⑤', 'koe', JI.taishokuSaki);
  }

  // ---- ⑦⑧
  const shunyuTaishokuNen = kazu('⑦', tan('⑦')) ?? 0;
  const shunyuYokutoshiIkou = kazu('⑧', ranOf('⑧', '⑧')) ?? 0;
  let shunyuOwariAge = taishokuAge ?? 0;
  if (shunyuYokutoshiIkou > 0) {
    const r = ranOf('⑧', '⑧/owari');
    const o = kazu('⑧', { ...r, kara: 'hissu' });
    if (o !== null) {
      if (taishokuAge !== null && o < taishokuAge + 1) dame('⑧', '⑧/owari', 'koe', JI.owari8);   // 越え3
      else shunyuOwariAge = o;
    }
  }

  // ---- ⑨⑩
  const kigyoNenkin = kazu('⑨', tan('⑨')) ?? 0;
  const koseiNenkin = kazu('⑩-1', tan('⑩-1')) ?? 0;
  const kisoNenkin = kazu('⑩-2', tan('⑩-2')) ?? 0;

  // ---- ⑪ 支出（最大5件・同じ歳は誤り）
  const shishutsu: Record<number, number> = {};
  {
    const k = byNo.get('⑪')!; if (k.katachi !== 'ken') throw new Error('⑪');
    for (let n = 1; n <= k.max; n++) {
      const rs = k.ran.map((r) => ({ ...r, kagi: r.kagi.replace('{n}', String(n)) }));
      if (!rs.some((r) => moji(r.kagi) !== '')) continue;   // 件が無い
      const age = kazu('⑪', rs[0]);
      const gaku = kazu('⑪', rs[1]);
      if (age === null || gaku === null) continue;
      if (age in shishutsu) { dame('⑪', rs[0].kagi, 'koe'); continue; }
      shishutsu[age] = gaku;
    }
  }

  // ---- ⑫⑬ 期間（「わからない」か、年月×2）
  const kikan = (no: '⑫' | '⑬'): Kikan | null => {
    if (moji(no) === 'wakaranai') return 'wakaranai';
    const k = byNo.get(no)!; if (k.katachi !== 'kikan') throw new Error(no);
    const [hn, ht, on, ot] = k.ran.map((r) => kazu(no, r));
    if (hn === null || ht === null || on === null || ot === null) return null;
    const hajime: Nengetsu = { nen: hn, tsuki: ht }, owari: Nengetsu = { nen: on, tsuki: ot };
    if (hn * 12 + ht > on * 12 + ot) { dame(no, k.ran[2].kagi, 'koe'); return null; }         // 越え4
    if (taishokuNen !== null && on > taishokuNen) { dame(no, k.ran[2].kagi, 'koe'); return null; }
    return { hajime, owari };
  };
  const kinzokuKikan = kikan('⑫');
  const kanyuKikan = kikan('⑬');

  // ---- ⑲ すでに受け取った退職手当等（最大5件）
  const sumi: Sumi[] = [];
  {
    const k = byNo.get('⑲')!; if (k.katachi !== 'ken') throw new Error('⑲');
    for (let n = 1; n <= k.max; n++) {
      const rs = k.ran.map((r) => ({ ...r, kagi: r.kagi.replace('{n}', String(n)) }));
      if (!rs.some((r) => moji(r.kagi) !== '')) continue;
      const uketoriNen = kazu('⑲', rs[0]);
      const gaku = kazu('⑲', rs[1]);
      const hn = kazu('⑲', rs[2]), ht = kazu('⑲', rs[3]), on = kazu('⑲', rs[4]), ot = kazu('⑲', rs[5]);
      const dc = erabu('⑲', rs[6]);
      if (uketoriNen === null || gaku === null || hn === null || ht === null || on === null || ot === null || dc === null) continue;
      if (taishokuNen !== null && uketoriNen > taishokuNen - 1) { dame('⑲', rs[0].kagi, 'koe'); continue; }   // 越え5
      if (hn * 12 + ht > on * 12 + ot) { dame('⑲', rs[4].kagi, 'koe'); continue; }                             // 越え4
      if (taishokuNen !== null && on > taishokuNen) { dame('⑲', rs[4].kagi, 'koe'); continue; }
      sumi.push({ uketoriNen, gaku, kikan: { hajime: { nen: hn, tsuki: ht }, owari: { nen: on, tsuki: ot } }, dc: dc === 'dc' });
    }
  }

  // ---- ⑭⑮⑯
  const fuyouIppan = kazu('⑭', tan('⑭')) ?? 0;
  const shakaiHoken = kazu('⑮', tan('⑮')) ?? 0;
  const seimeiHoken = kazu('⑯', tan('⑯')) ?? 0;

  // ---- ⑱⑳
  const kaisu = erabu('⑱', tan('⑱'));
  const koteki = erabu('⑳', tan('⑳'));
  const kotekiKaishiAge = koteki === null ? null : Number(koteki);
  if (kotekiKaishiAge !== null && seinen !== null) {                                          // 越え2
    const jogen = kotekiJogen(seinen, umare);
    if (kotekiKaishiAge > jogen) dame('⑳', '⑳', 'koe', JI.kurisageJogen.replace('{上限}', String(jogen)));
  }

  // ---- ㉕（配偶者）・㉑
  const haigushaNai = hai('㉕/nai');
  let haigushaShotoku: number | null = null;
  let haigushaRojin = false;
  let haigushaSeinen: number | null = null;
  if (!haigushaNai) {
    haigushaShotoku = kazu('㉕', ranOf('㉕', '㉕/shotoku'));
    haigushaRojin = hai('㉕/rojin');
    haigushaSeinen = kazu('㉑', ranOf('㉑', '㉑/nen'));
  }

  // ---- ㉖㉗㉔㉒⑰
  const fuyouTokutei = kazu('㉖', ranOf('㉖', '㉖/tokutei')) ?? 0;
  const fuyouRojin = kazu('㉖', ranOf('㉖', '㉖/rojin')) ?? 0;
  const fuyouDokyoRojin = kazu('㉖', ranOf('㉖', '㉖/dokyo')) ?? 0;
  const shogaiIppan = kazu('㉗', ranOf('㉗', '㉗/ippan')) ?? 0;
  const shogaiTokubetsu = kazu('㉗', ranOf('㉗', '㉗/tokubetsu')) ?? 0;
  const shogaiDokyoTokubetsu = kazu('㉗', ranOf('㉗', '㉗/dokyo')) ?? 0;
  const kafu = hai('㉗/kafu');
  const hitorioya = hai('㉗/hitorioya');
  const shogaiTaishoku = hai('㉔');
  const kosei20nen = hai('㉒');
  const kyuchiRaw = erabu('⑰', tan('⑰'));
  const kyuchi: Kyuchi = kyuchiRaw === '1' ? 1 : kyuchiRaw === '2' ? 2 : kyuchiRaw === '3' ? 3 : 'habuku';

  // ---- ㉓ 役員退職慰労金
  let yakuin: PaidInput['yakuin'] = null;
  if (!hai('㉓/nai')) {
    const k = byNo.get('㉓')!; if (k.katachi !== 'kumi') throw new Error('㉓');
    const gaku = kazu('㉓', k.ran[0]);
    const [hn, ht, on, ot] = k.ran.slice(1).map((r) => kazu('㉓', r));
    if (gaku !== null && hn !== null && ht !== null && on !== null && ot !== null) {
      if (hn * 12 + ht > on * 12 + ot) dame('㉓', k.ran[3].kagi, 'koe');                       // 越え4
      else if (taishokuNen !== null && on > taishokuNen) dame('㉓', k.ran[3].kagi, 'koe');
      else yakuin = { gaku, kikan: { hajime: { nen: hn, tsuki: ht }, owari: { nen: on, tsuki: ot } } };
    }
  }

  if (ayamari.length) return { ok: false, ayamari };
  // ★ここまでで hissu の欄は全部取れています（取れていなければ ayamari に入っています）
  if (taishokukin === null || kinzokuNensu === null || ideco === null || kanyuNensu === null || taishokuAge === null
      || seinen === null || kinzokuKikan === null || kanyuKikan === null || kaisu === null || kotekiKaishiAge === null) {
    return { ok: false, ayamari: [{ no: '①', kagi: '①', kimari: 'hissu' }] };
  }

  return {
    ok: true,
    v: {
      taishokukin, kinzokuNensu, ideco, kanyuNensu, taishokuAge,
      seinen, umare, shunyuTaishokuNen, shunyuYokutoshiIkou, shunyuOwariAge,
      kigyoNenkin, koseiNenkin, kisoNenkin, shishutsu, kinzokuKikan, kanyuKikan, sumi,
      fuyouIppan, shakaiHoken, seimeiHoken,
      nenkinKaisu: Number(kaisu), kotekiKaishiAge,
      haigushaShotoku, haigushaRojin, fuyouTokutei, fuyouRojin, fuyouDokyoRojin,
      shogaiIppan, shogaiTokubetsu, shogaiDokyoTokubetsu, kafu, hitorioya, shogaiTaishoku,
      yakuin, haigushaSeinen,
      /**
       * ★★㉑「お子さんの人数」── 森嶋さんの決めが出るまで欄を作りません（ae.md 5番）。
       *   ★ここは「0人」と決めたのではなく、**欄が無いので渡せない**という仮置きです。決めが出たら欄を足し、この行を消します。
       */
      koNin: 0,
      kosei20nen, kyuchi,
    },
  };
}
