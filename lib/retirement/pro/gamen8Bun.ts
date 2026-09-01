/**
 * lib/retirement/pro/gamen8Bun.ts ── 画面8に出す**文**を作る（`v5/summary_gen.py` の移植）
 *
 * **文の出し分けは、実装側に持たせません。**ここが文字列を返し、`Screen8.tsx` は並べるだけです。
 * 基準HTMLの第2部（3人）は `summary_gen.py` の出力そのものなので、
 * **`kensa/bun8_totsugou.tsx` で、その3人と1文字ずつ突き合わせています。**
 *
 * 【出し分けが要るところ】
 *  1 カードが1つのとき  … 「1つの方向にまとまりました」＋4つの見方の説明
 *    カードが2つ以上   … 「大きく◯つの方向に分かれます」
 *  2 差が出ないとき（`saidai <= 基準`）… 「◯◯が、あなたにとってもいちばんでした。」
 *    **【E-23】これは「基準が見つかったうえで、それがいちばんだった」ときの文です。**
 *    **基準が見つからないときに、ここへ落としてはいけません。**`gamen8()` が例外で止めます。
 *  3 いちばん上のカードが保険料の境目を超えるかどうかで、注意点の最後の文が変わります
 *  4 退職金＋iDeCo等が退職所得控除に収まる方だけ、「なぜこれが答えになるのか」を出します
 */
import * as Z from './zeisei';
import type { Gamen8, Houkou } from './gamen8';

/** 金額。**表とカードは円**（§7-8） */
export const y = (n: number): string => `${n.toLocaleString('en-US')}円`;

export type Bun8 = {
  /** 見出し（h2）。基準HTMLでは途中で改行しています */
  midashi: string[];
  /** いちばん上の答え。`ookii` が大きく出る額 */
  atama: { lbl: string; ookii: string; sub: string; sabun: boolean };
  /** 方向の数の文 */
  judge: { hon: string; hosoku: string };
  /** カード（手取りの多い順） */
  cards: { why: string; how: string; hyo: [string, string][] }[];
  /** 2枚目のカードの**後**に置く差（オーナー判断・2026-08-13） */
  sa: { zei: string; tedori: string } | null;
  /**
   * ④A **すでに公的年金を受け取り始めている方だけに出す文。**空なら出しません。
   *
   * 字は戦術Cowork `senjutsu_20260831g.md` 4番(2)のとおりです。
   * ★**{⑳} は、その方の入力の⑳（`arg.kotekiAge`）です。65で固定しません。**
   * ★出すか出さないかは `g.koteki_sudeni` が決めています。**ここに式を置きません。**
   * ★戦術Coworkの便には「2文になりました」とありますが、**渡された字は3文**です。
   *   **字のほうをそのまま使いました。**（第75便で確かめていただきます）
   */
  sudeni: string;
  /** 控除に収まる方だけ出す説明。`hon` が空なら出しません */
  naze: { midashi: string; hon: string };
  /** 境目の注意（カードごと）。0件なら出しません */
  sakaime: { midashi: string; gyo: string[]; ato: string }[];
  /** 注意点 */
  chui: string[];
  /** 申告書の注意 */
  shinkokusho: string;
  /** 「ファイルの中身」の表。**通り数が入るので、ここで作ります**（画面に式を持たせない） */
  fileNakami: [string, string][];
};

