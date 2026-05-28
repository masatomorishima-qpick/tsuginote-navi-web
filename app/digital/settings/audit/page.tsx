/**
 * /digital/settings/audit — 自分の監査ログ閲覧ページ（本人用）
 *
 * 設計（DESIGN_Phase1_PIN.md §1, §8 参照）:
 *   - 本人分のみ表示（RLS digital_audit_logs_select_own + アプリ側 user_id 明示）
 *   - 過去 90 日分が DB に残る（cron で自動削除）
 *   - サーバーコンポーネントで直接 Supabase を読む（API ルート不要）
 *   - フィルタは searchParams（'?category=pin&page=2'）で URL 駆動
 *
 * 表示項目:
 *   - 日時 (JST)
 *   - 操作（日本語ラベル）
 *   - 対象 (resource_id 末尾 8 文字 / metadata 抜粋)
 *   - クライアント情報 (IP / User-Agent 抜粋)
 *
 * 🔒 セキュリティ:
 *   - 平文の機密（PIN, パスフレーズ）は metadata に書き込まれない契約。
 *     よってここで JSON.stringify してもよい（書き込み側で担保）。
 *   - 他人のログは RLS で来ない。.eq('user_id', user.id) を必ず付ける。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ChevronRight,
  ScrollText,
  Filter,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';
import { listOwnAuditLogs } from '@/lib/digital/auditQueries';
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ACTION_CATEGORY_LABELS,
  type AuditAction,
  type AuditActionCategory,
  type DigitalAuditLog,
} from '@/types/digital';

export const metadata: Metadata = {
  title: '操作履歴 | つぎの手ナビ',
  description: '自分のアカウントで行った操作の履歴を表示します。',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 30;

const CATEGORY_VALUES: AuditActionCategory[] = [
  'all',
  'auth',
  'pin',
  'device',
  'asset',
  'account',
];

type Props = {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
  }>;
};

export default async function AuditLogsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const category = parseCategory(sp.category);
  const page = parsePage(sp.page);

  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/digital/settings/audit');
  }

  const offset = (page - 1) * PAGE_SIZE;
  const { rows, total } = await listOwnAuditLogs(supabase, user.id, {
    limit: PAGE_SIZE,
    offset,
    category,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* パンくず */}
      <nav
        aria-label="パンくず"
        className="flex items-center gap-1 text-xs text-slate-500"
      >
        <Link href="/digital" className="hover:text-emerald-700 hover:underline">
          ダッシュボード
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link
          href="/digital/settings"
          className="hover:text-emerald-700 hover:underline"
        >
          設定
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-slate-700">操作履歴</span>
      </nav>

      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <ScrollText
            className="h-6 w-6 text-emerald-600"
            aria-hidden="true"
          />
          操作履歴（監査ログ）
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          ご自身のアカウントで行われた操作を新しい順に表示します。
          ログは{' '}
          <span className="font-medium text-slate-700">過去 90 日分</span>
          を自動保持し、それ以降は削除されます。
        </p>
      </header>

      {/* 説明 */}
      <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
        <Info
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600"
          aria-hidden="true"
        />
        <div className="space-y-0.5 leading-relaxed">
          <p className="font-medium">この履歴に表示される情報</p>
          <ul className="list-inside list-disc text-emerald-900/90">
            <li>本人のログのみ表示します（他のユーザーの履歴は見えません）。</li>
            <li>パスワードやマスターコードなどのそのままの情報は記録されません。</li>
            <li>身に覚えのない操作があれば、すみやかにパスワードを変更してください。</li>
          </ul>
        </div>
      </div>

      {/* カテゴリフィルタ */}
      <section
        aria-labelledby="audit-filter"
        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5"
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span id="audit-filter">操作の種類で絞り込み</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_VALUES.map((c) => {
            const active = c === category;
            const href =
              c === 'all'
                ? '/digital/settings/audit'
                : `/digital/settings/audit?category=${encodeURIComponent(c)}`;
            return (
              <Link
                key={c}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm'
                    : 'rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                }
              >
                {AUDIT_ACTION_CATEGORY_LABELS[c]}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ログ表示 */}
      <section aria-labelledby="audit-list">
        <div className="mb-2 flex items-baseline justify-between">
          <h2
            id="audit-list"
            className="text-sm font-semibold text-slate-700"
          >
            ログ一覧
          </h2>
          <p className="text-xs text-slate-500">
            全 <span className="font-medium text-slate-700">{total}</span> 件中
            {' '}
            {total === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE_SIZE, total)}
            {' '}
            件を表示
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            該当する操作履歴はありません。
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <AuditLogRow key={row.id} row={row} />
            ))}
          </ul>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            category={category}
          />
        )}
      </section>

      <div className="text-right">
        <Link
          href="/digital/settings"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 hover:underline"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          設定に戻る
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// 表示用コンポーネント（同ファイルに同居 — Phase1 では他ページから再利用しない）
// =============================================================================

