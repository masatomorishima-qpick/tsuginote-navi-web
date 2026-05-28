/**
 * lib/digital/utils.ts
 *
 * デジタル資産機能で共通利用する小さなユーティリティ。
 */

/**
 * ISO 文字列を「2026年5月24日」形式（日本時間）に整形する。
 * null / undefined / 不正値のときは空文字を返す。
 */
export function formatJpDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

// =============================================================================
// 表示用ラベルマップ（複数画面で使い回す。重複定義を防ぐためここに集約）
// =============================================================================

/** デジタル資産カテゴリの日本語ラベル */
export const CATEGORY_LABELS: Record<string, string> = {
  subscription: 'サブスク',
  finance: '金融',
  sns: 'SNS',
  photo_storage: '写真・クラウド',
  shopping: 'ショッピング',
  work: '仕事',
  other: 'その他',
};

/** 表示時のカテゴリ並び順 */
export const CATEGORY_ORDER = [
  'subscription',
  'finance',
  'sns',
  'photo_storage',
  'shopping',
  'work',
  'other',
] as const;

/** 「もしものとき」の希望（death_action）の日本語ラベル */
export const DEATH_ACTION_LABELS: Record<string, string> = {
  cancel: '解約してほしい',
  inherit: '大切な方に引き継いで欲しい',
  memorialize: '追悼アカウントにしてほしい',
  self_only: '本人のみ（削除）',
  undecided: 'まだ決めていない',
};
