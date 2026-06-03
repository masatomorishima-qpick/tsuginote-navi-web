/**
 * デジタル資産機能の型定義
 *
 * Supabase の digital_* テーブル構造と一致させています。
 * （001_digital_assets_migration.sql 参照）
 */

// カテゴリ：7種類（other を含む）
export type DigitalCategory =
  | 'subscription'   // サブスク（Netflix等）
  | 'finance'        // 金融（PayPay等）
  | 'sns'            // SNS（LINE等）
  | 'photo_storage'  // 写真・クラウド（iCloud等）
  | 'shopping'       // ショッピング（Amazon等）
  | 'work'           // 仕事関係（Slack等）
  | 'other';         // その他

// 死後の対応：5種類（DB の CHECK 制約と一致）
export type DeathAction =
  | 'cancel'        // 解約してほしい
  | 'inherit'       // 大切な方に引き継いで欲しい
  | 'memorialize'   // 追悼アカウントにしてほしい
  | 'self_only'     // 本人しか処理できない
  | 'undecided';    // まだ決めていない

// digital_assets テーブル
export type DigitalAsset = {
  id: string;
  user_id: string;
  service_name: string;
  category: DigitalCategory;
  death_action: DeathAction;
  assignee_name: string | null;
  memo: string | null;
  official_url: string | null;
  monthly_cost: number | null;
  is_confirmed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// digital_service_masters テーブル（クイック選択用）
export type DigitalServiceMaster = {
  id: string;
  service_name: string;
  category: DigitalCategory;
  official_url: string | null;
  icon_key: string | null;
  display_order: number;
  is_active: boolean;
};

// digital_reminder_settings テーブル
export type DigitalReminderSetting = {
  id: string;
  user_id: string;
  reminder_enabled: boolean;
  reminder_interval: 30 | 60 | 90 | 180;
  last_login_at: string | null;
  last_reminded_at: string | null;
  created_at: string;
  updated_at: string;
};

// リマインダーの期間プリセット（日数）
export const REMINDER_INTERVAL_DAYS = [30, 60, 90, 180] as const;
export type ReminderIntervalDays = typeof REMINDER_INTERVAL_DAYS[number];

export const REMINDER_INTERVAL_LABELS: Record<ReminderIntervalDays, string> = {
  30: '30日ごと',
  60: '60日ごと',
  90: '90日ごと（推奨）',
  180: '180日ごと',
};

// 監査ログ action 種別（DB の CHECK 制約と一致）
// Phase1 PIN で device_* / pin_* / stepup_* を追加（005_digital_pin_secrets.sql 参照）
// 2026-05 改訂：旧 share-link 機能（share_link_*）は廃止
//   （013_drop_share_links.sql で CHECK 制約からも除去）
export type AuditAction =
  | 'login'
  | 'logout'
  | 'asset_create'
  | 'asset_update'
  | 'asset_delete'
  | 'pdf_export'
  | 'data_export'
  | 'reminder_settings_update'
  | 'account_delete'
  // Phase1 PIN
  | 'device_create'
  | 'device_update'
  | 'device_delete'
  | 'pin_register'
  | 'pin_reveal'
  | 'pin_reveal_copy'
  | 'pin_update'
  | 'pin_delete'
  | 'stepup_start'
  | 'stepup_success'
  | 'stepup_fail';

// digital_audit_logs テーブル（001_digital_assets_migration.sql 参照）
// SELECT 権限は本人のみ（RLS: digital_audit_logs_select_own）。
export type DigitalAuditLog = {
  id: string;
  user_id: string | null; // account_delete 後は SET NULL
  action: AuditAction;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

// 表示用ラベル（/digital/settings/audit で使用）
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  login: 'ログイン',
  logout: 'ログアウト',
  asset_create: 'デジタル資産を追加',
  asset_update: 'デジタル資産を更新',
  asset_delete: 'デジタル資産を削除',
  pdf_export: 'PDF を出力',
  data_export: 'データ書き出し',
  reminder_settings_update: 'リマインダー設定を更新',
  account_delete: 'アカウントを削除',
  device_create: 'デバイスを追加',
  device_update: 'デバイスを更新',
  device_delete: 'デバイスを削除',
  pin_register: 'PIN を登録',
  pin_reveal: 'PIN を表示',
  pin_reveal_copy: 'PIN をコピー',
  pin_update: 'PIN を更新',
  pin_delete: 'PIN を削除',
  stepup_start: '再認証コードを送信',
  stepup_success: '再認証に成功',
  stepup_fail: '再認証に失敗',
};

// UI フィルタ用：カテゴリ別のグルーピング
export type AuditActionCategory = 'all' | 'auth' | 'asset' | 'device' | 'pin' | 'account';

export const AUDIT_ACTION_CATEGORY_LABELS: Record<AuditActionCategory, string> = {
  all: 'すべて',
  auth: 'ログイン・再認証',
  asset: 'デジタル資産',
  device: 'デバイス',
  pin: 'PIN',
  account: 'アカウント・出力',
};

export const AUDIT_ACTION_CATEGORIES: Record<Exclude<AuditActionCategory, 'all'>, AuditAction[]> = {
  auth: ['login', 'logout', 'stepup_start', 'stepup_success', 'stepup_fail'],
  asset: ['asset_create', 'asset_update', 'asset_delete'],
  device: ['device_create', 'device_update', 'device_delete'],
  pin: ['pin_register', 'pin_reveal', 'pin_reveal_copy', 'pin_update', 'pin_delete'],
  account: [
    'reminder_settings_update',
    'account_delete',
    'pdf_export',
    'data_export',
  ],
};

// 表示用ラベル
export const CATEGORY_LABELS: Record<DigitalCategory, string> = {
  subscription: 'サブスク',
  finance: '金融',
  sns: 'SNS',
  photo_storage: '写真・クラウド',
  shopping: 'ショッピング',
  work: '仕事',
  other: 'その他',
};

export const DEATH_ACTION_LABELS: Record<DeathAction, string> = {
  cancel: '解約してほしい',
  inherit: '大切な方に引き継いで欲しい',
  memorialize: '追悼アカウントにしてほしい',
  self_only: '本人しか処理できない',
  undecided: 'まだ決めていない',
};

// カテゴリの並び順（ダッシュボード表示用）
export const CATEGORY_ORDER: DigitalCategory[] = [
  'subscription',
  'finance',
  'sns',
  'photo_storage',
  'shopping',
  'work',
  'other',
];

// ===== Phase 1.5 プラン管理機能の型 =============================================

// プラン種別（DB CHECK と一致）
export type DigitalPlan = 'free' | 'standard';

// サブスクリプションのステータス（DB CHECK と一致）
export type DigitalSubscriptionStatus =
  | 'trialing'    // 30 日カードなしトライアル中（plan='standard'）
  | 'active'      // 有効な有料サブスク（plan='standard'）
  | 'past_due'    // Stripe 支払い失敗
  | 'canceled'    // 解約済み（期間終了まで利用可能）
  | 'free';       // FREEプランへ降格済み（plan='free'）

// 課金サイクル
export type BillingCycle = 'monthly' | 'yearly';

// digital_subscriptions テーブル
export type DigitalSubscription = {
  id: string;
  user_id: string;
  plan: DigitalPlan;
  status: DigitalSubscriptionStatus;
  // トライアル管理（カードなしモード）
  trial_started_at: string | null;
  trial_expires_at: string | null;
  // Stripe 連携（段階 5 で書き込み開始）
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  // 課金サイクル・期間
  billing_cycle: BillingCycle | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  // 連携者数（Phase 1.5：digital_family_links の active 件数と同期、Stripe quantity と一致）
  quantity: number;
  // トライアルリマインド送信履歴（009 / 016）。NULL なら未送信。
  trial_warning_sent_at?: string | null;        // 早期（7 日前窓・1 回）
  trial_warning_final_sent_at?: string | null;  // 前日（24h 前・1 回）
  trial_ended_sent_at?: string | null;          // 満了当日
  // 監査
  created_at: string;
  updated_at: string;
};

// プラン表示用ラベル
export const PLAN_LABELS: Record<DigitalPlan, string> = {
  free: 'FREE',
  standard: 'STANDARD',
};

// ステータス表示用ラベル
export const SUBSCRIPTION_STATUS_LABELS: Record<DigitalSubscriptionStatus, string> = {
  trialing: '無料トライアル中',
  active: '有効',
  past_due: 'お支払い確認中',
  canceled: '解約予定（期間終了まで利用可）',
  free: 'FREEプラン',
};

// プラン別の機能制限
// 2026-05 改訂：旧 share-link 機能の廃止に伴い canCreateShareLinks を削除
export const PLAN_LIMITS = {
  free: {
    maxAssets: Infinity,    // 2026-05 改訂：FREE もデジタル資産は無制限（5 件制限を撤廃）
    canStorePin: false,     // スマホ・パソコン のパスワード保管
  },
  standard: {
    maxAssets: Infinity,
    canStorePin: true,
  },
} as const;

// 価格情報（税込）
// 旧モデル（月額/年額の固定価格）— 互換性維持のため残置。LP で参照されているが
// 設定画面・PlanCard・upgrade ページでは PER_RECIPIENT_PRICING を優先使用する。
export const PLAN_PRICING = {
  monthly: {
    amount: 330,
    label: '¥330 / 月',
    description: '月額プラン',
  },
  yearly: {
    amount: 3129,
    label: '¥3,129 / 年',
    description: '年額プラン（約 21% お得）',
    monthlyEquivalent: 261,
  },
} as const;

// 新モデル（共有 ID 1 名あたりの従量課金）— Phase 1.5 以降
export const PER_RECIPIENT_PRICING = {
  amount: 110,
  amountTaxExcluded: 100,
  label: '¥110 / 月',
  labelTaxExcluded: '¥100 / 月（税抜）',
  description: '連携 1 名あたり（税込）',
  trialDays: 30,
} as const;

// トライアル期間（日数）
export const TRIAL_DAYS = 30;

// ===== Phase1 PIN 機能の型 =====================================================

// デバイスの処分状態（DB CHECK と一致）
export type DeviceDisposalStatus =
  | 'in_use'
  | 'disposed'
  | 'sold'
  | 'transferred'
  | 'other';

export const DEVICE_DISPOSAL_STATUS_LABELS: Record<DeviceDisposalStatus, string> = {
  in_use: '使用中',
  disposed: '廃棄済み',
  sold: '売却済み',
  transferred: '譲渡済み',
  other: 'その他',
};

// PIN 削除理由（UI 選択肢。監査ログの metadata.reason に入れる）
export type PinDeleteReason =
  | 'device_replaced'   // 機種変更
  | 'device_sold'       // 売却
  | 'device_disposed'   // 廃棄
  | 'device_transferred' // 譲渡
  | 'other';            // その他

export const PIN_DELETE_REASON_LABELS: Record<PinDeleteReason, string> = {
  device_replaced: '機種変更',
  device_sold: '売却',
  device_disposed: '廃棄',
  device_transferred: '譲渡',
  other: 'その他',
};

// digital_devices テーブル
export type DigitalDevice = {
  id: string;
  user_id: string;
  device_name: string;
  manufacturer: string | null;
  model: string | null;
  purchase_date: string | null;        // YYYY-MM-DD
  storage_place: string | null;
  note: string | null;
  disposal_status: DeviceDisposalStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

// digital_pin_secrets テーブル（サーバー側で扱うのはこのオブジェクトのみ）
// 平文 PIN はこの型に現れない。
export type DigitalPinSecret = {
  id: string;
  device_id: string;
  user_id: string;
  encrypted_pin: string;
  iv: string;
  /** v1: PBKDF2 用 salt（必須）/ v2: KEK 側に salt を持つため null */
  salt: string | null;
  algorithm_version: 'v1' | 'v2';
  /** v2: KEK で暗号化された DEK の暗号文。v1 では null */
  encrypted_dek: string | null;
  /** v2: DEK 暗号化に使った AES-GCM IV。v1 では null */
  dek_iv: string | null;
  created_at: string;
  updated_at: string;
};

// デバイス一覧 UI 用：PIN 登録有無を一緒に返すときに使う
export type DigitalDeviceWithPinFlag = DigitalDevice & {
  has_pin: boolean;
  pin_updated_at: string | null;
};
