/**
 * 法人口座の審査の実例のページ（/guide/houjin/kouza-tsukurenai）とチェック表の元（2026-11-16）。
 * 体験の事実はオーナーの記録（2026-11-16「法人口座の審査体験 引き継ぎ資料」）どおり。日付・結果を足したり丸めたりしない。
 * 銀行の決まりは公式の記載だけ。見立ては「推定」と書く。
 */
export const CHECKED_AT = '2026-11-16';

export const SOURCES = {
  paypayStart: { name: 'PayPay銀行「法人口座を開設するには」', url: 'https://www.paypay-bank.co.jp/business/first/start-company.html' },
  mfVirtual: { name: 'マネーフォワード クラウド会社設立「バーチャルオフィスで法人口座は作れる？」', url: 'https://biz.moneyforward.com/establish/basic/90771/' },
  mfHoujinnari: { name: 'マネーフォワード クラウド会社設立「法人化したら口座の変更は必要？」', url: 'https://biz.moneyforward.com/establish/basic/82590/' },
  sogyoVirtual: { name: '創業手帳「バーチャルオフィスでも法人口座は開設できる？」', url: 'https://sogyotecho.jp/virtual-office-hojin-koza-kaisetsu/' },
  sogyoGodo: { name: '創業手帳「合同会社でも法人口座は開設できる」', url: 'https://sogyotecho.jp/goudougaisha-houjinkouza/' },
} as const;
export type SourceKey = keyof typeof SOURCES;

/** 申し込んだ3行の結果（運営会社の実例） */
export const RESULTS = [
  { bank: 'GMOあおぞらネット銀行', ok: false, when: '11月上旬に申込', result: '見送り' },
  { bank: 'ドコモSMTBネット銀行', ok: false, when: '11/12 申込 → 11/16 メール', result: '見送り' },
  { bank: 'PayPay銀行', ok: true, when: '11/12 申込 → 11/16 通過', result: '開設' },
] as const;

/** 申し込んだときの会社の条件 */
export const JOUKEN = [
  { h: '合同会社', s: '代表1人の会社' },
  { h: '設立から1〜2週間', s: '2026年10月28日 設立' },
  { h: '資本金50万円', s: '' },
  { h: '本店はバーチャルオフィス', s: '郵便は月1回の転送' },
  { h: '代表は会社員と兼業', s: '' },
  { h: '会社の取引はまだなし', s: '個人で運営していた実績はあり' },
] as const;

/** 日付ごとの経過 */
export const KEIKA = [
  { d: '10/28', t: '会社を設立（登記）' },
  { d: '11月上旬', t: 'GMOあおぞらネット銀行に申込 → 見送り' },
  { d: '11/12', t: 'ドコモSMTBネット銀行とPayPay銀行に申込' },
  { d: '11/13', t: 'PayPay銀行：登記の住所と、入力した住所が違っていて手続きが止まる → 申し込み直し' },
  { d: '11/16', t: 'ドコモSMTBネット銀行：「口座開設を見合わせ」のメール。理由の説明なし' },
  { d: '11/16', t: 'PayPay銀行：審査に通過' },
] as const;

/** 落ちた理由の見立て（推定） */
export const MITATE = [
  { h: '本店がバーチャルオフィス', d: '落ちた2行に共通。事業の実態が見えにくいと受け取られやすいとされます。', src: ['mfVirtual'] as SourceKey[] },
  { h: '設立直後で、取引の実績がない', d: '収益の見込みを確かめられるため、起業してすぐは厳しい傾向とされます。', src: ['sogyoVirtual'] as SourceKey[] },
  { h: '申込の社名が登記と1文字違った', d: 'ドコモSMTBネット銀行の申込で、社名の英字が1文字抜けていました。', src: [] as SourceKey[] },
  { h: '合同会社であること', d: 'それだけで落ちることは原則ないとされます。', src: ['sogyoGodo'] as SourceKey[] },
] as const;

/** 申し込む前に整えること（チェック表と同じ並び） */
export const CHECKS = [
  { h: '社名は登記と1文字も違わない', s: '英字・記号・空白まで、登記事項証明書どおりに' },
  { h: '本店の住所は登記どおり', s: '丁目・番地・建物名・部屋番号まで' },
  { h: '代表者の住所は本人確認書類どおり', s: '登記の本店と混ぜて入れない' },
  { h: '事業の説明を用意した', s: '何を・誰に・どうやって売るか' },
  { h: '事業が分かるホームページがある', s: '会社名・所在地・事業内容が載っている' },
  { h: '銀行からの郵便を受け取れる', s: '転送では受け取れない郵便もある' },
  { h: '2〜3行に同時に申し込む', s: '結果まで約1週間。理由は教えてもらえない' },
] as const;
