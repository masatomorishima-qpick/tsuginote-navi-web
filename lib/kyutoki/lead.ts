/**
 * 給湯器 B の見積もり希望（メール入力）で、画面とサーバーの両方が使う決まり。
 * 同意の文言は、画面に出したものと同じ文字列を kyutoki_leads.consent_text に保存する（後から確かめられるように）。
 * 文言を変えたら CONSENT_VERSION を上げる。
 */
export const CONSENT_VERSION = 'c1-2026-11-02';
export const CONSENT_TEXT =
  '条件チェックの回答と、このあとメールでお伝えいただく内容を、ご紹介する工事会社（2社）に伝えることに同意します。';

/** 回答として受け付けるキー（それ以外は捨てる） */
export const ANSWER_KEYS = ['type', 'home', 'area', 'age', 'kino', 'go', 'jiki', 'symptom', 'cold'] as const;

export function isEmail(s: string): boolean {
  return s.length <= 254 && /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/.test(s);
}
