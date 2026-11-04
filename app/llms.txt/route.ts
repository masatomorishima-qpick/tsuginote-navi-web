/**
 * /llms.txt — AI検索・LLM向けのサイト案内
 *
 * 原則：**費用・金利などの具体的な数値をこのファイルに書かない。**
 *   数値は記事本文（＝更新される場所）に任せ、ここは「どのページが何を扱っているか」の案内に徹する。
 *
 * 2026-11-04：トップの作り直し（入口3つ）にあわせて書き直した。
 *   住宅ローン・退職金・家計診断は、売上がなく検索のクリックも少なかったためページごと削除（docs/site-top.md）。
 */

const SITE_URL = "https://www.tsuginotenavi.jp";

export const dynamic = "force-static";

export function GET() {
  const body = `# つぎの手ナビ

> 暮らしで迷ったときに、次にやることが分かるところまでまとめたサイトです。住まいの設備（給湯器の交換）、暮らしの整理（パスワード・保険・家族との共有）、相続・もしもの備えを扱います。金額や制度は公式の発表や販売価格をもとにし、出典を各ページに書いています。

運営：Blue Adventures（${SITE_URL}/company）

## 住まいの設備

- [ガス給湯器の交換費用の目安](${SITE_URL}/kyutoki/kokan-hiyou): 種類・号数別の交換費用の目安と、見積もりの確かめ方。
- [給湯器のお湯が出ないとき](${SITE_URL}/kyutoki/oyu-ga-denai): 使用年数と症状から、修理か交換かの目安を確かめる診断。

## 暮らしの整理

- [暮らしの整理（ガイド一覧）](${SITE_URL}/guide): デジタルの整理、パスワード・認証の管理、家族との情報共有、保険・お金の管理の解説記事。
- [保険契約の一覧表をエクセルで作る方法](${SITE_URL}/guide/shisan-kanri/hoken-ichiran-excel): 無料テンプレート付き。
- [スマホのパスワード管理](${SITE_URL}/guide/password-kanri/sumaho-password): メモ帳管理の危険と、忘れずに安全に管理する方法。

## 相続・もしもの備え

- [デジタル遺品の整理](${SITE_URL}/guide/ihinseiri): スマホやネットの口座を家族に引き継ぐための準備。
- [急な入院に備えて家族に伝えておく情報](${SITE_URL}/guide/moshimo-sonae/kyu-nyuin-sonae)

## サイト情報

- [プライバシーポリシー](${SITE_URL}/privacy)
- [中立性ポリシー](${SITE_URL}/policy)
- [利用規約](${SITE_URL}/terms)
- [運営会社・お問い合わせ](${SITE_URL}/company)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
