# 記事ページの作り方（自動の制作の回と、手で作るときの共通の決まり）

## 型
- 手本：main の app/kyutoki/kodate/page.tsx・app/kyutoki/furo/page.tsx・app/kyutoki/nensu/page.tsx。同じ部品（LpHeader・LpFooter・LpViewTracker・PrNote・OyuBox・OyuSticky・HaifuDownload）と同じ書き方で作る。
- 1ページ＝1つの事情。最初の画面に答え（数字か結論）と、図・アイコン。見出しは名詞（文章にしない）。文字は少なく。
- 出口は1ページに1つ（お湯が出ない.com の OyuBox）。本文の途中に1つ（beacon あり）、必要なら末尾にもう1つ（beacon={false}）、スマホの画面下に OyuSticky。B の受け皿・GAS-Q・ほかの紹介先は置かない。
- LP_ID は 'kyutoki-<パスの末尾>'、VERSION は 'v1-<公開日>'。metadata（title・description・canonical・OGP）と JSON-LD（Article・BreadcrumbList・FAQPage）を入れる。よくある質問は3つ。
- app/sitemap.ts の「給湯器「お湯が出ない」診断」の行の前に足す。

## 数字と文言
- 数字は一次情報だけ（東京ガス・メーカー公式・国の機関・自治体・業界団体・紹介先の公式サイト）。lib/kyutoki/haifu-data.json の sources に名前と URL を足し、ページには出典と確認日を書く。
- 確かめられないことは書かない。推測で数字を置かない。一般論を書くときも、言い切れない言い方は避ける。
- 競合他社の社名は、ページ名・見出し・URL に入れない（出典としての記載はよい）。メーカー名はよい。
- 言葉は、訪問する人の立場の自然な日本語。英語・英語の略語・カタカナの専門用語を混ぜない。
- お湯が出ない.com の売りは、公式サイト oyu-denai.com の記載だけ（出張料・見積もり・キャンセル料無料、最短30分、修理は最短45分・目安2.2万円〜、交換は最短80分、貸出機、工事10年保証、電話受付9〜21時・年中無休）。対象は東京・神奈川。

## 確かめること（変更依頼の前に全部）
1. npx tsc --noEmit -p tsconfig.json が通る。npx eslint が通る。
2. next dev で開き、スマホの幅 390px で横にはみ出さない（document.documentElement.scrollWidth が 390）。紹介先のリンクは px.a8.net のお湯が出ない.com だけ、表示計測の画像は1つ。
3. 画面写しを見て、文字の崩れ・言葉の不自然さがない。
4. 変更依頼の説明に、受ける言葉・中身・一次情報・確かめたことを書く。
