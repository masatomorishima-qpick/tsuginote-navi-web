/**
 * lib/retirement/pro/nayami.ts — 悩みのカード3枚の字と絵（★この本だけが持ちます）
 *
 * ★★★**この本は、`kensa/nayami_chushutsu.mjs` が基準HTMLから機械で作ったものです。**
 *   ★手で直さないでください。★基準HTMLが変わったら、作り直してください。
 *
 * ★★2026-09-23（決め1415）…… 「手取りに差が出る理由」のコーナー（`riyu.ts`）が、この3枚の**上**に入りました。
 *   ★見出しの直後にリード文（`NAYAMI_SEIDO`）が入りました。★字はこの1本に集めてあります。
 * ★★★`kensa/nayami_mon.tsx` が、基準HTMLを読み直して突き合わせます。
 *
 * 抜き出しもと: tsuginote_gamen_base.html（231,585バイト ／ md5 fff8b350b32682a0676565790b3ca255）
 */

/** かたまりの見出し（★`data-block-start="nayami"`） */
export const NAYAMI_MIDASHI = "このツールをお使いになる方から、よくうかがう3つです";

/** 見出しの直後のリード文（★`data-block-start="seido"`・全員に出ます。★2026-09-23・決め1415 の回） */
export const NAYAMI_SEIDO = "退職金と年金の決まりは、ここ数年、たびたび変わっています。どの受け取り方がご自分に合うかは、ご自分では確かめにくいところです。";

/** リード文のすぐ下の、`iDeCo等` の断り1行（★カードの外です） */
export const NAYAMI_KOTOWARI = "このページでは、iDeCo・企業型DCをまとめて「iDeCo等」と書きます。";

/** 絵の実の大きさ（★`public/retirement/pro/*.webp` は3本とも同じ。★`kensa/e_ookisa_mon.mjs` が数えます） */
export const NAYAMI_E_HABA = 1600;
export const NAYAMI_E_TAKASA = 900;

export type NayamiKado = {
  /** 絵の道（`public/` から） */
  readonly michi: string;
  /** 読み上げの字（★悩みそのものは書きません。★意味はすぐ下の字が持ちます） */
  readonly alt: string;
  /** 太字の1文 */
  readonly futoji: string;
  /** ふつうの1文 */
  readonly ji: string;
};

/** カード3枚（★基準HTMLの並びのまま） */
export const NAYAMI_KADO: readonly NayamiKado[] = [
  {
    michi: "/retirement/pro/card1_calendar.webp",
    alt: "カレンダーの前で、封筒を1通ずつ持って考えている60代のご夫婦のイラスト",
    futoji: "あなたの退職金とiDeCo等を同じ年に受け取ると、税を軽くする枠（退職所得控除）が1回分しか使えないことがあります。",
    ji: "何年ずらせば枠を2回使えるのかは、ご自分では確かめにくいところです。",
  },
  {
    michi: "/retirement/pro/card2_mailbox.webp",
    alt: "郵便受けから封書を取り出して考えている60代の男性のイラスト",
    futoji: "受け取り方によっては、翌年のあなたの公的医療保険料や介護保険料が上がることがあります。",
    ji: "どの受け取り方なら上がらないのかは、どこにも書かれていません。",
  },
  {
    michi: "/retirement/pro/card3_paths.webp",
    alt: "いくつにも分かれた道の前に立って考えている60代の女性のイラスト",
    futoji: "あなたのiDeCo等は、一時金でも、年金でも受け取れます。年金なら、何年に分けるかも選べます。",
    ji: "組み合わせは数万通りになり、ご自分で比べきることができません。",
  },
];

