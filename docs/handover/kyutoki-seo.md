# 引き継ぎ：給湯器の記事制作（検索からの集客の土台）2026-11-04

## 目的と数字
- 目的：給湯器 B（相談を集めて業者に渡す。別チャットで進行中、受け皿 /kyutoki/mitsumori）の集客の土台を、広告ではなく検索から作る。
- 一番上の数字：記事から B の受け皿へ進んだ人の数（lp_internal_click → /kyutoki/mitsumori の lp_view）。
- 途中の数字（Search Console）：60日で 給湯器の記事の表示 1,000回/月・クリック 100回/月。届かなければ続けない。
- 今の土台（Search Console 3か月 8/2〜11/1）：サイト全体 クリック286・表示8,181・平均順位11.6・表示のあるページ48。給湯器のページは検索からの流入0。効いている型は「配布物（エクセル）」（保険一覧 158クリック・順位5.7）と「具体的な不安の言葉」（スマホのパスワード 75クリック・表示4,761）。

## 前提と制約（先に決めること）
1. ドメイン：tsuginotenavi.jp の領域は相続・デジタル遺産。給湯器は領域の外なので、Google の専門性の評価は弱い。/kyutoki のまま続けるか、別ドメインにするかは、最初にオーナーと決める。
2. 大量生成はしない：Google は2024年3月から、大量に作った薄いページを明示的に下げている。1,463語を1語1ページにはしない。**1ページ＝1つの事情（住まい・種類・号数・メーカー・見積もりが高い・地域・使用年数）で、見出しに20〜30語を受ける。上限50ページ。**
3. 配布物を軸にする：見積もりの見方チェック表、号数の選び方の表、費用の目安表（エクセル・PDF）。配布物のページが検索で上がっている実績に合わせる。
4. 日本語だけ。文字を減らし、図・アイコン・余白で見せる。見出しを文章にしない。訪問者の立場で自然な言葉（優秀な校閲の水準）。
5. 金額・寿命・制度の数字は一次情報だけ（東京ガスの販売価格、メーカー公式、国民生活センター。出典は app/kyutoki/kokan-hiyou/page.tsx 冒頭のコメントに整理済み）。

## 材料（どこにあるか）
- テールワード 1,463語：Google 広告 キャンペーン 24414595160「給湯器」の広告グループ A_費用〜A8_地域（docs/kyutoki-ads-v2.md 追記「A層をテールワードで組み直し」「全キーワードの見直し」に、組ごとの語数と止めた語の理由）。管理画面からの取り出しは Chrome（アカウント 7270362154）。
- 既存ページ：/kyutoki/kokan-hiyou（記事型 v7。節 #sumai #meyasu #maker #kawaru #takai #hikaku。見出し部品 components/kyutoki/KokanHeroTitle.tsx）、/kyutoki/oyu-ga-denai（診断）と /hiyou /jumyo、/kyutoki/shuri（広告の着地、noindex）、/kyutoki/mitsumori（B。別チャットの担当。触らない）。
- 紹介先の定義：lib/kyutoki/diagnosis.ts の PARTNERS（お湯が出ない.com・GAS-Q・きゅっと・Cools。href が空なら出さない）。記事の主な出口は B の受け皿、紹介先は補助。
- 計測：components/lp/LpViewTracker.tsx（lp_view・lp_scroll・lp_section_view・lp_internal_click）。Supabase（プロジェクト tsuginotenavi-prod、lp_event_logs、SELECT だけ）。Search Console は Chrome でオーナーのログイン済み。
- 記録：docs/kyutoki-3c.md（3C）、docs/kyutoki-ads-v2.md（言葉の設計）、docs/handover/kyutoki-b.md（B の引き継ぎ）、docs/trend-ads/issues-30.md（11/4 の判断）。

## 進め方（週ごと）
- 第1週：ドメインの判断 → 1,463語を「事情」で束ねて50ページ以内の設計表（ページ名・受ける語・配布物・出口）を作りオーナー確認 → 配布物を3つ作る。
- 第2週〜：週5ページ。各ページは「配布物＋答え＋B の受け皿への入口」。公開ごとに Search Console の登録を確認。
- 30日・60日：表示・クリック・順位・B への遷移を記録。60日で表示1,000回/月に届かなければ止める。

## 作業の決まり（このリポジトリ）
- main は変更依頼（gh api repos/masatomorishima-qpick/tsuginote-navi-web/pulls -X POST。gh は REST だけ）。取り込みはオーナー。記録は枝 docs/listing-rules に直接。
- コミット末尾：Co-Authored-By と Claude-Session の行（この会話の指示に従う）。
- 型検査：scratchpad の tsconfig（app/kyutoki と components/kyutoki だけを含める）で npx tsc --noEmit。本番の確認は Chrome（curl は不可）。
- Vercel：記録だけの変更はビルドしない設定（#69）。無料枠の配信容量に注意。
- オーナーだけがやること：お金を使う操作、取り込み、本番の公開のやり直し、提携の申請、フォームの送信、パスワードの入力、データの削除。
- やらないこと：広告の出稿（給湯器の広告は全部停止中）、トレンド速攻、PHP2Shell。
