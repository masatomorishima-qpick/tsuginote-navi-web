/**
 * lib/retirement/pro/mail.ts — ご購入のメールを送る（B-3・senjutsu_20260902s.md 4番ウ）
 *
 * ★★この本は「送るだけ」です。**文は作りません**（文は `mailBun.ts`）。
 *
 * ★決め
 *   ・★`RESEND_API_KEY` の**有無だけ**を見て、無ければ `sendEmail` を**呼びません**（判断ログ301番）。
 *     ★理由 ── `lib/email/client.ts` の70行の `console.warn` は、**`to`（メールアドレス）を記録に書きます。**
 *       ★`client.ts` は1文字も変えない決めですので、★**こちらが呼ばないことで、こちらの決めを守ります**
 *   ・★`lib/email/client.ts` は **1文字も変えずに** import して使います
 *   ・★戻り値に `to` を入れません。★呼んだ側が記録に書くのは `cs_…` までです
 *   ・★★`sendEmail` は**例外を投げません**（`{ ok:false, … }` を返します）。★`ok` を必ず見ます
 *   ・★差出人の名前は `つぎの手ナビ`（判断ログ302番）。
 *     ★渡さないと `client.ts` の既定「つぎの手ナビ デジタル資産」になります
 */

import 'server-only';
import { sendEmail } from '@/lib/email/client';
import { kounyuMail } from './mailBun';

export type OkuruKekka = { ok: true } | { ok: false; error: string };

export type OkuruHikisu = {
  /** 送り先（Stripe の決済画面でご入力いただいたもの） */
  to: string;
  /** 鍵つきの道のリンク */
  link: string;
  /** 通行証の期限 */
  kigen: Date;
};

/**
 * ご購入のメールを1通送ります。
 *
 * ★例外を投げません。★だめだったときは `{ ok:false, error }` を返します。
 */
export async function kounyuMailWoOkuru(hikisu: OkuruHikisu): Promise<OkuruKekka> {
  // ★鍵の有無だけを見ます（値は使いません。使うのは client.ts です）
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'no_api_key' };
  }

  const bun = kounyuMail({ link: hikisu.link, kigen: hikisu.kigen });

  const kekka = await sendEmail({
    to: hikisu.to,
    subject: bun.subject,
    html: bun.html,
    text: bun.text,
    fromDisplayName: 'つぎの手ナビ',
  });

  if (kekka.ok) return { ok: true };
  return { ok: false, error: kekka.error };
}
