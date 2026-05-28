# NotoSansJP Font

ここに `NotoSansJP-Regular.ttf` を配置してください。

## 配置手順

1. 下記 URL から Noto Sans JP の ZIP をダウンロード
   https://fonts.google.com/noto/specimen/Noto+Sans+JP
   （「Download all」ボタンをクリック）

2. ZIP を解凍し、中の **`static/NotoSansJP-Regular.ttf`** を
   このフォルダ (`app/api/digital/pdf/_fonts/`) にそのまま置く

3. ファイル名は変更しないこと（コードから `NotoSansJP-Regular.ttf` を参照）

## なぜここに置くのか

Next.js は API Route と同階層の `_` プレフィックスフォルダを
ファイルトレース対象として自動的にバンドルに含めます。
これにより Vercel のサーバレス環境でも `fs.readFile` で読めます。

## ライセンス

Noto Sans JP は SIL Open Font License 1.1 で配布されています。
商用利用可・改変可ですが、再配布時はライセンス表記の同梱が必要です。
本プロジェクトでは `.ttf` ファイルそのものを改変せず利用しています。
