/**
 * 給湯器 B：受付1件ごとの「次に送るメール」の下書きを作る（2026-11-02 新設）。
 *
 * 元の文：docs/kyutoki-b/mails.md（枝 docs/listing-rules）。文を直すときは両方そろえる。
 * ここは下書きを作るだけで、送らない（最初はオーナーが全通を確かめてから送る決まり）。
 * 住所などの送信者の表示は環境変数から入れる（公開リポジトリに書かない）。
 *   KYUTOKI_SENDER_NAME     … 送信者の名称（例：BlueAdventures合同会社）
 *   KYUTOKI_SENDER_ADDRESS  … 送信者の住所
 */

import { labelOf, type MStepId } from './mitsumori';

export type Lead = {
  id: number;
  created_at: string;
  email: string;
  answers: Record<string, string>;
  status: string;
  city: string | null;
  availability: string | null;
  photo_received: boolean;
  customer_name: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  vendor_a: string | null;
  vendor_b: string | null;
  schedule_a: string | null;
  schedule_b: string | null;
  result_a: string | null;
  result_b: string | null;
  note: string | null;
};

export type Draft = { key: string; to: string; label: string; subject: string; body: string };

/** 運用の段（kyutoki_leads.status）と画面の表示名 */
export const STATUSES: { v: string; t: string }[] = [
  { v: 'new', t: '受付（未送信）' },
  { v: 'asked', t: '受付メール送信済み' },
  { v: 'ready', t: '条件がそろった' },
  { v: 'offered', t: '業者に打診中' },
  { v: 'scheduled', t: '日程確定' },
  { v: 'done', t: '面談完了' },
  { v: 'closed', t: '終了（途中）' },
];

function sender() {
  return {
    name: process.env.KYUTOKI_SENDER_NAME ?? '〔送信者の名称〕',
    address: process.env.KYUTOKI_SENDER_ADDRESS ?? '〔住所〕',
  };
}

function footer(): string {
  const s = sender();
  return [
    '――――――――――',
    'このメールは、つぎの手ナビで給湯器の見積もりをご依頼いただいた方にお送りしています。',
    '今後のご連絡が不要な場合は、このメールに「停止」とだけ書いて返信してください。',
    `つぎの手ナビ（${s.name}）`,
    `${s.address}／support@tsuginotenavi.jp`,
  ].join('\n');
}

const v = (x: string | null | undefined, fallback: string) => (x && x.trim() ? x.trim() : fallback);

export function conditionLines(a: Record<string, string>): string[] {
  const l = (id: MStepId) => labelOf(id, a[id]);
  return [
    `・${l('type')}／${l('home')}／${l('area')}`,
    `・使用年数：${l('age')}　機能：${l('kino')}　号数：${l('go')}`,
    `・交換したい時期：${l('jiki')}`,
  ];
}

function missingForReady(x: Lead): string[] {
  const m: string[] = [];
  if (!x.city) m.push('市区町村');
  if (!x.photo_received) m.push('給湯器の写真（本体の正面とラベル）');
  if (!x.availability) m.push('現地調査に来てもらいやすい曜日と時間帯');
  return m;
}

/** 利用者向けの下書き（段に合わせて、次に送るものから順に） */
export function userDrafts(x: Lead): Draft[] {
  const to = x.email;
  const d: Draft[] = [];
  const cond = conditionLines(x.answers).join('\n');

  d.push({
    key: 'accept', to, label: '1. 受付',
    subject: '【つぎの手ナビ】給湯器の見積もりのご依頼を受け付けました',
    body: `つぎの手ナビです。
給湯器の見積もりをご依頼いただき、ありがとうございます。

ご入力いただいた条件
${cond}

お住まいに合う工事会社を2社お選びするため、
次の3つを、このメールへの返信でお知らせください。

1. 市区町村（例：世田谷区）
2. 給湯器の写真2枚（本体の正面と、ラベル）
   ラベルは本体の側面か前面にあり、号数と製造年が書いてあります。
   撮りにくい場合は、なくてもかまいません。
3. 現地調査に来てもらいやすい曜日と時間帯（例：平日の夜、土日の午前）

お返事をいただいてから、1日以内に2社の候補日をお送りします。

${footer()}`,
  });

  const miss = missingForReady(x);
  if (x.status === 'asked' && miss.length > 0 && miss.length < 3) {
    d.push({
      key: 'askagain', to, label: '2. 聞き直し（1回だけ）',
      subject: 'Re: 【つぎの手ナビ】給湯器の見積もりのご依頼を受け付けました',
      body: `つぎの手ナビです。お返事ありがとうございます。

工事会社にお伝えするため、あと${miss.length === 1 ? '1つ' : `${miss.length}つ`}だけ教えてください。
${miss.map((m) => `・${m}`).join('\n')}

わからない場合は「わからない」で大丈夫です。その場合は、現地で確かめてもらいます。

${footer()}`,
    });
  }

  d.push({
    key: 'candidates', to, label: '3. 候補日',
    subject: '【つぎの手ナビ】現地調査の候補日が届きました',
    body: `つぎの手ナビです。
2社から、現地調査の候補日が届きました。
ご都合のよい日を、それぞれ1つずつお選びください。

■ ${v(x.vendor_a, '{A社}')}
　① {日時}　② {日時}　③ {日時}
■ ${v(x.vendor_b, '{B社}')}
　① {日時}　② {日時}　③ {日時}

あわせて、次の3つをお知らせください。
日程が決まった2社にだけお伝えします。
・お名前
・ご住所
・当日に連絡がつくお電話番号

どの日も合わない場合は、ご都合のよい日をいくつか書いてください。調整します。

${footer()}`,
  });

  d.push({
    key: 'confirm', to, label: '4-1. 確定',
    subject: '【つぎの手ナビ】現地調査の日程が決まりました',
    body: `つぎの手ナビです。日程が決まりました。

■ ${v(x.vendor_a, '{A社}')}　${v(x.schedule_a, '{日時}')}
■ ${v(x.vendor_b, '{B社}')}　${v(x.schedule_b, '{日時}')}

・見積もりは本体・工事・処分費を含めた総額でお願いしてあります。
・見積もりと現地調査は無料です。見積もりを見て断っても、費用はかかりません。
・当日は、給湯器のまわりに入れるようにしておいてください。

前日に、もう一度お知らせします。

${footer()}`,
  });

  d.push({
    key: 'reminder', to, label: '4-2. 前日の念押し',
    subject: '【つぎの手ナビ】明日は現地調査の日です',
    body: `つぎの手ナビです。明日の予定のお知らせです。

■ {会社名}　{日時}

ご都合が悪くなった場合は、このメールに返信してください。会社に伝えて、日を改めます。

${footer()}`,
  });

  d.push({
    key: 'done', to, label: '5. 完了の確認（翌日）',
    subject: '【つぎの手ナビ】現地調査はいかがでしたか',
    body: `つぎの手ナビです。
昨日の現地調査は、予定どおり済みましたか。
次の3つに、番号だけでご返信いただけると助かります。

1. 現地調査は　ア 2社とも済んだ　イ 1社だけ済んだ　ウ 延期・取りやめ
2. 本体込みの総額の見積もりを　ア 受け取った　イ まだ
3. このしくみを、また使いたいと思いますか　ア はい　イ いいえ

ご意見があれば、ひとことでもお書きください。今後の改善に使います。

${footer()}`,
  });

  return d;
}

