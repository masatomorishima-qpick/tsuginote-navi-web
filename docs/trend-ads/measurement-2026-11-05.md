# 依頼率の計測（経路別）2026-11-05

## 仕組み
| 何を | どこで | 中身 |
|---|---|---|
| 訪問 | GA4（blueadventures.jp） | 早見表ページ（/ai-plan-hayamihyo/）の表示を、経路ごとに数える。「ランディングページ＋クエリ文字列」で from= を、「セッションの参照元／メディア」で utm を見る |
| 依頼 | Google フォームの回答 | 新しい欄「流入元（自動入力）」に、最初に来た経路と最後に来た経路が自動で入る（例：note-buronson\|2026-11-08 / last:note-buronson） |
| 依頼（広告側） | GA4 のキーイベント ai_plan_request（お礼ページの表示、セッションごとに1回）→ Google 広告に取り込み済み | 経路ごとの依頼の数を GA4 と Google 広告でも確認できる |
| 読まれ方 | Clarity | どこまで読まれ、フォームまで届いたか |

- ページ側の仕組み：リンクの末尾の印（utm_〜 または from=）か、外部サイトからの参照元を、閲覧者のブラウザに保存し、フォーム送信のときに一緒に送る。印も参照元もなければ「direct」。11/5 に動作を確認済み（実際の送信はしていない）。
- 管理者として WordPress にログインしている閲覧は GA4 に数えない設定のまま。

## 依頼率の出し方
依頼率 ＝ その経路の依頼の数（フォームの流入元）÷ その経路の訪問の数（GA4）

## 経路ごとのリンク
| 経路 | 付ける印 | リンク |
|---|---|---|
| Google 検索広告 | 広告側で自動 | utm_source=google&utm_medium=cpc&utm_campaign=ai-plan |
| ChatGPT 広告 | 広告の飛び先に付ける | ?utm_source=chatgpt&utm_medium=cpc&utm_campaign=ai-plan&from=gpt |
| note 記事 | 記事内のリンク | ?utm_source=note&utm_medium=article&utm_campaign=ai-plan |
| X の告知 | 記事のリンクに付ける | ?utm_source=x&utm_medium=social&utm_campaign=ai-plan |
| note の問い合わせ | 相手ごと | ?from=note-buronson／note-civilai／note-shunin／note-creer |
| 公開メール | 相手ごと | ?from=mail-sungeo／mail-zensin |
| 電話のあとのメール | 相手ごと | ?from=tel-（会社の略称。例：tel-daiki） |

個人あての連絡は、長い印だと不自然なので from= だけにしている。

## 毎日見る表（私が毎朝まとめる）
| 経路 | 訪問 | 依頼 | 依頼率 | Clarity でフォームまで届いた割合 |
|---|---|---|---|---|
| Google 検索広告 | | | | |
| ChatGPT 広告 | | | | |
| note（記事・問い合わせ） | | | | |
| X | | | | |
| メール・電話 | | | | |
| 自然検索・その他 | | | | |
