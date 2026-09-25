/**
 * lib/retirement/pro/riyu.ts — 「手取りに差が出る理由」の字と絵（★この本だけが持ちます）
 *
 * ★★★**この本は、`kensa/riyu_chushutsu.mjs` が基準HTMLから機械で作ったものです。**
 *   ★手で直さないでください。★基準HTMLが変わったら、作り直してください。
 * ★決め1415（2026-09-23・戦術Cowork `kaihatsu_ate_20260923c.md`）。★悩みのカード（`nayami.ts`）とは別の1本です。
 * ★★★`kensa/riyu_mon.tsx` が、基準HTMLを読み直して突き合わせます。
 *
 * 抜き出しもと: tsuginote_gamen_base.html（233,785バイト ／ md5 826475b1a35543440d3ff55261481c27）
 */

/** かたまりの見出し（★`data-block-start="riyu"`） */
export const RIYU_MIDASHI = "手取りに差が出る理由";

/** 絵の実の大きさ（★`kensa/e_ookisa_mon.mjs` が `public/retirement/pro/*.webp` をぜんぶ数えます） */
export const RIYU_E_HABA = 1600;
export const RIYU_E_TAKASA = 900;

export type RiyuKado = {
  /** 絵の道（`public/` から） */
  readonly michi: string;
  /** 読み上げの字 */
  readonly alt: string;
  /** 太字の1本（「理由1：…」） */
  readonly futoji: string;
  /** ふつうの1文 */
  readonly ji: string;
};

/** 理由2つ（★基準HTMLの並びのまま） */
export const RIYU_KADO: readonly RiyuKado[] = [
  {
    michi: "/retirement/pro/riyu1_ichijikin.webp",
    alt: "厚みのある封筒を1通だけ受け取っている60代のご夫婦のイラスト",
    futoji: "理由1：退職所得控除",
    ji: "あなたが一時金で受け取る分は、同じ年にまとめるか年を分けるかで、使える枠が変わります。",
  },
  {
    michi: "/retirement/pro/riyu2_nenkin.webp",
    alt: "小さな封筒が毎年並ぶ横で、通帳を見ている60代のご夫婦のイラスト",
    futoji: "理由2：年間の所得控除",
    ji: "あなたが年金で受け取る分は、受け取る年ごとの所得になり、何年かけるかで税と保険料が変わります。",
  },
];