/** 業者向けの下書き（打診・確定・完了の確認）。vendor は A か B。 */
export function vendorDrafts(x: Lead, which: 'a' | 'b'): Draft[] {
  const name = which === 'a' ? x.vendor_a : x.vendor_b;
  if (!name) return [];
  const schedule = which === 'a' ? x.schedule_a : x.schedule_b;
  const a = x.answers;
  const head = `${name} ご担当者さま\n\nつぎの手ナビの森嶋です。`;
  const sig = `\n\n${sender().name}　森嶋\nつぎの手ナビ`;
  return [
    {
      key: `offer-${which}`, to: name, label: `打診（${name}）`,
      subject: `【つぎの手ナビ】現地調査のご依頼（${v(x.city, '{市区町村}')}・${labelOf('kino', a.kino)}${a.go && a.go !== 'unknown' ? ` ${a.go}号` : ''}）`,
      body: `${head}現地調査のご依頼です。
受けられるかと、候補日を3つ、24時間以内にご返信いただけますか。

受付番号：${x.id}
市区町村：${v(x.city, '{市区町村}')}
住まい　：${labelOf('home', a.home)}
給湯器　：ガス給湯器／${labelOf('kino', a.kino)}／${labelOf('go', a.go)}／使用年数 ${labelOf('age', a.age)}
時期　　：${labelOf('jiki', a.jiki)}
来てほしい曜日・時間帯：${v(x.availability, '{都合}')}
写真　　：${x.photo_received ? '添付のとおり' : 'なし（現地でご確認ください）'}

・このお客さまは、もう1社にもご紹介しています（複数の見積もりをご希望のため）。
・お名前・ご住所・お電話番号は、日程が決まってからお送りします。
・見積もりは本体・工事・処分費込みの総額でお願いします。${sig}`,
    },
    {
      key: `vconfirm-${which}`, to: name, label: `確定（${name}）`,
      subject: `【つぎの手ナビ】日程確定のお知らせ（受付番号 ${x.id}）`,
      body: `${head}日程が決まりましたので、お客さまの情報をお送りします。

日時　　：${v(schedule, '{日時}')}
お名前　：${v(x.customer_name, '{氏名}')} 様
ご住所　：${v(x.customer_address, '{住所}')}
お電話　：${v(x.customer_phone, '{電話番号}')}
条件　　：前回のメールのとおり（受付番号 ${x.id}）

当日の連絡は、お客さまへ直接お願いします。
前日に、お客さまへは当社からも念押しのご連絡をします。${sig}`,
    },
    {
      key: `vdone-${which}`, to: name, label: `完了の確認（${name}）`,
      subject: `【つぎの手ナビ】現地調査のご確認（受付番号 ${x.id}）`,
      body: `${head}
昨日の現地調査について、番号でご返信ください。

1. 現地調査は　ア 済んだ　イ 延期　ウ お客さまの都合で取りやめ　エ 無断キャンセル
2. （任意）成約の見込みは　ア 高い　イ 半々　ウ 低い　エ 決まった

イ・ウ・エは請求しません。${sig}`,
    },
  ];
}

/** 段ごとに、いま一番上に出すべき下書きのキー */
export function nextDraftKey(x: Lead): string {
  switch (x.status) {
    case 'new': return 'accept';
    case 'asked': return missingForReady(x).length > 0 && missingForReady(x).length < 3 ? 'askagain' : 'accept';
    case 'ready': return 'offer-a';
    case 'offered': return 'candidates';
    case 'scheduled': return 'confirm';
    case 'done': return 'done';
    default: return '';
  }
}