function AuditLogRow({ row }: { row: DigitalAuditLog }) {
  const label = AUDIT_ACTION_LABELS[row.action] ?? row.action;
  const dt = formatDateTimeJa(row.created_at);
  const tone = toneFor(row.action);

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <time
          dateTime={row.created_at}
          className="text-xs font-mono text-slate-500"
        >
          {dt}
        </time>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
        >
          {label}
        </span>
      </div>

      {/* 詳細（簡潔な人間向け説明） */}
      <p className="mt-1.5 text-sm text-slate-700">
        {humanizeLog(row.action, row.metadata)}
      </p>

      {/* 技術詳細（開発者・サポート向け、デフォルト非表示） */}
      {(row.resource_id ||
        row.ip_address ||
        (row.metadata && Object.keys(row.metadata).length > 0) ||
        row.user_agent) && (
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] text-slate-400 hover:text-slate-600">
            技術詳細を表示
          </summary>
          <dl className="mt-2 grid gap-x-4 gap-y-1 text-[11px] text-slate-500 sm:grid-cols-2">
            {row.resource_id && (
              <div className="flex gap-1">
                <dt className="text-slate-400">対象 ID:</dt>
                <dd className="font-mono break-all">
                  …{row.resource_id.slice(-8)}
                </dd>
              </div>
            )}
            {row.ip_address && (
              <div className="flex gap-1">
                <dt className="text-slate-400">IP:</dt>
                <dd className="font-mono">{row.ip_address}</dd>
              </div>
            )}
          </dl>
          {row.metadata && Object.keys(row.metadata).length > 0 && (
            <div className="mt-1 break-all rounded bg-slate-50 px-2 py-1 text-[11px] font-mono text-slate-500">
              {summarizeMetadata(row.metadata)}
            </div>
          )}
          {row.user_agent && (
            <p className="mt-1 truncate text-[11px] text-slate-400" title={row.user_agent}>
              {row.user_agent}
            </p>
          )}
        </details>
      )}
    </li>
  );
}

/**
 * action と metadata から「ユーザーに伝わる一文」を生成する。
 * 例：「iphone2 のデバイス情報を更新しました」
 *     「Netflix のデジタル資産を登録しました」
 */
function humanizeLog(
  action: string,
  metadata?: Record<string, unknown> | null
): string {
  const md = (metadata ?? {}) as Record<string, unknown>;
  const deviceName = typeof md.device_name === 'string' ? md.device_name : null;
  const serviceName =
    typeof md.service_name === 'string' ? md.service_name : null;
  const recipientEmail =
    typeof md.recipient_email === 'string' ? md.recipient_email : null;
  const recipientName =
    typeof md.recipient_name === 'string' ? md.recipient_name : null;

  switch (action) {
    case 'login':
      return 'ログインしました';
    case 'logout':
      return 'ログアウトしました';
    case 'asset_create':
      return `${serviceName ?? 'デジタル資産'}を登録しました`;
    case 'asset_update':
      return `${serviceName ?? 'デジタル資産'}を更新しました`;
    case 'asset_delete':
      return `${serviceName ?? 'デジタル資産'}を削除しました`;
    case 'device_create':
      return `${deviceName ?? 'デバイス'}を追加しました`;
    case 'device_update':
      return `${deviceName ?? 'デバイス'}を更新しました`;
    case 'device_delete':
      return `${deviceName ?? 'デバイス'}を削除しました`;
    case 'pin_register':
      return `${deviceName ?? 'デバイス'}のパスワードを保管しました`;
    case 'pin_reveal':
      return `${deviceName ?? 'デバイス'}のパスワードを表示しました`;
    case 'pin_reveal_copy':
      return `${deviceName ?? 'デバイス'}のパスワードをコピーしました`;
    case 'pin_update':
      return `${deviceName ?? 'デバイス'}のパスワードを更新しました`;
    case 'pin_delete':
      return `${deviceName ?? 'デバイス'}のパスワードを削除しました`;
    case 'pdf_export':
      return 'PDF をダウンロードしました';
    case 'data_export':
      return 'データをエクスポートしました';
    case 'reminder_settings_update':
      return 'リマインダー設定を変更しました';
    case 'account_delete':
      return 'アカウントを削除しました';
    case 'family_invite_create':
      return `${recipientName ?? '大切な方'}（${recipientEmail ?? ''}）に招待を送りました`;
    case 'family_invite_resend':
      return `${recipientName ?? '大切な方'}に招待メールを再送しました`;
    case 'stepup_start':
      return '再認証を開始しました';
    case 'stepup_success':
      return '再認証に成功しました';
    case 'stepup_fail':
      return '再認証に失敗しました';
    default:
      return action;
  }
}

