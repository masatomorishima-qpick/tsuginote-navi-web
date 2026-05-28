'use client';

/**
 * PdfDownloadPanel
 *
 * /digital/pdf ページで使われる、PDF ダウンロード UI。
 * - ダウンロード（attachment）
 * - 別タブでプレビュー（inline）
 */

import { useState } from 'react';
import { Download, Loader2, AlertTriangle } from 'lucide-react';

type Props = {
  assetCount: number;
};

export default function PdfDownloadPanel({ assetCount }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch('/api/digital/pdf', { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || body?.error || `HTTP ${res.status}`);
      }

      // ファイル名をレスポンスヘッダから取り出す
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const filename = extractFilename(disposition) ?? 'tsuginotenavi_letter.pdf';

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[PdfDownloadPanel] download failed', err);
      setError(
        'PDFの生成に失敗しました。日本語フォントが配置されていない可能性があります。' +
          'SETUP_GUIDE_Week3.md をご確認ください。'
      );
    } finally {
      setDownloading(false);
    }
  }

  const disabled = assetCount === 0;

  return (
    <div className="space-y-3">
      {disabled && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <p>
            まだ 1 件もサービスが登録されていません。ダッシュボードから最初のサービスを追加してください。
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled || downloading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="h-4 w-4" aria-hidden="true" />
        )}
        {downloading ? 'PDF を生成中…' : 'PDF をダウンロード'}
      </button>
    </div>
  );
}

function extractFilename(contentDisposition: string): string | null {
  // filename*=UTF-8''...
  const star = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/"/g, ''));
    } catch {
      // ignore
    }
  }
  const plain = /filename=([^;]+)/i.exec(contentDisposition);
  if (plain) return plain[1].trim().replace(/"/g, '');
  return null;
}
