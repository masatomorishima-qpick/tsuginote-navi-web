# 相続税・保険のページの作り方（2026-11-10。毎朝の制作の回が守る決まり）

## 作る前の3つの確認（11/10 夜の戦略。どれか1つでも外れたら作らず、順番表に「見送り（理由）」）
1. **上位10の顔ぶれ**：Google で受ける言葉を引き、上位10が国税庁・省庁・メガバンク・大手税理士法人・保険会社だけなら作らない。ひな形の配布サイト・小さな事務所・意図違いの結果・知恵袋が混ざっていれば作る。
2. **評価されている分野とつながるか**：保険の書類の表（保険の一覧表＝3〜6位）、相続のひな形、相続税の計算のどれかから内部リンクでつなげること。
3. **次の一歩が紹介先か**：表や道具を使った人が次にすることが、相続アシスト（申告・手続きの代行）か保険見直し本舗（見直しの無料相談）であること。
- 型は「無料の表・ひな形・チェックリスト・計算」。大きな知識の言葉（〜は必要か、〜とは）は作らない。
- 手本（11/10）：T1 app/guide/souzoku/tetsuzuki-checklist（期限の計算＋エクセル・PDF）、T2 app/guide/shisan-kanri/hoken-hikaku-excel（総額の計算＋エクセル・PDF）。配布物は scripts/souzoku/make_souzoku.py・scripts/hoken/make_hoken.py に関数を足して作る（既存のファイルは作り直さない）。保険の数字は lib/hoken/haifu-data.json。

## 型
- **相続税**（/guide/souzoku/…）：手本は app/guide/souzoku/souzokuzei-keisan/page.tsx（S1）。外枠は components/souzoku/SouzokuArticle.tsx（最初の画面に「答え＋無料の道具か配布物」→本文→出口→よくある質問3つ→ほかのひな形）。出口は SouzokuExit の partner="souzokuAssist" だけ。最初の画面の下にも SouzokuExit を1つ（position="hero"、beacon なし。表示計測は末尾の1つだけ）。新しいページは SOUZOKU_PAGES に足す。
- **保険**（/guide/moshimo-sonae/…）：外枠は給湯器の記事と同じ作り（LpHeader・LpViewTracker・PR 表示・LpFooter）で、出口は components/guide/HokenSoudanBox（lpId にページの LP_ID、points に保険見直し本舗の公式の記載だけ。表示計測 beacon は1つだけ）。手本の見た目は app/guide/shisan-kanri/hoken-ichiran-excel/page.tsx と app/kyutoki/error/page.tsx。
- LP_ID（計測の名前）は、相続税は guide-souzoku-<短い名前>、保険は guide-hoken-<短い名前> にする（docs/haifu-funnel.sql がこの形で数える）。
- 数字は lib/souzoku/haifu-data.json（相続税）にまとめる。保険は lib/hoken/haifu-data.json を新しく作ってそこにまとめる。出典の名前と URL を sources に。
- 道具（計算）を作るときは、使われたら lp_event_logs に1回だけ記録（trackEvent、event_name は道具ごとの名前。入れた数字そのものは送らない）。
- metadata（タイトル・説明・正規の URL・OG）、JSON-LD（jsonLdFor）、app/sitemap.ts に1行。

## 言葉と見せ方（オーナーの決まり）
- 日本語だけ。英語・英語の略語・カタカナの専門用語を混ぜない。訪問する人が普段使う言葉で、校閲の水準で読み直す。
- 文字を減らし、図・アイコン・余白で見せる。見出しは名詞（文にしない）。
- 1ページに出口は1つ（同じ紹介先を、最初の画面の下・末尾・スマホの画面下に置くのはよい）。
- 相見積もりや他社と比べることをすすめる文は書かない（紹介先の否認の条件になることがある）。

## 数字
- 一次情報だけ：国税庁（タックスアンサー・手引き・申告事績）、厚生労働省、日本年金機構、全国健康保険協会、金融庁、生命保険文化センター、紹介先の公式サイト。
- 書いた数字と言い切りは、出典の文と1つずつ照らし合わせる。計算の道具は、出典の計算例と同じ答えになるかを確かめ、変更依頼の説明に答え合わせを書く。
- 税や年金は「何年の何日現在の法令か」を出典に合わせて書く（例：国税庁は「令和8年4月1日現在法令等」）。
- 紹介先の売りは公式サイトで確かめた日を checkedAt に。保険見直し本舗は出演者の名前・画像、店舗数などの数字を書かない。

## 確かめ方（給湯器の記事と同じ）
tsc・eslint、next dev を別のポートで、幅390px で横にはみ出さない、紹介先のリンクはその1つだけ、表示計測の画像は1つ、画面写しで文字の崩れと言葉の不自然さ。Vercel のプレビューが success。