function Pagination({
  page,
  totalPages,
  category,
}: {
  page: number;
  totalPages: number;
  category: AuditActionCategory;
}) {
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/digital/settings/audit?${qs}` : '/digital/settings/audit';
  };

  return (
    <nav
      aria-label="ページ送り"
      className="mt-4 flex items-center justify-between text-xs text-slate-600"
    >
      <span>
        {page} / {totalPages} ページ
      </span>
      <div className="flex gap-2">
        {prev !== null ? (
          <Link
            href={buildHref(prev)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            ← 前へ
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-400">
            ← 前へ
          </span>
        )}
        {next !== null ? (
          <Link
            href={buildHref(next)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            次へ →
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-400">
            次へ →
          </span>
        )}
      </div>
    </nav>
  );
}

// =============================================================================
// helpers (純関数)
// =============================================================================

function parseCategory(raw: unknown): AuditActionCategory {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (typeof v !== 'string') return 'all';
  return (CATEGORY_VALUES as string[]).includes(v)
    ? (v as AuditActionCategory)
    : 'all';
}

function parsePage(raw: unknown): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = typeof v === 'string' ? Number.parseInt(v, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 1000); // 物理的上限。実質 totalPages でクランプされる。
}

function formatDateTimeJa(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const fmt = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return fmt.format(d);
  } catch {
    return iso;
  }
}

/**
 * metadata を 1 行に圧縮表示。長すぎる場合は途中で切り捨てる。
 * 既知のキーは日本語ラベルに変換し、残りは key=value のカンマ連結に。
 */
function summarizeMetadata(meta: Record<string, unknown>): string {
  const KNOWN: Record<string, string> = {
    purpose: '目的',
    reason: '理由',
    device_name: 'デバイス名',
    algorithm_version: '暗号バージョン',
    fields_changed: '変更項目',
    label: 'ラベル',
    expires_at: '有効期限',
    asset_count: '件数',
  };

  const parts: string[] = [];
  for (const [k, v] of Object.entries(meta)) {
    const label = KNOWN[k] ?? k;
    let valueStr: string;
    if (v === null || v === undefined) {
      valueStr = '-';
    } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      valueStr = String(v);
    } else {
      try {
        valueStr = JSON.stringify(v);
      } catch {
        valueStr = '[object]';
      }
    }
    parts.push(`${label}=${valueStr}`);
  }
  const joined = parts.join(', ');
  return joined.length > 240 ? joined.slice(0, 240) + '…' : joined;
}

/**
 * action ごとのカラートークン（pill 用）。
 * セキュリティ上重要な操作（PIN 操作、削除、step-up 失敗）を強調。
 */
function toneFor(action: AuditAction): string {
  switch (action) {
    case 'pin_register':
    case 'pin_reveal':
    case 'pin_reveal_copy':
    case 'pin_update':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    case 'pin_delete':
    case 'asset_delete':
    case 'device_delete':
    case 'account_delete':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
    case 'stepup_fail':
      return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200';
    case 'stepup_start':
    case 'stepup_success':
    case 'login':
    case 'logout':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200';
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
  }
}
