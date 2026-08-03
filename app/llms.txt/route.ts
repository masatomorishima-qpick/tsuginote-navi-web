import { LOAN_ARTICLES } from "@/lib/loan/articles";
import { RETIREMENT_ARTICLES } from "@/lib/retirement/articles";

/**
 * /llms.txt — AI検索・LLM向けのサイト案内（2026-07-29 に動的生成へ移行）
 *
 * 経緯：もともと public/llms.txt に手書きで置いていたが、記事を増やしても更新されず、
 * 住宅ローン記事が1本しか載っていない状態だった。さらに借り換え費用の概算が
 * 2026-07-28 に修正する前の古い数字のまま残り、**AI検索に誤った数値を渡していた**。
 *
 * 対策として2つの原則を置く：
 *   1. 記事一覧は lib/loan/articles.ts（レジストリ）から生成する。
 *      → 記事を1本足せば、ここにも自動で載る。
 *   2. **費用・金利などの具体的な数値をこのファイルに書かない。**
 *      → 数値を持つと必ず陳腐化する。数値は記事本文（＝更新される場所）に任せ、
 *        ここは「どの記事が何を扱っているか」の案内に徹する。
 *
 * public/llms.txt は削除済み（静的ファイルが優先されると動的生成が効かないため）。
 */

const SITE_URL = "https://www.tsuginotenavi.jp";

export const dynamic = "force-static";

export function GET() {
  // summary ではなく topic を使う。summary は画面用で具体的な金額を含むため、
  // ここに出すと記事の数値を更新したときに llms.txt だけ古いまま残る。
  const loanLines = LOAN_ARTICLES.map(
    (a) => `- [${a.title}](${SITE_URL}${a.path}): ${a.topic}`,
  ).join("\n");
  // 退職金・年金セクションも topic で生成（数値は書かない・2026-08-03 駅1）。
  const retirementLines = RETIREMENT_ARTICLES.map(
    (a) => `- [${a.title}](${SITE_URL}${a.path}): ${a.topic}`,
  ).join("\n");

  const body = `# つぎの手ナビ

> 住宅ローンと家計の判断を、入力された数字にもとづく試算で支援するサイトです。特定の金融機関・金融商品の推奨や、投資助言・販売勧誘は行いません。すべて目安の計算です。

運営：Blue Adventures（${SITE_URL}/company）

## 住宅ローン

住宅ローンで迷いやすい判断を、残高・残りの返済年数・現在の金利から比べられる形で解説しています。各記事に、4項目だけで試算できる住宅ローン専用の計算ツールを埋め込んでいます。記事の表・計算ツール・家計診断は同じ計算エンジンを使っており、数値が食い違わないようにしています。

- [住宅ローンの判断に迷ったら](${SITE_URL}/loan): 住宅ローンの記事一覧と計算ツール。
${loanLines}

## 退職金・年金

退職金や年金の受け取り方を、税金と社会保険料を引いた後の手取りで比べられる形で解説しています。記事に、勤続年数・退職金額・規程の利率などから一時金・年金・併用の手取りを比べる計算ツールを埋め込んでいます。

- [退職金・年金の受け取り方](${SITE_URL}/retirement): 退職金・年金の記事一覧。
${retirementLines}

## 家計診断

- [家計診断](${SITE_URL}/shisan): 年齢・収入・資産・毎月の余力・住宅ローンなどを入力すると、65歳時点の金額の目安、目標までに毎月いくら必要か（逆算）、厳しめの条件で見た場合、住宅ローンの借り換えで軽くできる金額の目安を表示します。登録不要。

## 役立ちガイド

- [役立ちガイド](${SITE_URL}/guide): デジタルの整理、パスワード・認証の管理、家族間の情報共有、資産・お金の管理などの解説記事。
- [保険契約の一覧表をエクセルで作る方法](${SITE_URL}/guide/shisan-kanri/hoken-ichiran-excel): 無料テンプレート付き。

## サイト情報

- [プライバシーポリシー](${SITE_URL}/privacy)
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
