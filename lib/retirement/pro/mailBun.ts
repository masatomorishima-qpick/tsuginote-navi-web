/**
 * lib/retirement/pro/mailBun.ts — ご購入のメールの文を作る（B-3・senjutsu_20260902s.md 2番・4番イ）
 *
 * ★★この本は「文を作るだけ」です。**送りません。**
 *   ・`sendEmail` を import しません
 *   ・★`server-only` を付けません（★器から呼んで、文をファイルに書き出して当てるためです。判断ログ307番）
 *   ・引数は「リンク」と「期限」の2つだけ。★**メールアドレスを受け取りません**（文に要らないため）
 *
 * ★★文（件名・本文）は、戦術Coworkが `senjutsu_20260902s.md` 2番で出した字です。
 *   ★1文字も変えていません。変えたいときは、消す前に戦術Coworkへ投げてください。
 *
 * ★html の形（同 2番の決め）
 *   ・1つの段落＝1つの <p>／`──────────` は <hr>／「・」の3行は <ul><li>
 *   ・リンクは2段（押せるリンク「計算結果を開く」＋ その下に URL の字）
 *   ・★画像を1つも使わない／★外の CSS を読まない（style は要素に直に書く）
 *   ・★文字は 16px 以上（55〜65歳の方が読みます）／★橙は使わない（橙は購入ボタンだけ）
 */

import { kigenNoJi } from './hyouji';

/** 画面5-6のリンクと同じ緑系（Tailwind の emerald-700） */
const MIDORI = '#047857';
/** 本文の色（黒に近い色） */
const MOJI = '#1f2937';
/** 細い線の色 */
const SEN = '#e5e7eb';

export type KounyuMailNoHikisu = {
  /** 鍵つきの道のリンク（`…/retirement/pro/hiraku?key=…`） */
  link: string;
  /** 通行証の期限 */
  kigen: Date;
};

export type KounyuMailNoBun = {
  subject: string;
  html: string;
  text: string;
};

/** html に入れる字を安全にします（この本の中に自前で置きます・5-3 の digital と同じ形） */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** ご購入のメールの、件名と本文を作ります */
export function kounyuMail(hikisu: KounyuMailNoHikisu): KounyuMailNoBun {
  const link = hikisu.link;
  const kigen = kigenNoJi(hikisu.kigen);

  const subject = '【つぎの手ナビ】ご購入ありがとうございます（結果を開くリンク）';

  const text = `このたびは、退職金とiDeCoの受け取り方シミュレーション（有料版）をお求めいただき、
ありがとうございます。

下のリンクを開くと、あなたの計算結果をご覧いただけます。

${link}

ご利用いただける期間は、${kigen}までです。
この期間のあいだは、何度でも計算し直せます。

──────────

・このメールは、大切に保管してください。結果を開くときに、毎回お使いいただきます。
・このリンクをお持ちの方は、どなたでも結果をご覧いただけます。お取り扱いにご注意ください。
・同じ内容のメールが2通届くことがあります。お支払いは1回だけです。どちらのリンクも同じものです。

──────────

ご不明な点は、info@blueadventures.jp までご連絡ください。

つぎの手ナビ
BlueAdventures
https://www.tsuginotenavi.jp

特定商取引法に基づく表記  https://www.tsuginotenavi.jp/retirement/pro/tokushoho
利用規約  https://www.tsuginotenavi.jp/terms
プライバシーポリシー  https://www.tsuginotenavi.jp/privacy
`;

  const p = `margin:0 0 16px;font-size:16px;line-height:1.9;color:${MOJI};`;
  const hr = `margin:32px 0;border:0;border-top:1px solid ${SEN};`;
  const a = `color:${MIDORI};`;
  const linkE = escapeHtml(link);

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="max-width:600px;margin:0 auto;padding:24px 20px;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic',Meiryo,sans-serif;">

  <p style="${p}">このたびは、退職金とiDeCoの受け取り方シミュレーション（有料版）をお求めいただき、<br>ありがとうございます。</p>

  <p style="${p}">下のリンクを開くと、あなたの計算結果をご覧いただけます。</p>

  <p style="margin:0 0 8px;">
    <a href="${linkE}" style="font-size:18px;font-weight:600;color:${MIDORI};text-decoration:underline;">計算結果を開く</a>
  </p>
  <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:${MOJI};word-break:break-all;">${linkE}</p>

  <p style="${p}">ご利用いただける期間は、${escapeHtml(kigen)}までです。<br>この期間のあいだは、何度でも計算し直せます。</p>

  <hr style="${hr}">

  <ul style="margin:0 0 16px;padding-left:1.2em;font-size:16px;line-height:1.9;color:${MOJI};">
    <li style="margin:0 0 8px;">このメールは、大切に保管してください。結果を開くときに、毎回お使いいただきます。</li>
    <li style="margin:0 0 8px;">このリンクをお持ちの方は、どなたでも結果をご覧いただけます。お取り扱いにご注意ください。</li>
    <li style="margin:0;">同じ内容のメールが2通届くことがあります。お支払いは1回だけです。どちらのリンクも同じものです。</li>
  </ul>

  <hr style="${hr}">

  <p style="${p}">ご不明な点は、<a href="mailto:info@blueadventures.jp" style="${a}">info@blueadventures.jp</a> までご連絡ください。</p>

  <p style="${p}">つぎの手ナビ<br>BlueAdventures<br><a href="https://www.tsuginotenavi.jp" style="${a}">https://www.tsuginotenavi.jp</a></p>

  <p style="margin:0;font-size:16px;line-height:1.9;color:${MOJI};">
    <a href="https://www.tsuginotenavi.jp/retirement/pro/tokushoho" style="${a}">特定商取引法に基づく表記</a><br>
    <a href="https://www.tsuginotenavi.jp/terms" style="${a}">利用規約</a><br>
    <a href="https://www.tsuginotenavi.jp/privacy" style="${a}">プライバシーポリシー</a>
  </p>

</div>
</body>
</html>`;

  return { subject, html, text };
}