export function gamen8Bun(
  g: Gamen8,
  arg: {
    taiName: string; idecoName: string;
    /** ⑤（退職金を受け取る年齢） */
    taishokuAge: number;
    /** ⑳（公的年金を受け取り始める年齢）。**「なぜこれが答えになるのか」に出ます** */
    kotekiAge: number;
    /** 勤続年数（退職所得控除の計算に使う） */
    kinzokuNensu: number;
    /** 退職金の額 */
    taiGaku: number;
    /** iDeCo等の額 */
    idecoGaku: number;
  },
): Bun8 {
  const { taiName, idecoName, taishokuAge } = arg;
  // **手取りの多い順**に並べ直す（`summary_gen.py` の `hk`）
  const hk: Houkou[] = [...g.houkou].sort((a, b) => b.tedori - a.tedori);

  // ---- 方向の数 ----
  const judge = hk.length === 1
    ? { hon: 'あなたの受け取り方は、\n1つの方向にまとまりました。',
        hosoku: '4つの見方のどれで比べても、同じ受け取り方がいちばんです。迷う必要はありません。' }
    : { hon: `あなたの受け取り方は、\n大きく${hk.length}つの方向に分かれます。`, hosoku: '' };

  // ---- カード ----
  const howOf = (lab: string): string => {
    if (lab.includes('から年金') || lab.includes('一時金')) {
      if (lab === `${taishokuAge}歳で一時金`) {
        return `${taiName}も${idecoName}も\n${taishokuAge}歳で一時金`;
      }
      return `${taiName}は${taishokuAge}歳で一時金\n${idecoName}は${lab}`;
    }
    return lab;
  };
  const cards = hk.map((h) => ({
    why: h.mikata.join('　'),
    how: howOf(h.lab),
    hyo: [
      ['あなたの税金', y(h.zei)],
      ['あなたの手取り', y(h.tedori)],
      ['最初の年に入る額', y(h.age0)],
      ['受け取り終わる年齢', `${h.owari}歳`],
      ['保険料・医療費', h.sakaime.length ? '上がる場合あり' : '変わりません'],
    ] as [string, string][],
  }));

  // ---- 差（2枚目のカードの後）----
  //   ※「税金の差」と「手取りの差」は**同じ額ではありません**（手数料の差があるため）。
  const sa = hk.length >= 2
    ? { zei: y(hk[1].zei - hk[0].zei), tedori: y(hk[0].tedori - hk[1].tedori) }
    : null;

  // ---- いちばん上の答え ----
  const moto = `多くの方が選ぶ「一時金だけ」（あなたの場合：${g.kijun.hyoji}）`;
  const ik = g.kijun.tedori;
  const atama = g.saidai > ik
    ? { lbl: `${moto}だと ${y(ik)}。\nあなたの手取りは、いちばん多くて`,
        ookii: y(g.saidai), sub: `差は ${y(g.saidai - ik)} です。`, sabun: true }
    // **【E-23】基準が見つかったうえで、それがいちばんだったとき**の文です。
    //   基準が見つからないときは `gamen8()` が例外で止まるので、ここには来ません。
    : { lbl: 'あなたの手取りは、いちばん多くて',
        ookii: y(g.saidai), sub: `${moto}が、あなたにとってもいちばんでした。`, sabun: false };

  // ---- なぜこれが答えになるのか（控除に収まる方だけ）----
  const kojo = Z.taishokuKojo(arg.kinzokuNensu);
  const zengaku = arg.taiGaku + arg.idecoGaku;
  const nazeHon = zengaku <= kojo
    ? `あなたの${taiName}${y(arg.taiGaku)}は、勤続${arg.kinzokuNensu}年でつくられる`
      + `退職所得控除${y(kojo)}に収まります。${idecoName}${y(arg.idecoGaku)}を同じ年に足しても`
      + `${y(zengaku)}で、まだ控除の中です。分ける理由がありません。\n`
      + `年金にすると、${arg.kotekiAge}歳から始まるあなたの公的年金に足されて所得が増え、`
      + '税金も保険料も上がります。'
    : '';
  const naze = { midashi: 'なぜこれが答えになるのか', hon: nazeHon };

  // ---- 境目の注意（カードごと）----
  //   【2026-08-15】**どのカードの話かを名前で書く。**方向が3つに分かれる方では、
  //   この囲みが最後のカード（「変わりません」）のすぐ下に並ぶため、
  //   「この受け取り方」が最後のカードを指すように読めていた。
  const sakaime = hk.filter((h) => h.sakaime.length).map((h) => ({
    midashi: `「${h.mikata.join('　')}」の受け取り方を選ぶと、`
      + '次の年齢で公的医療保険料・介護保険料・医療費の負担が上がる場合があります',
    gyo: h.sakaime.map((s) =>
      `${s.name}（${s.age}歳・あなたの${s.shotoku}${y(s.shotoku_gaku)}／基準${y(s.gaku)}）`),
    ato: '保険料がいくら上がるかは、率を市区町村がそれぞれ決めているため出していません。'
      + '上に出した基準の額は国が定めているものです。',
  }));

  // ---- 注意点 ----
  //   「上の受け取り方」「その中」が何かを、**名前と数で**書く（ご指摘の修正）
  const ue = hk[0].lab;
  const clBun = hk[0].sakaime.length === 0
    ? `そのうち、公的医療保険料・介護保険料が上がらないのは${g.hoken_agaranai_su.toLocaleString('en-US')}通りです。`
      + `いちばん上に出した「${ue}」も、この${g.hoken_agaranai_su.toLocaleString('en-US')}通りに入っています。`
    : `そのうち、公的医療保険料・介護保険料が上がらないのは${g.hoken_agaranai_su.toLocaleString('en-US')}通りです。`
      + `いちばん上に出した「${ue}」は、この${g.hoken_agaranai_su.toLocaleString('en-US')}通りには入っていません。`;

  return {
    midashi: ['[有料版]退職金とiDeCoの', '受け取り方シミュレーション 計算結果'],
    atama, judge, cards, sa, naze, sakaime,
    chui: [
      '上の手取りに公的医療保険料・介護保険料は含めていません',
      `あなたの${taiName}を一時金で受け取ることは、保険料には影響しません`,
      `いちばん少ない受け取り方を選ぶと ${y(g.saisho)} です（差は ${y(g.saidai - g.saisho)}）`,
      `あなたが選べる受け取り方 ${g.toorisu.toLocaleString('en-US')}通り をすべて計算しています。${clBun}`,
    ],
    // ④A **出すかどうかは `g.koteki_sudeni` だけが決めます**（`gamen8.ts`）。
    //     通り数のことは、ここに書きません。注意点にすでに出ています
    //     （戦術Cowork `senjutsu_20260831g.md` 4番(2)）
    sudeni: g.koteki_sudeni
      ? `あなたは、公的年金を${arg.kotekiAge}歳から受け取り始めています。\n`
        + '受け取り始めた年齢は、あとから変えられません。\n'
        + `そのため、この計算では公的年金を${arg.kotekiAge}歳のままにして、`
        // ★2026-08-31・第76便で `taiName` `idecoName` に直しました
        //   （戦術Cowork `senjutsu_20260831j.md` 4番(3)）。
        //   ★**基準HTMLの B-2（画面7の⑳のⓘ）は、直しません。**
        //     `paidFields.ts` は、その方の名前を持っていません（「退職金」が10か所・
        //     `taiName` は1度も使われていません）。B-2 だけ直すと、その1か所だけが浮きます。
        + `あなたの${taiName}と${idecoName}の受け取り方だけを比べています。`
      : '',
    shinkokusho:
      `「退職所得の受給に関する申告書」は、あなたが${taiName}を受け取るまでに勤め先へ出してください。`
      + `出さないと、あなたの${taiName}の収入金額の20.42%がいったん源泉徴収されます`
      + '（所得税法201条3項＋復興特別所得税）。最終的な税額は変わりません。確定申告で精算されます。'
      + '変わるのは、いったん引かれる額と、戻ってくるまでの時間だけです。'
      + 'このツールは出した場合で計算しています。',
    fileNakami: [
      ['1　結果のまとめ',
       'この画面と同じ内容（あなたの受け取り方・税金・手取り・保険料が上がる年齢）'],
      ['2　受け取り方の一覧',
       `${g.toorisu.toLocaleString('en-US')}通りすべて。受け取り方／税金／手取り／`
       + '最初の年に入る額／受け取り終わる年齢／保険料が上がる年齢'],
      ['3　年ごとの内訳',
       '選んだ受け取り方について、あなたの年齢ごとに手元に入る額と、その年に納める税金'],
      ['4　計算の内容と根拠',
       'あなたがご入力になった内容、計算の全ステップ、根拠にした条文'],
    ],
  };
}
