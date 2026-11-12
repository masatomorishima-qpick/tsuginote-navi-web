/**
 * /llms.txt — AI検索・LLM向けのサイト案内
 *
 * 原則：**費用・金利などの具体的な数値をこのファイルに書かない。**
 *   数値は記事本文（＝更新される場所）に任せ、ここは「どのページが何を扱っているか」の案内に徹する。
 *
 * 2026-11-11：相続・保険のページ（11/5〜11/11 公開）を足した。計算の式の固定の数（基礎控除・非課税の式）は法令で決まっているので書く。
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
- [保険の比較表](${SITE_URL}/guide/shisan-kanri/hoken-hikaku-excel): いまの保険と見直し案を並べ、払う総額（月の保険料×12×年数）と差を自動で計算するエクセル。
- [生命保険の見直しチェックリスト](${SITE_URL}/guide/shisan-kanri/hoken-minaoshi-checklist): 見直しの節目、保険証券で確かめる6項目、契約した日から次の更新の目安を出す道具。
- [保険証券の見方](${SITE_URL}/guide/shisan-kanri/hoken-shoken-mikata): 欄ごとの意味、契約者・被保険者・受取人の組み合わせで変わる税の種類、書き写し表。
- [スマホのパスワード管理](${SITE_URL}/guide/password-kanri/sumaho-password): メモ帳管理の危険と、忘れずに安全に管理する方法。

## 相続・もしもの備え

- [相続税のかんたん計算](${SITE_URL}/guide/souzoku/souzokuzei-keisan): 遺産の合計と相続人の数から、基礎控除（3,000万円＋600万円×法定相続人の数）と相続税の総額の目安を国税庁の手順で計算。
- [相続の手続きチェックリスト](${SITE_URL}/guide/souzoku/tetsuzuki-checklist): 亡くなった日を入れると、相続放棄・準確定申告・相続税の申告・相続登記の期限の目安が日付で出る一覧。
- [相続税の申告の必要書類チェックリスト](${SITE_URL}/guide/souzoku/shinkoku-shorui-checklist): 状況を選ぶと、出す書類だけが一覧になる。
- [死亡保険金の相続税の非課税](${SITE_URL}/guide/souzoku/shibou-hokenkin-hikazei): 非課税の限度額（500万円×法定相続人の数）を、受取人ごとに分けて自動で計算。
- [法定相続分の計算](${SITE_URL}/guide/souzoku/houtei-souzokubun): 家族の形と遺産の額を入れると、配偶者・子・孫・親・兄弟姉妹・おい・めいの法定相続分と金額、遺留分の割合を民法の決まりで計算。
- [相続登記の必要書類チェックリスト](${SITE_URL}/guide/souzoku/touki-shorui): 遺産分割・法定相続分・遺言から選ぶと、法務局の一覧に合わせた必要書類と取る場所が出る。期限（取得を知った日から3年）と登録免許税（1,000分の4）も計算。
- [準確定申告の必要書類チェックリスト](${SITE_URL}/guide/souzoku/junkakutei-checklist): 亡くなった日を入れると期限（知った日の翌日から4か月）が日付で出て、当てはまる控除や所得を選ぶと出す書類だけが一覧になる。
- [相続のページ一覧](${SITE_URL}/guide/souzoku): 手続き・相続税・書類のひな形・実家の売却のページの入口。
- [遺産分割協議書のひな形](${SITE_URL}/guide/souzoku/isan-bunkatsu-kyogisho): 法務局の記載例と同じ形の無料のワード・PDF。
- [相続関係説明図のひな形](${SITE_URL}/guide/souzoku/souzoku-kankei-setsumeizu)・[財産目録のひな形](${SITE_URL}/guide/souzoku/zaisan-mokuroku): 無料のエクセル・PDF。
- [相続した実家の3,000万円控除](${SITE_URL}/guide/souzoku/jikka-akiya-tokurei): 使える条件の確かめ方。
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
